import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const dir = path.join(process.cwd(), 'public/assets/images');
const dry = process.argv.includes('--dry');

let totalBefore = 0;
let totalAfter = 0;
let convertedCount = 0;
let errorCount = 0;

console.log('🚀 Starting batch image conversion to WebP...\n');

const files = fs.readdirSync(dir);

for (const name of files) {
  const ext = path.extname(name).toLowerCase();
  if (!['.png', '.jpg', '.jpeg'].includes(ext)) continue;

  const inputPath = path.join(dir, name);
  const baseName = path.basename(name, ext);
  const outputPath = path.join(dir, `${baseName}.webp`);

  try {
    const stat = fs.statSync(inputPath);
    const beforeSize = stat.size;
    totalBefore += beforeSize;

    const meta = await sharp(inputPath).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;
    const isWideLandscape = width > height * 1.8 && width > 512;
    const maxDimension = isWideLandscape ? 1024 : 512;

    const pipeline = sharp(inputPath);
    if (width > maxDimension || height > maxDimension) {
      pipeline.resize({
        width: maxDimension,
        height: maxDimension,
        fit: 'inside',
        withoutEnlargement: true
      });
    }

    const buffer = await pipeline
      .webp({
        quality: 82,
        alphaQuality: 90,
        effort: 6
      })
      .toBuffer();

    const afterSize = buffer.length;
    totalAfter += afterSize;
    convertedCount++;

    if (!dry) {
      fs.writeFileSync(outputPath, buffer);
      // Remove original file only if outputPath is different or successful
      if (inputPath !== outputPath) {
        fs.unlinkSync(inputPath);
      }
    }

    const savingsPct = ((1 - afterSize / beforeSize) * 100).toFixed(1);
    console.log(`✓ ${name} -> ${baseName}.webp: ${(beforeSize / 1024).toFixed(1)} KB -> ${(afterSize / 1024).toFixed(1)} KB (${savingsPct}% saved)`);
  } catch (err) {
    errorCount++;
    console.error(`✗ Error converting ${name}:`, err.message);
  }
}

// Also convert public/logo.jpg if it exists
const logoPath = path.join(process.cwd(), 'public/logo.jpg');
if (fs.existsSync(logoPath)) {
  const logoWebpPath = path.join(process.cwd(), 'public/logo.webp');
  try {
    const stat = fs.statSync(logoPath);
    totalBefore += stat.size;
    const buf = await sharp(logoPath)
      .resize({ width: 512, height: 512, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85, effort: 6 })
      .toBuffer();
    totalAfter += buf.length;
    if (!dry) {
      fs.writeFileSync(logoWebpPath, buf);
      fs.unlinkSync(logoPath);
    }
    console.log(`✓ logo.jpg -> logo.webp: ${(stat.size / 1024).toFixed(1)} KB -> ${(buf.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error('✗ Error converting logo.jpg:', err.message);
  }
}

console.log('\n=======================================');
console.log(`🎉 Finished! Converted ${convertedCount} images.`);
console.log(`📦 Before: ${(totalBefore / (1024 * 1024)).toFixed(2)} MB`);
console.log(`📦 After:  ${(totalAfter / (1024 * 1024)).toFixed(2)} MB`);
console.log(`⚡ Saved:  ${((totalBefore - totalAfter) / (1024 * 1024)).toFixed(2)} MB (${((1 - totalAfter / totalBefore) * 100).toFixed(1)}% reduction)`);
if (errorCount > 0) {
  console.log(`⚠️ Errors: ${errorCount}`);
}
console.log('=======================================\n');
