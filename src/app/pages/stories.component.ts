import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-stories',
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

    <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-purple-300 max-w-4xl mx-auto">
      <h2 class="text-3xl font-black text-purple-700 mb-2 text-center">📖 القصص التفاعلية القصيرة (Short Stories)</h2>
      <p class="text-gray-600 font-bold mb-6 text-center">اقرأ واستمع للقصص المشوقة وتعلّم كلمات جديدة!</p>
      
      <div class="space-y-6">
        @for (story of data.storiesData; track story.title) {
          <div class="bg-purple-50/80 border-2 border-purple-200 rounded-3xl p-6 shadow-sm">
            <div class="flex items-center gap-3 mb-4">
              <span class="text-4xl">{{ story.icon }}</span>
              <div>
                <h3 class="text-2xl font-black text-purple-900">{{ story.title }}</h3>
                <p class="text-base font-bold text-purple-600">{{ story.ar_title }}</p>
              </div>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
              @for (page of story.pages; track page.en) {
                <div (click)="audio.speak(page.en, 'en-US')" class="bg-white p-4 rounded-2xl border border-purple-100 shadow text-center hover:scale-105 transition-all cursor-pointer">
                  <div class="h-24 flex items-center justify-center mb-2">
                    <ng-container *ngTemplateOutlet="pic; context: { $implicit: page.img, cls: 'w-20 h-20 drop-shadow' }" />
                  </div>
                  <div class="font-black text-purple-800 text-sm mb-1">{{ page.en }}</div>
                  <div class="text-xs font-bold text-gray-500">{{ page.ar }}</div>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class StoriesComponent {
  data = inject(DataService);
  audio = inject(AudioService);
}
