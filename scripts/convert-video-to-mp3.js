const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const src = path.join(__dirname, '..', 'public', 'Untitled video (19).mp4');
const dest = path.join(__dirname, '..', 'public', 'Untitled video (19).mp3');

console.log('Using ffmpeg from:', ffmpeg.path);
console.log('Source video:', src);

if (!fs.existsSync(src)) {
  console.error('Source video not found!');
  process.exit(1);
}

try {
  const cmd = `"${ffmpeg.path}" -y -i "${src}" -vn -acodec libmp3lame -q:a 2 "${dest}"`;
  cp.execSync(cmd, { stdio: 'inherit' });
  const stat = fs.statSync(dest);
  console.log('SUCCESS! MP3 created at:', dest);
  console.log('File size:', stat.size, 'bytes');
} catch (err) {
  console.error('Error extracting MP3:', err.message);
}
