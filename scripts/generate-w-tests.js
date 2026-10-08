const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = 'sk_5bc94f5dde84dcd521eb945c5535d4eaa08c613a68e211ae';
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL'; // Bella

function gen(filename, text, settings) {
  return new Promise((resolve) => {
    const dest = path.join(__dirname, '..', 'public', 'assets', 'audio', 'words', filename);
    const postData = JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: settings || { stability: 0.90, similarity_boost: 0.85, speed: 0.75 }
    });
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: '/v1/text-to-speech/' + VOICE_ID,
      method: 'POST',
      headers: {
        'xi-api-key': API_KEY,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(() => resolve(true)));
      } else { res.resume(); resolve(false); }
    });
    req.write(postData); req.end();
  });
}

async function run() {
  await gen('test_w_alt1.mp3', 'Wooh.');
  await gen('test_w_alt2.mp3', 'Wuh, wuh.');
  await gen('test_w_alt3.mp3', 'Wuh!', { stability: 0.95, similarity_boost: 0.90, speed: 0.70 });
  await gen('test_w_alt4.mp3', 'Wa.');
  console.log('W alternatives generated!');
}

run();
