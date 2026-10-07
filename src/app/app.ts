import { Component, signal, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { NgTemplateOutlet } from '@angular/common';
import { DataService } from './services/data.service';
import { AudioService, WordItem } from './services/audio.service';

interface Quiz { idx: number; score: number; answered: string | null; done: boolean; word: WordItem; answer: string; options: string[]; type: 'letter' | 'word'; }
interface MemoryCard { id: number; letter: string; img: string; word: string; flipped: boolean; matched: boolean; }

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, NgTemplateOutlet],
  template: `
    <ng-template #pic let-e let-hd="hd" let-cls="cls">
      @if (hd) {
        <img [src]="hd" alt="" loading="lazy" [class]="cls + ' object-cover rounded-2xl shadow-sm'" (error)="data.markFailed(e)" />
      } @else if (!data.failed().has(e)) {
        <img [src]="data.imgUrl(e)" (error)="data.markFailed(e)" alt="" loading="lazy" [class]="cls" />
      } @else {
        <span class="text-6xl select-none">{{ e }}</span>
      }
    </ng-template>

    <div class="min-h-screen p-3 md:p-6 font-sans pb-24" dir="rtl">
      <div class="max-w-7xl mx-auto">

        <!-- User Profile Modal -->
        @if (!data.childName()) {
          <div class="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-[100] backdrop-blur-sm">
            <div class="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl border-4 border-pink-400 transform transition-all scale-100">
              <div class="text-7xl mb-4 animate-bounce">🐰</div>
              <h2 class="text-3xl font-black text-purple-700 mb-2">أهلاً بك يا بطل!</h2>
              <p class="text-gray-600 font-bold mb-6">أنا صديقك الأرنب باني، ما اسمك الجميل؟</p>
              <input #nameInput type="text" placeholder="اكتب اسمك هنا..." class="w-full bg-pink-50 border-2 border-pink-200 rounded-2xl px-4 py-3 text-xl font-black text-center text-purple-900 focus:outline-none focus:border-pink-500 mb-6" (keyup.enter)="saveName(nameInput.value)">
              <button (click)="saveName(nameInput.value)" class="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-2xl font-black text-xl shadow-lg hover:scale-105 transition-transform">
                هيا نبدأ اللعب والتعلم! 🚀
              </button>
            </div>
          </div>
        }

        <!-- الهيدر ونظام التنقل الاحترافي Navigation Bar -->
        <header class="text-center py-6 mb-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border-4 border-blue-200 relative overflow-hidden">
          <div class="flex items-center justify-center gap-3 mb-2">
            <span class="text-5xl animate-bounce">🎨</span>
            <div class="flex flex-col items-center">
              <h1 class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600 leading-normal pb-1">
                تعلم مع يونس
              </h1>
              <h2 class="text-xl md:text-2xl font-black text-gray-600 tracking-wider">
                Learn With Younis
              </h2>
            </div>
            <span class="text-5xl animate-bounce">⭐</span>
          </div>

          <!-- شخصية الأرنب المشجع Mascot -->
          <div class="flex flex-col md:flex-row items-center justify-center gap-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 py-3 px-6 rounded-2xl max-w-xl mx-auto mb-4 border border-pink-200 shadow-sm cursor-pointer hover:scale-105 transition-all" (click)="speakMascot()">
            <div class="flex items-center gap-4">
              <span class="text-5xl animate-pulse">🐰</span>
              <div class="text-right">
                <div class="text-xs font-black text-pink-500">صديقك الأرنب "باني":</div>
                <div class="text-base md:text-lg font-black text-purple-900">{{ mascotSpeech() }}</div>
              </div>
            </div>
            @if (data.childName()) {
              <div class="md:mr-auto bg-white px-4 py-1.5 rounded-full border border-pink-200 shadow-sm flex items-center gap-2">
                <span class="font-black text-pink-600 text-sm">أيام متتالية:</span>
                <span class="font-black text-orange-500 text-lg">{{ data.streak() }} 🔥</span>
              </div>
            }
          </div>

          <!-- شريط الإنجاز والنقاط -->
          <div class="max-w-md mx-auto px-6 mb-4">
            <div class="flex justify-between text-base font-black text-gray-700 mb-1">
              <span>📚 المستكشف: {{ data.learned().size }} / 26</span>
              <span class="text-yellow-600 font-extrabold text-lg flex items-center gap-1">
                🏆 النجوم: {{ data.stars() }} ⭐
              </span>
            </div>
            <div class="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner p-0.5">
              <div class="h-full bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 rounded-full transition-all duration-700 shadow" [style.width.%]="(data.learned().size / 26) * 100"></div>
            </div>
          </div>

          <!-- شريط البحث الفوري والقاموس الناطق (Visual Dictionary Search) -->
          <div class="max-w-md mx-auto px-4 mb-6 relative">
            <div class="relative flex items-center">
              <input #searchInput
                     type="text"
                     placeholder="🔍 ابحث عن أي كلمة أو حيوان (مثل: Lion أو قطة)..."
                     (input)="onSearch(searchInput.value)"
                     class="w-full bg-amber-50/90 border-2 border-amber-300 rounded-2xl px-4 py-2.5 pr-10 text-base font-black text-amber-950 focus:outline-none focus:border-amber-500 placeholder-gray-400 shadow-inner" />
              @if (searchQuery()) {
                <button (click)="clearSearch(searchInput)" class="absolute left-3 text-gray-400 hover:text-gray-600 font-black text-lg">✕</button>
              }
            </div>

            <!-- قائمة النتائج الفورية المنسدلة -->
            @if (searchResults().length > 0) {
              <div class="absolute left-4 right-4 top-12 bg-white rounded-2xl shadow-2xl border-3 border-amber-300 z-50 max-h-72 overflow-y-auto p-2 space-y-1">
                @for (item of searchResults(); track item.word) {
                  <div (click)="selectSearchResult(item)"
                       class="p-2.5 rounded-xl hover:bg-amber-100 flex items-center justify-between cursor-pointer transition-colors border-b border-gray-100 last:border-none">
                    <div class="flex items-center gap-3">
                      @if (item.imagePath) {
                        <img [src]="'assets/images/' + item.imagePath" class="w-10 h-10 object-contain drop-shadow" alt="" />
                      } @else {
                        <span class="text-2xl">{{ item.img }}</span>
                      }
                      <div class="text-right">
                        <span class="font-black text-amber-950 text-base">{{ item.word }}</span>
                        <span class="text-xs font-bold text-gray-500 mr-2">({{ item.ar_word }})</span>
                      </div>
                    </div>
                    <button class="bg-amber-400 hover:bg-amber-500 text-amber-950 rounded-full w-8 h-8 flex items-center justify-center text-sm shadow">
                      🔊
                    </button>
                  </div>
                }
              </div>
            }
          </div>

          <!-- قائمة التبديل الشاملة عبر Angular Router Pages -->
          <nav class="flex flex-wrap justify-center gap-2 md:gap-3 px-4">
            <a routerLink="/alphabet" routerLinkActive="bg-blue-600 text-white scale-105 shadow-lg" class="bg-blue-100 text-blue-800 hover:bg-blue-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-blue-300">
              🔤 الحروف والكلمات
            </a>

            <a routerLink="/tracing" routerLinkActive="bg-amber-600 text-white scale-105 shadow-lg" class="bg-amber-100 text-amber-800 hover:bg-amber-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-amber-300">
              ✏️ سبورة الكتابة
            </a>

            <a routerLink="/speech" routerLinkActive="bg-rose-600 text-white scale-105 shadow-lg" class="bg-rose-100 text-rose-800 hover:bg-rose-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-rose-300">
              🎙️ مدرب النطق (AI)
            </a>

            <a routerLink="/junior" routerLinkActive="bg-teal-600 text-white scale-105 shadow-lg" class="bg-teal-100 text-teal-800 hover:bg-teal-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-teal-300">
              🧑‍🎓 محادثات وقواعد (للكبار)
            </a>

            <a routerLink="/certificates" routerLinkActive="bg-amber-600 text-white scale-105 shadow-lg" class="bg-amber-100 text-amber-800 hover:bg-amber-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-amber-300">
              🏆 شهادة الإنجاز
            </a>

            <a routerLink="/phrases" routerLinkActive="bg-teal-600 text-white scale-105 shadow-lg" class="bg-teal-100 text-teal-800 hover:bg-teal-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-teal-300">
              💬 جمل يومية
            </a>

            <a routerLink="/stories" routerLinkActive="bg-purple-600 text-white scale-105 shadow-lg" class="bg-purple-100 text-purple-800 hover:bg-purple-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-purple-300">
              📖 القصص المصورة
            </a>

            <a routerLink="/games" routerLinkActive="bg-orange-600 text-white scale-105 shadow-lg" class="bg-orange-100 text-orange-800 hover:bg-orange-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-orange-300">
              🎮 ألعاب الذكاء
            </a>

            <a routerLink="/numbers" routerLinkActive="bg-emerald-600 text-white scale-105 shadow-lg" class="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-emerald-300">
              🔢 الأرقام (1-30)
            </a>

            <a routerLink="/categories" routerLinkActive="bg-indigo-600 text-white scale-105 shadow-lg" class="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-indigo-300">
              🦁 أصوات وصور واقعية
            </a>

            <a routerLink="/stickers" routerLinkActive="bg-pink-600 text-white scale-105 shadow-lg" class="bg-pink-100 text-pink-800 hover:bg-pink-200 px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-pink-300">
              🛒 متجر المكافآت
            </a>

            <button (click)="startQuiz('letter')" class="bg-pink-500 text-white px-4 py-2 rounded-full font-black hover:bg-pink-600 hover:scale-105 transition-all shadow-md text-sm md:text-base">
              🎮 اختبار الحروف
            </button>

            <button (click)="startQuiz('word')" class="bg-purple-500 text-white px-4 py-2 rounded-full font-black hover:bg-purple-600 hover:scale-105 transition-all shadow-md text-sm md:text-base">
              🧩 اختبار الصور
            </button>

            <button (click)="startMemoryGame()" class="bg-orange-500 text-white px-4 py-2 rounded-full font-black hover:bg-orange-600 hover:scale-105 transition-all shadow-md text-sm md:text-base">
              🃏 لعبة الذاكرة
            </button>

            <button (click)="audio.slow.set(!audio.slow())" class="bg-white border-2 border-blue-400 text-blue-700 px-4 py-2 rounded-full font-black hover:bg-blue-50 transition-all shadow-sm text-sm">
              {{ audio.slow() ? '🐢 نطق بطيء' : '🐇 نطق عادي' }}
            </button>
          </nav>
        </header>

        <!-- الشاشة الرئيسية المنفصلة التي يتم عرض الصفحات بداخلها -->
        <main>
          <router-outlet></router-outlet>
        </main>

        <!-- النافذة المنبثقة للاختبارات -->
        @if (quiz(); as q) {
          <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg text-center shadow-2xl relative border-4 border-pink-300">
              <button (click)="quiz.set(null)" class="absolute top-4 left-4 w-10 h-10 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white font-black text-lg transition-colors">✕</button>
              
              @if (!q.done) {
                <div class="text-sm font-black text-purple-600 bg-purple-100 px-4 py-1.5 rounded-full inline-block mb-3 border border-purple-200">
                  السؤال {{ q.idx + 1 }} من 10 · 🌟 النجوم: {{ q.score }}
                </div>
                
                <div class="text-2xl font-black text-gray-800 mb-3">
                  {{ q.type === 'letter' ? 'بأي حرف تبدأ هذه الكلمة؟' : 'ما هي الكلمة الصحيحة لهذه الصورة؟' }}
                </div>
                
                <div class="flex justify-center mb-3 bg-blue-50/50 p-4 rounded-3xl border border-blue-100 shadow-inner">
                  <ng-container *ngTemplateOutlet="pic; context: { $implicit: q.word.img, hd: q.word.realImg, cls: 'w-36 h-36 drop-shadow-xl animate-pulse' }" />
                </div>
                
                <button (click)="audio.speak(q.word.word, 'en-US')" class="mb-5 bg-blue-500 text-white px-6 py-2 rounded-full font-black hover:bg-blue-600 shadow-md transition-all text-base">
                  🔊 استمع للنطق الصوتي
                </button>
                
                <div class="grid grid-cols-2 gap-3">
                  @for (o of q.options; track o) {
                    <button (click)="answerQuiz(o)" [disabled]="q.answered !== null"
                      class="font-black py-4 rounded-2xl border-4 transition-all shadow-md text-2xl"
                      [class]="q.answered === null ? 'border-blue-200 bg-blue-50 text-blue-700 hover:scale-105 hover:bg-blue-100' :
                        o === q.answer ? 'border-green-500 bg-green-100 text-green-800 scale-105 shadow-lg' :
                        o === q.answered ? 'border-red-400 bg-red-100 text-red-700 animate-pulse' : 'border-gray-200 bg-gray-50 text-gray-400 opacity-60'">
                      {{ o }}
                    </button>
                  }
                </div>
              } @else {
                <div class="text-8xl mb-3 animate-bounce">{{ q.score >= 8 ? '🏆' : q.score >= 5 ? '🎉' : '💪' }}</div>
                <div class="text-3xl font-black text-blue-600 mb-2">نتيجتك النهائية: {{ q.score }} من 10</div>
                <p class="text-gray-700 text-lg font-bold mb-6">
                  {{ q.score >= 8 ? 'أنت بطل حقيقي في اللغة الإنجليزية! 🌟' : q.score >= 5 ? 'أداء رائع جداً! استمر في المحاولة!' : 'محاولة جيدة، يمكنك تحقيق أفضل من ذلك بالتكرار! 👍' }}
                </p>
                <div class="flex gap-3 justify-center">
                  <button (click)="startQuiz(q.type)" class="bg-pink-500 text-white px-8 py-3 rounded-full font-black text-lg hover:bg-pink-600 shadow-lg hover:scale-105 transition-all">
                    🔁 إعادة الاختبار
                  </button>
                  <button (click)="quiz.set(null)" class="bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-black text-lg hover:bg-gray-300 transition-all">
                    إغلاق
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- النافذة المنبثقة للعبة الذاكرة التفاعلية -->
        @if (memoryGame(); as mg) {
          <div class="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-3xl text-center shadow-2xl relative border-4 border-amber-300">
              <button (click)="memoryGame.set(null)" class="absolute top-4 left-4 w-10 h-10 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white font-black text-lg transition-colors">✕</button>

              <h2 class="text-3xl font-black text-amber-600 mb-2">🃏 لعبة مطابقة الذاكرة (Memory Game)</h2>
              <p class="text-gray-600 font-bold mb-4">طابق بين الحرف والصورة المناسبة له!</p>

              @if (!mg.completed) {
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-6">
                  @for (card of mg.cards; track card.id) {
                    <div (click)="flipCard(card)"
                      class="h-28 rounded-2xl flex items-center justify-center cursor-pointer transition-all transform duration-300 shadow-md border-4 select-none overflow-hidden"
                      [class]="card.flipped || card.matched ? 'bg-amber-100 border-amber-400 rotate-0' : 'bg-gradient-to-br from-blue-500 to-indigo-600 border-white hover:scale-105'">
                      @if (card.flipped || card.matched) {
                        @if (card.img) {
                          <ng-container *ngTemplateOutlet="pic; context: { $implicit: card.img, cls: 'w-16 h-16 drop-shadow' }" />
                        } @else {
                          <span class="text-4xl font-black text-blue-700">{{ card.letter }}</span>
                        }
                      } @else {
                        <span class="text-3xl font-black text-white/80">❓</span>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="text-8xl mb-3 animate-bounce">🥇</div>
                <div class="text-3xl font-black text-green-600 mb-2">مبروك! أنهيت لعبة الذاكرة بنجاح!</div>
                <p class="text-gray-700 text-lg font-bold mb-6">لقد طابقت جميع الكروت وحصلت على +5 نجوم إضافية! ⭐</p>
                <button (click)="startMemoryGame()" class="bg-amber-500 text-white px-8 py-3 rounded-full font-black text-lg hover:bg-amber-600 shadow-lg hover:scale-105 transition-all">
                  🎮 العب مرة أخرى
                </button>
              }
            </div>
          </div>
        }


        <!-- الفوتر الصغير الأنيق -->
        <footer class="mt-16 mb-2 text-center opacity-75 hover:opacity-100 transition-opacity duration-300">
          <div class="flex flex-col items-center justify-center text-[12px] font-bold text-gray-400">
            <p>Developed & Designed by <span class="text-gray-500 font-black">Ebrahem Salah</span></p>
            <p class="mt-1 tracking-wider" dir="ltr">📱 010 9698 6091</p>
          </div>
        </footer>

      </div>
    </div>
  `
})
export class App {
  data = inject(DataService);
  audio = inject(AudioService);

  mascotSpeech = signal<string>('أهلاً بك في الأكاديمية! تنقل بين الصفحات واستمتع بالألعاب والدروس 🌟');
  quiz = signal<Quiz | null>(null);
  memoryGame = signal<{ cards: MemoryCard[]; firstCard: MemoryCard | null; lock: boolean; completed: boolean } | null>(null);

  searchQuery = signal<string>('');
  searchResults = signal<WordItem[]>([]);

  onSearch(query: string) {
    const q = query.trim().toLowerCase();
    this.searchQuery.set(q);
    if (!q) {
      this.searchResults.set([]);
      return;
    }

    const allWords: WordItem[] = this.data.alphabetData.flatMap(a => a.words);
    const matches = allWords.filter(w =>
      w.word.toLowerCase().includes(q) ||
      w.ar_word.includes(q)
    ).slice(0, 8);

    this.searchResults.set(matches);
  }

  selectSearchResult(item: WordItem) {
    this.audio.speak(item.word, 'en-US');
    this.data.tracingText.set(item.word);
  }

  clearSearch(inputEl: HTMLInputElement) {
    inputEl.value = '';
    this.searchQuery.set('');
    this.searchResults.set([]);
  }

  constructor() {
    setTimeout(() => {
      if (this.data.childName()) {
        this.mascotSpeech.set(`أهلاً بك يا ${this.data.childName()}! تنقل بين الصفحات لنتعلم معاً 🌟`);
      }
    }, 100);
  }

  saveName(name: string) {
    const trimmed = name.trim();
    if (trimmed) {
      this.data.childName.set(trimmed);
      this.data.checkStreak();
      this.data.save();
      this.mascotSpeech.set(`أهلاً بك يا بطل ${trimmed}! هيا نبدأ! 🚀`);
      this.audio.speak('أهلاً بك يا بطل ' + trimmed, 'ar-EG');
    }
  }

  speakMascot() {
    const name = this.data.childName();
    const lines = [
      `أهلاً بك يا بطل${name ? ' ' + name : ''}! استمتع بالصفحات والتصنيفات المختلفة! 🌟`,
      'هل زرت قسم القصص والمحادثات اليوم؟ 📖',
      'اقرأ واستمع لتكسب المزيد من النجوم والمكافآت! 🏆'
    ];
    const line = lines[Math.floor(Math.random() * lines.length)];
    this.mascotSpeech.set(line);
    this.audio.speak(line.replace(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g, ''), 'ar-EG');
  }

  private newQuestion(type: 'letter' | 'word') {
    const item = this.data.alphabetData[Math.floor(Math.random() * this.data.alphabetData.length)];
    const word = item.words[Math.floor(Math.random() * item.words.length)];

    if (type === 'letter') {
      const others = this.data.alphabetData.map(a => a.letter).filter(l => l !== item.letter).sort(() => Math.random() - 0.5).slice(0, 3);
      return { word, answer: item.letter, options: [item.letter, ...others].sort(() => Math.random() - 0.5), type };
    } else {
      const allWords = this.data.alphabetData.flatMap(a => a.words).map(w => w.word);
      const others = allWords.filter(w => w !== word.word).sort(() => Math.random() - 0.5).slice(0, 3);
      return { word, answer: word.word, options: [word.word, ...others].sort(() => Math.random() - 0.5), type };
    }
  }

  startQuiz(type: 'letter' | 'word') {
    this.quiz.set({ idx: 0, score: 0, answered: null, done: false, ...this.newQuestion(type) });
    setTimeout(() => this.audio.speak(this.quiz()!.word.word, 'en-US'), 300);
  }

  answerQuiz(opt: string) {
    const q = this.quiz(); if (!q || q.answered) return;
    const ok = opt === q.answer;
    this.audio.beep(ok ? [523, 659, 784] : [220, 165], ok ? 'sine' : 'square');
    this.quiz.set({ ...q, answered: opt, score: q.score + (ok ? 1 : 0) });
    if (ok) { this.data.stars.update(s => s + 1); this.data.save(); }
    setTimeout(() => this.nextQuestion(), 1600);
  }

  private nextQuestion() {
    const q = this.quiz(); if (!q) return;
    if (q.idx >= 9) { this.audio.beep([523, 659, 784, 1047]); this.quiz.set({ ...q, done: true }); return; }
    this.quiz.set({ ...q, idx: q.idx + 1, answered: null, ...this.newQuestion(q.type) });
    this.audio.speak(this.quiz()!.word.word, 'en-US');
  }

  startMemoryGame() {
    const selectedItems = [...this.data.alphabetData].sort(() => Math.random() - 0.5).slice(0, 4);
    let cards: MemoryCard[] = [];
    let id = 1;
    selectedItems.forEach(item => {
      const wordObj = item.words[0];
      cards.push({ id: id++, letter: item.letter, img: '', word: wordObj.word, flipped: false, matched: false });
      cards.push({ id: id++, letter: item.letter, img: wordObj.img, word: wordObj.word, flipped: false, matched: false });
    });
    cards = cards.sort(() => Math.random() - 0.5);
    this.memoryGame.set({ cards, firstCard: null, lock: false, completed: false });
  }

  flipCard(card: MemoryCard) {
    const mg = this.memoryGame();
    if (!mg || mg.lock || card.flipped || card.matched) return;

    const updatedCards = mg.cards.map(c => c.id === card.id ? { ...c, flipped: true } : c);
    
    if (card.img) {
      this.audio.speak(card.word, 'en-US');
    } else {
      this.audio.speak(card.letter, 'en-US');
    }

    if (!mg.firstCard) {
      this.memoryGame.set({ ...mg, cards: updatedCards, firstCard: card });
    } else {
      this.memoryGame.set({ ...mg, cards: updatedCards, lock: true });
      const isMatch = mg.firstCard.letter === card.letter;

      if (isMatch) {
        this.audio.beep([523, 659, 784]);
        setTimeout(() => {
          const matchedCards = updatedCards.map(c => c.letter === card.letter ? { ...c, matched: true } : c);
          const allMatched = matchedCards.every(c => c.matched);
          if (allMatched) {
            this.data.stars.update(s => s + 5);
            this.data.save();
          }
          this.memoryGame.set({ ...mg, cards: matchedCards, firstCard: null, lock: false, completed: allMatched });
        }, 800);
      } else {
        this.audio.beep([220, 165], 'square');
        setTimeout(() => {
          const resetCards = updatedCards.map(c => (c.id === card.id || c.id === mg.firstCard!.id) ? { ...c, flipped: false } : c);
          this.memoryGame.set({ ...mg, cards: resetCards, firstCard: null, lock: false });
        }, 1200);
      }
    }
  }
}
