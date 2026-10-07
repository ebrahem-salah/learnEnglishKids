import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

interface WordChallenge {
  word: string;
  ar: string;
  image: string;
  scrambled: { id: number; char: string; used: boolean }[];
}

@Component({
  selector: 'app-spelling-game',
  standalone: true,
  template: `
    <div class="relative w-full min-h-[580px] bg-gradient-to-b from-amber-100 via-orange-50 to-amber-200 rounded-3xl p-6 flex flex-col justify-between select-none border-4 border-amber-300 font-[Bubblegum]" dir="ltr">
      <!-- Top Header -->
      <div class="flex justify-between items-center bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-sm border-2 border-amber-200">
        <div class="text-xl md:text-2xl font-black text-amber-800 flex items-center gap-2">
          <span>🐝</span> Spelling Builder
        </div>
        <div class="flex items-center gap-3">
          <button (click)="speakWord()" class="bg-amber-400 hover:bg-amber-500 text-amber-950 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow transition-transform hover:scale-105 active:scale-95" title="Hear Word">
            🔊
          </button>
          <div class="bg-amber-100 text-amber-900 px-4 py-1.5 rounded-full font-black text-lg border border-amber-300">
            Score: {{ score() }} ⭐
          </div>
        </div>
      </div>

      @if (gameState() === 'start') {
        <div class="flex flex-col items-center justify-center text-center my-auto p-6">
          <div class="w-36 h-36 bg-amber-200 rounded-3xl flex items-center justify-center shadow-lg border-4 border-amber-400 mb-4 animate-bounce">
            <img src="assets/images/bee.png" class="w-28 h-28 object-contain" alt="Bee" />
          </div>
          <h2 class="text-4xl md:text-5xl font-black text-amber-900 mb-2">Word Builder 🐝</h2>
          <p class="text-amber-800 text-lg md:text-xl font-bold max-w-md mb-6">
            Look at the 3D picture, tap letters in the correct order to spell the word!
          </p>
          <button (click)="startGame()" class="px-10 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-2xl font-black rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            Start Spelling! 🚀
          </button>
        </div>
      } @else if (gameState() === 'playing') {
        <div class="flex flex-col items-center justify-center my-auto w-full max-w-2xl mx-auto">
          <!-- Picture Card -->
          <div class="relative bg-white rounded-3xl p-6 shadow-xl border-4 border-amber-300 flex flex-col items-center mb-6 w-full max-w-xs transition-transform hover:scale-105 cursor-pointer" (click)="speakWord()">
            <img [src]="'assets/images/' + currentChallenge().image" class="w-36 h-36 object-contain drop-shadow-md mb-2" [alt]="currentChallenge().word" />
            <div class="text-sm font-bold text-gray-400" dir="rtl">{{ currentChallenge().ar }}</div>
          </div>

          <!-- Answer Slots -->
          <div class="flex justify-center gap-2 md:gap-3 mb-8 flex-wrap">
            @for (slot of answerSlots(); track $index; let i = $index) {
              <div (click)="removeLetter(i)"
                   class="w-14 h-16 md:w-16 md:h-20 rounded-2xl border-3 flex items-center justify-center text-3xl md:text-4xl font-black transition-all cursor-pointer shadow-md"
                   [class]="slot ? 'bg-amber-500 text-white border-amber-600 scale-105' : 'bg-white/80 text-gray-300 border-dashed border-amber-400'">
                {{ slot || '_' }}
              </div>
            }
          </div>

          <!-- Scrambled Letter Tiles -->
          <div class="flex justify-center gap-3 flex-wrap">
            @for (item of currentChallenge().scrambled; track item.id) {
              <button (click)="pickLetter(item)"
                      [disabled]="item.used"
                      class="w-14 h-14 md:w-16 md:h-16 rounded-2xl font-black text-2xl md:text-3xl shadow-lg border-2 transition-all"
                      [class]="item.used ? 'opacity-25 bg-gray-200 border-gray-300 pointer-events-none scale-90' : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100 hover:scale-110 active:scale-95'">
                {{ item.char }}
              </button>
            }
          </div>
        </div>
      } @else if (gameState() === 'won') {
        <div class="flex flex-col items-center justify-center text-center my-auto p-6">
          <div class="text-8xl mb-4 animate-bounce">🏆</div>
          <h2 class="text-4xl font-black text-green-700 mb-2">Great Spelling! 🌟</h2>
          <p class="text-xl text-gray-700 font-bold mb-6">You spelled every single word like a pro!</p>
          <button (click)="startGame()" class="px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-xl font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
            Play Again 🔄
          </button>
        </div>
      }

      <!-- Bottom Hint/Control Bar -->
      @if (gameState() === 'playing') {
        <div class="flex justify-between items-center text-amber-800 text-sm md:text-base font-bold pt-2 border-t border-amber-200">
          <span>Tap letters to spell • Tap slot to remove</span>
          <button (click)="clearCurrentWord()" class="text-red-600 hover:text-red-700 bg-red-100 px-3 py-1 rounded-xl">
            Reset Word ↺
          </button>
        </div>
      }
    </div>
  `
})
export class SpellingGameComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  gameState = signal<'start' | 'playing' | 'won'>('start');
  score = signal(0);
  currentIndex = 0;

  wordsPool: { word: string; ar: string; image: string }[] = [
    { word: 'CAT', ar: 'قطة', image: 'cat.png' },
    { word: 'DOG', ar: 'كلب', image: 'dog.png' },
    { word: 'SUN', ar: 'شمس', image: 'sun.png' },
    { word: 'BEE', ar: 'نحلة', image: 'bee.png' },
    { word: 'BUS', ar: 'حافلة', image: 'bus.png' },
    { word: 'CAR', ar: 'سيارة', image: 'car.png' },
    { word: 'LION', ar: 'أسد', image: 'lion.png' },
    { word: 'DUCK', ar: 'بطة', image: 'duck.png' },
    { word: 'FISH', ar: 'سمكة', image: 'clown_fish.png' },
    { word: 'MOON', ar: 'قمر', image: 'moon.png' },
    { word: 'STAR', ar: 'نجمة', image: 'star.png' },
    { word: 'BOOK', ar: 'كتاب', image: 'book.png' },
    { word: 'APPLE', ar: 'تفاحة', image: 'apple.png' },
    { word: 'HORSE', ar: 'حصان', image: 'horse.png' }
  ];

  currentChallenge = signal<WordChallenge>({
    word: '',
    ar: '',
    image: '',
    scrambled: []
  });

  answerSlots = signal<string[]>([]);

  startGame() {
    this.score.set(0);
    this.currentIndex = 0;
    this.wordsPool.sort(() => Math.random() - 0.5);
    this.loadChallenge();
    this.gameState.set('playing');
  }

  loadChallenge() {
    if (this.currentIndex >= this.wordsPool.length) {
      this.gameState.set('won');
      this.data.stars.update(s => s + 15);
      this.data.save();
      this.audio.playCelebration();
      return;
    }

    const item = this.wordsPool[this.currentIndex];
    const letters = item.word.split('').map((char, id) => ({ id, char, used: false }));
    const scrambled = [...letters].sort(() => Math.random() - 0.5);

    this.currentChallenge.set({
      word: item.word,
      ar: item.ar,
      image: item.image,
      scrambled
    });

    this.answerSlots.set(new Array(item.word.length).fill(''));
    this.speakWord();
  }

  speakWord() {
    const w = this.currentChallenge().word;
    if (w) this.audio.speak(w, 'en-US');
  }

  pickLetter(item: { id: number; char: string; used: boolean }) {
    const slots = [...this.answerSlots()];
    const firstEmpty = slots.findIndex(s => s === '');
    if (firstEmpty === -1) return;

    slots[firstEmpty] = item.char;
    item.used = true;
    this.answerSlots.set(slots);
    this.audio.playSoundEffect('pop');

    // Check if fully filled
    if (!slots.includes('')) {
      const spelled = slots.join('');
      if (spelled === this.currentChallenge().word) {
        this.audio.playSoundEffect('ding');
        this.audio.speak('Correct! ' + this.currentChallenge().word, 'en-US');
        this.score.update(s => s + 5);
        setTimeout(() => {
          this.currentIndex++;
          this.loadChallenge();
        }, 1200);
      } else {
        this.audio.playSoundEffect('buzz');
        this.audio.speak('Try again!', 'en-US');
        setTimeout(() => this.clearCurrentWord(), 800);
      }
    }
  }

  removeLetter(index: number) {
    const slots = [...this.answerSlots()];
    const char = slots[index];
    if (!char) return;

    // Find the first matching used letter in scrambled
    const match = this.currentChallenge().scrambled.find(s => s.char === char && s.used);
    if (match) match.used = false;

    slots[index] = '';
    this.answerSlots.set(slots);
    this.audio.playSoundEffect('pop');
  }

  clearCurrentWord() {
    this.currentChallenge().scrambled.forEach(s => s.used = false);
    this.answerSlots.set(new Array(this.currentChallenge().word.length).fill(''));
  }
}
