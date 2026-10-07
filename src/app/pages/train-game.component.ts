import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { NgClass } from '@angular/common';

interface Animal {
  en: string;
  ar: string;
  img: string;
  imagePath?: string;
  soundEffect?: string;
}

interface TrainCar {
  index: number;
  targetAnimal: Animal;
  placedAnimal: Animal | null;
}

@Component({
  selector: 'app-train-game',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-inner flex flex-col justify-end select-none bg-gradient-to-b from-blue-200 to-green-100" dir="ltr">
        
        <!-- Score & Replay Audio -->
        <div class="absolute top-4 w-full flex justify-between items-center px-8 z-30 pointer-events-none">
            <div class="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full font-black text-xl text-green-700 shadow-md">
                Score: {{ score() }}
            </div>
            
            <button (click)="playSequenceAudio(); $event.stopPropagation()" class="bg-yellow-400 pointer-events-auto hover:bg-yellow-500 text-green-900 w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-110 active:scale-95">
                🔊
            </button>
        </div>

        @if (gameState() === 'start') {
            <div class="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4 bg-black/40 backdrop-blur-sm">
                <div class="bg-white p-8 rounded-[3rem] shadow-2xl max-w-sm w-full border-[8px] border-green-400">
                    <div class="text-8xl mb-2 animate-bounce">🚂</div>
                    <h2 class="text-4xl font-black text-green-600 mb-2 font-[Bubblegum]">Animal Train</h2>
                    <p class="text-gray-600 mb-6 font-bold text-xl">Listen and place the animals in the train!</p>
                    <button (click)="startGame()" class="w-full py-4 font-[Bubblegum] bg-green-500 hover:bg-green-600 text-white text-3xl font-black rounded-2xl shadow-[0_8px_0_#16a34a] active:translate-y-2 active:shadow-none transition-all">
                        Start Game!
                    </button>
                </div>
            </div>
        } @else {
            <!-- Train Area -->
            <div class="relative w-full h-48 mb-8 flex items-end px-4 z-20" 
                 [style.transform]="trainMoving() ? 'translateX(120%)' : 'translateX(0)'"
                 style="transition: transform 3s ease-in-out;">
                
                <!-- Train Engine -->
                <div class="w-32 h-32 bg-red-500 rounded-tr-3xl rounded-tl-lg relative flex-shrink-0 border-4 border-gray-800 shadow-lg z-30">
                    <div class="absolute -top-10 left-4 w-8 h-12 bg-gray-700 rounded-t-lg"></div>
                    <div class="absolute top-4 right-4 w-12 h-12 bg-blue-200 rounded-lg border-2 border-gray-800"></div>
                    <div class="absolute -bottom-4 left-2 w-10 h-10 bg-gray-800 rounded-full border-4 border-gray-300"></div>
                    <div class="absolute -bottom-4 right-2 w-10 h-10 bg-gray-800 rounded-full border-4 border-gray-300"></div>
                </div>

                <!-- Link -->
                <div class="w-4 h-4 bg-gray-800 mb-4 flex-shrink-0"></div>

                <!-- Train Cars (Drop Zones) -->
                @for (car of cars(); track car.index) {
                    <div class="w-32 h-24 bg-yellow-400 rounded-lg border-4 border-gray-800 shadow-lg relative flex flex-col items-center justify-center flex-shrink-0"
                         [class.bg-green-400]="car.placedAnimal"
                         (dragover)="allowDrop($event)"
                         (drop)="onDrop($event, car.index)">
                        
                        @if (car.placedAnimal) {
                            @if (car.placedAnimal.imagePath) {
                                <img [src]="'assets/images/' + car.placedAnimal.imagePath" class="w-16 h-16 object-contain animate-[bounceIn_0.5s_ease-out]" />
                            } @else {
                                <div class="text-6xl animate-[bounceIn_0.5s_ease-out]">{{ car.placedAnimal.img }}</div>
                            }
                        } @else {
                            <div class="text-gray-600/50 text-4xl font-black">{{ car.index + 1 }}</div>
                            <div class="text-xs text-gray-700 font-bold mt-1 text-center opacity-60">
                                {{ car.targetAnimal.en }}
                            </div>
                        }

                        <div class="absolute -bottom-4 left-2 w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-300"></div>
                        <div class="absolute -bottom-4 right-2 w-8 h-8 bg-gray-800 rounded-full border-2 border-gray-300"></div>
                    </div>
                    @if (!$last) {
                        <div class="w-4 h-4 bg-gray-800 mb-4 flex-shrink-0"></div>
                    }
                }
            </div>

            <!-- Tracks -->
            <div class="absolute bottom-[170px] w-full h-2 bg-gray-800 z-10"></div>
            
            <!-- Draggable Animals Pool -->
            <div class="h-40 bg-white/60 backdrop-blur-md rounded-t-3xl border-t-4 border-white flex justify-evenly items-center px-4 w-full z-30">
                @for (animal of options(); track animal.en) {
                    @if (!isPlaced(animal)) {
                        <div class="cursor-grab active:cursor-grabbing hover:scale-110 transition-transform filter drop-shadow-md flex items-center justify-center w-20 h-20"
                             draggable="true"
                             (dragstart)="onDragStart($event, animal)"
                             (click)="playAnimalSound(animal)">
                            @if (animal.imagePath) {
                                <img [src]="'assets/images/' + animal.imagePath" class="w-16 h-16 object-contain pointer-events-none" />
                            } @else {
                                <span class="text-6xl">{{ animal.img }}</span>
                            }
                        </div>
                    } @else {
                        <div class="w-20 h-20 opacity-0 pointer-events-none"></div>
                    }
                }
            </div>
        }
    </div>
  `
})
export class TrainGameComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  gameState = signal<'start' | 'playing'>('start');
  score = signal(0);
  cars = signal<TrainCar[]>([]);
  options = signal<Animal[]>([]);
  trainMoving = signal(false);

  private draggedAnimal: Animal | null = null;
  private animalsPool: Animal[] = [];

  constructor() {
      // Find animals category
      const animalCat = this.data.extraCategories.find(c => c.id === 'animals');
      if (animalCat) {
          this.animalsPool = animalCat.items as Animal[];
      }
  }

  startGame() {
    this.score.set(0);
    this.gameState.set('playing');
    this.nextRound();
  }

  nextRound() {
    this.trainMoving.set(false);
    
    // Pick 3 target animals
    const shuffled = [...this.animalsPool].sort(() => 0.5 - Math.random());
    const targets = shuffled.slice(0, 3);
    
    this.cars.set([
        { index: 0, targetAnimal: targets[0], placedAnimal: null },
        { index: 1, targetAnimal: targets[1], placedAnimal: null },
        { index: 2, targetAnimal: targets[2], placedAnimal: null }
    ]);

    // Options: 3 targets + 2 distractors
    const distractors = shuffled.slice(3, 5);
    const roundOptions = [...targets, ...distractors].sort(() => 0.5 - Math.random());
    this.options.set(roundOptions);

    setTimeout(() => this.playSequenceAudio(), 500);
  }

  playSequenceAudio() {
      const targets = this.cars().map(c => c.targetAnimal.en);
      if (targets.length === 3) {
          this.audio.playSoundEffect('bell');
          setTimeout(() => this.audio.speak(targets[0], 'en-US'), 500);
          setTimeout(() => this.audio.speak(targets[1], 'en-US'), 1500);
          setTimeout(() => this.audio.speak(targets[2], 'en-US'), 2500);
      }
  }

  playAnimalSound(animal: Animal) {
      if (animal.soundEffect) {
          this.audio.playSoundEffect(animal.soundEffect as any);
      } else {
          this.audio.speak(animal.en, 'en-US');
      }
  }

  isPlaced(animal: Animal): boolean {
      return this.cars().some(c => c.placedAnimal?.en === animal.en);
  }

  onDragStart(e: DragEvent, animal: Animal) {
      this.draggedAnimal = animal;
      e.dataTransfer?.setData('text/plain', animal.en);
  }

  allowDrop(e: DragEvent) {
      e.preventDefault();
  }

  onDrop(e: DragEvent, carIndex: number) {
      e.preventDefault();
      if (!this.draggedAnimal) return;

      const carsArr = [...this.cars()];
      const car = carsArr.find(c => c.index === carIndex);
      
      if (car && !car.placedAnimal) {
          if (car.targetAnimal.en === this.draggedAnimal.en) {
              // Correct match for this specific car!
              car.placedAnimal = this.draggedAnimal;
              this.cars.set(carsArr);
              this.audio.playSoundEffect('bell');
              this.data.addStars(1);

              this.checkWinCondition();
          } else {
              // Wrong animal for this car
              this.audio.playSoundEffect('error');
          }
      }
      this.draggedAnimal = null;
  }

  checkWinCondition() {
      if (this.cars().every(c => c.placedAnimal !== null)) {
          this.score.update(s => s + 1);
          this.audio.speak('Excellent!', 'en-US');
          this.data.addStars(5);
          
          // Move train off screen
          setTimeout(() => {
              this.trainMoving.set(true);
              // Choo choo sound could be added here
              setTimeout(() => this.nextRound(), 3500);
          }, 1000);
      }
  }
}
