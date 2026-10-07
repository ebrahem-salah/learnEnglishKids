const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'sk_5bc94f5dde84dcd521eb945c5535d4eaa08c613a68e211ae';
const VOICE_ID = 'ErXwobaYiN019PkySvjV'; // Antoni

const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio', 'words');

function genAudio(text, filename) {
  return new Promise((resolve) => {
    const dest = path.join(audioDir, filename);
    const postData = JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.90,
        similarity_boost: 0.80,
        speed: 0.75
      }
    });

    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: `/v1/text-to-speech/${VOICE_ID}`,
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      if (res.statusCode !== 200) {
        let e = '';
        res.on('data', d => e += d);
        res.on('end', () => resolve({ ok: false, err: e.slice(0, 100) }));
        return;
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => file.close(() => resolve({ ok: true })));
      file.on('error', () => resolve({ ok: false, err: 'file_err' }));
    });

    req.on('error', e => resolve({ ok: false, err: e.message }));
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Generating pure letters A-Z using pattern "The letter X."...');
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const filename = `${letter.toLowerCase()}.mp3`;
    const text = `The letter ${letter}.`;
    
    const res = await genAudio(text, filename);
    if (res.ok) {
      console.log(`[${i - 64}/26] ✅ ${filename} -> "${text}"`);
    } else {
      console.error(`[${i - 64}/26] ❌ ${filename} -> ${res.err}`);
    }
    await new Promise(r => setTimeout(r, 150));
  }
  console.log('Finished generating all letters A-Z!');
}

run();
