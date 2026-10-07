const fs = require('fs');
const path = require('path');
const https = require('https');

// Extract all unique English words from data.service.ts
const dataFilePath = path.join(__dirname, '..', 'src', 'app', 'services', 'data.service.ts');
const content = fs.readFileSync(dataFilePath, 'utf8');

// Match all { word: '...' }
const wordRegex = /word:\s*['"]([A-Za-z0-9\s\-]+)['"]/g;
const wordsSet = new Set();
let match;
while ((match = wordRegex.exec(content)) !== null) {
  wordsSet.add(match[1].trim());
}

// Letters A to Z
for (let i = 65; i <= 90; i++) {
  wordsSet.add(String.fromCharCode(i));
}

// Numbers 1 to 30 as words
const numberWords = [
  'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen', 'Twenty',
  'Twenty One', 'Twenty Two', 'Twenty Three', 'Twenty Four', 'Twenty Five', 'Twenty Six', 'Twenty Seven', 'Twenty Eight', 'Twenty Nine', 'Thirty'
];
numberWords.forEach(n => wordsSet.add(n));

const words = Array.from(wordsSet).filter(w => w.length > 0 && w.length < 35);
console.log(`Found ${words.length} distinct words to pre-download as local MP3s!`);

const outputDir = path.join(__dirname, '..', 'public', 'assets', 'audio', 'words');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function sanitizeFilename(w) {
  return w.toLowerCase().replace(/[^a-z0-9]/g, '_') + '.mp3';
}

function downloadAudio(word) {
  return new Promise((resolve) => {
    const filename = sanitizeFilename(word);
    const dest = path.join(outputDir, filename);

    if (fs.existsSync(dest) && fs.statSync(dest).size > 200) {
      return resolve({ word, status: 'already_exists' });
    }

    const url = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(word)}&tl=en`;
    const req = https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode !== 200) {
        return resolve({ word, status: 'failed_status_' + res.statusCode });
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve({ word, status: 'downloaded' }));
      });
      file.on('error', () => resolve({ word, status: 'file_error' }));
    });

    req.on('error', () => resolve({ word, status: 'network_error' }));
    req.setTimeout(5000, () => {
      req.destroy();
      resolve({ word, status: 'timeout' });
    });
  });
}

async function processAll() {
  console.log('Starting downloading audio assets...');
  let downloadedCount = 0;
  for (let i = 0; i < words.length; i++) {
    const res = await downloadAudio(words[i]);
    if (res.status === 'downloaded') downloadedCount++;
    if ((i + 1) % 20 === 0 || i === words.length - 1) {
      console.log(`Processed ${i + 1}/${words.length} words... (${downloadedCount} newly downloaded)`);
    }
    // tiny gap to respect rate limits
    await new Promise(r => setTimeout(r, 60));
  }
  console.log(`Done! Downloaded ${downloadedCount} new local MP3 speech files in public/assets/audio/words.`);
}

processAll();
