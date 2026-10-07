const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'sk_5bc94f5dde84dcd521eb945c5535d4eaa08c613a68e211ae';
// Voice 'Bella' (EXAVITQu4vr4xnSDxMaL) - warm, soft, natural narration perfect for kids & stories!
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio', 'words');
const dataFilePath = path.join(__dirname, '..', 'src', 'app', 'services', 'data.service.ts');

const content = fs.readFileSync(dataFilePath, 'utf8');

// Match all story sentences
const storySentences = [];
const storyRegex = /en:\s*['"]([^'"]+)['"]/g;
let match;
while ((match = storyRegex.exec(content)) !== null) {
  const line = match[1].trim();
  if (line.length > 5) {
    storySentences.push(line);
  }
}

console.log(`Found ${storySentences.length} story & educational lines to generate with ElevenLabs!`);

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
        stability: 0.5,
        similarity_boost: 0.8
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
          console.error(`Failed (${res.statusCode}) for "${text.slice(0, 30)}...":`, errBody.slice(0, 100));
          resolve({ text, status: 'error' });
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
  console.log('Generating ElevenLabs Ultra-HD narration for all stories...');
  let successCount = 0;
  for (let i = 0; i < storySentences.length; i++) {
    const line = storySentences[i];
    const res = await generateElevenLabsAudio(line);
    if (res.status === 'success') {
      successCount++;
      console.log(`[${i + 1}/${storySentences.length}] ElevenLabs generated: "${line.slice(0, 35)}..."`);
    }
    // slight delay
    await new Promise(r => setTimeout(r, 200));
  }
  console.log(`Finished! Successfully generated ${successCount} ElevenLabs story narrations!`);
}

run();
