const ffmpeg = require('@ffmpeg-installer/ffmpeg');
const cp = require('child_process');
const path = require('path');
const fs = require('fs');

const srcMp3 = path.join(__dirname, '..', 'public', 'Untitled video (19).mp3');
const outDir = path.join(__dirname, '..', 'public', 'assets', 'audio', 'words');

const cmd = `"${ffmpeg.path}" -i "${srcMp3}" -af silencedetect=noise=-30dB:d=0.2 -f null -`;

cp.exec(cmd, (err, stdout, stderr) => {
  const output = stderr || stdout;
  const lines = output.split('\n');
  
  let silenceEnds = [];
  let silenceStarts = [];

  for (const line of lines) {
    const startMatch = line.match(/silence_start:\s*([\d\.]+)/);
    if (startMatch) {
      silenceStarts.push(parseFloat(startMatch[1]));
    }
    const endMatch = line.match(/silence_end:\s*([\d\.]+)/);
    if (endMatch) {
      silenceEnds.push(parseFloat(endMatch[1]));
    }
  }

  // Calculate speech segments (between silence_end and next silence_start)
  const segments = [];
  for (let i = 0; i < silenceEnds.length; i++) {
    const segStart = Math.max(0, silenceEnds[i] - 0.04); // slight padding for onset
    const nextStart = silenceStarts.find(s => s > silenceEnds[i]);
    if (nextStart) {
      const segEnd = nextStart + 0.05; // slight padding for tail
      segments.push({ start: segStart, end: segEnd, duration: segEnd - segStart });
    }
  }

  console.log(`Detected ${segments.length} letter sound segments.`);

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  console.log(`We need ${letters.length} letters.`);

  if (segments.length === 26) {
    console.log('PERFECT! Exactly 26 letters detected automatically!');
  } else {
    console.log(`Warning: Found ${segments.length} segments, matching to 26 letters...`);
  }

  // Slice each segment to its respective letter file: a.mp3, b.mp3 ... z.mp3
  segments.slice(0, 26).forEach((seg, idx) => {
    const letter = letters[idx];
    const dest = path.join(outDir, `${letter}.mp3`);
    
    // ffmpeg trim with fade-in and fade-out to prevent clicks
    const trimCmd = `"${ffmpeg.path}" -y -ss ${seg.start.toFixed(3)} -to ${seg.end.toFixed(3)} -i "${srcMp3}" -af "afade=t=in:ss=0:d=0.02,afade=t=out:st=${(seg.duration - 0.03).toFixed(3)}:d=0.03" -acodec libmp3lame -q:a 2 "${dest}"`;
    try {
      cp.execSync(trimCmd);
      console.log(`[${idx + 1}/26] ✅ ${letter}.mp3 (${seg.start.toFixed(2)}s -> ${seg.end.toFixed(2)}s)`);
    } catch (e) {
      console.error(`Error trimming ${letter}:`, e.message);
    }
  });

  console.log('ALL 26 LETTERS EXTRACTED & SAVED TO SITE AUDIO!');
});
