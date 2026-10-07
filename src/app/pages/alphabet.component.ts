import { Component, signal, inject } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Router } from '@angular/router';
import { DataService } from '../services/data.service';
import { AudioService, AlphabetItem, WordItem } from '../services/audio.service';

@Component({
  selector: 'app-alphabet',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <ng-template #pic let-e let-hd="hd" let-img="img" let-cls="cls">
      @if (img) {
        <img [src]="'assets/images/' + img" alt="" loading="lazy" [class]="cls + ' object-contain drop-shadow-md'" />
      } @else if (hd && !data.failed().has(hd)) {
        <img [src]="hd" alt="" loading="lazy" [class]="cls + ' object-cover rounded-2xl shadow-sm'" (error)="data.markFailed(hd)" />
      } @else if (!data.failed().has(e)) {
        <img [src]="data.imgUrl(e)" (error)="data.markFailed(e)" alt="" loading="lazy" [class]="cls" />
      } @else {
        <span class="text-6xl select-none flex items-center justify-center">{{ e }}</span>
      }
    </ng-template>



    <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
      @for (item of data.alphabetData; track item.letter; let i = $index) {
        <div (click)="selectLetter(item)"
          class="bg-white rounded-3xl p-5 flex flex-col items-center cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all border-b-8 group relative overflow-hidden font-[Bubblegum]"
          [class]="data.learned().has(item.letter) ? 'border-green-400 bg-green-50/30' : 'border-blue-200 hover:border-blue-400'">
          
          @if (data.learned().has(item.letter)) {
            <span class="absolute top-2 right-3 text-green-500 font-black text-xl bg-green-100 rounded-full w-7 h-7 flex items-center justify-center border border-green-300">✓</span>
          }
          
          <div class="text-6xl font-black mb-1 transition-transform group-hover:scale-110 drop-shadow-sm" [class]="colors[i % colors.length]">
            {{ item.letter }}<span class="text-3xl text-gray-400 font-bold ml-1">{{ item.letter.toLowerCase() }}</span>
          </div>
          
          <div class="h-16 flex items-center justify-center my-1">
            <ng-container *ngTemplateOutlet="pic; context: { $implicit: item.words[0].img, hd: item.words[0].realImg, img: item.words[0].imagePath, cls: 'w-16 h-16 group-hover:scale-125 transition-transform drop-shadow' }" />
          </div>
          
          <div class="text-xs font-black text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full mt-2 border border-blue-200">
            {{ item.words.length }} Words 🌟
          </div>
        </div>
      }
    </div>

    <!-- Modal التفاصيل -->
    @if (selectedLetter(); as selected) {
      <div class="fixed inset-0 bg-black/70 flex items-start justify-center p-4 z-50 backdrop-blur-md overflow-y-auto" (click)="closeModal()">
        <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-5xl relative shadow-2xl my-4 md:my-8 border-4 border-blue-300" (click)="$event.stopPropagation()">
          <button (click)="closeModal()" class="absolute top-4 left-4 w-12 h-12 bg-red-100 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors text-2xl font-black shadow-md">✕</button>

          <div class="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl mb-8 border-2 border-blue-200 shadow-inner">
            <div class="flex items-center justify-center gap-6 md:gap-12">
              <button (click)="step(-1)" class="w-14 h-14 rounded-full bg-white shadow-lg text-3xl font-black hover:bg-blue-100 text-blue-600 hover:scale-110 transition-all border border-blue-200">‹</button>
              <div>
                <div class="text-7xl md:text-9xl font-black text-blue-600 tracking-tight drop-shadow font-[Bubblegum]">
                  {{ selected.letter }}<span class="text-5xl md:text-7xl text-pink-500">{{ selected.letter.toLowerCase() }}</span>
                </div>
                <div class="text-xl font-bold text-gray-500 mt-2">Letter Sound: <span class="text-purple-600 font-extrabold uppercase">{{ selected.letter }}</span></div>
              </div>
              <button (click)="step(1)" class="w-14 h-14 rounded-full bg-white shadow-lg text-3xl font-black hover:bg-blue-100 text-blue-600 hover:scale-110 transition-all border border-blue-200">›</button>
            </div>
            <div class="mt-4 flex justify-center gap-3 flex-wrap font-[Bubblegum]">
              <button (click)="playLetter(selected)"
                class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3.5 rounded-full text-xl font-black hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition-all shadow-lg border-2 border-white">
                🔊 Listen & Phonics
              </button>
              <button (click)="writeWord(selected.letter)"
                class="bg-gradient-to-r from-amber-500 to-orange-600 text-white px-8 py-3.5 rounded-full text-xl font-black hover:from-amber-600 hover:to-orange-700 hover:scale-105 transition-all shadow-lg border-2 border-white">
                ✏️ Practice Letter
              </button>
            </div>
          </div>

          <div class="mb-4 text-2xl font-black text-gray-800 border-b-4 border-blue-100 pb-2 flex items-center justify-between font-[Bubblegum]">
            <span>📖 Words starting with {{ selected.letter }}:</span>
            <span class="text-sm font-bold text-gray-500">Tap to listen & spell!</span>
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            @for (w of selected.words; track w.word) {
              <div class="bg-gradient-to-b from-green-50 to-emerald-50 rounded-3xl p-5 text-center border-2 border-green-200 hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col">
                <div class="h-28 flex items-center justify-center mb-3 bg-white/70 rounded-2xl border border-green-100 shadow-inner overflow-hidden">
                  <ng-container *ngTemplateOutlet="pic; context: { $implicit: w.img, hd: w.realImg, img: w.imagePath, cls: 'w-24 h-24 drop-shadow-md hover:scale-110 transition-transform' }" />
                </div>
                <div class="text-3xl font-black text-green-700 mb-1 tracking-wide font-[Bubblegum]">{{ w.word }}</div>
                <div class="text-xl font-extrabold text-gray-600 mb-4">{{ w.ar_word }}</div>
                <div class="flex flex-col gap-2 mt-auto font-[Bubblegum]">
                  <div class="flex gap-2">
                    <button (click)="playWord(w)" class="flex-1 bg-green-500 text-white py-2.5 rounded-2xl font-black hover:bg-green-600 transition-all shadow border border-green-600 text-base">
                      🔊 Listen
                    </button>
                    <button (click)="spellWord(w)" class="bg-white border-2 border-green-500 text-green-700 px-4 py-2.5 rounded-2xl font-black hover:bg-green-100 transition-all text-base shadow-sm">
                      🔤 Spell
                    </button>
                  </div>
                  <button (click)="writeWord(w.word)" class="w-full bg-amber-500 text-white py-2.5 rounded-2xl font-black hover:bg-amber-600 transition-all shadow border border-amber-600 text-base">
                    ✏️ Practice Writing
                  </button>
                  <button (click)="testPronunciation(w.word)" [disabled]="audio.isListening()" class="w-full bg-red-500 text-white py-2.5 rounded-2xl font-black hover:bg-red-600 transition-all shadow text-base disabled:opacity-50">
                    @if (audio.isListening()) {
                      <span class="animate-pulse">🔴 Listening...</span>
                    } @else {
                      <span>🎙️ Test Pronunciation</span>
                    }
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `
})
export class AlphabetComponent {
  data = inject(DataService);
  audio = inject(AudioService);
  router = inject(Router);

  selectedLetter = signal<AlphabetItem | null>(null);
  readonly colors = ['text-rose-500', 'text-amber-500', 'text-emerald-500', 'text-sky-500', 'text-violet-500', 'text-pink-500'];

  selectLetter(item: AlphabetItem) {
    this.selectedLetter.set(item);
    this.data.learned.update(s => new Set(s).add(item.letter));
    this.data.save();
  }

  closeModal() {
    this.selectedLetter.set(null);
  }

  step(dir: number) {
    const cur = this.selectedLetter(); if (!cur) return;
    const n = this.data.alphabetData.length;
    const i = (this.data.alphabetData.indexOf(cur) + dir + n) % n;
    this.selectLetter(this.data.alphabetData[i]);
  }

  playLetter(item: AlphabetItem) {
    this.audio.sequence('L' + item.letter, [
      [item.letter, 'en-US'],
      [item.letter + ' for ' + item.words[0].word, 'en-US'],
      [item.ar_letter, 'ar-EG']
    ]);
  }

  playWord(w: WordItem) {
    this.audio.sequence('W' + w.word, [[w.word, 'en-US'], [w.ar_word, 'ar-EG']]);
  }

  spellWord(w: WordItem) {
    const letters = w.word.replace(/[^a-z]/gi, '').toUpperCase().split('').join('. ');
    this.audio.sequence('W' + w.word, [[w.word, 'en-US'], [letters, 'en-US'], [w.word, 'en-US']]);
  }

  async testPronunciation(word: string) {
    const correct = await this.audio.listenForWord(word);
    if (correct) {
      this.audio.playSoundEffect('bell');
      this.data.stars.update(s => s + 1);
      this.data.save();
      alert('نطق ممتاز! أحسنت يا بطل! ⭐ كسبت نجمة');
    } else {
      alert('نطق غير صحيح، حاول مرة أخرى!');
    }
  }

  writeWord(word: string) {
    this.data.tracingText.set(word);
    this.closeModal();
    this.router.navigate(['/tracing']);
  }
}
