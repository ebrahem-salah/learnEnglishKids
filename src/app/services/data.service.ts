import { Injectable, signal } from '@angular/core';
import { AlphabetItem, Sticker, ExtraCategory, Song, Phrase, ShortStory } from './audio.service';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  learned = signal<Set<string>>(new Set());
  stars = signal(10);
  failed = signal<Set<string>>(new Set());

  // User Profile
  childName = signal<string>('');
  streak = signal(0);
  lastLoginDate = signal<string>('');

  // Current text to trace (letter or word)
  tracingText = signal<string>('A');

  stickersData = signal<Sticker[]>([
    { id: 'st1', name: 'كأس البطل', img: '🏆', cost: 5, unlocked: false },
    { id: 'st2', name: 'الصاروخ الذهبي', img: '🚀', cost: 10, unlocked: false },
    { id: 'st3', name: 'تاج الملك', img: '👑', cost: 15, unlocked: false },
    { id: 'st4', name: 'وحيد القرن', img: '🦄', cost: 20, unlocked: false },
    { id: 'st5', name: 'الفرس اللطيف', img: '🐬', cost: 25, unlocked: false },
    { id: 'st6', name: 'وسام الشرف', img: '🎖️', cost: 30, unlocked: false }
  ]);

  readonly phrasesData: Phrase[] = [
    { en: 'Hello! How are you?', ar: 'مرحباً! كيف حالك؟', context: 'التحية', icon: '👋' },
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
      pages: [
        { en: 'Leo is a little lion.', ar: 'ليو هو أسد صغير.', img: '🦁' },
        { en: 'Leo likes to play in the sun.', ar: 'يحب ليو اللعب في الشمس.', img: '☀️' },
        { en: 'Leo made a new rabbit friend!', ar: 'صادق ليو أرنباً جديداً!', img: '🐰' }
      ]
    },
    {
      title: 'The Space Rocket',
      ar_title: 'صاروخ الفضاء',
      icon: '🚀',
      pages: [
        { en: 'The rocket goes up!', ar: 'الصاروخ ينطلق للأعلى!', img: '🚀' },
        { en: 'It reaches the moon.', ar: 'يصل إلى القمر.', img: '🌙' },
        { en: 'The stars are shining bright.', ar: 'النجوم تلمع ببريق.', img: '⭐' }
      ]
    },
    {
      title: 'A Day at the Farm',
      ar_title: 'يوم في المزرعة',
      icon: '🚜',
      pages: [
        { en: 'The sun rises on the farm.', ar: 'تشرق الشمس في المزرعة.', img: '🌅' },
        { en: 'The cow says moo.', ar: 'البقرة تقول موو.', img: '🐄' },
        { en: 'The duck swims in the pond.', ar: 'البطة تسبح في البركة.', img: '🦆' },
        { en: 'The horse runs fast.', ar: 'الحصان يركض بسرعة.', img: '🐎' }
      ]
    },
    {
      title: 'Going to School',
      ar_title: 'الذهاب إلى المدرسة',
      icon: '🏫',
      pages: [
        { en: 'Sara wakes up early.', ar: 'تستيقظ سارة مبكراً.', img: '⏰' },
        { en: 'She eats her breakfast.', ar: 'تتناول فطورها.', img: '🥣' },
        { en: 'She takes her yellow bus.', ar: 'تستقل حافلتها الصفراء.', img: '🚌' },
        { en: 'Sara loves reading books.', ar: 'سارة تحب قراءة الكتب.', img: '📚' }
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
        { en: 'Lion', ar: 'أسد', img: '🦁', realImg: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300&auto=format&fit=crop', soundEffect: 'roar' },
        { en: 'Elephant', ar: 'فيل', img: '🐘', realImg: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=300&auto=format&fit=crop', soundEffect: 'trumpet' },
        { en: 'Cat', ar: 'قطة', img: '🐱', realImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop', soundEffect: 'meow' },
        { en: 'Dog', ar: 'كلب', img: '🐶', realImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop', soundEffect: 'bark' },
        { en: 'Bird', ar: 'طائر', img: '🐦', realImg: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=300&auto=format&fit=crop', soundEffect: 'tweet' },
        { en: 'Frog', ar: 'ضفدع', img: '🐸', realImg: 'https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=300&auto=format&fit=crop', soundEffect: 'croak' },
        { en: 'Tiger', ar: 'نمر', img: '🐅', realImg: 'https://images.unsplash.com/photo-1561731216-c3a4d99437d5?w=300&auto=format&fit=crop', soundEffect: 'roar' },
        { en: 'Monkey', ar: 'قرد', img: '🐒', realImg: 'https://images.unsplash.com/photo-1540573133985-78164d64a234?w=300&auto=format&fit=crop' },
        { en: 'Giraffe', ar: 'زرافة', img: '🦒', realImg: 'https://images.unsplash.com/photo-1547721064-da6cfb341d50?w=300&auto=format&fit=crop' },
        { en: 'Dolphin', ar: 'دلفين', img: '🐬', realImg: 'https://images.unsplash.com/photo-1607153333879-c174d261b141?w=300&auto=format&fit=crop' },
        { en: 'Horse', ar: 'حصان', img: '🐎', realImg: 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?w=300&auto=format&fit=crop' },
        { en: 'Cow', ar: 'بقرة', img: '🐄', realImg: 'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=300&auto=format&fit=crop' },
        { en: 'Sheep', ar: 'خروف', img: '🐑', realImg: 'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?w=300&auto=format&fit=crop' },
        { en: 'Rabbit', ar: 'أرنب', img: '🐇', realImg: 'https://images.unsplash.com/photo-1585110396000-c9fd4e4e11fd?w=300&auto=format&fit=crop' },
        { en: 'Bear', ar: 'دب', img: '🐻', realImg: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=300&auto=format&fit=crop' }
      ]
    },
    {
      id: 'food',
      title: 'الأطعمة والوجبات (Food & Meals)',
      icon: '🍕',
      items: [
        { en: 'Pizza', ar: 'بيتزا', img: '🍕', realImg: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop' },
        { en: 'Burger', ar: 'برجر', img: '🍔', realImg: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop' },
        { en: 'Cake', ar: 'كعكة', img: '🍰', realImg: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop' },
        { en: 'Bread', ar: 'خبز', img: '🍞', realImg: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop' },
        { en: 'Cheese', ar: 'جبن', img: '🧀', realImg: 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=300&auto=format&fit=crop' },
        { en: 'Popcorn', ar: 'فشار', img: '🍿', realImg: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=300&auto=format&fit=crop' },
        { en: 'Soup', ar: 'حساء / شوربة', img: '🥣', realImg: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=300&auto=format&fit=crop' },
        { en: 'Sandwich', ar: 'شطيرة', img: '🥪', realImg: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=300&auto=format&fit=crop' },
        { en: 'Rice', ar: 'أرز', img: '🍚', realImg: 'https://images.unsplash.com/photo-1536304929831-ee1ca9d44906?w=300&auto=format&fit=crop' },
        { en: 'Egg', ar: 'بيضة', img: '🍳', realImg: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=300&auto=format&fit=crop' }
      ]
    },
    {
      id: 'fruits',
      title: 'الفواكه الخفيفة (Fresh Fruits)',
      icon: '🍎',
      items: [
        { en: 'Apple', ar: 'تفاحة', img: '🍎', realImg: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop' },
        { en: 'Banana', ar: 'موز', img: '🍌', realImg: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop' },
        { en: 'Orange', ar: 'برتقال', img: '🍊', realImg: 'https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?w=300&auto=format&fit=crop' },
        { en: 'Strawberry', ar: 'فراولة', img: '🍓', realImg: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=300&auto=format&fit=crop' },
        { en: 'Watermelon', ar: 'بطيخ', img: '🍉', realImg: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=300&auto=format&fit=crop' },
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
        { en: 'Tomato', ar: 'طماطم', img: '🍅', realImg: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=300&auto=format&fit=crop' },
        { en: 'Cucumber', ar: 'خيار', img: '🥒', realImg: 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=300&auto=format&fit=crop' },
        { en: 'Broccoli', ar: 'بروكلي', img: '🥦', realImg: 'https://images.unsplash.com/photo-1459411621453-7b03977f4bfc?w=300&auto=format&fit=crop' },
        { en: 'Corn', ar: 'ذرة', img: '🌽', realImg: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=300&auto=format&fit=crop' },
        { en: 'Potato', ar: 'بطاطس', img: '🥔', realImg: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=300&auto=format&fit=crop' },
        { en: 'Onion', ar: 'بصل', img: '🧅', realImg: 'https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=300&auto=format&fit=crop' },
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
        { en: 'Milk', ar: 'حليب', img: '🥛', realImg: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=300&auto=format&fit=crop' },
        { en: 'Water', ar: 'ماء', img: '💧', realImg: 'https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop' },
        { en: 'Juice', ar: 'عصير', img: '🧃', realImg: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&auto=format&fit=crop' },
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
        { en: 'Door', ar: 'باب', img: '🚪', realImg: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=300&auto=format&fit=crop' },
        { en: 'Chair', ar: 'كرسي', img: '🪑', realImg: 'https://images.unsplash.com/photo-1580481072645-022f9a6d8310?w=300&auto=format&fit=crop' },
        { en: 'Table', ar: 'طاولة / تربيزة', img: '🪵', realImg: 'https://images.unsplash.com/photo-1530018607912-eff2daa1bac4?w=300&auto=format&fit=crop' },
        { en: 'Window', ar: 'شباك / نافذة', img: '🪟', realImg: 'https://images.unsplash.com/photo-1509644851169-2acc08aa25b5?w=300&auto=format&fit=crop' },
        { en: 'Book', ar: 'كتاب', img: '📖', realImg: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=300&auto=format&fit=crop' },
        { en: 'Pencil', ar: 'قلم رصاص', img: '✏️', realImg: 'https://images.unsplash.com/photo-1585336261026-8f5786372966?w=300&auto=format&fit=crop' },
        { en: 'Bag / Backpack', ar: 'حقيبة مدرسية', img: '🎒', realImg: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&auto=format&fit=crop' },
        { en: 'Clock / Watch', ar: 'ساعة حائط', img: '⏰', realImg: 'https://images.unsplash.com/photo-1563861826100-9cb868fdbe1c?w=300&auto=format&fit=crop' },
        { en: 'Bed', ar: 'سرير', img: '🛏️', realImg: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=300&auto=format&fit=crop' },
        { en: 'Lamp', ar: 'مصباح', img: '💡', realImg: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&auto=format&fit=crop' }
      ]
    },
    {
      id: 'vehicles',
      title: 'وسائل المواصلات (Vehicles)',
      icon: '🚗',
      items: [
        { en: 'Car', ar: 'سيارة', img: '🚗', realImg: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&auto=format&fit=crop', soundEffect: 'vroom' },
        { en: 'Airplane', ar: 'طائرة', img: '✈️', realImg: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&auto=format&fit=crop', soundEffect: 'jet' },
        { en: 'Train', ar: 'قطار', img: '🚂', realImg: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=300&auto=format&fit=crop', soundEffect: 'choo' },
        { en: 'Bus', ar: 'حافلة', img: '🚌', realImg: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&auto=format&fit=crop', soundEffect: 'horn' },
        { en: 'Rocket', ar: 'صاروخ', img: '🚀', realImg: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=300&auto=format&fit=crop', soundEffect: 'blast' },
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
        { en: 'Yellow', ar: 'أصفر', img: '🟡', realImg: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=300&auto=format&fit=crop' },
        { en: 'Orange', ar: 'برتقالي', img: '🟠', realImg: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300&auto=format&fit=crop' },
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
        { en: 'Hat', ar: 'قبعة', img: '🧢', realImg: 'https://images.unsplash.com/photo-1521369909029-2afed882ba28?w=300&auto=format&fit=crop' },
        { en: 'Jacket', ar: 'سترة', img: '🧥', realImg: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&auto=format&fit=crop' },
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
        { word: 'Apple', ar_word: 'تفاحة', img: '🍎', realImg: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop' },
        { word: 'Ant', ar_word: 'نملة', img: '🐜' },
        { word: 'Arm', ar_word: 'ذراع', img: '💪' },
        { word: 'Alligator', ar_word: 'تمساح', img: '🐊' },
        { word: 'Arrow', ar_word: 'سهم', img: '🏹' },
        { word: 'Axe', ar_word: 'فأس', img: '🪓' }
      ] 
    },
    { 
      letter: 'B', ar_letter: 'بي', 
      words: [
        { word: 'Ball', ar_word: 'كرة', img: '⚽', realImg: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=300&auto=format&fit=crop' },
        { word: 'Bear', ar_word: 'دب', img: '🐻' },
        { word: 'Book', ar_word: 'كتاب', img: '📖' },
        { word: 'Banana', ar_word: 'موزة', img: '🍌' },
        { word: 'Bird', ar_word: 'طائر', img: '🐦' },
        { word: 'Bus', ar_word: 'حافلة', img: '🚌' }
      ] 
    },
    { 
      letter: 'C', ar_letter: 'سي', 
      words: [
        { word: 'Cat', ar_word: 'قطة', img: '🐈', realImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop' },
        { word: 'Car', ar_word: 'سيارة', img: '🚗' },
        { word: 'Cow', ar_word: 'بقرة', img: '🐄' },
        { word: 'Cake', ar_word: 'كعكة', img: '🍰' },
        { word: 'Camel', ar_word: 'جمل', img: '🐪' },
        { word: 'Crown', ar_word: 'تاج', img: '👑' }
      ] 
    },
    { 
      letter: 'D', ar_letter: 'دي', 
      words: [
        { word: 'Dog', ar_word: 'كلب', img: '🐕', realImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop' },
        { word: 'Duck', ar_word: 'بطة', img: '🦆' },
        { word: 'Door', ar_word: 'باب', img: '🚪' },
        { word: 'Dolphin', ar_word: 'دلفين', img: '🐬' },
        { word: 'Drum', ar_word: 'طبلة', img: '🥁' },
        { word: 'Dress', ar_word: 'فستان', img: '👗' }
      ] 
    },
    { 
      letter: 'E', ar_letter: 'إي', 
      words: [
        { word: 'Elephant', ar_word: 'فيل', img: '🐘', realImg: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=300&auto=format&fit=crop' },
        { word: 'Egg', ar_word: 'بيضة', img: '🥚' },
        { word: 'Eye', ar_word: 'عين', img: '👁️' },
        { word: 'Ear', ar_word: 'أذن', img: '👂' },
        { word: 'Earth', ar_word: 'الأرض', img: '🌍' },
        { word: 'Eagle', ar_word: 'نسر', img: '🦅' }
      ] 
    },
    { 
      letter: 'F', ar_letter: 'إف', 
      words: [
        { word: 'Fish', ar_word: 'سمكة', img: '🐟' },
        { word: 'Frog', ar_word: 'ضفدع', img: '🐸' },
        { word: 'Flower', ar_word: 'زهرة', img: '🌸' },
        { word: 'Fire', ar_word: 'نار', img: '🔥' },
        { word: 'Fox', ar_word: 'ثعلب', img: '🦊' },
        { word: 'Foot', ar_word: 'قدم', img: '🦶' }
      ] 
    },
    { 
      letter: 'G', ar_letter: 'جي', 
      words: [
        { word: 'Goat', ar_word: 'ماعز', img: '🐐' },
        { word: 'Giraffe', ar_word: 'زرافة', img: '🦒' },
        { word: 'Grape', ar_word: 'عنب', img: '🍇' },
        { word: 'Gift', ar_word: 'هدية', img: '🎁' },
        { word: 'Guitar', ar_word: 'جيتار', img: '🎸' },
        { word: 'Ghost', ar_word: 'شبح', img: '👻' }
      ] 
    },
    { 
      letter: 'H', ar_letter: 'إتش', 
      words: [
        { word: 'Hat', ar_word: 'قبعة', img: '🎩' },
        { word: 'Horse', ar_word: 'حصان', img: '🐎' },
        { word: 'Hand', ar_word: 'يد', img: '✋' },
        { word: 'House', ar_word: 'منزل', img: '🏠' },
        { word: 'Heart', ar_word: 'قلب', img: '❤️' },
        { word: 'Helicopter', ar_word: 'مروحية', img: '🚁' }
      ] 
    },
    { 
      letter: 'I', ar_letter: 'آي', 
      words: [
        { word: 'Ice cream', ar_word: 'آيس كريم', img: '🍦' },
        { word: 'Island', ar_word: 'جزيرة', img: '🏝️' },
        { word: 'Ice', ar_word: 'ثلج', img: '🧊' },
        { word: 'Iguana', ar_word: 'إغوانة', img: '🦎' },
        { word: 'Insect', ar_word: 'حشرة', img: '🐛' },
        { word: 'Igloo', ar_word: 'كوخ ثلجي', img: '🛖' }
      ] 
    },
    { 
      letter: 'J', ar_letter: 'جيه', 
      words: [
        { word: 'Juice', ar_word: 'عصير', img: '🧃' },
        { word: 'Jacket', ar_word: 'سترة', img: '🧥' },
        { word: 'Jellyfish', ar_word: 'قنديل البحر', img: '🪼' },
        { word: 'Jeep', ar_word: 'سيارة جيب', img: '🚙' },
        { word: 'Jam', ar_word: 'مربى', img: '🍯' },
        { word: 'Jump', ar_word: 'قفز', img: '🤸' }
      ] 
    },
    { 
      letter: 'K', ar_letter: 'كيه', 
      words: [
        { word: 'Kite', ar_word: 'طائرة ورقية', img: '🪁' },
        { word: 'Key', ar_word: 'مفتاح', img: '🔑' },
        { word: 'Kangaroo', ar_word: 'كنغر', img: '🦘' },
        { word: 'King', ar_word: 'ملك', img: '🤴' },
        { word: 'Keyboard', ar_word: 'لوحة مفاتيح', img: '⌨️' },
        { word: 'Koala', ar_word: 'كوالا', img: '🐨' }
      ] 
    },
    { 
      letter: 'L', ar_letter: 'إل', 
      words: [
        { word: 'Lion', ar_word: 'أسد', img: '🦁' },
        { word: 'Lemon', ar_word: 'ليمون', img: '🍋' },
        { word: 'Leaf', ar_word: 'ورقة شجر', img: '🍃' },
        { word: 'Lamp', ar_word: 'مصباح', img: '💡' },
        { word: 'Lock', ar_word: 'قفل', img: '🔒' },
        { word: 'Ladybug', ar_word: 'دعسوقة', img: '🐞' }
      ] 
    },
    { 
      letter: 'M', ar_letter: 'إم', 
      words: [
        { word: 'Monkey', ar_word: 'قرد', img: '🐒' },
        { word: 'Moon', ar_word: 'قمر', img: '🌙' },
        { word: 'Mouse', ar_word: 'فأر', img: '🐭' },
        { word: 'Milk', ar_word: 'حليب', img: '🥛' },
        { word: 'Mushroom', ar_word: 'فطر', img: '🍄' },
        { word: 'Magnet', ar_word: 'مغناطيس', img: '🧲' }
      ] 
    },
    { 
      letter: 'N', ar_letter: 'إن', 
      words: [
        { word: 'Nest', ar_word: 'عش', img: '🪹' },
        { word: 'Nose', ar_word: 'أنف', img: '👃' },
        { word: 'Nut', ar_word: 'بندقة', img: '🥜' },
        { word: 'Net', ar_word: 'شبكة', img: '🥅' },
        { word: 'Ninja', ar_word: 'نينجا', img: '🥷' },
        { word: 'Notebook', ar_word: 'دفتر', img: '📓' }
      ] 
    },
    { 
      letter: 'O', ar_letter: 'أو', 
      words: [
        { word: 'Orange', ar_word: 'برتقالة', img: '🍊' },
        { word: 'Owl', ar_word: 'بومة', img: '🦉' },
        { word: 'Onion', ar_word: 'بصلة', img: '🧅' },
        { word: 'Octopus', ar_word: 'أخطبوط', img: '🐙' },
        { word: 'Ocean', ar_word: 'محيط', img: '🌊' },
        { word: 'Otter', ar_word: 'ثعلب الماء', img: '🦦' }
      ] 
    },
    { 
      letter: 'P', ar_letter: 'بي', 
      words: [
        { word: 'Pig', ar_word: 'خنزير', img: '🐷' },
        { word: 'Pen', ar_word: 'قلم', img: '🖊️' },
        { word: 'Panda', ar_word: 'باندا', img: '🐼' },
        { word: 'Pizza', ar_word: 'بيتزا', img: '🍕' },
        { word: 'Penguin', ar_word: 'بطريق', img: '🐧' },
        { word: 'Piano', ar_word: 'بيانو', img: '🎹' }
      ] 
    },
    { 
      letter: 'Q', ar_letter: 'كيو', 
      words: [
        { word: 'Queen', ar_word: 'ملكة', img: '👑' },
        { word: 'Question', ar_word: 'سؤال', img: '❓' },
        { word: 'Quilt', ar_word: 'لحاف', img: '🛌' },
        { word: 'Quail', ar_word: 'طائر السمان', img: '🐦' },
        { word: 'Quarter', ar_word: 'ربع دولار', img: '🪙' },
        { word: 'Quiet', ar_word: 'هدوء', img: '🤫' }
      ] 
    },
    { 
      letter: 'R', ar_letter: 'آر', 
      words: [
        { word: 'Rabbit', ar_word: 'أرنب', img: '🐇' },
        { word: 'Ring', ar_word: 'خاتم', img: '💍' },
        { word: 'Rose', ar_word: 'وردة', img: '🌹' },
        { word: 'Robot', ar_word: 'روبوت', img: '🤖' },
        { word: 'Rocket', ar_word: 'صاروخ', img: '🚀' },
        { word: 'Rain', ar_word: 'مطر', img: '🌧️' }
      ] 
    },
    { 
      letter: 'S', ar_letter: 'إس', 
      words: [
        { word: 'Sun', ar_word: 'شمس', img: '☀️' },
        { word: 'Star', ar_word: 'نجمة', img: '⭐' },
        { word: 'Snake', ar_word: 'ثعبان', img: '🐍' },
        { word: 'Spider', ar_word: 'عنكبوت', img: '🕷️' },
        { word: 'Strawberry', ar_word: 'فراولة', img: '🍓' },
        { word: 'Shoes', ar_word: 'حذاء', img: '👟' }
      ] 
    },
    { 
      letter: 'T', ar_letter: 'تي', 
      words: [
        { word: 'Tree', ar_word: 'شجرة', img: '🌳' },
        { word: 'Train', ar_word: 'قطار', img: '🚂' },
        { word: 'Tiger', ar_word: 'نمر', img: '🐅' },
        { word: 'Turtle', ar_word: 'سلحفاة', img: '🐢' },
        { word: 'Tomato', ar_word: 'طماطم', img: '🍅' },
        { word: 'Tent', ar_word: 'خيمة', img: '⛺' }
      ] 
    },
    { 
      letter: 'U', ar_letter: 'يو', 
      words: [
        { word: 'Umbrella', ar_word: 'مظلة', img: '☂️' },
        { word: 'Unicorn', ar_word: 'وحيد القرن', img: '🦄' },
        { word: 'Up', ar_word: 'أعلى', img: '⬆️' },
        { word: 'UFO', ar_word: 'طبق طائر', img: '🛸' },
        { word: 'Uniform', ar_word: 'زي موحد', img: '🥼' },
        { word: 'Unlock', ar_word: 'فتح', img: '🔓' }
      ] 
    },
    { 
      letter: 'V', ar_letter: 'في', 
      words: [
        { word: 'Van', ar_word: 'شاحنة', img: '🚐' },
        { word: 'Violin', ar_word: 'كمان', img: '🎻' },
        { word: 'Volcano', ar_word: 'بركان', img: '🌋' },
        { word: 'Vegetable', ar_word: 'خضار', img: '🥗' },
        { word: 'Vampire', ar_word: 'مصاص دماء', img: '🧛' },
        { word: 'Video', ar_word: 'فيديو', img: '🎬' }
      ] 
    },
    { 
      letter: 'W', ar_letter: 'دبليو', 
      words: [
        { word: 'Watermelon', ar_word: 'بطيخ', img: '🍉' },
        { word: 'Wolf', ar_word: 'ذئب', img: '🐺' },
        { word: 'Whale', ar_word: 'حوت', img: '🐳' },
        { word: 'Watch', ar_word: 'ساعة', img: '⌚' },
        { word: 'Window', ar_word: 'نافذة', img: '🪟' },
        { word: 'Wheel', ar_word: 'عجلة', img: '🛞' }
      ] 
    },
    { 
      letter: 'X', ar_letter: 'إكس', 
      words: [
        { word: 'Xylophone', ar_word: 'إكسيليفون', img: '🎶' },
        { word: 'X-ray', ar_word: 'أشعة سينية', img: '🩻' },
        { word: 'Fox', ar_word: 'ثعلب (ينتهي بـ X)', img: '🦊' },
        { word: 'Box', ar_word: 'صندوق (ينتهي بـ X)', img: '📦' },
        { word: 'Six', ar_word: 'ستة (ينتهي بـ X)', img: '6️⃣' },
        { word: 'Mix', ar_word: 'يخلط (ينتهي بـ X)', img: '🥣' }
      ] 
    },
    { 
      letter: 'Y', ar_letter: 'واي', 
      words: [
        { word: 'Yacht', ar_word: 'يخت', img: '🛥️' },
        { word: 'Yellow', ar_word: 'أصفر', img: '🟨' },
        { word: 'Yo-yo', ar_word: 'لعبة اليويو', img: '🪀' },
        { word: 'Yogurt', ar_word: 'زبادي', img: '🍦' },
        { word: 'Yarn', ar_word: 'خيوط الغزل', img: '🧶' },
        { word: 'Yawn', ar_word: 'تثاؤب', img: '🥱' }
      ] 
    },
    { 
      letter: 'Z', ar_letter: 'زد', 
      words: [
        { word: 'Zebra', ar_word: 'حمار وحشي', img: '🦓' },
        { word: 'Zoo', ar_word: 'حديقة حيوان', img: '🐘' },
        { word: 'Zero', ar_word: 'صفر', img: '0️⃣' },
        { word: 'Zipper', ar_word: 'سحاب', img: '🤐' },
        { word: 'Zigzag', ar_word: 'متعرج', img: '〰️' },
        { word: 'Zombie', ar_word: 'زومبي', img: '🧟' }
      ] 
    }
  ];

  constructor() {
    try {
      const s = JSON.parse(localStorage.getItem('abc-kids-progress') || '{}');
      this.learned.set(new Set(s.learned || []));
      this.stars.set(s.stars !== undefined ? s.stars : 10);
      this.childName.set(s.childName || '');
      this.streak.set(s.streak || 0);
      this.lastLoginDate.set(s.lastLoginDate || '');
      
      if (s.unlockedStickers) {
        this.stickersData.update(list => list.map(st => ({ ...st, unlocked: s.unlockedStickers.includes(st.id) })));
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
        this.streak.set(1); // reset streak if missed a day
      } else {
        this.streak.set(1); // first day
      }
      this.lastLoginDate.set(today);
      this.save();
    }
  }

  countArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  save() {
    try {
      const unlockedStickers = this.stickersData().filter(s => s.unlocked).map(s => s.id);
      localStorage.setItem('abc-kids-progress', JSON.stringify({ 
        learned: [...this.learned()], 
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
