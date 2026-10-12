// Shrinks big pictures in public/assets/images (in place) so the site loads fast and works offline with less data.
//   npm i -D sharp      (once)
//   npm run images                 -> optimizes every PNG/JPG that is bigger than 150 KB or wider than 512 px
//   npm run images -- --dry        -> only reports
// PNG: max 512 px (1024 px for wide backgrounds), 256-colour palette (sharp's libimagequant keeps soft edges nicely).
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.join(process.cwd(), 'public/assets/images');
const dry = process.argv.includes('--dry');
let before = 0, after = 0, changed = 0;

for (const name of fs.readdirSync(dir)) {
  const file = path.join(dir, name);
  const ext = path.extname(name).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;
  const size = fs.statSync(file).size;
  const meta = await sharp(file).metadata();
  const square = Math.abs((meta.width ?? 0) - (meta.height ?? 0)) < 8;
  const limit = ext === '.png' ? (square ? 512 : 1024) : 900;
  if (size < 150 * 1024 && Math.max(meta.width ?? 0, meta.height ?? 0) <= limit) continue;

  const img = sharp(file).resize({ width: limit, height: limit, fit: 'inside', withoutEnlargement: true });
  const out = ext === '.png'
    ? await img.png({ palette: true, quality: 90, effort: 10, colours: 256 }).toBuffer()
    : await img.jpeg({ quality: 82, mozjpeg: true }).toBuffer();
  before += size;
  if (out.length >= size) { after += size; continue; }       // never make a file bigger
  after += out.length; changed++;
  if (!dry) fs.writeFileSync(file, out);
  console.log(`${dry ? '[dry] ' : ''}${name}: ${(size / 1024).toFixed(0)} KB -> ${(out.length / 1024).toFixed(0)} KB`);
}
console.log(`\n${changed} files, ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);
