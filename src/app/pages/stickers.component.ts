import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DataService } from '../services/data.service';
import { AudioService, Sticker } from '../services/audio.service';

@Component({
  selector: 'app-stickers',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #pic let-e let-img="img" let-cls="cls">
      @if (img) {
        <img [src]="'assets/images/' + img" alt="" loading="lazy" [class]="cls + ' object-contain drop-shadow-lg'" />
      } @else if (!data.failed().has(e)) {
        <img [src]="data.imgUrl(e)" (error)="data.markFailed(e)" alt="" loading="lazy" [class]="cls" />
      } @else {
        <span class="text-6xl select-none">{{ e }}</span>
      }
    </ng-template>

    <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-yellow-300 max-w-5xl mx-auto text-center font-[Bubblegum]" dir="rtl">
      <div class="flex justify-between items-center mb-6 bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
        <h2 class="text-2xl md:text-3xl font-black text-yellow-800">🛒 متجر الجوائز والمكافآت (Sticker Shop)</h2>
        <div class="text-xl font-black text-amber-700 bg-white px-4 py-2 rounded-full border border-yellow-300 shadow-sm">
          ⭐ رصيدك: {{ data.stars() }} نجمة
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-6">
        @for (st of data.stickersData(); track st.id) {
          <div class="rounded-3xl p-5 border-4 flex flex-col items-center justify-between transition-all hover:scale-105"
            [class]="st.unlocked ? 'bg-amber-50 border-yellow-400 shadow-md' : 'bg-gray-100 border-gray-300 opacity-75'">
            <div class="h-28 flex items-center justify-center my-2">
              @if (st.unlocked) {
                <ng-container *ngTemplateOutlet="pic; context: { $implicit: st.img, img: st.imagePath, cls: 'w-24 h-24 drop-shadow-lg animate-bounce' }" />
              } @else {
                <div class="flex flex-col items-center">
                  <span class="text-6xl text-gray-400 select-none">🔒</span>
                  <span class="text-xs font-bold text-gray-400 mt-1">مقفل</span>
                </div>
              }
            </div>
            <div class="font-black text-gray-800 text-lg mb-2">{{ st.name }}</div>
            @if (st.unlocked) {
              <span class="bg-green-500 text-white font-black text-sm px-4 py-1.5 rounded-full shadow">مفتوح 🎉</span>
            } @else {
              <button (click)="unlockSticker(st)" class="bg-yellow-500 hover:bg-yellow-600 text-white font-black text-sm px-5 py-2 rounded-full shadow-md transition-all active:scale-95">
                فتح بـ {{ st.cost }} ⭐
              </button>
            }
          </div>
        }
      </div>
    </div>
  `
})
export class StickersComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  unlockSticker(st: Sticker) {
    if (this.data.stars() < st.cost) {
      this.audio.speak('نجومك غير كافية، حل الاختبارات أولاً!', 'ar-EG');
      return;
    }
    this.data.stars.update(s => s - st.cost);
    this.data.stickersData.update(list => list.map(item => item.id === st.id ? { ...item, unlocked: true } : item));
    this.data.save();
    this.audio.beep([523, 659, 784, 1047]);
    this.audio.speak('مبروك! تم فتح ملصق ' + st.name, 'ar-EG');
  }
}
