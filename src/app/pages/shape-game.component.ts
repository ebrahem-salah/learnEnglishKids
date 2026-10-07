import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

interface AppColor { en: string; ar: string; hex: string; }
interface AppShape { en: string; ar: string; path: string; }

@Component({
  selector: 'app-shape-game',
  standalone: true,
  template: `
    <div class="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-inner flex flex-col items-center select-none bg-amber-50" dir="ltr">
        
        <div class="absolute top-4 w-full flex justify-between items-center px-8 z-30 pointer-events-none">
            <div class="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full font-black text-xl text-amber-700 shadow-md">
                Score: {{ score() }}
            </div>
            
            <button (click)="repeatInstruction(); $event.stopPropagation()" class="bg-yellow-400 pointer-events-auto hover:bg-yellow-500 text-amber-900 w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-110 active:scale-95">
                🔊
            </button>
        </div>

        @if (gameState() === 'start') {
            <div class="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4 bg-black/40 backdrop-blur-sm">
                <div class="bg-white p-8 rounded-[3rem] shadow-2xl max-w-sm w-full border-[8px] border-amber-400">
                    <div class="text-8xl mb-2 flex justify-center gap-2 animate-bounce">
                        <span style="color:#ef4444">🎨</span>
                    </div>
                    <h2 class="text-4xl font-black text-amber-600 mb-2 font-[Bubblegum]">Shape Colors</h2>
                    <p class="text-gray-600 mb-6 font-bold text-xl">Listen and color the shape!</p>
                    <button (click)="startGame()" class="w-full py-4 font-[Bubblegum] bg-amber-500 hover:bg-amber-600 text-white text-3xl font-black rounded-2xl shadow-[0_8px_0_#d97706] active:translate-y-2 active:shadow-none transition-all">
                        Start Game!
                    </button>
                </div>
            </div>
        } @else {
            <div class="w-full h-full flex flex-col items-center justify-between pb-8 pt-20">
                <!-- Instruction text -->
                <div class="text-center mb-4">
                    <h2 class="text-4xl font-black text-gray-800 tracking-wide uppercase font-[Bubblegum]">{{ targetColor()?.en }}</h2>
                </div>

                <!-- Shape Canvas -->
                <div class="relative w-64 h-64 flex items-center justify-center animate-[bounceIn_0.5s_ease-out]">
                    <svg viewBox="0 0 100 100" class="w-full h-full drop-shadow-2xl transition-colors duration-500">
                        <!-- Shape outline and fill -->
                        <path [attr.d]="targetShape()?.path" 
                              [attr.fill]="currentFill()"
                              stroke="#334155" 
                              stroke-width="4"
                              stroke-linejoin="round" />
                        
                        <!-- Smiley face (only shows when colored) -->
                        @if (isColored()) {
                            <g class="animate-pulse">
                                <circle cx="35" cy="40" r="5" fill="#1e293b"/>
                                <circle cx="65" cy="40" r="5" fill="#1e293b"/>
                                <path d="M 35 60 Q 50 75 65 60" fill="none" stroke="#1e293b" stroke-width="4" stroke-linecap="round"/>
                            </g>
                        }
                    </svg>
                </div>

                <!-- Color Palette -->
                <div class="w-full max-w-md px-6 mt-8">
                    <div class="bg-white p-4 rounded-3xl shadow-lg border-4 border-gray-100 flex justify-evenly">
                        @for (color of palette(); track color.en) {
                            <button (click)="applyColor(color)"
                                    class="w-14 h-14 rounded-full border-4 shadow-sm hover:scale-110 active:scale-95 transition-transform"
                                    [style.backgroundColor]="color.hex"
                                    [class.border-gray-800]="selectedColor() === color"
                                    [class.border-white]="selectedColor() !== color">
                            </button>
                        }
                    </div>
                </div>
            </div>
        }
    </div>
  `
})
export class ShapeGameComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  gameState = signal<'start' | 'playing'>('start');
  score = signal(0);
  
  targetColor = signal<AppColor | null>(null);
  targetShape = signal<AppShape | null>(null);
  
  palette = signal<AppColor[]>([]);
  selectedColor = signal<AppColor | null>(null);
  currentFill = signal('#ffffff');
  isColored = signal(false);

  private allColors: AppColor[] = [
      { en: 'Red', ar: 'أحمر', hex: '#ef4444' },
      { en: 'Blue', ar: 'أزرق', hex: '#3b82f6' },
      { en: 'Green', ar: 'أخضر', hex: '#22c55e' },
      { en: 'Yellow', ar: 'أصفر', hex: '#facc15' },
      { en: 'Orange', ar: 'برتقالي', hex: '#f97316' },
      { en: 'Purple', ar: 'بنفسجي', hex: '#a855f7' },
      { en: 'Pink', ar: 'وردي', hex: '#ec4899' }
  ];

  private allShapes: AppShape[] = [
      { en: 'Circle', ar: 'دائرة', path: 'M 50 5 A 45 45 0 1 1 49.9 5' },
      { en: 'Square', ar: 'مربع', path: 'M 10 10 H 90 V 90 H 10 Z' },
      { en: 'Triangle', ar: 'مثلث', path: 'M 50 10 L 90 90 L 10 90 Z' },
      { en: 'Star', ar: 'نجمة', path: 'M 50 5 L 61 38 L 96 38 L 68 59 L 78 92 L 50 72 L 22 92 L 32 59 L 4 38 L 39 38 Z' },
      { en: 'Heart', ar: 'قلب', path: 'M 50 30 C 50 30 45 10 25 10 C 5 10 5 40 5 40 C 5 60 50 95 50 95 C 50 95 95 60 95 40 C 95 40 95 10 75 10 C 55 10 50 30 50 30 Z' }
  ];

  startGame() {
    this.score.set(0);
    this.gameState.set('playing');
    this.nextRound();
  }

  nextRound() {
    this.isColored.set(false);
    this.currentFill.set('#ffffff');
    this.selectedColor.set(null);

    // Pick shape
    const shape = this.allShapes[Math.floor(Math.random() * this.allShapes.length)];
    this.targetShape.set(shape);

    // Pick color
    const shuffledColors = [...this.allColors].sort(() => 0.5 - Math.random());
    const targetC = shuffledColors[0];
    this.targetColor.set(targetC);

    // Prepare palette (target + 4 random distractors)
    let roundPalette = shuffledColors.slice(0, 5);
    roundPalette = roundPalette.sort(() => 0.5 - Math.random());
    this.palette.set(roundPalette);

    setTimeout(() => this.repeatInstruction(), 400);
  }

  applyColor(color: AppColor) {
      if (this.isColored()) return;

      this.selectedColor.set(color);
      
      if (color.en === this.targetColor()?.en) {
          // Success
          this.currentFill.set(color.hex);
          this.isColored.set(true);
          this.audio.playSoundEffect('bell');
          this.score.update(s => s + 1);
          this.data.addStars(2);
          
          setTimeout(() => this.audio.speak(this.targetShape()!.en, 'en-US'), 500);

          setTimeout(() => {
              this.nextRound();
          }, 2500);
      } else {
          // Wrong
          this.audio.playSoundEffect('error');
          // Give brief feedback by flashing color then reverting
          this.currentFill.set(color.hex);
          setTimeout(() => {
              if (!this.isColored()) this.currentFill.set('#ffffff');
          }, 400);
      }
  }

  repeatInstruction() {
      if (this.targetColor() && this.gameState() === 'playing') {
          this.audio.speak(this.targetColor()!.en, 'en-US');
      }
  }
}
