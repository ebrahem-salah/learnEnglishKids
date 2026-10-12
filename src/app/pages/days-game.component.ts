import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { DAY_LINES } from './game-content';
import { Timers, shuffle } from './game-utils';

interface Chip { en: string; ar: string; img: string; }

@Component({
  selector: 'app-days-game',
  standalone: true,
  styles: [`
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .pop { animation: pop .35s cubic-bezier(.175,.885,.32,1.275); }
    @keyframes pop { from { transform: scale(.3); } to { transform: scale(1); } }
  `],
  template: `
    <div class="relative w-full h-[80vh] min-h-[600px] max-h-[940px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-violet-100 to-amber-100 flex flex-col items-center p-4 gap-3"
         dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <!-- Today banner -->
      <button (click)="sayToday()" class="w-full max-w-xl bg-white rounded-3xl shadow-lg border-4 border-violet-300 px-5 py-3 flex items-center justify-between gap-3">
        <span class="text-5xl">📅</span>
        <span class="flex-1 text-left">
          <span class="block text-sm font-black text-violet-500">Today</span>
          <span class="block text-3xl font-black text-violet-800">{{ todayName }}</span>
          <span class="block text-lg font-bold text-gray-600" dir="rtl">{{ todayAr }}</span>
        </span>
        <span class="text-3xl">🔊</span>
      </button>

      <!-- Mode -->
      <div class="flex gap-2">
        <button (click)="setMode('days')" class="px-5 py-2 rounded-full font-black border-4 shadow"
                [class]="mode() === 'days' ? 'bg-violet-500 text-white border-violet-700' : 'bg-white text-violet-700 border-violet-200'">Days 📅</button>
        <button (click)="setMode('months')" class="px-5 py-2 rounded-full font-black border-4 shadow"
                [class]="mode() === 'months' ? 'bg-amber-500 text-white border-amber-700' : 'bg-white text-amber-700 border-amber-200'">Months 🗓️</button>
        <div class="bg-white rounded-full px-4 py-2 font-black text-violet-700 shadow border-4 border-white">⭐ {{ score() }}</div>
      </div>

      <p class="font-black text-xl text-violet-900 text-center">
        {{ finished() ? '🎉 Great! You put them in order!' : 'Tap them in the right order, starting with ' + first().en + '!' }}
      </p>

      <!-- Order so far -->
      <div class="flex flex-wrap justify-center gap-2 min-h-[4.5rem] w-full max-w-3xl">
        @for (c of placed(); track c.en) {
          <div class="pop bg-green-100 border-4 border-green-500 rounded-2xl px-3 py-1 flex items-center gap-2 shadow">
            <span class="text-3xl">{{ c.img }}</span>
            <span class="font-black text-green-800">{{ c.en }}</span>
          </div>
        }
      </div>

      <!-- Choices -->
      <div class="grid grid-cols-3 sm:grid-cols-4 gap-3 w-full max-w-3xl">
        @for (c of remaining(); track c.en) {
          <button (click)="tap(c)" [class.nope]="shake() === c.en"
                  class="bg-white border-4 border-violet-200 rounded-2xl py-3 shadow active:scale-95 transition-all flex flex-col items-center">
            <span class="text-4xl leading-none">{{ c.img }}</span>
            <span class="font-black text-violet-900 mt-1">{{ c.en }}</span>
            <span class="text-sm font-bold text-gray-500" dir="rtl">{{ c.ar }}</span>
          </button>
        }
      </div>

      @if (finished()) {
        <button (click)="restart()" class="mt-2 px-8 py-3 rounded-2xl bg-violet-500 text-white text-xl font-black shadow-[0_6px_0_#6d28d9] active:translate-y-1.5 active:shadow-none transition-all">Play again 🔁</button>
      }
    </div>
  `
})
export class DaysGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private timers = new Timers();

  private readonly now = new Date();
  readonly todayName = DAY_LINES[this.now.getDay()].key;
  readonly todayAr = DAY_LINES[this.now.getDay()].ar.replace('اليوم هو ', '').replace('.', '');

  mode = signal<'days' | 'months'>('days');
  score = signal(0);
  placed = signal<Chip[]>([]);
  remaining = signal<Chip[]>([]);
  shake = signal<string | null>(null);
  finished = signal(false);

  private order: Chip[] = [];

  constructor() { this.restart(); }

  first() { return this.order[0] ?? { en: '', ar: '', img: '' }; }

  setMode(m: 'days' | 'months') {
    this.mode.set(m);
    this.restart();
  }

  restart() {
    this.timers.clearAll();
    const id = this.mode();
    const cat = this.data.extraCategories.find(c => c.id === id);
    this.order = (cat?.items ?? []).map(i => ({ en: i.en, ar: i.ar, img: i.img }));
    this.placed.set([]);
    this.remaining.set(shuffle(this.order));
    this.finished.set(false);
  }

  sayToday() {
    const line = DAY_LINES[this.now.getDay()];
    this.audio.speak(line.en, 'en-US');
    this.timers.after(() => this.audio.speakArabic(line.en, line.ar), 2200);
  }

  tap(c: Chip) {
    if (this.finished()) return;
    const next = this.order[this.placed().length];
    this.audio.speak(c.en, 'en-US');
    if (c.en === next.en) {
      this.placed.update(p => [...p, c]);
      this.remaining.update(r => r.filter(x => x.en !== c.en));
      this.audio.playSoundEffect('pop');
      if (this.placed().length === this.order.length) {
        this.finished.set(true);
        this.score.update(s => s + 1);
        this.data.addStars(2);
        this.timers.after(() => this.audio.playCelebration(), 500);
      }
    } else {
      this.audio.playSoundEffect('buzz');
      this.shake.set(c.en);
      this.timers.after(() => this.shake.set(null), 450);
    }
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
