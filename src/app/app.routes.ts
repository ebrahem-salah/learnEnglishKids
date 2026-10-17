import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: 'alphabet', pathMatch: 'full' },
  {
    path: 'alphabet',
    title: 'تعلم الحروف الإنجليزية والأصوات',
    data: {
      description: 'تعلم الحروف الإنجليزية الـ 26 بالصوت والصورة والنطق الصحيح (Phonics)، مع أمثلة كلمات وصور ثلاثية الأبعاد تفاعلية للأطفال.',
      keywords: 'الحروف الإنجليزية, تعليم الحروف للأطفال, نطق الحروف, الفونكس, English alphabet for kids, phonics'
    },
    loadComponent: () => import('./pages/alphabet.component').then(m => m.AlphabetComponent)
  },
  {
    path: 'lessons',
    title: 'دروس وتمارين الحروف والكلمات',
    data: {
      description: 'دروس تفاعلية ممتعة لتعليم الأطفال قراءة الكلمات الإنجليزية وتمييز الحروف من خلال بطاقات تعليمية وتمارين استماع ذكية.',
      keywords: 'دروس إنجليزي للأطفال, تمارين الحروف, قراءة الكلمات, كورس أطفال مجاني, english lessons for kids'
    },
    loadComponent: () => import('./pages/lessons.component').then(m => m.LessonsComponent)
  },
  {
    path: 'games',
    title: 'ألعاب ذكاء وتعليم تفاعلية للأطفال',
    data: {
      description: 'أكثر من 20 لعبة تفاعلية مسلية لتنمية ذكاء الطفل: تهجئة الكلمات، تصنيف الفواكه والحيوانات، سباق السيارات، مطابقة الظلال والبالونات.',
      keywords: 'ألعاب أطفال تعليمية, ألعاب ذكاء أطفال, لعبة تهجئة الكلمات, ألعاب حروف, educational games for kids'
    },
    loadComponent: () => import('./pages/games.component').then(m => m.GamesComponent)
  },
  {
    path: 'numbers',
    title: 'تعليم الأرقام والعد والحساب',
    data: {
      description: 'تعلّم الأرقام الإنجليزية والعربية والعد والحساب البسيط للأطفال مع ألعاب تفاعلية لجمع التفاح والعد بالأصابع والكرات الملونة.',
      keywords: 'تعليم الأرقام للأطفال, عد الأرقام, حساب أطفال, math for kids, numbers for kids'
    },
    loadComponent: () => import('./pages/numbers.component').then(m => m.NumbersComponent)
  },
  {
    path: 'stories',
    title: 'قصص مصورة ومقروءة للأطفال',
    data: {
      description: 'مكتبة قصص قصيرة مصورة وهادفة للأطفال باللغتين الإنجليزية والعربية مع قراءة صوتية لتعزيز مهارات الاستماع والفهم.',
      keywords: 'قصص أطفال بالإنجليزية, قصص أطفال قبل النوم, قصص مصورة, short stories for kids'
    },
    loadComponent: () => import('./pages/stories.component').then(m => m.StoriesComponent)
  },
  {
    path: 'arabic',
    title: 'تعليم الحروف العربية والحركات',
    data: {
      description: 'تعليم الحروف الهجائية العربية للأطفال مع الحركات (فتحة، ضمة، كسرة) وألعاب تفاعلية لنطق الكلمات وتمييز أصوات الحروف العربية.',
      keywords: 'تعليم الحروف العربية, الحروف الهجائية, حركات الحروف, لغتي الجميلة, arabic alphabet for kids'
    },
    loadComponent: () => import('./pages/arabic.component').then(m => m.ArabicComponent)
  },
  {
    path: 'phrases',
    title: 'محادثات وعبارات يومية بالإنجليزية',
    data: {
      description: 'أهم العبارات والمحادثات اليومية بالإنجليزية للأطفال: التحية، التعارف، المشاعر، والمواقف اليومية مع النطق الصحيح.',
      keywords: 'محادثة إنجليزي للأطفال, جمل إنجليزية يومية, تعلم التحدث بالإنجليزية, daily english phrases'
    },
    loadComponent: () => import('./pages/phrases.component').then(m => m.PhrasesComponent)
  },
  {
    path: 'tracing',
    title: 'رسم وكتابة الحروف للأطفال',
    data: {
      description: 'لعبة تتبع وكتابة الحروف والأرقام باللمس: تعلم الطفل الطريقة الصحيحة لرسم الحروف خطوة بخطوة بطريقة ممتعة.',
      keywords: 'كتابة الحروف, رسم الحروف للأطفال, تتبع الحروف, letter tracing for kids'
    },
    loadComponent: () => import('./pages/tracing.component').then(m => m.TracingComponent)
  },
  {
    path: 'worksheets',
    title: 'أوراق عمل وتمارين قابلة للطباعة',
    data: {
      description: 'أوراق عمل وتمارين تلوين وكتابة الحروف والكلمات جاهزة للطباعة بجودة عالية مجاناً لأولياء الأمور والمعلمين.',
      keywords: 'أوراق عمل أطفال, تلوين حروف, أنشطة أطفال للطباعة, printable worksheets for kids'
    },
    loadComponent: () => import('./pages/worksheets.component').then(m => m.WorksheetsComponent)
  },
  {
    path: 'speech',
    title: 'مدرب النطق ومخارج الحروف',
    data: {
      description: 'مدرب نطق ذكي بالذكاء الاصطناعي يستمع لنطق الطفل للكلمات ويصحح المخارج ويمنحه نجوماً تشجيعية لتحسين لغته.',
      keywords: 'تدريب نطق إنجليزي, تصحيح النطق للأطفال, ذكاء اصطناعي لتعليم النطق, speech coach kids'
    },
    loadComponent: () => import('./pages/speech-coach.component').then(m => m.SpeechCoachComponent)
  },
  {
    path: 'junior',
    title: 'المحادثة الذكية للأطفال',
    data: {
      description: 'تحدث وتفاعل بالصوت مع الذكاء الاصطناعي الصديق للأطفال لتطوير مهارات التحدث والتعبير باللغة الإنجليزية في بيئة آمنة تماماً.',
      keywords: 'محادثة أطفال ذكية, شات تعليمي للأطفال, junior english conversations'
    },
    loadComponent: () => import('./pages/junior-conversations.component').then(m => m.JuniorConversationsComponent)
  },
  {
    path: 'categories',
    title: 'قاموس الكلمات المصورة للأطفال',
    data: {
      description: 'موسوعة كلمات مصورة ومصنفة: الحيوانات، الفواكه والخضروات، الألوان، المركبات، والمهن مع نطق الكلمة بالإنجليزية والعربية.',
      keywords: 'كلمات إنجليزية مصورة, أسماء الحيوانات للأطفال, أسماء الفواكه, kids vocabulary'
    },
    loadComponent: () => import('./pages/categories.component').then(m => m.CategoriesComponent)
  },
  {
    path: 'certificates',
    title: 'شهادات التقدير والإنجاز',
    data: {
      description: 'اطبع شهادة تقدير باسم طفلك مع مستوى إنجازه والنجوم التي حصدها تشجيعاً له على مواصلة التعلم والتميز.',
      keywords: 'شهادة تقدير للأطفال, شهادة تفوق, مكافآت تعليمية, kids certificates'
    },
    loadComponent: () => import('./pages/certificates.component').then(m => m.CertificatesComponent)
  },
  {
    path: 'stickers',
    title: 'لوحة الملصقات والمكافآت',
    data: {
      description: 'متجر الملصقات التعليمية التحفيزية: يجمع الطفل النجوم من خلال التعلم ويستبدلها بملصقات مميزة لشخصيات كرتونية.',
      keywords: 'ملصقات أطفال, تحفيز الأطفال, جوائز تعليمية, sticker album'
    },
    loadComponent: () => import('./pages/stickers.component').then(m => m.StickersComponent)
  },
  {
    path: 'pet',
    title: 'الحيوان الأليف الافتراضي',
    data: {
      description: 'حيوانك الأليف الافتراضي الذي يعتني به الطفل ويكبر معه كلما تعلم وحل المزيد من الدروس والتمارين التعليمية.',
      keywords: 'حيوان أليف افتراضي للأطفال, لعبة رعاية الحيوان, virtual pet kids'
    },
    loadComponent: () => import('./pages/pet.component').then(m => m.PetComponent)
  },
  {
    path: 'missions',
    title: 'المهمات اليومية والتحديات',
    data: {
      description: 'تحديات ومهمات تعليمية يومية تحافظ على حماس الطفل للتعلم المستمر وتمنحه مكافآت ونجوماً إضافية.',
      keywords: 'مهمات يومية للأطفال, تحديات تعليمية, daily learning missions'
    },
    loadComponent: () => import('./pages/missions.component').then(m => m.MissionsComponent)
  },
  {
    path: 'parent',
    title: 'لوحة تحكم ولي الأمر والمتابعة',
    data: {
      description: 'لوحة خاصة بالآباء والأمهات لمتابعة تقدم الطفل في التعلم وعدد الساعات والكلمات المكتسبة والتحكم في إعدادات الصوت.',
      keywords: 'متابعة مستوى الطفل, لوحة تحكم ولي الأمر, parent dashboard'
    },
    loadComponent: () => import('./pages/parent.component').then(m => m.ParentComponent)
  },
  {
    path: 'profiles',
    title: 'ملفات الأطفال والأبطال',
    data: {
      description: 'إدارة ملفات متعددة للأطفال في نفس الأسرة مع حفظ تقدم كل طفل ونجومه ومستواه التعليمي بشكل منفصل.',
      keywords: 'ملف الطفل, حسابات الأطفال, profiles'
    },
    loadComponent: () => import('./pages/profiles.component').then(m => m.ProfilesComponent)
  },
  {
    path: 'privacy',
    title: 'سياسة الخصوصية وحماية بيانات الأطفال',
    data: {
      description: 'التزامنا الكامل بحماية خصوصية الأطفال: لا نقوم بجمع أو مشاركة أي بيانات شخصية، وجميع التسجيلات الصوتية تعالج محلياً على جهازك.',
      keywords: 'سياسة الخصوصية, حماية بيانات الأطفال, COPPA compliance, privacy policy'
    },
    loadComponent: () => import('./pages/privacy.component').then(m => m.PrivacyComponent)
  },
  { path: '**', redirectTo: 'alphabet' }
];
