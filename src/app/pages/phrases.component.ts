import { Component, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

@Component({
  selector: 'app-phrases',
  standalone: true,
  template: `
    <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-teal-300 max-w-5xl mx-auto">
      <h2 class="text-3xl font-black text-teal-700 mb-2 text-center">💬 الجمل والمحادثات اليومية (Daily Expressions)</h2>
      <p class="text-gray-600 font-bold mb-6 text-center">تعلم كيف تتحدث وتتواصل باللغة الإنجليزية في المواقف المختلفة!</p>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (ph of data.phrasesData; track ph.en) {
          <div (click)="audio.speak(ph.en, 'en-US')" class="bg-teal-50/80 border-2 border-teal-200 rounded-3xl p-5 hover:bg-teal-100/70 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4 group">
            <span class="text-5xl group-hover:scale-110 transition-transform">{{ ph.icon }}</span>
            <div class="flex-1">
              <span class="text-xs font-black text-teal-600 bg-teal-200/80 px-3 py-0.5 rounded-full inline-block mb-1">{{ ph.context }}</span>
              <h3 class="text-2xl font-black text-teal-900 mb-1">{{ ph.en }}</h3>
              <p class="text-lg font-bold text-gray-600">{{ ph.ar }}</p>
            </div>
            <button class="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-xl hover:scale-110 shadow">🔊</button>
          </div>
        }
      </div>
    </div>
  `
})
export class PhrasesComponent {
  data = inject(DataService);
  audio = inject(AudioService);
}
