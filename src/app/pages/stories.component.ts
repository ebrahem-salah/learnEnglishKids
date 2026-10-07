import { Component, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-stories',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #pic let-e let-img="img" let-cls="cls">
      @if (img) {
        <img [src]="'assets/images/' + img" alt="" loading="lazy" [class]="cls + ' object-contain drop-shadow-md'" />
      } @else if (!data.failed().has(e)) {
        <img [src]="data.imgUrl(e)" (error)="data.markFailed(e)" alt="" loading="lazy" [class]="cls" />
      } @else {
        <span class="text-6xl select-none">{{ e }}</span>
      }
    </ng-template>

    <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-purple-300 max-w-5xl mx-auto">
      <div class="text-center mb-8">
        <h2 class="text-3xl md:text-4xl font-black text-purple-700 mb-2 flex items-center justify-center gap-3">
          <span>📖</span>
          <span>Interactive Short Stories</span>
          <span>✨</span>
        </h2>
        <p class="text-gray-600 font-bold text-base md:text-lg">اقرأ واستمع للقصص المشوقة وتعلّم كلمات وجمل جديدة!</p>
      </div>
      
      <div class="space-y-8">
        @for (story of data.storiesData; track story.title) {
          <div class="bg-gradient-to-br from-purple-50 via-white to-pink-50 border-3 border-purple-200 rounded-3xl p-6 md:p-8 shadow-md">
            <div class="flex items-center justify-between flex-wrap gap-4 mb-6 pb-4 border-b border-purple-100">
              <div class="flex items-center gap-4">
                @if (story.imagePath) {
                  <img [src]="'assets/images/' + story.imagePath" class="w-16 h-16 object-contain drop-shadow" alt="" />
                } @else {
                  <span class="text-5xl">{{ story.icon }}</span>
                }
                <div>
                  <h3 class="text-2xl md:text-3xl font-black text-purple-900">{{ story.title }}</h3>
                  <p class="text-base font-bold text-purple-600">{{ story.ar_title }}</p>
                </div>
              </div>
              <button (click)="readStory(story)" class="bg-purple-600 hover:bg-purple-700 text-white font-black px-5 py-2.5 rounded-2xl shadow-md flex items-center gap-2 transition-all hover:scale-105">
                <span>🔊</span>
                <span>Read Story</span>
              </button>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              @for (page of story.pages; track page.en) {
                <div (click)="audio.speak(page.en, 'en-US')" class="bg-white p-5 rounded-2xl border-2 border-purple-100 shadow hover:shadow-lg hover:border-purple-300 text-center hover:scale-105 transition-all cursor-pointer group">
                  <div class="h-28 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <ng-container *ngTemplateOutlet="pic; context: { $implicit: page.img, img: page.imagePath, cls: 'w-24 h-24 max-h-24 max-w-24' }" />
                  </div>
                  <div class="font-black text-purple-900 text-base mb-1 leading-snug">{{ page.en }}</div>
                  <div class="text-xs font-bold text-gray-500">{{ page.ar }}</div>
                  <div class="mt-2 text-xs font-black text-purple-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    🔊 Click to listen
                  </div>
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

  readStory(story: any) {
    const fullText = story.pages.map((p: any) => p.en).join('. ');
    this.audio.speak(story.title + '. ' + fullText, 'en-US');
  }
}
