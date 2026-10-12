import { Component, inject, signal } from '@angular/core';
import { AudioService } from '../services/audio.service';
import { StatsService } from '../services/stats.service';
import { ARABIC_LETTERS, ArabicLetter, HARAKAT, Haraka, letterForms, syllable } from './arabic-content';
import { ArabicGameComponent } from './arabic-game.component';
import { ColorLetterGameComponent } from './color-letter-game.component';
import { HarakatGameComponent } from './harakat-game.component';

type Tab = 'letters' | 'harakat' | 'games';
type GameKey = 'listen' | 'first' | 'color' | 'harakat';

@Component({
  selector: 'app-arabic',
  standalone: true,
  imports: [ArabicGameComponent, ColorLetterGameComponent, HarakatGameComponent],
  styles: [`.ar { font-family: 'Cairo', 'Tahoma', 'Arial', sans-serif; }`],
  template: `
    <div class="ar max-w-5xl mx-auto space-y-5" dir="rtl">
      <div class="bg-gradient-to-br from-emerald-100 to-teal-100 rounded-3xl shadow-xl border-4 border-emerald-300 p-6 text-center">
        <h2 class="text-3xl font-black text-emerald-800">🇪🇬 تعلّم الحروف العربية</h2>
        <p class="font-bold text-gray-600 mt-1">٢٨ حرفًا · اسمع · اختر · لوّن</p>
        <div class="flex justify-center gap-3 mt-4">
          <button (click)="tab.set('letters'); game.set(null)" class="px-6 py-2 rounded-full font-black border-4 shadow transition-all"
                  [class]="tab() === 'letters' ? 'bg-emerald-500 text-white border-emerald-700' : 'bg-white text-emerald-700 border-emerald-200'">🔤 الحروف</button>
          <button (click)="tab.set('harakat'); game.set(null)" class="px-6 py-2 rounded-full font-black border-4 shadow transition-all"
                  [class]="tab() === 'harakat' ? 'bg-violet-500 text-white border-violet-700' : 'bg-white text-violet-700 border-violet-200'">🎵 الحركات</button>
          <button (click)="tab.set('games')" class="px-6 py-2 rounded-full font-black border-4 shadow transition-all"
                  [class]="tab() === 'games' ? 'bg-amber-500 text-white border-amber-700' : 'bg-white text-amber-700 border-amber-200'">🎮 ألعاب</button>
        </div>
      </div>

      @if (tab() === 'letters') {
        @if (sel(); as l) {
          <div class="bg-white rounded-3xl shadow-xl border-4 border-emerald-200 p-6">
            <div class="flex flex-col sm:flex-row items-center gap-6">
              <button (click)="sayLetter(l)" class="w-44 h-44 rounded-3xl bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-[8rem] leading-none font-black shadow-[0_8px_0_#047857] active:translate-y-2 active:shadow-none transition-all flex items-center justify-center" [attr.aria-label]="l.letterName">{{ l.glyph }}</button>
              <div class="flex-1 text-center sm:text-right space-y-3">
                <div class="text-3xl font-black text-emerald-800">{{ l.letterName }} <button (click)="sayLetter(l)" class="text-2xl" aria-label="اسمع">🔊</button></div>
                <button (click)="sayWord(l)" class="bg-amber-50 border-4 border-amber-200 rounded-3xl px-6 py-3 flex items-center gap-4 mx-auto sm:mx-0">
                  <span class="text-6xl">{{ l.emoji }}</span>
                  <span class="text-4xl font-black text-amber-800">{{ l.exampleWord }}</span>
                  <span class="text-2xl">🔊</span>
                </button>
              </div>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
              @for (f of forms(l.glyph); track f.label) {
                <div class="rounded-2xl bg-emerald-50 border-2 border-emerald-100 p-3 text-center">
                  <div class="text-5xl font-black text-emerald-900 h-16 flex items-center justify-center">{{ f.text || '—' }}</div>
                  <div class="text-xs font-bold text-gray-500">{{ f.label }}</div>
                </div>
              }
            </div>
          </div>
        }

        <div class="grid grid-cols-4 sm:grid-cols-7 gap-3">
          @for (l of letters; track l.id) {
            <button (click)="select(l)" class="rounded-2xl py-3 border-4 shadow-sm text-5xl font-black transition-all active:scale-95"
                    [class]="sel()?.id === l.id ? 'bg-emerald-500 text-white border-emerald-700 scale-105' : 'bg-white text-emerald-800 border-emerald-100'"
                    [attr.aria-label]="l.letterName">{{ l.glyph }}</button>
          }
        </div>
      } @else if (tab() === 'harakat') {
        <div class="bg-white rounded-3xl shadow-xl border-4 border-violet-200 p-6">
          <p class="text-center font-bold text-gray-600 mb-4">الحركات تغيّر صوت الحرف: <b class="text-violet-700">فتحة</b> فوق الحرف، <b class="text-violet-700">ضمة</b> فوقه، <b class="text-violet-700">كسرة</b> تحته. اضغط لتسمع.</p>
          @if (sel(); as l) {
            <div class="grid grid-cols-3 gap-4">
              @for (h of harakat; track h.id) {
                <button (click)="sayHaraka(l, h)" class="rounded-3xl bg-gradient-to-b from-violet-50 to-fuchsia-50 border-4 border-violet-200 py-5 shadow active:scale-95 transition-all">
                  <div class="text-8xl leading-[1.3] font-black text-violet-900">{{ syl(l.glyph, h) }}</div>
                  <div class="font-black text-violet-700 text-xl">{{ h.name }} 🔊</div>
                  <div class="text-xs font-bold text-gray-500 px-2 mt-1">{{ h.hint }}</div>
                </button>
              }
            </div>
          }
        </div>
        <div class="grid grid-cols-7 sm:grid-cols-12 gap-2">
          @for (l of letters; track l.id) {
            <button (click)="sel.set(l)" class="rounded-xl py-2 border-4 text-3xl font-black transition-all active:scale-95"
                    [class]="sel()?.id === l.id ? 'bg-violet-500 text-white border-violet-700 scale-105' : 'bg-white text-violet-800 border-violet-100'"
                    [attr.aria-label]="l.letterName">{{ l.glyph }}</button>
          }
        </div>
      } @else {
        @if (game() === null) {
          <div class="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            @for (g of gameCards; track g.key) {
              <button (click)="openGame(g.key)" class="rounded-3xl p-6 text-center border-4 shadow-lg transition-all hover:scale-105 active:scale-95" [class]="g.cls">
                <div class="text-7xl mb-2">{{ g.icon }}</div>
                <div class="text-2xl font-black">{{ g.title }}</div>
                <div class="text-sm font-bold opacity-80 mt-1">{{ g.desc }}</div>
              </button>
            }
          </div>
        } @else {
          <button (click)="game.set(null)" class="px-5 py-2 rounded-full bg-white border-4 border-gray-200 font-black text-gray-700 shadow">↩️ رجوع للألعاب</button>
          @if (game() === 'listen') { <app-arabic-game [mode]="'listen'" /> }
          @else if (game() === 'first') { <app-arabic-game [mode]="'first'" /> }
          @else if (game() === 'harakat') { <app-harakat-game /> }
          @else { <app-color-letter-game [lang]="'ar'" /> }
        }
      }
    </div>
  `
})
export class ArabicComponent {
  private audio = inject(AudioService);
  private stats = inject(StatsService);

  letters = ARABIC_LETTERS;
  tab = signal<Tab>('letters');
  sel = signal<ArabicLetter | null>(ARABIC_LETTERS[0]);
  game = signal<GameKey | null>(null);

  gameCards: { key: GameKey; icon: string; title: string; desc: string; cls: string }[] = [
    { key: 'listen', icon: '👂', title: 'اسمع واختر', desc: 'اسمع اسم الحرف واختر شكله', cls: 'bg-emerald-100 border-emerald-400 text-emerald-800' },
    { key: 'first', icon: '🖼️', title: 'أول حرف', desc: 'بأي حرف تبدأ الكلمة؟', cls: 'bg-amber-100 border-amber-400 text-amber-800' },
    { key: 'harakat', icon: '🎵', title: 'اسمع واختر الحركة', desc: 'فتحة أم ضمة أم كسرة؟', cls: 'bg-violet-100 border-violet-400 text-violet-800' },
    { key: 'color', icon: '🖍️', title: 'لوّن الحرف', desc: 'لوّن الحرف بإصبعك', cls: 'bg-rose-100 border-rose-400 text-rose-800' }
  ];

  forms = letterForms;
  harakat = HARAKAT;
  syl = syllable;

  select(l: ArabicLetter) { this.sel.set(l); this.sayLetter(l); }
  sayLetter(l: ArabicLetter) { this.audio.speakArabic(l.id, l.letterName); }
  sayHaraka(l: ArabicLetter, h: Haraka) { this.audio.speakArabic(`${l.id} ${h.id}`, syllable(l.glyph, h)); }
  sayWord(l: ArabicLetter) { this.audio.speakArabic(l.id + ' word', l.exampleWord); }

  openGame(k: GameKey) {
    this.game.set(k);
    this.stats.playedGame('arabic-' + k);
  }
}
