const https = require('https');
const fs = require('fs');
const path = require('path');

const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio', 'words');

function genPhonicsSample(filename, text) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.85,
        similarity_boost: 0.85,
        speed: 0.75
      }
    });
    const req = https.request({
      hostname: 'api.elevenlabs.io',
      path: '/v1/text-to-speech/pNInz6obpgDQGcFmaJgB',
      method: 'POST',
      headers: {
        'xi-api-key': 'sk_5bc94f5dde84dcd521eb945c5535d4eaa08c613a68e211ae',
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, res => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(path.join(audioDir, filename + '.mp3'));
        res.pipe(file);
        file.on('finish', () => resolve(true));
      } else {
        res.resume();
        resolve(false);
      }
    });
    req.write(postData);
    req.end();
  });
}

async function run() {
  console.log('Generating letter, phonics sound, and word samples...');
  await genPhonicsSample('sample_letter_name_a', 'Letter A.');
  await genPhonicsSample('sample_phonics_sound_a', 'Ah... ah... ah.');
  await genPhonicsSample('sample_word_apple', 'Apple.');
  await genPhonicsSample('sample_full_phonics_a', 'Letter A. A is for Apple. Ah, ah, apple.');
  console.log('Done!');
}

run();
