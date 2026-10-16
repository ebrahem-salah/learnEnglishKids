import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { StatsService } from '../services/stats.service';
import { GameCardComponent } from './game-card.component';
import { Timers, shuffle } from './game-utils';

const ROUNDS = 8;

interface Chip { id: number; text: string; }
interface Sentence { en: string; ar: string; icon: string; }

@Component({
  selector: 'app-sentence-game',
  standalone: true,
  imports: [GameCardComponent],
  styles: [`
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .pulse-mic { animation: pulse-mic 1s ease-in-out infinite; }
    @keyframes pulse-mic { 50% { transform: scale(1.12); box-shadow: 0 0 0 16px rgba(239,68,68,.25); } }
  `],
  template: `
    <div class="relative w-full h-[80vh] min-h-[600px] max-h-[940px] rounded-3xl overflow-hidden select-none bg-gradient-to-b from-teal-100 to-lime-100 flex flex-col items-center p-4 gap-3"
         dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <div class="w-full flex justify-between items-center">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-teal-700 shadow">{{ round() }} / {{ total() }}</div>
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-teal-700 shadow">⭐ {{ score() }}</div>
      </div>

      @if (cur(); as s) {
        <div class="text-center">
          <div class="text-6xl">{{ s.icon }}</div>
          <p class="text-xl font-black text-teal-900 mt-1" dir="rtl">{{ s.ar }}</p>
          <p class="text-sm font-bold text-teal-700">Put the words in the right order</p>
        </div>

        <!-- answer slots -->
        <div class="w-full max-w-3xl min-h-[5.5rem] bg-white/80 rounded-3xl border-4 border-dashed p-3 flex flex-wrap gap-2 items-center justify-center"
             [class]="state2() === 'wrong' ? 'border-red-400 nope' : state2() === 'right' ? 'border-green-500 bg-green-50' : 'border-teal-300'">
          @for (c of placed(); track c.id) {
            <button (click)="unplace(c)" [disabled]="state2() === 'right'"
                    class="px-4 py-2 rounded-2xl bg-teal-500 text-white text-xl font-black shadow active:scale-95 transition-all">{{ c.text }}</button>
          } @empty { <span class="font-bold text-teal-400">اضغط على الكلمات بالترتيب 👇</span> }
        </div>

        <!-- word bank -->
        <div class="w-full max-w-3xl flex flex-wrap gap-3 justify-center mt-1">
          @for (c of bank(); track c.id) {
            <button (click)="place(c)" class="px-4 py-3 rounded-2xl bg-white border-4 border-teal-200 text-xl font-black text-teal-900 shadow-[0_4px_0_#99f6e4] active:translate-y-1 active:shadow-none transition-all">{{ c.text }}</button>
          }
        </div>

        @if (state2() === 'right') {
          <div class="mt-2 flex flex-col items-center gap-2">
            <p class="text-2xl font-black text-green-700">🎉 {{ s.en }}</p>
            <div class="flex gap-3 flex-wrap justify-center">
              <button (click)="say()" class="px-5 py-2 rounded-2xl bg-sky-500 text-white font-black shadow-[0_4px_0_#0369a1]">🔊 استمع</button>
              @if (canListen) {
                <button (click)="speak()" [disabled]="audio.isListening()"
                        class="px-5 py-2 rounded-2xl bg-red-500 text-white font-black shadow-[0_4px_0_#b91c1c]"
                        [class.pulse-mic]="audio.isListening()">🎤 قُلها أنت</button>
              }
              <button (click)="next()" class="px-5 py-2 rounded-2xl bg-green-500 text-white font-black shadow-[0_4px_0_#15803d]">التالي ➡️</button>
            </div>
            @if (feedback(); as f) { <p class="font-black text-lg" [class]="f.ok ? 'text-green-700' : 'text-orange-600'" dir="rtl">{{ f.msg }}</p> }
          </div>
        }
      }

      @if (state() === 'start') {
        <app-game-card icon="🧩" title="رتّب الجملة" text="رتّب الكلمات لتكوّن جملة صحيحة، واسمعها، وجرّب تقولها بصوتك!" button="ابدأ!" (play)="start()" />
      } @else if (state() === 'over') {
        <app-game-card icon="🏆" title="أحسنت!" [text]="'رتّبت ' + score() + ' جمل من ' + total() + ' بدون خطأ'" button="العب تاني" (play)="start()" />
      }
    </div>
  `
})
export class SentenceGameComponent implements OnDestroy {
  private data = inject(DataService);
  audio = inject(AudioService);
  private stats = inject(StatsService);
  private timers = new Timers();
  private queue: Sentence[] = [];
  private mistakes = 0;
  readonly canListen = this.audio.canListen();

  state = signal<'start' | 'playing' | 'over'>('start');
  state2 = signal<'idle' | 'wrong' | 'right'>('idle');
  round = signal(1);
  total = signal(ROUNDS);
  score = signal(0);
  cur = signal<Sentence | null>(null);
  placed = signal<Chip[]>([]);
  bank = signal<Chip[]>([]);
  feedback = signal<{ ok: boolean; msg: string } | null>(null);

  start() {
    this.timers.clearAll();
    const words = (t: string) => t.trim().split(/\s+/);
    const good = this.data.phrasesData.filter(p => { const n = words(p.en).length; return n >= 3 && n <= 7; });
    this.queue = shuffle(good).slice(0, ROUNDS).map(p => ({ en: p.en, ar: p.ar, icon: p.icon }));
    this.total.set(this.queue.length);
    this.round.set(1);
    this.score.set(0);
    this.state.set('playing');
    this.load();
  }

  private load() {
    const s = this.queue[this.round() - 1];
    this.cur.set(s);
    this.mistakes = 0;
    this.placed.set([]);
    this.feedback.set(null);
    this.state2.set('idle');
    let chips = s.en.trim().split(/\s+/).map((text, id) => ({ id, text }));
    // never start already in the right order
    for (let i = 0; i < 5; i++) {
      const sh = shuffle(chips);
      if (sh.map(c => c.text).join(' ') !== s.en.trim()) { chips = sh; break; }
    }
    this.bank.set(chips);
  }

  place(c: Chip) {
    if (this.state2() === 'right') return;
    this.audio.playSoundEffect('pop');
    this.bank.update(b => b.filter(x => x.id !== c.id));
    this.placed.update(p => [...p, c]);
    if (this.bank().length === 0) this.check();
  }

  unplace(c: Chip) {
    if (this.state2() === 'right') return;
    this.placed.update(p => p.filter(x => x.id !== c.id));
    this.bank.update(b => [...b, c]);
    this.state2.set('idle');
  }

  private check() {
    const s = this.cur()!;
    const built = this.placed().map(c => c.text).join(' ');
    if (built === s.en.trim()) {
      this.state2.set('right');
      if (this.mistakes === 0) this.score.update(n => n + 1);
      this.audio.playSoundEffect('ding');
      this.timers.after(() => this.say(), 400);
    } else {
      this.mistakes++;
      this.state2.set('wrong');
      this.stats.miss(s.en);
      this.audio.playSoundEffect('buzz');
      this.timers.after(() => {
        // send the words back to the bank
        this.bank.set(shuffle(this.placed()));
        this.placed.set([]);
        this.state2.set('idle');
      }, 900);
    }
  }

  say() {
    const s = this.cur();
    if (s) this.audio.speak(s.en, 'en-US');
  }

  async speak() {
    const s = this.cur();
    if (!s || this.audio.isListening()) return;
    this.feedback.set({ ok: true, msg: '🎤 أنا أسمعك… قُل الجملة' });
    const r = await this.audio.listenForSentence(s.en, 'en-US');
    if (r.error === 'denied') this.feedback.set({ ok: false, msg: 'من فضلك اسمح للتطبيق باستخدام الميكروفون من إعدادات الجهاز' });
    else if (r.error === 'unsupported') this.feedback.set({ ok: false, msg: 'الميكروفون غير مدعوم على هذا الجهاز' });
    else if (r.error === 'network') this.feedback.set({ ok: false, msg: 'محتاج إنترنت عشان أسمعك' });
    else if (r.error === 'nospeech' || !r.heard) this.feedback.set({ ok: false, msg: 'ما سمعتش حاجة، جرّب تاني وقُل الجملة بصوت واضح' });
    else if (r.ok) { this.feedback.set({ ok: true, msg: '🌟 ممتاز! نطقك رائع' }); this.audio.playSoundEffect('ding'); }
    else this.feedback.set({ ok: false, msg: `سمعتك تقول: "${r.heard}". جرّب مرة تانية!` });
  }

  next() {
    if (this.round() >= this.total()) {
      this.state.set('over');
      const stars = Math.ceil(this.score() / 2);
      if (stars > 0) this.data.addStars(stars);
      this.stats.result('sentence', this.score(), this.total());
      this.audio.playCelebration();
    } else {
      this.round.update(r => r + 1);
      this.load();
    }
  }

  ngOnDestroy() { 
    this.timers.clearAll(); 
    this.audio.stopAll();
  }
}
