const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'sk_5bc94f5dde84dcd521eb945c5535d4eaa08c613a68e211ae';
// Antoni: Calm, smooth, highly articulate male educational voice
const VOICE_ID = 'ErXwobaYiN019PkySvjV';

const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio', 'words');
const dataFilePath = path.join(__dirname, '..', 'src', 'app', 'services', 'data.service.ts');
const data = fs.readFileSync(dataFilePath, 'utf8');

const itemsSet = new Set();

// 1. Stories pages & sentences
const storyRegex = /en:\s*['"]([^'"]+)['"]/g;
let m;
while ((m = storyRegex.exec(data)) !== null) {
  const s = m[1].trim();
  if (s.length > 2) itemsSet.add(s);
}

// 2. Story Titles
const titleRegex = /title:\s*['"]([^'"]+)['"]/g;
while ((m = titleRegex.exec(data)) !== null) {
  const s = m[1].trim();
  if (s.length > 2 && !['Interactive Stories', 'Alphabet', 'Extra Words'].includes(s)) itemsSet.add(s);
}

// 3. Alphabet words
const wordRegex = /word:\s*['"]([^'"]+)['"]/g;
while ((m = wordRegex.exec(data)) !== null) {
  const s = m[1].trim();
  if (s.length > 1) itemsSet.add(s);
}

// 4. Letters (A to Z)
for (let i = 65; i <= 90; i++) {
  itemsSet.add(String.fromCharCode(i));
}

// 5. Letter phonics
const phonics = [
  'ah', 'buh', 'kuh', 'duh', 'eh', 'fuh', 'guh', 'huh', 'ih', 'juh',
  'll', 'mm', 'nn', 'oh', 'puh', 'quh', 'rr', 'ssss', 'tuh',
  'uh', 'vuh', 'wuh', 'ks', 'yuh', 'zzzz'
];
phonics.forEach(p => itemsSet.add(p));

const allItems = Array.from(itemsSet);
console.log(`Ready to generate ${allItems.length} items using Antoni voice (ErXwobaYiN019PkySvjV)...`);

function sanitizeKey(t) {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').substring(0, 45).replace(/^_|_$/g, '');
}

function generateElevenLabsAudio(text) {
  return new Promise((resolve) => {
    const filename = `${sanitizeKey(text)}.mp3`;
    const dest = path.join(audioDir, filename);

    const postData = JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.85,
        similarity_boost: 0.80,
        speed: 0.75
      }
    });

    const options = {
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${VOICE_ID}`,
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      if (res.statusCode !== 200) {
        let errBody = '';
        res.on('data', d => errBody += d);
        res.on('end', () => {
          console.error(`Failed (${res.statusCode}) for "${text.slice(0, 30)}":`, errBody.slice(0, 100));
          resolve({ text, status: 'error', code: res.statusCode, errBody });
        });
        return;
      }

      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => resolve({ text, status: 'success' }));
      });
      file.on('error', () => resolve({ text, status: 'file_err' }));
    });

    req.on('error', (e) => {
      console.error('Request error:', e.message);
      resolve({ text, status: 'net_err' });
    });

    req.write(postData);
    req.end();
  });
}

async function run() {
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < allItems.length; i++) {
    const text = allItems[i];
    const res = await generateElevenLabsAudio(text);
    if (res.status === 'success') {
      successCount++;
      if (successCount % 10 === 0 || i === allItems.length - 1) {
        console.log(`[${i + 1}/${allItems.length}] Generated Antoni audio: "${text.slice(0, 25)}" (Success: ${successCount})`);
      }
    } else {
      failCount++;
      if (res.code === 401 || res.code === 429) {
        console.error('Halting due to auth or quota error:', res.errBody);
        break;
      }
    }
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`Finished generation! Successful: ${successCount}, Failed: ${failCount}`);
}

run();
