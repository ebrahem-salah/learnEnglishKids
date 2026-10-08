const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const cp = require('child_process');
const path = require('path');

const srcMp3 = path.join(__dirname, '..', 'public', 'Untitled video (19).mp3');

// Run ffmpeg silencedetect to find pauses between letters
const cmd = `"${ffmpeg.path}" -i "${srcMp3}" -af silencedetect=noise=-30dB:d=0.2 -f null -`;
console.log('Detecting silences and segments...');

cp.exec(cmd, (err, stdout, stderr) => {
  const output = stderr || stdout;
  const lines = output.split('\n');
  const silences = [];
  
  for (const line of lines) {
    if (line.includes('silence_start') || line.includes('silence_end')) {
      silences.push(line.trim());
    }
  }
  
  console.log(`Found ${silences.length} silence events.`);
  silences.slice(0, 30).forEach(s => console.log(s));
});
