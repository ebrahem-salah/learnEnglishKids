import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { NgClass } from '@angular/common';

interface Balloon {
  id: number;
  letter: string;
  isTarget: boolean;
  popped: boolean;
  color: string;
  left: number;
  duration: number;
  delay: number;
}

@Component({
  selector: 'app-balloon-game',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-inner flex flex-col items-center select-none bg-gradient-to-b from-sky-300 to-sky-100" dir="ltr">
        
        <!-- UI Header -->
        <div class="absolute top-4 w-full flex justify-between items-center px-8 z-30 pointer-events-none">
            <div class="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full font-black text-xl text-sky-700 shadow-md">
                Score: {{ score() }}
            </div>
            
            <button (click)="repeatTarget(); $event.stopPropagation()" class="bg-yellow-400 pointer-events-auto hover:bg-yellow-500 text-sky-900 w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-110 active:scale-95">
                🔊
            </button>
        </div>

        @if (gameState() === 'start') {
            <div class="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4 bg-black/40 backdrop-blur-sm">
                <div class="bg-white p-8 rounded-[3rem] shadow-2xl max-w-sm w-full border-[8px] border-sky-400">
                    <div class="text-8xl mb-2 animate-bounce">🎈</div>
                    <h2 class="text-4xl font-black text-sky-600 mb-2 font-[Tajawal]">صائد البالونات</h2>
                    <p class="text-gray-600 mb-6 font-bold text-xl font-[Tajawal]">استمع للحرف وفرقع البالونة الصحيحة!</p>
                    <button (click)="startGame()" class="w-full py-4 font-[Tajawal] bg-sky-500 hover:bg-sky-600 text-white text-3xl font-black rounded-2xl shadow-[0_8px_0_#0284c7] active:translate-y-2 active:shadow-none transition-all">
                        ابدأ اللعب!
                    </button>
                </div>
            </div>
        } @else if (gameState() === 'playing') {
            
            <div class="absolute bottom-4 left-0 w-full text-center z-10 opacity-50 text-sky-800 font-bold text-lg pointer-events-none">
                Find: <span class="text-4xl">{{ targetLetter() }}</span>
            </div>

            <!-- Balloons -->
            <div class="w-full h-full relative">
                @for (b of balloons(); track b.id) {
                    @if (!b.popped) {
                        <div class="absolute cursor-pointer transform hover:scale-110 transition-transform active:scale-90"
                             [style.left.%]="b.left"
                             [style.animation]="'floatUp ' + b.duration + 's linear ' + b.delay + 's forwards'"
                             (click)="popBalloon(b)"
                             style="bottom: -150px;">
                             
                            <!-- SVG Balloon -->
                            <svg width="100" height="140" viewBox="0 0 100 140" class="drop-shadow-lg">
                                <path d="M50 110 C20 110 10 80 10 50 C10 20 25 10 50 10 C75 10 90 20 90 50 C90 80 80 110 50 110 Z" [attr.fill]="b.color"/>
                                <path d="M50 110 L45 120 L55 120 Z" [attr.fill]="b.color"/>
                                <path d="M50 120 Q60 130 50 140" fill="none" stroke="#ccc" stroke-width="2"/>
                            </svg>
                            <!-- Letter inside -->
                            <div class="absolute top-0 left-0 w-[100px] h-[110px] flex items-center justify-center">
                                <span class="text-5xl font-black text-white drop-shadow-md">{{ b.letter }}</span>
                            </div>
                        </div>
                    }
                }
            </div>

        }
    </div>
  `,
  styles: [`
    @keyframes floatUp {
        0% { transform: translateY(0) rotate(-5deg); opacity: 1; }
        50% { transform: translateY(-350px) rotate(5deg); }
        100% { transform: translateY(-800px) rotate(-5deg); opacity: 0; }
    }
  `]
})
export class BalloonGameComponent implements OnDestroy {
  data = inject(DataService);
  audio = inject(AudioService);

  gameState = signal<'start' | 'playing'>('start');
  score = signal(0);
  targetLetter = signal('');
  balloons = signal<Balloon[]>([]);
  
  private balloonIdCounter = 0;
  private colors = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
  private loopInterval: any;

  startGame() {
    this.score.set(0);
    this.gameState.set('playing');
    this.nextRound();
  }

  nextRound() {
    const chars = this.data.alphabetData.map(a => a.letter);
    const target = chars[Math.floor(Math.random() * chars.length)];
    this.targetLetter.set(target);
    
    // Voice prompt
    this.repeatTarget();

    // Generate 4-5 balloons
    const newBalloons: Balloon[] = [];
    
    // Target balloon
    newBalloons.push(this.createBalloon(target, true, 0));

    // Distractor balloons
    for (let i = 0; i < 3; i++) {
        const wrongLetter = chars[Math.floor(Math.random() * chars.length)];
        newBalloons.push(this.createBalloon(wrongLetter, false, Math.random() * 2));
    }

    // Shuffle
    newBalloons.sort(() => 0.5 - Math.random());
    
    // Spread them across screen horizontally
    const positions = [10, 35, 60, 80].sort(() => 0.5 - Math.random());
    newBalloons.forEach((b, i) => {
        b.left = positions[i];
    });

    this.balloons.set(newBalloons);

    // Refresh after 8 seconds if not clicked
    clearInterval(this.loopInterval);
    this.loopInterval = setInterval(() => {
        if (this.gameState() === 'playing') {
            this.nextRound();
        }
    }, 7000);
  }

  createBalloon(letter: string, isTarget: boolean, delay: number): Balloon {
      return {
          id: ++this.balloonIdCounter,
          letter,
          isTarget,
          popped: false,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          left: 0,
          duration: 5 + Math.random() * 2,
          delay
      };
  }

  popBalloon(b: Balloon) {
      if (b.popped) return;

      if (b.isTarget) {
          // Success
          this.audio.playSoundEffect('bell');
          this.data.addStars(1);
          this.score.update(s => s + 1);
          
          this.balloons.update(list => list.map(item => item.id === b.id ? {...item, popped: true} : item));
          
          clearInterval(this.loopInterval);
          setTimeout(() => this.nextRound(), 1000);
      } else {
          // Wrong
          this.audio.playSoundEffect('error');
          this.balloons.update(list => list.map(item => item.id === b.id ? {...item, popped: true} : item));
      }
  }

  repeatTarget() {
      if (this.targetLetter()) {
          this.audio.speak(this.targetLetter(), 'en-US');
      }
  }

  ngOnDestroy() {
      clearInterval(this.loopInterval);
  }
}
