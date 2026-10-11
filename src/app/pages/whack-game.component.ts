import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { GameCardComponent } from './game-card.component';
import { GameWord, Timers, pick, wordPool } from './game-utils';

interface Hole { word: GameWord | null; uid: number; hit: boolean; }

@Component({
  selector: 'app-whack-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .peek { animation: peek .25s ease-out; }
    @keyframes peek { from { transform: translateY(60px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  `],
  template: `
    <div class="relative w-full h-[600px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-lime-200 to-green-400 flex flex-col items-center"
         dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <div class="w-full flex justify-between items-center px-4 pt-3 z-30">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-green-700 shadow">⭐ {{ score() }}</div>
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-green-700 shadow">⏱ {{ time() }}</div>
      </div>

      @if (target(); as t) {
        <button (click)="say()" class="mt-3 bg-white rounded-3xl px-6 py-2 shadow-lg border-4 border-amber-400 flex items-center gap-3 z-30">
          <span class="text-5xl">{{ t.emoji }}</span>
          <span class="text-3xl font-black text-amber-700">Hit {{ t.word }}!</span>
          <span class="text-2xl">🔊</span>
        </button>
      }

      <div class="grid grid-cols-3 gap-3 mt-6 px-6 w-full max-w-md">
        @for (h of holes(); track $index; let i = $index) {
          <button (pointerdown)="whack(i)" [attr.aria-label]="h.word ? h.word.word : 'empty hole'"
                  class="relative aspect-square rounded-full bg-amber-900 border-b-[10px] border-amber-950 overflow-hidden flex items-end justify-center shadow-inner">
            @if (h.word) {
              <span class="peek text-6xl mb-2 leading-none">{{ h.hit ? '💥' : h.word.emoji }}</span>
            }
          </button>
        }
      </div>

      @if (state() === 'start') {
        <app-game-card icon="🔨" title="Whack a Word" text="Listen to the word, then hit the matching picture when it pops up!" button="Start!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🏆" title="Time's up!" [text]="'Score: ' + score()" button="Play again" (play)="start()" />
      }
    </div>
  `
})
export class WhackGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private timers = new Timers();
  private pool: GameWord[] = [];
  private uid = 0;

  state = signal<'start' | 'playing' | 'over'>('start');
  score = signal(0);
  time = signal(45);
  target = signal<GameWord | null>(null);
  holes = signal<Hole[]>(this.emptyHoles());

  private emptyHoles(): Hole[] {
    return Array.from({ length: 9 }, () => ({ word: null, uid: 0, hit: false }));
  }

  start() {
    this.timers.clearAll();
    this.pool = wordPool(this.data);
    this.score.set(0);
    this.time.set(45);
    this.holes.set(this.emptyHoles());
    this.state.set('playing');
    this.nextTarget();
    this.timers.every(() => this.popUp(), 800);
    this.timers.every(() => {
      this.time.update(t => t - 1);
      if (this.time() <= 0) this.end();
    }, 1000);
  }

  say() {
    const t = this.target();
    if (t) this.audio.speak(t.word, 'en-US');
  }

  private nextTarget() {
    const prev = this.target()?.word;
    this.target.set(pick(this.pool.filter(w => w.word !== prev)));
    this.say();
  }

  private setHole(i: number, h: Hole) {
    this.holes.update(list => list.map((x, idx) => (idx === i ? h : x)));
  }

  private popUp() {
    if (this.state() !== 'playing') return;
    const free = this.holes().map((h, i) => (h.word ? -1 : i)).filter(i => i >= 0);
    if (!free.length) return;
    const i = pick(free);
    const t = this.target()!;
    const word = Math.random() < 0.45 ? t : pick(this.pool.filter(w => w.word !== t.word));
    const uid = ++this.uid;
    this.setHole(i, { word, uid, hit: false });
    this.timers.after(() => {
      if (this.holes()[i].uid === uid) this.setHole(i, { word: null, uid: 0, hit: false });
    }, 1500);
  }

  whack(i: number) {
    const h = this.holes()[i];
    if (this.state() !== 'playing' || !h.word || h.hit) return;
    if (h.word.word === this.target()!.word) {
      this.score.update(s => s + 1);
      this.audio.playSoundEffect('pop');
      this.setHole(i, { ...h, hit: true });
      this.timers.after(() => this.setHole(i, { word: null, uid: 0, hit: false }), 300);
      this.nextTarget();
    } else {
      this.audio.playSoundEffect('buzz');
      this.score.update(s => Math.max(0, s - 1));
      this.setHole(i, { word: null, uid: 0, hit: false });
    }
  }

  private end() {
    this.timers.clearAll();
    this.holes.set(this.emptyHoles());
    this.state.set('over');
    const stars = Math.min(5, Math.floor(this.score() / 4));
    if (stars > 0) this.data.addStars(stars);
    this.audio.playCelebration();
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
