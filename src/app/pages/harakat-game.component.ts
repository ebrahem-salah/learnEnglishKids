import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { StatsService } from '../services/stats.service';
import { GameCardComponent } from './game-card.component';
import { ARABIC_LETTERS, ArabicLetter, HARAKAT, Haraka, syllable } from './arabic-content';
import { Timers, pick, shuffle } from './game-utils';

const ROUNDS = 10;

@Component({
  selector: 'app-harakat-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .ripple { animation: ripple 1.6s ease-out infinite; }
    @keyframes ripple { 0% { box-shadow: 0 0 0 0 rgba(168,85,247,.5); } 100% { box-shadow: 0 0 0 26px rgba(168,85,247,0); } }
    .ar { font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif; }
  `],
  template: `
    <div class="ar relative w-full h-[80vh] min-h-[600px] max-h-[940px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-fuchsia-100 to-violet-100 flex flex-col items-center"
         dir="rtl" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <div class="w-full px-4 pt-3 flex justify-between items-center">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-violet-700 shadow">{{ round() }} / {{ total() }}</div>
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-violet-700 shadow">⭐ {{ score() }}</div>
      </div>

      @if (letter(); as l) {
        <p class="mt-6 text-2xl font-black text-violet-900">اسمع المقطع، ثم اختر الحركة الصحيحة</p>
        <button (click)="say()" aria-label="اسمع مرة أخرى"
                class="ripple mt-4 w-32 h-32 rounded-full bg-violet-500 hover:bg-violet-600 text-white text-7xl shadow-[0_10px_0_#6d28d9] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center">🔊</button>

        <div class="grid grid-cols-3 gap-4 mt-8 px-5 w-full max-w-xl">
          @for (h of harakat; track h.id) {
            <button (click)="choose(h)" [disabled]="locked()" [attr.aria-label]="h.name"
                    [class.nope]="shake() === h.id"
                    class="rounded-3xl py-6 border-4 shadow-md transition-all active:scale-95 flex flex-col items-center"
                    [class]="picked() === null ? 'bg-white border-violet-200' :
                             h.id === target()?.id ? 'bg-green-100 border-green-500 scale-105' : 'bg-white border-violet-100 opacity-60'">
              <span class="text-8xl leading-[1.3] font-black text-violet-900">{{ syl(l.glyph, h) }}</span>
              @if (picked() !== null && h.id === target()?.id) { <span class="font-black text-green-700 text-lg">{{ h.name }}</span> }
            </button>
          }
        </div>
      }

      @if (state() === 'start') {
        <app-game-card icon="🎵" title="اسمع واختر الحركة" text="ستسمع حرفًا مع حركته (فتحة أو ضمة أو كسرة). اختر الشكل الصحيح!" button="ابدأ!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🏆" title="أحسنت!" [text]="'أجبت ' + score() + ' من ' + total() + ' إجابات صحيحة'" button="العب مرة أخرى" (play)="start()" />
      }
    </div>
  `
})
export class HarakatGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private stats = inject(StatsService);
  private timers = new Timers();

  readonly harakat = HARAKAT;
  syl = syllable;

  state = signal<'start' | 'playing' | 'over'>('start');
  round = signal(1);
  total = signal(ROUNDS);
  score = signal(0);
  letter = signal<ArabicLetter | null>(null);
  target = signal<Haraka | null>(null);
  picked = signal<string | null>(null);
  locked = signal(false);
  shake = signal<string | null>(null);
  private firstTry = true;
  private letters: ArabicLetter[] = [];

  start() {
    this.timers.clearAll();
    this.letters = shuffle(ARABIC_LETTERS).slice(0, ROUNDS);
    this.total.set(this.letters.length);
    this.round.set(1);
    this.score.set(0);
    this.state.set('playing');
    this.next();
  }

  private next() {
    this.audio.stopAll();
    this.letter.set(this.letters[this.round() - 1]);
    this.target.set(pick(HARAKAT));
    this.picked.set(null);
    this.locked.set(false);
    this.firstTry = true;
    this.timers.after(() => this.say(), 400);
  }

  say() {
    const l = this.letter(), t = this.target();
    if (l && t) this.audio.speakArabic(`${l.id} ${t.id}`, syllable(l.glyph, t));
  }

  choose(h: Haraka) {
    const t = this.target(), l = this.letter();
    if (!t || !l || this.locked()) return;
    if (h.id === t.id) {
      this.locked.set(true);
      this.picked.set(h.id);
      if (this.firstTry) this.score.update(s => s + 1);
      this.audio.playSoundEffect('ding');
      this.timers.after(() => this.advance(), 1600);
    } else {
      this.firstTry = false;
      this.stats.miss(syllable(l.glyph, t));
      this.audio.playSoundEffect('buzz');
      this.shake.set(h.id);
      this.timers.after(() => this.shake.set(null), 450);
      this.timers.after(() => this.say(), 700);
    }
  }

  private advance() {
    if (this.round() >= this.total()) {
      this.state.set('over');
      const stars = Math.ceil(this.score() / 3);
      if (stars > 0) this.data.addStars(stars);
      this.stats.result('arabic-harakat', this.score(), this.total());
      this.audio.playCelebration();
    } else {
      this.round.update(r => r + 1);
      this.next();
    }
  }

  ngOnDestroy() { 
    this.timers.clearAll(); 
    this.audio.stopAll();
  }
}
