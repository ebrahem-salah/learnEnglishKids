const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'sk_5bc94f5dde84dcd521eb945c5535d4eaa08c613a68e211ae';
// Voice 'Bella' (EXAVITQu4vr4xnSDxMaL) - warm, soft, natural narration perfect for kids phonics!
const VOICE_ID = 'EXAVITQu4vr4xnSDxMaL';

const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio', 'words');

// Pure natural phonics sounds designed for clear speech synthesis
const phonicsSounds = {
  'a': 'Ah.',
  'b': 'Buh.',
  'c': 'Kuh.',
  'd': 'Duh.',
  'e': 'Eh.',
  'f': 'Fuh.',
  'g': 'Guh.',
  'h': 'Huh.',
  'i': 'Ih.',
  'j': 'Juh.',
  'k': 'Kuh.',
  'l': 'Ell.',
  'm': 'Mmm.',
  'n': 'Nnn.',
  'o': 'Ah.',
  'p': 'Puh.',
  'q': 'Kwuh.',
  'r': 'Urr.',
  's': 'Sss.',
  't': 'Tuh.',
  'u': 'Uh.',
  'v': 'Vvv.',
  'w': 'Wuh.',
  'x': 'Ks.',
  'y': 'Yuh.',
  'z': 'Zzz.'
};

function genAudio(text, filename) {
  return new Promise((resolve) => {
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
  console.log('Generating ultra-HD Bella Phonics for all 26 letters...');
  const letters = Object.keys(phonicsSounds);
  
  for (let i = 0; i < letters.length; i++) {
    const letter = letters[i];
    const text = phonicsSounds[letter];
    const filename = `phonics_${letter}.mp3`;
    
    const res = await genAudio(text, filename);
    if (res.ok) {
      console.log(`[${i + 1}/26] ✅ ${filename} (Bella) -> "${text}"`);
    } else {
      console.error(`[${i + 1}/26] ❌ ${filename} -> ${res.err}`);
    }
    await new Promise(r => setTimeout(r, 150));
  }
  
  console.log('Finished generating Bella phonics!');
}

run();
