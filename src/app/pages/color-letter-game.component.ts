import { AfterViewInit, Component, ElementRef, OnDestroy, inject, signal, viewChild } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { ALPHABET, Timers, wordPool } from './game-utils';

const SIZE = 320;
const GUIDE = [229, 231, 235]; // #e5e7eb
const PALETTE = ['#ef4444', '#f97316', '#facc15', '#22c55e', '#3b82f6', '#a855f7', '#ec4899'];

@Component({
  selector: 'app-color-letter-game',
  standalone: true,
  template: `
    <div class="relative w-full rounded-3xl overflow-hidden select-none bg-gradient-to-b from-rose-100 to-amber-100 p-3 flex flex-col items-center gap-3"
         dir="ltr" style="-webkit-tap-highlight-color: transparent">

      <!-- Letter picker -->
      <div class="w-full overflow-x-auto">
        <div class="flex gap-2 w-max px-1 pb-1">
          @for (l of letters; track l) {
            <button (click)="pickLetter(l)"
                    class="w-11 h-11 rounded-xl font-black text-xl border-4 shadow-sm"
                    [class]="l === letter() ? 'bg-rose-500 text-white border-rose-700' : done().has(l) ? 'bg-green-200 text-green-800 border-green-400' : 'bg-white text-rose-600 border-rose-200'">
              {{ l }}
            </button>
          }
        </div>
      </div>

      <div class="font-black text-xl text-rose-700 flex items-center gap-2">
        <span class="text-4xl">{{ emoji() }}</span>
        {{ letter() }} is for {{ wordText() }}
        <button (click)="say()" class="text-2xl" aria-label="Hear it">🔊</button>
      </div>

      <div class="relative rounded-3xl bg-white border-8 border-rose-300 shadow-xl" style="width: min(86vw, 360px); aspect-ratio: 1 / 1;">
        <canvas #cv [width]="size" [height]="size"
                class="w-full h-full rounded-2xl"
                style="touch-action: none; cursor: crosshair"
                (pointerdown)="down($event)" (pointermove)="move($event)"
                (pointerup)="up($event)" (pointercancel)="up($event)" (pointerleave)="up($event)"></canvas>
        @if (complete()) {
          <div class="absolute inset-0 flex items-center justify-center pointer-events-none">
            <span class="text-8xl animate-bounce">🎉</span>
          </div>
        }
      </div>

      <div class="flex items-center gap-2 flex-wrap justify-center">
        @for (c of palette; track c) {
          <button (click)="color.set(c)" [style.background]="c" [attr.aria-label]="'color ' + c"
                  class="w-11 h-11 rounded-full border-4 shadow"
                  [class]="c === color() ? 'border-slate-800 scale-125' : 'border-white'"></button>
        }
        <button (click)="draw()" class="ml-2 bg-white border-4 border-rose-300 rounded-full px-4 py-2 font-black text-rose-600 shadow">🧽 Clear</button>
        <button (click)="next()" class="bg-rose-500 text-white border-4 border-rose-700 rounded-full px-4 py-2 font-black shadow">Next ➡️</button>
      </div>
    </div>
  `
})
export class ColorLetterGameComponent implements AfterViewInit, OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private timers = new Timers();
  private cv = viewChild.required<ElementRef<HTMLCanvasElement>>('cv');
  private ctx!: CanvasRenderingContext2D;
  private drawing = false;
  private last = { x: 0, y: 0 };
  private totalPixels = 1;
  private rewarded = new Set<string>();
  private examples = new Map<string, { word: string; emoji: string }>();

  readonly size = SIZE;
  readonly letters = ALPHABET;
  readonly palette = PALETTE;

  letter = signal('A');
  color = signal(PALETTE[0]);
  complete = signal(false);
  done = signal<Set<string>>(new Set());
  emoji = signal('🍎');
  wordText = signal('Apple');

  ngAfterViewInit() {
    this.ctx = this.cv().nativeElement.getContext('2d', { willReadFrequently: true })!;
    for (const w of wordPool(this.data)) {
      if (!this.examples.has(w.letter)) this.examples.set(w.letter, { word: w.word, emoji: w.emoji });
    }
    this.pickLetter('A');
  }

  pickLetter(l: string) {
    this.letter.set(l);
    const ex = this.examples.get(l);
    this.emoji.set(ex?.emoji ?? '⭐');
    this.wordText.set(ex?.word ?? l);
    this.audio.speak(l, 'en-US');
    this.draw();
  }

  next() {
    const i = ALPHABET.indexOf(this.letter());
    this.pickLetter(ALPHABET[(i + 1) % ALPHABET.length]);
  }

  say() {
    this.audio.speak(`${this.letter()}. ${this.wordText()}`, 'en-US');
  }

  /** Draws the grey guide letter; paint is clipped to it via source-atop. */
  draw() {
    const ctx = this.ctx;
    if (!ctx) return;
    this.complete.set(false);
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, SIZE, SIZE);
    ctx.fillStyle = `rgb(${GUIDE.join(',')})`;
    ctx.font = `900 ${SIZE * 0.86}px Arial, Helvetica, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    const m = ctx.measureText(this.letter());
    const h = (m.actualBoundingBoxAscent || SIZE * 0.6) + (m.actualBoundingBoxDescent || 0);
    ctx.fillText(this.letter(), SIZE / 2, (SIZE + h) / 2 - (m.actualBoundingBoxDescent || 0));

    const px = ctx.getImageData(0, 0, SIZE, SIZE).data;
    let n = 0;
    for (let i = 3; i < px.length; i += 4) if (px[i] > 200) n++;
    this.totalPixels = Math.max(1, n);
  }

  private pos(e: PointerEvent) {
    const r = this.cv().nativeElement.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * SIZE) / r.width, y: ((e.clientY - r.top) * SIZE) / r.height };
  }

  down(e: PointerEvent) {
    this.drawing = true;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
    this.last = this.pos(e);
    this.stroke(this.last, this.last);
  }

  move(e: PointerEvent) {
    if (!this.drawing) return;
    const p = this.pos(e);
    this.stroke(this.last, p);
    this.last = p;
  }

  up(_e: PointerEvent) {
    if (!this.drawing) return;
    this.drawing = false;
    this.checkProgress();
  }

  private stroke(a: { x: number; y: number }, b: { x: number; y: number }) {
    const ctx = this.ctx;
    ctx.globalCompositeOperation = 'source-atop'; // only paints on top of the letter
    ctx.strokeStyle = this.color();
    ctx.lineWidth = 34;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
    ctx.stroke();
  }

  private checkProgress() {
    if (this.complete()) return;
    const px = this.ctx.getImageData(0, 0, SIZE, SIZE).data;
    let painted = 0;
    for (let i = 0; i < px.length; i += 4) {
      if (px[i + 3] > 200 &&
          Math.abs(px[i] - GUIDE[0]) + Math.abs(px[i + 1] - GUIDE[1]) + Math.abs(px[i + 2] - GUIDE[2]) > 60) painted++;
    }
    if (painted / this.totalPixels >= 0.8) {
      this.complete.set(true);
      this.done.update(s => new Set(s).add(this.letter()));
      this.audio.playSoundEffect('ding');
      this.audio.speak(`${this.letter()} for ${this.wordText()}`, 'en-US');
      if (!this.rewarded.has(this.letter())) {
        this.rewarded.add(this.letter());
        this.data.addStars(1);
      }
      this.timers.after(() => this.complete.set(false), 2000);
    }
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
