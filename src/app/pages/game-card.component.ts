import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-game-card',
  standalone: true,
  template: `
    <div class="absolute inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div class="bg-white p-8 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border-8 border-amber-400">
        <div class="text-8xl mb-2 animate-bounce">{{ icon() }}</div>
        <h2 class="text-3xl font-black text-amber-600 mb-2">{{ title() }}</h2>
        <p class="text-gray-600 mb-6 font-bold text-lg">{{ text() }}</p>
        <button (click)="play.emit()"
                class="w-full py-4 bg-amber-500 hover:bg-amber-600 text-white text-2xl font-black rounded-2xl shadow-[0_8px_0_#d97706] active:translate-y-2 active:shadow-none transition-all">
          {{ button() }}
        </button>
      </div>
    </div>
  `
})
export class GameCardComponent {
  icon = input('🎮');
  title = input('');
  text = input('');
  button = input('Start!');
  play = output<void>();
}
