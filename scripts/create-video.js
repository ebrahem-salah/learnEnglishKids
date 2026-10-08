const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const cp = require('child_process');
const readline = require('readline');
const ffmpeg = require('@ffmpeg-installer/ffmpeg');

// 1. استيراد بيانات الدروس والكلمات
const projectRoot = path.join(__dirname, '..');
const outFramesDir = path.join(projectRoot, 'temp_frames');
if (!fs.existsSync(outFramesDir)) {
  fs.mkdirSync(outFramesDir, { recursive: true });
}

// قراءة بيانات الكلمات لكل الحروف من data.service.ts تلقائياً
function extractAlphabetData() {
  const dataServicePath = path.join(projectRoot, 'src', 'app', 'services', 'data.service.ts');
  const code = fs.readFileSync(dataServicePath, 'utf8');
  
  // قاموس افتراضي جاهز للحروف
  const alphabetMap = {};
  
  const regex = /{\s*letter:\s*'([A-Z])',\s*ar_letter:\s*'([^']+)',\s*words:\s*\[([\s\S]*?)\]\s*}/g;
  let match;
  while ((match = regex.exec(code)) !== null) {
    const letter = match[1];
    const ar_letter = match[2];
    const wordsRaw = match[3];
    
    const wordList = [];
    const wordRegex = /{\s*word:\s*'([^']+)',\s*ar_word:\s*'([^']+)'(?:[^}]*?imagePath:\s*'([^']+)')?/g;
    let wMatch;
    while ((wMatch = wordRegex.exec(wordsRaw)) !== null) {
      wordList.push({
        word: wMatch[1],
        ar_word: wMatch[2],
        imagePath: wMatch[3] || null
      });
    }
    alphabetMap[letter] = {
      letter,
      ar_letter,
      words: wordList.slice(0, 6)
    };
  }
  return alphabetMap;
}

// تحويل صورة لـ Base64
function getBase64Image(filePath) {
  if (!filePath || !fs.existsSync(filePath)) return '';
  const ext = path.extname(filePath).replace('.', '');
  const data = fs.readFileSync(filePath).toString('base64');
  return `data:image/${ext};base64,${data}`;
}

// قوالب ألوان جذابة للأطفال
const COLOR_THEMES = [
  'from-amber-400 via-orange-400 to-pink-500',
  'from-rose-400 via-red-500 to-pink-600',
  'from-amber-500 via-amber-600 to-orange-600',
  'from-emerald-400 via-teal-500 to-cyan-600',
  'from-blue-400 via-indigo-500 to-purple-600',
  'from-fuchsia-400 via-purple-500 to-indigo-600',
  'from-violet-400 via-purple-500 to-rose-500'
];

function generateSlideHtml(slide, logoBase64) {
  return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
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

  <!-- الهيدر واللوجو الثابت للأكاديمية -->
  <header class="flex items-center justify-between z-10">
    <div class="flex items-center gap-5 bg-white/20 backdrop-blur-md px-6 py-3 rounded-3xl border-2 border-white/30 shadow-lg">
      <img src="${logoBase64}" class="w-16 h-16 rounded-2xl object-cover shadow border border-white" alt="Logo">
      <div>
        <div class="text-2xl font-black tracking-wide text-white drop-shadow">تعلم مع يونس</div>
        <div class="text-xs font-bold text-white/80 font-kids tracking-wider">Learn With Younis • Official Lesson</div>
      </div>
    </div>

    <!-- شارة الدرس الحالي -->
    <div class="bg-white/20 backdrop-blur-md px-6 py-3 rounded-3xl border-2 border-white/30 text-center shadow-lg">
      <span class="text-xl font-black text-yellow-300">🌟 Lesson • Letter ${slide.letter}</span>
    </div>
  </header>

  <!-- المحتوى الرئيسي -->
  <main class="flex items-center justify-center gap-16 flex-1 z-10">
    ${slide.img ? `
      <!-- كارت الصورة ثلاثية الأبعاد -->
      <div class="w-[500px] h-[500px] bg-white rounded-[50px] p-8 shadow-2xl flex items-center justify-center border-8 border-white/80 transform hover:scale-105 transition-all">
        <img src="${slide.img}" class="w-[400px] h-[400px] object-contain drop-shadow-2xl" alt="${slide.title}">
      </div>

      <!-- نصوص الكلمة والترجمة والحرف -->
      <div class="flex flex-col text-right space-y-4 max-w-xl">
        <div class="inline-block bg-white/25 backdrop-blur-md px-8 py-3 rounded-full text-3xl font-black text-yellow-300 font-kids border border-white/30 w-fit">
          Letter ${slide.letter}
        </div>
        
        <h1 class="text-8xl font-black tracking-wider drop-shadow-lg font-kids text-white leading-tight">
          ${slide.title}
        </h1>

        <div class="text-5xl font-black text-white/95 drop-shadow">
          المعنى: <span class="text-yellow-300 underline underline-offset-8">${slide.ar_word}</span>
        </div>

        <div class="bg-black/20 backdrop-blur-sm px-6 py-4 rounded-2xl border border-white/20 text-2xl font-bold text-white/90">
          استمع وكرر: <span class="text-yellow-300 font-kids text-3xl tracking-wide">${slide.letter}, ${slide.letter}, ${slide.title}</span> 🗣️
        </div>
      </div>
    ` : `
      <!-- شاشة المقدمة الكبرى للحرف -->
      <div class="text-center flex flex-col items-center justify-center space-y-8">
        <div class="inline-block bg-white/25 backdrop-blur-md px-10 py-4 rounded-full text-4xl font-black text-yellow-300 font-kids border border-white/30 shadow-lg">
          مرحبًا بكم! سنتعلم اليوم حرف (${slide.letter})
        </div>
        
        <div class="text-[200px] font-black tracking-widest drop-shadow-2xl font-kids text-white leading-none">
          ${slide.letter} <span class="text-yellow-300">${slide.letter.toLowerCase()}</span>
        </div>

        <div class="bg-white/20 backdrop-blur-md px-12 py-5 rounded-3xl border-2 border-white/40 shadow-xl text-center">
          <div class="text-4xl font-black text-yellow-200 mb-2">صوت الحرف ونطقه في الكلمات:</div>
          <div class="text-6xl font-black font-kids text-white">Letter <span class="text-yellow-300">${slide.letter}</span></div>
        </div>
      </div>
    `}
  </main>

  <!-- الفوتر والشريط السفلي -->
  <footer class="flex items-center justify-between text-lg font-bold text-white/90 border-t-2 border-white/20 pt-4 z-10">
    <div class="flex items-center gap-3">
      <span class="text-2xl">🎓</span>
      <span>كورس التأسيس الشامل للأطفال والكبار • مسار الدروس التفاعلية</span>
    </div>
    <div class="font-kids tracking-wider text-xl text-yellow-300">
      www.learnwithyounis.com
    </div>
  </footer>
</body>
</html>
  `;
}

// السؤال التفاعلي في الكونسول
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans.trim());
  }));
}

async function main() {
  console.log('\n======================================================');
  console.log('   🎬 أداة صانع فيديوهات الدروس التفاعلية (1080p Full HD)   ');
  console.log('       أكاديمية: تعلم مع يونس (Learn With Younis)       ');
  console.log('======================================================\n');

  const alphabetMap = extractAlphabetData();
  
  // 1. اختيار الحرف
  let letterInput = process.argv[2];
  if (!letterInput) {
    letterInput = await askQuestion('📌 أدخل الحرف المراد صناعة الفيديو له (مثال: A أو B أو C...): ');
  }
  const letter = (letterInput || 'A').toUpperCase();

  const lessonData = alphabetMap[letter];
  if (!lessonData) {
    console.error(`❌ خطأ: الحرف (${letter}) غير موجود في قائمة الحروف!`);
    process.exit(1);
  }

  console.log(`\n✅ تم اختيار الحرف: [${letter}] (${lessonData.ar_letter})`);
  console.log(`📋 الكلمات الست: ${lessonData.words.map(w => w.word).join(', ')}`);

  // 2. التحقق من ملف الصوت
  const defaultAudioPath = path.join(projectRoot, 'public', 'assets', 'audio', `lesson_${letter.toLowerCase()}_audio.mp3`);
  let audioFile = defaultAudioPath;

  if (!fs.existsSync(defaultAudioPath)) {
    console.log(`\n⚠️  الملف الصوتي الافتراضي غير موجود في:\n   ${defaultAudioPath}`);
    const customAudio = await askQuestion('🎙️  أدخل المسار الكامل لملف الصوت (mp3) أو اسحبه هنا: ');
    audioFile = customAudio.replace(/^"|"$/g, '');
    if (!fs.existsSync(audioFile)) {
      console.error(`❌ خطأ: ملف الصوت غير موجود!`);
      process.exit(1);
    }
  } else {
    console.log(`\n🎙️  تم العثور على ملف الصوت: ${path.basename(audioFile)}`);
  }

  // حساب مدة الصوت باستخدام ffprobe / ffmpeg
  console.log('⏳ جاري فحص مدة الصوت...');
  let totalDuration = 48.0;
  try {
    const probe = cp.execSync(`"${ffmpeg.path}" -i "${audioFile}" 2>&1`).toString();
    const durMatch = probe.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (durMatch) {
      totalDuration = parseInt(durMatch[1]) * 3600 + parseInt(durMatch[2]) * 60 + parseFloat(durMatch[3]);
      console.log(`⏱️ مدة التسجيل الصوتي بالكامل: ${totalDuration.toFixed(1)} ثانية`);
    }
  } catch (e) {
    // ffprobe returns exit code 1 when only reading info, ignore
    const probe = e.output ? e.output.toString() : '';
    const durMatch = probe.match(/Duration:\s*(\d+):(\d+):(\d+\.\d+)/);
    if (durMatch) {
      totalDuration = parseInt(durMatch[1]) * 3600 + parseInt(durMatch[2]) * 60 + parseFloat(durMatch[3]);
      console.log(`⏱️ مدة التسجيل الصوتي بالكامل: ${totalDuration.toFixed(1)} ثانية`);
    }
  }

  // توزيع التوقيت بين الشرائح (مقدمة الحرف + 6 كلمات)
  // المقدمة تأخذ ~ 25% من الوقت والباقي يوزع بالتساوي على الكلمات الست
  const introDuration = Math.max(8.0, totalDuration * 0.28);
  const wordDuration = (totalDuration - introDuration) / 6.0;

  console.log(`\n📊 توزيع التوقيت التلقائي:`);
  console.log(`   - المقدمة وصوت الحرف: ${introDuration.toFixed(1)} ثانية`);
  console.log(`   - كل كلمة من الـ 6 كلمات: ${wordDuration.toFixed(1)} ثانية`);

  const logoBase64 = getBase64Image(path.join(projectRoot, 'public', 'logo.jpg'));

  // تجهيز بيانات الشرائح
  const slides = [
    {
      id: 0,
      duration: introDuration,
      letter: letter,
      title: `Letter ${letter}`,
      img: '',
      bgGradient: COLOR_THEMES[0]
    }
  ];

  lessonData.words.forEach((w, idx) => {
    let imgBase64 = '';
    if (w.imagePath) {
      const fullImgPath = path.join(projectRoot, 'public', 'assets', 'images', w.imagePath);
      imgBase64 = getBase64Image(fullImgPath);
    }
    slides.push({
      id: idx + 1,
      duration: wordDuration,
      letter: letter,
      title: w.word,
      ar_word: w.ar_word,
      img: imgBase64,
      bgGradient: COLOR_THEMES[(idx + 1) % COLOR_THEMES.length]
    });
  });

  // 3. تشغيل المتصفح لإنشاء لقطات 1080p
  console.log('\n🎨 جاري إنشاء وتصيير شرائح الفيديو بدقة 1080p Full HD...');
  const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  const browser = await puppeteer.launch({
    executablePath: fs.existsSync(edgePath) ? edgePath : undefined,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const html = generateSlideHtml(slide, logoBase64);
    await page.setContent(html, { waitUntil: 'domcontentloaded' });
    await new Promise(r => setTimeout(r, 400));
    const slidePath = path.join(outFramesDir, `slide_${i}.png`);
    await page.screenshot({ path: slidePath });
    console.log(`   📸 [${i + 1}/${slides.length}] تم تصوير شريحة: ${slide.title}`);
  }

  await browser.close();
  console.log('✅ تم الانتهاء من تصميم كافة الصور بدقة 1080p!');

  // 4. كتابة ملف التجميع لـ FFmpeg
  let concatText = '';
  for (let i = 0; i < slides.length; i++) {
    const imgPath = path.join(outFramesDir, `slide_${i}.png`).replace(/\\/g, '/');
    concatText += `file '${imgPath}'\n`;
    concatText += `duration ${slides[i].duration.toFixed(3)}\n`;
  }
  const lastImg = path.join(outFramesDir, `slide_${slides.length - 1}.png`).replace(/\\/g, '/');
  concatText += `file '${lastImg}'\n`;

  const concatPath = path.join(outFramesDir, 'slides.txt');
  fs.writeFileSync(concatPath, concatText);

  // 5. إنتاج الفيديو النهائي
  const outputVideoDir = path.join(projectRoot, 'public', 'assets', 'video');
  if (!fs.existsSync(outputVideoDir)) fs.mkdirSync(outputVideoDir, { recursive: true });

  const finalVideoPath = path.join(outputVideoDir, `lesson_${letter.toLowerCase()}.mp4`).replace(/\\/g, '/');
  const safeConcatPath = concatPath.replace(/\\/g, '/');
  const safeAudioPath = audioFile.replace(/\\/g, '/');

  console.log('\n🎞️  جاري دمج الفيديو مع الصوت واللوجو عبر FFmpeg...');
  const ffmpegCmd = `"${ffmpeg.path}" -y -f concat -safe 0 -i "${safeConcatPath}" -i "${safeAudioPath}" -c:v libx264 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest "${finalVideoPath}"`;

  cp.execSync(ffmpegCmd, { stdio: 'inherit' });

  console.log('\n🎉🎉🎉 مبروك! تم إنشاء الفيديو بنجاح! 🎉🎉🎉');
  console.log(`📍 مكان الفيديو النهائي:\n   ${finalVideoPath}\n`);
}

main().catch(err => {
  console.error('\n❌ حدث خطأ أثناء إنشاء الفيديو:', err);
});
