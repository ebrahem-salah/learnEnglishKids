import { Component, Injectable, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { Timers } from './game-utils';

const STAGES = [
  { min: 0, emoji: '🥚', name: 'بيضة صغيرة', hint: 'أطعمها نجمة لتفقس!' },
  { min: 5, emoji: '🐣', name: 'كتكوت يفقس', hint: 'يا سلام! خرج من البيضة!' },
  { min: 15, emoji: '🐥', name: 'كتكوت صغير', hint: 'بيكبر بسرعة!' },
  { min: 30, emoji: '🐔', name: 'دجاجة كبيرة', hint: 'ما شاء الله كبرت!' },
  { min: 60, emoji: '🦚', name: 'طاووس ملوّن', hint: 'أنت أفضل مربّي حيوانات!' }
];

const PET_KEY = 'abc-kids-pet';
const GIFT_KEY = 'abc-kids-gift';

/** Pet growth is stored separately from the main progress so it can't be lost by other saves. */
@Injectable({ providedIn: 'root' })
export class PetService {
  xp = signal(this.load());

  private load(): number {
    try {
      return Math.max(0, parseInt(JSON.parse(localStorage.getItem(PET_KEY) || '{}').xp ?? '0', 10) || 0);
    } catch { return 0; }
  }

  addXp(n: number) {
    this.xp.update(x => x + n);
    try { localStorage.setItem(PET_KEY, JSON.stringify({ xp: this.xp() })); } catch { /* ignore */ }
  }

  stageIndex = computed(() => {
    const x = this.xp();
    let idx = 0;
    STAGES.forEach((s, i) => { if (x >= s.min) idx = i; });
    return idx;
  });
}

@Component({
  selector: 'app-daily-gift',
  standalone: true,
  styles: [`
    .shake { animation: shake .6s infinite; }
    @keyframes shake { 0%,100% { transform: rotate(0); } 25% { transform: rotate(-8deg); } 75% { transform: rotate(8deg); } }
  `],
  template: `
    <div class="bg-gradient-to-br from-yellow-100 to-orange-100 rounded-3xl p-6 text-center border-4 border-orange-300 shadow-lg">
      <h3 class="text-2xl font-black text-orange-700 mb-2">🎁 هديتك اليومية</h3>
      @if (opened()) {
        <div class="text-7xl mb-2">🎉</div>
        <p class="font-black text-xl text-green-700">ربحت {{ reward() }} نجوم!</p>
        <p class="font-bold text-gray-500 mt-1">تعالَ بكرة لهدية جديدة 🌟</p>
      } @else if (available()) {
        <button (click)="open()" class="text-8xl shake active:scale-90 transition-transform" aria-label="افتح الهدية">🎁</button>
        <p class="font-black text-orange-600 mt-2">اضغط على الصندوق لتفتحه!</p>
      } @else {
        <div class="text-7xl mb-2 opacity-60">📦</div>
        <p class="font-bold text-gray-600">أخذت هديتك اليوم. تعالَ بكرة! 🌙</p>
      }
    </div>
  `
})
export class DailyGiftComponent {
  private data = inject(DataService);
  private audio = inject(AudioService);

  available = signal(this.canClaim());
  opened = signal(false);
  reward = signal(0);

  private canClaim() {
    try { return localStorage.getItem(GIFT_KEY) !== new Date().toDateString(); } catch { return true; }
  }

  open() {
    if (!this.available()) return;
    const bonus = Math.min(this.data.streak(), 7);
    const n = 3 + bonus;
    this.reward.set(n);
    this.available.set(false);
    this.opened.set(true);
    try { localStorage.setItem(GIFT_KEY, new Date().toDateString()); } catch { /* ignore */ }
    this.audio.playCelebration();
    this.data.addStars(n);
  }
}

@Component({
  selector: 'app-pet',
  standalone: true,
  imports: [DailyGiftComponent, RouterLink],
  styles: [`
    .hop { animation: hop .6s; }
    @keyframes hop { 30% { transform: translateY(-40px) scale(1.1); } 60% { transform: translateY(0) scale(.95); } }
    .idle { animation: idle 2.4s ease-in-out infinite; }
    @keyframes idle { 50% { transform: translateY(-8px); } }
  `],
  template: `
    <div class="w-full max-w-xl mx-auto space-y-6" dir="rtl">
      <div class="bg-gradient-to-b from-sky-100 to-green-100 rounded-3xl p-6 text-center border-4 border-green-300 shadow-xl">
        <h2 class="text-3xl font-black text-green-700 mb-1">🐣 حيواني الأليف</h2>
        <p class="font-bold text-gray-600 mb-4">كل نجمة تطعمها له تساعده على النمو!</p>

        <div class="text-[9rem] leading-none my-4" [class.hop]="hopping()" [class.idle]="!hopping()">{{ stage().emoji }}</div>
        <div class="font-black text-2xl text-green-800">{{ stage().name }}</div>
        <p class="font-bold text-gray-500 mb-4">{{ message() || stage().hint }}</p>

        @if (next(); as n) {
          <div class="max-w-xs mx-auto mb-4">
            <div class="flex justify-between text-sm font-black text-gray-600 mb-1">
              <span>{{ pet.xp() }}</span><span>{{ n.min }} {{ n.emoji }}</span>
            </div>
            <div class="h-4 bg-white rounded-full overflow-hidden border-2 border-green-200">
              <div class="h-full bg-gradient-to-r from-lime-400 to-green-500 transition-all duration-500" [style.width.%]="progress()"></div>
            </div>
          </div>
        } @else {
          <p class="font-black text-purple-600 mb-4">🏆 وصل لأعلى مستوى!</p>
        }

        <button (click)="feed()"
                class="px-8 py-3 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xl font-black shadow-[0_6px_0_#15803d] active:translate-y-1.5 active:shadow-none transition-all">
          🌾 أطعمه (⭐ 1)
        </button>
        <div class="mt-3 font-black text-amber-700">رصيدك: ⭐ {{ data.stars() }}</div>
        @if (data.stars() < 1) {
          <a routerLink="/games" class="inline-block mt-2 bg-orange-100 border-2 border-orange-300 text-orange-700 px-4 py-2 rounded-full font-black">
            🎮 العب لتجمع نجوم!
          </a>
        }
      </div>

      <app-daily-gift />
    </div>
  `
})
export class PetComponent implements OnDestroy {
  data = inject(DataService);
  pet = inject(PetService);
  private audio = inject(AudioService);
  private timers = new Timers();

  hopping = signal(false);
  message = signal('');

  stage = computed(() => STAGES[this.pet.stageIndex()]);
  next = computed(() => STAGES[this.pet.stageIndex() + 1] ?? null);
  progress = computed(() => {
    const cur = this.stage();
    const n = this.next();
    if (!n) return 100;
    return Math.min(100, ((this.pet.xp() - cur.min) / (n.min - cur.min)) * 100);
  });

  feed() {
    if (this.data.stars() < 1) {
      this.message.set('محتاج نجمة عشان آكل! العب شوية 🌟');
      this.audio.playSoundEffect('buzz');
      return;
    }
    const before = this.pet.stageIndex();
    this.data.stars.update(s => s - 1);
    this.data.save();
    this.pet.addXp(1);
    this.audio.playSoundEffect('pop');
    this.hopping.set(true);
    this.timers.after(() => this.hopping.set(false), 650);

    if (this.pet.stageIndex() > before) {
      this.message.set('🎉 كبرت! شكراً يا صديقي!');
      this.audio.playCelebration();
    } else {
      this.message.set('ممم… لذيذ! 😋');
    }
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
