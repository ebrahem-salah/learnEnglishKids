import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DataService } from '../services/data.service';
import { AudioService, AlphabetItem, WordItem } from '../services/audio.service';

interface LessonQuizQuestion {
  prompt: string;
  targetWord: WordItem;
  options: WordItem[];
  userAnswer?: WordItem;
  isCorrect?: boolean;
}

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="max-w-6xl mx-auto px-4 py-4" dir="rtl">
      
      <!-- هيدر قسم المسار والدروس -->
      <div class="bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-700 rounded-3xl p-6 md:p-8 text-white shadow-2xl mb-8 relative overflow-hidden border-4 border-indigo-300">
        <div class="absolute -top-10 -left-10 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
        <div class="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div class="text-right">
            <span class="inline-block bg-yellow-400 text-yellow-950 font-black px-4 py-1.5 rounded-full text-sm mb-3 shadow">
              🎓 منهج التعلم المتسلسل التفاعلي
            </span>
            <h1 class="text-3xl md:text-5xl font-black mb-2 flex items-center gap-3">
              <span>مسار إتقان الإنجليزية للأطفال</span>
              <span class="text-4xl">🚀</span>
            </h1>
            <p class="text-indigo-100 text-base md:text-lg font-bold max-w-2xl">
              شاهد فيديو الدرس، تعلّم الكلمات الست، ثم اجتز الاختبار بنجاح لفتح الحرف التالي وكسب النجوم!
            </p>
          </div>

          <div class="bg-white/15 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center min-w-[200px]">
            <div class="text-sm font-black text-indigo-200 mb-1">الدروس المكتملة</div>
            <div class="text-4xl font-black text-yellow-300 flex items-center justify-center gap-2">
              <span>{{ data.passedLessons().size }}</span>
              <span class="text-2xl text-white">/ 26</span>
            </div>
            <div class="w-full bg-white/20 h-2.5 rounded-full mt-3 overflow-hidden">
              <div class="bg-yellow-400 h-full rounded-full transition-all duration-500" [style.width.%]="(data.passedLessons().size / 26) * 100"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- مسار خريطة الدروس (Lessons Roadmap) -->
      @if (!currentLesson()) {
        <div class="mb-10">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl md:text-3xl font-black text-indigo-950 flex items-center gap-2">
              <span>🗺️</span>
              <span>خريطة الحروف والدروس (A ➡️ Z):</span>
            </h2>
            <span class="text-xs md:text-sm font-black text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
              🔒 كل درس يفتح بعد حل اختبار الدرس السابق
            </span>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            @for (item of data.alphabetData; track item.letter; let idx = $index) {
              @let unlocked = isLessonUnlocked(item.letter);
              @let passed = data.passedLessons().has(item.letter) && isNextUnlocked(idx);

              <div (click)="startLesson(item)"
                   class="relative p-5 rounded-3xl text-center border-4 transition-all duration-300 cursor-pointer shadow-md select-none group"
                   [ngClass]="{
                     'bg-white border-green-400 hover:shadow-xl hover:-translate-y-2': unlocked,
                     'bg-gray-100 border-gray-300 opacity-60 cursor-not-allowed': !unlocked
                   }">
                
                <!-- شارة الحالة: قفل أو علامة صح -->
                <div class="absolute top-2 left-2">
                  @if (!unlocked) {
                    <span class="bg-gray-300 text-gray-600 text-xs font-black p-1.5 rounded-full shadow-inner">🔒</span>
                  } @else if (passed) {
                    <span class="bg-green-500 text-white text-xs font-black px-2 py-0.5 rounded-full shadow">✓ مكتمل</span>
                  } @else {
                    <span class="bg-amber-400 text-amber-950 text-xs font-black px-2 py-0.5 rounded-full shadow animate-pulse">ابدأ الآن</span>
                  }
                </div>

                <div class="text-5xl font-black mb-1 mt-2 font-[Bubblegum]"
                     [ngClass]="unlocked ? 'text-indigo-600 group-hover:scale-110 transition-transform' : 'text-gray-400'">
                  {{ item.letter }}<span class="text-2xl text-pink-500 ml-1">{{ item.letter.toLowerCase() }}</span>
                </div>

                <div class="text-sm font-black text-gray-700 mb-2">
                  درس حرف ({{ item.ar_letter }})
                </div>

                <div class="text-xs font-bold text-gray-500 bg-gray-50 rounded-xl py-1 border border-gray-200">
                  {{ item.words.length }} كلمات وفيديو 📺
                </div>
              </div>
            }
          </div>
        </div>
      }

      <!-- واجهة الدرس المفتوح (مشاهدة الفيديو + استعراض الكلمات + الاختبار) -->
      @if (currentLesson(); as lesson) {
        <div class="bg-white rounded-3xl shadow-2xl border-4 border-indigo-200 p-6 md:p-8 mb-12">
          
          <!-- شريط أدوات الدرس -->
          <div class="flex items-center justify-between border-b-2 border-indigo-100 pb-4 mb-6">
            <button (click)="closeLesson()" class="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-2xl font-black text-sm shadow-sm transition-all">
              <span>⬅️</span>
              <span>العودة لخريطة الدروس</span>
            </button>

            <div class="flex items-center gap-3">
              <span class="text-3xl font-black text-indigo-600 font-[Bubblegum]">Lesson {{ lesson.letter }}</span>
              <button (click)="audio.playAudioFile('assets/audio/words/' + lesson.letter.toLowerCase() + '.mp3', lesson.letter)"
                      class="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 p-2.5 rounded-full shadow-sm">
                🔊
              </button>
            </div>
          </div>

          <!-- تبويبات الدرس: 1. الفيديو والمفردات  |  2. اختبار اجتياز الدرس -->
          <div class="flex justify-center gap-4 mb-8">
            <button (click)="activeTab.set('watch')"
                    class="px-6 py-3 rounded-2xl font-black text-base transition-all shadow"
                    [ngClass]="activeTab() === 'watch' ? 'bg-indigo-600 text-white scale-105' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'">
              📺 1. مشاهدة الفيديو والمفردات
            </button>
            <button (click)="openQuizTab()"
                    class="px-6 py-3 rounded-2xl font-black text-base transition-all shadow"
                    [ngClass]="activeTab() === 'quiz' ? 'bg-amber-500 text-white scale-105' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'">
              🎯 2. اختبار اجتياز الدرس ({{ quizScore() }} / {{ currentQuiz().length }})
            </button>
          </div>

          <!-- المحتوى الأول: فيديو يوتيوب + الكلمات الست -->
          @if (activeTab() === 'watch') {
            <div class="space-y-8">
              
              <!-- إطار فيديو يوتيوب الذكي -->
              <div class="max-w-3xl mx-auto rounded-3xl overflow-hidden shadow-xl border-4 border-indigo-200 bg-black aspect-video relative">
                @if (videoUrl()) {
                  <iframe [src]="videoUrl()"
                          class="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowfullscreen>
                  </iframe>
                } @else {
                  <div class="flex flex-col items-center justify-center h-full text-white p-6 text-center">
                    <span class="text-6xl mb-3">🎬</span>
                    <h3 class="text-xl font-black mb-2">فيديو ممتع لحرف {{ lesson.letter }}</h3>
                    <p class="text-sm text-gray-300">تعلّم نطق الكلمات الست بالصوت والصورة أدناه</p>
                  </div>
                }
              </div>

              <!-- الكلمات الست الخاصة بالحرف -->
              <div>
                <h3 class="text-2xl font-black text-gray-800 mb-4 text-center">
                  🌟 الكلمات الست الخاصة بدرس حرف ({{ lesson.letter }}):
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  @for (w of lesson.words; track w.word) {
                    <div class="bg-gradient-to-b from-indigo-50/50 to-purple-50/50 rounded-2xl p-4 text-center border-2 border-indigo-100 shadow-sm hover:shadow-md transition-all flex flex-col items-center">
                      <div class="w-16 h-16 flex items-center justify-center mb-2 bg-white rounded-xl shadow-inner overflow-hidden">
                        @if (w.imagePath) {
                          <img [src]="'assets/images/' + w.imagePath" class="w-12 h-12 object-contain" alt="" />
                        } @else {
                          <span class="text-3xl">{{ w.img }}</span>
                        }
                      </div>
                      <div class="text-lg font-black text-indigo-950 font-[Bubblegum]">{{ w.word }}</div>
                      <div class="text-xs font-bold text-gray-500 mb-2">{{ w.ar_word }}</div>
                      <button (click)="audio.playAudioFile('assets/audio/words/' + w.word.toLowerCase() + '.mp3', w.word)"
                              class="mt-auto bg-indigo-500 hover:bg-indigo-600 text-white w-full py-1 rounded-xl text-xs font-black shadow-sm">
                        🔊 استمع
                      </button>
                    </div>
                  }
                </div>
              </div>

              <!-- زر الانتقال للاختبار -->
              <div class="text-center pt-4">
                <button (click)="openQuizTab()" class="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3.5 rounded-full font-black text-xl shadow-xl hover:scale-105 transition-all">
                  جاهز للاختبار؟ اضغط هنا لحل كويز الدرس! 🚀
                </button>
              </div>
            </div>
          }

          <!-- المحتوى الثاني: كويز اجتياز الدرس (نظام إبراهيم عادل) -->
          @if (activeTab() === 'quiz') {
            <div class="max-w-2xl mx-auto">
              
              @if (!quizCompleted()) {
                <div class="bg-amber-50/60 rounded-3xl p-6 border-3 border-amber-200 text-center shadow-inner">
                  <div class="flex items-center justify-between text-xs font-black text-amber-900 mb-4 pb-2 border-b border-amber-200">
                    <span>السؤال {{ currentQuestionIndex() + 1 }} من {{ currentQuiz().length }}</span>
                    <span>النقاط: {{ quizScore() }} ⭐</span>
                  </div>

                  @if (currentQuestion(); as q) {
                    <h3 class="text-2xl font-black text-amber-950 mb-4">
                      {{ q.prompt }}
                    </h3>

                    <!-- زر سماع الكلمة -->
                    <button (click)="audio.playAudioFile('assets/audio/words/' + q.targetWord.word.toLowerCase() + '.mp3', q.targetWord.word)"
                            class="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-full font-black text-base shadow mb-6 inline-flex items-center gap-2">
                      <span>🔊 اسمع الكلمة</span>
                    </button>

                    <!-- خيارات الإجابة المصورة -->
                    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                      @for (opt of q.options; track opt.word) {
                        <button (click)="selectAnswer(opt)"
                                [disabled]="q.userAnswer !== undefined"
                                class="p-4 rounded-2xl border-3 font-black text-lg transition-all flex flex-col items-center justify-center gap-2 shadow-sm"
                                [ngClass]="{
                                  'bg-white border-amber-300 hover:border-amber-500 hover:scale-105': !q.userAnswer,
                                  'bg-green-100 border-green-500 text-green-900': q.userAnswer && opt.word === q.targetWord.word,
                                  'bg-red-100 border-red-400 text-red-900 opacity-60': q.userAnswer && q.userAnswer.word === opt.word && opt.word !== q.targetWord.word,
                                  'opacity-50': q.userAnswer && opt.word !== q.targetWord.word && q.userAnswer.word !== opt.word
                                }">
                          <div class="w-14 h-14 flex items-center justify-center bg-white rounded-xl shadow-inner">
                            @if (opt.imagePath) {
                              <img [src]="'assets/images/' + opt.imagePath" class="w-10 h-10 object-contain" alt="" />
                            } @else {
                              <span class="text-3xl">{{ opt.img }}</span>
                            }
                          </div>
                          <span>{{ opt.word }}</span>
                          <span class="text-xs text-gray-500">({{ opt.ar_word }})</span>
                        </button>
                      }
                    </div>

                    @if (q.userAnswer) {
                      <div class="mt-4">
                        @if (q.isCorrect) {
                          <div class="text-green-600 font-black text-lg mb-3">🎉 إجابة ممتازة وصحيحة! أحسنت!</div>
                        } @else {
                          <div class="text-rose-600 font-black text-lg mb-3">❌ إجابة خاطئة، الكلمة الصحيحة هي: {{ q.targetWord.word }}</div>
                        }
                        <button (click)="nextQuestion()" class="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-full font-black text-base shadow">
                          السؤال التالي ⬅️
                        </button>
                      </div>
                    }
                  }
                </div>
              } @else {
                <!-- شاشة انتهاء الاختبار -->
                <div class="bg-white rounded-3xl p-8 border-4 border-green-300 text-center shadow-xl">
                  @if (quizPassed()) {
                    <div class="text-7xl mb-4 animate-bounce">🏆</div>
                    <h3 class="text-3xl font-black text-green-700 mb-2">ألف مبروك يا بطل! لقد اجتزت الدرس بنجاح!</h3>
                    <p class="text-gray-600 font-bold mb-6">
                      حصلت على {{ quizScore() }} من {{ currentQuiz().length }} نجوم، وتم فك القفل عن الحرف والدرس التالي!
                    </p>
                    <div class="flex justify-center gap-4">
                      <button (click)="closeLesson()" class="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-full font-black text-lg shadow-lg hover:scale-105 transition-all">
                        متابعة خريطة الدروس 🗺️
                      </button>
                    </div>
                  } @else {
                    <div class="text-7xl mb-4">💪</div>
                    <h3 class="text-3xl font-black text-amber-700 mb-2">حاول مرة أخرى لتجتاز الدرس!</h3>
                    <p class="text-gray-600 font-bold mb-6">
                      حصلت على {{ quizScore() }} من {{ currentQuiz().length }}، شاهد الفيديو وركّز في الكلمات ثم أعد المحاولة!
                    </p>
                    <div class="flex justify-center gap-4">
                      <button (click)="retryQuiz()" class="bg-amber-500 hover:bg-amber-600 text-white px-8 py-3 rounded-full font-black text-lg shadow-lg hover:scale-105 transition-all">
                        إعادة الاختبار 🔄
                      </button>
                    </div>
                  }
                </div>
              }

            </div>
          }

        </div>
      }

    </div>
  `
})
export class LessonsComponent {
  data = inject(DataService);
  audio = inject(AudioService);
  sanitizer = inject(DomSanitizer);

  currentLesson = signal<AlphabetItem | null>(null);
  activeTab = signal<'watch' | 'quiz'>('watch');

  // Video YouTube map (safe educational videos for each letter)
  readonly youtubeVideos: Record<string, string> = {
    'A': 'ezmsrB59mj8',
    'B': 'WP1blVh1ZQM',
    'C': 'q9oFqU6x_cM',
    'D': 'yN3u0n2zP2I',
    'E': 'n9Tf2u44Nuo',
    'F': 'mG9kX57gC3c',
    'G': 'd99N4F_3N5g',
    'H': 'eQhW8s6w90U',
    'I': 'pBw7y2eUu1o',
    'J': 'mQv9T0bO084',
    'K': 'qR1b2n3m4k5',
    'L': 'vN3b8u7y6t5',
    'M': 'kL9p0o1i2u3',
    'N': 'wE4r5t6y7u8',
    'O': 'zX9c8v7b6n5',
    'P': 'yU8i7o6p5a4',
    'Q': 'sD4f5g6h7j8',
    'R': 'fG6h7j8k9l0',
    'S': 'xZ1c2v3b4n5',
    'T': 'aS2d3f4g5h6',
    'U': 'qW3e4r5t6y7',
    'V': 'zX4c5v6b7n8',
    'W': 'mN7b6v5c4x3',
    'X': 'lK8j7h6g5f4',
    'Y': 'pO9i8u7y6t5',
    'Z': 'wE1r2t3y4u5'
  };

  videoUrl = computed<SafeResourceUrl | null>(() => {
    const lesson = this.currentLesson();
    if (!lesson) return null;
    const id = this.youtubeVideos[lesson.letter] || this.youtubeVideos['A'];
    return this.sanitizer.bypassSecurityTrustResourceUrl(`https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`);
  });

  // Quiz state
  currentQuiz = signal<LessonQuizQuestion[]>([]);
  currentQuestionIndex = signal(0);
  quizScore = signal(0);
  quizCompleted = signal(false);

  currentQuestion = computed(() => {
    const list = this.currentQuiz();
    const idx = this.currentQuestionIndex();
    return list[idx] || null;
  });

  quizPassed = computed(() => {
    const total = this.currentQuiz().length;
    if (total === 0) return false;
    return this.quizScore() >= Math.ceil(total * 0.65); // 65% passing threshold
  });

  isLessonUnlocked(letter: string): boolean {
    const idx = this.data.alphabetData.findIndex(a => a.letter === letter);
    if (idx === 0) return true; // Letter A is always unlocked
    const prevLetter = this.data.alphabetData[idx - 1].letter;
    return this.data.passedLessons().has(prevLetter);
  }

  isNextUnlocked(idx: number): boolean {
    if (idx + 1 >= this.data.alphabetData.length) return true;
    const nextLetter = this.data.alphabetData[idx + 1].letter;
    return this.data.passedLessons().has(nextLetter);
  }

  startLesson(item: AlphabetItem) {
    if (!this.isLessonUnlocked(item.letter)) {
      alert('🔒 هذا الدرس مغلق! يجب حل اختبار الدرس السابق أولاً لفتحه كما في نظام الدروس.');
      return;
    }
    this.currentLesson.set(item);
    this.activeTab.set('watch');
    this.buildQuiz(item);
  }

  closeLesson() {
    this.currentLesson.set(null);
  }

  openQuizTab() {
    this.activeTab.set('quiz');
  }

  buildQuiz(item: AlphabetItem) {
    const questions: LessonQuizQuestion[] = [];
    const words = item.words;
    
    // Create 3 to 4 varied questions per lesson
    words.slice(0, 4).forEach((targetWord) => {
      // Pick 2 random distractor words from other letters
      const otherWords = this.data.alphabetData
        .filter(a => a.letter !== item.letter)
        .flatMap(a => a.words);
      const shuffledOthers = [...otherWords].sort(() => 0.5 - Math.random());
      const options = [targetWord, shuffledOthers[0], shuffledOthers[1]].sort(() => 0.5 - Math.random());

      questions.push({
        prompt: `أين هي صورة كلمة (${targetWord.word})؟`,
        targetWord,
        options
      });
    });

    this.currentQuiz.set(questions);
    this.currentQuestionIndex.set(0);
    this.quizScore.set(0);
    this.quizCompleted.set(false);
  }

  selectAnswer(selected: WordItem) {
    const q = this.currentQuestion();
    if (!q || q.userAnswer !== undefined) return;

    q.userAnswer = selected;
    q.isCorrect = selected.word === q.targetWord.word;

    if (q.isCorrect) {
      this.quizScore.update(s => s + 1);
      this.audio.playAudioFile('assets/audio/words/' + selected.word.toLowerCase() + '.mp3', selected.word);
    }
  }

  nextQuestion() {
    if (this.currentQuestionIndex() + 1 < this.currentQuiz().length) {
      this.currentQuestionIndex.update(i => i + 1);
    } else {
      this.quizCompleted.set(true);
      if (this.quizPassed()) {
        const lesson = this.currentLesson();
        if (lesson) {
          // Unlock this lesson in progress
          this.data.passedLessons.update(s => new Set(s).add(lesson.letter));
          // Reward stars
          this.data.addStars(5);
          this.data.save();
        }
      }
    }
  }

  retryQuiz() {
    const lesson = this.currentLesson();
    if (lesson) this.buildQuiz(lesson);
  }
}
