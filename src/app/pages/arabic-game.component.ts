import { Component, OnDestroy, inject, input, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { StatsService } from '../services/stats.service';
import { GameCardComponent } from './game-card.component';
import { ARABIC_LETTERS, ArabicLetter } from './arabic-content';
import { Timers, shuffle } from './game-utils';

export type ArabicMode = 'listen' | 'first';
const ROUNDS = 10;

@Component({
  selector: 'app-arabic-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .ripple { animation: ripple 1.6s ease-out infinite; }
    @keyframes ripple { 0% { box-shadow: 0 0 0 0 rgba(16,185,129,.5); } 100% { box-shadow: 0 0 0 26px rgba(16,185,129,0); } }
    .ar { font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif; }
  `],
  template: `
    <div class="ar relative w-full h-[80vh] min-h-[600px] max-h-[940px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-emerald-100 to-teal-100 flex flex-col items-center"
         dir="rtl" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <div class="w-full px-4 pt-3 flex justify-between items-center">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-emerald-700 shadow">{{ round() }} / {{ total() }}</div>
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-emerald-700 shadow">⭐ {{ score() }}</div>
      </div>

      @if (q(); as cur) {
        @if (mode() === 'listen') {
          <p class="mt-6 text-2xl font-black text-emerald-900">اسمع الحرف، ثم اختر شكله</p>
          <button (click)="say()" aria-label="اسمع مرة أخرى"
                  class="ripple mt-4 w-32 h-32 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white text-7xl shadow-[0_10px_0_#047857] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center">🔊</button>
        } @else {
          <p class="mt-6 text-2xl font-black text-emerald-900">بأي حرف تبدأ هذه الكلمة؟</p>
          <button (click)="say()" class="mt-3 bg-white rounded-3xl px-8 py-3 shadow-lg border-4 border-emerald-300 flex items-center gap-4">
            <span class="text-8xl leading-none">{{ cur.answer.emoji }}</span>
            <span class="text-4xl">🔊</span>
          </button>
          @if (picked() !== null) { <p class="mt-2 text-4xl font-black text-emerald-800">{{ cur.answer.exampleWord }}</p> }
        }

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 px-5 w-full max-w-2xl">
          @for (o of cur.options; track o.id) {
            <button (click)="choose(o)" [disabled]="locked()" [attr.aria-label]="o.letterName"
                    [class.nope]="shake() === o.id"
                    class="rounded-3xl py-6 border-4 shadow-md transition-all active:scale-95 text-8xl leading-none font-black"
                    [class]="picked() === null ? 'bg-white border-emerald-200 text-emerald-800' :
                             o.id === cur.answer.id ? 'bg-green-100 border-green-500 text-green-700 scale-105' : 'bg-white border-emerald-100 text-emerald-300'">
              {{ o.glyph }}
            </button>
          }
        </div>
      }

      @if (state() === 'start') {
        <app-game-card [icon]="mode() === 'listen' ? '👂' : '🔤'" [title]="mode() === 'listen' ? 'اسمع واختر الحرف' : 'أول حرف في الكلمة'"
                       [text]="mode() === 'listen' ? 'ستسمع اسم حرف. اضغط على الحرف الصحيح!' : 'شاهد الصورة واختر الحرف الذي تبدأ به الكلمة'"
                       button="ابدأ!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🏆" title="أحسنت!" [text]="'أجبت ' + score() + ' من ' + total() + ' إجابات صحيحة'" button="العب مرة أخرى" (play)="start()" />
      }
    </div>
  `
})
export class ArabicGameComponent implements OnDestroy {
  mode = input.required<ArabicMode>();

  private data = inject(DataService);
  private audio = inject(AudioService);
  private stats = inject(StatsService);
  private timers = new Timers();
  private queue: ArabicLetter[] = [];

  state = signal<'start' | 'playing' | 'over'>('start');
  round = signal(1);
  total = signal(ROUNDS);
  score = signal(0);
  q = signal<{ answer: ArabicLetter; options: ArabicLetter[] } | null>(null);
  picked = signal<string | null>(null);
  locked = signal(false);
  shake = signal<string | null>(null);
  private firstTry = true;

  start() {
    this.timers.clearAll();
    this.queue = shuffle(ARABIC_LETTERS).slice(0, ROUNDS);
    this.total.set(this.queue.length);
    this.round.set(1);
    this.score.set(0);
    this.state.set('playing');
    this.next();
  }

  private next() {
    const answer = this.queue[this.round() - 1];
    const bad = shuffle(ARABIC_LETTERS.filter(l => l.id !== answer.id)).slice(0, 3);
    this.q.set({ answer, options: shuffle([answer, ...bad]) });
    this.picked.set(null);
    this.locked.set(false);
    this.firstTry = true;
    this.timers.after(() => this.say(), 400);
  }

  say() {
    const a = this.q()?.answer;
    if (!a) return;
    if (this.mode() === 'listen') this.audio.speakArabic(a.id, a.letterName);
    else this.audio.speakArabic(a.id + ' word', a.exampleWord);
  }

  choose(o: ArabicLetter) {
    const a = this.q()?.answer;
    if (!a || this.locked()) return;
    if (o.id === a.id) {
      this.locked.set(true);
      this.picked.set(o.id);
      if (this.firstTry) this.score.update(s => s + 1);
      this.audio.playSoundEffect('ding');
      this.timers.after(() => this.audio.speakArabic(a.id, a.letterName), 350);
      this.timers.after(() => this.advance(), 2100);
    } else {
      this.firstTry = false;
      this.stats.miss(a.letterName);
      this.audio.playSoundEffect('buzz');
      this.shake.set(o.id);
      this.timers.after(() => this.shake.set(null), 450);
      this.timers.after(() => this.say(), 700);
    }
  }

  private advance() {
    if (this.round() >= this.total()) {
      this.state.set('over');
      const stars = Math.ceil(this.score() / 3);
      if (stars > 0) this.data.addStars(stars);
      this.stats.result('arabic-' + this.mode(), this.score(), this.total());
      this.audio.playCelebration();
    } else {
      this.round.update(r => r + 1);
      this.next();
    }
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
