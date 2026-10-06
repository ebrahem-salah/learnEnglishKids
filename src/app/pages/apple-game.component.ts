import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { NgClass } from '@angular/common';

interface Apple {
  id: number;
  dropped: boolean;
  left: number;
  top: number;
}

@Component({
  selector: 'app-apple-game',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-inner flex flex-col justify-end select-none bg-gradient-to-b from-sky-200 to-sky-100" dir="ltr">
        
        <div class="absolute top-4 w-full flex justify-between items-center px-8 z-30 pointer-events-none">
            <div class="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full font-black text-xl text-red-700 shadow-md">
                Score: {{ score() }}
            </div>
            
            <button (click)="repeatInstruction(); $event.stopPropagation()" class="bg-yellow-400 pointer-events-auto hover:bg-yellow-500 text-red-900 w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-110 active:scale-95">
                🔊
            </button>
        </div>

        @if (gameState() === 'start') {
            <div class="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4 bg-black/40 backdrop-blur-sm">
                <div class="bg-white p-8 rounded-[3rem] shadow-2xl max-w-sm w-full border-[8px] border-red-400">
                    <div class="text-8xl mb-2 flex justify-center animate-bounce">
                        🍎
                    </div>
                    <h2 class="text-4xl font-black text-red-600 mb-2 font-[Tajawal]">سلة التفاح</h2>
                    <p class="text-gray-600 mb-6 font-bold text-xl font-[Tajawal]">استمع للرقم وضع التفاح في السلة!</p>
                    <button (click)="startGame()" class="w-full py-4 font-[Tajawal] bg-red-500 hover:bg-red-600 text-white text-3xl font-black rounded-2xl shadow-[0_8px_0_#b91c1c] active:translate-y-2 active:shadow-none transition-all">
                        ابدأ اللعب!
                    </button>
                </div>
            </div>
        } @else {
            
            <!-- Target Number Display -->
            <div class="absolute top-6 left-0 right-0 mx-auto w-32 h-32 bg-white/90 backdrop-blur-md rounded-full shadow-lg border-4 border-red-400 flex flex-col items-center justify-center z-20">
                <span class="text-5xl font-black text-red-600">{{ targetNumber() }}</span>
            </div>

            <!-- Scenery -->
            <div class="absolute bottom-0 w-full h-1/4 bg-green-500 border-t-8 border-green-600 z-0"></div>

            <!-- Tree -->
            <div class="absolute bottom-12 left-1/2 -translate-x-1/2 w-80 h-96 z-10 flex flex-col items-center">
                <!-- Canopy -->
                <div class="w-80 h-80 bg-green-600 rounded-full shadow-[0_10px_0_#16a34a] relative">
                    <!-- Apples -->
                    @for (apple of apples(); track apple.id) {
                        <div class="absolute text-5xl cursor-pointer transition-all duration-700 hover:scale-110"
                             [style.left.%]="apple.left"
                             [style.top.%]="apple.top"
                             [style.transform]="apple.dropped ? 'translateY(350px) scale(0.8)' : 'translateY(0) scale(1)'"
                             [style.opacity]="apple.dropped ? '0' : '1'"
                             (click)="dropApple(apple)">
                            🍎
                        </div>
                    }
                </div>
                <!-- Trunk -->
                <div class="w-16 h-32 bg-yellow-800 -mt-8"></div>
            </div>

            <!-- Basket -->
            <div class="absolute bottom-4 left-8 z-20 flex flex-col items-center">
                <div class="text-3xl font-black text-red-800 mb-2 bg-white/80 px-4 rounded-full shadow-sm">{{ droppedCount() }}</div>
                <div class="text-8xl filter drop-shadow-xl">🧺</div>
            </div>

            <!-- Submit Button -->
            <div class="absolute bottom-8 right-8 z-20">
                <button (click)="checkAnswer()" 
                        class="bg-green-500 hover:bg-green-600 text-white w-24 h-24 rounded-full flex items-center justify-center text-5xl shadow-[0_8px_0_#16a34a] active:translate-y-2 active:shadow-none transition-all">
                    ✅
                </button>
            </div>
        }
    </div>
  `
})
export class AppleGameComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  gameState = signal<'start' | 'playing'>('start');
  score = signal(0);
  
  targetNumber = signal(0);
  apples = signal<Apple[]>([]);
  droppedCount = signal(0);

  startGame() {
    this.score.set(0);
    this.gameState.set('playing');
    this.nextRound();
  }

  nextRound() {
    this.droppedCount.set(0);
    
    // Random target between 1 and 9
    const target = Math.floor(Math.random() * 9) + 1;
    this.targetNumber.set(target);

    // Generate 10 apples in random positions within the tree canopy circle (approx)
    const newApples: Apple[] = [];
    for (let i = 0; i < 10; i++) {
        newApples.push({
            id: i,
            dropped: false,
            left: 20 + Math.random() * 50, // 20% to 70% width
            top: 20 + Math.random() * 50   // 20% to 70% height
        });
    }
    this.apples.set(newApples);

    setTimeout(() => this.repeatInstruction(), 500);
  }

  dropApple(apple: Apple) {
      if (apple.dropped || this.gameState() !== 'playing') return;
      
      this.audio.playSoundEffect('bubble' as any); // use a nice pop sound, fallback to anything
      
      this.apples.update(list => list.map(a => a.id === apple.id ? {...a, dropped: true} : a));
      this.droppedCount.update(c => c + 1);
  }

  checkAnswer() {
      if (this.droppedCount() === this.targetNumber()) {
          // Success
          this.audio.playSoundEffect('bell');
          this.audio.speak('Excellent', 'en-US');
          this.score.update(s => s + 1);
          this.data.addStars(2);
          
          setTimeout(() => this.nextRound(), 2000);
      } else {
          // Wrong
          this.audio.playSoundEffect('error');
          this.audio.speak('حاول مرة أخرى', 'ar-EG');
          // Reset apples
          this.apples.update(list => list.map(a => ({...a, dropped: false})));
          this.droppedCount.set(0);
      }
  }

  repeatInstruction() {
      if (this.targetNumber() > 0 && this.gameState() === 'playing') {
          this.audio.speak(this.targetNumber().toString(), 'en-US');
      }
  }
}
