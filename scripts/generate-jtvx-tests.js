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
  console.log('Generating alternative phonics for J, T, V, X...');

  // J: Soft and clear "Juh" as in Jam / Jelly
  await gen('test_j_1.mp3', 'Juh.');
  await gen('test_j_2.mp3', 'J, as in jam.');
  await gen('test_j_3.mp3', 'Juh, juh.');

  // T: Crisp, soft and gentle "Tuh" without robotic click
  await gen('test_t_1.mp3', 'Tuh.');
  await gen('test_t_2.mp3', 'Tt.');
  await gen('test_t_3.mp3', 'T, as in tree.');

  // V: Clean vibration "Vvv"
  await gen('test_v_1.mp3', 'Vvv.');
  await gen('test_v_2.mp3', 'Vuh.');
  await gen('test_v_3.mp3', 'V, as in van.');

  // X: Pure "ks" sound as in Box / Fox
  await gen('test_x_1.mp3', 'Ks.');
  await gen('test_x_2.mp3', 'Eks.');
  await gen('test_x_3.mp3', 'X, as in box.');

  console.log('Finished generating J, T, V, X alternatives!');
}

run();
