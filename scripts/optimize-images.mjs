// Optimizes images in public/assets/images and converts any new PNG/JPG to WebP format.
// Run with: npm run images
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.join(process.cwd(), 'public/assets/images');
const dry = process.argv.includes('--dry');
let before = 0, after = 0, changed = 0;

for (const name of fs.readdirSync(dir)) {
  const file = path.join(dir, name);
  const ext = path.extname(name).toLowerCase();
  
  if (['.png', '.jpg', '.jpeg'].includes(ext)) {
    // Convert to webp
    const base = path.basename(name, ext);
    const target = path.join(dir, `${base}.webp`);
    const size = fs.statSync(file).size;
    const meta = await sharp(file).metadata();
    const limit = (meta.width ?? 0) > (meta.height ?? 0) * 1.8 ? 1024 : 512;
    
    const out = await sharp(file)
      .resize({ width: limit, height: limit, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, alphaQuality: 90, effort: 6 })
      .toBuffer();

    before += size;
    after += out.length;
    changed++;
    if (!dry) {
      fs.writeFileSync(target, out);
      fs.unlinkSync(file);
    }
    console.log(`${dry ? '[dry] ' : ''}Converted ${name} -> ${base}.webp: ${(size / 1024).toFixed(0)} KB -> ${(out.length / 1024).toFixed(0)} KB`);
  } else if (ext === '.webp') {
    const size = fs.statSync(file).size;
    if (size > 150 * 1024) {
      const meta = await sharp(file).metadata();
      const limit = (meta.width ?? 0) > (meta.height ?? 0) * 1.8 ? 1024 : 512;
      const out = await sharp(file)
        .resize({ width: limit, height: limit, fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 80, effort: 6 })
        .toBuffer();
      if (out.length < size) {
        before += size;
        after += out.length;
        changed++;
        if (!dry) fs.writeFileSync(file, out);
        console.log(`${dry ? '[dry] ' : ''}Optimized ${name}: ${(size / 1024).toFixed(0)} KB -> ${(out.length / 1024).toFixed(0)} KB`);
      }
    }
  }
}
console.log(`\n${changed} files updated. Total: ${(before / 1e6).toFixed(1)} MB -> ${(after / 1e6).toFixed(1)} MB`);
