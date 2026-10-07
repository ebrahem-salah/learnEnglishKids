import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

type SimonColor = 'red' | 'blue' | 'green' | 'yellow';

interface ColorPad {
  color: SimonColor;
  label: string;
  soundNote: string;
  bgClass: string;
  activeClass: string;
  borderClass: string;
  image: string;
}

@Component({
  selector: 'app-pattern-memory-game',
  standalone: true,
  template: `
    <div class="relative w-full min-h-[580px] bg-gradient-to-b from-violet-100 via-purple-50 to-pink-100 rounded-3xl p-6 flex flex-col justify-between select-none border-4 border-purple-300 font-[Bubblegum]" dir="ltr">
      <!-- Top Header -->
      <div class="flex justify-between items-center bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-sm border-2 border-purple-200">
        <div class="text-xl md:text-2xl font-black text-purple-800 flex items-center gap-2">
          <span>🧠</span> Pattern Simon Memory
        </div>
        <div class="flex items-center gap-3">
          <div class="bg-purple-100 text-purple-900 px-4 py-1.5 rounded-full font-black text-lg border border-purple-300">
            Round: {{ level() }} ⭐
          </div>
        </div>
      </div>

      @if (gameState() === 'start') {
        <div class="flex flex-col items-center justify-center text-center my-auto p-6">
          <div class="w-36 h-36 bg-purple-200 rounded-3xl flex items-center justify-center shadow-lg border-4 border-purple-400 mb-4 animate-bounce">
            <span class="text-6xl">✨</span>
          </div>
          <h2 class="text-4xl md:text-5xl font-black text-purple-900 mb-2">Pattern Memory 🔴🔵🟢🟡</h2>
          <p class="text-purple-800 text-lg md:text-xl font-bold max-w-md mb-6">
            Watch the light flashes carefully, remember the sequence, and repeat the pattern!
          </p>
          <button (click)="startGame()" class="px-10 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-2xl font-black rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            Start Challenge! 🚀
          </button>
        </div>
      } @else if (gameState() === 'playing') {
        <div class="flex flex-col items-center justify-center my-auto w-full max-w-md mx-auto">
          <!-- Status Banner -->
          <div class="mb-6 px-6 py-2 rounded-2xl text-xl font-black text-center shadow-sm"
               [class]="isShowingPattern() ? 'bg-amber-100 text-amber-900 border-2 border-amber-300 animate-pulse' : 'bg-green-100 text-green-900 border-2 border-green-300'">
            {{ isShowingPattern() ? '👀 Watch the pattern...' : '👉 Your turn! Tap the colors' }}
          </div>

          <!-- 4 Circular / Rounded Simon Pads -->
          <div class="grid grid-cols-2 gap-4 w-full">
            @for (pad of pads; track pad.color) {
              <button (click)="padClick(pad.color)"
                      [disabled]="isShowingPattern()"
                      class="h-36 md:h-44 rounded-3xl flex flex-col items-center justify-center p-4 shadow-xl border-4 transition-all duration-200 select-none group"
                      [class]="pad.borderClass + ' ' + (activeColor() === pad.color ? pad.activeClass + ' scale-105 shadow-2xl brightness-125' : pad.bgClass + ' hover:scale-102')">
                <img [src]="'assets/images/' + pad.image" class="w-16 h-16 md:w-20 md:h-20 object-contain drop-shadow mb-1 pointer-events-none" [alt]="pad.label" />
                <span class="text-xl md:text-2xl font-black text-white drop-shadow">{{ pad.label }}</span>
              </button>
            }
          </div>
        </div>
      } @else if (gameState() === 'gameover') {
        <div class="flex flex-col items-center justify-center text-center my-auto p-6">
          <div class="text-8xl mb-4">💥</div>
          <h2 class="text-4xl font-black text-purple-900 mb-2">Nice Try!</h2>
          <p class="text-xl text-gray-700 font-bold mb-6">You reached Round {{ level() }}! Practice makes perfect!</p>
          <button (click)="startGame()" class="px-8 py-3 bg-purple-500 hover:bg-purple-600 text-white text-xl font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
            Try Again 🔄
          </button>
        </div>
      }

      @if (gameState() === 'playing') {
        <div class="text-center text-purple-800 text-sm md:text-base font-bold pt-2 border-t border-purple-200">
          Target Pattern Length: {{ pattern.length }} steps
        </div>
      }
    </div>
  `
})
export class PatternMemoryGameComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  gameState = signal<'start' | 'playing' | 'gameover'>('start');
  level = signal(1);
  activeColor = signal<SimonColor | null>(null);
  isShowingPattern = signal(false);

  pattern: SimonColor[] = [];
  playerStep = 0;

  pads: ColorPad[] = [
    {
      color: 'red',
      label: 'Red',
      soundNote: 'pop',
      bgClass: 'bg-red-500',
      activeClass: 'bg-red-400 ring-8 ring-red-200',
      borderClass: 'border-red-600',
      image: 'red_color.png'
    },
    {
      color: 'blue',
      label: 'Blue',
      soundNote: 'ding',
      bgClass: 'bg-blue-500',
      activeClass: 'bg-blue-400 ring-8 ring-blue-200',
      borderClass: 'border-blue-600',
      image: 'blue_color.png'
    },
    {
      color: 'green',
      label: 'Green',
      soundNote: 'bell',
      bgClass: 'bg-green-500',
      activeClass: 'bg-green-400 ring-8 ring-green-200',
      borderClass: 'border-green-600',
      image: 'green_color.png'
    },
    {
      color: 'yellow',
      label: 'Yellow',
      soundNote: 'pop',
      bgClass: 'bg-amber-400',
      activeClass: 'bg-yellow-300 ring-8 ring-yellow-200',
      borderClass: 'border-amber-500',
      image: 'yellow_color.png'
    }
  ];

  colorsList: SimonColor[] = ['red', 'blue', 'green', 'yellow'];

  startGame() {
    this.level.set(1);
    this.pattern = [];
    this.gameState.set('playing');
    this.nextRound();
  }

  nextRound() {
    this.playerStep = 0;
    const randomColor = this.colorsList[Math.floor(Math.random() * this.colorsList.length)];
    this.pattern.push(randomColor);
    this.playbackPattern();
  }

  async playbackPattern() {
    this.isShowingPattern.set(true);
    await new Promise(r => setTimeout(r, 600));

    for (let i = 0; i < this.pattern.length; i++) {
      const col = this.pattern[i];
      await this.flashColor(col);
      await new Promise(r => setTimeout(r, 300));
    }

    this.isShowingPattern.set(false);
  }

  flashColor(color: SimonColor): Promise<void> {
    return new Promise(resolve => {
      this.activeColor.set(color);
      this.audio.speak(color, 'en-US');
      setTimeout(() => {
        this.activeColor.set(null);
        resolve();
      }, 500);
    });
  }

  padClick(color: SimonColor) {
    if (this.isShowingPattern() || this.gameState() !== 'playing') return;

    // Flash clicked pad
    this.activeColor.set(color);
    this.audio.speak(color, 'en-US');
    setTimeout(() => this.activeColor.set(null), 250);

    if (color === this.pattern[this.playerStep]) {
      this.playerStep++;
      if (this.playerStep === this.pattern.length) {
        // Round completed!
        this.data.stars.update(s => s + 2);
        this.data.save();
        this.audio.playSoundEffect('ding');
        this.level.update(l => l + 1);
        setTimeout(() => this.nextRound(), 1000);
      }
    } else {
      // Wrong sequence
      this.audio.playSoundEffect('buzz');
      this.audio.speak('Game over! Great effort!', 'en-US');
      this.gameState.set('gameover');
    }
  }
}
