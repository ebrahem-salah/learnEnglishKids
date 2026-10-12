// Helper for audio + image files.
//
//   npm run audio -- --csv     -> writes content-needed.csv: every mp3 / png still missing, with the EXACT file name
//                                 (give it to whoever records the audio / draws the pictures)
//   npm run audio -- --dry     -> prints what is missing (English audio)
//   npm run audio              -> generates the missing ENGLISH mp3 with Edge TTS (needs internet)
//   npm run audio -- --ar      -> generates the missing ARABIC mp3 with Edge TTS (needs internet)
// Optional voices:  VOICE=en-US-JennyNeural   AR_VOICE=ar-EG-ShakirNeural
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const enDir = path.join(root, 'public/assets/audio/words');
const arDir = path.join(root, 'public/assets/audio/ar');
const imgDir = path.join(root, 'public/assets/images');
const args = new Set(process.argv.slice(2));

// MUST match AudioService.sequence() / speakArabic() / CategoriesComponent.imgFor()
const keyOf = (t) => t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 45);
const fullKey = (t) => t.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
const unq = (s) => s.replace(/\\'/g, "'");

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : e.name.endsWith('.ts') ? [path.join(dir, e.name)] : []);
}

const enTexts = new Set();
const arPairs = new Map();   // english key -> { en, ar }
const images = new Map();    // file -> english word
for (const file of walk(path.join(root, 'src/app'))) {
  const src = fs.readFileSync(file, 'utf8');
  for (const m of src.matchAll(/(?<![A-Za-z_])(?:en|word):\s*'((?:[^'\\]|\\.)*)'/g)) enTexts.add(unq(m[1]));
  for (const m of src.matchAll(/audioText:\s*`([^`]*)`/g)) enTexts.add(m[1]);
  for (const m of src.matchAll(/(?<![A-Za-z_])en:\s*'((?:[^'\\]|\\.)*)',\s*ar:\s*'((?:[^'\\]|\\.)*)'/g))
    arPairs.set(keyOf(unq(m[1])), { en: unq(m[1]), ar: unq(m[2]) });
  for (const m of src.matchAll(/(?<![A-Za-z_])word:\s*'((?:[^'\\]|\\.)*)',\s*ar_word:\s*'((?:[^'\\]|\\.)*)'/g))
    arPairs.set(keyOf(unq(m[1])), { en: unq(m[1]), ar: unq(m[2]) });
  // Arabic course letters: <id>.mp3 = letter name, <id>_word.mp3 = example word
  for (const m of src.matchAll(/id:\s*'([a-z]+)',\s*glyph:\s*'([^']+)',\s*letterName:\s*'([^']+)',\s*exampleWord:\s*'([^']+)'/g)) {
    arPairs.set(m[1], { en: m[1] + ' (letter name)', ar: m[3] });
    arPairs.set(m[1] + '_word', { en: m[1] + ' (example word)', ar: m[4] });
    // short vowels: <id>_a (fatha) <id>_u (damma) <id>_i (kasra)
    arPairs.set(m[1] + '_a', { en: m[1] + ' + fatha', ar: m[2] + '\u064E' });
    arPairs.set(m[1] + '_u', { en: m[1] + ' + damma', ar: m[2] + '\u064F' });
    arPairs.set(m[1] + '_i', { en: m[1] + ' + kasra', ar: m[2] + '\u0650' });
  }
  // category items -> picture file (imagePath, or <english-word>.png). Only data.service.ts holds category items.
  const catSrc = file.endsWith('data.service.ts')
    ? src.slice(src.indexOf('readonly extraCategories'), src.indexOf('readonly alphabetData')) : '';
  for (const m of catSrc.matchAll(/\{\s*en:\s*'((?:[^'\\]|\\.)*)',\s*ar:\s*'(?:[^'\\]|\\.)*',\s*img:\s*'[^']*'([^}]*)\}/g)) {
    const ip = /imagePath:\s*'([^']+)'/.exec(m[2]);
    if (ip || keyOf(unq(m[1]))) images.set(ip ? ip[1] : keyOf(unq(m[1])) + '.png', unq(m[1]));
  }
}

const byKey = new Map();
for (const t of enTexts) {
  if (!/[A-Za-z]/.test(t) || t.length > 400) continue;
  const k = keyOf(t);
  if (!k) continue;
  if (byKey.has(k)) {
    if (fullKey(byKey.get(k)) !== fullKey(t)) console.warn(`⚠️  two different texts share the file "${k}.mp3": "${byKey.get(k).slice(0, 50)}…" / "${t.slice(0, 50)}…"`);
  } else byKey.set(k, t);
}

const has = (dir, file) => fs.existsSync(path.join(dir, file));
const missingEn = [...byKey].filter(([k]) => !has(enDir, k + '.mp3'));
const missingAr = [...arPairs].filter(([k]) => k && !has(arDir, k + '.mp3'));
const missingImg = [...images].filter(([f]) => !has(imgDir, f));
console.log(`English audio: ${byKey.size} texts, ${missingEn.length} mp3 missing`);
console.log(`Arabic audio : ${arPairs.size} texts, ${missingAr.length} mp3 missing`);
console.log(`Pictures     : ${images.size} items, ${missingImg.length} png missing (the emoji is shown meanwhile)`);

if (args.has('--csv')) {
  const q = (s) => '"' + String(s).replace(/"/g, '""') + '"';
  const rows = [['type', 'put the file in', 'file name', 'text to say / item']];
  missingEn.forEach(([k, t]) => rows.push(['English audio', 'public/assets/audio/words', k + '.mp3', t]));
  missingAr.forEach(([k, p]) => rows.push(['Arabic audio', 'public/assets/audio/ar', k + '.mp3', p.ar + '   (' + p.en + ')']));
  missingImg.forEach(([f, w]) => rows.push(['Picture', 'public/assets/images', f, w]));
  fs.writeFileSync('content-needed.csv', '\ufeff' + rows.map((r) => r.map(q).join(',')).join('\n'));
  console.log('Wrote content-needed.csv');
  process.exit(0);
}
if (args.has('--dry')) { missingEn.forEach(([k, t]) => console.log(`  ${k}.mp3  <-  ${t.slice(0, 60)}`)); process.exit(0); }

const { EdgeTTS } = await import('node-edge-tts');
const wantAr = args.has('--ar');
const list = wantAr ? missingAr.map(([k, p]) => [k, p.ar]) : missingEn;
const outDir = wantAr ? arDir : enDir;
const tts = new EdgeTTS(wantAr
  ? { voice: process.env.AR_VOICE || 'ar-EG-SalmaNeural', lang: 'ar-EG', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', timeout: 20000 }
  : { voice: process.env.VOICE || 'en-US-AnaNeural', lang: 'en-US', outputFormat: 'audio-24khz-48kbitrate-mono-mp3', timeout: 20000 });
fs.mkdirSync(outDir, { recursive: true });
let done = 0;
for (const [k, t] of list) {
  try {
    await tts.ttsPromise(t, path.join(outDir, k + '.mp3'));
    console.log(`✓ ${++done}/${list.length}  ${k}.mp3`);
  } catch (e) {
    console.error(`✗ ${k}: ${e.message || e}`);
  }
  await new Promise((r) => setTimeout(r, 150));
}
console.log('Done.');
