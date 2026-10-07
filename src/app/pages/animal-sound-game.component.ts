import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

interface AnimalSoundQuestion {
  target: { name: string; soundCue: string; voiceLine: string; image: string };
  options: { name: string; image: string }[];
}

@Component({
  selector: 'app-animal-sound-game',
  standalone: true,
  template: `
    <div class="relative w-full min-h-[580px] bg-gradient-to-b from-sky-100 via-indigo-50 to-purple-100 rounded-3xl p-6 flex flex-col justify-between select-none border-4 border-indigo-300 font-[Bubblegum]" dir="ltr">
      <!-- Top Header -->
      <div class="flex justify-between items-center bg-white/90 backdrop-blur px-6 py-3 rounded-2xl shadow-sm border-2 border-indigo-200">
        <div class="text-xl md:text-2xl font-black text-indigo-800 flex items-center gap-2">
          <span>🎧</span> Animal Sounds Detective
        </div>
        <div class="flex items-center gap-3">
          <div class="bg-indigo-100 text-indigo-900 px-4 py-1.5 rounded-full font-black text-lg border border-indigo-300">
            Score: {{ score() }} ⭐
          </div>
        </div>
      </div>

      @if (gameState() === 'start') {
        <div class="flex flex-col items-center justify-center text-center my-auto p-6">
          <div class="w-36 h-36 bg-indigo-200 rounded-3xl flex items-center justify-center shadow-lg border-4 border-indigo-400 mb-4 animate-bounce">
            <img src="assets/images/lion.png" class="w-24 h-24 object-contain" alt="Lion" />
          </div>
          <h2 class="text-4xl md:text-5xl font-black text-indigo-900 mb-2">Animal Sounds Detective 🦁🐶🦆</h2>
          <p class="text-indigo-800 text-lg md:text-xl font-bold max-w-md mb-6">
            Listen closely to the sound and description, then tap the animal who made it!
          </p>
          <button (click)="startGame()" class="px-10 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white text-2xl font-black rounded-3xl shadow-xl hover:scale-105 active:scale-95 transition-all">
            Start Listening! 🚀
          </button>
        </div>
      } @else if (gameState() === 'playing') {
        <div class="flex flex-col items-center justify-center my-auto w-full max-w-3xl mx-auto">
          <!-- Mystery Speaker Button -->
          <div class="flex flex-col items-center mb-8">
            <button (click)="playCurrentSound()"
                    class="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center text-6xl shadow-2xl hover:scale-110 active:scale-95 transition-transform border-4 border-white animate-pulse">
              🔊
            </button>
            <div class="mt-3 text-xl font-black text-indigo-900">Tap to hear again!</div>
            <div class="text-sm font-bold text-gray-500 italic">"{{ currentQuestion()?.target?.soundCue }}"</div>
          </div>

          <!-- 3 Animal Choices -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 w-full">
            @for (opt of currentQuestion()?.options; track opt.name) {
              <button (click)="chooseAnimal(opt)"
                      class="bg-white hover:bg-indigo-50 border-4 border-indigo-200 hover:border-indigo-500 rounded-3xl p-6 flex flex-col items-center shadow-lg hover:scale-105 active:scale-95 transition-all group">
                <img [src]="'assets/images/' + opt.image" class="w-28 h-28 object-contain mb-3 drop-shadow group-hover:scale-110 transition-transform" [alt]="opt.name" />
                <span class="text-2xl font-black text-indigo-950">{{ opt.name }}</span>
              </button>
            }
          </div>
        </div>
      } @else if (gameState() === 'won') {
        <div class="flex flex-col items-center justify-center text-center my-auto p-6">
          <div class="text-8xl mb-4 animate-bounce">🥇</div>
          <h2 class="text-4xl font-black text-green-700 mb-2">Detective Master! 🔍</h2>
          <p class="text-xl text-gray-700 font-bold mb-6">You recognized all animal sounds perfectly!</p>
          <button (click)="startGame()" class="px-8 py-3 bg-green-500 hover:bg-green-600 text-white text-xl font-black rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all">
            Play Again 🔄
          </button>
        </div>
      }

      @if (gameState() === 'playing') {
        <div class="text-center text-indigo-800 text-sm md:text-base font-bold pt-2 border-t border-indigo-200">
          Question {{ currentIndex + 1 }} of {{ questionsPool.length }}
        </div>
      }
    </div>
  `
})
export class AnimalSoundGameComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  gameState = signal<'start' | 'playing' | 'won'>('start');
  score = signal(0);
  currentIndex = 0;

  questionsPool: { name: string; soundCue: string; voiceLine: string; image: string; distractors: { name: string; image: string }[] }[] = [
    {
      name: 'Cat',
      soundCue: 'Meow, meow! I love milk.',
      voiceLine: 'Meow meow, I am a cute furry pet who loves to say meow and drink milk. Who am I?',
      image: 'cat.png',
      distractors: [{ name: 'Dog', image: 'dog.png' }, { name: 'Duck', image: 'duck.png' }]
    },
    {
      name: 'Dog',
      soundCue: 'Woof, woof! I wag my tail.',
      voiceLine: 'Woof woof! I am loyal, I wag my tail and bark happily. Who am I?',
      image: 'dog.png',
      distractors: [{ name: 'Lion', image: 'lion.png' }, { name: 'Rabbit', image: 'rabbit.png' }]
    },
    {
      name: 'Lion',
      soundCue: 'Roaaar! King of the jungle.',
      voiceLine: 'Roaaar! I have a big mane and I am the king of the jungle. Who am I?',
      image: 'lion.png',
      distractors: [{ name: 'Elephant', image: 'elephant.png' }, { name: 'Monkey', image: 'monkey.png' }]
    },
    {
      name: 'Duck',
      soundCue: 'Quack, quack! Swimming in the pond.',
      voiceLine: 'Quack quack! I swim in the pond and have yellow feathers. Who am I?',
      image: 'duck.png',
      distractors: [{ name: 'Bird', image: 'bird.png' }, { name: 'Frog', image: 'frog.png' }]
    },
    {
      name: 'Cow',
      soundCue: 'Mooo, mooo! I give delicious milk.',
      voiceLine: 'Mooo mooo! I live on the farm, eat green grass, and give fresh milk. Who am I?',
      image: 'cow.png',
      distractors: [{ name: 'Horse', image: 'horse.png' }, { name: 'Goat', image: 'goat.png' }]
    },
    {
      name: 'Bee',
      soundCue: 'Buzzzz, buzzzz! Making sweet honey.',
      voiceLine: 'Buzzzz buzzzz! I fly from flower to flower and make sweet honey. Who am I?',
      image: 'bee.png',
      distractors: [{ name: 'Butterfly', image: 'butterfly.png' }, { name: 'Ladybug', image: 'ladybug.png' }]
    },
    {
      name: 'Elephant',
      soundCue: 'Pawoo! I have a long trunk.',
      voiceLine: 'Pawoo! I am the largest land animal with big ears and a long trunk. Who am I?',
      image: 'elephant.png',
      distractors: [{ name: 'Hippo', image: 'hippo.png' }, { name: 'Giraffe', image: 'giraffe.png' }]
    },
    {
      name: 'Horse',
      soundCue: 'Neigh! Galloping fast.',
      voiceLine: 'Neigh! I have hooves, a soft mane, and I run very fast. Who am I?',
      image: 'horse.png',
      distractors: [{ name: 'Zebra', image: 'zebra.png' }, { name: 'Cow', image: 'cow.png' }]
    }
  ];

  currentQuestion = signal<AnimalSoundQuestion | null>(null);

  startGame() {
    this.score.set(0);
    this.currentIndex = 0;
    this.questionsPool.sort(() => Math.random() - 0.5);
    this.loadQuestion();
    this.gameState.set('playing');
  }

  loadQuestion() {
    if (this.currentIndex >= this.questionsPool.length) {
      this.currentQuestion.set(null);
      this.gameState.set('won');
      this.data.stars.update(s => s + 15);
      this.data.save();
      this.audio.playCelebration();
      return;
    }

    const item = this.questionsPool[this.currentIndex];
    const options = [
      { name: item.name, image: item.image },
      ...item.distractors
    ].sort(() => Math.random() - 0.5);

    this.currentQuestion.set({
      target: item,
      options
    });

    this.playCurrentSound();
  }

  playCurrentSound() {
    const q = this.currentQuestion();
    if (!q) return;
    this.audio.speak(q.target.voiceLine, 'en-US');
  }

  chooseAnimal(opt: { name: string; image: string }) {
    const q = this.currentQuestion();
    if (!q) return;

    if (opt.name === q.target.name) {
      this.audio.playSoundEffect('ding');
      this.audio.speak('Awesome! It is the ' + opt.name, 'en-US');
      this.score.update(s => s + 5);
      setTimeout(() => {
        this.currentIndex++;
        this.loadQuestion();
      }, 1200);
    } else {
      this.audio.playSoundEffect('buzz');
      this.audio.speak('Not quite, listen again!', 'en-US');
    }
  }
}
