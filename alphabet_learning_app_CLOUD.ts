import { Component, signal, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

interface WordItem { word: string; ar_word: string; img: string; }
interface AlphabetItem { letter: string; ar_letter: string; words: WordItem[]; }
interface Quiz { idx: number; score: number; answered: string | null; done: boolean; word: WordItem; answer: string; options: string[]; }

@Component({
  selector: 'app-root',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- صورة عالية الجودة (Twemoji SVG) مع رجوع للإيموجي لو فشل التحميل -->
    <ng-template #pic let-e let-cls="cls">
      @if (!failed().has(e)) {
        <img [src]="imgUrl(e)" (error)="markFailed(e)" alt="" loading="lazy" [class]="cls" />
      } @else {
        <span class="text-6xl">{{ e }}</span>
      }
    </ng-template>

    <div class="min-h-screen bg-gradient-to-b from-sky-100 via-blue-50 to-pink-50 p-4 font-sans pb-12" dir="rtl">
      <div class="max-w-6xl mx-auto">

        <header class="text-center py-6 mb-8 bg-white rounded-3xl shadow-md border border-blue-100">
          <h1 class="text-4xl md:text-5xl font-extrabold text-blue-600 mb-2">هيا نتعلم الحروف الإنجليزية 🌈</h1>
          <p class="text-lg text-gray-600 mb-4">اضغط على الحرف لتتعلم كلمات جديدة!</p>
          <div class="max-w-md mx-auto px-6">
            <div class="flex justify-between text-sm font-bold text-gray-600 mb-1">
              <span>تعلمت {{ learned().size }} من 26 حرف</span><span>⭐ {{ stars() }}</span>
            </div>
            <div class="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div class="h-full bg-gradient-to-l from-green-400 to-blue-500 transition-all duration-500" [style.width.%]="learned().size / 26 * 100"></div>
            </div>
          </div>
          <div class="flex flex-wrap justify-center gap-3 mt-5">
            <button (click)="startQuiz()" class="bg-pink-500 text-white px-6 py-2 rounded-full font-bold hover:bg-pink-600 hover:scale-105 transition-all shadow-md">🎮 العب اختبار الحروف</button>
            <button (click)="slow.set(!slow())" class="bg-white border-2 border-blue-300 text-blue-600 px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition-all">
              {{ slow() ? '🐢 نطق بطيء' : '🐇 نطق عادي' }}
            </button>
          </div>
        </header>

        @if (selectedLetter(); as selected) {
          <div class="fixed inset-0 bg-black/60 flex items-start justify-center p-4 z-50 backdrop-blur-sm overflow-y-auto" (click)="closeModal()">
            <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-6xl relative shadow-2xl my-4 md:my-8" (click)="$event.stopPropagation()">
              <button (click)="closeModal()" class="absolute top-4 left-4 w-12 h-12 bg-gray-100 text-gray-600 rounded-full hover:bg-red-100 hover:text-red-500 transition-colors text-xl font-bold">✕</button>

              <div class="text-center bg-blue-50 p-6 rounded-3xl mb-8 border border-blue-100">
                <div class="flex items-center justify-center gap-4 md:gap-10">
                  <button (click)="step(1)" class="w-12 h-12 rounded-full bg-white shadow text-2xl hover:scale-110 transition-all" aria-label="التالي">›</button>
                  <div class="text-7xl md:text-8xl font-black text-blue-500 tracking-tighter">{{ selected.letter }}{{ selected.letter.toLowerCase() }}</div>
                  <button (click)="step(-1)" class="w-12 h-12 rounded-full bg-white shadow text-2xl hover:scale-110 transition-all" aria-label="السابق">‹</button>
                </div>
                <div class="text-2xl font-bold text-gray-700 my-3">يُنطق: {{ selected.ar_letter }}</div>
                <button (click)="playLetter(selected)" [class.animate-pulse]="playing() === 'L' + selected.letter"
                  class="bg-blue-500 text-white px-8 py-3 rounded-full text-xl font-bold hover:bg-blue-600 hover:scale-105 transition-all shadow-lg">
                  🔊 اسمع الحرف
                </button>
              </div>

              <div class="mb-4 text-2xl font-extrabold text-gray-800 border-b-2 border-gray-100 pb-2">كلمات تبدأ بحرف {{ selected.letter }}:</div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (w of selected.words; track w.word) {
                  <div class="bg-green-50 rounded-3xl p-6 text-center border border-green-100 hover:shadow-lg hover:-translate-y-1 transition-all"
                    [class.ring-4]="playing() === 'W' + w.word" [class.ring-green-400]="playing() === 'W' + w.word">
                    <div class="h-28 flex items-center justify-center mb-3">
                      <ng-container *ngTemplateOutlet="pic; context: { $implicit: w.img, cls: 'w-28 h-28 drop-shadow-lg hover:scale-110 transition-transform' }" />
                    </div>
                    <div class="text-3xl font-black text-green-600 mb-1">{{ w.word }}</div>
                    <div class="text-xl font-bold text-gray-600 mb-5">{{ w.ar_word }}</div>
                    <div class="flex gap-2">
                      <button (click)="playWord(w)" class="flex-1 bg-green-500 text-white py-3 rounded-full font-bold hover:bg-green-600 transition-all shadow">🔊 اسمع</button>
                      <button (click)="spellWord(w)" class="bg-white border-2 border-green-400 text-green-600 px-4 py-3 rounded-full font-bold hover:bg-green-100 transition-all">تهجّي</button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        @if (quiz(); as q) {
          <div class="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
            <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg text-center shadow-2xl relative">
              <button (click)="quiz.set(null)" class="absolute top-4 left-4 w-10 h-10 bg-gray-100 rounded-full hover:bg-red-100 font-bold">✕</button>
              @if (!q.done) {
                <div class="text-sm font-bold text-gray-500 mb-2">سؤال {{ q.idx + 1 }} من 10 · ⭐ {{ q.score }}</div>
                <div class="text-xl font-extrabold text-gray-800 mb-3">بأي حرف تبدأ هذه الكلمة؟</div>
                <div class="flex justify-center mb-2">
                  <ng-container *ngTemplateOutlet="pic; context: { $implicit: q.word.img, cls: 'w-36 h-36 drop-shadow-xl' }" />
                </div>
                <button (click)="speak(q.word.word, 'en-US')" class="mb-5 bg-blue-100 text-blue-600 px-5 py-2 rounded-full font-bold hover:bg-blue-200">🔊 اسمع الكلمة</button>
                <div class="grid grid-cols-2 gap-3">
                  @for (o of q.options; track o) {
                    <button (click)="answerQuiz(o)" [disabled]="q.answered !== null"
                      class="text-5xl font-black py-4 rounded-2xl border-4 transition-all"
                      [class]="q.answered === null ? 'border-blue-200 bg-blue-50 text-blue-600 hover:scale-105' :
                        o === q.answer ? 'border-green-500 bg-green-100 text-green-700 scale-105' :
                        o === q.answered ? 'border-red-400 bg-red-100 text-red-600 animate-pulse' : 'border-gray-100 bg-gray-50 text-gray-300'">
                      {{ o }}
                    </button>
                  }
                </div>
              } @else {
                <div class="text-7xl mb-3">{{ q.score >= 8 ? '🏆' : q.score >= 5 ? '🎉' : '💪' }}</div>
                <div class="text-3xl font-extrabold text-blue-600 mb-2">نتيجتك {{ q.score }} من 10</div>
                <p class="text-gray-600 mb-5">{{ q.score >= 8 ? 'ممتاز! أنت بطل الحروف!' : q.score >= 5 ? 'أحسنت! جرب مرة تانية!' : 'مفيش مشكلة، التكرار بيعلّم!' }}</p>
                <button (click)="startQuiz()" class="bg-pink-500 text-white px-8 py-3 rounded-full font-bold text-lg hover:bg-pink-600 shadow-lg">🔁 العب تاني</button>
              }
            </div>
          </div>
        }

        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          @for (item of alphabetData; track item.letter; let i = $index) {
            <div (click)="selectLetter(item)"
              class="bg-white rounded-3xl p-5 flex flex-col items-center cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all border-b-4 group relative"
              [class]="learned().has(item.letter) ? 'border-green-400' : 'border-transparent hover:border-blue-400'">
              @if (learned().has(item.letter)) { <span class="absolute top-2 right-3 text-green-500 font-black">✓</span> }
              <div class="text-6xl font-black mb-2 transition-colors" [class]="colors[i % colors.length]">{{ item.letter }}</div>
              <ng-container *ngTemplateOutlet="pic; context: { $implicit: item.words[0].img, cls: 'w-14 h-14 group-hover:scale-125 transition-transform' }" />
              <div class="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full mt-3">{{ item.words.length }} كلمات</div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class App implements OnInit {
  selectedLetter = signal<AlphabetItem | null>(null);
  quiz = signal<Quiz | null>(null);
  slow = signal(false);
  playing = signal<string | null>(null);
  failed = signal<Set<string>>(new Set());
  learned = signal<Set<string>>(new Set());
  stars = signal(0);
  readonly colors = ['text-rose-500', 'text-orange-500', 'text-emerald-500', 'text-sky-500', 'text-violet-500', 'text-pink-500'];

  private voices: SpeechSynthesisVoice[] = [];
  private playToken = 0;
  private ctx?: AudioContext;

  readonly alphabetData: AlphabetItem[] =
[
    { 
      letter: 'A', ar_letter: 'إيه', 
      words: [
        { word: 'Apple', ar_word: 'تفاحة', img: '🍎' },
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
        { word: 'Ball', ar_word: 'كرة', img: '⚽' },
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
        { word: 'Cat', ar_word: 'قطة', img: '🐈' },
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
        { word: 'Dog', ar_word: 'كلب', img: '🐕' },
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
        { word: 'Elephant', ar_word: 'فيل', img: '🐘' },
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

  ngOnInit() {
    if ('speechSynthesis' in window) {
      this.voices = speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => (this.voices = speechSynthesis.getVoices());
    }
    try {
      const s = JSON.parse(localStorage.getItem('abc-progress') || '{}');
      this.learned.set(new Set(s.learned || []));
      this.stars.set(s.stars || 0);
    } catch { /* ignore */ }
  }

  private save() {
    try { localStorage.setItem('abc-progress', JSON.stringify({ learned: [...this.learned()], stars: this.stars() })); } catch { /* ignore */ }
  }

  // ---------- الصور ----------
  imgUrl(e: string): string {
    const cps = [...e].map(c => c.codePointAt(0)!.toString(16)).filter(h => h !== 'fe0f' || e.includes('\u200d'));
    return 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/' + cps.join('-') + '.svg';
  }
  markFailed(e: string) { this.failed.update(s => new Set(s).add(e)); }

  // ---------- التنقل ----------
  selectLetter(item: AlphabetItem) {
    this.selectedLetter.set(item);
    this.learned.update(s => new Set(s).add(item.letter));
    this.save();
  }
  closeModal() { this.playToken++; speechSynthesis?.cancel(); this.playing.set(null); this.selectedLetter.set(null); }
  step(dir: number) {
    const cur = this.selectedLetter(); if (!cur) return;
    const n = this.alphabetData.length;
    const i = (this.alphabetData.indexOf(cur) + dir + n) % n;
    this.selectLetter(this.alphabetData[i]);
  }

  // ---------- الصوت ----------
  private getBestVoice(lang: string): SpeechSynthesisVoice | null {
    const norm = (l: string) => l.replace('_', '-').toLowerCase();
    const prefix = lang.split('-')[0].toLowerCase();
    const score = (v: SpeechSynthesisVoice) =>
      (norm(v.lang) === lang.toLowerCase() ? 5 : 0) +
      (/natural|neural|online/i.test(v.name) ? 4 : 0) +
      (/google|samantha|siri|enhanced|premium|aria|jenny/i.test(v.name) ? 3 : 0) +
      (v.localService ? 0 : 1) - (/compact|espeak/i.test(v.name) ? 5 : 0);
    return this.voices.filter(v => norm(v.lang).startsWith(prefix)).sort((a, b) => score(b) - score(a))[0] ?? null;
  }

  private say(text: string, lang: string): Promise<void> {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const v = this.getBestVoice(lang);
      if (v) u.voice = v;
      u.rate = (lang.startsWith('ar') ? 0.95 : 1) * (this.slow() ? 0.65 : 0.9);
      u.pitch = 1.1;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });
  }

  // تشغيل عدة جمل بالترتيب، وأي ضغطة جديدة تلغي القديمة
  private async sequence(key: string | null, steps: [string, string][]) {
    if (!('speechSynthesis' in window)) return;
    const token = ++this.playToken;
    speechSynthesis.cancel();
    this.playing.set(key);
    for (const [text, lang] of steps) {
      if (token !== this.playToken) return;
      await this.say(text, lang);
      await new Promise(r => setTimeout(r, 250));
    }
    if (token === this.playToken) this.playing.set(null);
  }

  speak(text: string, lang: string) { this.sequence(null, [[text, lang]]); }

  playLetter(item: AlphabetItem) {
    this.sequence('L' + item.letter, [
      [item.letter, 'en-US'],
      [item.letter + ' for ' + item.words[0].word, 'en-US'],
      [item.ar_letter, 'ar-EG']
    ]);
  }
  playWord(w: WordItem) {
    this.sequence('W' + w.word, [[w.word, 'en-US'], [w.ar_word, 'ar-EG']]);
  }
  spellWord(w: WordItem) {
    const letters = w.word.replace(/[^a-z]/gi, '').toUpperCase().split('').join('. ');
    this.sequence('W' + w.word, [[w.word, 'en-US'], [letters, 'en-US'], [w.word, 'en-US']]);
  }

  private beep(freqs: number[], type: OscillatorType = 'sine') {
    try {
      const c = (this.ctx ??= new AudioContext());
      freqs.forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.value = f; o.connect(g); g.connect(c.destination);
        const t = c.currentTime + i * 0.13;
        g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.start(t); o.stop(t + 0.22);
      });
    } catch { /* ignore */ }
  }

  // ---------- الاختبار ----------
  private newQuestion() {
    const item = this.alphabetData[Math.floor(Math.random() * this.alphabetData.length)];
    const pool = item.words.filter(w => w.word[0].toUpperCase() === item.letter);
    const word = pool[Math.floor(Math.random() * pool.length)];
    const others = this.alphabetData.map(a => a.letter).filter(l => l !== item.letter).sort(() => Math.random() - 0.5).slice(0, 3);
    return { word, answer: item.letter, options: [item.letter, ...others].sort(() => Math.random() - 0.5) };
  }
  startQuiz() {
    this.closeModal();
    this.quiz.set({ idx: 0, score: 0, answered: null, done: false, ...this.newQuestion() });
    setTimeout(() => this.speak(this.quiz()!.word.word, 'en-US'), 300);
  }
  answerQuiz(opt: string) {
    const q = this.quiz(); if (!q || q.answered) return;
    const ok = opt === q.answer;
    this.beep(ok ? [523, 659, 784] : [220, 165], ok ? 'sine' : 'square');
    this.quiz.set({ ...q, answered: opt, score: q.score + (ok ? 1 : 0) });
    if (ok) { this.stars.update(s => s + 1); this.save(); }
    setTimeout(() => this.nextQuestion(), 1600);
  }
  private nextQuestion() {
    const q = this.quiz(); if (!q) return;
    if (q.idx >= 9) { this.beep([523, 659, 784, 1047]); this.quiz.set({ ...q, done: true }); return; }
    this.quiz.set({ ...q, idx: q.idx + 1, answered: null, ...this.newQuestion() });
    this.speak(this.quiz()!.word.word, 'en-US');
  }
}
