/**
 * Content for the topic games (family, feelings, body, jobs, weather, days).
 *
 * HOW TO ADD YOUR OWN:
 *  - Add a line here:  { key: 'Mother', en: 'This is my mother.', ar: 'هذه أمي.' }
 *    `key` must match the English word of the category item (data.service.ts).
 *  - Run `npm run audio -- --csv` to get the exact mp3 file names to record
 *    (or `npm run audio` / `npm run audio -- --ar` to generate them with TTS).
 */
export interface TopicLine { key: string; en: string; ar: string; }

export const FAMILY_LINES: TopicLine[] = [
  { key: 'Mother', en: 'This is my mother.', ar: 'هذه أمي.' },
  { key: 'Father', en: 'This is my father.', ar: 'هذا أبي.' },
  { key: 'Baby', en: 'This is the baby.', ar: 'هذا الطفل الرضيع.' },
  { key: 'Brother', en: 'This is my brother.', ar: 'هذا أخي.' },
  { key: 'Sister', en: 'This is my sister.', ar: 'هذه أختي.' },
  { key: 'Grandmother', en: 'This is my grandmother.', ar: 'هذه جدتي.' },
  { key: 'Grandfather', en: 'This is my grandfather.', ar: 'هذا جدي.' },
  { key: 'Uncle', en: 'This is my uncle.', ar: 'هذا عمي.' },
  { key: 'Aunt', en: 'This is my aunt.', ar: 'هذه عمتي.' },
  { key: 'Friend', en: 'This is my friend.', ar: 'هذا صديقي.' },
  { key: 'Family', en: 'This is my family.', ar: 'هذه عائلتي.' }
];

export const FEELING_LINES: TopicLine[] = [
  { key: 'Happy', en: 'I am happy.', ar: 'أنا سعيد.' },
  { key: 'Sad', en: 'I am sad.', ar: 'أنا حزين.' },
  { key: 'Angry', en: 'I am angry.', ar: 'أنا غاضب.' },
  { key: 'Scared', en: 'I am scared.', ar: 'أنا خائف.' },
  { key: 'Sleepy', en: 'I am sleepy.', ar: 'أنا نعسان.' },
  { key: 'Surprised', en: 'I am surprised.', ar: 'أنا متفاجئ.' },
  { key: 'Excited', en: 'I am excited.', ar: 'أنا متحمس.' },
  { key: 'Tired', en: 'I am tired.', ar: 'أنا متعب.' },
  { key: 'Sick', en: 'I am sick.', ar: 'أنا مريض.' },
  { key: 'Shy', en: 'I am shy.', ar: 'أنا خجول.' },
  { key: 'Silly', en: 'I am silly.', ar: 'أنا مرح.' },
  { key: 'Calm', en: 'I am calm.', ar: 'أنا هادئ.' }
];

export const BODY_LINES: TopicLine[] = [
  { key: 'Eye', en: 'Touch your eye.', ar: 'المس عينك.' },
  { key: 'Ear', en: 'Touch your ear.', ar: 'المس أذنك.' },
  { key: 'Nose', en: 'Touch your nose.', ar: 'المس أنفك.' },
  { key: 'Mouth', en: 'Touch your mouth.', ar: 'المس فمك.' },
  { key: 'Hand', en: 'Show me your hand.', ar: 'أرني يدك.' },
  { key: 'Foot', en: 'Show me your foot.', ar: 'أرني قدمك.' },
  { key: 'Leg', en: 'Shake your leg.', ar: 'حرّك ساقك.' },
  { key: 'Arm', en: 'Raise your arm.', ar: 'ارفع ذراعك.' },
  { key: 'Tooth', en: 'Brush your tooth.', ar: 'نظّف سنّك.' },
  { key: 'Tongue', en: 'Show me your tongue.', ar: 'أرني لسانك.' },
  { key: 'Brain', en: 'Use your brain.', ar: 'استخدم عقلك.' },
  { key: 'Bone', en: 'Bones make you strong.', ar: 'العظام تجعلك قوياً.' }
];

export const JOB_RIDDLES: TopicLine[] = [
  { key: 'Doctor', en: 'I help sick people feel better. Who am I?', ar: 'أساعد المرضى ليتحسنوا. من أنا؟' },
  { key: 'Teacher', en: 'I teach children at school. Who am I?', ar: 'أعلّم الأطفال في المدرسة. من أنا؟' },
  { key: 'Police officer', en: 'I keep the streets safe. Who am I?', ar: 'أحافظ على أمان الشوارع. من أنا؟' },
  { key: 'Firefighter', en: 'I put out big fires. Who am I?', ar: 'أُطفئ الحرائق الكبيرة. من أنا؟' },
  { key: 'Farmer', en: 'I grow vegetables and fruits. Who am I?', ar: 'أزرع الخضروات والفاكهة. من أنا؟' },
  { key: 'Chef', en: 'I cook yummy food in the kitchen. Who am I?', ar: 'أطبخ طعاماً لذيذاً في المطبخ. من أنا؟' },
  { key: 'Pilot', en: 'I fly an airplane in the sky. Who am I?', ar: 'أقود الطائرة في السماء. من أنا؟' },
  { key: 'Artist', en: 'I paint beautiful pictures. Who am I?', ar: 'أرسم لوحات جميلة. من أنا؟' },
  { key: 'Astronaut', en: 'I travel to space in a rocket. Who am I?', ar: 'أسافر إلى الفضاء في صاروخ. من أنا؟' },
  { key: 'Scientist', en: 'I do experiments in a lab. Who am I?', ar: 'أجري التجارب في المختبر. من أنا؟' },
  { key: 'Builder', en: 'I build houses and bridges. Who am I?', ar: 'أبني البيوت والجسور. من أنا؟' },
  { key: 'Singer', en: 'I sing songs on the stage. Who am I?', ar: 'أغني الأغاني على المسرح. من أنا؟' }
];

/** "Today is ..." — used by the Days & Months screen (index 0 = Sunday, like JavaScript's getDay()). */
export const DAY_LINES: TopicLine[] = [
  { key: 'Sunday', en: 'Today is Sunday.', ar: 'اليوم هو الأحد.' },
  { key: 'Monday', en: 'Today is Monday.', ar: 'اليوم هو الاثنين.' },
  { key: 'Tuesday', en: 'Today is Tuesday.', ar: 'اليوم هو الثلاثاء.' },
  { key: 'Wednesday', en: 'Today is Wednesday.', ar: 'اليوم هو الأربعاء.' },
  { key: 'Thursday', en: 'Today is Thursday.', ar: 'اليوم هو الخميس.' },
  { key: 'Friday', en: 'Today is Friday.', ar: 'اليوم هو الجمعة.' },
  { key: 'Saturday', en: 'Today is Saturday.', ar: 'اليوم هو السبت.' }
];

/** Weather scenes for "Today's Weather" (scene = Tailwind classes for the sky). */
export interface WeatherScene { key: string; emoji: string; sky: string; en: string; ar: string; }
export const WEATHER_SCENES: WeatherScene[] = [
  { key: 'Sunny', emoji: '☀️', sky: 'from-sky-300 to-yellow-100', en: 'It is sunny today.', ar: 'الجو مشمس اليوم.' },
  { key: 'Rainy', emoji: '🌧️', sky: 'from-slate-400 to-slate-200', en: 'It is rainy today.', ar: 'الجو ممطر اليوم.' },
  { key: 'Snowy', emoji: '❄️', sky: 'from-blue-200 to-white', en: 'It is snowy today.', ar: 'الجو ثلجي اليوم.' },
  { key: 'Windy', emoji: '💨', sky: 'from-teal-200 to-cyan-50', en: 'It is windy today.', ar: 'الجو عاصف اليوم.' }
];

/** Clothes for "What should I wear?" — `for` lists the weathers where the item is a good choice. */
export interface OutfitItem { en: string; ar: string; img: string; for: string[]; }
export const OUTFIT_ITEMS: OutfitItem[] = [
  { en: 'Sunglasses', ar: 'نظارة شمسية', img: '🕶️', for: ['Sunny'] },
  { en: 'Sun hat', ar: 'قبعة الشمس', img: '👒', for: ['Sunny'] },
  { en: 'T-shirt', ar: 'تيشيرت', img: '👕', for: ['Sunny'] },
  { en: 'Shorts', ar: 'شورت', img: '🩳', for: ['Sunny'] },
  { en: 'Sandals', ar: 'صندل', img: '🩴', for: ['Sunny'] },
  { en: 'Umbrella', ar: 'مظلة', img: '☂️', for: ['Rainy'] },
  { en: 'Rain boots', ar: 'حذاء المطر', img: '🥾', for: ['Rainy', 'Snowy'] },
  { en: 'Coat', ar: 'معطف', img: '🧥', for: ['Rainy', 'Snowy', 'Windy'] },
  { en: 'Scarf', ar: 'وشاح', img: '🧣', for: ['Snowy', 'Windy'] },
  { en: 'Gloves', ar: 'قفازات', img: '🧤', for: ['Snowy'] }
];

export const WEATHER_PROMPT = { en: 'What should we wear?', ar: 'ماذا يجب أن نرتدي؟' };
