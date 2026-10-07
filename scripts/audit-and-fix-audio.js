const fs = require('fs');
const path = require('path');
const https = require('https');

const API_KEY = 'sk_5bc94f5dde84dcd521eb945c5535d4eaa08c613a68e211ae';
const VOICE_ID = 'ErXwobaYiN019PkySvjV'; // Antoni

const audioDir = path.join(__dirname, '..', 'public', 'assets', 'audio', 'words');

// Phonics map - actual sound of each letter (what it sounds like in words)
const phonicsMap = {
  'a': 'æ', 'b': 'buh', 'c': 'kuh', 'd': 'duh', 'e': 'eh',
  'f': 'fuh', 'g': 'guh', 'h': 'huh', 'i': 'ih', 'j': 'juh',
  'k': 'kuh', 'l': 'lll', 'm': 'mmm', 'n': 'nnn', 'o': 'oh',
  'p': 'puh', 'q': 'kwuh', 'r': 'rrr', 's': 'sss', 't': 'tuh',
  'u': 'uh', 'v': 'vvv', 'w': 'wuh', 'x': 'ks', 'y': 'yuh', 'z': 'zzz'
};

// First word for each letter (for the educational phrase)
const letterWords = {
  'a': 'Apple', 'b': 'Ball', 'c': 'Cat', 'd': 'Dog', 'e': 'Elephant',
  'f': 'Fish', 'g': 'Goat', 'h': 'Hat', 'i': 'Insect', 'j': 'Jam',
  'k': 'King', 'l': 'Lion', 'm': 'Monkey', 'n': 'Nut', 'o': 'Orange',
  'p': 'Pen', 'q': 'Queen', 'r': 'Rabbit', 's': 'Sun', 't': 'Tree',
  'u': 'Umbrella', 'v': 'Van', 'w': 'Whale', 'x': 'Xylophone', 'y': 'Yacht', 'z': 'Zebra'
};

function sanitizeKey(t) {
  return t.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_').substring(0, 45).replace(/^_|_$/g, '');
}

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
        res.on('end', () => resolve({ ok: false, err: e.slice(0, 120) }));
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
  const MIN_SIZE = 3000; // Any MP3 under 3KB is probably broken/empty
  const broken = [];
  const missing = [];

  // 1. Scan all existing files for broken ones
  const files = fs.readdirSync(audioDir).filter(f => f.endsWith('.mp3') && !f.startsWith('sample_'));
  console.log(`Scanning ${files.length} audio files for issues...`);

  for (const file of files) {
    const fullPath = path.join(audioDir, file);
    const stat = fs.statSync(fullPath);
    if (stat.size < MIN_SIZE) {
      broken.push(file);
      console.log(`⚠ Broken/Empty: ${file} (${stat.size} bytes)`);
    }
  }

  console.log(`\nFound ${broken.length} broken files.\n`);

  // 2. Build complete required file list
  const required = new Map(); // filename -> text

  // Letters A-Z (name pronunciation): a.mp3, b.mp3 ...
  for (let i = 65; i <= 90; i++) {
    const letter = String.fromCharCode(i);
    const lc = letter.toLowerCase();
    required.set(`${lc}.mp3`, `Letter ${letter}.`);
  }

  // Phonics sounds: phonics_a.mp3, phonics_b.mp3 ...
  for (const [letter, sound] of Object.entries(phonicsMap)) {
    required.set(`phonics_${letter}.mp3`, sound);
  }

  // Full phonics educational phrase: letter_a_phonics.mp3 -> "A is for Apple. æ, æ, Apple."
  for (const [letter, word] of Object.entries(letterWords)) {
    const L = letter.toUpperCase();
    const sound = phonicsMap[letter];
    required.set(`letter_${letter}_full.mp3`, `${L} is for ${word}. ${word}.`);
  }

  // Check which required files are missing or broken
  const toGenerate = [];
  for (const [file, text] of required) {
    const fullPath = path.join(audioDir, file);
    if (!fs.existsSync(fullPath) || fs.statSync(fullPath).size < MIN_SIZE) {
      toGenerate.push({ file, text });
    }
  }

  // Also re-generate broken existing files
  for (const brokenFile of broken) {
    if (!toGenerate.find(x => x.file === brokenFile)) {
      // Try to find what text to use from the filename
      const name = brokenFile.replace('.mp3', '').replace(/_/g, ' ');
      toGenerate.push({ file: brokenFile, text: name });
    }
  }

  console.log(`\nWill generate/fix ${toGenerate.length} files:`);
  toGenerate.forEach(x => console.log(` - ${x.file}: "${x.text.slice(0, 40)}"`));

  if (toGenerate.length === 0) {
    console.log('\n✅ All audio files are healthy! No fixes needed.');
    return;
  }

  console.log('\nStarting generation...');
  let success = 0, fail = 0;

  for (let i = 0; i < toGenerate.length; i++) {
    const { file, text } = toGenerate[i];
    const result = await genAudio(text, file);
    if (result.ok) {
      success++;
      console.log(`[${i + 1}/${toGenerate.length}] ✅ ${file}`);
    } else {
      fail++;
      console.log(`[${i + 1}/${toGenerate.length}] ❌ ${file}: ${result.err}`);
    }
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\n✅ Done! Generated: ${success}, Failed: ${fail}`);
}

run();
