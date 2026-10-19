import { Component, inject, OnDestroy } from '@angular/core';
import { Timers } from './game-utils';
import { NgTemplateOutlet } from '@angular/common';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #pic let-e let-hd="hd" let-img="img" let-cls="cls">
      @if (img && !data.failed().has('img:' + img)) {
        <img [src]="'assets/images/' + img" alt="" loading="lazy" [class]="cls + ' object-contain drop-shadow-md'" (error)="data.markFailed('img:' + img)" />
      } @else if (hd && !data.failed().has(hd)) {
        <img [src]="hd" alt="" loading="lazy" [class]="cls + ' object-cover rounded-2xl shadow-sm'" (error)="data.markFailed(hd)" />
      } @else if (!data.failed().has(e)) {
        <img [src]="data.imgUrl(e)" (error)="data.markFailed(e)" alt="" loading="lazy" [class]="cls" />
      } @else {
        <span class="text-6xl select-none flex items-center justify-center">{{ e }}</span>
      }
    </ng-template>

    <div class="space-y-8 font-[Fredoka]">
      @for (cat of data.extraCategories; track cat.id) {
        <div class="bg-white rounded-3xl p-6 shadow-xl border-4 border-indigo-100">
          <h3 class="text-3xl font-black text-indigo-700 mb-4 flex items-center gap-2">
            <span>{{ cat.icon }}</span> {{ cat.title }}
          </h3>
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            @for (item of cat.items; track item.en) {
              <div class="bg-indigo-50/60 rounded-2xl p-4 text-center border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md transition-all group relative">
                <div class="h-24 flex items-center justify-center mb-2 overflow-hidden rounded-xl cursor-pointer" (click)="playCategoryItem(item)">
                  <ng-container *ngTemplateOutlet="pic; context: { $implicit: item.img, hd: item.realImg, img: imgFor(item), cls: 'w-20 h-20 group-hover:scale-115 transition-transform drop-shadow' }" />
                </div>
                <div class="text-xl font-black text-indigo-900 cursor-pointer" (click)="playCategoryItem(item)">{{ item.en }}</div>
                <div class="text-sm font-bold text-gray-600 mb-2 font-sans">{{ item.ar }}</div>
                
                <div class="flex flex-col gap-1.5 mt-2">
                  <div class="flex items-center gap-1.5">
                    <button (click)="audio.speak(item.en, 'en-US'); $event.stopPropagation()"
                            class="flex-1 bg-sky-500 hover:bg-sky-600 text-white font-black py-1.5 px-1.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                            title="نطق بالإنجليزية">
                      <span>🔊</span>
                      <span>English</span>
                    </button>
                    <button (click)="audio.speakArabic(item.en, item.ar); $event.stopPropagation()"
                            class="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-black py-1.5 px-1.5 rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                            title="نطق بالعربية">
                      <span>🔊</span>
                      <span>عربي</span>
                    </button>
                  </div>

                  <button (click)="testPronunciation(item.en, $event)" [disabled]="audio.isListening()"
                          class="w-full bg-rose-500 hover:bg-rose-600 text-white rounded-xl py-1.5 px-2 text-xs font-black shadow flex items-center justify-center gap-1 transition-transform active:scale-95 disabled:opacity-50 cursor-pointer">
                    @if (audio.isListening()) {
                      <span class="animate-pulse">🔴 Listening...</span>
                    } @else {
                      <span>🎙️ Test Voice</span>
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class CategoriesComponent implements OnDestroy {
  private timers = new Timers();
  ngOnDestroy() { this.timers.clearAll(); }

  data = inject(DataService);
  audio = inject(AudioService);

  /** Your own picture: drop public/assets/images/<english-word>.webp (e.g. mother.webp, police_officer.webp).
   *  If the file is missing, the emoji is shown instead. */
  imgFor(item: { en: string; imagePath?: string }) {
    return item.imagePath ?? item.en.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') + '.webp';
  }

  playCategoryItem(item: { en: string; ar: string }) {
    this.audio.speak(item.en, 'en-US');
  }

  async testPronunciation(word: string, event: Event) {
    event.stopPropagation();
    const correct = await this.audio.listenForWord(word);
    if (correct) {
      this.audio.playSoundEffect('bell');
      this.data.stars.update(s => s + 1);
      this.data.save();
      alert('نطق ممتاز! أحسنت! ⭐ كسبت نجمة');
    } else {
      alert('نطق غير صحيح، حاول مرة أخرى! استمع للكلمة جيداً.');
    }
  }
}
