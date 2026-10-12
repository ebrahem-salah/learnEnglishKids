import { Component, OnDestroy, computed, inject, input, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { StatsService } from '../services/stats.service';
import { GameCardComponent } from './game-card.component';
import { BODY_LINES, FAMILY_LINES, FEELING_LINES, JOB_RIDDLES, TopicLine } from './game-content';
import { Timers, shuffle } from './game-utils';

export type TopicId = 'family' | 'feelings' | 'body' | 'jobs';

interface TopicConfig {
  category: string;          // id in data.extraCategories
  lines: TopicLine[];
  icon: string;
  title: string;
  intro: string;
  prompt: string;
  bg: string;                // Tailwind gradient for the background
}

const TOPICS: Record<TopicId, TopicConfig> = {
  family: { category: 'family', lines: FAMILY_LINES, icon: '👨‍👩‍👧‍👦', title: 'Who is in the Family?', intro: 'Listen to the sentence, then tap the right family member!', prompt: 'Who is it?', bg: 'from-pink-100 to-orange-100' },
  feelings: { category: 'feelings', lines: FEELING_LINES, icon: '😊', title: 'How do you feel?', intro: 'Listen and tap the face that matches the feeling!', prompt: 'Which face?', bg: 'from-yellow-100 to-rose-100' },
  body: { category: 'body', lines: BODY_LINES, icon: '🧍', title: 'My Body', intro: 'Listen and tap the part of the body you hear!', prompt: 'Which part?', bg: 'from-emerald-100 to-sky-100' },
  jobs: { category: 'jobs', lines: JOB_RIDDLES, icon: '👩‍⚕️', title: 'Who Am I? (Jobs)', intro: 'Listen to the riddle and tap the right job!', prompt: 'Who am I?', bg: 'from-indigo-100 to-cyan-100' }
};

const ROUNDS = 10;

interface Opt { en: string; ar: string; img: string; }

@Component({
  selector: 'app-topic-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .ripple { animation: ripple 1.6s ease-out infinite; }
    @keyframes ripple { 0% { box-shadow: 0 0 0 0 rgba(99,102,241,.5); } 100% { box-shadow: 0 0 0 26px rgba(99,102,241,0); } }
  `],
  template: `
    <div class="relative w-full h-[80vh] min-h-[600px] max-h-[940px] rounded-3xl overflow-hidden select-none bg-gradient-to-b flex flex-col items-center"
         [class]="cfg().bg" dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <div class="w-full px-4 pt-3 flex justify-between items-center">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-indigo-700 shadow">{{ round() }} / {{ total() }}</div>
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-indigo-700 shadow">⭐ {{ score() }}</div>
      </div>

      @if (line(); as l) {
        <button (click)="sayLine()" aria-label="Play the sentence again"
                class="ripple mt-5 w-28 h-28 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white text-6xl shadow-[0_8px_0_#4338ca] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center">🔊</button>

        <div class="mt-4 px-4 text-center">
          <p class="text-2xl font-black text-indigo-900">{{ l.en }}</p>
          <p class="text-lg font-bold text-gray-600 mt-1" dir="rtl">{{ l.ar }}</p>
          <button (click)="sayArabic()" class="mt-2 bg-white/80 border-2 border-indigo-200 rounded-full px-4 py-1 font-black text-indigo-700 text-sm">🔊 عربي</button>
        </div>
      }

      <div class="grid gap-4 mt-6 px-5 w-full max-w-2xl" [class]="options().length > 3 ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-3'">
        @for (o of options(); track o.en) {
          <button (click)="choose(o)" [disabled]="locked()" [attr.aria-label]="o.en"
                  [class.nope]="shake() === o.en"
                  class="rounded-3xl py-4 border-4 shadow-md transition-all active:scale-95 flex flex-col items-center"
                  [class]="picked() === null ? 'bg-white border-indigo-200' :
                           o.en === answer()?.en ? 'bg-green-100 border-green-500 scale-105' : 'bg-white border-indigo-100 opacity-60'">
            <span class="text-6xl leading-none">{{ o.img }}</span>
            @if (picked() !== null && o.en === answer()?.en) {
              <span class="mt-2 font-black text-green-700 text-lg">{{ o.en }}</span>
            }
          </button>
        }
      </div>

      @if (state() === 'start') {
        <app-game-card [icon]="cfg().icon" [title]="cfg().title" [text]="cfg().intro" button="Start!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🏆" title="Well done!" [text]="'You got ' + score() + ' out of ' + total()" button="Play again" (play)="start()" />
      }
    </div>
  `
})
export class TopicGameComponent implements OnDestroy {
  topic = input.required<TopicId>();

  private data = inject(DataService);
  private audio = inject(AudioService);
  private stats = inject(StatsService);
  private timers = new Timers();
  private queue: Opt[] = [];
  private pool: Opt[] = [];

  cfg = computed(() => TOPICS[this.topic()]);

  state = signal<'start' | 'playing' | 'over'>('start');
  round = signal(1);
  total = signal(ROUNDS);
  score = signal(0);
  answer = signal<Opt | null>(null);
  line = signal<TopicLine | null>(null);
  options = signal<Opt[]>([]);
  picked = signal<string | null>(null);
  locked = signal(false);
  shake = signal<string | null>(null);

  start() {
    this.timers.clearAll();
    const c = this.cfg();
    const cat = this.data.extraCategories.find(x => x.id === c.category);
    // only items that have a sentence for this topic
    this.pool = (cat?.items ?? []).filter(i => c.lines.some(l => l.key === i.en)).map(i => ({ en: i.en, ar: i.ar, img: i.img }));
    this.queue = shuffle(this.pool).slice(0, ROUNDS);
    this.total.set(this.queue.length);
    this.round.set(1);
    this.score.set(0);
    this.state.set('playing');
    this.nextQuestion();
  }

  sayLine() {
    const l = this.line();
    if (l) this.audio.speak(l.en, 'en-US');
  }

  sayArabic() {
    const l = this.line();
    if (l) this.audio.speakArabic(l.en, l.ar);
  }

  private nextQuestion() {
    const a = this.queue[this.round() - 1];
    const bad = shuffle(this.pool.filter(o => o.en !== a.en)).slice(0, 3);
    this.answer.set(a);
    this.line.set(this.cfg().lines.find(l => l.key === a.en) ?? null);
    this.options.set(shuffle([a, ...bad]));
    this.picked.set(null);
    this.locked.set(false);
    this.timers.after(() => this.sayLine(), 400);
  }

  choose(o: Opt) {
    const a = this.answer();
    if (!a || this.locked()) return;
    if (o.en === a.en) {
      this.locked.set(true);
      this.picked.set(o.en);
      this.score.update(s => s + 1);
      this.audio.playSoundEffect('ding');
      this.timers.after(() => this.audio.speak(a.en, 'en-US'), 350);
      this.timers.after(() => this.advance(), 1900);
    } else {
      this.audio.playSoundEffect('buzz');
      this.stats.miss(a.en);
      this.shake.set(o.en);
      this.timers.after(() => this.shake.set(null), 450);
      this.timers.after(() => this.sayLine(), 700);
    }
  }

  private advance() {
    if (this.round() >= this.total()) {
      this.state.set('over');
      const stars = Math.ceil(this.score() / 3);
      if (stars > 0) this.data.addStars(stars);
      this.stats.result(this.topic(), this.score(), this.total());
      this.audio.playCelebration();
    } else {
      this.round.update(r => r + 1);
      this.nextQuestion();
    }
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
