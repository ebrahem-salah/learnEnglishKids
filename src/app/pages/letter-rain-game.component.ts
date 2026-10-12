import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { GameCardComponent } from './game-card.component';
import { GameWord, Timers, pick, wordPool } from './game-utils';

interface RainItem extends GameWord { id: number; x: number; dur: number; }

@Component({
  selector: 'app-letter-rain-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .fall { animation: rain-fall var(--dur, 5s) linear forwards; }
    @keyframes rain-fall { from { transform: translateY(-100px); } to { transform: translateY(640px); } }
  `],
  template: `
    <div class="relative w-full h-[80vh] min-h-[600px] max-h-[940px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-sky-300 to-sky-100"
         dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <div class="absolute top-3 inset-x-3 z-30 flex justify-between items-center gap-2 pointer-events-none">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-sky-700 shadow">⭐ {{ score() }}</div>
        @if (state() === 'playing') {
          <div class="bg-white/90 rounded-full px-4 py-1 font-black text-indigo-700 shadow text-center leading-tight">
            Tap words that start with
            <span class="text-pink-600 text-3xl align-middle">{{ target() }}</span>
          </div>
        }
        <div class="bg-white/90 rounded-full px-4 py-2 font-black shadow">{{ hearts() }} ⏱ {{ time() }}</div>
      </div>

      @for (it of items(); track it.id) {
        <button class="fall absolute top-0 z-10 flex flex-col items-center bg-white/90 rounded-2xl px-3 py-2 shadow-lg border-4 border-white active:scale-90"
                [style.left.%]="it.x" [style.--dur]="it.dur + 's'"
                [attr.aria-label]="it.word"
                (pointerdown)="tap(it)" (animationend)="gone(it)">
          <span class="text-5xl leading-none">{{ it.emoji }}</span>
          <span class="font-black text-sm text-slate-700">{{ it.word }}</span>
        </button>
      }

      @if (state() === 'start') {
        <app-game-card icon="🌧️" title="Letter Rain" text="Words are falling! Tap only the ones that start with the magic letter." button="Start!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🏆" title="Great job!" [text]="'You caught ' + score() + ' words!'" button="Play again" (play)="start()" />
      }
    </div>
  `
})
export class LetterRainGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private timers = new Timers();
  private pool: GameWord[] = [];
  private uid = 0;

  state = signal<'start' | 'playing' | 'over'>('start');
  score = signal(0);
  lives = signal(3);
  time = signal(60);
  target = signal('A');
  items = signal<RainItem[]>([]);

  hearts() { return '❤️'.repeat(this.lives()) || '💔'; }

  start() {
    this.timers.clearAll();
    this.pool = wordPool(this.data);
    this.score.set(0);
    this.lives.set(3);
    this.time.set(60);
    this.items.set([]);
    this.state.set('playing');
    this.nextTarget();
    this.timers.every(() => this.spawn(), 950);
    this.timers.every(() => {
      this.time.update(t => t - 1);
      if (this.time() <= 0) this.end();
    }, 1000);
  }

  private nextTarget() {
    const letters = [...new Set(this.pool.map(w => w.letter))]
      .filter(l => this.pool.filter(w => w.letter === l).length >= 2 && l !== this.target());
    const letter = pick(letters);
    this.target.set(letter);
    this.items.set([]);
    this.audio.speak(letter, 'en-US');
  }

  private spawn() {
    if (this.state() !== 'playing') return;
    const isTarget = Math.random() < 0.4;
    const t = this.target();
    const candidates = this.pool.filter(w => (w.letter === t) === isTarget);
    const w = pick(candidates);
    const dur = Math.max(3.2, 6.5 - this.score() * 0.08);
    this.items.update(list => [...list, { ...w, id: ++this.uid, x: 2 + Math.random() * 76, dur }]);
  }

  tap(it: RainItem) {
    if (this.state() !== 'playing') return;
    this.items.update(list => list.filter(i => i.id !== it.id));
    if (it.letter === this.target()) {
      this.score.update(s => s + 1);
      this.audio.playSoundEffect('ding');
      this.audio.speak(it.word, 'en-US');
      if (this.score() % 6 === 0) this.nextTarget();
    } else {
      this.audio.playSoundEffect('buzz');
      this.lives.update(l => l - 1);
      if (this.lives() <= 0) this.end();
    }
  }

  gone(it: RainItem) {
    this.items.update(list => list.filter(i => i.id !== it.id));
  }

  private end() {
    this.timers.clearAll();
    this.items.set([]);
    this.state.set('over');
    const stars = Math.min(5, Math.floor(this.score() / 4));
    if (stars > 0) this.data.addStars(stars);
    this.audio.playCelebration();
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
