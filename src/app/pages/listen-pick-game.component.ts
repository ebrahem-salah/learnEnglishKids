import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { StatsService } from '../services/stats.service';
import { GameCardComponent } from './game-card.component';
import { GameWord, Timers, pick, shuffle, wordPool } from './game-utils';

const ROUNDS = 10;

@Component({
  selector: 'app-listen-pick-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .ripple { animation: ripple 1.6s ease-out infinite; }
    @keyframes ripple { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,.5); } 100% { box-shadow: 0 0 0 28px rgba(99,102,241,0); } }
  `],
  template: `
    <div class="relative w-full h-[80vh] min-h-[600px] max-h-[940px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-indigo-100 to-violet-200 flex flex-col items-center"
         dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <div class="w-full px-4 pt-3 flex justify-between items-center">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-indigo-700 shadow">Question {{ round() }} / {{ rounds }}</div>
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-indigo-700 shadow">⭐ {{ score() }}</div>
      </div>

      <p class="mt-6 text-2xl font-black text-indigo-800">Listen… then tap what you heard!</p>

      <button (click)="say()" aria-label="Play the word again"
              class="ripple mt-4 w-36 h-36 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-7xl shadow-[0_10px_0_#4338ca] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center">
        🔊
      </button>

      <div class="grid grid-cols-2 gap-4 mt-8 px-6 w-full max-w-md">
        @for (o of options(); track o.word) {
          <button (click)="choose(o)" [disabled]="locked()" [attr.aria-label]="o.word"
                  [class.nope]="shake() === o.word"
                  class="rounded-3xl py-5 border-4 text-7xl leading-none shadow-md transition-all active:scale-95"
                  [class]="picked() === null ? 'bg-white border-indigo-200' :
                           o.word === answer()?.word ? 'bg-green-100 border-green-500 scale-105' : 'bg-white border-indigo-100 opacity-60'">
            {{ o.emoji }}
          </button>
        }
      </div>

      @if (state() === 'start') {
        <app-game-card icon="👂" title="Listen & Pick" text="You will only HEAR the word. Tap the picture that matches!" button="Start!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🏆" title="Super ears!" [text]="'You got ' + score() + ' out of ' + rounds" button="Play again" (play)="start()" />
      }
    </div>
  `
})
export class ListenPickGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private stats = inject(StatsService);
  private timers = new Timers();
  private pool: GameWord[] = [];
  private used = new Set<string>();

  readonly rounds = ROUNDS;

  state = signal<'start' | 'playing' | 'over'>('start');
  round = signal(1);
  score = signal(0);
  answer = signal<GameWord | null>(null);
  options = signal<GameWord[]>([]);
  picked = signal<string | null>(null);
  locked = signal(false);
  shake = signal<string | null>(null);

  start() {
    this.timers.clearAll();
    this.pool = wordPool(this.data);
    this.used.clear();
    this.round.set(1);
    this.score.set(0);
    this.state.set('playing');
    this.nextQuestion();
  }

  say() {
    const a = this.answer();
    if (a) this.audio.speak(a.word, 'en-US');
  }

  private nextQuestion() {
    const fresh = this.pool.filter(w => !this.used.has(w.word));
    const a = pick(fresh.length ? fresh : this.pool);
    this.used.add(a.word);
    // distractors with different starting letters so the sound is the clue
    const bad = shuffle(this.pool.filter(w => w.letter !== a.letter)).slice(0, 3);
    this.answer.set(a);
    this.options.set(shuffle([a, ...bad]));
    this.picked.set(null);
    this.locked.set(false);
    this.timers.after(() => this.say(), 400);
  }

  choose(o: GameWord) {
    const a = this.answer();
    if (!a || this.locked()) return;
    if (o.word === a.word) {
      this.locked.set(true);
      this.picked.set(o.word);
      this.score.update(s => s + 1);
      this.audio.playSoundEffect('ding');
      this.timers.after(() => this.advance(), 1200);
    } else {
      this.audio.playSoundEffect('buzz');
      this.stats.miss(a.word);
      this.shake.set(o.word);
      this.timers.after(() => this.shake.set(null), 450);
      this.timers.after(() => this.say(), 600);
    }
  }

  private advance() {
    if (this.round() >= ROUNDS) {
      this.state.set('over');
      const stars = Math.ceil(this.score() / 3);
      if (stars > 0) this.data.addStars(stars);
      this.stats.result('listen', this.score(), ROUNDS);
      this.audio.playCelebration();
    } else {
      this.round.update(r => r + 1);
      this.nextQuestion();
    }
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
