import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { NgTemplateOutlet, NgClass } from '@angular/common';

interface DragItem { word: string; img: string; }
interface DropZone { letter: string; matchWord: string; currentItem: DragItem | null; }

interface MemoryCard { id: number; letter: string; word: string; img: string; type: 'letter' | 'img'; isFlipped: boolean; isMatched: boolean; }

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [NgTemplateOutlet, NgClass],
  template: `
    <div class="bg-white rounded-3xl p-6 shadow-xl border-4 border-orange-300 max-w-5xl mx-auto">
      <h2 class="text-4xl font-black text-orange-600 mb-6 text-center">🎮 ألعاب الذكاء والمرح</h2>
      
      <div class="flex justify-center gap-4 mb-8">
        <button (click)="setMode('match')" [class]="mode() === 'match' ? 'bg-orange-500 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-700'" class="px-6 py-2 rounded-full font-black text-xl transition-all border-2 border-orange-200">
          🧩 لعبة المطابقة
        </button>
        <button (click)="setMode('memory')" [class]="mode() === 'memory' ? 'bg-purple-500 text-white scale-110 shadow-lg' : 'bg-gray-100 text-gray-700'" class="px-6 py-2 rounded-full font-black text-xl transition-all border-2 border-purple-200">
          🃏 لعبة الذاكرة
        </button>
      </div>

      @if (mode() === 'match') {
        <p class="text-gray-600 font-bold mb-6 text-center">اسحب الصورة إلى الحرف المناسب!</p>

        @if (gameWon()) {
          <div class="text-center py-10 bg-green-50 rounded-3xl border-4 border-green-300 mb-6">
            <div class="text-8xl mb-4 animate-bounce">🏆</div>
            <h3 class="text-4xl font-black text-green-700 mb-2">أنت بطل عبقري!</h3>
            <p class="text-xl text-green-600 font-bold mb-6">لقد نجحت وكسبت +10 نجوم! ⭐</p>
            <button (click)="initMatchGame()" class="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-2xl hover:bg-orange-600 shadow-xl hover:scale-105 transition-transform">
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
            <div class="flex flex-wrap justify-center gap-4">
              @for (item of dragItems(); track item.word; let i = $index) {
                <div class="bg-white p-4 rounded-2xl shadow-sm border-2 border-blue-300 cursor-grab hover:shadow-md hover:-translate-y-1 transition-transform flex flex-col items-center"
                     draggable="true"
                     (dragstart)="dragStart($event, i)">
                  <span class="text-5xl mb-2">{{ item.img }}</span>
                  <span class="text-base font-black text-blue-900">{{ item.word }}</span>
                </div>
              }
            </div>
          </div>
        }
      } @else {
        <p class="text-gray-600 font-bold mb-6 text-center">طابق كل حرف مع الصورة المناسبة له!</p>
        
        @if (memoryWon()) {
          <div class="text-center py-10 bg-purple-50 rounded-3xl border-4 border-purple-300 mb-6">
            <div class="text-8xl mb-4 animate-bounce">🥇</div>
            <h3 class="text-4xl font-black text-purple-700 mb-2">ذاكرتك حديدية!</h3>
            <p class="text-xl text-purple-600 font-bold mb-6">لقد طابقت جميع البطاقات وكسبت +15 نجمة! ⭐</p>
            <button (click)="initMemoryGame()" class="bg-purple-500 text-white px-8 py-3 rounded-full font-black text-2xl hover:bg-purple-600 shadow-xl hover:scale-105 transition-transform">
              العب مرة أخرى 🔄
            </button>
          </div>
        } @else {
          <div class="grid grid-cols-3 md:grid-cols-4 gap-4">
            @for (card of memoryCards(); track card.id; let i = $index) {
              <div class="relative w-full h-32 md:h-40 cursor-pointer" style="perspective: 1000px;" (click)="flipCard(i)">
                <div class="w-full h-full transition-transform duration-500" 
                     [style.transform]="card.isFlipped || card.isMatched ? 'rotateY(180deg)' : ''" 
                     style="transform-style: preserve-3d;">
                  
                  <!-- Front (Hidden) -->
                  <div class="absolute inset-0 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-2xl border-4 border-purple-300 shadow-md flex items-center justify-center backface-hidden" style="backface-visibility: hidden;">
                    <span class="text-4xl text-white/50">❓</span>
                  </div>
                  
                  <!-- Back (Revealed) -->
                  <div class="absolute inset-0 bg-white rounded-2xl border-4 shadow-md flex items-center justify-center backface-hidden"
                       [class.border-green-400]="card.isMatched"
                       [class.border-purple-300]="!card.isMatched"
                       style="transform: rotateY(180deg); backface-visibility: hidden;">
                    @if (card.type === 'letter') {
                      <div class="text-6xl md:text-7xl font-black text-purple-600">{{ card.letter }}</div>
                    } @else {
                      <div class="text-6xl md:text-7xl">{{ card.img }}</div>
                    }
                  </div>
                </div>
              </div>
            }
          </div>
        }
      }
    </div>
  `
})
export class GamesComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  mode = signal<'match' | 'memory'>('match');

  // Match Game State
  dropZones = signal<DropZone[]>([]);
  dragItems = signal<DragItem[]>([]);
  gameWon = signal(false);
  dragHoverIndex = -1;
  private draggedItemIndex = -1;

  // Memory Game State
  memoryCards = signal<MemoryCard[]>([]);
  memoryWon = signal(false);
  flippedIndices: number[] = [];
  isProcessingFlip = false;

  constructor() {
    this.initMatchGame();
  }

  setMode(m: 'match' | 'memory') {
    this.mode.set(m);
    if (m === 'match') this.initMatchGame();
    else this.initMemoryGame();
  }

  // --- MATCH GAME LOGIC ---
  initMatchGame() {
    this.gameWon.set(false);
    this.dragHoverIndex = -1;
    this.draggedItemIndex = -1;
    
    const all = [...this.data.alphabetData].sort(() => 0.5 - Math.random()).slice(0, 3);
    const zones: DropZone[] = all.map(a => ({ letter: a.letter, matchWord: a.words[0].word, currentItem: null }));
    const items: DragItem[] = all.map(a => ({ word: a.words[0].word, img: a.words[0].img })).sort(() => 0.5 - Math.random());
    
    this.dropZones.set(zones);
    this.dragItems.set(items);
  }

  dragStart(event: DragEvent, index: number) {
    this.draggedItemIndex = index;
    if (event.dataTransfer) event.dataTransfer.setData('text/plain', index.toString());
  }

  allowDrop(event: DragEvent, index: number) {
    event.preventDefault();
    const zone = this.dropZones()[index];
    if (!zone.currentItem) this.dragHoverIndex = index;
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
    
    if (item.word === zone.matchWord) {
      this.audio.playSoundEffect('bell');
      this.dropZones.update(z => { z[zoneIndex].currentItem = item; return [...z]; });
      this.dragItems.update(items => items.filter((_, i) => i !== this.draggedItemIndex));
      
      if (this.dragItems().length === 0) {
        setTimeout(() => {
          this.audio.speak('أحسنت! أنت بطل!', 'ar-EG');
          this.gameWon.set(true);
          this.data.addStars(10);
        }, 500);
      }
    } else {
      this.audio.speak('حاول مرة أخرى', 'ar-EG');
    }
    
    this.draggedItemIndex = -1;
  }

  // --- MEMORY GAME LOGIC ---
  initMemoryGame() {
    this.memoryWon.set(false);
    this.flippedIndices = [];
    this.isProcessingFlip = false;
    
    // Pick 6 random letters for 12 cards
    const all = [...this.data.alphabetData].sort(() => 0.5 - Math.random()).slice(0, 6);
    let cards: MemoryCard[] = [];
    let idCounter = 0;
    
    all.forEach(a => {
      cards.push({ id: idCounter++, letter: a.letter, word: a.words[0].word, img: a.words[0].img, type: 'letter', isFlipped: false, isMatched: false });
      cards.push({ id: idCounter++, letter: a.letter, word: a.words[0].word, img: a.words[0].img, type: 'img', isFlipped: false, isMatched: false });
    });
    
    cards = cards.sort(() => 0.5 - Math.random());
    this.memoryCards.set(cards);
  }

  flipCard(index: number) {
    if (this.isProcessingFlip) return;
    
    const cards = this.memoryCards();
    if (cards[index].isFlipped || cards[index].isMatched) return;
    
    // Play small pop sound
    this.audio.speak(cards[index].type === 'letter' ? cards[index].letter : cards[index].word, 'en-US');

    this.memoryCards.update(c => { c[index].isFlipped = true; return [...c]; });
    this.flippedIndices.push(index);

    if (this.flippedIndices.length === 2) {
      this.isProcessingFlip = true;
      const idx1 = this.flippedIndices[0];
      const idx2 = this.flippedIndices[1];
      const c1 = cards[idx1];
      const c2 = cards[idx2];

      if (c1.letter === c2.letter) {
        // Match!
        setTimeout(() => {
          this.audio.playSoundEffect('bell');
          this.memoryCards.update(c => {
            c[idx1].isMatched = true;
            c[idx2].isMatched = true;
            return [...c];
          });
          this.flippedIndices = [];
          this.isProcessingFlip = false;
          
          if (this.memoryCards().every(c => c.isMatched)) {
            setTimeout(() => {
              this.audio.speak('أحسنت! ذاكرتك رائعة!', 'ar-EG');
              this.memoryWon.set(true);
              this.data.addStars(15);
            }, 500);
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          this.memoryCards.update(c => {
            c[idx1].isFlipped = false;
            c[idx2].isFlipped = false;
            return [...c];
          });
          this.flippedIndices = [];
          this.isProcessingFlip = false;
        }, 1200);
      }
    }
  }
}
