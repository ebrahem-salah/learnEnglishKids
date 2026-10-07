const fs = require('fs');
const path = require('path');
const https = require('https');

const dataServicePath = path.join(__dirname, '..', 'src', 'app', 'services', 'data.service.ts');
const speechCoachPath = path.join(__dirname, '..', 'src', 'app', 'pages', 'speech-coach.component.ts');
const juniorPath = path.join(__dirname, '..', 'src', 'app', 'pages', 'junior-conversations.component.ts');

const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio', 'words');
if (!fs.existsSync(audioDir)) fs.mkdirSync(audioDir, { recursive: true });

const textsToDownload = new Set();

// 1. Phonics Sounds
const phonicsMap = {
  'a': 'ah', 'b': 'buh', 'c': 'kuh', 'd': 'duh', 'e': 'eh', 'f': 'fuh', 'g': 'guh', 'h': 'huh', 'i': 'ih', 'j': 'juh',
  'k': 'kuh', 'l': 'll', 'm': 'mm', 'n': 'nn', 'o': 'oh', 'p': 'puh', 'q': 'quh', 'r': 'rr', 's': 'ssss', 't': 'tuh',
  'u': 'uh', 'v': 'vuh', 'w': 'wuh', 'x': 'ks', 'y': 'yuh', 'z': 'zzzz'
};
Object.entries(phonicsMap).forEach(([letter, sound]) => {
  textsToDownload.add({ key: `phonics_${letter}`, text: sound });
});

// 2. Stories sentences
const dataContent = fs.readFileSync(dataServicePath, 'utf8');
const storyEnRegex = /en:\s*['"]([^'"]+)['"]/g;
let match;
while ((match = storyEnRegex.exec(dataContent)) !== null) {
  const line = match[1].trim();
  if (line.length > 0) {
    textsToDownload.add({ key: sanitizeKey(line), text: line });
  }
}

// 3. Speech Coach challenges
const speechContent = fs.readFileSync(speechCoachPath, 'utf8');
while ((match = storyEnRegex.exec(speechContent)) !== null) {
  const line = match[1].trim();
  if (line.length > 0) {
    textsToDownload.add({ key: sanitizeKey(line), text: line });
  }
}

// 4. Junior Conversations dialogue & vocab
const juniorContent = fs.readFileSync(juniorPath, 'utf8');
const dialogueTextRegex = /text:\s*['"]([^'"]+)['"]/g;
while ((match = dialogueTextRegex.exec(juniorContent)) !== null) {
  const line = match[1].trim();
  if (line.length > 0) {
    textsToDownload.add({ key: sanitizeKey(line), text: line });
  }
}

function sanitizeKey(t) {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').substring(0, 45).replace(/^_|_$/g, '');
}

function download(item) {
  return new Promise((resolve) => {
    const filename = `${item.key}.mp3`;
    const dest = path.join(audioDir, filename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 200) {
      return resolve({ key: item.key, status: 'exists' });
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(item.text)}&tl=en`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        return resolve({ key: item.key, status: 'failed_' + res.statusCode });
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve({ key: item.key, status: 'downloaded' }));
      });
      file.on('error', () => resolve({ key: item.key, status: 'file_err' }));
    });

    req.on('error', () => resolve({ key: item.key, status: 'net_err' }));
    req.setTimeout(6000, () => {
      req.destroy();
      resolve({ key: item.key, status: 'timeout' });
    });
  });
}

async function run() {
  const items = Array.from(textsToDownload);
  console.log(`Starting downloading ${items.length} audio files for stories, phrases, phonics, and speech coach...`);
  let count = 0;
  for (let i = 0; i < items.length; i++) {
    const res = await download(items[i]);
    if (res.status === 'downloaded') count++;
    if ((i + 1) % 15 === 0 || i === items.length - 1) {
      console.log(`Processed ${i + 1}/${items.length}... (${count} downloaded)`);
    }
    await new Promise(r => setTimeout(r, 60));
  }
  console.log(`Finished! Total ${count} new audio files saved locally.`);
}

run();
