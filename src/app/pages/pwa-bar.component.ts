import { Component, inject, signal } from '@angular/core';
import { PwaService } from '../services/pwa.service';
import { UiScaleService } from '../services/ui-scale.service';

/** Small floating bar: install the site as an app, new-version notice, offline notice, text size, share. */
@Component({
  selector: 'app-pwa-bar',
  standalone: true,
  template: `
    <div class="fixed z-40 flex flex-col items-start gap-2 max-w-[18rem]" dir="rtl"
         style="left: max(0.75rem, env(safe-area-inset-left)); bottom: max(0.75rem, env(safe-area-inset-bottom))">

      @if (!pwa.online()) {
        <div class="bg-slate-800 text-white rounded-2xl px-4 py-2 text-sm font-bold shadow-lg">
          📴 أنت بدون إنترنت. المحتوى المحمّل يعمل كالمعتاد.
        </div>
      }

      @if (pwa.updateReady()) {
        <div class="bg-emerald-600 text-white rounded-2xl px-4 py-3 shadow-lg flex items-center gap-3">
          <span class="text-sm font-black">✨ نسخة جديدة جاهزة</span>
          <button (click)="pwa.applyUpdate()" class="bg-white text-emerald-700 rounded-xl px-3 py-1 font-black text-sm">حدّث الآن</button>
        </div>
      }

      @if (!pwa.installed()) {
        @if (pwa.canInstall()) {
          <button (click)="pwa.install()" class="bg-blue-600 text-white rounded-2xl px-4 py-2 font-black text-sm shadow-lg">📲 ثبّت الموقع كتطبيق</button>
        } @else if (pwa.isIos) {
          <button (click)="iosHint.set(!iosHint())" class="bg-blue-600 text-white rounded-2xl px-4 py-2 font-black text-sm shadow-lg">📲 كيف أثبّته؟</button>
          @if (iosHint()) {
            <div class="bg-white rounded-2xl px-4 py-3 text-sm font-bold text-gray-700 shadow-lg border-2 border-blue-200">
              اضغط زر المشاركة <span class="text-lg">⬆️</span> في Safari، ثم اختر «إضافة إلى الشاشة الرئيسية».
            </div>
          }
        }
      }

      <div class="flex gap-2">
        <button (click)="ui.cycle()" class="bg-white/95 border-2 border-sky-200 rounded-full px-3 py-1.5 text-sm font-black text-sky-700 shadow"
                aria-label="حجم الواجهة">🔠 {{ ui.label }}</button>
        <button (click)="share()" class="bg-white/95 border-2 border-sky-200 rounded-full px-3 py-1.5 text-sm font-black text-sky-700 shadow"
                aria-label="مشاركة الموقع">{{ shared() === 'copied' ? '✅ تم نسخ الرابط' : '🔗 شارك' }}</button>
      </div>
    </div>
  `
})
export class PwaBarComponent {
  pwa = inject(PwaService);
  ui = inject(UiScaleService);
  iosHint = signal(false);
  shared = signal<'' | 'copied'>('');

  async share() {
    const r = await this.pwa.share();
    if (r === 'copied') { this.shared.set('copied'); setTimeout(() => this.shared.set(''), 2500); }
  }
}
