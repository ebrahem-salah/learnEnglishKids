import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { GameCardComponent } from './game-card.component';
import { ALPHABET, GameWord, Timers, pick, shuffle, wordPool } from './game-utils';

const ROUNDS = 5;
const MAX_WRONG = 5;

@Component({
  selector: 'app-fish-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .swim { animation: swim 1.4s ease-in-out infinite; }
    @keyframes swim { 50% { transform: translateY(-8px) rotate(4deg); } }
  `],
  template: `
    <div class="relative w-full h-[600px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-cyan-200 via-sky-300 to-blue-500 flex flex-col items-center"
         dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <div class="w-full px-4 pt-3 flex justify-between items-center">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-sky-700 shadow">Fish {{ round() }} / {{ rounds }}</div>
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-sky-700 shadow">🐟 Saved: {{ saved() }}</div>
      </div>

      <!-- Sea strip with shore -->
      <div class="relative w-full h-24 mt-4">
        <span class="absolute left-1 top-1 text-6xl">🏝️</span>
        <span class="absolute top-4 text-6xl transition-all duration-700 ease-out"
              [class.swim]="status() === 'playing'"
              [style.left.%]="fishPos()">{{ status() === 'lost' ? '🐡' : '🐟' }}</span>
        <span class="absolute right-2 bottom-2 text-4xl">🦈</span>
      </div>

      @if (current(); as w) {
        <button (click)="say()" class="bg-white rounded-3xl px-6 py-2 shadow-lg border-4 border-sky-300 flex items-center gap-3 mt-2">
          <span class="text-7xl">{{ w.emoji }}</span>
          <span class="text-3xl">🔊</span>
        </button>

        <div class="flex gap-2 mt-5">
          @for (ch of slots(); track $index) {
            <div class="w-14 h-16 rounded-2xl bg-white/90 border-4 flex items-center justify-center text-4xl font-black text-sky-800"
                 [class]="status() === 'lost' ? 'border-red-400' : 'border-sky-300'">
              {{ ch }}
            </div>
          }
        </div>

        <p class="mt-2 font-black text-white text-lg drop-shadow">
          @if (status() === 'won') { 🎉 The fish is safe! }
          @else if (status() === 'lost') { 😢 Oh no! It was “{{ w.word }}” }
          @else { Spell the word to bring the fish home! }
        </p>

        <div class="grid grid-cols-5 gap-2 mt-4 px-4 w-full max-w-md">
          @for (l of keys(); track l) {
            <button (click)="guess(l)" [disabled]="status() !== 'playing' || guessed().has(l)"
                    [class.nope]="shake() === l"
                    class="py-3 rounded-2xl bg-white border-4 border-sky-200 text-3xl font-black text-sky-800 shadow-[0_5px_0_#7dd3fc] active:translate-y-1 active:shadow-none disabled:opacity-40 transition-all">
              {{ l }}
            </button>
          }
        </div>
      }

      @if (state() === 'start') {
        <app-game-card icon="🐟" title="Save the Fish" text="Spell the word by tapping letters. Every wrong letter pushes the fish away from the shore!" button="Start!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🏆" title="Hero of the sea!" [text]="'You saved ' + saved() + ' of ' + rounds + ' fish'" button="Play again" (play)="start()" />
      }
    </div>
  `
})
export class FishGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private timers = new Timers();
  private pool: GameWord[] = [];
  private used = new Set<string>();

  readonly rounds = ROUNDS;

  state = signal<'start' | 'playing' | 'over'>('start');
  status = signal<'playing' | 'won' | 'lost'>('playing');
  round = signal(1);
  saved = signal(0);
  current = signal<GameWord | null>(null);
  keys = signal<string[]>([]);
  guessed = signal<Set<string>>(new Set());
  wrong = signal(0);
  shake = signal<string | null>(null);

  fishPos() {
    if (this.status() === 'won') return 14;
    return 14 + this.wrong() * 13;
  }

  slots() {
    const w = this.current();
    if (!w) return [];
    const g = this.guessed();
    const reveal = this.status() === 'lost';
    return w.word.toUpperCase().split('').map(c => (g.has(c) || reveal ? c : ''));
  }

  start() {
    this.timers.clearAll();
    this.pool = wordPool(this.data).filter(w => /^[A-Za-z]{3,5}$/.test(w.word));
    this.used.clear();
    this.round.set(1);
    this.saved.set(0);
    this.state.set('playing');
    this.nextWord();
  }

  say() {
    const w = this.current();
    if (w) this.audio.speak(w.word, 'en-US');
  }

  private nextWord() {
    const fresh = this.pool.filter(w => !this.used.has(w.word));
    const w = pick(fresh.length ? fresh : this.pool);
    this.used.add(w.word);
    const letters = new Set(w.word.toUpperCase().split(''));
    const extra = shuffle(ALPHABET.filter(l => !letters.has(l))).slice(0, Math.max(3, 10 - letters.size));
    this.current.set(w);
    this.keys.set(shuffle([...letters, ...extra]));
    this.guessed.set(new Set());
    this.wrong.set(0);
    this.status.set('playing');
    this.timers.after(() => this.say(), 400);
  }

  guess(l: string) {
    const w = this.current();
    if (!w || this.status() !== 'playing' || this.guessed().has(l)) return;
    this.guessed.update(s => new Set(s).add(l));
    const word = w.word.toUpperCase();

    if (word.includes(l)) {
      this.audio.playSoundEffect('pop');
      if (word.split('').every(c => this.guessed().has(c))) {
        this.status.set('won');
        this.saved.update(n => n + 1);
        this.audio.playSoundEffect('ding');
        this.audio.speak(w.word, 'en-US');
        this.timers.after(() => this.advance(), 2200);
      }
    } else {
      this.audio.playSoundEffect('buzz');
      this.shake.set(l);
      this.timers.after(() => this.shake.set(null), 450);
      this.wrong.update(n => n + 1);
      if (this.wrong() >= MAX_WRONG) {
        this.status.set('lost');
        this.timers.after(() => this.advance(), 2600);
      }
    }
  }

  private advance() {
    if (this.round() >= ROUNDS) {
      this.state.set('over');
      if (this.saved() > 0) this.data.addStars(this.saved());
      this.audio.playCelebration();
    } else {
      this.round.update(r => r + 1);
      this.nextWord();
    }
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
