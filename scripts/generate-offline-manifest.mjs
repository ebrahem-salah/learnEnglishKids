// Writes public/offline-manifest.json: the list of audio + image files that the "download for offline" button fetches.
// Runs automatically before `npm run build`. (Videos are left out on purpose: they are big.)
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const pub = path.join(root, 'public');
const exts = /\.(mp3|png|jpg|jpeg|webp|svg)$/i;

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : exts.test(e.name) ? [path.join(dir, e.name)] : []);
}

const files = walk(path.join(pub, 'assets')).map((f) => ({
  u: path.relative(pub, f).split(path.sep).map(encodeURIComponent).join('/'),   // URL-safe (handles # and spaces)
  s: fs.statSync(f).size
}));
const bytes = files.reduce((a, f) => a + f.s, 0);
const version = String(files.length) + '-' + String(bytes);   // changes whenever files are added/changed
fs.writeFileSync(path.join(pub, 'offline-manifest.json'), JSON.stringify({ version, bytes, files }));
console.log(`offline-manifest.json: ${files.length} files, ${(bytes / 1e6).toFixed(1)} MB`);
