import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { GameCardComponent } from './game-card.component';
import { Timers, shuffle } from './game-utils';

interface Paint { name: string; hex: string; }

const BASE: Record<string, Paint> = {
  red: { name: 'Red', hex: '#ef4444' },
  yellow: { name: 'Yellow', hex: '#facc15' },
  blue: { name: 'Blue', hex: '#3b82f6' },
  white: { name: 'White', hex: '#ffffff' }
};

/** key = the two base colors sorted alphabetically and joined with "+" */
const MIXES: Record<string, Paint> = {
  'red+yellow': { name: 'Orange', hex: '#f97316' },
  'blue+yellow': { name: 'Green', hex: '#22c55e' },
  'blue+red': { name: 'Purple', hex: '#a855f7' },
  'red+white': { name: 'Pink', hex: '#f9a8d4' },
  'blue+white': { name: 'Light Blue', hex: '#7dd3fc' },
  'white+yellow': { name: 'Light Yellow', hex: '#fef08a' }
};

const GOALS = ['Orange', 'Green', 'Purple', 'Pink', 'Light Blue'];

@Component({
  selector: 'app-mix-colors-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .splash { animation: splash .6s cubic-bezier(.175,.885,.32,1.275); }
    @keyframes splash { from { transform: scale(.2); } to { transform: scale(1); } }
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
  `],
  template: `
    <div class="relative w-full h-[80vh] min-h-[600px] max-h-[940px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-fuchsia-100 to-sky-100 flex flex-col items-center"
         dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <div class="w-full px-4 pt-3 flex justify-between items-center">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-fuchsia-700 shadow">Round {{ round() }} / {{ goals.length }}</div>
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-fuchsia-700 shadow">⭐ {{ score() }}</div>
      </div>

      <button (click)="say()" class="mt-4 bg-white rounded-3xl px-6 py-2 shadow-lg border-4 border-fuchsia-300 flex items-center gap-3">
        <span class="text-3xl font-black text-fuchsia-700">Make {{ goal().toUpperCase() }}!</span>
        <span class="text-2xl">🔊</span>
      </button>

      <!-- Mixing bowl -->
      <div class="flex items-center gap-3 mt-6">
        @for (i of [0, 1]; track i) {
          <button (click)="clearSlot(i)" [attr.aria-label]="'slot ' + (i + 1)"
                  class="w-24 h-24 rounded-full border-8 shadow-inner flex items-center justify-center text-3xl font-black text-white/70"
                  [class.nope]="shake()"
                  [style.background]="slots()[i]?.hex ?? '#e5e7eb'"
                  [style.border-color]="slots()[i] ? '#475569' : '#cbd5e1'">
            {{ slots()[i] ? '' : '?' }}
          </button>
          @if (i === 0) { <span class="text-4xl font-black text-slate-500">+</span> }
        }
        <span class="text-4xl font-black text-slate-500">=</span>
        <div class="w-28 h-28 rounded-full border-8 border-slate-600 shadow-xl flex items-center justify-center"
             [class.splash]="result() !== null"
             [style.background]="result()?.hex ?? '#f1f5f9'">
          @if (!result()) { <span class="text-4xl">🥣</span> }
        </div>
      </div>

      <p class="h-10 mt-4 text-2xl font-black text-slate-700">
        @if (result(); as r) {
          {{ r.name }}! {{ ok() ? '🎉' : '🤔' }}
        }
      </p>

      <button (click)="mix()" [disabled]="!slots()[0] || !slots()[1] || locked()"
              class="mt-1 px-10 py-3 rounded-2xl bg-fuchsia-500 text-white text-2xl font-black shadow-[0_6px_0_#a21caf] active:translate-y-1.5 active:shadow-none disabled:opacity-40 transition-all">
        🪄 Mix!
      </button>

      <!-- Paint pots -->
      <div class="absolute bottom-6 inset-x-4 flex justify-center gap-4">
        @for (p of bases; track p.name) {
          <button (click)="add(p)" [disabled]="locked()" [attr.aria-label]="p.name"
                  class="flex flex-col items-center gap-1 active:scale-90 transition-transform">
            <span class="w-20 h-20 rounded-full border-8 border-slate-300 shadow-lg" [style.background]="p.hex"></span>
            <span class="font-black text-slate-700">{{ p.name }}</span>
          </button>
        }
      </div>

      @if (state() === 'start') {
        <app-game-card icon="🎨" title="Mix the Colors" text="Pick two paints and mix them to make the color you hear!" button="Start!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🌈" title="Color wizard!" [text]="'You mixed ' + score() + ' of ' + goals.length + ' colors'" button="Play again" (play)="start()" />
      }
    </div>
  `
})
export class MixColorsGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private timers = new Timers();

  readonly bases = Object.values(BASE);
  goals: string[] = GOALS;

  state = signal<'start' | 'playing' | 'over'>('start');
  round = signal(1);
  score = signal(0);
  slots = signal<(Paint | null)[]>([null, null]);
  result = signal<Paint | null>(null);
  ok = signal(false);
  locked = signal(false);
  shake = signal(false);

  goal() { return this.goals[this.round() - 1] ?? ''; }

  start() {
    this.timers.clearAll();
    this.goals = shuffle(GOALS);
    this.round.set(1);
    this.score.set(0);
    this.reset();
    this.state.set('playing');
    this.timers.after(() => this.say(), 300);
  }

  say() { this.audio.speak(this.goal(), 'en-US'); }

  private reset() {
    this.slots.set([null, null]);
    this.result.set(null);
    this.ok.set(false);
    this.locked.set(false);
  }

  add(p: Paint) {
    if (this.locked()) return;
    const s = [...this.slots()];
    const i = s[0] ? (s[1] ? -1 : 1) : 0;
    if (i < 0) return;
    s[i] = p;
    this.slots.set(s);
    this.audio.playSoundEffect('pop');
  }

  clearSlot(i: number) {
    if (this.locked()) return;
    const s = [...this.slots()];
    s[i] = null;
    this.slots.set(s);
    this.result.set(null);
  }

  mix() {
    const [a, b] = this.slots();
    if (!a || !b || this.locked()) return;
    const res = a.name === b.name ? a : MIXES[[a.name.toLowerCase(), b.name.toLowerCase()].sort().join('+')];
    this.result.set(res);
    const good = res.name === this.goal();
    this.ok.set(good);
    this.audio.speak(res.name, 'en-US');

    if (good) {
      this.locked.set(true);
      this.score.update(s => s + 1);
      this.audio.playSoundEffect('ding');
      this.timers.after(() => this.advance(), 2000);
    } else {
      this.audio.playSoundEffect('buzz');
      this.locked.set(true);
      this.shake.set(true);
      this.timers.after(() => this.shake.set(false), 450);
      this.timers.after(() => {
        this.slots.set([null, null]);
        this.result.set(null);
        this.locked.set(false);
      }, 1800);
    }
  }

  private advance() {
    if (this.round() >= this.goals.length) {
      this.state.set('over');
      this.data.addStars(Math.max(1, this.score()));
      this.audio.playCelebration();
    } else {
      this.round.update(r => r + 1);
      this.reset();
      this.timers.after(() => this.say(), 300);
    }
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
