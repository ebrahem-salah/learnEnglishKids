import { Injectable, signal } from '@angular/core';
import { AlphabetItem, Sticker, ExtraCategory, Song, Phrase, ShortStory } from './audio.service';

declare const confetti: any;

@Injectable({
  providedIn: 'root'
})
export class DataService {
  learned = signal<Set<string>>(new Set());
  passedLessons = signal<Set<string>>(new Set(['A'])); // First lesson A is unlocked by default
  stars = signal(10);
  failed = signal<Set<string>>(new Set());

  // User Profile
  childName = signal<string>(localStorage.getItem('childName') || '');
  streak = signal<number>(parseInt(localStorage.getItem('streak') || '0', 10));
  lastLoginDate = signal<string>(localStorage.getItem('lastLoginDate') || '');

  constructor() {
    try {
      const s = JSON.parse(localStorage.getItem('abc-kids-progress') || '{}');
      this.learned.set(new Set(s.learned || []));
      this.passedLessons.set(new Set(s.passedLessons && s.passedLessons.length > 0 ? s.passedLessons : ['A']));
      this.stars.set(s.stars !== undefined ? s.stars : 10);
      this.childName.set(s.childName || '');
      this.streak.set(s.streak || 0);
      this.lastLoginDate.set(s.lastLoginDate || '');
      
      if (s.unlockedStickers) {
        setTimeout(() => {
          this.stickersData.update(list => list.map(st => ({ ...st, unlocked: s.unlockedStickers.includes(st.id) })));
        });
      }

      this.checkStreak();
    } catch { /* ignore */ }
  }

  checkStreak() {
    const today = new Date().toDateString();
    if (this.lastLoginDate() !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (this.lastLoginDate() === yesterday.toDateString()) {
        this.streak.update(s => s + 1);
      } else if (this.lastLoginDate() !== '') {
        this.streak.set(1);
      } else {
        this.streak.set(1);
      }
      this.lastLoginDate.set(today);
      this.save();
    }
  }

  setChildName(name: string) {
    this.childName.set(name);
    localStorage.setItem('childName', name);
    this.save();
  }

  addStars(amount: number) {
    this.stars.update(s => s + amount);
    this.save();
    if (amount > 0 && typeof confetti !== 'undefined') {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FFD700', '#FFA500', '#FF6347']
      });
    }
  }

  buySticker(sticker: Sticker) {
    if (sticker.unlocked) {
      alert('لديك هذا الملصق بالفعل!');
      return;
    }
    if (this.stars() >= sticker.cost) {
      this.addStars(-sticker.cost);
      this.stickersData.update(s => {
        const item = s.find(i => i.id === sticker.id);
        if (item) item.unlocked = true;
        return [...s];
      });
      this.save();
      if (typeof confetti !== 'undefined') {
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.5 },
          colors: ['#4CAF50', '#2196F3', '#9C27B0']
        });
      }
      alert('🎉 مبروك! لقد اشتريت الملصق بنجاح!');
    } else {
      alert('❌ عذراً، نجومك لا تكفي! تعلم المزيد لتربح نجوماً أكثر!');
    }
  }

  // Current text to trace (letter or word)
  tracingText = signal<string>('A');
  stickersData = signal<Sticker[]>([
    { id: 'st1', name: 'كأس البطل الذهبي', img: '🏆', imagePath: 'gift.png', cost: 5, unlocked: false },
    { id: 'st2', name: 'الصاروخ الفضائي', img: '🚀', imagePath: 'rocket.png', cost: 10, unlocked: false },
    { id: 'st3', name: 'تاج الملكة', img: '👑', imagePath: 'queen.png', cost: 15, unlocked: false },
    { id: 'st4', name: 'وحيد القرن السحري', img: '🦄', imagePath: 'unicorn.png', cost: 20, unlocked: false },
    { id: 'st5', name: 'الدولفين الذكي', img: '🐬', imagePath: 'dolphin.png', cost: 25, unlocked: false },
    { id: 'st6', name: 'نجمة التفوق', img: '⭐', imagePath: 'star.png', cost: 30, unlocked: false }
  ]);

  readonly phrasesData: Phrase[] = [
    { en: 'Hi!', ar: 'أهلاً!', context: 'التحية القصيرة', icon: '👋' },
    { en: 'Hello!', ar: 'مرحباً!', context: 'التحية', icon: '✋' },
    { en: 'Yes.', ar: 'نعم.', context: 'الموافقة', icon: '✅' },
    { en: 'No.', ar: 'لا.', context: 'الرفض', icon: '❌' },
    { en: 'Please.', ar: 'من فضلك.', context: 'الطلب بتهذيب', icon: '🙏' },
    { en: 'Hello! How are you?', ar: 'مرحباً! كيف حالك؟', context: 'التحية والسؤال', icon: '💬' },
    { en: 'I am fine, thank you!', ar: 'أنا بخير، شكراً لك!', context: 'الرد على التحية', icon: '😊' },
    { en: 'My name is Alex.', ar: 'اسمي أليكس.', context: 'التعريف بالنفس', icon: '🧒' },
    { en: 'How old are you?', ar: 'كم عمرك؟', context: 'سؤال عن العمر', icon: '🎂' },
    { en: 'I am six years old.', ar: 'عمري ست سنوات.', context: 'الرد عن العمر', icon: '🎈' },
    { en: 'Nice to meet you!', ar: 'سعيد بلقائك!', context: 'الترحيب', icon: '🤝' },
    { en: 'Thank you very much!', ar: 'شكراً جزيلاً لك!', context: 'الشكر', icon: '🎁' },
    { en: 'You are welcome.', ar: 'على الرحب والسعة. (عفواً)', context: 'الرد على الشكر', icon: '💖' },
    { en: 'Good morning!', ar: 'صباح الخير!', context: 'التحية الصباحية', icon: '☀️' },
    { en: 'Good afternoon!', ar: 'طاب مساؤك!', context: 'تحية بعد الظهر', icon: '🌤️' },
    { en: 'Good evening!', ar: 'مساء الخير!', context: 'التحية المسائية', icon: '🌆' },
    { en: 'Good night, sweet dreams!', ar: 'تصبح على خير، أحلاماً سعيدة!', context: 'قبل النوم', icon: '🌙' },
    { en: 'Can I have some water, please?', ar: 'هل يمكنني الحصول على بعض الماء من فضلك؟', context: 'الطلب بتهذيب', icon: '💧' },
    { en: 'Can I have some tea, please?', ar: 'هل يمكنني الحصول على بعض الشاي من فضلك؟', context: 'طلب مشروب', icon: '🍵' },
    { en: 'I am hungry, I want to eat.', ar: 'أنا جائع، أريد أن آكل.', context: 'الجوع', icon: '🍔' },
    { en: 'I would like some apples, please.', ar: 'أريد بعض التفاح من فضلك.', context: 'طلب فاكهة', icon: '🍎' },
    { en: 'Can I have some vegetables?', ar: 'هل يمكنني الحصول على بعض الخضروات؟', context: 'طلب طعام', icon: '🥗' },
    { en: 'I love my family!', ar: 'أنا أحب عائلتي!', context: 'العائلة', icon: '❤️' },
    { en: 'What is your favorite color?', ar: 'ما هو لونك المفضل؟', context: 'السؤال عن الألوان', icon: '🎨' },
    { en: 'Let us play together!', ar: 'دعنا نلعب معاً!', context: 'اللعب', icon: '🎮' },
    { en: 'Where is the bathroom?', ar: 'أين الحمام؟', context: 'سؤال عن مكان', icon: '🚽' },
    { en: 'I am sorry.', ar: 'أنا آسف.', context: 'الاعتذار', icon: '😔' },
    { en: 'Excuse me.', ar: 'معذرة.', context: 'الاستئذان', icon: '🙋' },
    { en: 'See you later!', ar: 'أراك لاحقاً!', context: 'الوداع', icon: '👋' },
    { en: 'I like to read books.', ar: 'أنا أحب قراءة الكتب.', context: 'الهوايات', icon: '📖' },
    { en: 'I love writing.', ar: 'أنا أحب الكتابة.', context: 'الهوايات', icon: '✍️' },
    { en: 'My favorite hobby is drawing.', ar: 'هوايتي المفضلة هي الرسم.', context: 'الهوايات', icon: '🎨' },
    { en: 'Learning English is fun!', ar: 'تعلم الإنجليزية ممتع!', context: 'التعلم', icon: '🧠' }
  ];

  readonly storiesData: ShortStory[] = [
    {
      title: 'The Brave Little Lion',
      ar_title: 'الأسد الصغير الشجاع',
      icon: '🦁',
      imagePath: 'lion.png',
      pages: [
        { en: 'Once upon a time, Leo the little lion woke up.', ar: 'ذات مرة، استيقظ الأسد الصغير ليو في الصباح.', img: '🦁', imagePath: 'lion.png' },
        { en: 'The warm golden sun was shining bright in the sky.', ar: 'كانت الشمس الذهبية الدافئة تشرق براقة في السماء.', img: '☀️', imagePath: 'sun.png' },
        { en: 'Leo hopped through the green grassy valley.', ar: 'قفز ليو بحماس عبر الوادي الأخضر العشبي.', img: '🌳', imagePath: 'tree.png' },
        { en: 'Suddenly, he met a cute little rabbit named Bella.', ar: 'وفجأة، التقى بأرنبة صغيرة لطيفة تدعى بيلا.', img: '🐰', imagePath: 'rabbit.png' },
        { en: 'They ate sweet red apples together under the big tree.', ar: 'تناولا معاً تفاحاً أحمر لذيذاً تحت الشجرة الكبيرة.', img: '🍎', imagePath: 'apple.png' },
        { en: 'They became best friends and played until sunset!', ar: 'أصبحا أعز صديقين ولعبا بسعادة حتى غروب الشمس!', img: '⭐', imagePath: 'star.png' }
      ]
    },
    {
      title: 'Journey to the Stars',
      ar_title: 'رحلة إلى النجوم والقمر',
      icon: '🚀',
      imagePath: 'rocket.png',
      pages: [
        { en: 'The shiny spaceship is ready on the launch pad.', ar: 'سفينة الفضاء اللامعة جاهزة على منصة الإطلاق.', img: '🚀', imagePath: 'rocket.png' },
        { en: 'Three, two, one, blast off into the clouds!', ar: 'ثلاثة، اثنان، واحد، انطلاق نحو السحاب!', img: '☁️', imagePath: 'cloud.png' },
        { en: 'The rocket flies high beyond Planet Earth.', ar: 'يحلق الصاروخ عالياً متجاوزاً كوكب الأرض الجميل.', img: '🌍', imagePath: 'earth.png' },
        { en: 'It lands softly on the glowing silver moon.', ar: 'يهبط الصاروخ بهدوء على سطح القمر الفضي المشع.', img: '🌙', imagePath: 'moon.png' },
        { en: 'Millions of colorful stars sparkle like diamonds.', ar: 'ملايين النجوم الملونة تلمع كالألماس في الفضاء.', img: '⭐', imagePath: 'star.png' },
        { en: 'The astronaut waves happily back to Earth!', ar: 'يلوح رائد الفضاء بيده سعيداً للأرض!', img: '👨‍🚀', imagePath: 'astronaut.png' }
      ]
    },
    {
      title: 'A Busy Day at the Farm',
      ar_title: 'يوم حافل في المزرعة السعيدة',
      icon: '🚜',
      imagePath: 'farm.png',
      pages: [
        { en: 'The farm wakes up as the rooster greets the morning sun.', ar: 'تستيقظ المزرعة بينما يحيي الديك شمس الصباح المشرقة.', img: '🌅', imagePath: 'sun.png' },
        { en: 'The friendly cow grazes and gives fresh milk.', ar: 'ترعى البقرة الودودة في الحقل وتمنحنا حليباً طازجاً.', img: '🐄', imagePath: 'cow.png' },
        { en: 'Two fluffy ducks swim splashing in the clear pond.', ar: 'بطتان رقيقتان تسبحان وترشان الماء في البركة الصافية.', img: '🦆', imagePath: 'duck.png' },
        { en: 'The brown horse gallops gracefully across the fence.', ar: 'يركض الحصان البني برشاقة وسرعة بمحاذاة السياج.', img: '🐎', imagePath: 'horse.png' },
        { en: 'The farmer collects red tomatoes and ripe strawberries.', ar: 'يجمع المزارع الطماطم الحمراء والفراولة الناضجة اللذيذة.', img: '🍓', imagePath: 'strawberry.png' },
        { en: 'It was a wonderful, peaceful day on the farm!', ar: 'لقد كان يوماً رائعاً وهادئاً في المزرعة الجميلة!', img: '🚜', imagePath: 'farm.png' }
      ]
    },
    {
      title: 'Sara First Day at School',
      ar_title: 'يوم سارة الأول في المدرسة',
      icon: '🏫',
      imagePath: 'bus.png',
      pages: [
        { en: 'Sara woke up early with a bright smile on her face.', ar: 'استيقظت سارة مبكراً بابتسامة مشرقة على وجهها.', img: '⏰', imagePath: 'sun.png' },
        { en: 'She packed her notebook, pencils, and healthy breakfast.', ar: 'وضعت في حقيبتها دفترها وأقلامها وفطورها الصحي.', img: '🥛', imagePath: 'milk.png' },
        { en: 'The cheerful yellow school bus arrived at her door.', ar: 'وصلت حافلة المدرسة الصفراء المبهجة عند باب بيتها.', img: '🚌', imagePath: 'bus.png' },
        { en: 'Her kind teacher welcomed everyone into the classroom.', ar: 'رحبت المعلمة اللطيفة بالجميع داخل الفصل الدراسي.', img: '👩‍🏫', imagePath: 'book.png' },
        { en: 'They read exciting stories and drew colorful rainbows.', ar: 'قرأوا قصصاً مشوقة ورسموا قوس قزح بألوان زاهية.', img: '🌈', imagePath: 'rainbow.png' },
        { en: 'Sara shouted: I love learning and making new friends!', ar: 'هتفت سارة بفرح: أنا أحب التعلم وتكوين أصدقاء جدد!', img: '🎒', imagePath: 'gift.png' }
      ]
    }
  ];

  readonly songsData: Song[] = [
    {
      title: 'The ABC Song',
      ar_title: 'أغنية الحروف الإنجليزية',
      icon: '🔤',
      lyrics: `A B C D E F G\nH I J K L M N O P\nQ R S, T U V\nW X, Y and Z\nNow I know my ABCs\nNext time won't you sing with me!`,
      audioText: `A B C D E F G H I J K L M N O P Q R S T U V W X Y and Z Now I know my ABCs Next time won't you sing with me!`
    },
    {
      title: 'Phonics Song',
      ar_title: 'أغنية أصوات الحروف',
      icon: '🔊',
      lyrics: `A is for Apple, a a apple\nB is for Ball, b b ball\nC is for Cat, c c cat\nD is for Dog, d d dog!`,
      audioText: `A is for Apple, ah ah apple. B is for Ball, buh buh ball. C is for Cat, kuh kuh cat. D is for Dog, duh duh dog!`
    },
    {
      title: 'Number Song',
      ar_title: 'أغنية العد والأرقام',
      icon: '🔢',
      lyrics: `1 2 3 4 5 Once I caught a fish alive\n6 7 8 9 10 Then I let it go again!`,
      audioText: `One two three four five, Once I caught a fish alive, Six seven eight nine ten, Then I let it go again!`
    }
  ];

  readonly numbersData = [
    { num: 1, en: 'One', ar: 'واحد', icon: '🍎' },
    { num: 2, en: 'Two', ar: 'اثنان', icon: '🎈' },
    { num: 3, en: 'Three', ar: 'ثلاثة', icon: '⭐' },
    { num: 4, en: 'Four', ar: 'أربعة', icon: '🚗' },
    { num: 5, en: 'Five', ar: 'خمسة', icon: '🐥' },
    { num: 6, en: 'Six', ar: 'ستة', icon: '🍬' },
    { num: 7, en: 'Seven', ar: 'سبعة', icon: '🌸' },
    { num: 8, en: 'Eight', ar: 'ثمانية', icon: '⚽' },
    { num: 9, en: 'Nine', ar: 'تسعة', icon: '🎨' },
    { num: 10, en: 'Ten', ar: 'عشرة', icon: '🚀' },
    { num: 11, en: 'Eleven', ar: 'أحد عشر', icon: '🍓' },
    { num: 12, en: 'Twelve', ar: 'اثنا عشر', icon: '🎁' },
    { num: 13, en: 'Thirteen', ar: 'ثلاثة عشر', icon: '🦄' },
    { num: 14, en: 'Fourteen', ar: 'أربعة عشر', icon: '🍦' },
    { num: 15, en: 'Fifteen', ar: 'خمسة عشر', icon: '🦁' },
    { num: 16, en: 'Sixteen', ar: 'ستة عشر', icon: '🍉' },
    { num: 17, en: 'Seventeen', ar: 'سبعة عشر', icon: '👑' },
    { num: 18, en: 'Eighteen', ar: 'ثمانية عشر', icon: '🐝' },
    { num: 19, en: 'Nineteen', ar: 'تسعة عشر', icon: '🐬' },
    { num: 20, en: 'Twenty', ar: 'عشرون', icon: '🏆' },
    { num: 21, en: 'Twenty-one', ar: 'واحد وعشرون', icon: '🍕' },
    { num: 22, en: 'Twenty-two', ar: 'اثنان وعشرون', icon: '🍎' },
    { num: 23, en: 'Twenty-three', ar: 'ثلاثة وعشرون', icon: '🧸' },
    { num: 24, en: 'Twenty-four', ar: 'أربعة وعشرون', icon: '🚂' },
    { num: 25, en: 'Twenty-five', ar: 'خمسة وعشرون', icon: '🐘' },
    { num: 26, en: 'Twenty-six', ar: 'ستة وعشرون', icon: '🌼' },
    { num: 27, en: 'Twenty-seven', ar: 'سبعة وعشرون', icon: '🌈' },
    { num: 28, en: 'Twenty-eight', ar: 'ثمانية وعشرون', icon: '🪁' },
    { num: 29, en: 'Twenty-nine', ar: 'تسعة وعشرون', icon: '🎸' },
    { num: 30, en: 'Thirty', ar: 'ثلاثون', icon: '🏅' }
  ];

  readonly extraCategories: ExtraCategory[] = [
    {
      id: 'animals',
      title: 'عالم الحيوانات (Animals & Sounds)',
      icon: '🦁',
      items: [
        { en: 'Lion', ar: 'أسد', img: '🦁', realImg: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300&auto=format&fit=crop', soundEffect: 'roar', imagePath: 'lion.png' },
        { en: 'Elephant', ar: 'فيل', img: '🐘', realImg: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=300&auto=format&fit=crop', soundEffect: 'trumpet', imagePath: 'elephant.png' },
        { en: 'Cat', ar: 'قطة', img: '🐱', realImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop', soundEffect: 'meow', imagePath: 'cat.png' },
        { en: 'Dog', ar: 'كلب', img: '🐶', realImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop', soundEffect: 'bark', imagePath: 'dog.png' },
        { en: 'Bird', ar: 'طائر', img: '🐦', realImg: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=300&auto=format&fit=crop', soundEffect: 'tweet', imagePath: 'bird.png' },
        { en: 'Frog', ar: 'ضفدع', img: '🐸', realImg: 'https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=300&auto=format&fit=crop', soundEffect: 'croak', imagePath: 'frog.png' },
        { en: 'Tiger', ar: 'نمر', img: '🐅', realImg: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=300&auto=format&fit=crop', soundEffect: 'roar', imagePath: 'tiger.png' },
        { en: 'Monkey', ar: 'قرد', img: '🐒', realImg: 'https://images.unsplash.com/photo-1540573133985-78164d64a234?w=300&auto=format&fit=crop', imagePath: 'monkey.png' },
        { en: 'Giraffe', ar: 'زرافة', img: '🦒', realImg: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=300&auto=format&fit=crop', imagePath: 'giraffe.png' },
        { en: 'Dolphin', ar: 'دلفين', img: '🐬', realImg: 'https://images.unsplash.com/photo-1607153333879-c174d261b141?w=300&auto=format&fit=crop', imagePath: 'dolphin.png' },
        { en: 'Horse', ar: 'حصان', img: '🐎', realImg: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=300&auto=format&fit=crop', imagePath: 'horse.png' },
        { en: 'Cow', ar: 'بقرة', img: '🐄', realImg: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=300&auto=format&fit=crop', imagePath: 'cow.png' },
        { en: 'Sheep', ar: 'خروف', img: '🐑', realImg: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=300&auto=format&fit=crop' },
        { en: 'Rabbit', ar: 'أرنب', img: '🐇', realImg: 'https://images.unsplash.com/photo-1585110396000-c9fd4e4e11fd?w=300&auto=format&fit=crop', imagePath: 'rabbit.png' },
        { en: 'Bear', ar: 'دب', img: '🐻', realImg: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=300&auto=format&fit=crop', imagePath: 'bear.png' }
      ]
    },
    {
      id: 'food',
      title: 'الأطعمة والوجبات (Food & Meals)',
      icon: '🍕',
      items: [
        { en: 'Pizza', ar: 'بيتزا', img: '🍕', realImg: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop', imagePath: 'pizza.png' },
        { en: 'Burger', ar: 'برجر', img: '🍔', realImg: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop' },
        { en: 'Cake', ar: 'كعكة', img: '🍰', realImg: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop', imagePath: 'cake.png' },
        { en: 'Bread', ar: 'خبز', img: '🍞', realImg: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop' },
        { en: 'Cheese', ar: 'جبن', img: '🧀', realImg: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300&auto=format&fit=crop' },
        { en: 'Popcorn', ar: 'فشار', img: '🍿', realImg: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300&auto=format&fit=crop' },
        { en: 'Soup', ar: 'حساء / شوربة', img: '🥣', realImg: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300&auto=format&fit=crop' },
        { en: 'Sandwich', ar: 'شطيرة', img: '🥪', realImg: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&auto=format&fit=crop' },
        { en: 'Rice', ar: 'أرز', img: '🍚', realImg: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=300&auto=format&fit=crop' },
        { en: 'Egg', ar: 'بيضة', img: '🍳', realImg: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&auto=format&fit=crop', imagePath: 'egg.png' }
      ]
    },
    {
      id: 'fruits',
      title: 'الفواكه الخفيفة (Fresh Fruits)',
      icon: '🍎',
      items: [
        { en: 'Apple', ar: 'تفاحة', img: '🍎', realImg: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop', imagePath: 'apple.png' },
        { en: 'Banana', ar: 'موز', img: '🍌', realImg: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop', imagePath: 'banana.png' },
        { en: 'Orange', ar: 'برتقال', img: '🍊', realImg: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=300&auto=format&fit=crop', imagePath: 'orange.png' },
        { en: 'Strawberry', ar: 'فراولة', img: '🍓', realImg: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&auto=format&fit=crop', imagePath: 'strawberry.png' },
        { en: 'Watermelon', ar: 'بطيخ', img: '🍉', realImg: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&auto=format&fit=crop', imagePath: 'watermelon.png' },
        { en: 'Grapes', ar: 'عنب', img: '🍇', realImg: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=300&auto=format&fit=crop' },
        { en: 'Mango', ar: 'مانجو', img: '🥭', realImg: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=300&auto=format&fit=crop' },
        { en: 'Pineapple', ar: 'أناناس', img: '🍍', realImg: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=300&auto=format&fit=crop' },
        { en: 'Peach', ar: 'خوخ', img: '🍑', realImg: 'https://images.unsplash.com/photo-1531171000775-85f2fa668d27?w=300&auto=format&fit=crop' },
        { en: 'Cherry', ar: 'كرز', img: '🍒', realImg: 'https://images.unsplash.com/photo-1528821128474-27f963b062bf?w=300&auto=format&fit=crop' }
      ]
    },
    {
      id: 'vegetables',
      title: 'الخضروات الطازجة (Vegetables)',
      icon: '🥕',
      items: [
        { en: 'Carrot', ar: 'جزر', img: '🥕', realImg: 'https://images.unsplash.com/photo-1598170845058-12ef4a457939?w=300&auto=format&fit=crop' },
        { en: 'Tomato', ar: 'طماطم', img: '🍅', realImg: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop', imagePath: 'tomato.png' },
        { en: 'Cucumber', ar: 'خيار', img: '🥒', realImg: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&auto=format&fit=crop' },
        { en: 'Broccoli', ar: 'بروكلي', img: '🥦', realImg: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&auto=format&fit=crop' },
        { en: 'Corn', ar: 'ذرة', img: '🌽', realImg: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop' },
        { en: 'Potato', ar: 'بطاطس', img: '🥔', realImg: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&auto=format&fit=crop' },
        { en: 'Onion', ar: 'بصل', img: '🧅', realImg: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=300&auto=format&fit=crop', imagePath: 'onion.png' },
        { en: 'Pepper', ar: 'فلفل', img: '🫑', realImg: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=300&auto=format&fit=crop' },
        { en: 'Garlic', ar: 'ثوم', img: '🧄', realImg: 'https://images.unsplash.com/photo-1540148426946-57ac8af45499?w=300&auto=format&fit=crop' },
        { en: 'Lettuce', ar: 'خس', img: '🥬', realImg: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=300&auto=format&fit=crop' }
      ]
    },
    {
      id: 'drinks',
      title: 'المشروبات والعصائر (Drinks & Beverages)',
      icon: '🧃',
      items: [
        { en: 'Milk', ar: 'حليب', img: '🥛', realImg: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop', imagePath: 'milk.png' },
        { en: 'Water', ar: 'ماء', img: '💧', realImg: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop' },
        { en: 'Juice', ar: 'عصير', img: '🧃', realImg: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&auto=format&fit=crop', imagePath: 'juice.png' },
        { en: 'Tea', ar: 'شاي', img: '🍵', realImg: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop' },
        { en: 'Smoothie', ar: 'مخفوق فواكه', img: '🥤', realImg: 'https://images.unsplash.com/photo-1553530666-ba11a7da3888?w=300&auto=format&fit=crop' },
        { en: 'Hot Chocolate', ar: 'شوكولاتة ساخنة', img: '☕', realImg: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=300&auto=format&fit=crop' },
        { en: 'Coffee', ar: 'قهوة', img: '☕', realImg: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=300&auto=format&fit=crop' },
        { en: 'Lemonade', ar: 'عصير ليمون', img: '🍋', realImg: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&auto=format&fit=crop' }
      ]
    },
    {
      id: 'home_school',
      title: 'أغراض البيت والمدرسة (Home & School Things)',
      icon: '🏠',
      items: [
        { en: 'Door', ar: 'باب', img: '🚪', realImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop', imagePath: 'door.png' },
        { en: 'Chair', ar: 'كرسي', img: '🪑', realImg: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=300&auto=format&fit=crop' },
        { en: 'Table', ar: 'طاولة / تربيزة', img: '🪵', realImg: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=300&auto=format&fit=crop' },
        { en: 'Window', ar: 'شباك / نافذة', img: '🪟', realImg: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=300&auto=format&fit=crop', imagePath: 'window.png' },
        { en: 'Book', ar: 'كتاب', img: '📖', realImg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop', imagePath: 'book.png' },
        { en: 'Pencil', ar: 'قلم رصاص', img: '✏️', realImg: 'https://images.unsplash.com/photo-1585336261026-8f5786372966?w=300&auto=format&fit=crop', imagePath: 'pencil.png' },
        { en: 'Bag / Backpack', ar: 'حقيبة مدرسية', img: '🎒', realImg: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&auto=format&fit=crop' },
        { en: 'Clock / Watch', ar: 'ساعة حائط', img: '⏰', realImg: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=300&auto=format&fit=crop' },
        { en: 'Bed', ar: 'سرير', img: '🛏️', realImg: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300&auto=format&fit=crop' },
        { en: 'Lamp', ar: 'مصباح', img: '💡', realImg: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop', imagePath: 'lamp.png' }
      ]
    },
    {
      id: 'vehicles',
      title: 'وسائل المواصلات (Vehicles)',
      icon: '🚗',
      items: [
        { en: 'Car', ar: 'سيارة', img: '🚗', realImg: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&auto=format&fit=crop', soundEffect: 'vroom', imagePath: 'car.png' },
        { en: 'Airplane', ar: 'طائرة', img: '✈️', realImg: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&auto=format&fit=crop', soundEffect: 'jet', imagePath: 'airplane.png' },
        { en: 'Train', ar: 'قطار', img: '🚂', realImg: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=300&auto=format&fit=crop', soundEffect: 'choo', imagePath: 'train.png' },
        { en: 'Bus', ar: 'حافلة', img: '🚌', realImg: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&auto=format&fit=crop', soundEffect: 'horn', imagePath: 'bus.png' },
        { en: 'Rocket', ar: 'صاروخ', img: '🚀', realImg: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=300&auto=format&fit=crop', soundEffect: 'blast', imagePath: 'rocket.png' },
        { en: 'Bicycle', ar: 'دراجة', img: '🚲', realImg: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&auto=format&fit=crop', soundEffect: 'bell' }
      ]
    },
    {
      id: 'colors',
      title: 'الألوان (Colors)',
      icon: '🎨',
      items: [
        { en: 'Red', ar: 'أحمر', img: '🔴', realImg: 'https://images.unsplash.com/photo-1531315630201-bb15abeb1653?w=300&auto=format&fit=crop' },
        { en: 'Blue', ar: 'أزرق', img: '🔵', realImg: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=300&auto=format&fit=crop' },
        { en: 'Green', ar: 'أخضر', img: '🟢', realImg: 'https://images.unsplash.com/photo-1532453288672-3a27e9be9efd?w=300&auto=format&fit=crop' },
        { en: 'Yellow', ar: 'أصفر', img: '🟡', realImg: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop', imagePath: 'yellow.png' },
        { en: 'Orange', ar: 'برتقالي', img: '🟠', realImg: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&auto=format&fit=crop', imagePath: 'orange.png' },
        { en: 'Purple', ar: 'بنفسجي', img: '🟣', realImg: 'https://images.unsplash.com/photo-1552084117-56a98a414520?w=300&auto=format&fit=crop' },
        { en: 'Pink', ar: 'وردي', img: '🌸', realImg: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=300&auto=format&fit=crop' },
        { en: 'Black', ar: 'أسود', img: '⚫', realImg: 'https://images.unsplash.com/photo-1505909182942-e2f09aee3e89?w=300&auto=format&fit=crop' },
        { en: 'White', ar: 'أبيض', img: '⚪', realImg: 'https://images.unsplash.com/photo-1516382722697-e01124c1e459?w=300&auto=format&fit=crop' },
        { en: 'Brown', ar: 'بني', img: '🟤', realImg: 'https://images.unsplash.com/photo-1550508122-d7b102875f60?w=300&auto=format&fit=crop' }
      ]
    },
    {
      id: 'clothes',
      title: 'الملابس (Clothes)',
      icon: '👕',
      items: [
        { en: 'Shirt', ar: 'قميص', img: '👕', realImg: 'https://images.unsplash.com/photo-1596755094514-f87e32f6b717?w=300&auto=format&fit=crop' },
        { en: 'Pants', ar: 'بنطال', img: '👖', realImg: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=300&auto=format&fit=crop' },
        { en: 'Dress', ar: 'فستان', img: '👗', realImg: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&auto=format&fit=crop' },
        { en: 'Shoes', ar: 'حذاء', img: '👞', realImg: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=300&auto=format&fit=crop' },
        { en: 'Hat', ar: 'قبعة', img: '🧢', realImg: 'https://images.unsplash.com/photo-1521369909029-2afed882ba28?w=300&auto=format&fit=crop', imagePath: 'hat.png' },
        { en: 'Jacket', ar: 'سترة', img: '🧥', realImg: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&auto=format&fit=crop', imagePath: 'jacket.png' },
        { en: 'Socks', ar: 'جوارب', img: '🧦', realImg: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?w=300&auto=format&fit=crop' },
        { en: 'Skirt', ar: 'تنورة', img: '👗', realImg: 'https://images.unsplash.com/photo-1583496661160-c588c4c40f31?w=300&auto=format&fit=crop' }
      ]
    },
    {
      id: 'actions',
      title: 'الهوايات والأفعال (Hobbies & Actions)',
      icon: '🏃',
      items: [
        { en: 'Read', ar: 'يقرأ', img: '📖', realImg: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&auto=format&fit=crop' },
        { en: 'Write', ar: 'يكتب', img: '✍️', realImg: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?w=300&auto=format&fit=crop' },
        { en: 'Draw', ar: 'يرسم', img: '🎨', realImg: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=300&auto=format&fit=crop' },
        { en: 'Play', ar: 'يلعب', img: '⚽', realImg: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300&auto=format&fit=crop' },
        { en: 'Learn', ar: 'يتعلم', img: '🧠', realImg: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=300&auto=format&fit=crop' },
        { en: 'Run', ar: 'يركض', img: '🏃', realImg: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=300&auto=format&fit=crop' },
        { en: 'Swim', ar: 'يسبح', img: '🏊', realImg: 'https://images.unsplash.com/photo-1519315901367-f34f815be0c1?w=300&auto=format&fit=crop' },
        { en: 'Sing', ar: 'يغني', img: '🎤', realImg: 'https://images.unsplash.com/photo-1516280440502-62947029517e?w=300&auto=format&fit=crop' }
      ]
    }
  ];

  readonly alphabetData: AlphabetItem[] = [
    { 
      letter: 'A', ar_letter: 'إيه', 
      words: [
        { word: 'Apple', ar_word: 'تفاحة', img: '🍎', realImg: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop', imagePath: 'apple.png' },
        { word: 'Ant', ar_word: 'نملة', img: '🐜', imagePath: 'ant.png' },
        { word: 'Arm', ar_word: 'ذراع', img: '💪', imagePath: 'arm.png' },
        { word: 'Alligator', ar_word: 'تمساح', img: '🐊', imagePath: 'alligator.png' },
        { word: 'Arrow', ar_word: 'سهم', img: '🏹', imagePath: 'arrow.png' },
        { word: 'Axe', ar_word: 'فأس', img: '🪓', imagePath: 'axe.png' }
      ] 
    },
    { 
      letter: 'B', ar_letter: 'بي', 
      words: [
        { word: 'Ball', ar_word: 'كرة', img: '⚽', realImg: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=300&auto=format&fit=crop', imagePath: 'ball.png' },
        { word: 'Bear', ar_word: 'دب', img: '🐻', imagePath: 'bear.png' },
        { word: 'Book', ar_word: 'كتاب', img: '📖', imagePath: 'book.png' },
        { word: 'Banana', ar_word: 'موزة', img: '🍌', imagePath: 'banana.png' },
        { word: 'Bird', ar_word: 'طائر', img: '🐦', imagePath: 'bird.png' },
        { word: 'Bus', ar_word: 'حافلة', img: '🚌', imagePath: 'bus.png' }
      ] 
    },
    { 
      letter: 'C', ar_letter: 'سي', 
      words: [
        { word: 'Cat', ar_word: 'قطة', img: '🐈', realImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop', imagePath: 'cat.png' },
        { word: 'Car', ar_word: 'سيارة', img: '🚗', imagePath: 'car.png' },
        { word: 'Cow', ar_word: 'بقرة', img: '🐄', imagePath: 'cow.png' },
        { word: 'Cake', ar_word: 'كعكة', img: '🍰', imagePath: 'cake.png' },
        { word: 'Camel', ar_word: 'جمل', img: '🐪' },
        { word: 'Crown', ar_word: 'تاج', img: '👑' }
      ] 
    },
    { 
      letter: 'D', ar_letter: 'دي', 
      words: [
        { word: 'Dog', ar_word: 'كلب', img: '🐕', realImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop', imagePath: 'dog.png' },
        { word: 'Duck', ar_word: 'بطة', img: '🦆', imagePath: 'duck.png' },
        { word: 'Door', ar_word: 'باب', img: '🚪', imagePath: 'door.png' },
        { word: 'Dolphin', ar_word: 'دلفين', img: '🐬', imagePath: 'dolphin.png' },
        { word: 'Drum', ar_word: 'طبلة', img: '🥁', imagePath: 'drum.png' },
        { word: 'Dress', ar_word: 'فستان', img: '👗' }
      ] 
    },
    { 
      letter: 'E', ar_letter: 'إي', 
      words: [
        { word: 'Elephant', ar_word: 'فيل', img: '🐘', realImg: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=300&auto=format&fit=crop', imagePath: 'elephant.png' },
        { word: 'Egg', ar_word: 'بيضة', img: '🥚', imagePath: 'egg.png' },
        { word: 'Eye', ar_word: 'عين', img: '👁️', imagePath: 'eye.png' },
        { word: 'Ear', ar_word: 'أذن', img: '👂' },
        { word: 'Earth', ar_word: 'الأرض', img: '🌍', imagePath: 'earth.png' },
        { word: 'Eagle', ar_word: 'نسر', img: '🦅', imagePath: 'eagle.png' }
      ] 
    },
    { 
      letter: 'F', ar_letter: 'إف', 
      words: [
        { word: 'Fish', ar_word: 'سمكة', img: '🐟' },
        { word: 'Frog', ar_word: 'ضفدع', img: '🐸', imagePath: 'frog.png' },
        { word: 'Flower', ar_word: 'زهرة', img: '🌸', imagePath: 'flower.png' },
        { word: 'Fire', ar_word: 'نار', img: '🔥', imagePath: 'fire.png' },
        { word: 'Fox', ar_word: 'ثعلب', img: '🦊', imagePath: 'fox.png' },
        { word: 'Foot', ar_word: 'قدم', img: '🦶' }
      ] 
    },
    { 
      letter: 'G', ar_letter: 'جي', 
      words: [
        { word: 'Goat', ar_word: 'ماعز', img: '🐐', imagePath: 'goat.png' },
        { word: 'Giraffe', ar_word: 'زرافة', img: '🦒', imagePath: 'giraffe.png' },
        { word: 'Grape', ar_word: 'عنب', img: '🍇', imagePath: 'grape.png' },
        { word: 'Gift', ar_word: 'هدية', img: '🎁', imagePath: 'gift.png' },
        { word: 'Guitar', ar_word: 'جيتار', img: '🎸', imagePath: 'guitar.png' },
        { word: 'Ghost', ar_word: 'شبح', img: '👻', imagePath: 'ghost.png' }
      ] 
    },
    { 
      letter: 'H', ar_letter: 'إتش', 
      words: [
        { word: 'Hat', ar_word: 'قبعة', img: '🎩', imagePath: 'hat.png' },
        { word: 'Horse', ar_word: 'حصان', img: '🐎', imagePath: 'horse.png' },
        { word: 'Hand', ar_word: 'يد', img: '✋' },
        { word: 'House', ar_word: 'منزل', img: '🏠', imagePath: 'house.png' },
        { word: 'Heart', ar_word: 'قلب', img: '❤️', imagePath: 'heart.png' },
        { word: 'Helicopter', ar_word: 'مروحية', img: '🚁', imagePath: 'helicopter.png' }
      ] 
    },
    { 
      letter: 'I', ar_letter: 'آي', 
      words: [
        { word: 'Ice cream', ar_word: 'آيس كريم', img: '🍦', imagePath: 'ice_cream.png' },
        { word: 'Island', ar_word: 'جزيرة', img: '🏝️', imagePath: 'island.png' },
        { word: 'Ice', ar_word: 'ثلج', img: '🧊', imagePath: 'ice.png' },
        { word: 'Iguana', ar_word: 'إغوانة', img: '🦎', imagePath: 'iguana.png' },
        { word: 'Insect', ar_word: 'حشرة', img: '🐛', imagePath: 'insect.png' },
        { word: 'Igloo', ar_word: 'كوخ ثلجي', img: '🛖', imagePath: 'igloo.png' }
      ] 
    },
    { 
      letter: 'J', ar_letter: 'جيه', 
      words: [
        { word: 'Juice', ar_word: 'عصير', img: '🧃', imagePath: 'juice.png' },
        { word: 'Jacket', ar_word: 'سترة', img: '🧥', imagePath: 'jacket.png' },
        { word: 'Jellyfish', ar_word: 'قنديل البحر', img: '🪼', imagePath: 'jellyfish.png' },
        { word: 'Jeep', ar_word: 'سيارة جيب', img: '🚙', imagePath: 'jeep.png' },
        { word: 'Jam', ar_word: 'مربى', img: '🍯', imagePath: 'jam.png' },
        { word: 'Jump', ar_word: 'قفز', img: '🤸' }
      ] 
    },
    { 
      letter: 'K', ar_letter: 'كيه', 
      words: [
        { word: 'Kite', ar_word: 'طائرة ورقية', img: '🪁', imagePath: 'kite.png' },
        { word: 'Key', ar_word: 'مفتاح', img: '🔑', imagePath: 'key.png' },
        { word: 'Kangaroo', ar_word: 'كنغر', img: '🦘', imagePath: 'kangaroo.png' },
        { word: 'King', ar_word: 'ملك', img: '🤴', imagePath: 'king.png' },
        { word: 'Keyboard', ar_word: 'لوحة مفاتيح', img: '⌨️', imagePath: 'keyboard.png' },
        { word: 'Koala', ar_word: 'كوالا', img: '🐨', imagePath: 'koala.png' }
      ] 
    },
    { 
      letter: 'L', ar_letter: 'إل', 
      words: [
        { word: 'Lion', ar_word: 'أسد', img: '🦁', imagePath: 'lion.png' },
        { word: 'Lemon', ar_word: 'ليمون', img: '🍋', imagePath: 'lemon.png' },
        { word: 'Leaf', ar_word: 'ورقة شجر', img: '🍃', imagePath: 'leaf.png' },
        { word: 'Lamp', ar_word: 'مصباح', img: '💡', imagePath: 'lamp.png' },
        { word: 'Lock', ar_word: 'قفل', img: '🔒', imagePath: 'lock.png' },
        { word: 'Ladybug', ar_word: 'دعسوقة', img: '🐞', imagePath: 'ladybug.png' }
      ] 
    },
    { 
      letter: 'M', ar_letter: 'إم', 
      words: [
        { word: 'Monkey', ar_word: 'قرد', img: '🐒', imagePath: 'monkey.png' },
        { word: 'Moon', ar_word: 'قمر', img: '🌙', imagePath: 'moon.png' },
        { word: 'Mouse', ar_word: 'فأر', img: '🐭', imagePath: 'mouse.png' },
        { word: 'Milk', ar_word: 'حليب', img: '🥛', imagePath: 'milk.png' },
        { word: 'Mushroom', ar_word: 'فطر', img: '🍄', imagePath: 'mushroom.png' },
        { word: 'Magnet', ar_word: 'مغناطيس', img: '🧲', imagePath: 'magnet.png' }
      ] 
    },
    { 
      letter: 'N', ar_letter: 'إن', 
      words: [
        { word: 'Nest', ar_word: 'عش', img: '🪹', imagePath: 'nest.png' },
        { word: 'Nose', ar_word: 'أنف', img: '👃', imagePath: 'nose.png' },
        { word: 'Nut', ar_word: 'بندقة', img: '🥜', imagePath: 'nut.png' },
        { word: 'Net', ar_word: 'شبكة', img: '🥅', imagePath: 'net.png' },
        { word: 'Ninja', ar_word: 'نينجا', img: '🥷', imagePath: 'ninja.png' },
        { word: 'Notebook', ar_word: 'دفتر', img: '📓' }
      ] 
    },
    { 
      letter: 'O', ar_letter: 'أو', 
      words: [
        { word: 'Orange', ar_word: 'برتقالة', img: '🍊', imagePath: 'orange.png' },
        { word: 'Owl', ar_word: 'بومة', img: '🦉', imagePath: 'owl.png' },
        { word: 'Onion', ar_word: 'بصلة', img: '🧅', imagePath: 'onion.png' },
        { word: 'Octopus', ar_word: 'أخطبوط', img: '🐙', imagePath: 'octopus.png' },
        { word: 'Ocean', ar_word: 'محيط', img: '🌊', imagePath: 'ocean.png' },
        { word: 'Otter', ar_word: 'ثعلب الماء', img: '🦦' }
      ] 
    },
    { 
      letter: 'P', ar_letter: 'بي', 
      words: [
        { word: 'Pig', ar_word: 'خنزير', img: '🐷', imagePath: 'pig.png' },
        { word: 'Pen', ar_word: 'قلم', img: '🖊️' },
        { word: 'Panda', ar_word: 'باندا', img: '🐼', imagePath: 'panda.png' },
        { word: 'Pizza', ar_word: 'بيتزا', img: '🍕', imagePath: 'pizza.png' },
        { word: 'Penguin', ar_word: 'بطريق', img: '🐧', imagePath: 'penguin.png' },
        { word: 'Piano', ar_word: 'بيانو', img: '🎹' }
      ] 
    },
    { 
      letter: 'Q', ar_letter: 'كيو', 
      words: [
        { word: 'Queen', ar_word: 'ملكة', img: '👑', imagePath: 'queen.png' },
        { word: 'Question', ar_word: 'سؤال', img: '❓' },
        { word: 'Quilt', ar_word: 'لحاف', img: '🛌', imagePath: 'quilt.png' },
        { word: 'Quail', ar_word: 'طائر السمان', img: '🐦', imagePath: 'quail.png' },
        { word: 'Quarter', ar_word: 'ربع دولار', img: '🪙', imagePath: 'quarter.png' },
        { word: 'Quiet', ar_word: 'هدوء', img: '🤫' }
      ] 
    },
    { 
      letter: 'R', ar_letter: 'آر', 
      words: [
        { word: 'Rabbit', ar_word: 'أرنب', img: '🐇', imagePath: 'rabbit.png' },
        { word: 'Ring', ar_word: 'خاتم', img: '💍', imagePath: 'ring.png' },
        { word: 'Rose', ar_word: 'وردة', img: '🌹', imagePath: 'rose.png' },
        { word: 'Robot', ar_word: 'روبوت', img: '🤖', imagePath: 'robot.png' },
        { word: 'Rocket', ar_word: 'صاروخ', img: '🚀', imagePath: 'rocket.png' },
        { word: 'Rain', ar_word: 'مطر', img: '🌧️' }
      ] 
    },
    { 
      letter: 'S', ar_letter: 'إس', 
      words: [
        { word: 'Sun', ar_word: 'شمس', img: '☀️', imagePath: 'sun.png' },
        { word: 'Star', ar_word: 'نجمة', img: '⭐', imagePath: 'star.png' },
        { word: 'Snake', ar_word: 'ثعبان', img: '🐍', imagePath: 'snake.png' },
        { word: 'Spider', ar_word: 'عنكبوت', img: '🕷️', imagePath: 'spider.png' },
        { word: 'Strawberry', ar_word: 'فراولة', img: '🍓', imagePath: 'strawberry.png' },
        { word: 'Shoes', ar_word: 'حذاء', img: '👟' }
      ] 
    },
    { 
      letter: 'T', ar_letter: 'تي', 
      words: [
        { word: 'Tree', ar_word: 'شجرة', img: '🌳', imagePath: 'tree.png' },
        { word: 'Train', ar_word: 'قطار', img: '🚂', imagePath: 'train.png' },
        { word: 'Tiger', ar_word: 'نمر', img: '🐅', imagePath: 'tiger.png' },
        { word: 'Turtle', ar_word: 'سلحفاة', img: '🐢', imagePath: 'turtle.png' },
        { word: 'Tomato', ar_word: 'طماطم', img: '🍅', imagePath: 'tomato.png' },
        { word: 'Tent', ar_word: 'خيمة', img: '⛺', imagePath: 'tent.png' }
      ] 
    },
    { 
      letter: 'U', ar_letter: 'يو', 
      words: [
        { word: 'Umbrella', ar_word: 'مظلة', img: '☂️', imagePath: 'umbrella.png' },
        { word: 'Unicorn', ar_word: 'وحيد القرن', img: '🦄', imagePath: 'unicorn.png' },
        { word: 'Up', ar_word: 'أعلى', img: '⬆️', imagePath: 'up.png' },
        { word: 'UFO', ar_word: 'طبق طائر', img: '🛸', imagePath: 'ufo.png' },
        { word: 'Uniform', ar_word: 'زي موحد', img: '🥼', imagePath: 'uniform.png' },
        { word: 'Unlock', ar_word: 'فتح', img: '🔓' }
      ] 
    },
    { 
      letter: 'V', ar_letter: 'في', 
      words: [
        { word: 'Van', ar_word: 'شاحنة', img: '🚐', imagePath: 'van.png' },
        { word: 'Violin', ar_word: 'كمان', img: '🎻', imagePath: 'violin.png' },
        { word: 'Volcano', ar_word: 'بركان', img: '🌋', imagePath: 'volcano.png' },
        { word: 'Vegetable', ar_word: 'خضار', img: '🥗' },
        { word: 'Vampire', ar_word: 'مصاص دماء', img: '🧛' },
        { word: 'Video', ar_word: 'فيديو', img: '🎬' }
      ] 
    },
    { 
      letter: 'W', ar_letter: 'دبليو', 
      words: [
        { word: 'Watermelon', ar_word: 'بطيخ', img: '🍉', imagePath: 'watermelon.png' },
        { word: 'Wolf', ar_word: 'ذئب', img: '🐺', imagePath: 'wolf.png' },
        { word: 'Whale', ar_word: 'حوت', img: '🐳', imagePath: 'whale.png' },
        { word: 'Watch', ar_word: 'ساعة', img: '⌚' },
        { word: 'Window', ar_word: 'نافذة', img: '🪟', imagePath: 'window.png' },
        { word: 'Wheel', ar_word: 'عجلة', img: '🛞', imagePath: 'wheel.png' }
      ] 
    },
    { 
      letter: 'X', ar_letter: 'إكس', 
      words: [
        { word: 'Xylophone', ar_word: 'إكسيليفون', img: '🎶', imagePath: 'xylophone.png' },
        { word: 'X-ray', ar_word: 'أشعة سينية', img: '🩻', imagePath: 'xray.png' },
        { word: 'Fox', ar_word: 'ثعلب (ينتهي بـ X)', img: '🦊', imagePath: 'fox.png' },
        { word: 'Box', ar_word: 'صندوق (ينتهي بـ X)', img: '📦', imagePath: 'box.png' },
        { word: 'Six', ar_word: 'ستة (ينتهي بـ X)', img: '6️⃣', imagePath: 'six.png' },
        { word: 'Mix', ar_word: 'يخلط (ينتهي بـ X)', img: '🥣' }
      ] 
    },
    { 
      letter: 'Y', ar_letter: 'واي', 
      words: [
        { word: 'Yacht', ar_word: 'يخت', img: '🛥️', imagePath: 'yacht.png' },
        { word: 'Yellow', ar_word: 'أصفر', img: '🟨', imagePath: 'yellow.png' },
        { word: 'Yo-yo', ar_word: 'لعبة اليويو', img: '🪀', imagePath: 'yoyo.png' },
        { word: 'Yogurt', ar_word: 'زبادي', img: '🍦', imagePath: 'yogurt.png' },
        { word: 'Yarn', ar_word: 'خيوط الغزل', img: '🧶', imagePath: 'yarn.png' },
        { word: 'Yawn', ar_word: 'تثاؤب', img: '🥱' }
      ] 
    },
    { 
      letter: 'Z', ar_letter: 'زد', 
      words: [
        { word: 'Zebra', ar_word: 'حمار وحشي', img: '🦓', imagePath: 'zebra.png' },
        { word: 'Zoo', ar_word: 'حديقة حيوان', img: '🐘', imagePath: 'zoo.png' },
        { word: 'Zero', ar_word: 'صفر', img: '0️⃣', imagePath: 'zero.png' },
        { word: 'Zipper', ar_word: 'سحاب', img: '🤐', imagePath: 'zipper.png' },
        { word: 'Zigzag', ar_word: 'متعرج', img: '〰️', imagePath: 'zigzag.png' },
        { word: 'Zombie', ar_word: 'زومبي', img: '🧟' }
      ] 
    }
  ];


  countArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  save() {
    try {
      const unlockedStickers = this.stickersData().filter(s => s.unlocked).map(s => s.id);
      localStorage.setItem('abc-kids-progress', JSON.stringify({ 
        learned: [...this.learned()],
        passedLessons: [...this.passedLessons()],
        stars: this.stars(), 
        unlockedStickers,
        childName: this.childName(),
        streak: this.streak(),
        lastLoginDate: this.lastLoginDate()
      }));
    } catch { /* ignore */ }
  }

  imgUrl(e: string): string {
    const cps = [...e].map(c => c.codePointAt(0)!.toString(16)).filter(h => h !== 'fe0f' || e.includes('\u200d'));
    return 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/' + cps.join('-') + '.svg';
  }
  markFailed(e: string) { this.failed.update(s => new Set(s).add(e)); }
}
