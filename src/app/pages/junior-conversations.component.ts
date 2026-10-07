import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

interface ConversationScenario {
  id: string;
  title: string;
  ar_title: string;
  icon: string;
  desc: string;
  dialogue: { speaker: string; text: string; ar: string; isUser?: boolean }[];
  keyVocab: { word: string; ar: string; phonetic: string }[];
  grammarTip: { title: string; explanation: string; example: string };
}

@Component({
  selector: 'app-junior-conversations',
  standalone: true,
  template: `
    <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-teal-300 max-w-5xl mx-auto font-[Bubblegum]" dir="ltr">
      <!-- Section Header -->
      <div class="text-center mb-8">
        <div class="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-4 py-1.5 rounded-full font-black text-sm mb-3">
          <span>🌟</span> Teenagers & Adults Mode (مستوى الناشئين والكبار)
        </div>
        <h2 class="text-3xl md:text-5xl font-black text-teal-700 mb-2">Real-Life English Mastery</h2>
        <p class="text-gray-500 font-bold text-lg">Master natural conversations, daily scenarios, and grammar rules!</p>
      </div>

      <!-- Scenarios Horizontal Selector -->
      <div class="flex gap-3 overflow-x-auto pb-4 mb-8 no-scrollbar">
        @for (sc of scenarios; track sc.id) {
          <button (click)="selectScenario(sc)"
                  class="flex-shrink-0 px-5 py-3 rounded-2xl border-3 flex items-center gap-3 transition-all hover:scale-105 active:scale-95"
                  [class]="activeScenario().id === sc.id ? 'bg-teal-600 text-white border-teal-700 shadow-lg' : 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100'">
            <span class="text-3xl">{{ sc.icon }}</span>
            <div class="text-left">
              <div class="font-black text-base">{{ sc.title }}</div>
              <div class="text-xs opacity-80" dir="rtl">{{ sc.ar_title }}</div>
            </div>
          </button>
        }
      </div>

      <!-- Main Scenario View -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Dialogue Column (2 Cols) -->
        <div class="lg:col-span-2 bg-gradient-to-br from-teal-50 via-white to-sky-50 rounded-3xl p-6 border-3 border-teal-200 shadow-sm">
          <div class="flex items-center justify-between mb-6 pb-3 border-b border-teal-100">
            <div>
              <h3 class="text-2xl font-black text-teal-900">{{ activeScenario().title }}</h3>
              <p class="text-sm font-bold text-gray-500">{{ activeScenario().desc }}</p>
            </div>
            <button (click)="playAllDialogue()" class="bg-teal-500 hover:bg-teal-600 text-white font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow text-sm transition-transform active:scale-95">
              <span>▶️</span> Play All
            </button>
          </div>

          <!-- Chat Bubbles -->
          <div class="space-y-4 max-h-[460px] overflow-y-auto pr-2">
            @for (line of activeScenario().dialogue; track $index) {
              <div class="flex flex-col cursor-pointer transition-transform hover:scale-[1.02]"
                   [class]="line.isUser ? 'items-end' : 'items-start'"
                   (click)="audio.speak(line.text, 'en-US')">
                <span class="text-xs font-bold text-gray-400 mb-1 px-1">{{ line.speaker }}</span>
                <div class="p-4 rounded-3xl max-w-[85%] shadow-sm border"
                     [class]="line.isUser ? 'bg-teal-600 text-white border-teal-700 rounded-tr-none' : 'bg-white text-gray-900 border-teal-200 rounded-tl-none'">
                  <div class="font-black text-lg leading-snug">{{ line.text }}</div>
                  <div class="text-sm mt-1 opacity-80" [class]="line.isUser ? 'text-teal-100' : 'text-gray-500'" dir="rtl">
                    {{ line.ar }}
                  </div>
                </div>
              </div>
            }
          </div>
        </div>

        <!-- Sidebar: Grammar Nugget & Key Vocabulary (1 Col) -->
        <div class="space-y-6">
          <!-- Grammar Tip -->
          <div class="bg-amber-50 rounded-3xl p-5 border-3 border-amber-200 shadow-sm">
            <div class="flex items-center gap-2 text-amber-800 font-black text-lg mb-2">
              <span>💡</span> Grammar Rule
            </div>
            <h4 class="font-black text-amber-950 text-base mb-1">{{ activeScenario().grammarTip.title }}</h4>
            <p class="text-sm text-amber-900 font-bold mb-3 leading-relaxed" dir="rtl">
              {{ activeScenario().grammarTip.explanation }}
            </p>
            <div class="bg-white p-3 rounded-2xl border border-amber-200 text-xs font-mono text-amber-950 font-bold">
              ✨ Example: {{ activeScenario().grammarTip.example }}
            </div>
          </div>

          <!-- Key Vocabulary List -->
          <div class="bg-sky-50 rounded-3xl p-5 border-3 border-sky-200 shadow-sm">
            <div class="flex items-center gap-2 text-sky-800 font-black text-lg mb-3">
              <span>📖</span> Key Vocabulary
            </div>
            <div class="space-y-2">
              @for (v of activeScenario().keyVocab; track v.word) {
                <div (click)="audio.speak(v.word, 'en-US')"
                     class="bg-white p-2.5 rounded-2xl border border-sky-100 flex items-center justify-between hover:bg-sky-100/50 cursor-pointer transition-colors shadow-xs">
                  <div>
                    <span class="font-black text-sky-950 text-base">{{ v.word }}</span>
                    <span class="text-xs text-sky-500 ml-2 font-mono">/{{ v.phonetic }}/</span>
                  </div>
                  <span class="text-xs font-bold text-gray-500" dir="rtl">{{ v.ar }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JuniorConversationsComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  scenarios: ConversationScenario[] = [
    {
      id: 'restaurant',
      title: 'At the Restaurant',
      ar_title: 'في المطعم وتناول الطعام',
      icon: '🍽️',
      desc: 'Ordering food, drinks, and politely asking for the check.',
      dialogue: [
        { speaker: 'Waiter', text: 'Hello! Are you ready to order?', ar: 'مرحباً! هل أنت جاهز للطلب؟' },
        { speaker: 'You', text: 'Yes, please. I would like the chicken pasta.', ar: 'نعم من فضلك، أود مكرونة الدجاج.', isUser: true },
        { speaker: 'Waiter', text: 'Great choice! Anything to drink?', ar: 'اختيار رائع! أي شيء للشرب؟' },
        { speaker: 'You', text: 'Just a glass of orange juice with ice, please.', ar: 'فقط كوب عصير برتقال مع ثلج من فضلك.', isUser: true },
        { speaker: 'Waiter', text: 'Coming right up! Enjoy your meal.', ar: 'قادم فوراً! استمتع بوجبتك.' },
        { speaker: 'You', text: 'Excuse me, could we have the bill, please?', ar: 'عفواً، هل يمكننا الحصول على الفاتورة من فضلك؟', isUser: true }
      ],
      keyVocab: [
        { word: 'Order', ar: 'يطلب', phonetic: 'ˈɔːrdər' },
        { word: 'Would like', ar: 'يرغب في / يود', phonetic: 'wʊd laɪk' },
        { word: 'Delicious', ar: 'لذيذ', phonetic: 'dɪˈlɪʃəs' },
        { word: 'The bill', ar: 'الفاتورة / الحساب', phonetic: 'ðə bɪl' }
      ],
      grammarTip: {
        title: 'Polite Requests with "Would like"',
        explanation: 'بدلاً من استخدام "I want" وهي أقل لباقة، نستخدم دائماً "I would like" للطلب بأدب واحترام.',
        example: 'I would like a cup of tea, please.'
      }
    },
    {
      id: 'airport',
      title: 'Airport & Travel',
      ar_title: 'في المطار وإجراءات السفر',
      icon: '✈️',
      desc: 'Check-in, boarding gates, and customs conversations.',
      dialogue: [
        { speaker: 'Officer', text: 'May I see your passport and ticket?', ar: 'هل يمكنني رؤية جواز سفرك وتذكرتك؟' },
        { speaker: 'You', text: 'Here they are, sir.', ar: 'تفضل، ها هما يا سيدي.', isUser: true },
        { speaker: 'Officer', text: 'Do you have any luggage to check in?', ar: 'هل لديك أي أمتعة أو حقائب لتسجيلها؟' },
        { speaker: 'You', text: 'Yes, just this one suitcase and a backpack.', ar: 'نعم، هذه الحقيبة الكبيرة وحقيبة ظهر فقط.', isUser: true },
        { speaker: 'Officer', text: 'Here is your boarding pass. Gate 12.', ar: 'تفضل بطاقة الصعود للطائرة. البوابة 12.' },
        { speaker: 'You', text: 'Thank you so much! Have a great flight!', ar: 'شكراً جزيلاً! رحلة ممتعة!', isUser: true }
      ],
      keyVocab: [
        { word: 'Passport', ar: 'جواز سفر', phonetic: 'ˈpæspɔːrt' },
        { word: 'Boarding pass', ar: 'بطاقة صعود الطائرة', phonetic: 'ˈbɔːrdɪŋ pæs' },
        { word: 'Luggage', ar: 'الأمتعة / الحقائب', phonetic: 'ˈlʌɡɪdʒ' },
        { word: 'Gate', ar: 'بوابة المطار', phonetic: 'ɡeɪt' }
      ],
      grammarTip: {
        title: 'Modal Verbs: "May I...?"',
        explanation: 'تستخدم "May I" للسؤال وطلب الإذن بأعلى درجات الرسمية والاحترام.',
        example: 'May I ask you a question?'
      }
    },
    {
      id: 'shopping',
      title: 'Shopping for Clothes',
      ar_title: 'التسوق وشراء الملابس',
      icon: '🛍️',
      desc: 'Asking about sizes, colors, and prices in a clothing store.',
      dialogue: [
        { speaker: 'Assistant', text: 'Can I help you find anything today?', ar: 'هل يمكنني مساعدتك في العثور على أي شيء اليوم؟' },
        { speaker: 'You', text: 'Yes, I am looking for a blue jacket.', ar: 'نعم، أنا أبحث عن سترة زرقاء.', isUser: true },
        { speaker: 'Assistant', text: 'What size do you wear? Medium or Large?', ar: 'ما هو مقاسك؟ متوسط أم كبير؟' },
        { speaker: 'You', text: 'Medium, please. Can I try it on?', ar: 'متوسط من فضلك. هل يمكنني قياسها وتجربتها؟', isUser: true },
        { speaker: 'Assistant', text: 'Of course! The fitting rooms are right over there.', ar: 'بالتأكيد! غرف القياس هناك تماماً.' },
        { speaker: 'You', text: 'It fits perfectly! How much is it?', ar: 'إنها تناسبني تماماً! كم سعرها؟', isUser: true }
      ],
      keyVocab: [
        { word: 'Fitting room', ar: 'غرفة القياس والتبديل', phonetic: 'ˈfɪtɪŋ ruːm' },
        { word: 'Size', ar: 'المقاس / الحجم', phonetic: 'saɪz' },
        { word: 'Looking for', ar: 'يبحث عن', phonetic: 'ˈlʊkɪŋ fɔːr' },
        { word: 'Discount', ar: 'خصم / تخفيض', phonetic: 'ˈdɪskaʊnt' }
      ],
      grammarTip: {
        title: 'Present Continuous for Searches: "I am looking for"',
        explanation: 'نستخدم زمن المضارع المستمر للتعبير عما تبحث عنه في اللحظة الحالية: am/is/are + verb-ing.',
        example: 'I am looking for a blue shirt.'
      }
    },
    {
      id: 'directions',
      title: 'Asking for Directions',
      ar_title: 'السؤال عن الأماكن والاتجاهات',
      icon: '🗺️',
      desc: 'How to navigate a new city and ask locals for help.',
      dialogue: [
        { speaker: 'You', text: 'Excuse me, where is the nearest train station?', ar: 'معذرة، أين أقرب محطة قطار؟', isUser: true },
        { speaker: 'Local', text: 'Go straight ahead for two blocks, then turn left.', ar: 'امشِ للأمام مباشرة لمسافة شارعين، ثم انعطف يساراً.' },
        { speaker: 'You', text: 'Is it far to walk from here?', ar: 'هل هي بعيدة للمشي على الأقدام من هنا؟', isUser: true },
        { speaker: 'Local', text: 'No, it takes about five minutes. It is next to the bank.', ar: 'لا، تستغرق حوالي خمس دقائق فقط. إنها بجانب البنك.' },
        { speaker: 'You', text: 'Thank you very much for your help!', ar: 'شكراً جزيلاً لك على مساعدتك!', isUser: true }
      ],
      keyVocab: [
        { word: 'Straight ahead', ar: 'للأمام مباشرة', phonetic: 'streɪt əˈhed' },
        { word: 'Turn left / right', ar: 'انعطف يساراً / يميناً', phonetic: 'tɜːrn left' },
        { word: 'Next to', ar: 'بجانب / بجوار', phonetic: 'nekst tuː' },
        { word: 'Near / Far', ar: 'قريب / بعيد', phonetic: 'nɪər / fɑːr' }
      ],
      grammarTip: {
        title: 'Imperatives for Directions',
        explanation: 'في إعطاء الاتجاهات نستخدم الفعل المباشر (الأمر): Turn, Go, Walk, Stop.',
        example: 'Turn right at the supermarket.'
      }
    }
  ];

  activeScenario = signal<ConversationScenario>(this.scenarios[0]);

  selectScenario(sc: ConversationScenario) {
    this.activeScenario.set(sc);
    this.audio.playSoundEffect('ding');
  }

  async playAllDialogue() {
    const list = this.activeScenario().dialogue;
    for (const line of list) {
      await new Promise<void>(resolve => {
        this.audio.speak(line.text, 'en-US');
        setTimeout(resolve, 2400);
      });
    }
  }
}
