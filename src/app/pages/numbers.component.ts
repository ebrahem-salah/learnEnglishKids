import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-numbers',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #pic let-e let-cls="cls">
      @if (!data.failed().has(e)) {
        <img [src]="data.imgUrl(e)" (error)="data.markFailed(e)" alt="" loading="lazy" [class]="cls" />
      } @else {
        <span class="text-6xl select-none">{{ e }}</span>
      }
    </ng-template>

    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
      @for (num of data.numbersData; track num.num) {
        <div (click)="playNumber(num)" class="bg-white rounded-3xl p-6 text-center shadow-lg border-b-8 border-emerald-400 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
          <div class="text-7xl font-black text-emerald-600 mb-2 group-hover:scale-110 transition-transform">{{ num.num }}</div>
          <div class="text-2xl font-black text-gray-700 mb-1">{{ num.en }}</div>
          <div class="text-lg font-bold text-gray-500 mb-3">{{ num.ar }}</div>
          <div class="flex justify-center gap-1 flex-wrap bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
            @for (i of data.countArray(num.num); track $index) {
              <ng-container *ngTemplateOutlet="pic; context: { $implicit: num.icon, cls: 'w-8 h-8 drop-shadow' }" />
            }
          </div>
        </div>
      }
    </div>
  `
})
export class NumbersComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  playNumber(num: { num: number; en: string; ar: string }) {
    this.audio.sequence('N' + num.num, [
      [num.en, 'en-US'],
      [num.ar, 'ar-EG']
    ]);
  }
}
