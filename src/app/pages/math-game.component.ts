import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-math-game',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-inner flex flex-col items-center select-none bg-gradient-to-b from-teal-200 to-teal-50" dir="ltr">
        
        <!-- Score & Audio -->
        <div class="absolute top-4 w-full flex justify-between items-center px-8 z-30 pointer-events-none">
            <div class="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full font-black text-xl text-teal-700 shadow-md">
                Score: {{ score() }}
            </div>
            
            <button (click)="repeatInstruction(); $event.stopPropagation()" class="bg-yellow-400 pointer-events-auto hover:bg-yellow-500 text-teal-900 w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-110 active:scale-95">
                🔊
            </button>
        </div>

        @if (gameState() === 'start') {
            <div class="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4 bg-black/40 backdrop-blur-sm">
                <div class="bg-white p-8 rounded-[3rem] shadow-2xl max-w-sm w-full border-[8px] border-teal-400">
                    <div class="text-8xl mb-2 animate-bounce">🧮</div>
                    <h2 class="text-4xl font-black text-teal-600 mb-2 font-[Tajawal]">الحساب الذكي</h2>
                    <p class="text-gray-600 mb-6 font-bold text-xl font-[Tajawal]">اجمع الأرقام واختر الإجابة الصحيحة!</p>
                    <button (click)="startGame()" class="w-full py-4 font-[Tajawal] bg-teal-500 hover:bg-teal-600 text-white text-3xl font-black rounded-2xl shadow-[0_8px_0_#0f766e] active:translate-y-2 active:shadow-none transition-all">
                        ابدأ اللعب!
                    </button>
                </div>
            </div>
        } @else {
            <div class="w-full h-full flex flex-col items-center justify-center pt-10">
                
                <!-- Chalkboard Equation -->
                <div class="bg-gray-800 border-[12px] border-amber-700 rounded-2xl w-11/12 max-w-lg h-64 flex flex-col items-center justify-center shadow-2xl relative mb-10">
                    <div class="absolute bottom-2 left-4 w-12 h-3 bg-white/20 rounded-full"></div> <!-- Chalk -->
                    <div class="absolute bottom-2 left-20 w-16 h-6 bg-red-400/80 rounded-md"></div> <!-- Eraser -->

                    <div class="flex items-center gap-4 text-7xl font-black text-white font-mono">
                        <span>{{ num1() }}</span>
                        <span class="text-yellow-400">+</span>
                        <span>{{ num2() }}</span>
                        <span class="text-yellow-400">=</span>
                        
                        <div class="w-24 h-24 border-4 border-dashed border-white rounded-xl flex items-center justify-center bg-white/10"
                             [class.border-green-400]="isCorrect()"
                             [class.bg-green-400/20]="isCorrect()">
                            @if (selectedAnswer() !== null) {
                                <span class="text-7xl font-black" [class.text-green-400]="isCorrect()" [class.text-red-400]="!isCorrect() && selectedAnswer() !== null">
                                    {{ selectedAnswer() }}
                                </span>
                            } @else {
                                <span class="text-4xl text-white/30">?</span>
                            }
                        </div>
                    </div>
                </div>

                <!-- Answer Options -->
                <div class="flex gap-6">
                    @for (opt of options(); track opt; let i = $index) {
                        <button (click)="checkAnswer(opt)"
                                [disabled]="isCorrect()"
                                class="w-24 h-24 rounded-2xl text-5xl font-black text-white shadow-[0_8px_0_rgba(0,0,0,0.2)] hover:scale-110 active:translate-y-2 active:shadow-none transition-all flex items-center justify-center"
                                [ngClass]="getButtonColor(i)">
                            {{ opt }}
                        </button>
                    }
                </div>
                
            </div>
        }
    </div>
  `
})
export class MathGameComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  gameState = signal<'start' | 'playing'>('start');
  score = signal(0);
  
  num1 = signal(0);
  num2 = signal(0);
  targetSum = signal(0);
  options = signal<number[]>([]);
  
  selectedAnswer = signal<number | null>(null);
  isCorrect = signal(false);

  private btnColors = ['bg-blue-500', 'bg-pink-500', 'bg-orange-500'];

  startGame() {
    this.score.set(0);
    this.gameState.set('playing');
    this.nextRound();
  }

  nextRound() {
    this.selectedAnswer.set(null);
    this.isCorrect.set(false);

    // Generate random numbers (1 to 5 for simplicity)
    const n1 = Math.floor(Math.random() * 5) + 1;
    const n2 = Math.floor(Math.random() * 5) + 1;
    const sum = n1 + n2;

    this.num1.set(n1);
    this.num2.set(n2);
    this.targetSum.set(sum);

    // Generate options
    let wrong1 = sum + Math.floor(Math.random() * 3) + 1;
    let wrong2 = sum - Math.floor(Math.random() * 3) - 1;
    if (wrong2 <= 0) wrong2 = sum + 4;
    
    // Ensure uniqueness
    if (wrong1 === wrong2) wrong2 += 1;

    const opts = [sum, wrong1, wrong2].sort(() => 0.5 - Math.random());
    this.options.set(opts);

    setTimeout(() => this.repeatInstruction(), 500);
  }

  checkAnswer(ans: number) {
      this.selectedAnswer.set(ans);
      
      if (ans === this.targetSum()) {
          // Correct
          this.isCorrect.set(true);
          this.audio.playSoundEffect('bell');
          this.score.update(s => s + 1);
          this.data.addStars(2);
          
          this.audio.speak(ans.toString(), 'en-US');
          
          setTimeout(() => this.nextRound(), 2000);
      } else {
          // Wrong
          this.audio.playSoundEffect('error');
          setTimeout(() => {
              if (!this.isCorrect()) this.selectedAnswer.set(null);
          }, 800);
      }
  }

  getButtonColor(index: number): string {
      return this.btnColors[index % this.btnColors.length];
  }

  repeatInstruction() {
      if (this.gameState() === 'playing') {
          this.audio.speak(`How much is ${this.num1()} plus ${this.num2()}?`, 'en-US');
      }
  }
}
