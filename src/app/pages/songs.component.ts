import { Component, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-songs',
  standalone: true,
  template: `
    <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-rose-200 max-w-4xl mx-auto">
      <h2 class="text-3xl font-black text-rose-600 mb-2 text-center">🎵 الأغاني والأناشيد التعليمية للأطفال</h2>
      <p class="text-gray-600 font-bold mb-6 text-center">اضغط على أي أغنية للاستماع إلى كلماتها ونطقها!</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        @for (song of data.songsData; track song.title) {
          <div class="bg-rose-50/70 border-2 border-rose-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all">
            <div>
              <div class="flex items-center gap-3 mb-3">
                <span class="text-4xl">{{ song.icon }}</span>
                <div>
                  <h3 class="text-xl font-black text-rose-800">{{ song.title }}</h3>
                  <p class="text-sm font-bold text-gray-600">{{ song.ar_title }}</p>
                </div>
              </div>
              <div class="bg-white p-4 rounded-2xl border border-rose-100 text-gray-700 font-bold text-sm leading-relaxed whitespace-pre-line mb-4 shadow-inner">
                {{ song.lyrics }}
              </div>
            </div>
            <button (click)="audio.speak(song.audioText, 'en-US')" class="bg-rose-500 text-white py-3 rounded-full font-black hover:bg-rose-600 shadow transition-all">
              ▶️ تشغيل وتغني بالأغنية
            </button>
          </div>
        }
      </div>
    </div>
  `
})
export class SongsComponent {
  data = inject(DataService);
  audio = inject(AudioService);
}
