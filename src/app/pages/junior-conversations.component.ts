import { Component, signal, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Timers } from './game-utils';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

export interface DialogueLine {
  speaker: string;
  text: string;
  ar: string;
  isUser?: boolean;
  audio: string;
}

export interface KeyVocabItem {
  word: string;
  ar: string;
  phonetic: string;
}

export interface ConversationScenario {
  id: string;
  title: string;
  ar_title: string;
  icon: string;
  desc: string;
  dialogue: DialogueLine[];
  keyVocab: KeyVocabItem[];
  grammarTip: { title: string; explanation: string; example: string };
}

@Component({
  selector: 'app-junior-conversations',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-white rounded-3xl p-5 md:p-8 shadow-xl border-4 border-teal-300 max-w-5xl mx-auto font-[Fredoka]" dir="ltr">
      <!-- Section Header -->
      <div class="text-center mb-6 md:mb-8">
        <div class="inline-flex items-center gap-2 bg-teal-100 text-teal-800 px-4 py-1.5 rounded-full font-black text-sm mb-3">
          <span>🌟</span> Teenagers & Adults Mode (مستوى الناشئين والمحادثة الذكية)
        </div>
        <h2 class="text-3xl md:text-5xl font-black text-teal-700 mb-2">Real-Life English Mastery</h2>
        <p class="text-gray-500 font-bold text-base md:text-lg">Master natural conversations with clear male & female studio voices, vocabulary, and grammar!</p>
      </div>

      <!-- Scenarios Horizontal Selector -->
      <div class="flex gap-3 overflow-x-auto pb-4 mb-6 md:mb-8 no-scrollbar">
        @for (sc of scenarios; track sc.id) {
          <button (click)="selectScenario(sc)"
                  class="flex-shrink-0 px-4 md:px-5 py-3 rounded-2xl border-2 flex items-center gap-3 transition-all hover:scale-105 active:scale-95 text-left"
                  [class]="activeScenario().id === sc.id ? 'bg-teal-600 text-white border-teal-700 shadow-lg' : 'bg-teal-50 text-teal-900 border-teal-200 hover:bg-teal-100'">
            <span class="text-3xl">{{ sc.icon }}</span>
            <div>
              <div class="font-black text-sm md:text-base leading-tight">{{ sc.title }}</div>
              <div class="text-xs opacity-80 mt-0.5" dir="rtl">{{ sc.ar_title }}</div>
            </div>
          </button>
        }
      </div>

      <!-- Main Scenario View -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Dialogue Column (2 Cols) -->
        <div class="lg:col-span-2 bg-gradient-to-br from-teal-50 via-white to-sky-50 rounded-3xl p-5 md:p-6 border-3 border-teal-200 shadow-sm flex flex-col justify-between">
          <div>
            <!-- Header inside Dialogue Card -->
            <div class="flex items-center justify-between mb-5 pb-3 border-b border-teal-100">
              <div>
                <h3 class="text-2xl font-black text-teal-900 flex items-center gap-2">
                  <span>{{ activeScenario().icon }}</span>
                  <span>{{ activeScenario().title }}</span>
                </h3>
                <p class="text-xs md:text-sm font-bold text-gray-500 mt-0.5">{{ activeScenario().desc }}</p>
              </div>

              <!-- Play All / Stop Button -->
              <button (click)="playAllDialogue()"
                      class="text-white font-black px-4 py-2 rounded-xl flex items-center gap-2 shadow text-sm transition-transform active:scale-95 cursor-pointer"
                      [class]="isPlayingAll() ? 'bg-rose-500 hover:bg-rose-600' : 'bg-teal-500 hover:bg-teal-600'">
                @if (isPlayingAll()) {
                  <span>⏹️ Stop</span>
                } @else {
                  <span>▶️ Play All</span>
                }
              </button>
            </div>

            <!-- Chat Bubbles -->
            <div class="space-y-4 max-h-[500px] overflow-y-auto pr-2 pb-2">
              @for (line of activeScenario().dialogue; track $index) {
                <div class="flex flex-col cursor-pointer transition-all hover:scale-[1.01]"
                     [class]="line.isUser ? 'items-end' : 'items-start'"
                     (click)="playLine(line, $index)">
                  <!-- Speaker Tag -->
                  <div class="flex items-center gap-1.5 text-xs font-black mb-1 px-1"
                       [class]="line.isUser ? 'text-teal-700' : 'text-slate-600'">
                    @if (line.isUser) {
                      <span>👩‍🎓 {{ line.speaker }} (You)</span>
                    } @else {
                      <span>👨‍💼 {{ line.speaker }}</span>
                    }
                    @if (currentPlayingIndex() === $index) {
                      <span class="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    }
                  </div>

                  <!-- Bubble -->
                  <div class="p-4 rounded-3xl max-w-[88%] shadow-sm border transition-all"
                       [class.ring-4]="currentPlayingIndex() === $index"
                       [class.ring-teal-400]="currentPlayingIndex() === $index"
                       [class]="line.isUser ? 'bg-teal-600 text-white border-teal-700 rounded-tr-none' : 'bg-white text-gray-900 border-teal-200 rounded-tl-none'">
                    <div class="flex items-start justify-between gap-3">
                      <div class="font-black text-base md:text-lg leading-snug">{{ line.text }}</div>
                      <span class="text-xs opacity-70 mt-1 flex-shrink-0">🔊</span>
                    </div>
                    <div class="text-sm mt-1.5 opacity-90 font-bold"
                         [class]="line.isUser ? 'text-teal-100' : 'text-teal-800'"
                         dir="rtl">
                      {{ line.ar }}
                    </div>
                  </div>
                </div>
              }
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-teal-100 text-center text-xs font-bold text-gray-400">
            💡 اضغط على أي جملة للاستماع إليها بصوت الأستاذ (رجل) أو المتعلمة (فتاة) بنطق استوديو احترافي.
          </div>
        </div>

        <!-- Sidebar: Key Vocabulary & Grammar Nugget (1 Col) -->
        <div class="space-y-6">
          <!-- Key Vocabulary List (Redesigned with vertical layout and no slashes) -->
          <div class="bg-sky-50 rounded-3xl p-5 border-3 border-sky-200 shadow-sm">
            <div class="flex items-center justify-between mb-3">
              <div class="flex items-center gap-2 text-sky-800 font-black text-lg">
                <span>📖</span> Key Vocabulary
              </div>
              <span class="text-xs font-bold text-sky-600 bg-sky-100 px-2 py-0.5 rounded-full">اضغط للنطق</span>
            </div>

            <div class="space-y-2.5">
              @for (v of activeScenario().keyVocab; track v.word) {
                <div (click)="playVocab(v)"
                     class="bg-white p-3.5 rounded-2xl border border-sky-100 flex items-center justify-between hover:bg-sky-100/60 hover:border-sky-300 cursor-pointer transition-all shadow-xs active:scale-95 group">
                  <div class="flex items-center gap-2">
                    <span class="font-black text-sky-950 text-base leading-tight">{{ v.word }}</span>
                    <span class="text-xs text-sky-400 group-hover:text-sky-600 transition-colors">🔊</span>
                  </div>
                  <!-- Translation on the right -->
                  <span class="text-sm font-bold text-gray-700 text-right pr-1" dir="rtl">{{ v.ar }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Grammar Tip -->
          <div class="bg-amber-50 rounded-3xl p-5 border-3 border-amber-200 shadow-sm">
            <div class="flex items-center gap-2 text-amber-800 font-black text-lg mb-2">
              <span>💡</span> Grammar Rule (قاعدة الدرس)
            </div>
            <h4 class="font-black text-amber-950 text-base mb-1.5">{{ activeScenario().grammarTip.title }}</h4>
            <p class="text-xs md:text-sm text-amber-900 font-bold mb-3 leading-relaxed" dir="rtl">
              {{ activeScenario().grammarTip.explanation }}
            </p>
            <div class="bg-white p-3 rounded-2xl border border-amber-200 text-xs font-bold text-amber-950 flex items-center justify-between gap-2 cursor-pointer hover:bg-amber-100/50 transition-colors"
                 (click)="playExample(activeScenario().grammarTip.example)">
              <span>✨ Example: {{ activeScenario().grammarTip.example }}</span>
              <span class="text-amber-600">🔊</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class JuniorConversationsComponent implements OnDestroy {
  private timers = new Timers();
  ngOnDestroy() {
    this.timers.clearAll();
    this.audio.stopAll();
  }

  data = inject(DataService);
  audio = inject(AudioService);

  isPlayingAll = signal(false);
  currentPlayingIndex = signal<number | null>(null);

  scenarios: ConversationScenario[] = [
    {
      id: 'restaurant',
      title: 'At the Restaurant',
      ar_title: 'في المطعم وتناول الطعام',
      icon: '🍽️',
      desc: 'Ordering food, drinks, and politely asking for the check.',
      dialogue: [
        { speaker: 'Waiter', text: 'Hello! Are you ready to order?', ar: 'مرحباً! هل أنت جاهز للطلب؟', audio: 'assets/audio/conversations/restaurant_0_waiter.mp3' },
        { speaker: 'You', text: 'Yes, please. I would like the chicken pasta.', ar: 'نعم من فضلك، أود مكرونة الدجاج.', isUser: true, audio: 'assets/audio/conversations/restaurant_1_you.mp3' },
        { speaker: 'Waiter', text: 'Great choice! Anything to drink?', ar: 'اختيار رائع! أي شيء للشرب؟', audio: 'assets/audio/conversations/restaurant_2_waiter.mp3' },
        { speaker: 'You', text: 'Just a glass of orange juice with ice, please.', ar: 'فقط كوب عصير برتقال مع ثلج من فضلك.', isUser: true, audio: 'assets/audio/conversations/restaurant_3_you.mp3' },
        { speaker: 'Waiter', text: 'Coming right up! Enjoy your meal.', ar: 'قادم فوراً! استمتع بوجبتك.', audio: 'assets/audio/conversations/restaurant_4_waiter.mp3' },
        { speaker: 'You', text: 'Excuse me, could we have the bill, please?', ar: 'عفواً، هل يمكننا الحصول على الفاتورة من فضلك؟', isUser: true, audio: 'assets/audio/conversations/restaurant_5_you.mp3' }
      ],
      keyVocab: [
        { word: 'Order', ar: 'يطلب طعاماً', phonetic: 'ˈɔːrdər' },
        { word: 'Would like', ar: 'أود أو أرغب في', phonetic: 'wʊd laɪk' },
        { word: 'Delicious', ar: 'لذيذ المذاق', phonetic: 'dɪˈlɪʃəs' },
        { word: 'The bill', ar: 'فاتورة الحساب', phonetic: 'ðə bɪl' }
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
        { speaker: 'Officer', text: 'May I see your passport and ticket?', ar: 'هل يمكنني رؤية جواز سفرك وتذكرتك؟', audio: 'assets/audio/conversations/airport_0_officer.mp3' },
        { speaker: 'You', text: 'Here they are, sir.', ar: 'تفضل، ها هما يا سيدي.', isUser: true, audio: 'assets/audio/conversations/airport_1_you.mp3' },
        { speaker: 'Officer', text: 'Do you have any luggage to check in?', ar: 'هل لديك أي حقائب لتسجيلها؟', audio: 'assets/audio/conversations/airport_2_officer.mp3' },
        { speaker: 'You', text: 'Yes, just this suitcase and a backpack.', ar: 'نعم، حقيبة السفر هذه وحقيبة ظهر فقط.', isUser: true, audio: 'assets/audio/conversations/airport_3_you.mp3' },
        { speaker: 'Officer', text: 'Here is your boarding pass. Gate 12.', ar: 'تفضل بطاقة الصعود للطائرة. البوابة 12.', audio: 'assets/audio/conversations/airport_4_officer.mp3' },
        { speaker: 'You', text: 'Thank you so much! Have a great flight!', ar: 'شكراً جزيلاً! رحلة ممتعة!', isUser: true, audio: 'assets/audio/conversations/airport_5_you.mp3' }
      ],
      keyVocab: [
        { word: 'Passport', ar: 'جواز السفر', phonetic: 'ˈpæspɔːrt' },
        { word: 'Boarding pass', ar: 'بطاقة صعود الطائرة', phonetic: 'ˈbɔːrdɪŋ pæs' },
        { word: 'Luggage', ar: 'حقائب السفر', phonetic: 'ˈlʌɡɪdʒ' },
        { word: 'Gate', ar: 'بوابة المغادرة', phonetic: 'ɡeɪt' }
      ],
      grammarTip: {
        title: 'Modal Verbs: "May I...?"',
        explanation: 'تستخدم "May I" للسؤال وطلب الإذن بأعلى درجات الرسمية والاحترام.',
        example: 'May I ask you a question?'
      }
    },
    {
      id: 'hotel',
      title: 'Hotel Check-in',
      ar_title: 'في الفندق وحجز الغرفة',
      icon: '🏨',
      desc: 'Checking into a hotel room, asking about services and Wi-Fi.',
      dialogue: [
        { speaker: 'Receptionist', text: 'Good evening! How can I help you tonight?', ar: 'مساء الخير! كيف يمكنني مساعدتك الليلة؟', audio: 'assets/audio/conversations/hotel_0_receptionist.mp3' },
        { speaker: 'You', text: 'Hello, I have a reservation under the name Adam.', ar: 'مرحباً، لدي حجز باسم آدم.', isUser: true, audio: 'assets/audio/conversations/hotel_1_you.mp3' },
        { speaker: 'Receptionist', text: 'Welcome! You booked a deluxe room for three nights.', ar: 'أهلاً بك! لقد حجزت غرفة ديلوكس لثلاث ليالٍ.', audio: 'assets/audio/conversations/hotel_2_receptionist.mp3' },
        { speaker: 'You', text: 'That is correct. Is breakfast included?', ar: 'هذا صحيح. هل الإفطار مشمول؟', isUser: true, audio: 'assets/audio/conversations/hotel_3_you.mp3' },
        { speaker: 'Receptionist', text: 'Yes, breakfast is served from 7 to 10 in the morning.', ar: 'نعم، يُقدم الإفطار من الساعة 7 حتى 10 صباحاً.', audio: 'assets/audio/conversations/hotel_4_receptionist.mp3' },
        { speaker: 'You', text: 'Wonderful! What is the Wi-Fi password, please?', ar: 'رائع جداً! ما هي كلمة سر الواي فاي من فضلك؟', isUser: true, audio: 'assets/audio/conversations/hotel_5_you.mp3' }
      ],
      keyVocab: [
        { word: 'Reservation', ar: 'حجز فندقي مسبق', phonetic: 'ˌrezərˈveɪʃn' },
        { word: 'Deluxe room', ar: 'غرفة فاخرة', phonetic: 'dɪˈlʌks ruːm' },
        { word: 'Breakfast', ar: 'وجبة الإفطار', phonetic: 'ˈbrekfəst' },
        { word: 'Password', ar: 'كلمة المرور', phonetic: 'ˈpæswɜːrd' }
      ],
      grammarTip: {
        title: 'Passive Voice: "Breakfast is served"',
        explanation: 'نستخدم المبني للمجهول للإشارة إلى الخدمات المقدمة في الفنادق والمطاعم دون ذكر الفاعل.',
        example: 'Dinner is served at 8 PM.'
      }
    },
    {
      id: 'shopping',
      title: 'Shopping for Clothes',
      ar_title: 'التسوق وشراء الملابس',
      icon: '🛍️',
      desc: 'Asking about sizes, colors, and prices in a clothing store.',
      dialogue: [
        { speaker: 'Assistant', text: 'Can I help you find anything today?', ar: 'هل يمكنني مساعدتك في العثور على أي شيء اليوم؟', audio: 'assets/audio/conversations/shopping_0_assistant.mp3' },
        { speaker: 'You', text: 'Yes, I am looking for a blue jacket.', ar: 'نعم، أنا أبحث عن سترة زرقاء.', isUser: true, audio: 'assets/audio/conversations/shopping_1_you.mp3' },
        { speaker: 'Assistant', text: 'What size do you wear? Medium or Large?', ar: 'ما هو مقاسك؟ متوسط أم كبير؟', audio: 'assets/audio/conversations/shopping_2_assistant.mp3' },
        { speaker: 'You', text: 'Medium, please. Can I try it on?', ar: 'متوسط من فضلك. هل يمكنني قياسها وتجربتها؟', isUser: true, audio: 'assets/audio/conversations/shopping_3_you.mp3' },
        { speaker: 'Assistant', text: 'Of course! The fitting rooms are right over there.', ar: 'بالتأكيد! غرف القياس هناك تماماً.', audio: 'assets/audio/conversations/shopping_4_assistant.mp3' },
        { speaker: 'You', text: 'It fits perfectly! How much is it?', ar: 'إنها تناسبني تماماً! كم سعرها؟', isUser: true, audio: 'assets/audio/conversations/shopping_5_you.mp3' }
      ],
      keyVocab: [
        { word: 'Fitting room', ar: 'غرفة تبديل الملابس', phonetic: 'ˈfɪtɪŋ ruːm' },
        { word: 'Size', ar: 'المقاس والحجم', phonetic: 'saɪz' },
        { word: 'Looking for', ar: 'يبحث عن', phonetic: 'ˈlʊkɪŋ fɔːr' },
        { word: 'Discount', ar: 'خصم وتخفيض مالي', phonetic: 'ˈdɪskaʊnt' }
      ],
      grammarTip: {
        title: 'Present Continuous for Searches: "I am looking for"',
        explanation: 'نستخدم زمن المضارع المستمر للتعبير عما تبحث عنه في اللحظة الحالية: am/is/are + verb-ing.',
        example: 'I am looking for a blue shirt.'
      }
    },
    {
      id: 'coffee_shop',
      title: 'At the Coffee Shop',
      ar_title: 'في المقهى وطلب المشروبات',
      icon: '☕',
      desc: 'Ordering customized coffee, snacks, and paying by card.',
      dialogue: [
        { speaker: 'Barista', text: 'Hi there! What can I get started for you?', ar: 'أهلاً بك! ماذا تود أن تطلب اليوم؟', audio: 'assets/audio/conversations/coffee_shop_0_barista.mp3' },
        { speaker: 'You', text: 'Could I get a large iced caramel latte?', ar: 'هل يمكنني الحصول على لاتيه كراميل مثلج كبير؟', isUser: true, audio: 'assets/audio/conversations/coffee_shop_1_you.mp3' },
        { speaker: 'Barista', text: 'Sure thing! Whole milk or oat milk?', ar: 'بالتأكيد! حليب كامل الدسم أم حليب شوفان؟', audio: 'assets/audio/conversations/coffee_shop_2_barista.mp3' },
        { speaker: 'You', text: 'Oat milk with less sugar, please.', ar: 'حليب شوفان مع سكر قليل من فضلك.', isUser: true, audio: 'assets/audio/conversations/coffee_shop_3_you.mp3' },
        { speaker: 'Barista', text: 'Would you like a warm chocolate muffin with that?', ar: 'هل تحب مافن شوكولاتة دافئ مع الطلب؟', audio: 'assets/audio/conversations/coffee_shop_4_barista.mp3' },
        { speaker: 'You', text: 'Yes, that sounds delicious! Can I pay by card?', ar: 'نعم، هذا يبدو لذيذاً! هل يمكنني الدفع بالبطاقة؟', isUser: true, audio: 'assets/audio/conversations/coffee_shop_5_you.mp3' }
      ],
      keyVocab: [
        { word: 'Iced latte', ar: 'قهوة لاتيه مثلجة', phonetic: 'aɪst ˈlɑːteɪ' },
        { word: 'Oat milk', ar: 'حليب الشوفان النباتي', phonetic: 'oʊt mɪlk' },
        { word: 'Less sugar', ar: 'سكر أقل', phonetic: 'les ˈʃʊɡər' },
        { word: 'Pay by card', ar: 'الدفع ببطاقة البنك', phonetic: 'peɪ baɪ kɑːrd' }
      ],
      grammarTip: {
        title: 'Polite Ordering with "Could I get...?"',
        explanation: 'تعتبر صيغة "Could I get...?" الأسلوب اليومي الأكثر انتشاراً وأدباً لطلب المشروبات والمأكولات.',
        example: 'Could I get a bottle of water, please?'
      }
    },
    {
      id: 'doctor',
      title: 'At the Clinic',
      ar_title: 'عند الطبيب وشرح الأعراض',
      icon: '🩺',
      desc: 'Explaining health symptoms, pain, and understanding medical advice.',
      dialogue: [
        { speaker: 'Doctor', text: 'Hello! What seems to be the problem today?', ar: 'مرحباً! ما هي المشكلة أو الأعراض التي تشعر بها اليوم؟', audio: 'assets/audio/conversations/doctor_0_doctor.mp3' },
        { speaker: 'You', text: 'I have a sore throat and a high fever.', ar: 'أعاني من احتقان في الحلق وحمى وارتفاع في الحرارة.', isUser: true, audio: 'assets/audio/conversations/doctor_1_you.mp3' },
        { speaker: 'Doctor', text: 'How long have you felt like this?', ar: 'منذ متى وأنت تشعر بهذه الأعراض؟', audio: 'assets/audio/conversations/doctor_2_doctor.mp3' },
        { speaker: 'You', text: 'Since yesterday morning, and I also have a cough.', ar: 'منذ صباح أمس، ولدي أيضاً سعال.', isUser: true, audio: 'assets/audio/conversations/doctor_3_you.mp3' },
        { speaker: 'Doctor', text: 'Take this medicine twice a day and drink plenty of water.', ar: 'تناول هذا الدواء مرتين يومياً واشرب الكثير من الماء.', audio: 'assets/audio/conversations/doctor_4_doctor.mp3' },
        { speaker: 'You', text: 'Thank you doctor, I will rest well.', ar: 'شكراً دكتور، سآخذ قسطاً كافياً من الراحة.', isUser: true, audio: 'assets/audio/conversations/doctor_5_you.mp3' }
      ],
      keyVocab: [
        { word: 'Sore throat', ar: 'احتقان وألم الحلق', phonetic: 'sɔːr θroʊt' },
        { word: 'Fever', ar: 'حمى وارتفاع حرارة', phonetic: 'ˈfiːvər' },
        { word: 'Medicine', ar: 'الدواء والعلاج', phonetic: 'ˈmedɪsn' },
        { word: 'Rest', ar: 'راحة ونوم كافٍ', phonetic: 'rest' }
      ],
      grammarTip: {
        title: 'Present Perfect for Duration: "How long have you felt...?"',
        explanation: 'نستخدم المضارع التام مع (have/has + past participle) للسؤال عن مدة استمرار حالة أو شعور حتى الحاضر.',
        example: 'How long have you had this headache?'
      }
    },
    {
      id: 'directions',
      title: 'Asking for Directions',
      ar_title: 'السؤال عن الأماكن والاتجاهات',
      icon: '🗺️',
      desc: 'How to navigate a new city and ask locals for help.',
      dialogue: [
        { speaker: 'You', text: 'Excuse me, where is the nearest train station?', ar: 'معذرة، أين أقرب محطة قطار؟', isUser: true, audio: 'assets/audio/conversations/directions_0_you.mp3' },
        { speaker: 'Local', text: 'Go straight ahead for two blocks, then turn left.', ar: 'امشِ للأمام مباشرة لمسافة شارعين، ثم انعطف يساراً.', audio: 'assets/audio/conversations/directions_1_local.mp3' },
        { speaker: 'You', text: 'Is it far to walk from here?', ar: 'هل هي بعيدة للمشي على الأقدام من هنا؟', isUser: true, audio: 'assets/audio/conversations/directions_2_you.mp3' },
        { speaker: 'Local', text: 'No, it takes about five minutes. It is next to the bank.', ar: 'لا، تستغرق حوالي خمس دقائق فقط. إنها بجانب البنك.', audio: 'assets/audio/conversations/directions_3_local.mp3' },
        { speaker: 'You', text: 'Should I turn right at the traffic lights?', ar: 'هل أنعطف يميناً عند إشارة المرور؟', isUser: true, audio: 'assets/audio/conversations/directions_4_you.mp3' },
        { speaker: 'Local', text: 'Yes, exactly! You cannot miss it.', ar: 'نعم بالضبط! لن تخطئها أبداً.', audio: 'assets/audio/conversations/directions_5_local.mp3' }
      ],
      keyVocab: [
        { word: 'Straight ahead', ar: 'للأمام مباشرة', phonetic: 'streɪt əˈhed' },
        { word: 'Turn left', ar: 'انعطف يساراً', phonetic: 'tɜːrn left' },
        { word: 'Turn right', ar: 'انعطف يميناً', phonetic: 'tɜːrn raɪt' },
        { word: 'Next to', ar: 'بجانب أو بجوار', phonetic: 'nekst tuː' },
        { word: 'Near', ar: 'قريب المسافة', phonetic: 'nɪər' },
        { word: 'Far', ar: 'بعيد المسافة', phonetic: 'fɑːr' }
      ],
      grammarTip: {
        title: 'Imperatives for Giving Directions',
        explanation: 'في إعطاء الاتجاهات نستخدم الفعل بصيغة الأمر المباشرة دون فاعل: Go, Turn, Walk, Stop.',
        example: 'Turn right at the supermarket.'
      }
    },
    {
      id: 'job_interview',
      title: 'Job Interview & Skills',
      ar_title: 'التعارف ومقابلة العمل',
      icon: '💼',
      desc: 'Introducing your skills, strengths, and professional ambitions.',
      dialogue: [
        { speaker: 'Interviewer', text: 'Welcome! Tell me a little about yourself.', ar: 'أهلاً بك! أخبرني قليلاً عن نفسك.', audio: 'assets/audio/conversations/job_interview_0_interviewer.mp3' },
        { speaker: 'You', text: 'I have two years of experience in computer science and design.', ar: 'لدي سنتان من الخبرة في علوم الحاسوب والتصميم.', isUser: true, audio: 'assets/audio/conversations/job_interview_1_you.mp3' },
        { speaker: 'Interviewer', text: 'That sounds great! What are your greatest strengths?', ar: 'هذا رائع! ما هي أبرز نقاط قوتك؟', audio: 'assets/audio/conversations/job_interview_2_interviewer.mp3' },
        { speaker: 'You', text: 'I am hardworking, creative, and I love teamwork.', ar: 'أنا شخص مجتهد ومبدع وأحب العمل الجماعي.', isUser: true, audio: 'assets/audio/conversations/job_interview_3_you.mp3' },
        { speaker: 'Interviewer', text: 'Why would you like to work with our team?', ar: 'لماذا ترغب في العمل مع فريقنا؟', audio: 'assets/audio/conversations/job_interview_4_interviewer.mp3' },
        { speaker: 'You', text: 'Because your company builds great projects that help people.', ar: 'لأن شركتكم تبني مشاريع رائعة تساعد الناس.', isUser: true, audio: 'assets/audio/conversations/job_interview_5_you.mp3' }
      ],
      keyVocab: [
        { word: 'Experience', ar: 'الخبرة العملية', phonetic: 'ɪkˈspɪriəns' },
        { word: 'Strengths', ar: 'نقاط القوة والميزات', phonetic: 'streŋkθs' },
        { word: 'Teamwork', ar: 'روح العمل الجماعي', phonetic: 'ˈtiːmwɜːrk' },
        { word: 'Hardworking', ar: 'مجتهد ومثابر', phonetic: 'ˌhɑːrdˈwɜːrkɪŋ' }
      ],
      grammarTip: {
        title: 'Talking About Skills: "I have experience in..."',
        explanation: 'نستخدم "I have experience in" متبوعة بمجال التخصص أو المهارة للحديث بثقة واحترافية.',
        example: 'I have experience in web design.'
      }
    }
  ];

  activeScenario = signal<ConversationScenario>(this.scenarios[0]);

  selectScenario(sc: ConversationScenario) {
    if (this.isPlayingAll()) {
      this.isPlayingAll.set(false);
      this.currentPlayingIndex.set(null);
      this.audio.stopAll();
    }
    this.activeScenario.set(sc);
    this.audio.playSoundEffect('pop');
  }

  playLine(line: DialogueLine, index: number) {
    if (this.isPlayingAll()) {
      this.isPlayingAll.set(false);
    }
    this.currentPlayingIndex.set(index);
    this.audio.playAudioFile(line.audio, line.text);
  }

  playVocab(v: KeyVocabItem) {
    const clean = v.word.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 45);
    this.audio.playAudioFile(`assets/audio/words/${clean}.mp3`, v.word);
  }

  playExample(sentence: string) {
    this.audio.speak(sentence, 'en-US');
  }

  async playAllDialogue() {
    if (this.isPlayingAll()) {
      this.isPlayingAll.set(false);
      this.currentPlayingIndex.set(null);
      this.audio.stopAll();
      return;
    }

    this.isPlayingAll.set(true);
    const list = this.activeScenario().dialogue;
    for (let i = 0; i < list.length; i++) {
      if (!this.isPlayingAll()) break;
      this.currentPlayingIndex.set(i);
      const line = list[i];
      await this.audio.playFileAsync(line.audio, line.text);
      if (!this.isPlayingAll()) break;
      await new Promise<void>(resolve => this.timers.after(resolve, 600));
    }

    this.currentPlayingIndex.set(null);
    this.isPlayingAll.set(false);
  }
}
