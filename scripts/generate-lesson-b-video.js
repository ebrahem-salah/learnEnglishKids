const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');

const outFramesDir = path.join(__dirname, '..', 'temp_frames_b');
if (!fs.existsSync(outFramesDir)) {
  fs.mkdirSync(outFramesDir, { recursive: true });
}

function getBase64Image(filePath) {
  if (!fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).replace('.', '');
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext};base64,${data}`;
}

const logoBase64 = getBase64Image(path.join(__dirname, '..', 'public', 'logo.jpg')) || getBase64Image(path.join(__dirname, '..', 'src', 'assets', 'logo.jpg'));
const bearBase64 = getBase64Image(path.join(__dirname, '..', 'public', 'assets', 'images', 'bear.png'));
const ballBase64 = getBase64Image(path.join(__dirname, '..', 'public', 'assets', 'images', 'ball.png'));
const beeBase64 = getBase64Image(path.join(__dirname, '..', 'public', 'assets', 'images', 'bee.png'));
const bananaBase64 = getBase64Image(path.join(__dirname, '..', 'public', 'assets', 'images', 'banana.png'));
const birdBase64 = getBase64Image(path.join(__dirname, '..', 'public', 'assets', 'images', 'bird.png'));
const boatBase64 = getBase64Image(path.join(__dirname, '..', 'public', 'assets', 'images', 'boat.png'));

const slides = [
  {
    id: 1,
    duration: 14.5,
    title: 'The Letter B',
    subtitle: 'حرف B وصوته /b/',
    arTitle: 'مرحباً بكم! سنتعلم اليوم حرف B',
    img: '',
    bigLetter: 'Bb',
    soundText: 'Sound: /b/',
    bgGradient: 'from-amber-400 via-orange-400 to-pink-500'
  },
  {
    id: 2,
    duration: 6.0,
    title: 'Bear',
    subtitle: 'دُب',
    pronunciationAr: 'بِـيرْ',
    phoneticEn: 'Bear',
    arTitle: 'B is for Bear',
    img: bearBase64,
    bigLetter: 'B',
    soundText: 'Bear',
    bgGradient: 'from-amber-700 via-orange-800 to-yellow-700'
  },
  {
    id: 3,
    duration: 6.0,
    title: 'Ball',
    subtitle: 'كُرة',
    pronunciationAr: 'بُـولْ',
    phoneticEn: 'Ball',
    arTitle: 'B is for Ball',
    img: ballBase64,
    bigLetter: 'B',
    soundText: 'Ball',
    bgGradient: 'from-rose-400 via-red-500 to-pink-600'
  },
  {
    id: 4,
    duration: 6.0,
    title: 'Bee',
    subtitle: 'نحلة',
    pronunciationAr: 'بِـي',
    phoneticEn: 'Bee',
    arTitle: 'B is for Bee',
    img: beeBase64,
    bigLetter: 'B',
    soundText: 'Bee',
    bgGradient: 'from-yellow-400 via-amber-500 to-orange-400'
  },
  {
    id: 5,
    duration: 6.0,
    title: 'Banana',
    subtitle: 'موزة',
    pronunciationAr: 'بَـنَـانَـا',
    phoneticEn: 'Ba • na • na',
    arTitle: 'B is for Banana',
    img: bananaBase64,
    bigLetter: 'B',
    soundText: 'Banana',
    bgGradient: 'from-yellow-300 via-yellow-400 to-amber-300'
  },
  {
    id: 6,
    duration: 6.0,
    title: 'Bird',
    subtitle: 'طائر',
    pronunciationAr: 'بِـيرْدْ',
    phoneticEn: 'Bird',
    arTitle: 'B is for Bird',
    img: birdBase64,
    bigLetter: 'B',
    soundText: 'Bird',
    bgGradient: 'from-sky-400 via-blue-500 to-indigo-600'
  },
  {
    id: 7,
    duration: 6.5,
    title: 'Boat',
    subtitle: 'قارب',
    pronunciationAr: 'بُـوتْ',
    phoneticEn: 'Boat',
    arTitle: 'B is for Boat',
    img: boatBase64,
    bigLetter: 'B',
    soundText: 'Boat',
    bgGradient: 'from-teal-400 via-emerald-500 to-blue-600'
  }
];

function generateSlideHtml(slide) {
  return `
<!DOCTYPE html>
<html dir="rtl">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@700;900&family=Bubblegum+Sans&family=Fredoka:wght@600;700&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      width: 1920px;
      height: 1080px;
      overflow: hidden;
      font-family: 'Tajawal', sans-serif;
    }
    .font-kids { font-family: 'Bubblegum Sans', 'Fredoka', cursive; }
  </style>
</head>
<body class="bg-gradient-to-br ${slide.bgGradient} flex flex-col justify-between p-12 text-white relative">
  <div class="absolute -top-32 -left-32 w-96 h-96 bg-white/15 rounded-full blur-3xl pointer-events-none"></div>
  <div class="absolute -bottom-32 -right-32 w-96 h-96 bg-black/15 rounded-full blur-3xl pointer-events-none"></div>

  <header class="flex items-center justify-between z-10">
    <div class="flex items-center gap-5 bg-white/20 backdrop-blur-md px-6 py-3 rounded-3xl border-2 border-white/30 shadow-lg">
      <img src="${logoBase64}" class="w-16 h-16 rounded-2xl object-cover shadow border border-white" alt="Logo" onerror="this.style.display='none'">
      <div>
        <div class="text-2xl font-black tracking-wide text-white drop-shadow">تعلم مع يونس</div>
        <div class="text-xs font-bold text-white/80 font-kids tracking-wider">Learn With Younis • Official Lesson</div>
      </div>
    </div>
    <div class="bg-white/20 backdrop-blur-md px-6 py-3 rounded-3xl border-2 border-white/30 text-center shadow-lg">
      <span class="text-xl font-black text-yellow-300">🌟 Lesson 2 • Letter B</span>
    </div>
  </header>

  <main class="flex items-center justify-center gap-16 flex-1 z-10">
    ${slide.img ? `
      <div class="w-[500px] h-[500px] bg-white rounded-[50px] p-8 shadow-2xl flex items-center justify-center border-8 border-white/80 transform hover:scale-105 transition-all">
        <img src="${slide.img}" class="w-[400px] h-[400px] object-contain drop-shadow-2xl" alt="${slide.title}">
      </div>
      <div class="flex flex-col text-right space-y-4 max-w-xl">
        <div class="inline-block bg-white/25 backdrop-blur-md px-8 py-3 rounded-full text-3xl font-black text-yellow-300 font-kids border border-white/30 w-fit">
          Letter ${slide.bigLetter}
        </div>
        <h1 class="text-8xl font-black tracking-wider drop-shadow-lg font-kids text-white leading-tight">
          ${slide.title}
        </h1>
        <div class="bg-white/25 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-white/40 flex items-center justify-between gap-6 shadow-lg">
          <div class="flex items-center gap-2">
            <span class="text-2xl">🗣️</span>
            <span class="text-xl font-bold text-white/90">النطق بالعربي:</span>
            <span class="text-3xl font-black text-yellow-300 font-kids tracking-wider">${slide.pronunciationAr}</span>
          </div>
          <div class="w-px h-8 bg-white/30"></div>
          <div class="flex items-center gap-2 font-kids">
            <span class="text-xl font-bold text-white/90">Phonics:</span>
            <span class="text-2xl font-black text-cyan-200 tracking-widest">${slide.phoneticEn}</span>
          </div>
        </div>
        <div class="text-4xl font-black text-yellow-100 drop-shadow flex items-center gap-4">
          <span>المعنى:</span>
          <span class="text-white underline underline-offset-8">${slide.subtitle}</span>
        </div>
        <div class="bg-black/25 backdrop-blur-sm px-6 py-3.5 rounded-2xl text-2xl font-bold border border-white/20 text-white/90">
          📢 استمع وكرر: <span class="font-kids text-yellow-300 font-black text-3xl">B, B, ${slide.title}</span>
        </div>
      </div>
    ` : `
      <div class="text-center flex flex-col items-center justify-center space-y-8">
        <div class="inline-block bg-white/25 backdrop-blur-md px-10 py-4 rounded-full text-4xl font-black text-yellow-300 font-kids border border-white/30 shadow-lg">
          ${slide.arTitle}
        </div>
        <div class="text-[200px] font-black tracking-widest drop-shadow-2xl font-kids text-white leading-none">
          B <span class="text-yellow-300">b</span>
        </div>
        <div class="bg-white/20 backdrop-blur-md px-12 py-5 rounded-3xl border-2 border-white/40 shadow-xl text-center">
          <div class="text-4xl font-black text-yellow-200 mb-2">صوت الحرف في الكلمات:</div>
          <div class="text-6xl font-black font-kids text-white">صوت الحرف <span class="text-yellow-300">ب</span></div>
        </div>
      </div>
    `}
  </main>

  <footer class="flex items-center justify-between text-lg font-bold text-white/90 border-t-2 border-white/20 pt-4 z-10">
    <div class="flex items-center gap-3">
      <span class="text-2xl">🎓</span>
      <span>كورس التأسيس الشامل للأطفال والكبار • مسار الدروس التفاعلية</span>
    </div>
    <div class="font-kids tracking-wider text-xl text-yellow-300">
      learnwithyounis.vercel.app
    </div>
  </footer>
</body>
</html>
  `;
}

async function renderSlides() {
  console.log('Launching browser to render 1080p Full HD video slides for Letter B...');
  let executablePath = '';
  const possiblePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
  ];
  for (const p of possiblePaths) {
    if (fs.existsSync(p)) { executablePath = p; break; }
  }

  const browser = await puppeteer.launch({
    executablePath: executablePath || undefined,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const html = generateSlideHtml(slide);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));
    const slidePath = path.join(outFramesDir, `slide_${i + 1}.png`);
    await page.screenshot({ path: slidePath });
    console.log(`Rendered slide ${i + 1}/${slides.length}: ${slide.title}`);
  }

  await browser.close();
  console.log('All slides rendered to PNG!');

  let concatText = '';
  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const imgPath = path.join(outFramesDir, `slide_${i + 1}.png`).replace(/\\/g, '/');
    concatText += `file '${imgPath}'\n`;
    concatText += `duration ${slide.duration}\n`;
  }
  const lastImg = path.join(outFramesDir, `slide_${slides.length}.png`).replace(/\\/g, '/');
  concatText += `file '${lastImg}'\n`;

  const concatPath = path.join(outFramesDir, 'slides.txt');
  fs.writeFileSync(concatPath, concatText);
  console.log('Created concat script.');

  const audioPath = path.join(__dirname, '..', 'public', 'assets', 'audio', 'lesson_b_audio.mp3').replace(/\\/g, '/');
  const videoOut = path.join(__dirname, '..', 'public', 'assets', 'video', 'lesson_b.mp4').replace(/\\/g, '/');
  
  const videoDir = path.dirname(videoOut);
  if (!fs.existsSync(videoDir)) fs.mkdirSync(videoDir, { recursive: true });

  console.log('Encoding final video with FFmpeg...');
  const ffmpegCmd = `"${ffmpeg.path}" -y -f concat -safe 0 -i "${concatPath}" -i "${audioPath}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${videoOut}"`;

  cp.execSync(ffmpegCmd, { stdio: 'inherit' });
  console.log('SUCCESS! Video generated at:', videoOut);
}

renderSlides().catch(err => console.error('Error generating video:', err));
