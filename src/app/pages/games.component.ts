import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

interface DragItem { word: string; img: string; }
interface DropZone { letter: string; matchWord: string; currentItem: DragItem | null; }

interface MemoryCard { id: number; letter: string; word: string; img: string; type: 'letter' | 'img'; isFlipped: boolean; isMatched: boolean; }

@Component({
  selector: 'app-games',
  standalone: true,
  template: `
    <div class="bg-white rounded-3xl p-6 shadow-xl border-4 border-orange-300 max-w-5xl mx-auto">
      <h2 class="text-4xl font-black text-orange-600 mb-6 text-center">🎮 ألعاب الذكاء والمرح</h2>
      
      <div class="flex justify-center flex-wrap gap-4 mb-8">
        <button (click)="setMode('match')" [class]="mode() === 'match' ? 'bg-orange-500 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-700'" class="px-6 py-2 rounded-full font-black text-xl transition-all border-2 border-orange-200">
          🧩 المطابقة
        </button>
        <button (click)="setMode('memory')" [class]="mode() === 'memory' ? 'bg-purple-500 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-700'" class="px-6 py-2 rounded-full font-black text-xl transition-all border-2 border-purple-200">
          🃏 الذاكرة
        </button>
        <button (click)="setMode('quiz')" [class]="mode() === 'quiz' ? 'bg-rose-500 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-700'" class="px-6 py-2 rounded-full font-black text-xl transition-all border-2 border-rose-200">
          🔍 أين الصورة؟
        </button>
        <button (click)="setMode('journey')" [class]="mode() === 'journey' ? 'bg-sky-500 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-700'" class="px-6 py-2 rounded-full font-black text-xl transition-all border-2 border-sky-200">
          ✈️ رحلة الحروف
        </button>
      </div>

      @if (mode() === 'match') {
        <p class="text-gray-600 font-bold mb-6 text-center">اسحب الصورة إلى الحرف المناسب!</p>

        @if (gameWon()) {
          <div class="text-center py-10 bg-green-50 rounded-3xl border-4 border-green-300 mb-6">
            <div class="text-8xl mb-4 animate-bounce">🏆</div>
            <h3 class="text-4xl font-black text-green-700 mb-2">أنت بطل عبقري!</h3>
            <p class="text-xl text-green-600 font-bold mb-6">لقد نجحت وكسبت +10 نجوم! ⭐</p>
            <button (click)="initMatchGame()" class="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-2xl hover:bg-orange-600 shadow-xl hover:scale-105 transition-transform">
              العب مرة أخرى 🔄
            </button>
          </div>
        } @else {
          <!-- مناطق الإفلات (الحروف) -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            @for (zone of dropZones(); track zone.letter; let i = $index) {
              <div class="bg-orange-50 rounded-3xl p-6 border-4 border-dashed transition-all flex flex-col items-center min-h-[160px]"
                   [class]="dragHoverIndex === i ? 'border-orange-500 bg-orange-100 scale-105' : 'border-orange-300'"
                   (dragover)="allowDrop($event, i)"
                   (dragleave)="dragLeave($event)"
                   (drop)="drop($event, i)">
                
                <div class="text-6xl font-black text-orange-400 mb-2">{{ zone.letter }}</div>
                
                @if (zone.currentItem) {
                  <div class="bg-white p-3 rounded-2xl shadow-md border-2 border-green-400 animate-bounce">
                    <span class="text-5xl">{{ zone.currentItem.img }}</span>
                    <div class="text-lg font-black text-green-700 mt-1 text-center">{{ zone.currentItem.word }}</div>
                  </div>
                } @else {
                  <div class="text-gray-400 font-bold mt-4">أسقط الصورة هنا 👇</div>
                }
              </div>
            }
          </div>

          <!-- العناصر القابلة للسحب (الصور) -->
          <div class="bg-blue-50 rounded-3xl p-6 border-2 border-blue-200">
            <div class="flex flex-wrap justify-center gap-4">
              @for (item of dragItems(); track item.word; let i = $index) {
                <div class="bg-white p-4 rounded-2xl shadow-sm border-2 border-blue-300 cursor-grab hover:shadow-md hover:-translate-y-1 transition-transform flex flex-col items-center"
                     draggable="true"
                     (dragstart)="dragStart($event, i)">
                  <span class="text-5xl mb-2">{{ item.img }}</span>
                  <span class="text-base font-black text-blue-900">{{ item.word }}</span>
                </div>
              }
            </div>
          </div>
        }
      } @else if (mode() === 'memory') {
        <p class="text-gray-600 font-bold mb-6 text-center">طابق كل حرف مع الصورة المناسبة له!</p>
        

        @if (memoryWon()) {
          <div class="text-center py-10 bg-purple-50 rounded-3xl border-4 border-purple-300 mb-6">
            <div class="text-8xl mb-4 animate-bounce">🥇</div>
            <h3 class="text-4xl font-black text-purple-700 mb-2">ذاكرتك حديدية!</h3>
            <p class="text-xl text-purple-600 font-bold mb-6">لقد طابقت جميع البطاقات وكسبت +15 نجمة! ⭐</p>
            <button (click)="initMemoryGame()" class="bg-purple-500 text-white px-8 py-3 rounded-full font-black text-2xl hover:bg-purple-600 shadow-xl hover:scale-105 transition-transform">
              العب مرة أخرى 🔄
            </button>
          </div>
        } @else {
          <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
            @for (card of memoryCards(); track card.id; let i = $index) {
              <div class="relative w-full h-32 md:h-40 cursor-pointer" style="perspective: 1000px;" (click)="flipCard(i)">
                <div class="w-full h-full transition-transform duration-500" 
                     [style.transform]="card.isFlipped || card.isMatched ? 'rotateY(180deg)' : ''" 
                     style="transform-style: preserve-3d;">
                  
                  <!-- Front (Hidden) -->
                  <div class="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl border-4 border-purple-300 shadow-md flex items-center justify-center backface-hidden" style="backface-visibility: hidden;">
                    <span class="text-4xl text-white/50">❓</span>
                  </div>
                  
                  <!-- Back (Revealed) -->
                  <div class="absolute inset-0 bg-white rounded-2xl border-4 shadow-md flex items-center justify-center backface-hidden"
                       [class.border-green-400]="card.isMatched"
                       [class.border-purple-300]="!card.isMatched"
                       style="transform: rotateY(180deg); backface-visibility: hidden;">
                    @if (card.type === 'letter') {
                      <div class="text-6xl md:text-7xl font-black text-purple-600">{{ card.letter }}</div>
                    } @else {
                      <div class="text-6xl md:text-7xl">{{ card.img }}</div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      } @else if (mode() === 'quiz') {
        <p class="text-gray-600 font-bold mb-6 text-center">استمع للكلمة واضغط على الصورة الصحيحة!</p>
        
        @if (quizWon()) {
          <div class="text-center py-10 bg-rose-50 rounded-3xl border-4 border-rose-300 mb-6">
            <div class="text-8xl mb-4 animate-bounce">🎯</div>
            <h3 class="text-4xl font-black text-rose-700 mb-2">ممتاز يا بطل!</h3>
            <p class="text-xl text-rose-600 font-bold mb-6">إجابة صحيحة! كسبت +5 نجوم! ⭐</p>
            <button (click)="initQuizGame()" class="bg-rose-500 text-white px-8 py-3 rounded-full font-black text-2xl hover:bg-rose-600 shadow-xl hover:scale-105 transition-transform">
              العب مرة أخرى 🔄
            </button>
          </div>
        } @else if (quizQuestion()) {
          <div class="flex flex-col items-center">
            <button (click)="playQuizWord()" class="bg-blue-500 text-white px-8 py-4 rounded-full font-black text-2xl mb-8 shadow-xl hover:scale-110 transition-transform animate-pulse flex items-center gap-3">
              <span>🔊</span> أين صورة: {{ quizQuestion()!.targetWord }}؟
            </button>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
              @for (opt of quizQuestion()!.options; track opt.word) {
                <button (click)="checkQuizAnswer(opt.word)" class="bg-white p-6 rounded-3xl border-4 border-gray-200 shadow-md hover:border-rose-400 hover:scale-105 transition-all text-7xl md:text-8xl flex justify-center items-center h-40">
                  {{ opt.img }}
                </button>
              }
            </div>
          </div>
        }
      } @else if (mode() === 'journey') {
        <!-- لعبة رحلة الحروف -->
        <div class="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-inner flex flex-col items-center justify-center select-none" dir="rtl">
            <!-- الخلفية -->
            <div class="absolute inset-0 -z-10 flex flex-col">
                <div class="journey-sky flex-1 relative overflow-hidden">
                    <div class="journey-cloud journey-cloud1"></div>
                    <div class="journey-cloud journey-cloud2"></div>
                </div>
                <div class="journey-grass h-1/3 relative border-t-8 border-green-800"></div>
            </div>

            <!-- شاشة البداية -->
            @if (journeyState() === 'start') {
                <div class="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4 bg-black/60 backdrop-blur-sm">
                    <div class="bg-white p-10 rounded-[3rem] shadow-2xl max-w-lg w-full border-[10px] border-blue-400 transform transition hover:scale-105">
                        <div class="text-9xl mb-4 animate-bounce">🔤</div>
                        <h2 class="text-5xl font-black text-blue-600 mb-4">بطل الحروف</h2>
                        <p class="text-gray-600 mb-8 font-bold text-2xl">26 مرحلة لاكتشاف الكلمات والصور.. جاهز؟</p>
                        <button (click)="startJourney()" class="w-full py-6 bg-yellow-400 hover:bg-yellow-500 text-blue-900 text-4xl font-black rounded-3xl shadow-[0_10px_0_#f57f17] active:translate-y-2 active:shadow-none transition-all">
                            ابدأ اللعب!
                        </button>
                    </div>
                </div>
            }

            <!-- شاشة النهاية -->
            @else if (journeyState() === 'finale') {
                <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 text-white p-4">
                    <div class="text-center">
                        <div class="text-[8rem] mb-8 animate-bounce">🏆</div>
                        <h1 class="text-6xl font-black mb-4 drop-shadow-2xl">أنت عبقري!</h1>
                        <p class="text-3xl font-bold mb-12">لقد أكملت جميع الحروف الـ 26 بنجاح!</p>
                        <button (click)="resetJourney()" class="px-12 py-6 bg-white text-blue-600 text-3xl font-black rounded-full shadow-[0_10px_0_#ccc] active:translate-y-2 active:shadow-none transition-all">
                            العب مرة أخرى
                        </button>
                    </div>
                </div>
            }

            <!-- منطقة اللعب -->
            @else {
                <!-- شريط التقدم -->
                <div class="absolute top-4 left-0 w-full flex flex-col items-center z-20">
                    <h2 class="text-white text-2xl font-black drop-shadow-md" style="text-shadow: 2px 2px 0 #333;">
                        مرحلة {{ journeyLevelIndex() + 1 }} / 26
                    </h2>
                    <div class="journey-progress-container w-3/4 max-w-sm h-5 mt-2">
                        <div class="journey-progress-fill h-full" [style.width.%]="(journeyLevelIndex() / 26) * 100"></div>
                    </div>
                </div>

                @if (journeyTarget(); as target) {
                    <!-- بطاقة الحرف -->
                    <div class="journey-target-card mt-12 z-10">
                        <span class="text-7xl font-black text-blue-600 drop-shadow-sm" style="text-shadow: 4px 4px 0 #bbdefb;">{{ target.letter }}</span>
                    </div>

                    <h3 class="text-white text-3xl font-black mt-6 drop-shadow-md text-center px-4 z-10" style="text-shadow: 2px 2px 0 #1976d2;">
                        أين الصورة التي تبدأ بالحرف؟
                    </h3>

                    <!-- خيارات الصور -->
                    <div class="grid grid-cols-3 gap-4 w-full max-w-lg px-4 mt-8 z-10" dir="ltr">
                        @for (opt of journeyOptions(); track opt.word; let i = $index) {
                            <button (click)="checkJourneyAnswer(opt, i)" 
                                    [disabled]="journeyState() === 'win'"
                                    [class.journey-shake]="wrongJourneyIndex === i"
                                    [class.journey-correct]="journeyState() === 'win' && opt.isCorrect"
                                    class="journey-option-btn">
                                {{ opt.img }}
                            </button>
                        }
                    </div>

                    <!-- رسالة الفوز للمرحلة -->
                    @if (journeyState() === 'win') {
                        <div class="absolute inset-0 z-40 flex flex-col items-center justify-center">
                            <div class="text-center bg-white/90 backdrop-blur-md px-10 py-6 rounded-[3rem] shadow-2xl border-[8px] border-green-400 animate-[bounceIn_0.5s_ease-out]">
                                <div class="text-7xl mb-2">{{ target.img }}</div>
                                <h2 class="text-5xl font-black text-green-600 mb-1 uppercase drop-shadow-sm">{{ target.word }}</h2>
                                <h3 class="text-3xl font-bold text-gray-700">{{ target.ar }}</h3>
                            </div>
                        </div>
                    }
                }
            }
        </div>
      }
    </div>
  `
})
export class GamesComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  mode = signal<'match' | 'memory' | 'quiz' | 'journey'>('match');

  // Match Game State
  dropZones = signal<DropZone[]>([]);
  dragItems = signal<DragItem[]>([]);
  gameWon = signal(false);
  dragHoverIndex = -1;
  private draggedItemIndex = -1;

  // Memory Game State
  memoryCards = signal<MemoryCard[]>([]);
  memoryWon = signal(false);
  flippedIndices: number[] = [];
  isProcessingFlip = false;

  // Quiz Game State
  quizQuestion = signal<{targetWord: string, targetImg: string, options: {word: string, img: string}[]} | null>(null);
  quizWon = signal(false);

  // Journey Game State
  journeyState = signal<'start' | 'playing' | 'win' | 'finale'>('start');
  journeyLevelIndex = signal(0);
  journeyTarget = signal<{letter: string, word: string, img: string, ar: string} | null>(null);
  journeyOptions = signal<{word: string, img: string, ar: string, isCorrect: boolean}[]>([]);
  wrongJourneyIndex = -1;

  constructor() {
    this.initMatchGame();
  }

  setMode(m: 'match' | 'memory' | 'quiz' | 'journey') {
    this.mode.set(m);
    if (m === 'match') this.initMatchGame();
    else if (m === 'memory') this.initMemoryGame();
    else if (m === 'quiz') this.initQuizGame();
    else if (m === 'journey') {
        this.journeyState.set('start');
        this.journeyLevelIndex.set(0);
    }
  }

  // --- MATCH GAME LOGIC ---
  initMatchGame() {
    this.gameWon.set(false);
    this.dragHoverIndex = -1;
    this.draggedItemIndex = -1;
    
    const all = [...this.data.alphabetData].sort(() => 0.5 - Math.random()).slice(0, 3);
    const zones: DropZone[] = all.map(a => ({ letter: a.letter, matchWord: a.words[0].word, currentItem: null }));
    const items: DragItem[] = all.map(a => ({ word: a.words[0].word, img: a.words[0].img })).sort(() => 0.5 - Math.random());
    
    this.dropZones.set(zones);
    this.dragItems.set(items);
  }

  dragStart(event: DragEvent, index: number) {
    this.draggedItemIndex = index;
    if (event.dataTransfer) event.dataTransfer.setData('text/plain', index.toString());
  }

  allowDrop(event: DragEvent, index: number) {
    event.preventDefault();
    const zone = this.dropZones()[index];
    if (!zone.currentItem) this.dragHoverIndex = index;
  }

  dragLeave(event: DragEvent) {
    this.dragHoverIndex = -1;
  }

  drop(event: DragEvent, zoneIndex: number) {
    event.preventDefault();
    this.dragHoverIndex = -1;
    
    const zone = this.dropZones()[zoneIndex];
    if (zone.currentItem || this.draggedItemIndex === -1) return;

    const item = this.dragItems()[this.draggedItemIndex];
    
    if (item.word === zone.matchWord) {
      this.audio.playSoundEffect('bell');
      this.dropZones.update(z => { z[zoneIndex].currentItem = item; return [...z]; });
      this.dragItems.update(items => items.filter((_, i) => i !== this.draggedItemIndex));
      
      if (this.dragItems().length === 0) {
        setTimeout(() => {
          this.audio.speak('أحسنت! أنت بطل!', 'ar-EG');
          this.gameWon.set(true);
          this.data.addStars(10);
        }, 500);
      }
    } else {
      this.audio.speak('حاول مرة أخرى', 'ar-EG');
    }
    
    this.draggedItemIndex = -1;
  }

  // --- MEMORY GAME LOGIC ---
  initMemoryGame() {
    this.memoryWon.set(false);
    this.flippedIndices = [];
    this.isProcessingFlip = false;
    
    // Pick 6 random letters for 12 cards
    const all = [...this.data.alphabetData].sort(() => 0.5 - Math.random()).slice(0, 6);
    let cards: MemoryCard[] = [];
    let idCounter = 0;
    
    all.forEach(a => {
      cards.push({ id: idCounter++, letter: a.letter, word: a.words[0].word, img: a.words[0].img, type: 'letter', isFlipped: false, isMatched: false });
      cards.push({ id: idCounter++, letter: a.letter, word: a.words[0].word, img: a.words[0].img, type: 'img', isFlipped: false, isMatched: false });
    });
    
    cards = cards.sort(() => 0.5 - Math.random());
    this.memoryCards.set(cards);
  }

  flipCard(index: number) {
    if (this.isProcessingFlip) return;
    
    const cards = this.memoryCards();
    if (cards[index].isFlipped || cards[index].isMatched) return;
    
    // Play small pop sound
    this.audio.speak(cards[index].type === 'letter' ? cards[index].letter : cards[index].word, 'en-US');

    this.memoryCards.update(c => { c[index].isFlipped = true; return [...c]; });
    this.flippedIndices.push(index);

    if (this.flippedIndices.length === 2) {
      this.isProcessingFlip = true;
      const idx1 = this.flippedIndices[0];
      const idx2 = this.flippedIndices[1];
      const c1 = cards[idx1];
      const c2 = cards[idx2];

      if (c1.letter === c2.letter) {
        // Match!
        setTimeout(() => {
          this.audio.playSoundEffect('bell');
          this.memoryCards.update(c => {
            c[idx1].isMatched = true;
            c[idx2].isMatched = true;
            return [...c];
          });
          this.flippedIndices = [];
          this.isProcessingFlip = false;
          
          if (this.memoryCards().every(c => c.isMatched)) {
            setTimeout(() => {
              this.audio.speak('أحسنت! ذاكرتك رائعة!', 'ar-EG');
              this.memoryWon.set(true);
              this.data.addStars(15);
            }, 500);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          this.memoryCards.update(c => {
            c[idx1].isFlipped = false;
            c[idx2].isFlipped = false;
            return [...c];
          });
          this.flippedIndices = [];
          this.isProcessingFlip = false;
        }, 1200);
      }
    }
  }

  // --- QUIZ GAME LOGIC ---
  initQuizGame() {
    this.quizWon.set(false);
    
    // Pick 4 random words
    const allWords = this.data.alphabetData.flatMap(a => a.words).sort(() => 0.5 - Math.random());
    const options = allWords.slice(0, 4);
    
    // Pick 1 target
    const target = options[Math.floor(Math.random() * options.length)];
    
    this.quizQuestion.set({
      targetWord: target.word,
      targetImg: target.img,
      options: options.sort(() => 0.5 - Math.random()) // shuffle them for display
    });
    
    setTimeout(() => {
      this.playQuizWord();
    }, 500);
  }

  playQuizWord() {
    const q = this.quizQuestion();
    if (q) {
      this.audio.speak(q.targetWord, 'en-US');
    }
  }

  checkQuizAnswer(word: string) {
    const q = this.quizQuestion();
    if (!q) return;
    
    if (word === q.targetWord) {
      // Success
      this.audio.playSoundEffect('bell');
      this.audio.speak('ممتاز! إجابة صحيحة!', 'ar-EG');
      this.quizWon.set(true);
      this.data.addStars(5);
    } else {
      // Wrong
      this.audio.speak('حاول مرة أخرى', 'ar-EG');
    }
  }

  // --- JOURNEY GAME LOGIC ---
  startJourney() {
    this.journeyLevelIndex.set(0);
    this.loadJourneyLevel();
  }

  resetJourney() {
    this.journeyState.set('start');
    this.journeyLevelIndex.set(0);
  }

  loadJourneyLevel() {
    const idx = this.journeyLevelIndex();
    if (idx >= this.data.alphabetData.length) {
      this.journeyState.set('finale');
      this.audio.playSoundEffect('bell');
      this.data.addStars(50); // Big reward!
      this.audio.speak('Congratulations! You are amazing!', 'en-US');
      return;
    }

    this.journeyState.set('playing');
    this.wrongJourneyIndex = -1;

    const letterData = this.data.alphabetData[idx];
    const targetWord = letterData.words[0]; // first word for that letter
    
    this.journeyTarget.set({
      letter: letterData.letter,
      word: targetWord.word,
      img: targetWord.img,
      ar: (targetWord as any).ar_word || 'ممتاز'
    });

    // Pick 2 random wrong words from other letters
    const allWords = this.data.alphabetData
        .filter((_, i) => i !== idx)
        .flatMap(a => a.words)
        .sort(() => 0.5 - Math.random());
    
    const wrongs = allWords.slice(0, 2);
    
    let options = [
      { ...targetWord, ar: 'صحيح', isCorrect: true },
      { ...wrongs[0], ar: 'خطأ', isCorrect: false },
      { ...wrongs[1], ar: 'خطأ', isCorrect: false }
    ];
    
    // Shuffle options
    options = options.sort(() => 0.5 - Math.random());
    this.journeyOptions.set(options);

    // Announce letter
    setTimeout(() => {
      this.audio.speak(letterData.letter, 'en-US');
    }, 600);
  }

  checkJourneyAnswer(opt: {word: string, isCorrect: boolean}, index: number) {
    if (this.journeyState() !== 'playing') return;

    if (opt.isCorrect) {
      this.audio.playSoundEffect('bell');
      this.journeyState.set('win');
      this.audio.speak(opt.word, 'en-US');
      this.data.addStars(2);

      setTimeout(() => {
        this.journeyLevelIndex.update(i => i + 1);
        this.loadJourneyLevel();
      }, 3500);
    } else {
      this.audio.playSoundEffect('error');
      this.wrongJourneyIndex = index;
      setTimeout(() => {
        this.wrongJourneyIndex = -1;
      }, 400);
    }
  }
}
