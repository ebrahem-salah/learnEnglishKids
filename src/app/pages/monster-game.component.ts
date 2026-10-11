import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { GameCardComponent } from './game-card.component';
import { GameWord, Timers, pick, shuffle, wordPool } from './game-utils';

const STAGES = ['🐸', '🦖', '🐲'];
const FEEDS_PER_STAGE = 4;

@Component({
  selector: 'app-monster-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .chomp { animation: chomp .5s; }
    @keyframes chomp { 30% { transform: scale(var(--s)) rotate(-8deg); } 60% { transform: scale(calc(var(--s) * 1.12)) rotate(8deg); } }
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-10px); } 75% { transform: translateX(10px); } }
  `],
  template: `
    <div class="relative w-full h-[600px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-purple-200 to-pink-100 flex flex-col items-center"
         dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <div class="w-full px-4 pt-3 flex justify-between items-center">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-purple-700 shadow">🍽️ {{ fed() }} / {{ total }}</div>
        <div class="h-4 w-40 bg-white/70 rounded-full overflow-hidden border-2 border-white">
          <div class="h-full bg-gradient-to-r from-pink-400 to-purple-500 transition-all duration-500" [style.width.%]="(fed() / total) * 100"></div>
        </div>
      </div>

      <!-- Monster -->
      <div class="relative mt-6 flex flex-col items-center">
        <div class="relative transition-transform duration-500" [class.chomp]="chomping()" [style.--s]="scale()" [style.transform]="'scale(' + scale() + ')'">
          <span class="text-[9rem] leading-none block">{{ monster() }}</span>
          <div class="absolute left-1/2 -translate-x-1/2 bottom-0 bg-white border-4 border-purple-400 rounded-2xl px-4 py-0 shadow font-black text-5xl text-purple-700">
            {{ target() }}
          </div>
        </div>
        <button (click)="say()" class="mt-8 bg-white rounded-full px-5 py-2 font-black text-purple-700 shadow border-2 border-purple-300 flex items-center gap-2">
          🔊 I'm hungry for <span class="text-3xl text-pink-600">{{ target() }}</span> words!
        </button>
      </div>

      <!-- Food -->
      <div class="absolute bottom-4 inset-x-3 grid grid-cols-4 gap-2">
        @for (f of foods(); track f.word) {
          <button (click)="feed(f)" [disabled]="busy()"
                  [class.nope]="shake() === f.word"
                  class="bg-white rounded-3xl py-3 border-4 border-purple-200 shadow-[0_6px_0_#c084fc] active:translate-y-1.5 active:shadow-none transition-all flex flex-col items-center">
            <span class="text-5xl leading-none">{{ f.emoji }}</span>
            <span class="font-black text-xs text-slate-600 mt-1">{{ f.word }}</span>
          </button>
        }
      </div>

      @if (state() === 'start') {
        <app-game-card icon="🐸" title="Feed the Monster" text="The monster only eats words that start with its letter. Feed it the right food and watch it grow!" button="Start!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🐲" title="He's full and happy!" text="You fed the monster perfectly!" button="Play again" (play)="start()" />
      }
    </div>
  `
})
export class MonsterGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private timers = new Timers();
  private pool: GameWord[] = [];

  readonly total = STAGES.length * FEEDS_PER_STAGE;

  state = signal<'start' | 'playing' | 'over'>('start');
  fed = signal(0);
  target = signal('A');
  foods = signal<GameWord[]>([]);
  busy = signal(false);
  chomping = signal(false);
  shake = signal<string | null>(null);

  monster() { return STAGES[Math.min(STAGES.length - 1, Math.floor(this.fed() / FEEDS_PER_STAGE))]; }
  scale() { return (0.8 + (this.fed() % FEEDS_PER_STAGE) * 0.08).toFixed(2); }

  start() {
    this.timers.clearAll();
    this.pool = wordPool(this.data);
    this.fed.set(0);
    this.busy.set(false);
    this.state.set('playing');
    this.nextRound();
  }

  say() { this.audio.speak(this.target(), 'en-US'); }

  private nextRound() {
    const letters = [...new Set(this.pool.map(w => w.letter))].filter(l => l !== this.target());
    const letter = pick(letters);
    const good = pick(this.pool.filter(w => w.letter === letter));
    const bad = shuffle(this.pool.filter(w => w.letter !== letter)).slice(0, 3);
    this.target.set(letter);
    this.foods.set(shuffle([good, ...bad]));
    this.busy.set(false);
    this.timers.after(() => this.say(), 300);
  }

  feed(f: GameWord) {
    if (this.busy() || this.state() !== 'playing') return;
    if (f.letter === this.target()) {
      this.busy.set(true);
      this.chomping.set(true);
      this.audio.playSoundEffect('pop');
      this.audio.speak(f.word, 'en-US');
      this.fed.update(n => n + 1);
      this.timers.after(() => this.chomping.set(false), 550);
      if (this.fed() >= this.total) {
        this.timers.after(() => this.finish(), 900);
      } else {
        this.timers.after(() => this.nextRound(), 1400);
      }
    } else {
      this.audio.playSoundEffect('buzz');
      this.shake.set(f.word);
      this.timers.after(() => this.shake.set(null), 450);
    }
  }

  private finish() {
    this.state.set('over');
    this.data.addStars(3);
    this.audio.playCelebration();
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
