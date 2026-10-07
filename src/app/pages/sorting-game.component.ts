import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

type CategoryType = 'fruit' | 'animal' | 'vehicle';

interface SortItem {
  id: number;
  name: string;
  category: CategoryType;
  image: string;
}

@Component({
  selector: 'app-sorting-game',
  standalone: true,
  template: `
    <div class="relative w-full min-h-[580px] bg-gradient-to-b from-emerald-50 via-teal-50 to-green-100 rounded-3xl p-6 flex flex-col justify-between select-none border-4 border-emerald-300 font-[Bubblegum]" dir="ltr">
      <!-- Top Header -->
      <div class="flex justify-between items-center bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-sm border-2 border-emerald-200">
        <div class="text-xl md:text-2xl font-black text-emerald-800 flex items-center gap-2">
          <span>🧺</span> Category Sorter
        </div>
        <div class="flex items-center gap-3">
          <div class="bg-emerald-100 text-emerald-900 px-4 py-1.5 rounded-full font-black text-lg border border-emerald-300">
            Score: {{ score() }} ⭐
          </div>
        </div>
      </div>

      @if (gameState() === 'start') {
        <div class="flex flex-col items-center justify-center text-center my-auto p-6">
          <div class="w-36 h-36 bg-emerald-200 rounded-3xl flex items-center justify-center shadow-lg border-4 border-emerald-400 mb-4 animate-bounce">
            <img src="assets/images/apple.png" class="w-24 h-24 object-contain" alt="Sort" />
          </div>
          <h2 class="text-4xl md:text-5xl font-black text-emerald-900 mb-2">Category Sorter 🍎🚗🦁</h2>
          <p class="text-emerald-800 text-lg md:text-xl font-bold max-w-md mb-6">
            Help sort the items! Tap the correct basket (Fruits, Animals, Vehicles) for each item.
          </p>
          <button (click)="startGame()" class="px-10 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white text-2xl font-black rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            Start Sorting! 🚀
          </button>
        </div>
      } @else if (gameState() === 'playing') {
        <div class="flex flex-col items-center justify-center my-auto w-full max-w-3xl mx-auto">
          <!-- Active Item to Sort -->
          @if (currentItem()) {
            <div class="bg-white rounded-3xl p-6 shadow-2xl border-4 border-emerald-300 flex flex-col items-center mb-8 animate-pulse hover:scale-105 transition-all cursor-pointer"
                 (click)="audio.speak(currentItem()!.name, 'en-US')">
              <div class="text-xs uppercase font-black text-emerald-600 tracking-wider mb-1">What is this?</div>
              <img [src]="'assets/images/' + currentItem()!.image" class="w-36 h-36 object-contain drop-shadow-md mb-2" [alt]="currentItem()!.name" />
              <div class="text-3xl font-black text-emerald-950">{{ currentItem()!.name }}</div>
              <div class="text-xs text-gray-400 font-bold mt-1">🔊 Tap to hear name</div>
            </div>
          }

          <!-- Three Target Baskets -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
            <!-- Fruits Basket -->
            <button (click)="sortTo('fruit')"
                    class="group bg-gradient-to-b from-rose-50 to-rose-100 hover:from-rose-100 hover:to-rose-200 border-4 border-rose-300 hover:border-rose-500 rounded-3xl p-5 flex flex-col items-center shadow-lg hover:scale-105 active:scale-95 transition-all">
              <div class="w-16 h-16 bg-rose-200 rounded-2xl flex items-center justify-center text-4xl mb-2 group-hover:rotate-12 transition-transform">
                🍎
              </div>
              <div class="text-2xl font-black text-rose-800">Fruits</div>
              <div class="text-xs font-bold text-rose-500">فواكه لذيذة</div>
            </button>

            <!-- Animals Basket -->
            <button (click)="sortTo('animal')"
                    class="group bg-gradient-to-b from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 border-4 border-amber-300 hover:border-amber-500 rounded-3xl p-5 flex flex-col items-center shadow-lg hover:scale-105 active:scale-95 transition-all">
              <div class="w-16 h-16 bg-amber-200 rounded-2xl flex items-center justify-center text-4xl mb-2 group-hover:rotate-12 transition-transform">
                🦁
              </div>
              <div class="text-2xl font-black text-amber-800">Animals</div>
              <div class="text-xs font-bold text-amber-500">حيوانات لطيفة</div>
            </button>

            <!-- Vehicles Basket -->
            <button (click)="sortTo('vehicle')"
                    class="group bg-gradient-to-b from-sky-50 to-sky-100 hover:from-sky-100 hover:to-sky-200 border-4 border-sky-300 hover:border-sky-500 rounded-3xl p-5 flex flex-col items-center shadow-lg hover:scale-105 active:scale-95 transition-all">
              <div class="w-16 h-16 bg-sky-200 rounded-2xl flex items-center justify-center text-4xl mb-2 group-hover:rotate-12 transition-transform">
                🚗
              </div>
              <div class="text-2xl font-black text-sky-800">Vehicles</div>
              <div class="text-xs font-bold text-sky-500">وسائل النقل</div>
            </button>
          </div>
        </div>
      } @else if (gameState() === 'won') {
        <div class="flex flex-col items-center justify-center text-center my-auto p-6">
          <div class="text-8xl mb-4 animate-bounce">🏆</div>
          <h2 class="text-4xl font-black text-green-700 mb-2">Sorting Superstar! 🌟</h2>
          <p class="text-xl text-gray-700 font-bold mb-6">You put every single item into its proper basket!</p>
          <button (click)="startGame()" class="px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-xl font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
            Play Again 🔄
          </button>
        </div>
      }

      <!-- Bottom Hint Bar -->
      @if (gameState() === 'playing') {
        <div class="text-center text-emerald-800 text-sm md:text-base font-bold pt-2 border-t border-emerald-200">
          Remaining items to sort: {{ remainingCount() }}
        </div>
      }
    </div>
  `
})
export class SortingGameComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  gameState = signal<'start' | 'playing' | 'won'>('start');
  score = signal(0);
  remainingCount = signal(0);

  allItems: SortItem[] = [
    // Fruits
    { id: 1, name: 'Apple', category: 'fruit', image: 'apple.png' },
    { id: 2, name: 'Banana', category: 'fruit', image: 'banana.png' },
    { id: 3, name: 'Orange', category: 'fruit', image: 'orange.png' },
    { id: 4, name: 'Grape', category: 'fruit', image: 'grape.png' },
    { id: 5, name: 'Strawberry', category: 'fruit', image: 'strawberry.png' },
    { id: 6, name: 'Watermelon', category: 'fruit', image: 'watermelon.png' },

    // Animals
    { id: 7, name: 'Lion', category: 'animal', image: 'lion.png' },
    { id: 8, name: 'Cat', category: 'animal', image: 'cat.png' },
    { id: 9, name: 'Dog', category: 'animal', image: 'dog.png' },
    { id: 10, name: 'Duck', category: 'animal', image: 'duck.png' },
    { id: 11, name: 'Rabbit', category: 'animal', image: 'rabbit.png' },
    { id: 12, name: 'Elephant', category: 'animal', image: 'elephant.png' },

    // Vehicles
    { id: 13, name: 'Car', category: 'vehicle', image: 'car.png' },
    { id: 14, name: 'Bus', category: 'vehicle', image: 'bus.png' },
    { id: 15, name: 'Airplane', category: 'vehicle', image: 'airplane.png' },
    { id: 16, name: 'Rocket', category: 'vehicle', image: 'rocket.png' },
    { id: 17, name: 'Boat', category: 'vehicle', image: 'boat.png' },
    { id: 18, name: 'Train', category: 'vehicle', image: 'train.png' }
  ];

  queue: SortItem[] = [];
  currentItem = signal<SortItem | null>(null);

  startGame() {
    this.score.set(0);
    this.queue = [...this.allItems].sort(() => Math.random() - 0.5);
    this.remainingCount.set(this.queue.length);
    this.nextItem();
    this.gameState.set('playing');
  }

  nextItem() {
    if (this.queue.length === 0) {
      this.currentItem.set(null);
      this.gameState.set('won');
      this.data.stars.update(s => s + 15);
      this.data.save();
      this.audio.playCelebration();
      return;
    }
    const item = this.queue.pop()!;
    this.currentItem.set(item);
    this.remainingCount.set(this.queue.length + 1);
    this.audio.speak(item.name, 'en-US');
  }

  sortTo(target: CategoryType) {
    const cur = this.currentItem();
    if (!cur) return;

    if (cur.category === target) {
      this.audio.playSoundEffect('ding');
      this.audio.speak('Good job! ' + cur.name, 'en-US');
      this.score.update(s => s + 5);
      setTimeout(() => this.nextItem(), 600);
    } else {
      this.audio.playSoundEffect('buzz');
      this.audio.speak('Oops! Try another basket', 'en-US');
    }
  }
}
