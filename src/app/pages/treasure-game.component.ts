import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { GameCardComponent } from './game-card.component';
import { GameWord, Timers, shuffle, wordPool } from './game-utils';

interface Spot { w: GameWord; x: number; y: number; found: boolean; target: boolean; }

const COLS = 6;
const ROWS = 4;
const TARGETS = 5;

@Component({
  selector: 'app-treasure-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .glow { animation: glow .8s ease-out; }
    @keyframes glow { 50% { transform: scale(1.6); filter: drop-shadow(0 0 14px gold); } }
  `],
  template: `
    <div class="relative w-full h-[600px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-emerald-200 via-lime-100 to-amber-100"
         dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <!-- Things to find -->
      <div class="absolute top-2 inset-x-2 z-30 flex flex-wrap justify-center gap-2 items-center">
        @for (s of targets(); track s.w.word) {
          <div class="px-3 py-1 rounded-full font-black text-lg border-4 shadow"
               [class]="s.found ? 'bg-green-400 border-green-600 text-white line-through' : 'bg-white border-amber-300 text-amber-800'">
            {{ s.found ? '✅' : '🔎' }} {{ s.w.word }}
          </div>
        }
        <button (click)="hint()" class="bg-yellow-300 border-4 border-yellow-500 rounded-full w-11 h-11 text-2xl shadow" aria-label="Hear a hint">🔊</button>
      </div>

      @for (s of spots(); track s.w.word) {
        <button class="absolute text-5xl leading-none -translate-x-1/2 -translate-y-1/2 active:scale-90 transition-transform"
                [style.left.%]="s.x" [style.top.%]="s.y"
                [class.glow]="s.found" [class.nope]="shake() === s.w.word"
                [class.opacity-60]="s.found && s.target"
                [attr.aria-label]="s.w.word"
                (pointerdown)="tap(s)">
          {{ s.w.emoji }}
        </button>
      }

      @if (state() === 'start') {
        <app-game-card icon="🗺️" title="Treasure Hunt" text="Listen to the names and find them hidden in the picture!" button="Start hunting!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🎁" title="You found the treasure!" text="Amazing detective work!" button="Hunt again" (play)="start()" />
      }
    </div>
  `
})
export class TreasureGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private timers = new Timers();

  state = signal<'start' | 'playing' | 'over'>('start');
  spots = signal<Spot[]>([]);
  shake = signal<string | null>(null);

  targets() { return this.spots().filter(s => s.target); }

  start() {
    this.timers.clearAll();
    const words = shuffle(wordPool(this.data)).slice(0, COLS * ROWS);
    const cells = shuffle(Array.from({ length: COLS * ROWS }, (_, i) => i));
    const spots: Spot[] = words.map((w, i) => {
      const c = cells[i] % COLS;
      const r = Math.floor(cells[i] / COLS);
      return {
        w,
        x: ((c + 0.5) / COLS) * 100 + (Math.random() * 6 - 3),
        y: 22 + ((r + 0.5) / ROWS) * 72 + (Math.random() * 4 - 2),
        found: false,
        target: i < TARGETS
      };
    });
    this.spots.set(spots);
    this.state.set('playing');
    this.timers.after(() => this.audio.sequence(null, this.targets().map(s => [s.w.word, 'en-US'] as [string, string])), 400);
  }

  hint() {
    const next = this.targets().find(s => !s.found);
    if (next) this.audio.speak(next.w.word, 'en-US');
  }

  tap(s: Spot) {
    if (this.state() !== 'playing' || s.found) return;
    if (s.target) {
      this.spots.update(list => list.map(x => (x.w.word === s.w.word ? { ...x, found: true } : x)));
      this.audio.playSoundEffect('ding');
      this.audio.speak(s.w.word, 'en-US');
      if (this.targets().every(t => t.found)) {
        this.timers.after(() => {
          this.state.set('over');
          this.data.addStars(3);
          this.audio.playCelebration();
        }, 900);
      }
    } else {
      this.audio.playSoundEffect('buzz');
      this.shake.set(s.w.word);
      this.timers.after(() => this.shake.set(null), 450);
    }
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
