import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { NgTemplateOutlet } from '@angular/common';

interface DragItem { word: string; img: string; }
interface DropZone { letter: string; matchWord: string; currentItem: DragItem | null; }

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="bg-white rounded-3xl p-6 shadow-xl border-4 border-orange-300 max-w-5xl mx-auto">
      <h2 class="text-4xl font-black text-orange-600 mb-2 text-center">🎮 ألعاب الذكاء والمرح</h2>
      <p class="text-gray-600 font-bold mb-6 text-center">لعبة المطابقة: اسحب الصورة إلى الحرف المناسب!</p>

      @if (gameWon()) {
        <div class="text-center py-10 bg-green-50 rounded-3xl border-4 border-green-300 mb-6">
          <div class="text-8xl mb-4 animate-bounce">🏆</div>
          <h3 class="text-4xl font-black text-green-700 mb-2">أنت بطل عبقري!</h3>
          <p class="text-xl text-green-600 font-bold mb-6">لقد نجحت في مطابقة جميع الكلمات وكسبت +10 نجوم! ⭐</p>
          <button (click)="initGame()" class="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-2xl hover:bg-orange-600 shadow-xl hover:scale-105 transition-transform">
            العب مرة أخرى 🔄
          </button>
        </div>
      } @else {
        <!-- مناطق الإفلات (الحروف) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          @for (zone of dropZones(); track zone.letter; let i = $index) {
            <div class="bg-orange-50 rounded-3xl p-6 border-4 border-dashed transition-all flex flex-col items-center min-h-[160px]"
                 [class]="dragHoverIndex === i ? 'border-orange-500 bg-orange-100 scale-105' : 'border-orange-300'"
                 (dragover)="allowDrop($event, i)"
                 (dragleave)="dragLeave($event)"
                 (drop)="drop($event, i)">
              
              <div class="text-6xl font-black text-orange-400 mb-2">{{ zone.letter }}</div>
              
              @if (zone.currentItem) {
                <div class="bg-white p-3 rounded-2xl shadow-md border-2 border-green-400 animate-bounce">
                  <span class="text-5xl">{{ zone.currentItem.img }}</span>
                  <div class="text-lg font-black text-green-700 mt-1 text-center">{{ zone.currentItem.word }}</div>
                </div>
              } @else {
                <div class="text-gray-400 font-bold mt-4">أسقط الصورة هنا 👇</div>
              }
            </div>
          }
        </div>

        <!-- العناصر القابلة للسحب (الصور) -->
        <div class="bg-blue-50 rounded-3xl p-6 border-2 border-blue-200">
          <h3 class="text-xl font-black text-blue-800 mb-4 text-center">الصور (اسحبها للأعلى):</h3>
          <div class="flex flex-wrap justify-center gap-4">
            @for (item of dragItems(); track item.word; let i = $index) {
              <div class="bg-white p-4 rounded-2xl shadow-sm border-2 border-blue-300 cursor-grab hover:shadow-md hover:-translate-y-1 transition-transform flex flex-col items-center"
                   draggable="true"
                   (dragstart)="dragStart($event, i)">
                <span class="text-5xl mb-2">{{ item.img }}</span>
                <span class="text-base font-black text-blue-900">{{ item.word }}</span>
              </div>
            }
            @if (dragItems().length === 0) {
              <div class="text-gray-500 font-bold">لا يوجد صور أخرى...</div>
            }
          </div>
        </div>
      }
    </div>
  `
})
export class GamesComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  dropZones = signal<DropZone[]>([]);
  dragItems = signal<DragItem[]>([]);
  gameWon = signal(false);
  dragHoverIndex = -1;
  private draggedItemIndex = -1;

  constructor() {
    this.initGame();
  }

  initGame() {
    this.gameWon.set(false);
    this.dragHoverIndex = -1;
    this.draggedItemIndex = -1;
    
    // Pick 3 random letters
    const all = [...this.data.alphabetData].sort(() => 0.5 - Math.random()).slice(0, 3);
    const zones: DropZone[] = all.map(a => ({ letter: a.letter, matchWord: a.words[0].word, currentItem: null }));
    const items: DragItem[] = all.map(a => ({ word: a.words[0].word, img: a.words[0].img })).sort(() => 0.5 - Math.random());
    
    this.dropZones.set(zones);
    this.dragItems.set(items);
  }

  dragStart(event: DragEvent, index: number) {
    this.draggedItemIndex = index;
    if (event.dataTransfer) {
      event.dataTransfer.setData('text/plain', index.toString());
      event.dataTransfer.effectAllowed = 'move';
    }
  }

  allowDrop(event: DragEvent, index: number) {
    event.preventDefault();
    const zone = this.dropZones()[index];
    if (!zone.currentItem) {
      this.dragHoverIndex = index;
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    }
  }

  dragLeave(event: DragEvent) {
    this.dragHoverIndex = -1;
  }

  drop(event: DragEvent, zoneIndex: number) {
    event.preventDefault();
    this.dragHoverIndex = -1;
    
    const zone = this.dropZones()[zoneIndex];
    if (zone.currentItem || this.draggedItemIndex === -1) return;

    const item = this.dragItems()[this.draggedItemIndex];
    
    // Check match
    if (item.word === zone.matchWord) {
      // Success!
      this.audio.playSoundEffect('bell');
      this.dropZones.update(z => { z[zoneIndex].currentItem = item; return [...z]; });
      this.dragItems.update(items => items.filter((_, i) => i !== this.draggedItemIndex));
      
      if (this.dragItems().length === 0) {
        setTimeout(() => {
          this.audio.speak('أحسنت! أنت بطل!', 'ar-EG');
          this.gameWon.set(true);
          this.data.stars.update(s => s + 10);
          this.data.save();
        }, 500);
      }
    } else {
      // Fail!
      this.audio.speak('حاول مرة أخرى', 'ar-EG');
    }
    
    this.draggedItemIndex = -1;
  }
}
