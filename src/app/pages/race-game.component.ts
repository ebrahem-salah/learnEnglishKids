import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { GameCardComponent } from './game-card.component';
import { ALPHABET, GameWord, Timers, pick, shuffle, wordPool } from './game-utils';

@Component({
  selector: 'app-race-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .wrong { animation: wiggle .35s; }
    @keyframes wiggle { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .road { background: repeating-linear-gradient(90deg, transparent 0 40px, rgba(255,255,255,.55) 40px 70px); }
  `],
  template: `
    <div class="relative w-full h-[80vh] min-h-[600px] max-h-[940px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-sky-200 to-emerald-100 flex flex-col"
         dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <!-- Track -->
      <div class="px-3 pt-4 space-y-3">
        <div class="relative h-16 bg-slate-600 rounded-2xl overflow-hidden border-4 border-slate-700">
          <div class="road absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 opacity-80"></div>
          <span class="absolute right-1 top-1 text-3xl">🏁</span>
          <span class="absolute top-2 text-4xl transition-all duration-500 ease-out -scale-x-100"
                [style.left.%]="clamp(me())">🚗</span>
        </div>
        <div class="relative h-16 bg-slate-600 rounded-2xl overflow-hidden border-4 border-slate-700">
          <div class="road absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 opacity-80"></div>
          <span class="absolute right-1 top-1 text-3xl">🏁</span>
          <span class="absolute top-2 text-4xl transition-all duration-500 linear -scale-x-100"
                [style.left.%]="clamp(rival())">🚙</span>
        </div>
      </div>

      @if (q(); as cur) {
        <div class="flex-1 flex flex-col items-center justify-center gap-3 px-4">
          <p class="font-black text-slate-700 text-xl">Which letter does it start with?</p>
          <button (click)="say()" class="bg-white rounded-3xl px-8 py-3 shadow-lg border-4 border-sky-300 flex items-center gap-4">
            <span class="text-7xl">{{ cur.word.emoji }}</span>
            <span class="text-3xl">🔊</span>
          </button>
          <div class="flex gap-4 mt-2">
            @for (o of cur.options; track o) {
              <button (click)="answer(o)" [disabled]="locked()"
                      class="w-24 h-24 rounded-3xl bg-white border-4 text-5xl font-black shadow-[0_8px_0_#38bdf8] active:translate-y-2 active:shadow-none transition-all"
                      [class]="wrongPick() === o ? 'wrong border-red-400 text-red-500' : 'border-sky-300 text-sky-700'">
                {{ o }}
              </button>
            }
          </div>
        </div>
      }

      @if (state() === 'start') {
        <app-game-card icon="🏎️" title="Car Race" text="Answer correctly to speed up your car. Beat the blue car to the finish line!" button="Ready, Go!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card [icon]="won() ? '🏆' : '🚙'" [title]="won() ? 'You won!' : 'So close!'"
                       [text]="won() ? 'You are a super racer!' : 'Try again, you can beat it!'" button="Race again" (play)="start()" />
      }
    </div>
  `
})
export class RaceGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private timers = new Timers();
  private pool: GameWord[] = [];

  state = signal<'start' | 'playing' | 'over'>('start');
  me = signal(0);
  rival = signal(0);
  won = signal(false);
  locked = signal(false);
  wrongPick = signal<string | null>(null);
  q = signal<{ word: GameWord; options: string[] } | null>(null);

  clamp(v: number) { return Math.min(v, 84); }

  start() {
    this.timers.clearAll();
    this.pool = wordPool(this.data);
    this.me.set(0);
    this.rival.set(0);
    this.locked.set(false);
    this.wrongPick.set(null);
    this.state.set('playing');
    this.nextQuestion();
    this.timers.every(() => {
      this.rival.update(v => v + 0.8);
      if (this.rival() >= 100) this.finish(false);
    }, 500);
  }

  say() {
    const cur = this.q();
    if (cur) this.audio.speak(cur.word.word, 'en-US');
  }

  private nextQuestion() {
    this.audio.stopAll();
    const word = pick(this.pool);
    const others = shuffle(ALPHABET.filter(l => l !== word.letter)).slice(0, 2);
    this.q.set({ word, options: shuffle([word.letter, ...others]) });
    this.locked.set(false);
    this.wrongPick.set(null);
    this.timers.after(() => this.say(), 300);
  }

  answer(letter: string) {
    const cur = this.q();
    if (!cur || this.locked() || this.state() !== 'playing') return;
    if (letter === cur.word.letter) {
      this.locked.set(true);
      this.audio.playSoundEffect('vroom');
      this.me.update(v => v + 17);
      if (this.me() >= 100) {
        this.finish(true);
      } else {
        this.timers.after(() => this.nextQuestion(), 800);
      }
    } else {
      this.audio.playSoundEffect('buzz');
      this.wrongPick.set(letter);
      this.timers.after(() => this.wrongPick.set(null), 400);
    }
  }

  private finish(playerWon: boolean) {
    this.timers.clearAll();
    this.won.set(playerWon);
    this.state.set('over');
    if (playerWon) {
      this.data.addStars(3);
      this.audio.playCelebration();
    } else {
      this.audio.playSoundEffect('buzz');
    }
  }

  ngOnDestroy() { 
    this.timers.clearAll(); 
    this.audio.stopAll();
  }
}
