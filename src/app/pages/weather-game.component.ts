import { Component, OnDestroy, inject, signal } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { OUTFIT_ITEMS, OutfitItem, WEATHER_PROMPT, WEATHER_SCENES, WeatherScene } from './game-content';
import { Timers, shuffle } from './game-utils';

@Component({
  selector: 'app-weather-game',
  standalone: true,
  styles: [`
    .nope { animation: nope .4s; }
    @keyframes nope { 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
    .bob { animation: bob 2.6s ease-in-out infinite; }
    @keyframes bob { 50% { transform: translateY(-14px); } }
    .drop { animation: drop 1.1s linear infinite; }
    @keyframes drop { from { transform: translateY(-30px); opacity: 1; } to { transform: translateY(380px); opacity: .2; } }
  `],
  template: `
    <div class="relative w-full h-[80vh] min-h-[600px] max-h-[940px] rounded-3xl overflow-hidden select-none bg-gradient-to-b flex flex-col items-center transition-colors duration-700"
         [class]="scene().sky" dir="ltr" style="touch-action: manipulation; -webkit-tap-highlight-color: transparent">

      <!-- falling drops / flakes -->
      @if (scene().key === 'Rainy' || scene().key === 'Snowy') {
        @for (d of drops; track d) {
          <span class="drop absolute top-0 text-2xl pointer-events-none"
                [style.left.%]="d * 8" [style.animation-delay]="(d % 5) * 0.2 + 's'">{{ scene().key === 'Rainy' ? '💧' : '❄️' }}</span>
        }
      }

      <div class="w-full px-4 pt-3 flex justify-between items-center z-10">
        <div class="bg-white/90 rounded-full px-4 py-2 font-black text-sky-700 shadow">⭐ {{ score() }}</div>
        <div class="flex gap-2">
          @for (s of scenes; track s.key) {
            <button (click)="pickScene(s)" [attr.aria-label]="s.key"
                    class="w-14 h-14 rounded-2xl text-3xl border-4 shadow transition-all active:scale-90"
                    [class]="s.key === scene().key ? 'bg-white border-amber-400 scale-110' : 'bg-white/70 border-white'">{{ s.emoji }}</button>
          }
        </div>
      </div>

      <button (click)="sayScene()" class="bob mt-4 text-[8rem] leading-none z-10" aria-label="Hear the weather">{{ scene().emoji }}</button>
      <p class="text-3xl font-black text-slate-800 z-10">{{ scene().en }}</p>
      <p class="text-xl font-bold text-slate-600 z-10" dir="rtl">{{ scene().ar }}</p>
      <button (click)="sayArabic()" class="mt-1 bg-white/80 border-2 border-white rounded-full px-4 py-1 font-black text-sky-700 text-sm z-10">🔊 عربي</button>

      <!-- dress up -->
      <div class="mt-4 w-full max-w-2xl px-4 z-10 text-center">
        <p class="font-black text-xl text-slate-800">
          {{ done() ? '🎉 Perfect! You are ready!' : prompt.en }}
          @if (!done()) { <span class="text-base font-bold text-slate-600" dir="rtl"> · {{ prompt.ar }}</span> }
        </p>
        <div class="flex justify-center gap-2 mt-1 text-3xl h-10">
          @for (n of needed(); track $index) { <span>{{ $index < found().size ? '👕' : '⬜' }}</span> }
        </div>
        <div class="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-3">
          @for (o of options(); track o.en) {
            <button (click)="wear(o)" [disabled]="done() || found().has(o.en)" [attr.aria-label]="o.en"
                    [class.nope]="shake() === o.en"
                    class="rounded-2xl py-3 border-4 shadow bg-white flex flex-col items-center transition-all active:scale-95"
                    [class]="found().has(o.en) ? 'border-green-500 bg-green-50 opacity-70' : 'border-white'">
              <span class="text-5xl leading-none">{{ o.img }}</span>
              <span class="text-xs font-black text-slate-700 mt-1">{{ o.en }}</span>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class WeatherGameComponent implements OnDestroy {
  private data = inject(DataService);
  private audio = inject(AudioService);
  private timers = new Timers();

  readonly scenes = WEATHER_SCENES;
  readonly prompt = WEATHER_PROMPT;
  readonly drops = Array.from({ length: 12 }, (_, i) => i);

  scene = signal<WeatherScene>(WEATHER_SCENES[0]);
  options = signal<OutfitItem[]>([]);
  found = signal<Set<string>>(new Set());
  score = signal(0);
  shake = signal<string | null>(null);
  done = signal(false);

  constructor() { this.pickScene(WEATHER_SCENES[0], false); }

  /** how many good items must be found (3, or fewer if a weather has fewer choices) */
  needed() { return Array.from({ length: Math.min(3, OUTFIT_ITEMS.filter(i => i.for.includes(this.scene().key)).length) }); }

  pickScene(s: WeatherScene, speak = true) {
    this.timers.clearAll();
    this.scene.set(s);
    const good = shuffle(OUTFIT_ITEMS.filter(i => i.for.includes(s.key))).slice(0, 3);
    const bad = shuffle(OUTFIT_ITEMS.filter(i => !i.for.includes(s.key))).slice(0, 3);
    this.options.set(shuffle([...good, ...bad]));
    this.found.set(new Set());
    this.done.set(false);
    if (speak) {
      this.audio.playSoundEffect('pop');
      this.timers.after(() => this.sayScene(), 200);
    }
  }

  sayScene() { this.audio.speak(this.scene().en, 'en-US'); }
  sayArabic() { this.audio.speakArabic(this.scene().en, this.scene().ar); }

  wear(o: OutfitItem) {
    if (this.done() || this.found().has(o.en)) return;
    this.audio.speak(o.en, 'en-US');
    if (o.for.includes(this.scene().key)) {
      this.found.update(f => new Set(f).add(o.en));
      this.audio.playSoundEffect('ding');
      if (this.found().size >= this.needed().length) {
        this.done.set(true);
        this.score.update(s => s + 1);
        this.data.addStars(1);
        this.timers.after(() => this.audio.playCelebration(), 500);
      }
    } else {
      this.audio.playSoundEffect('buzz');
      this.shake.set(o.en);
      this.timers.after(() => this.shake.set(null), 450);
    }
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
