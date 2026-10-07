import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { BalloonGameComponent } from './balloon-game.component';
import { TrainGameComponent } from './train-game.component';
import { ShapeGameComponent } from './shape-game.component';
import { AppleGameComponent } from './apple-game.component';
import { MathGameComponent } from './math-game.component';
import { PuzzleGameComponent } from './puzzle-game.component';
import { SpellingGameComponent } from './spelling-game.component';
import { SortingGameComponent } from './sorting-game.component';
import { AnimalSoundGameComponent } from './animal-sound-game.component';
import { PatternMemoryGameComponent } from './pattern-memory-game.component';

interface DragItem { word: string; img: string; imagePath?: string; }
interface DropZone { letter: string; matchWord: string; currentItem: DragItem | null; }

interface MemoryCard { id: number; letter: string; word: string; img: string; imagePath?: string; type: 'letter' | 'img'; isFlipped: boolean; isMatched: boolean; }

@Component({
  selector: 'app-games',
  standalone: true,
  imports: [
    BalloonGameComponent,
    TrainGameComponent,
    ShapeGameComponent,
    AppleGameComponent,
    MathGameComponent,
    PuzzleGameComponent,
    SpellingGameComponent,
    SortingGameComponent,
    AnimalSoundGameComponent,
    PatternMemoryGameComponent
  ],
  template: `
    @if (mode() === 'menu') {
      <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-orange-300 max-w-6xl mx-auto font-[Bubblegum]">
        <div class="text-center mb-8">
          <div class="text-6xl mb-2 animate-bounce">🎮</div>
          <h2 class="text-4xl md:text-5xl font-black text-orange-600 mb-2">Brain & Fun Games</h2>
          <p class="text-gray-500 font-bold text-xl">Choose your favorite game and start playing!</p>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (game of gameList; track game.id) {
            <div (click)="setMode(game.id)"
                 class="group relative bg-white rounded-3xl p-6 border-4 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all flex flex-col items-center text-center overflow-hidden"
                 [class]="game.border">
              <!-- Glow -->
              <div class="absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-xl group-hover:scale-150 transition-transform" [class]="game.bg"></div>
              
              <!-- Icon / Image -->
              <div class="w-24 h-24 rounded-2xl flex items-center justify-center text-6xl mb-4 shadow-md group-hover:rotate-6 transition-transform" [class]="game.bg">
                @if (game.image) {
                  <img [src]="'assets/images/' + game.image" class="w-16 h-16 object-contain pointer-events-none drop-shadow" />
                } @else {
                  <span>{{ game.icon }}</span>
                }
              </div>

              <!-- Title & Desc -->
              <h3 class="text-2xl font-black mb-1" [class]="game.textColor">{{ game.title }}</h3>
              <p class="text-gray-500 text-sm font-sans font-bold mb-5">{{ game.desc }}</p>

              <!-- Play Button -->
              <button class="mt-auto w-full py-3 rounded-2xl text-white font-black text-lg shadow-md group-hover:shadow-lg transition-all" [class]="game.btnBg">
                Play Game 🚀
              </button>
            </div>
          }
        </div>
      </div>
    } @else {
      <!-- Standalone Game View -->
      <div class="bg-white rounded-3xl p-4 md:p-6 shadow-xl border-4 border-orange-300 max-w-5xl mx-auto">
        <!-- Top Bar with Prominent Back Button -->
        <div class="flex items-center justify-between mb-6 pb-4 border-b-2 border-orange-100 font-[Bubblegum]">
          <button (click)="backToMenu()" 
                  class="flex items-center gap-2 bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-black px-6 py-2.5 rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all text-xl border-2 border-orange-200">
            <span class="text-2xl">⬅️</span>
            <span>All Games</span>
          </button>

          <div class="flex items-center gap-4">
            <div class="text-2xl font-black text-orange-600 hidden sm:block">
              {{ getCurrentGameTitle() }}
            </div>
            <div class="bg-amber-100 text-amber-900 px-4 py-2 rounded-2xl font-black text-lg border border-amber-300 flex items-center gap-1 shadow-sm">
              <span>⭐</span> {{ data.stars() }} Stars
            </div>
          </div>
        </div>

        @if (mode() === 'match') {
          <p class="text-gray-600 font-bold mb-6 text-center text-lg font-[Bubblegum]">Drag the picture to its matching letter!</p>

          @if (gameWon()) {
            <div class="text-center py-10 bg-green-50 rounded-3xl border-4 border-green-300 mb-6 font-[Bubblegum]">
              <div class="text-8xl mb-4 animate-bounce">🏆</div>
              <h3 class="text-4xl font-black text-green-700 mb-2">You are a Champion!</h3>
              <p class="text-xl text-green-600 font-bold mb-6">You won +10 stars! ⭐</p>
              <button (click)="initMatchGame()" class="bg-orange-500 text-white px-8 py-3 rounded-full font-black text-2xl hover:bg-orange-600 shadow-xl hover:scale-105 transition-transform">
                Play Again 🔄
              </button>
            </div>
          } @else {
            <!-- Drop Zones -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              @for (zone of dropZones(); track zone.letter; let i = $index) {
                <div class="bg-orange-50 rounded-3xl p-6 border-4 border-dashed transition-all flex flex-col items-center min-h-[160px]"
                     [class]="dragHoverIndex === i ? 'border-orange-500 bg-orange-100 scale-105' : 'border-orange-300'"
                     (dragover)="allowDrop($event, i)"
                     (dragleave)="dragLeave($event)"
                     (drop)="drop($event, i)">
                  
                  <div class="text-6xl font-black text-orange-400 mb-2 font-[Bubblegum]">{{ zone.letter }}</div>
                  
                  @if (zone.currentItem) {
                    <div class="bg-white p-3 rounded-2xl shadow-md border-2 border-green-400 animate-bounce">
                      @if(zone.currentItem.imagePath){<img [src]="'assets/images/' + zone.currentItem.imagePath" class="w-16 h-16 object-contain"/>}@else{<span class="text-5xl">{{ zone.currentItem.img }}</span>}
                      <div class="text-lg font-black text-green-700 mt-1 text-center font-[Bubblegum]">{{ zone.currentItem.word }}</div>
                    </div>
                  } @else {
                    <div class="text-gray-400 font-bold mt-4 font-[Bubblegum]">Drop picture here 👇</div>
                  }
                </div>
              }
            </div>
          <!-- Draggable Items (Pictures) -->
          <div class="bg-blue-50 rounded-3xl p-6 border-2 border-blue-200">
            <div class="flex flex-wrap justify-center gap-4">
              @for (item of dragItems(); track item.word; let i = $index) {
                <div class="bg-white p-4 rounded-2xl shadow-sm border-2 border-blue-300 cursor-grab hover:shadow-md hover:-translate-y-1 transition-transform flex flex-col items-center"
                     draggable="true"
                     (dragstart)="dragStart($event, i)">
                  @if (item.imagePath) {
                    <img [src]="'assets/images/' + item.imagePath" class="w-16 h-16 object-contain mb-2 pointer-events-none" />
                  } @else {
                    <span class="text-5xl mb-2">{{ item.img }}</span>
                  }
                  <span class="text-base font-black text-blue-900 font-[Bubblegum]">{{ item.word }}</span>
                </div>
              }
            </div>
          </div>
        }
      } @else if (mode() === 'memory') {
        <p class="text-gray-600 font-bold mb-6 text-center text-lg font-[Bubblegum]">Match each letter card with its picture!</p>

        @if (memoryWon()) {
          <div class="text-center py-10 bg-purple-50 rounded-3xl border-4 border-purple-300 mb-6 font-[Bubblegum]">
            <div class="text-8xl mb-4 animate-bounce">🥇</div>
            <h3 class="text-4xl font-black text-purple-700 mb-2">Incredible Memory!</h3>
            <p class="text-xl text-purple-600 font-bold mb-6">You matched all cards and won +15 stars! ⭐</p>
            <button (click)="initMemoryGame()" class="bg-purple-500 text-white px-8 py-3 rounded-full font-black text-2xl hover:bg-purple-600 shadow-xl hover:scale-105 transition-transform">
              Play Again 🔄
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
      } @else if (mode() === 'quiz') {
        <p class="text-gray-600 font-bold mb-6 text-center text-lg">Listen to the word and tap the correct picture!</p>
        
        @if (quizWon()) {
          <div class="text-center py-10 bg-rose-50 rounded-3xl border-4 border-rose-300 mb-6 font-[Bubblegum]">
            <div class="text-8xl mb-4 animate-bounce">🎯</div>
            <h3 class="text-4xl font-black text-rose-700 mb-2">Awesome Job! 🎉</h3>
            <p class="text-xl text-rose-600 font-bold mb-6">Correct answer! You earned +5 stars! ⭐</p>
            <button (click)="initQuizGame()" class="bg-rose-500 text-white px-8 py-3 rounded-full font-black text-2xl hover:bg-rose-600 shadow-xl hover:scale-105 transition-transform">
              Play Again 🔄
            </button>
          </div>
        } @else if (quizQuestion()) {
          <div class="flex flex-col items-center">
            <button (click)="playQuizWord()" class="bg-blue-500 text-white px-8 py-4 rounded-full font-black text-2xl mb-8 shadow-xl hover:scale-110 transition-transform animate-pulse flex items-center gap-3 font-[Bubblegum]">
              <span>🔊</span> Find: {{ quizQuestion()!.targetWord.toUpperCase() }}
            </button>
            
            <div class="grid grid-cols-2 md:grid-cols-4 gap-6 w-full">
              @for (opt of quizQuestion()!.options; track opt.word) {
                <button (click)="checkQuizAnswer(opt.word)" class="bg-white p-6 rounded-3xl border-4 border-gray-200 shadow-md hover:border-rose-400 hover:scale-105 transition-all flex justify-center items-center h-44">
                  @if (opt.imagePath) {
                    <img [src]="'assets/images/' + opt.imagePath" class="w-28 h-28 object-contain pointer-events-none drop-shadow-md" />
                  } @else {
                    <span class="text-7xl md:text-8xl">{{ opt.img }}</span>
                  }
                </button>
              }
            </div>
          </div>
        }
      } @else if (mode() === 'journey') {
        <!-- لعبة رحلة الحروف -->
        <div class="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-inner flex flex-col items-center justify-center select-none" dir="ltr">
            <!-- الخلفية -->
            <div class="absolute inset-0 -z-10 flex flex-col">
                <div class="journey-sky flex-1 relative overflow-hidden">
                    <div class="journey-cloud journey-cloud1"></div>
                    <div class="journey-cloud journey-cloud2"></div>
                </div>
                <div class="journey-grass h-1/3 relative border-t-8 border-green-800"></div>
            </div>

            <!-- شاشة البداية -->
            @if (journeyState() === 'start') {
                <div class="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4 bg-black/60 backdrop-blur-sm">
                    <div class="bg-white p-10 rounded-[3rem] shadow-2xl max-w-lg w-full border-[10px] border-blue-400 transform transition hover:scale-105">
                        <div class="text-9xl mb-4 animate-bounce">🔤</div>
                        <h2 class="text-5xl font-black text-blue-600 mb-4 font-[Bubblegum]">Alphabet Master</h2>
                        <p class="text-gray-600 mb-8 font-bold text-2xl">26 levels of letters & words. Ready?</p>
                        <button (click)="startJourney()" class="w-full py-6 bg-yellow-400 hover:bg-yellow-500 text-blue-900 text-4xl font-black rounded-3xl shadow-[0_10px_0_#f57f17] active:translate-y-2 active:shadow-none transition-all font-[Bubblegum]">
                            Start Journey!
                        </button>
                    </div>
                </div>
            }

            <!-- شاشة النهاية -->
            @else if (journeyState() === 'finale') {
                <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-blue-400 to-green-400 text-white p-4 font-[Bubblegum]">
                    <div class="text-center">
                        <div class="text-[8rem] mb-8 animate-bounce">🏆</div>
                        <h1 class="text-6xl font-black mb-4 drop-shadow-2xl">You're a Genius! 🎉</h1>
                        <p class="text-3xl font-bold mb-12">You finished all 26 letters successfully!</p>
                        <button (click)="resetJourney()" class="px-12 py-6 bg-white text-blue-600 text-3xl font-black rounded-full shadow-[0_10px_0_#ccc] active:translate-y-2 active:shadow-none transition-all">
                            Play Again
                        </button>
                    </div>
                </div>
            }

            <!-- منطقة اللعب -->
            @else {
                <!-- شريط التقدم -->
                <div class="absolute top-4 left-0 w-full flex flex-col items-center z-20">
                    <h2 class="text-white text-2xl font-black drop-shadow-md font-[Bubblegum]" style="text-shadow: 2px 2px 0 #333;">
                        Level {{ journeyLevelIndex() + 1 }} / 26
                    </h2>
                    <div class="journey-progress-container w-3/4 max-w-sm h-5 mt-2">
                        <div class="journey-progress-fill h-full" [style.width.%]="(journeyLevelIndex() / 26) * 100"></div>
                    </div>
                </div>

                @if (journeyTarget(); as target) {
                    <!-- بطاقة الحرف -->
                    <div class="journey-target-card mt-12 z-10">
                        <span class="text-7xl font-black text-blue-600 drop-shadow-sm font-[Bubblegum]" style="text-shadow: 4px 4px 0 #bbdefb;">{{ target.letter }}</span>
                    </div>

                    <h3 class="text-white text-3xl font-black mt-6 drop-shadow-md text-center px-4 z-10 font-[Bubblegum]" style="text-shadow: 2px 2px 0 #1976d2;">
                        Which picture starts with this letter?
                    </h3>

                    <!-- خيارات الصور -->
                    <div class="grid grid-cols-3 gap-4 w-full max-w-lg px-4 mt-8 z-10" dir="ltr">
                        @for (opt of journeyOptions(); track opt.word; let i = $index) {
                            <button (click)="checkJourneyAnswer(opt, i)" 
                                    [disabled]="journeyState() === 'win'"
                                    [class.journey-shake]="wrongJourneyIndex === i"
                                    [class.journey-correct]="journeyState() === 'win' && opt.isCorrect"
                                    class="journey-option-btn flex items-center justify-center">
                                @if (opt.imagePath) {
                                  <img [src]="'assets/images/' + opt.imagePath" class="w-24 h-24 object-contain pointer-events-none drop-shadow-md" />
                                } @else {
                                  <span class="text-6xl">{{ opt.img }}</span>
                                }
                            </button>
                        }
                    </div>

                    <!-- رسالة الفوز للمرحلة -->
                    @if (journeyState() === 'win') {
                        <div class="absolute inset-0 z-40 flex flex-col items-center justify-center">
                            <div class="text-center bg-white/90 backdrop-blur-md px-10 py-6 rounded-[3rem] shadow-2xl border-[8px] border-green-400 animate-[bounceIn_0.5s_ease-out]">
                                @if (target.imagePath) {
                                  <img [src]="'assets/images/' + target.imagePath" class="w-32 h-32 object-contain mx-auto mb-2 drop-shadow-md" />
                                } @else {
                                  <div class="text-7xl mb-2">{{ target.img }}</div>
                                }
                                <h2 class="text-5xl font-black text-green-600 mb-1 uppercase drop-shadow-sm font-[Bubblegum]">{{ target.word }}</h2>
                            </div>
                        </div>
                    }
                }
            }
        </div>
      } @else if (mode() === 'shadow') {
        <!-- لعبة أين ظلي -->
        <div class="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-inner flex flex-col items-center select-none" dir="rtl">
            <!-- الخلفية -->
            <div class="shadowgame-scenery">
                <div class="shadowgame-bg-circle shadowgame-c1"></div>
                <div class="shadowgame-bg-circle shadowgame-c2"></div>
                <div class="shadowgame-bg-circle shadowgame-c3"></div>
            </div>

            <!-- شاشة البداية -->
            @if (shadowState() === 'start') {
                <div class="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4 bg-black/60 backdrop-blur-sm">
                    <div class="bg-white p-8 rounded-[3rem] shadow-2xl max-w-sm w-full border-[8px] border-orange-400">
                        <div class="text-8xl mb-2 flex justify-center gap-2 animate-bounce">
                            <span>👤</span><span>👤</span>
                        </div>
                        <h2 class="text-4xl font-black text-orange-600 mb-2 font-[Bubblegum]">Shadow Match</h2>
                        <p class="text-gray-600 mb-6 font-bold text-xl">Drag each item onto its matching shadow!</p>
                        <button (click)="startShadowGame()" class="w-full py-4 bg-green-500 hover:bg-green-600 text-white text-3xl font-black rounded-2xl shadow-[0_8px_0_#2e7d32] active:translate-y-2 active:shadow-none transition-all font-[Bubblegum]">
                            Let's Play!
                        </button>
                    </div>
                </div>
            }

            <!-- شاشة النهاية -->
            @else if (shadowState() === 'win') {
                <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-gradient-to-b from-green-400 to-blue-500 text-white p-4">
                    <div class="text-[8rem] mb-4 animate-bounce">🏆</div>
                    <h1 class="text-6xl font-black mb-4 drop-shadow-xl text-center font-[Bubblegum]">Champion! 🎉</h1>
                    <p class="text-2xl font-bold mb-6 text-center">You found all the matching shadows!</p>
                    <button (click)="resetShadowGame()" class="mt-4 px-10 py-5 bg-white text-blue-600 text-3xl font-black rounded-full shadow-[0_8px_0_#ccc] active:translate-y-2 active:shadow-none transition-all font-[Bubblegum]">
                        Play Again
                    </button>
                </div>
            }

            <!-- منطقة اللعب -->
            @else {
                <!-- شريط العناوين -->
                <div class="absolute top-4 w-full flex flex-col items-center z-30 pointer-events-none">
                    <h1 class="text-white text-3xl font-black drop-shadow-md mb-2 font-[Bubblegum]" style="text-shadow: 2px 2px 0 #e65100;">Match all 3 shadows!</h1>
                    <div class="w-48 h-4 bg-black/10 rounded-full overflow-hidden border-2 border-white">
                        <div class="h-full bg-green-500 transition-all duration-500" [style.width.%]="(shadowLevelIndex() / 6) * 100"></div>
                    </div>
                </div>

                <div class="w-full h-full flex flex-col justify-between pt-20">
                    <!-- النصف العلوي: العناصر القابلة للسحب -->
                    <div class="h-[40%] flex justify-evenly items-center relative z-20 w-full" dir="ltr">
                        @for (item of shadowItems(); track item.id; let i = $index) {
                            @if (!item.matched) {
                                <div class="shadowgame-item flex items-center justify-center"
                                     [class.shadowgame-idle-float]="shadowDraggingIndex() !== i"
                                     [class.shadowgame-snapping-back]="shadowWrongIndex === i"
                                     [style.transform]="shadowDraggingIndex() === i ? 'translate(' + dragDx() + 'px, ' + dragDy() + 'px) scale(1.15)' : 'translate(0px, 0px)'"
                                     [style.zIndex]="shadowDraggingIndex() === i ? 1000 : 100"
                                     [style.transition]="shadowDraggingIndex() === i ? 'none' : ''"
                                     (mousedown)="onShadowDragStart($event, i)"
                                     (touchstart)="onShadowDragStart($event, i)"
                                     (window:mousemove)="onShadowDragMove($event)"
                                     (window:touchmove)="onShadowDragMove($event)"
                                     (window:mouseup)="onShadowDragEnd($event)"
                                     (window:touchend)="onShadowDragEnd($event)">
                                    @if (item.imagePath) {
                                        <img [src]="'assets/images/' + item.imagePath" class="w-20 h-20 object-contain pointer-events-none drop-shadow-md select-none" />
                                    } @else {
                                        {{ item.emoji }}
                                    }
                                </div>
                            } @else {
                                <div class="shadowgame-item opacity-0 pointer-events-none"></div>
                            }
                        }
                    </div>

                    <!-- النصف السفلي: الظلال -->
                    <div class="shadowgame-shadows-area h-[40%] flex justify-evenly items-center w-full" dir="ltr">
                        @for (slot of shadowSlots(); track slot.id; let j = $index) {
                            <div class="shadowgame-slot flex items-center justify-center"
                                 id="shadow-slot-{{ j }}"
                                 [class.shadowgame-slot-hover]="shadowHoverIndex() === j"
                                 [class.border-transparent]="slot.matched"
                                 [class.bg-transparent]="slot.matched">
                                @if (slot.imagePath) {
                                    <img [src]="'assets/images/' + slot.imagePath"
                                         class="w-20 h-20 object-contain pointer-events-none transition-all duration-500 select-none"
                                         [class.shadowgame-correct-match]="slot.matched"
                                         [style.filter]="slot.matched ? 'none' : 'brightness(0) opacity(0.5)'" />
                                } @else {
                                    <span class="shadowgame-emoji"
                                          [class.shadowgame-correct-match]="slot.matched"
                                          [style.filter]="slot.matched ? 'brightness(1) opacity(1)' : 'brightness(0) opacity(0.6)'">
                                        {{ slot.emoji }}
                                    </span>
                                }
                            </div>
                        }
                    </div>
                </div>
            }
        </div>
      } @else if (mode() === 'balloon') {
          <app-balloon-game></app-balloon-game>
      } @else if (mode() === 'train') {
          <app-train-game></app-train-game>
      } @else if (mode() === 'shape') {
          <app-shape-game></app-shape-game>
      } @else if (mode() === 'apple') {
          <app-apple-game></app-apple-game>
      } @else if (mode() === 'math') {
          <app-math-game></app-math-game>
      } @else if (mode() === 'puzzle') {
          <app-puzzle-game></app-puzzle-game>
      } @else if (mode() === 'spelling') {
          <app-spelling-game></app-spelling-game>
      } @else if (mode() === 'sorting') {
          <app-sorting-game></app-sorting-game>
      } @else if (mode() === 'sound') {
          <app-animal-sound-game></app-animal-sound-game>
      } @else if (mode() === 'pattern') {
          <app-pattern-memory-game></app-pattern-memory-game>
      }
      </div>
    }
  `
})
export class GamesComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  mode = signal<'menu' | 'match' | 'memory' | 'quiz' | 'journey' | 'shadow' | 'balloon' | 'train' | 'shape' | 'apple' | 'math' | 'puzzle' | 'spelling' | 'sorting' | 'sound' | 'pattern'>('menu');

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

  // Quiz Game State
  quizQuestion = signal<{targetWord: string, targetImg: string, options: {word: string, img: string, imagePath?: string}[]} | null>(null);
  quizWon = signal(false);

  // Journey Game State
  journeyState = signal<'start' | 'playing' | 'win' | 'finale'>('start');
  journeyLevelIndex = signal(0);
  journeyTarget = signal<{letter: string, word: string, img: string, imagePath?: string, ar: string} | null>(null);
  journeyOptions = signal<{word: string, img: string, imagePath?: string, ar: string, isCorrect: boolean}[]>([]);
  wrongJourneyIndex = -1;

  // Shadow Game State
  shadowState = signal<'start' | 'playing' | 'win'>('start');
  shadowLevelIndex = signal(0);
  shadowItems = signal<{id: string, emoji: string, imagePath?: string, matched: boolean}[]>([]);
  shadowSlots = signal<{id: string, emoji: string, imagePath?: string, matched: boolean}[]>([]);
  shadowDraggingIndex = signal<number>(-1);
  shadowHoverIndex = signal<number>(-1);
  dragDx = signal(0);
  dragDy = signal(0);
  shadowWrongIndex = -1;
  private shadowStartX = 0;
  private shadowStartY = 0;
  private shadowLevels: { id: string, emoji: string, imagePath: string }[][] = [
      [
        { id: 'butterfly', emoji: '🦋', imagePath: 'butterfly.png' },
        { id: 'ladybug', emoji: '🐞', imagePath: 'ladybug.png' },
        { id: 'bee', emoji: '🐝', imagePath: 'bee.png' }
      ],
      [
        { id: 'car', emoji: '🚗', imagePath: 'car.png' },
        { id: 'airplane', emoji: '✈️', imagePath: 'airplane.png' },
        { id: 'rocket', emoji: '🚀', imagePath: 'rocket.png' }
      ],
      [
        { id: 'dog', emoji: '🐶', imagePath: 'dog.png' },
        { id: 'cat', emoji: '🐱', imagePath: 'cat.png' },
        { id: 'rabbit', emoji: '🐰', imagePath: 'rabbit.png' }
      ],
      [
        { id: 'apple', emoji: '🍎', imagePath: 'apple.png' },
        { id: 'banana', emoji: '🍌', imagePath: 'banana.png' },
        { id: 'watermelon', emoji: '🍉', imagePath: 'watermelon.png' }
      ],
      [
        { id: 'lion', emoji: '🦁', imagePath: 'lion.png' },
        { id: 'elephant', emoji: '🐘', imagePath: 'elephant.png' },
        { id: 'giraffe', emoji: '🦒', imagePath: 'giraffe.png' }
      ],
      [
        { id: 'fish', emoji: '🐟', imagePath: 'fish.png' },
        { id: 'octopus', emoji: '🐙', imagePath: 'octopus.png' },
        { id: 'whale', emoji: '🐳', imagePath: 'whale.png' }
      ]
  ];

  gameList: { id: 'match' | 'memory' | 'quiz' | 'journey' | 'shadow' | 'balloon' | 'train' | 'shape' | 'apple' | 'math' | 'puzzle' | 'spelling' | 'sorting' | 'sound' | 'pattern', title: string, desc: string, icon: string, image?: string, bg: string, border: string, textColor: string, btnBg: string }[] = [
    {
      id: 'spelling',
      title: 'Word Builder',
      desc: 'Look at the 3D picture and spell the word',
      icon: '🐝',
      image: 'bee.png',
      bg: 'bg-amber-100',
      border: 'border-amber-400',
      textColor: 'text-amber-800',
      btnBg: 'bg-amber-500 hover:bg-amber-600'
    },
    {
      id: 'sorting',
      title: 'Category Sorter',
      desc: 'Sort fruits, animals, and vehicles into baskets',
      icon: '🧺',
      image: 'apple.png',
      bg: 'bg-emerald-100',
      border: 'border-emerald-400',
      textColor: 'text-emerald-800',
      btnBg: 'bg-emerald-500 hover:bg-emerald-600'
    },
    {
      id: 'sound',
      title: 'Animal Sounds',
      desc: 'Listen to mystery animal calls and guess who it is',
      icon: '🎧',
      image: 'lion.png',
      bg: 'bg-indigo-100',
      border: 'border-indigo-400',
      textColor: 'text-indigo-800',
      btnBg: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      id: 'pattern',
      title: 'Pattern Memory',
      desc: 'Watch the flashing color lights and repeat the sequence',
      icon: '🧠',
      image: 'color_balloons.png',
      bg: 'bg-purple-100',
      border: 'border-purple-400',
      textColor: 'text-purple-800',
      btnBg: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'train',
      title: 'Animal Train',
      desc: 'Listen and arrange animals in train wagons',
      icon: '🚂',
      image: 'train_engine.png',
      bg: 'bg-emerald-100',
      border: 'border-emerald-300',
      textColor: 'text-emerald-700',
      btnBg: 'bg-emerald-500 hover:bg-emerald-600'
    },
    {
      id: 'shadow',
      title: 'Shadow Match',
      desc: 'Match real items onto their exact dark shadows',
      icon: '👤',
      image: 'butterfly.png',
      bg: 'bg-amber-100',
      border: 'border-amber-300',
      textColor: 'text-amber-700',
      btnBg: 'bg-amber-500 hover:bg-amber-600'
    },
    {
      id: 'balloon',
      title: 'Balloon Popper',
      desc: 'Pop floating balloons to learn letters & colors',
      icon: '🎈',
      image: 'color_balloons.png',
      bg: 'bg-cyan-100',
      border: 'border-cyan-300',
      textColor: 'text-cyan-700',
      btnBg: 'bg-cyan-500 hover:bg-cyan-600'
    },
    {
      id: 'puzzle',
      title: 'Jigsaw Puzzle',
      desc: 'Assemble pieces to reveal the 3D character',
      icon: '🖼️',
      image: 'dog.png',
      bg: 'bg-indigo-100',
      border: 'border-indigo-300',
      textColor: 'text-indigo-700',
      btnBg: 'bg-indigo-500 hover:bg-indigo-600'
    },
    {
      id: 'math',
      title: 'Smart Math',
      desc: 'Solve fun chalkboard addition equations',
      icon: '🧮',
      bg: 'bg-teal-100',
      border: 'border-teal-300',
      textColor: 'text-teal-700',
      btnBg: 'bg-teal-500 hover:bg-teal-600'
    },
    {
      id: 'apple',
      title: 'Math Basket',
      desc: 'Catch falling number apples into the basket',
      icon: '🍎',
      image: 'apple.png',
      bg: 'bg-red-100',
      border: 'border-red-300',
      textColor: 'text-red-700',
      btnBg: 'bg-red-500 hover:bg-red-600'
    },
    {
      id: 'match',
      title: 'Letter Match',
      desc: 'Drag real pictures to matching letter dropzones',
      icon: '🧩',
      bg: 'bg-orange-100',
      border: 'border-orange-300',
      textColor: 'text-orange-700',
      btnBg: 'bg-orange-500 hover:bg-orange-600'
    },
    {
      id: 'memory',
      title: 'Memory Cards',
      desc: 'Flip and find matching letter & picture pairs',
      icon: '🃏',
      bg: 'bg-purple-100',
      border: 'border-purple-300',
      textColor: 'text-purple-700',
      btnBg: 'bg-purple-500 hover:bg-purple-600'
    },
    {
      id: 'quiz',
      title: 'Find It!',
      desc: 'Listen to the word and tap the matching image',
      icon: '🔍',
      bg: 'bg-rose-100',
      border: 'border-rose-300',
      textColor: 'text-rose-700',
      btnBg: 'bg-rose-500 hover:bg-rose-600'
    },
    {
      id: 'journey',
      title: 'Alphabet Journey',
      desc: '26 adventure levels across all alphabet letters',
      icon: '✈️',
      image: 'airplane.png',
      bg: 'bg-sky-100',
      border: 'border-sky-300',
      textColor: 'text-sky-700',
      btnBg: 'bg-sky-500 hover:bg-sky-600'
    },
    {
      id: 'shape',
      title: 'Colors & Shapes',
      desc: 'Recognize vibrant colors and shapes',
      icon: '🎨',
      image: 'red_color.png',
      bg: 'bg-pink-100',
      border: 'border-pink-300',
      textColor: 'text-pink-700',
      btnBg: 'bg-pink-500 hover:bg-pink-600'
    }
  ];

  getCurrentGameTitle(): string {
    const found = this.gameList.find(g => g.id === this.mode());
    return found ? found.icon + ' ' + found.title : '';
  }

  backToMenu() {
    this.audio.playSoundEffect('bell');
    this.mode.set('menu');
  }

  constructor() {}

  setMode(m: 'menu' | 'match' | 'memory' | 'quiz' | 'journey' | 'shadow' | 'balloon' | 'train' | 'shape' | 'apple' | 'math' | 'puzzle' | 'spelling' | 'sorting' | 'sound' | 'pattern') {
    this.mode.set(m);
    if (m === 'match') this.initMatchGame();
    else if (m === 'memory') this.initMemoryGame();
    else if (m === 'quiz') this.initQuizGame();
    else if (m === 'journey') {
        this.journeyState.set('start');
        this.journeyLevelIndex.set(0);
    }
    else if (m === 'shadow') {
        this.shadowState.set('start');
        this.shadowLevelIndex.set(0);
    }
  }

  // --- MATCH GAME LOGIC ---
  initMatchGame() {
    this.gameWon.set(false);
    this.dragHoverIndex = -1;
    this.draggedItemIndex = -1;
    
    const all = [...this.data.alphabetData].sort(() => 0.5 - Math.random()).slice(0, 3);
    const zones: DropZone[] = all.map(a => ({ letter: a.letter, matchWord: a.words[0].word, currentItem: null }));
    const items: DragItem[] = all.map(a => ({ word: a.words[0].word, img: a.words[0].img, imagePath: a.words[0].imagePath })).sort(() => 0.5 - Math.random());
    
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
      cards.push({ id: idCounter++, letter: a.letter, word: a.words[0].word, img: a.words[0].img, imagePath: a.words[0].imagePath, type: 'letter', isFlipped: false, isMatched: false });
      cards.push({ id: idCounter++, letter: a.letter, word: a.words[0].word, img: a.words[0].img, imagePath: a.words[0].imagePath, type: 'img', isFlipped: false, isMatched: false });
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
              this.audio.speak('Well done! Great memory!', 'en-US');
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

  // --- QUIZ GAME LOGIC ---
  initQuizGame() {
    this.quizWon.set(false);
    
    // Pick 4 random words
    const allWords = this.data.alphabetData.flatMap(a => a.words).sort(() => 0.5 - Math.random());
    const options = allWords.slice(0, 4);
    
    // Pick 1 target
    const target = options[Math.floor(Math.random() * options.length)];
    
    this.quizQuestion.set({
      targetWord: target.word,
      targetImg: target.img,
      options: options.sort(() => 0.5 - Math.random()) // shuffle them for display
    });
    
    setTimeout(() => {
      this.playQuizWord();
    }, 500);
  }

  playQuizWord() {
    const q = this.quizQuestion();
    if (q) {
      this.audio.speak(q.targetWord, 'en-US');
    }
  }

  checkQuizAnswer(word: string) {
    const q = this.quizQuestion();
    if (!q) return;
    
    if (word === q.targetWord) {
      // Success
      this.audio.playSoundEffect('bell');
      this.audio.speak('Awesome! Correct answer!', 'en-US');
      this.quizWon.set(true);
      this.data.addStars(5);
    } else {
      // Wrong
      this.audio.speak('Try again!', 'en-US');
    }
  }

  // --- JOURNEY GAME LOGIC ---
  startJourney() {
    this.journeyLevelIndex.set(0);
    this.loadJourneyLevel();
  }

  resetJourney() {
    this.journeyState.set('start');
    this.journeyLevelIndex.set(0);
  }

  loadJourneyLevel() {
    const idx = this.journeyLevelIndex();
    if (idx >= this.data.alphabetData.length) {
      this.journeyState.set('finale');
      this.audio.playSoundEffect('bell');
      this.data.addStars(50); // Big reward!
      this.audio.speak('Congratulations! You are amazing!', 'en-US');
      return;
    }

    this.journeyState.set('playing');
    this.wrongJourneyIndex = -1;

    const letterData = this.data.alphabetData[idx];
    const targetWord = letterData.words[0]; // first word for that letter
    
    this.journeyTarget.set({
      letter: letterData.letter,
      word: targetWord.word,
      img: targetWord.img,
      imagePath: targetWord.imagePath,
      ar: (targetWord as any).ar_word || 'ممتاز'
    });

    // Pick 2 random wrong words from other letters
    const allWords = this.data.alphabetData
        .filter((_, i) => i !== idx)
        .flatMap(a => a.words)
        .sort(() => 0.5 - Math.random());
    
    const wrongs = allWords.slice(0, 2);
    
    let options = [
      { ...targetWord, ar: 'صحيح', isCorrect: true },
      { ...wrongs[0], ar: 'خطأ', isCorrect: false },
      { ...wrongs[1], ar: 'خطأ', isCorrect: false }
    ];
    
    // Shuffle options
    options = options.sort(() => 0.5 - Math.random());
    this.journeyOptions.set(options);

    // Announce letter
    setTimeout(() => {
      this.audio.speak(letterData.letter, 'en-US');
    }, 600);
  }

  checkJourneyAnswer(opt: {word: string, isCorrect: boolean}, index: number) {
    if (this.journeyState() !== 'playing') return;

    if (opt.isCorrect) {
      this.audio.playSoundEffect('bell');
      this.journeyState.set('win');
      this.audio.speak(opt.word, 'en-US');
      this.data.addStars(2);

      setTimeout(() => {
        this.journeyLevelIndex.update(i => i + 1);
        this.loadJourneyLevel();
      }, 3500);
    } else {
      this.audio.playSoundEffect('error');
      this.wrongJourneyIndex = index;
      setTimeout(() => {
        this.wrongJourneyIndex = -1;
      }, 400);
    }
  }

  // --- SHADOW GAME LOGIC ---
  startShadowGame() {
    this.shadowLevelIndex.set(0);
    this.loadShadowLevel();
  }

  resetShadowGame() {
    this.shadowState.set('start');
    this.shadowLevelIndex.set(0);
  }

  loadShadowLevel() {
    const idx = this.shadowLevelIndex();
    if (idx >= this.shadowLevels.length) {
      this.shadowState.set('win');
      this.audio.playSoundEffect('bell');
      this.data.addStars(40);
      this.audio.speak('Awesome! You mastered the shadows!', 'en-US');
      return;
    }

    this.shadowState.set('playing');
    const items = [...this.shadowLevels[idx]];
    
    let tops = [...items].sort(() => 0.5 - Math.random()).map(e => ({ id: e.id, emoji: e.emoji, imagePath: e.imagePath, matched: false }));
    let bottoms = [...items].sort(() => 0.5 - Math.random()).map(e => ({ id: e.id, emoji: e.emoji, imagePath: e.imagePath, matched: false }));
    
    this.shadowItems.set(tops);
    this.shadowSlots.set(bottoms);
  }

  onShadowDragStart(e: MouseEvent | TouchEvent, index: number) {
    if (this.shadowWrongIndex === index || this.shadowItems()[index].matched) return;
    this.shadowDraggingIndex.set(index);
    this.audio.playSoundEffect('bell');
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    this.shadowStartX = clientX;
    this.shadowStartY = clientY;
    this.dragDx.set(0);
    this.dragDy.set(0);
  }

  onShadowDragMove(e: MouseEvent | TouchEvent) {
    if (this.shadowDraggingIndex() === -1) return;
    if (e.cancelable) e.preventDefault();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    this.dragDx.set(clientX - this.shadowStartX);
    this.dragDy.set(clientY - this.shadowStartY);

    this.checkShadowCollision(clientX, clientY);
  }

  onShadowDragEnd(e: MouseEvent | TouchEvent) {
    const dragIdx = this.shadowDraggingIndex();
    if (dragIdx === -1) return;
    
    const hoverIdx = this.shadowHoverIndex();
    this.shadowDraggingIndex.set(-1);
    this.shadowHoverIndex.set(-1);

    if (hoverIdx !== -1) {
      const draggedItem = this.shadowItems()[dragIdx];
      const targetSlot = this.shadowSlots()[hoverIdx];

      if (draggedItem.id === targetSlot.id) {
        // Correct Match
        this.audio.playSoundEffect('bell');
        this.data.addStars(1);
        
        this.shadowItems.update(items => {
            const arr = [...items];
            arr[dragIdx].matched = true;
            return arr;
        });
        
        this.shadowSlots.update(slots => {
            const arr = [...slots];
            arr[hoverIdx].matched = true;
            return arr;
        });

        // Check if level won
        if (this.shadowItems().every(item => item.matched)) {
            setTimeout(() => {
                this.audio.playSoundEffect('bell');
                this.audio.speak('ممتاز', 'ar-EG');
                this.shadowLevelIndex.update(i => i + 1);
                this.loadShadowLevel();
            }, 1500);
        }
      } else {
        // Wrong Match
        this.shadowWrongMatch(dragIdx);
      }
    } else {
      // Dropped nowhere
      this.shadowWrongMatch(dragIdx);
    }
  }

  private shadowWrongMatch(dragIdx: number) {
      this.audio.playSoundEffect('error');
      this.shadowWrongIndex = dragIdx;
      setTimeout(() => {
          this.shadowWrongIndex = -1;
      }, 400);
  }

  private checkShadowCollision(x: number, y: number) {
    let found = -1;
    for (let i = 0; i < this.shadowSlots().length; i++) {
        if (this.shadowSlots()[i].matched) continue;
        const slotEl = document.getElementById('shadow-slot-' + i);
        if (slotEl) {
            const rect = slotEl.getBoundingClientRect();
            if (x > rect.left - 20 && x < rect.right + 20 && y > rect.top - 20 && y < rect.bottom + 20) {
                found = i;
                break;
            }
        }
    }
    this.shadowHoverIndex.set(found);
  }
}
