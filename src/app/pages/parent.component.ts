import { Component, OnDestroy, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { StatsService } from '../services/stats.service';
import { AudioService } from '../services/audio.service';
import { ProfileService } from '../services/profile.service';
import { OfflineService } from '../services/offline.service';
import { Timers, shuffle } from './game-utils';

const GAME_NAMES: Record<string, string> = {
  match: 'المطابقة', memory: 'الذاكرة', quiz: 'الكويز', journey: 'الرحلة', shadow: 'الظلال', balloon: 'البالونات', train: 'القطار',
  shape: 'الأشكال', apple: 'التفاح', math: 'الحساب', puzzle: 'البازل', spelling: 'التهجئة', sorting: 'الفرز', sound: 'أصوات الحيوانات',
  pattern: 'الأنماط', rain: 'مطر الحروف', whack: 'اضرب الكلمة', race: 'سباق السيارات', monster: 'أطعم الوحش', treasure: 'البحث عن الكنز',
  listen: 'اسمع واختار', fish: 'أنقذ السمكة', colorletter: 'لوّن الحرف', mixcolors: 'اخلط الألوان', family: 'مين في العيلة',
  feelings: 'المشاعر', body: 'جسمي', jobs: 'المهن', weather: 'طقس اليوم', days: 'الأيام والشهور', sentence: 'رتّب الجملة'
};

@Component({
  selector: 'app-parent',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-3xl mx-auto space-y-6" dir="rtl">
      @if (!unlocked()) {
        <!-- parental gate -->
        <div class="bg-white rounded-3xl shadow-xl border-4 border-slate-300 p-8 text-center">
          <div class="text-6xl mb-2">🔒</div>
          <h2 class="text-2xl font-black text-slate-700 mb-1">منطقة الأهل</h2>
          <p class="font-bold text-gray-500 mb-4">للتأكد أنك شخص بالغ، احسب:</p>
          <div class="text-5xl font-black text-indigo-700 mb-4" dir="ltr">{{ a() }} + {{ b() }} = ?</div>
          <div class="flex justify-center gap-3 flex-wrap">
            @for (o of options(); track o) {
              <button (click)="answer(o)" class="w-24 h-20 rounded-2xl bg-indigo-50 border-4 text-3xl font-black text-indigo-700 shadow active:scale-95 transition-all"
                      [class]="wrong() === o ? 'border-red-400 bg-red-50' : 'border-indigo-200'">{{ o }}</button>
            }
          </div>
          @if (wrong() !== null) { <p class="mt-3 font-black text-red-500">إجابة خاطئة، جرّب سؤالًا جديدًا</p> }
        </div>
      } @else {
        <div class="bg-gradient-to-br from-indigo-100 to-sky-100 rounded-3xl shadow-xl border-4 border-indigo-200 p-6">
          <div class="flex items-center gap-4">
            <div class="text-6xl">{{ ps.active().avatar }}</div>
            <div class="flex-1">
              <h2 class="text-2xl font-black text-indigo-800">تقرير {{ data.childName() || 'الطفل' }}</h2>
              <p class="font-bold text-gray-500 text-sm">كل البيانات محفوظة على هذا الجهاز فقط</p>
            </div>
            <button (click)="lock()" class="px-4 py-2 rounded-xl bg-white border-2 border-indigo-200 font-black text-indigo-700">🔒 قفل</button>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            @for (c of cards(); track c.label) {
              <div class="bg-white rounded-2xl p-3 text-center shadow border-2 border-white">
                <div class="text-3xl">{{ c.icon }}</div>
                <div class="text-2xl font-black text-indigo-700">{{ c.value }}</div>
                <div class="text-xs font-bold text-gray-500">{{ c.label }}</div>
              </div>
            }
          </div>
        </div>

        <div class="bg-white rounded-3xl shadow-xl border-4 border-emerald-200 p-6">
          <h3 class="text-xl font-black text-emerald-700 mb-3">📈 النشاط آخر 7 أيام (عدد الألعاب)</h3>
          <div class="flex items-end justify-between gap-2 h-36">
            @for (d of stats.last7(); track $index) {
              <div class="flex-1 flex flex-col items-center justify-end h-full">
                <span class="text-xs font-black text-emerald-700">{{ d.plays || '' }}</span>
                <div class="w-full bg-gradient-to-t from-emerald-500 to-lime-300 rounded-t-lg transition-all" [style.height.%]="(d.plays / maxPlays()) * 85 + (d.plays ? 6 : 2)"></div>
                <span class="text-xs font-bold text-gray-500 mt-1">{{ d.day }}</span>
              </div>
            }
          </div>
        </div>

        <div class="grid sm:grid-cols-2 gap-6">
          <div class="bg-white rounded-3xl shadow-xl border-4 border-amber-200 p-6">
            <h3 class="text-xl font-black text-amber-700 mb-3">🎮 الألعاب المفضلة</h3>
            @for (g of stats.playsByGame().slice(0, 6); track g[0]) {
              <div class="flex justify-between py-1 border-b border-amber-50 font-bold text-gray-700">
                <span>{{ name(g[0]) }}</span><span class="text-amber-600">{{ g[1] }} مرة</span>
              </div>
            } @empty { <p class="font-bold text-gray-400">لا توجد بيانات بعد</p> }
          </div>
          <div class="bg-white rounded-3xl shadow-xl border-4 border-rose-200 p-6">
            <h3 class="text-xl font-black text-rose-700 mb-3">🧩 كلمات تحتاج تدريب</h3>
            @for (m of stats.topMisses(); track m[0]) {
              <div class="flex justify-between items-center py-1 border-b border-rose-50 font-bold text-gray-700" dir="ltr">
                <button (click)="hear(m[0])" class="text-left">🔊 {{ m[0] }}</button>
                <span class="text-rose-500 text-sm">× {{ m[1] }}</span>
              </div>
            } @empty { <p class="font-bold text-gray-400">ممتاز! لا أخطاء مسجلة 🎉</p> }
          </div>
        </div>

        <div class="bg-white rounded-3xl shadow-xl border-4 border-slate-200 p-6 space-y-4">
          <h3 class="text-xl font-black text-slate-700">⚙️ الإعدادات</h3>
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-700">🔊 الصوت في التطبيق</span>
            <button (click)="audio.setSound(!audio.soundOn())" class="px-5 py-2 rounded-full font-black text-white"
                    [class]="audio.soundOn() ? 'bg-green-500' : 'bg-gray-400'">{{ audio.soundOn() ? 'مفتوح' : 'مكتوم' }}</button>
          </div>
          <div class="flex items-center justify-between">
            <span class="font-bold text-gray-700">🐢 نطق بطيء</span>
            <button (click)="audio.slow.set(!audio.slow())" class="px-5 py-2 rounded-full font-black text-white"
                    [class]="audio.slow() ? 'bg-green-500' : 'bg-gray-400'">{{ audio.slow() ? 'مفعّل' : 'متوقف' }}</button>
          </div>
          <div class="rounded-2xl border-2 border-sky-200 bg-sky-50 p-4">
            <div class="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <div class="font-black text-sky-800">📴 العمل بدون إنترنت</div>
                <div class="text-sm font-bold text-gray-500">يحمّل الأصوات والصور على الجهاز مرة واحدة (حوالي {{ offline.totalMB() }} MB). يفضّل استخدام الواي فاي.</div>
              </div>
              @if (offline.state() === 'done') {
                <span class="font-black text-green-600">✅ جاهز بدون إنترنت</span>
              } @else {
                <button (click)="offline.download()" [disabled]="offline.state() === 'loading'"
                        class="px-5 py-2 rounded-xl bg-sky-500 text-white font-black shadow disabled:opacity-60">
                  {{ offline.state() === 'loading' ? 'جارِ التحميل…' : offline.state() === 'error' ? 'حاول مرة أخرى' : 'حمّل للعمل بدون إنترنت' }}
                </button>
              }
            </div>
            @if (offline.state() === 'loading') {
              <div class="h-3 bg-white rounded-full overflow-hidden mt-3 border border-sky-200">
                <div class="h-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all" [style.width.%]="offline.progress() * 100"></div>
              </div>
            }
            @if (offline.state() === 'error') { <p class="text-sm font-bold text-red-500 mt-2">تعذّر تحميل بعض الملفات. تأكد من الاتصال وحاول مرة أخرى.</p> }
          </div>
          <div class="flex flex-wrap gap-3">
            <a routerLink="/profiles" class="px-4 py-2 rounded-xl bg-sky-100 text-sky-800 font-black border-2 border-sky-200">👨‍👩‍👧‍👦 إدارة الأطفال</a>
            <a routerLink="/worksheets" class="px-4 py-2 rounded-xl bg-amber-100 text-amber-800 font-black border-2 border-amber-200">🖨️ أوراق عمل للطباعة</a>
            <a routerLink="/privacy" class="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-black border-2 border-slate-200">🔐 سياسة الخصوصية</a>
          </div>
          <div class="pt-3 border-t">
            @if (!confirmReset()) {
              <button (click)="confirmReset.set(true)" class="text-red-500 font-black underline">مسح تقدم هذا الطفل</button>
            } @else {
              <span class="font-bold text-red-600">متأكد؟ لن يمكن التراجع. </span>
              <button (click)="reset()" class="px-4 py-1 rounded-lg bg-red-500 text-white font-black mx-2">نعم، امسح</button>
              <button (click)="confirmReset.set(false)" class="font-bold text-gray-500 underline">إلغاء</button>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class ParentComponent implements OnDestroy {
  data = inject(DataService);
  stats = inject(StatsService);
  audio = inject(AudioService);
  ps = inject(ProfileService);
  offline = inject(OfflineService);
  private timers = new Timers();

  unlocked = signal(false);
  a = signal(0); b = signal(0);
  options = signal<number[]>([]);
  wrong = signal<number | null>(null);
  confirmReset = signal(false);

  constructor() { this.newQuestion(); }

  private newQuestion() {
    const a = 6 + Math.floor(Math.random() * 7), b = 6 + Math.floor(Math.random() * 7);
    this.a.set(a); this.b.set(b);
    const right = a + b;
    const set = new Set<number>([right]);
    while (set.size < 4) set.add(right + Math.floor(Math.random() * 9) - 4);
    this.options.set(shuffle([...set]));
    this.wrong.set(null);
  }

  answer(n: number) {
    if (n === this.a() + this.b()) {
      this.unlocked.set(true);
      // lock again after 5 minutes
      this.timers.after(() => this.lock(), 5 * 60 * 1000);
    } else {
      this.wrong.set(n);
      this.timers.after(() => this.newQuestion(), 900);
    }
  }

  lock() { this.unlocked.set(false); this.confirmReset.set(false); this.newQuestion(); }

  name(id: string) { return GAME_NAMES[id] ?? id; }
  hear(t: string) { this.audio.speak(t, /[\u0600-\u06FF]/.test(t) ? 'ar-EG' : 'en-US'); }
  maxPlays = computed(() => Math.max(1, ...this.stats.last7().map(d => d.plays)));

  cards = computed(() => [
    { icon: '⭐', value: this.data.stars(), label: 'النجوم الحالية' },
    { icon: '🔥', value: this.data.streak(), label: 'أيام متتالية' },
    { icon: '🔤', value: `${this.data.learned().size}/26`, label: 'حروف تعلّمها' },
    { icon: '🎮', value: this.stats.totalPlays(), label: 'مرات اللعب' }
  ]);

  reset() {
    this.stats.resetAll();
    this.data.learned.set(new Set());
    this.data.passedLessons.set(new Set(['A']));
    this.data.stars.set(10);
    this.data.streak.set(1);
    this.data.save();
    this.confirmReset.set(false);
  }

  ngOnDestroy() { this.timers.clearAll(); }
}
