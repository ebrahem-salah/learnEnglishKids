import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';

interface SpeechChallenge {
  en: string;
  ar: string;
  image?: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Junior';
}

@Component({
  selector: 'app-speech-coach',
  standalone: true,
  template: `
    <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-rose-300 max-w-4xl mx-auto font-[Bubblegum]" dir="ltr">
      <!-- Header -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-2 animate-bounce">🎙️</div>
        <h2 class="text-3xl md:text-5xl font-black text-rose-600 mb-2">AI Speech & Pronunciation Coach</h2>
        <p class="text-gray-500 font-bold text-lg">Speak into your mic! Listen, repeat, and perfect your accent!</p>
      </div>

      <!-- Difficulty Selector -->
      <div class="flex justify-center gap-3 mb-8 flex-wrap">
        @for (diff of difficulties; track diff) {
          <button (click)="setDifficulty(diff)"
                  class="px-5 py-2 rounded-2xl font-black text-lg transition-all border-2"
                  [class]="selectedDifficulty() === diff ? 'bg-rose-500 text-white border-rose-600 shadow-lg scale-105' : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'">
            {{ diff }}
          </button>
        }
      </div>

      <!-- Main Practice Card -->
      <div class="bg-gradient-to-br from-rose-50 via-white to-pink-50 rounded-3xl p-6 md:p-10 border-4 border-rose-200 shadow-md text-center max-w-2xl mx-auto flex flex-col items-center">
        <!-- 3D Image or Category Badge -->
        <div class="inline-block bg-rose-100 text-rose-800 text-sm font-black px-4 py-1.5 rounded-full mb-4">
          {{ currentItem().category }}
        </div>

        @if (currentItem().image) {
          <img [src]="'assets/images/' + currentItem().image" class="w-36 h-36 object-contain drop-shadow-md mb-4" [alt]="currentItem().en" />
        }

        <!-- Target Phrase -->
        <h3 class="text-3xl md:text-5xl font-black text-rose-950 mb-2 tracking-wide">
          "{{ currentItem().en }}"
        </h3>
        <p class="text-xl font-bold text-gray-500 mb-6" dir="rtl">
          {{ currentItem().ar }}
        </p>

        <!-- Controls: Listen & Repeat -->
        <div class="flex items-center justify-center gap-4 mb-8">
          <button (click)="listenModel(false)" class="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-5 py-3 rounded-2xl font-black text-lg shadow-md hover:scale-105 active:scale-95 transition-all">
            <span>🔊</span> Normal
          </button>

          <button (click)="listenModel(true)" class="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-5 py-3 rounded-2xl font-black text-lg shadow-md hover:scale-105 active:scale-95 transition-all">
            <span>🐢</span> Slow
          </button>
        </div>

        <!-- Big Microphone Record Button -->
        <div class="relative flex flex-col items-center">
          <button (click)="toggleRecording()"
                  [disabled]="isAnalyzing()"
                  class="w-24 h-24 rounded-full flex items-center justify-center text-4xl shadow-2xl transition-all border-4 border-white hover:scale-110 active:scale-95"
                  [class]="isRecording() ? 'bg-red-500 text-white animate-ping ring-8 ring-red-200' : 'bg-gradient-to-br from-rose-500 to-red-600 text-white'">
            🎙️
          </button>
          <span class="mt-3 text-lg font-black text-rose-900">
            {{ isRecording() ? 'Listening... Speak now!' : 'Tap mic and speak!' }}
          </span>
        </div>

        <!-- Feedback Result Message -->
        @if (feedback()) {
          <div class="mt-6 w-full p-4 rounded-2xl border-2 text-center animate-bounce shadow-md"
               [class]="feedback()!.success ? 'bg-green-100 border-green-400 text-green-800' : 'bg-amber-100 border-amber-400 text-amber-800'">
            <div class="text-3xl mb-1">{{ feedback()!.icon }}</div>
            <div class="text-2xl font-black">{{ feedback()!.message }}</div>
            @if (feedback()!.heard) {
              <div class="text-sm font-bold text-gray-600 mt-1">We heard: "{{ feedback()!.heard }}"</div>
            }
          </div>
        }
      </div>

      <!-- Next & Shuffle Buttons -->
      <div class="flex justify-between items-center mt-8 pt-4 border-t-2 border-rose-100">
        <button (click)="prevItem()" class="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-2.5 rounded-2xl font-black text-lg transition-transform active:scale-95">
          ⬅️ Previous
        </button>

        <div class="text-rose-700 font-black text-lg">
          {{ currentIndex + 1 }} / {{ filteredChallenges().length }}
        </div>

        <button (click)="nextItem()" class="bg-rose-600 hover:bg-rose-700 text-white px-6 py-2.5 rounded-2xl font-black text-lg shadow-md hover:scale-105 active:scale-95 transition-all">
          Next Word ➡️
        </button>
      </div>
    </div>
  `
})
export class SpeechCoachComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  difficulties: ('Easy' | 'Medium' | 'Junior')[] = ['Easy', 'Medium', 'Junior'];
  selectedDifficulty = signal<'Easy' | 'Medium' | 'Junior'>('Easy');

  challenges: SpeechChallenge[] = [
    // Easy (Single Words for Kids)
    { en: 'Apple', ar: 'تفاحة', image: 'apple.png', category: 'Fruits', difficulty: 'Easy' },
    { en: 'Lion', ar: 'أسد', image: 'lion.png', category: 'Animals', difficulty: 'Easy' },
    { en: 'Cat', ar: 'قطة', image: 'cat.png', category: 'Animals', difficulty: 'Easy' },
    { en: 'Dog', ar: 'كلب', image: 'dog.png', category: 'Animals', difficulty: 'Easy' },
    { en: 'Sun', ar: 'شمس', image: 'sun.png', category: 'Nature', difficulty: 'Easy' },
    { en: 'Moon', ar: 'قمر', image: 'moon.png', category: 'Nature', difficulty: 'Easy' },
    { en: 'Star', ar: 'نجمة', image: 'star.png', category: 'Nature', difficulty: 'Easy' },
    { en: 'Car', ar: 'سيارة', image: 'car.png', category: 'Vehicles', difficulty: 'Easy' },

    // Medium (Short Expressions & Phonics)
    { en: 'Good morning', ar: 'صباح الخير', category: 'Greetings', difficulty: 'Medium' },
    { en: 'Thank you', ar: 'شكراً لك', category: 'Manners', difficulty: 'Medium' },
    { en: 'I love my family', ar: 'أنا أحب عائلتي', category: 'Feelings', difficulty: 'Medium' },
    { en: 'How are you?', ar: 'كيف حالك؟', category: 'Questions', difficulty: 'Medium' },
    { en: 'See you later', ar: 'أراك لاحقاً', category: 'Greetings', difficulty: 'Medium' },
    { en: 'Can I play?', ar: 'هل يمكنني اللعب؟', category: 'Social', difficulty: 'Medium' },

    // Junior (Conversations for Teens & Adults)
    { en: 'Nice to meet you', ar: 'سعيد بلقائك', category: 'Introductions', difficulty: 'Junior' },
    { en: 'Where is the restaurant?', ar: 'أين المطعم؟', category: 'Travel & Direction', difficulty: 'Junior' },
    { en: 'I would like some water', ar: 'أرغب في بعض الماء من فضلك', category: 'Dining', difficulty: 'Junior' },
    { en: 'How much does this cost?', ar: 'كم تكلفة هذا الشيء؟', category: 'Shopping', difficulty: 'Junior' },
    { en: 'Learning English is exciting', ar: 'تعلم الإنجليزية شيء حماسي وممتع', category: 'Education', difficulty: 'Junior' },
    { en: 'Have a wonderful day', ar: 'أتمنى لك يوماً رائعاً', category: 'Polite Phrases', difficulty: 'Junior' }
  ];

  filteredChallenges = signal<SpeechChallenge[]>([]);
  currentIndex = 0;
  currentItem = signal<SpeechChallenge>(this.challenges[0]);

  isRecording = signal(false);
  isAnalyzing = signal(false);
  feedback = signal<{ success: boolean; icon: string; message: string; heard?: string } | null>(null);

  constructor() {
    this.updateFilter();
  }

  setDifficulty(d: 'Easy' | 'Medium' | 'Junior') {
    this.selectedDifficulty.set(d);
    this.updateFilter();
  }

  updateFilter() {
    const filtered = this.challenges.filter(c => c.difficulty === this.selectedDifficulty());
    this.filteredChallenges.set(filtered);
    this.currentIndex = 0;
    this.currentItem.set(filtered[0] || this.challenges[0]);
    this.feedback.set(null);
  }

  listenModel(slow: boolean) {
    const text = this.currentItem().en;
    if (slow) {
      this.audio.speakSlow(text, 'en-US');
    } else {
      this.audio.speak(text, 'en-US');
    }
  }

  nextItem() {
    const list = this.filteredChallenges();
    this.currentIndex = (this.currentIndex + 1) % list.length;
    this.currentItem.set(list[this.currentIndex]);
    this.feedback.set(null);
    this.listenModel(false);
  }

  prevItem() {
    const list = this.filteredChallenges();
    this.currentIndex = (this.currentIndex - 1 + list.length) % list.length;
    this.currentItem.set(list[this.currentIndex]);
    this.feedback.set(null);
    this.listenModel(false);
  }

  async toggleRecording() {
    if (this.isRecording()) return;

    this.isRecording.set(true);
    this.feedback.set(null);

    const target = this.currentItem().en;
    const recognized = await this.audio.listenForWord(target);

    this.isRecording.set(false);

    if (recognized) {
      this.audio.playSoundEffect('ding');
      this.data.stars.update(s => s + 5);
      this.data.save();
      this.feedback.set({
        success: true,
        icon: '🌟 Perfect Pronunciation!',
        message: 'Awesome accent! You earned +5 Stars!'
      });
    } else {
      this.audio.playSoundEffect('buzz');
      this.feedback.set({
        success: false,
        icon: '💡 Almost there!',
        message: 'Tap the 🐢 Slow button and listen closely, then try again!'
      });
    }
  }
}
