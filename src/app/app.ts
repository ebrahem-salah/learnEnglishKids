import { Component, signal, ChangeDetectionStrategy, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';

interface WordItem { word: string; ar_word: string; img: string; realImg?: string; sound?: string; category?: string; }
interface AlphabetItem { letter: string; ar_letter: string; words: WordItem[]; }
interface Quiz { idx: number; score: number; answered: string | null; done: boolean; word: WordItem; answer: string; options: string[]; type: 'letter' | 'word'; }
interface MemoryCard { id: number; letter: string; img: string; word: string; flipped: boolean; matched: boolean; }
interface Sticker { id: string; name: string; img: string; cost: number; unlocked: boolean; }
interface Song { title: string; ar_title: string; lyrics: string; icon: string; audioText: string; }
interface Phrase { en: string; ar: string; context: string; icon: string; }
interface ShortStory { title: string; ar_title: string; icon: string; pages: { en: string; ar: string; img: string }[]; }

interface ExtraCategory {
  id: string;
  title: string;
  icon: string;
  items: { en: string; ar: string; img: string; realImg?: string; soundEffect?: string }[];
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- صورة عالمية دقيقة عالية الجودة (Twemoji SVG + HD Photo support) -->
    <ng-template #pic let-e let-hd="hd" let-cls="cls">
      @if (hd) {
        <img [src]="hd" alt="" loading="lazy" [class]="cls + ' object-cover rounded-2xl shadow-sm'" (error)="markFailed(e)" />
      } @else if (!failed().has(e)) {
        <img [src]="imgUrl(e)" (error)="markFailed(e)" alt="" loading="lazy" [class]="cls" />
      } @else {
        <span class="text-6xl select-none">{{ e }}</span>
      }
    </ng-template>

    <div class="min-h-screen p-3 md:p-6 font-sans pb-24" dir="rtl">
      <div class="max-w-7xl mx-auto">

        <!-- الهيدر والتحكم الرئيسي والشخصية التفاعلية -->
        <header class="text-center py-6 mb-8 bg-white/95 backdrop-blur-md rounded-3xl shadow-xl border-4 border-blue-200 relative overflow-hidden">
          <div class="flex items-center justify-center gap-3 mb-2">
            <span class="text-5xl animate-bounce">🎨</span>
            <h1 class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-pink-500 to-purple-600">
              أكاديمية الإنجليزية للأبطال الصغار 🚀
            </h1>
            <span class="text-5xl animate-bounce">⭐</span>
          </div>

          <!-- شخصية الأرنب المشجع التفاعلي Mascot -->
          <div class="flex items-center justify-center gap-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 py-3 px-6 rounded-2xl max-w-xl mx-auto mb-4 border border-pink-200 shadow-sm cursor-pointer hover:scale-105 transition-all" (click)="speakMascot()">
            <span class="text-5xl animate-pulse">🐰</span>
            <div class="text-right">
              <div class="text-xs font-black text-pink-500">صديقك الأرنب "باني":</div>
              <div class="text-base md:text-lg font-black text-purple-900">{{ mascotSpeech() }}</div>
            </div>
          </div>

          <!-- شريط الإنجاز والمكافآت -->
          <div class="max-w-md mx-auto px-6 mb-5">
            <div class="flex justify-between text-base font-black text-gray-700 mb-1">
              <span>📚 المستكشف: {{ learned().size }} / 26</span>
              <span class="text-yellow-600 font-extrabold text-lg flex items-center gap-1">
                🏆 النجوم: {{ stars() }} ⭐
              </span>
            </div>
            <div class="h-4 bg-gray-200 rounded-full overflow-hidden shadow-inner p-0.5">
              <div class="h-full bg-gradient-to-r from-green-400 via-teal-400 to-blue-500 rounded-full transition-all duration-700 shadow" [style.width.%]="(learned().size / 26) * 100"></div>
            </div>
          </div>

          <!-- قائمة التبديل الشاملة للأقسام الفائقة -->
          <div class="flex flex-wrap justify-center gap-2 md:gap-3 px-4">
            <button (click)="activeTab.set('alphabet')" [class]="activeTab() === 'alphabet' ? 'bg-blue-600 text-white scale-105 shadow-lg' : 'bg-blue-100 text-blue-800 hover:bg-blue-200'" class="px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-blue-300">
              🔤 الحروف والكلمات
            </button>

            <button (click)="activeTab.set('tracing')" [class]="activeTab() === 'tracing' ? 'bg-amber-600 text-white scale-105 shadow-lg' : 'bg-amber-100 text-amber-800 hover:bg-amber-200'" class="px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-amber-300">
              ✏️ سبورة الكتابة
            </button>

            <button (click)="activeTab.set('phrases')" [class]="activeTab() === 'phrases' ? 'bg-teal-600 text-white scale-105 shadow-lg' : 'bg-teal-100 text-teal-800 hover:bg-teal-200'" class="px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-teal-300">
              💬 المحادثات والجمل
            </button>

            <button (click)="activeTab.set('stories')" [class]="activeTab() === 'stories' ? 'bg-purple-600 text-white scale-105 shadow-lg' : 'bg-purple-100 text-purple-800 hover:bg-purple-200'" class="px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-purple-300">
              📖 القصص المصورة
            </button>

            <button (click)="activeTab.set('numbers')" [class]="activeTab() === 'numbers' ? 'bg-emerald-600 text-white scale-105 shadow-lg' : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'" class="px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-emerald-300">
              🔢 الأرقام (1-10)
            </button>

            <button (click)="activeTab.set('categories')" [class]="activeTab() === 'categories' ? 'bg-indigo-600 text-white scale-105 shadow-lg' : 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200'" class="px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-indigo-300">
              🦁 أصوات وصور واقعية
            </button>

            <button (click)="activeTab.set('songs')" [class]="activeTab() === 'songs' ? 'bg-rose-600 text-white scale-105 shadow-lg' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'" class="px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-rose-300">
              🎵 الأغاني التعليمية
            </button>

            <button (click)="activeTab.set('stickers')" [class]="activeTab() === 'stickers' ? 'bg-yellow-600 text-white scale-105 shadow-lg' : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'" class="px-4 py-2 rounded-full font-black transition-all text-sm md:text-base border-2 border-yellow-300">
              🖼️ ألبوم الجوائز
            </button>

            <button (click)="startQuiz('letter')" class="bg-pink-500 text-white px-4 py-2 rounded-full font-black hover:bg-pink-600 hover:scale-105 transition-all shadow-md text-sm md:text-base">
              🎮 اختبار الحروف
            </button>

            <button (click)="startQuiz('word')" class="bg-purple-500 text-white px-4 py-2 rounded-full font-black hover:bg-purple-600 hover:scale-105 transition-all shadow-md text-sm md:text-base">
              🧩 اختبار الصور
            </button>

            <button (click)="startMemoryGame()" class="bg-orange-500 text-white px-4 py-2 rounded-full font-black hover:bg-orange-600 hover:scale-105 transition-all shadow-md text-sm md:text-base">
              🃏 لعبة الذاكرة
            </button>

            <button (click)="slow.set(!slow())" class="bg-white border-2 border-blue-400 text-blue-700 px-4 py-2 rounded-full font-black hover:bg-blue-50 transition-all shadow-sm text-sm">
              {{ slow() ? '🐢 نطق بطيء' : '🐇 نطق عادي' }}
            </button>
          </div>
        </header>

        <!-- 1. الشاشة الرئيسية: الحروف الإنجليزية -->
        @if (activeTab() === 'alphabet') {
          <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            @for (item of alphabetData; track item.letter; let i = $index) {
              <div (click)="selectLetter(item)"
                class="bg-white rounded-3xl p-5 flex flex-col items-center cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all border-b-8 group relative overflow-hidden"
                [class]="learned().has(item.letter) ? 'border-green-400 bg-green-50/30' : 'border-blue-200 hover:border-blue-400'">
                
                @if (learned().has(item.letter)) {
                  <span class="absolute top-2 right-3 text-green-500 font-black text-xl bg-green-100 rounded-full w-7 h-7 flex items-center justify-center border border-green-300">✓</span>
                }
                
                <div class="text-6xl font-black mb-1 transition-transform group-hover:scale-110 drop-shadow-sm" [class]="colors[i % colors.length]">
                  {{ item.letter }}<span class="text-3xl text-gray-400 font-bold ml-1">{{ item.letter.toLowerCase() }}</span>
                </div>
                
                <div class="h-16 flex items-center justify-center my-1">
                  <ng-container *ngTemplateOutlet="pic; context: { $implicit: item.words[0].img, hd: item.words[0].realImg, cls: 'w-14 h-14 group-hover:scale-125 transition-transform drop-shadow' }" />
                </div>
                
                <div class="text-xs font-black text-blue-700 bg-blue-100/80 px-3 py-1 rounded-full mt-2 border border-blue-200">
                  {{ item.words.length }} كلمات 🌟
                </div>
              </div>
            }
          </div>
        }

        <!-- 2. قسم المحادثات والجمل اليومية Daily Conversations -->
        @if (activeTab() === 'phrases') {
          <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-teal-300 max-w-5xl mx-auto">
            <h2 class="text-3xl font-black text-teal-700 mb-2 text-center">💬 الجمل والمحادثات اليومية (Daily Expressions)</h2>
            <p class="text-gray-600 font-bold mb-6 text-center">تعلم كيف تتحدث وتتواصل باللغة الإنجليزية في المواقف المختلفة!</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              @for (ph of phrasesData; track ph.en) {
                <div (click)="speak(ph.en, 'en-US')" class="bg-teal-50/80 border-2 border-teal-200 rounded-3xl p-5 hover:bg-teal-100/70 hover:shadow-lg transition-all cursor-pointer flex items-center gap-4 group">
                  <span class="text-5xl group-hover:scale-110 transition-transform">{{ ph.icon }}</span>
                  <div class="flex-1">
                    <span class="text-xs font-black text-teal-600 bg-teal-200/80 px-3 py-0.5 rounded-full inline-block mb-1">{{ ph.context }}</span>
                    <h3 class="text-2xl font-black text-teal-900 mb-1">{{ ph.en }}</h3>
                    <p class="text-lg font-bold text-gray-600">{{ ph.ar }}</p>
                  </div>
                  <button class="bg-teal-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-black text-xl hover:scale-110 shadow">🔊</button>
                </div>
              }
            </div>
          </div>
        }

        <!-- 3. قسم القصص المصورة القيرة Short Stories -->
        @if (activeTab() === 'stories') {
          <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-purple-300 max-w-4xl mx-auto">
            <h2 class="text-3xl font-black text-purple-700 mb-2 text-center">📖 القصص التفاعلية القصيرة (Short Stories)</h2>
            <p class="text-gray-600 font-bold mb-6 text-center">اقرأ واستمع للقصص المشوقة وتعلّم كلمات جديدة!</p>
            
            <div class="space-y-6">
              @for (story of storiesData; track story.title) {
                <div class="bg-purple-50/80 border-2 border-purple-200 rounded-3xl p-6 shadow-sm">
                  <div class="flex items-center gap-3 mb-4">
                    <span class="text-4xl">{{ story.icon }}</span>
                    <div>
                      <h3 class="text-2xl font-black text-purple-900">{{ story.title }}</h3>
                      <p class="text-base font-bold text-purple-600">{{ story.ar_title }}</p>
                    </div>
                  </div>
                  
                  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    @for (page of story.pages; track page.en) {
                      <div (click)="speak(page.en, 'en-US')" class="bg-white p-4 rounded-2xl border border-purple-100 shadow text-center hover:scale-105 transition-all cursor-pointer">
                        <div class="h-24 flex items-center justify-center mb-2">
                          <ng-container *ngTemplateOutlet="pic; context: { $implicit: page.img, cls: 'w-20 h-20 drop-shadow' }" />
                        </div>
                        <div class="font-black text-purple-800 text-sm mb-1">{{ page.en }}</div>
                        <div class="text-xs font-bold text-gray-500">{{ page.ar }}</div>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
          </div>
        }

        <!-- 4. قسم سبورة كتابة الحرف التفاعلية (Tracing Board) -->
        @if (activeTab() === 'tracing') {
          <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-amber-300 text-center max-w-4xl mx-auto">
            <h2 class="text-3xl font-black text-amber-700 mb-2">✏️ السبورة التفاعلية: تتبع واكتب الحرف</h2>
            <p class="text-gray-600 font-bold mb-4">اختر حرفاً، وتتبع الرسم بأصبعك أو بالفأرة داخل السبورة!</p>
            
            <div class="flex flex-wrap justify-center gap-2 mb-6 max-h-36 overflow-y-auto p-2 bg-amber-50 rounded-2xl border border-amber-200">
              @for (a of alphabetData; track a.letter) {
                <button (click)="setTracingLetter(a.letter)"
                  class="w-10 h-10 rounded-xl font-black text-xl transition-all shadow-sm"
                  [class]="tracingLetter() === a.letter ? 'bg-amber-500 text-white scale-110 shadow-md' : 'bg-white text-gray-700 hover:bg-amber-100'">
                  {{ a.letter }}
                </button>
              }
            </div>

            <div class="flex flex-col md:flex-row items-center justify-center gap-6">
              <div class="bg-amber-100/60 p-6 rounded-3xl border-2 border-amber-200 text-center w-full md:w-64">
                <div class="text-8xl font-black text-amber-600 mb-2">{{ tracingLetter() }}<span class="text-5xl text-amber-400">{{ tracingLetter().toLowerCase() }}</span></div>
                <button (click)="speak(tracingLetter(), 'en-US')" class="bg-amber-500 text-white px-5 py-2 rounded-full font-black hover:bg-amber-600 shadow-md mb-2 w-full">
                  🔊 اسمع الحرف
                </button>
              </div>

              <div class="relative bg-amber-50 rounded-3xl border-4 border-dashed border-amber-400 p-2 shadow-inner">
                <canvas #tracingCanvas width="320" height="320" class="bg-white rounded-2xl cursor-crosshair touch-none shadow"></canvas>
                
                <div class="flex justify-between items-center mt-4 px-2">
                  <div class="flex gap-2">
                    <button (click)="setPenColor('#ef4444')" class="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow hover:scale-110"></button>
                    <button (click)="setPenColor('#3b82f6')" class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow hover:scale-110"></button>
                    <button (click)="setPenColor('#10b981')" class="w-8 h-8 rounded-full bg-green-500 border-2 border-white shadow hover:scale-110"></button>
                    <button (click)="setPenColor('#8b5cf6')" class="w-8 h-8 rounded-full bg-purple-500 border-2 border-white shadow hover:scale-110"></button>
                  </div>
                  <button (click)="clearTracingCanvas()" class="bg-red-500 text-white px-4 py-1.5 rounded-full font-black hover:bg-red-600 shadow text-sm">
                    🗑️ مسح السبورة
                  </button>
                </div>
              </div>
            </div>
          </div>
        }

        <!-- 5. قسم الأرقام 1-10 -->
        @if (activeTab() === 'numbers') {
          <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            @for (num of numbersData; track num.num) {
              <div (click)="playNumber(num)" class="bg-white rounded-3xl p-6 text-center shadow-lg border-b-8 border-emerald-400 hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group">
                <div class="text-7xl font-black text-emerald-600 mb-2 group-hover:scale-110 transition-transform">{{ num.num }}</div>
                <div class="text-2xl font-black text-gray-700 mb-1">{{ num.en }}</div>
                <div class="text-lg font-bold text-gray-500 mb-3">{{ num.ar }}</div>
                <div class="flex justify-center gap-1 flex-wrap bg-emerald-50 p-3 rounded-2xl border border-emerald-100">
                  @for (i of countArray(num.num); track $index) {
                    <ng-container *ngTemplateOutlet="pic; context: { $implicit: num.icon, cls: 'w-8 h-8 drop-shadow' }" />
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- 6. قسم الألوان والحيوانات مع المؤثرات الصوتية الحقيقية والصور الواقعية -->
        @if (activeTab() === 'categories') {
          <div class="space-y-8">
            @for (cat of extraCategories; track cat.id) {
              <div class="bg-white rounded-3xl p-6 shadow-xl border-4 border-indigo-100">
                <h3 class="text-2xl font-black text-indigo-700 mb-4 flex items-center gap-2">
                  <span>{{ cat.icon }}</span> {{ cat.title }}
                </h3>
                <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  @for (item of cat.items; track item.en) {
                    <div (click)="playCategoryItem(item)" class="bg-indigo-50/60 rounded-2xl p-4 text-center border-2 border-indigo-200 hover:border-indigo-400 hover:shadow-md cursor-pointer transition-all group">
                      <div class="h-24 flex items-center justify-center mb-2 overflow-hidden rounded-xl">
                        <ng-container *ngTemplateOutlet="pic; context: { $implicit: item.img, hd: item.realImg, cls: 'w-20 h-20 group-hover:scale-115 transition-transform drop-shadow' }" />
                      </div>
                      <div class="text-xl font-black text-indigo-900">{{ item.en }}</div>
                      <div class="text-sm font-bold text-gray-600">{{ item.ar }}</div>
                      @if (item.soundEffect) {
                        <span class="text-xs bg-indigo-200 text-indigo-800 font-bold px-2 py-0.5 rounded-full mt-1 inline-block">🔊 صوت حقيقي</span>
                      }
                    </div>
                  }
                </div>
              </div>
            }
          </div>
        }

        <!-- 7. قسم الأغاني التعليمية Phonics & Songs -->
        @if (activeTab() === 'songs') {
          <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-rose-200 max-w-4xl mx-auto">
            <h2 class="text-3xl font-black text-rose-600 mb-2 text-center">🎵 الأغاني والأناشيد التعليمية للأطفال</h2>
            <p class="text-gray-600 font-bold mb-6 text-center">اضغط على أي أغنية للاستماع إلى كلماتها ونطقها!</p>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              @for (song of songsData; track song.title) {
                <div class="bg-rose-50/70 border-2 border-rose-200 rounded-3xl p-6 flex flex-col justify-between hover:shadow-lg transition-all">
                  <div>
                    <div class="flex items-center gap-3 mb-3">
                      <span class="text-4xl">{{ song.icon }}</span>
                      <div>
                        <h3 class="text-xl font-black text-rose-800">{{ song.title }}</h3>
                        <p class="text-sm font-bold text-gray-600">{{ song.ar_title }}</p>
                      </div>
                    </div>
                    <div class="bg-white p-4 rounded-2xl border border-rose-100 text-gray-700 font-bold text-sm leading-relaxed whitespace-pre-line mb-4 shadow-inner">
                      {{ song.lyrics }}
                    </div>
                  </div>
                  <button (click)="speak(song.audioText, 'en-US')" class="bg-rose-500 text-white py-3 rounded-full font-black hover:bg-rose-600 shadow transition-all">
                    ▶️ تشغيل وتغني بالأغنية
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- 8. قسم ألبوم الملصقات والجوائز (Sticker Album) -->
        @if (activeTab() === 'stickers') {
          <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-yellow-300 max-w-5xl mx-auto text-center">
            <div class="flex justify-between items-center mb-6 bg-yellow-50 p-4 rounded-2xl border border-yellow-200">
              <h2 class="text-2xl md:text-3xl font-black text-yellow-800">🖼️ ألبوم ملصقات البطل</h2>
              <div class="text-xl font-black text-amber-700 bg-white px-4 py-2 rounded-full border border-yellow-300 shadow-sm">
                ⭐ رصيدك: {{ stars() }} نجمة
              </div>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
              @for (st of stickersData(); track st.id) {
                <div class="rounded-3xl p-5 border-4 flex flex-col items-center justify-between transition-all"
                  [class]="st.unlocked ? 'bg-amber-50 border-yellow-400 shadow-md' : 'bg-gray-100 border-gray-300 opacity-75'">
                  <div class="h-24 flex items-center justify-center my-2">
                    @if (st.unlocked) {
                      <ng-container *ngTemplateOutlet="pic; context: { $implicit: st.img, cls: 'w-20 h-20 drop-shadow-lg animate-bounce' }" />
                    } @else {
                      <span class="text-6xl text-gray-400 select-none">🔒</span>
                    }
                  </div>
                  <div class="font-black text-gray-800 text-lg mb-2">{{ st.name }}</div>
                  @if (st.unlocked) {
                    <span class="bg-green-500 text-white font-black text-xs px-3 py-1 rounded-full">مفتوح 🎉</span>
                  } @else {
                    <button (click)="unlockSticker(st)" class="bg-yellow-500 text-white font-black text-sm px-4 py-2 rounded-full hover:bg-yellow-600 shadow-md transition-all">
                      فتح بـ {{ st.cost }} ⭐
                    </button>
                  }
                </div>
              }
            </div>
          </div>
        }

        <!-- النافذة المنبثقة لتفاصيل الحرف والكلمات -->
        @if (selectedLetter(); as selected) {
          <div class="fixed inset-0 bg-black/70 flex items-start justify-center p-4 z-50 backdrop-blur-md overflow-y-auto" (click)="closeModal()">
            <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-5xl relative shadow-2xl my-4 md:my-8 border-4 border-blue-300" (click)="$event.stopPropagation()">
              <button (click)="closeModal()" class="absolute top-4 left-4 w-12 h-12 bg-red-100 text-red-600 rounded-full hover:bg-red-500 hover:text-white transition-colors text-2xl font-black shadow-md">✕</button>

              <div class="text-center bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-3xl mb-8 border-2 border-blue-200 shadow-inner">
                <div class="flex items-center justify-center gap-6 md:gap-12">
                  <button (click)="step(-1)" class="w-14 h-14 rounded-full bg-white shadow-lg text-3xl font-black hover:bg-blue-100 text-blue-600 hover:scale-110 transition-all border border-blue-200">‹</button>
                  <div>
                    <div class="text-7xl md:text-9xl font-black text-blue-600 tracking-tight drop-shadow">
                      {{ selected.letter }}<span class="text-5xl md:text-7xl text-pink-500">{{ selected.letter.toLowerCase() }}</span>
                    </div>
                    <div class="text-2xl font-black text-gray-700 mt-2">النطق العربي: <span class="text-purple-600 font-extrabold">{{ selected.ar_letter }}</span></div>
                  </div>
                  <button (click)="step(1)" class="w-14 h-14 rounded-full bg-white shadow-lg text-3xl font-black hover:bg-blue-100 text-blue-600 hover:scale-110 transition-all border border-blue-200">›</button>
                </div>
                <div class="mt-4 flex justify-center gap-3 flex-wrap">
                  <button (click)="playLetter(selected)" [class.animate-pulse]="playing() === 'L' + selected.letter"
                    class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-8 py-3.5 rounded-full text-xl font-black hover:from-blue-600 hover:to-indigo-700 hover:scale-105 transition-all shadow-lg border-2 border-white">
                    🔊 استمع إلى الحرف والنطق
                  </button>
                  <button (click)="openTracingModal(selected.letter)" class="bg-amber-500 text-white px-6 py-3.5 rounded-full text-xl font-black hover:bg-amber-600 shadow-lg border-2 border-white">
                    ✏️ تعلم كتابته
                  </button>
                </div>
              </div>

              <div class="mb-4 text-2xl font-black text-gray-800 border-b-4 border-blue-100 pb-2 flex items-center justify-between">
                <span>📖 كلمات تبدأ بحرف {{ selected.letter }}:</span>
                <span class="text-sm font-bold text-gray-500">اضغط على زر النطق لتهجئة الكلمة!</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (w of selected.words; track w.word) {
                  <div class="bg-gradient-to-b from-green-50 to-emerald-50 rounded-3xl p-5 text-center border-2 border-green-200 hover:shadow-xl hover:-translate-y-1 transition-all"
                    [class.ring-4]="playing() === 'W' + w.word" [class.ring-green-400]="playing() === 'W' + w.word">
                    <div class="h-28 flex items-center justify-center mb-3 bg-white/70 rounded-2xl border border-green-100 shadow-inner overflow-hidden">
                      <ng-container *ngTemplateOutlet="pic; context: { $implicit: w.img, hd: w.realImg, cls: 'w-24 h-24 drop-shadow-md hover:scale-110 transition-transform' }" />
                    </div>
                    <div class="text-3xl font-black text-green-700 mb-1 tracking-wide">{{ w.word }}</div>
                    <div class="text-xl font-extrabold text-gray-600 mb-4">{{ w.ar_word }}</div>
                    <div class="flex gap-2">
                      <button (click)="playWord(w)" class="flex-1 bg-green-500 text-white py-2.5 rounded-2xl font-black hover:bg-green-600 transition-all shadow border border-green-600 text-base">
                        🔊 نطق الكلمة
                      </button>
                      <button (click)="spellWord(w)" class="bg-white border-2 border-green-500 text-green-700 px-4 py-2.5 rounded-2xl font-black hover:bg-green-100 transition-all text-base shadow-sm">
                        🔤 تهجئة
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        }

        <!-- النافذة المنبثقة للاختبارات -->
        @if (quiz(); as q) {
          <div class="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-lg text-center shadow-2xl relative border-4 border-pink-300">
              <button (click)="quiz.set(null)" class="absolute top-4 left-4 w-10 h-10 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white font-black text-lg transition-colors">✕</button>
              
              @if (!q.done) {
                <div class="text-sm font-black text-purple-600 bg-purple-100 px-4 py-1.5 rounded-full inline-block mb-3 border border-purple-200">
                  السؤال {{ q.idx + 1 }} من 10 · 🌟 النجوم: {{ q.score }}
                </div>
                
                <div class="text-2xl font-black text-gray-800 mb-3">
                  {{ q.type === 'letter' ? 'بأي حرف تبدأ هذه الكلمة؟' : 'ما هي الكلمة الصحيحة لهذه الصورة؟' }}
                </div>
                
                <div class="flex justify-center mb-3 bg-blue-50/50 p-4 rounded-3xl border border-blue-100 shadow-inner">
                  <ng-container *ngTemplateOutlet="pic; context: { $implicit: q.word.img, hd: q.word.realImg, cls: 'w-36 h-36 drop-shadow-xl animate-pulse' }" />
                </div>
                
                <button (click)="speak(q.word.word, 'en-US')" class="mb-5 bg-blue-500 text-white px-6 py-2 rounded-full font-black hover:bg-blue-600 shadow-md transition-all text-base">
                  🔊 استمع للنطق الصوتي
                </button>
                
                <div class="grid grid-cols-2 gap-3">
                  @for (o of q.options; track o) {
                    <button (click)="answerQuiz(o)" [disabled]="q.answered !== null"
                      class="font-black py-4 rounded-2xl border-4 transition-all shadow-md text-2xl"
                      [class]="q.answered === null ? 'border-blue-200 bg-blue-50 text-blue-700 hover:scale-105 hover:bg-blue-100' :
                        o === q.answer ? 'border-green-500 bg-green-100 text-green-800 scale-105 shadow-lg' :
                        o === q.answered ? 'border-red-400 bg-red-100 text-red-700 animate-pulse' : 'border-gray-200 bg-gray-50 text-gray-400 opacity-60'">
                      {{ o }}
                    </button>
                  }
                </div>
              } @else {
                <div class="text-8xl mb-3 animate-bounce">{{ q.score >= 8 ? '🏆' : q.score >= 5 ? '🎉' : '💪' }}</div>
                <div class="text-3xl font-black text-blue-600 mb-2">نتيجتك النهائية: {{ q.score }} من 10</div>
                <p class="text-gray-700 text-lg font-bold mb-6">
                  {{ q.score >= 8 ? 'أنت بطل حقيقي في اللغة الإنجليزية! 🌟' : q.score >= 5 ? 'أداء رائع جداً! استمر في المحاولة!' : 'محاولة جيدة، يمكنك تحقيق أفضل من ذلك بالتكرار! 👍' }}
                </p>
                <div class="flex gap-3 justify-center">
                  <button (click)="startQuiz(q.type)" class="bg-pink-500 text-white px-8 py-3 rounded-full font-black text-lg hover:bg-pink-600 shadow-lg hover:scale-105 transition-all">
                    🔁 إعادة الاختبار
                  </button>
                  <button (click)="quiz.set(null)" class="bg-gray-200 text-gray-800 px-6 py-3 rounded-full font-black text-lg hover:bg-gray-300 transition-all">
                    إغلاق
                  </button>
                </div>
              }
            </div>
          </div>
        }

        <!-- النافذة المنبثقة للعبة الذاكرة التفاعلية -->
        @if (memoryGame(); as mg) {
          <div class="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <div class="bg-white rounded-3xl p-6 md:p-8 w-full max-w-3xl text-center shadow-2xl relative border-4 border-amber-300">
              <button (click)="memoryGame.set(null)" class="absolute top-4 left-4 w-10 h-10 bg-gray-100 rounded-full hover:bg-red-500 hover:text-white font-black text-lg transition-colors">✕</button>

              <h2 class="text-3xl font-black text-amber-600 mb-2">🃏 لعبة مطابقة الذاكرة (Memory Game)</h2>
              <p class="text-gray-600 font-bold mb-4">طابق بين الحرف والصورة المناسبة له!</p>

              @if (!mg.completed) {
                <div class="grid grid-cols-3 sm:grid-cols-4 gap-4 mb-6">
                  @for (card of mg.cards; track card.id) {
                    <div (click)="flipCard(card)"
                      class="h-28 rounded-2xl flex items-center justify-center cursor-pointer transition-all transform duration-300 shadow-md border-4 select-none overflow-hidden"
                      [class]="card.flipped || card.matched ? 'bg-amber-100 border-amber-400 rotate-0' : 'bg-gradient-to-br from-blue-500 to-indigo-600 border-white hover:scale-105'">
                      @if (card.flipped || card.matched) {
                        @if (card.img) {
                          <ng-container *ngTemplateOutlet="pic; context: { $implicit: card.img, cls: 'w-16 h-16 drop-shadow' }" />
                        } @else {
                          <span class="text-4xl font-black text-blue-700">{{ card.letter }}</span>
                        }
                      } @else {
                        <span class="text-3xl font-black text-white/80">❓</span>
                      }
                    </div>
                  }
                </div>
              } @else {
                <div class="text-8xl mb-3 animate-bounce">🥇</div>
                <div class="text-3xl font-black text-green-600 mb-2">مبروك! أنهيت لعبة الذاكرة بنجاح!</div>
                <p class="text-gray-700 text-lg font-bold mb-6">لقد طابقت جميع الكروت وحصلت على +5 نجوم إضافية! ⭐</p>
                <button (click)="startMemoryGame()" class="bg-amber-500 text-white px-8 py-3 rounded-full font-black text-lg hover:bg-amber-600 shadow-lg hover:scale-105 transition-all">
                  🎮 العب مرة أخرى
                </button>
              }
            </div>
          </div>
        }

      </div>
    </div>
  `
})
export class App implements OnInit, AfterViewInit {
  @ViewChild('tracingCanvas') tracingCanvas?: ElementRef<HTMLCanvasElement>;

  activeTab = signal<'alphabet' | 'tracing' | 'phrases' | 'stories' | 'numbers' | 'categories' | 'songs' | 'stickers'>('alphabet');
  selectedLetter = signal<AlphabetItem | null>(null);
  tracingLetter = signal<string>('A');
  quiz = signal<Quiz | null>(null);
  memoryGame = signal<{ cards: MemoryCard[]; firstCard: MemoryCard | null; lock: boolean; completed: boolean } | null>(null);
  slow = signal(false);
  playing = signal<string | null>(null);
  failed = signal<Set<string>>(new Set());
  learned = signal<Set<string>>(new Set());
  stars = signal(10);
  mascotSpeech = signal<string>('أهلاً بك في الأكاديمية! استمع لأصوات الحيوانات والجمل اليومية 🌟');

  readonly colors = ['text-rose-500', 'text-amber-500', 'text-emerald-500', 'text-sky-500', 'text-violet-500', 'text-pink-500'];

  private voices: SpeechSynthesisVoice[] = [];
  private playToken = 0;
  private ctxAudio?: AudioContext;
  private isDrawing = false;
  private penColor = '#ef4444';

  // ---------- داتا الجول والمحادثات Daily Phrases ----------
  readonly phrasesData: Phrase[] = [
    { en: 'Hello! How are you?', ar: 'مرحباً! كيف حالك؟', context: 'التحية', icon: '👋' },
    { en: 'My name is Alex.', ar: 'اسمي أليكس.', context: 'التعريف بالنفس', icon: '🧒' },
    { en: 'Nice to meet you!', ar: 'سعيد بلقائك!', context: 'الترحيب', icon: '🤝' },
    { en: 'Thank you very much!', ar: 'شكراً جزيلاً لك!', context: 'الشكر', icon: '🎁' },
    { en: 'Good morning!', ar: 'صباح الخير!', context: 'التحية الصباحية', icon: '☀️' },
    { en: 'Good night, sweet dreams!', ar: 'تصبح على خير، أحلاماً سعيدة!', context: 'قبل النوم', icon: '🌙' }
  ];

  // ---------- داتا القصص المصورة Short Stories ----------
  readonly storiesData: ShortStory[] = [
    {
      title: 'The Brave Little Lion',
      ar_title: 'الأسد الصغير الشجاع',
      icon: '🦁',
      pages: [
        { en: 'Leo is a little lion.', ar: 'ليو هو أسد صغير.', img: '🦁' },
        { en: 'Leo likes to play in the sun.', ar: 'يحب ليو اللعب في الشمس.', img: '☀️' },
        { en: 'Leo made a new rabbit friend!', ar: 'صادق ليو أرنباً جديداً!', img: '🐰' }
      ]
    },
    {
      title: 'The Space Rocket',
      ar_title: 'صاروخ الفضاء',
      icon: '🚀',
      pages: [
        { en: 'The rocket goes up!', ar: 'الصاروخ ينطلق للأعلى!', img: '🚀' },
        { en: 'It reaches the moon.', ar: 'يصل إلى القمر.', img: '🌙' },
        { en: 'The stars are shining bright.', ar: 'النجوم تلمع ببريق.', img: '⭐' }
      ]
    }
  ];

  // ---------- داتا ملصقات الجوائز ----------
  stickersData = signal<Sticker[]>([
    { id: 'st1', name: 'كأس البطل', img: '🏆', cost: 5, unlocked: false },
    { id: 'st2', name: 'الصاروخ الذهبي', img: '🚀', cost: 10, unlocked: false },
    { id: 'st3', name: 'تاج الملك', img: '👑', cost: 15, unlocked: false },
    { id: 'st4', name: 'وحيد القرن', img: '🦄', cost: 20, unlocked: false },
    { id: 'st5', name: 'الفرس اللطيف', img: '🐬', cost: 25, unlocked: false },
    { id: 'st6', name: 'وسام الشرف', img: '🎖️', cost: 30, unlocked: false }
  ]);

  // ---------- داتا الأغاني والأناشيد ----------
  readonly songsData: Song[] = [
    {
      title: 'The ABC Song',
      ar_title: 'أغنية الحروف الإنجليزية',
      icon: '🔤',
      lyrics: `A B C D E F G\nH I J K L M N O P\nQ R S, T U V\nW X, Y and Z\nNow I know my ABCs\nNext time won't you sing with me!`,
      audioText: `A B C D E F G H I J K L M N O P Q R S T U V W X Y and Z Now I know my ABCs Next time won't you sing with me!`
    },
    {
      title: 'Phonics Song',
      ar_title: 'أغنية أصوات الحروف',
      icon: '🔊',
      lyrics: `A is for Apple, a a apple\nB is for Ball, b b ball\nC is for Cat, c c cat\nD is for Dog, d d dog!`,
      audioText: `A is for Apple, ah ah apple. B is for Ball, buh buh ball. C is for Cat, kuh kuh cat. D is for Dog, duh duh dog!`
    },
    {
      title: 'Number Song',
      ar_title: 'أغنية العد والأرقام',
      icon: '🔢',
      lyrics: `1 2 3 4 5 Once I caught a fish alive\n6 7 8 9 10 Then I let it go again!`,
      audioText: `One two three four five, Once I caught a fish alive, Six seven eight nine ten, Then I let it go again!`
    }
  ];

  // ---------- داتا الأرقام ----------
  readonly numbersData = [
    { num: 1, en: 'One', ar: 'واحد', icon: '🍎' },
    { num: 2, en: 'Two', ar: 'اثنان', icon: '🎈' },
    { num: 3, en: 'Three', ar: 'ثلاثة', icon: '⭐' },
    { num: 4, en: 'Four', ar: 'أربعة', icon: '🚗' },
    { num: 5, en: 'Five', ar: 'خمسة', icon: '🐥' },
    { num: 6, en: 'Six', ar: 'ستة', icon: '🍬' },
    { num: 7, en: 'Seven', ar: 'سبعة', icon: '🌸' },
    { num: 8, en: 'Eight', ar: 'ثمانية', icon: '⚽' },
    { num: 9, en: 'Nine', ar: 'تسعة', icon: '🎨' },
    { num: 10, en: 'Ten', ar: 'عشرة', icon: '🚀' }
  ];

  // ---------- داتا الألوان والحيوانات المحدثة بصور حقيقية ومؤثرات صوتیة ----------
  readonly extraCategories: ExtraCategory[] = [
    {
      id: 'animals',
      title: 'عالم الحيوانات (Animals & Sounds)',
      icon: '🦁',
      items: [
        { en: 'Lion', ar: 'أسد', img: '🦁', realImg: 'https://images.unsplash.com/photo-1546182990-dffeafbe841d?w=300&auto=format&fit=crop', soundEffect: 'roar' },
        { en: 'Elephant', ar: 'فيل', img: '🐘', realImg: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=300&auto=format&fit=crop', soundEffect: 'trumpet' },
        { en: 'Cat', ar: 'قطة', img: '🐱', realImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop', soundEffect: 'meow' },
        { en: 'Dog', ar: 'كلب', img: '🐶', realImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop', soundEffect: 'bark' },
        { en: 'Bird', ar: 'طائر', img: '🐦', realImg: 'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=300&auto=format&fit=crop', soundEffect: 'tweet' },
        { en: 'Frog', ar: 'ضفدع', img: '🐸', realImg: 'https://images.unsplash.com/photo-1559253664-ca249d4608c6?w=300&auto=format&fit=crop', soundEffect: 'croak' }
      ]
    },
    {
      id: 'vehicles',
      title: 'وسائل المواصلات (Vehicles)',
      icon: '🚗',
      items: [
        { en: 'Car', ar: 'سيارة', img: '🚗', realImg: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=300&auto=format&fit=crop', soundEffect: 'vroom' },
        { en: 'Airplane', ar: 'طائرة', img: '✈️', realImg: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=300&auto=format&fit=crop', soundEffect: 'jet' },
        { en: 'Train', ar: 'قطار', img: '🚂', realImg: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=300&auto=format&fit=crop', soundEffect: 'choo' },
        { en: 'Bus', ar: 'حافلة', img: '🚌', realImg: 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=300&auto=format&fit=crop', soundEffect: 'horn' },
        { en: 'Rocket', ar: 'صاروخ', img: '🚀', realImg: 'https://images.unsplash.com/photo-1517976487492-5750f3195933?w=300&auto=format&fit=crop', soundEffect: 'blast' },
        { en: 'Bicycle', ar: 'دراجة', img: '🚲', realImg: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=300&auto=format&fit=crop', soundEffect: 'bell' }
      ]
    },
    {
      id: 'colors',
      title: 'الألوان (Colors)',
      icon: '🎨',
      items: [
        { en: 'Red', ar: 'أحمر', img: '🔴' },
        { en: 'Blue', ar: 'أزرق', img: '🔵' },
        { en: 'Green', ar: 'أخضر', img: '🟢' },
        { en: 'Yellow', ar: 'أصفر', img: '🟡' },
        { en: 'Orange', ar: 'برتقالي', img: '🟠' },
        { en: 'Purple', ar: 'بنفسجي', img: '🟣' }
      ]
    },
    {
      id: 'food',
      title: 'الأطعمة والفواكه (Food & Fruits)',
      icon: '🍕',
      items: [
        { en: 'Pizza', ar: 'بيتزا', img: '🍕', realImg: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=300&auto=format&fit=crop' },
        { en: 'Apple', ar: 'تفاحة', img: '🍎', realImg: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop' },
        { en: 'Banana', ar: 'موز', img: '🍌', realImg: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&auto=format&fit=crop' },
        { en: 'Ice cream', ar: 'آيس كريم', img: '🍦', realImg: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=300&auto=format&fit=crop' },
        { en: 'Burger', ar: 'برجر', img: '🍔', realImg: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=300&auto=format&fit=crop' },
        { en: 'Cake', ar: 'كعكة', img: '🍰', realImg: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=300&auto=format&fit=crop' }
      ]
    }
  ];

  readonly alphabetData: AlphabetItem[] = [
    { 
      letter: 'A', ar_letter: 'إيه', 
      words: [
        { word: 'Apple', ar_word: 'تفاحة', img: '🍎', realImg: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&auto=format&fit=crop' },
        { word: 'Ant', ar_word: 'نملة', img: '🐜' },
        { word: 'Arm', ar_word: 'ذراع', img: '💪' },
        { word: 'Alligator', ar_word: 'تمساح', img: '🐊' },
        { word: 'Arrow', ar_word: 'سهم', img: '🏹' },
        { word: 'Axe', ar_word: 'فأس', img: '🪓' }
      ] 
    },
    { 
      letter: 'B', ar_letter: 'بي', 
      words: [
        { word: 'Ball', ar_word: 'كرة', img: '⚽', realImg: 'https://images.unsplash.com/photo-1614632537190-23e4146777db?w=300&auto=format&fit=crop' },
        { word: 'Bear', ar_word: 'دب', img: '🐻' },
        { word: 'Book', ar_word: 'كتاب', img: '📖' },
        { word: 'Banana', ar_word: 'موزة', img: '🍌' },
        { word: 'Bird', ar_word: 'طائر', img: '🐦' },
        { word: 'Bus', ar_word: 'حافلة', img: '🚌' }
      ] 
    },
    { 
      letter: 'C', ar_letter: 'سي', 
      words: [
        { word: 'Cat', ar_word: 'قطة', img: '🐈', realImg: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop' },
        { word: 'Car', ar_word: 'سيارة', img: '🚗' },
        { word: 'Cow', ar_word: 'بقرة', img: '🐄' },
        { word: 'Cake', ar_word: 'كعكة', img: '🍰' },
        { word: 'Camel', ar_word: 'جمل', img: '🐪' },
        { word: 'Crown', ar_word: 'تاج', img: '👑' }
      ] 
    },
    { 
      letter: 'D', ar_letter: 'دي', 
      words: [
        { word: 'Dog', ar_word: 'كلب', img: '🐕', realImg: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=300&auto=format&fit=crop' },
        { word: 'Duck', ar_word: 'بطة', img: '🦆' },
        { word: 'Door', ar_word: 'باب', img: '🚪' },
        { word: 'Dolphin', ar_word: 'دلفين', img: '🐬' },
        { word: 'Drum', ar_word: 'طبلة', img: '🥁' },
        { word: 'Dress', ar_word: 'فستان', img: '👗' }
      ] 
    },
    { 
      letter: 'E', ar_letter: 'إي', 
      words: [
        { word: 'Elephant', ar_word: 'فيل', img: '🐘', realImg: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?w=300&auto=format&fit=crop' },
        { word: 'Egg', ar_word: 'بيضة', img: '🥚' },
        { word: 'Eye', ar_word: 'عين', img: '👁️' },
        { word: 'Ear', ar_word: 'أذن', img: '👂' },
        { word: 'Earth', ar_word: 'الأرض', img: '🌍' },
        { word: 'Eagle', ar_word: 'نسر', img: '🦅' }
      ] 
    },
    { 
      letter: 'F', ar_letter: 'إف', 
      words: [
        { word: 'Fish', ar_word: 'سمكة', img: '🐟' },
        { word: 'Frog', ar_word: 'ضفدع', img: '🐸' },
        { word: 'Flower', ar_word: 'زهرة', img: '🌸' },
        { word: 'Fire', ar_word: 'نار', img: '🔥' },
        { word: 'Fox', ar_word: 'ثعلب', img: '🦊' },
        { word: 'Foot', ar_word: 'قدم', img: '🦶' }
      ] 
    },
    { 
      letter: 'G', ar_letter: 'جي', 
      words: [
        { word: 'Goat', ar_word: 'ماعز', img: '🐐' },
        { word: 'Giraffe', ar_word: 'زرافة', img: '🦒' },
        { word: 'Grape', ar_word: 'عنب', img: '🍇' },
        { word: 'Gift', ar_word: 'هدية', img: '🎁' },
        { word: 'Guitar', ar_word: 'جيتار', img: '🎸' },
        { word: 'Ghost', ar_word: 'شبح', img: '👻' }
      ] 
    },
    { 
      letter: 'H', ar_letter: 'إتش', 
      words: [
        { word: 'Hat', ar_word: 'قبعة', img: '🎩' },
        { word: 'Horse', ar_word: 'حصان', img: '🐎' },
        { word: 'Hand', ar_word: 'يد', img: '✋' },
        { word: 'House', ar_word: 'منزل', img: '🏠' },
        { word: 'Heart', ar_word: 'قلب', img: '❤️' },
        { word: 'Helicopter', ar_word: 'مروحية', img: '🚁' }
      ] 
    },
    { 
      letter: 'I', ar_letter: 'آي', 
      words: [
        { word: 'Ice cream', ar_word: 'آيس كريم', img: '🍦' },
        { word: 'Island', ar_word: 'جزيرة', img: '🏝️' },
        { word: 'Ice', ar_word: 'ثلج', img: '🧊' },
        { word: 'Iguana', ar_word: 'إغوانة', img: '🦎' },
        { word: 'Insect', ar_word: 'حشرة', img: '🐛' },
        { word: 'Igloo', ar_word: 'كوخ ثلجي', img: '🛖' }
      ] 
    },
    { 
      letter: 'J', ar_letter: 'جيه', 
      words: [
        { word: 'Juice', ar_word: 'عصير', img: '🧃' },
        { word: 'Jacket', ar_word: 'سترة', img: '🧥' },
        { word: 'Jellyfish', ar_word: 'قنديل البحر', img: '🪼' },
        { word: 'Jeep', ar_word: 'سيارة جيب', img: '🚙' },
        { word: 'Jam', ar_word: 'مربى', img: '🍯' },
        { word: 'Jump', ar_word: 'قفز', img: '🤸' }
      ] 
    },
    { 
      letter: 'K', ar_letter: 'كيه', 
      words: [
        { word: 'Kite', ar_word: 'طائرة ورقية', img: '🪁' },
        { word: 'Key', ar_word: 'مفتاح', img: '🔑' },
        { word: 'Kangaroo', ar_word: 'كنغر', img: '🦘' },
        { word: 'King', ar_word: 'ملك', img: '🤴' },
        { word: 'Keyboard', ar_word: 'لوحة مفاتيح', img: '⌨️' },
        { word: 'Koala', ar_word: 'كوالا', img: '🐨' }
      ] 
    },
    { 
      letter: 'L', ar_letter: 'إل', 
      words: [
        { word: 'Lion', ar_word: 'أسد', img: '🦁' },
        { word: 'Lemon', ar_word: 'ليمون', img: '🍋' },
        { word: 'Leaf', ar_word: 'ورقة شجر', img: '🍃' },
        { word: 'Lamp', ar_word: 'مصباح', img: '💡' },
        { word: 'Lock', ar_word: 'قفل', img: '🔒' },
        { word: 'Ladybug', ar_word: 'دعسوقة', img: '🐞' }
      ] 
    },
    { 
      letter: 'M', ar_letter: 'إم', 
      words: [
        { word: 'Monkey', ar_word: 'قرد', img: '🐒' },
        { word: 'Moon', ar_word: 'قمر', img: '🌙' },
        { word: 'Mouse', ar_word: 'فأر', img: '🐭' },
        { word: 'Milk', ar_word: 'حليب', img: '🥛' },
        { word: 'Mushroom', ar_word: 'فطر', img: '🍄' },
        { word: 'Magnet', ar_word: 'مغناطيس', img: '🧲' }
      ] 
    },
    { 
      letter: 'N', ar_letter: 'إن', 
      words: [
        { word: 'Nest', ar_word: 'عش', img: '🪹' },
        { word: 'Nose', ar_word: 'أنف', img: '👃' },
        { word: 'Nut', ar_word: 'بندقة', img: '🥜' },
        { word: 'Net', ar_word: 'شبكة', img: '🥅' },
        { word: 'Ninja', ar_word: 'نينجا', img: '🥷' },
        { word: 'Notebook', ar_word: 'دفتر', img: '📓' }
      ] 
    },
    { 
      letter: 'O', ar_letter: 'أو', 
      words: [
        { word: 'Orange', ar_word: 'برتقالة', img: '🍊' },
        { word: 'Owl', ar_word: 'بومة', img: '🦉' },
        { word: 'Onion', ar_word: 'بصلة', img: '🧅' },
        { word: 'Octopus', ar_word: 'أخطبوط', img: '🐙' },
        { word: 'Ocean', ar_word: 'محيط', img: '🌊' },
        { word: 'Otter', ar_word: 'ثعلب الماء', img: '🦦' }
      ] 
    },
    { 
      letter: 'P', ar_letter: 'بي', 
      words: [
        { word: 'Pig', ar_word: 'خنزير', img: '🐷' },
        { word: 'Pen', ar_word: 'قلم', img: '🖊️' },
        { word: 'Panda', ar_word: 'باندا', img: '🐼' },
        { word: 'Pizza', ar_word: 'بيتزا', img: '🍕' },
        { word: 'Penguin', ar_word: 'بطريق', img: '🐧' },
        { word: 'Piano', ar_word: 'بيانو', img: '🎹' }
      ] 
    },
    { 
      letter: 'Q', ar_letter: 'كيو', 
      words: [
        { word: 'Queen', ar_word: 'ملكة', img: '👑' },
        { word: 'Question', ar_word: 'سؤال', img: '❓' },
        { word: 'Quilt', ar_word: 'لحاف', img: '🛌' },
        { word: 'Quail', ar_word: 'طائر السمان', img: '🐦' },
        { word: 'Quarter', ar_word: 'ربع دولار', img: '🪙' },
        { word: 'Quiet', ar_word: 'هدوء', img: '🤫' }
      ] 
    },
    { 
      letter: 'R', ar_letter: 'آر', 
      words: [
        { word: 'Rabbit', ar_word: 'أرنب', img: '🐇' },
        { word: 'Ring', ar_word: 'خاتم', img: '💍' },
        { word: 'Rose', ar_word: 'وردة', img: '🌹' },
        { word: 'Robot', ar_word: 'روبوت', img: '🤖' },
        { word: 'Rocket', ar_word: 'صاروخ', img: '🚀' },
        { word: 'Rain', ar_word: 'مطر', img: '🌧️' }
      ] 
    },
    { 
      letter: 'S', ar_letter: 'إس', 
      words: [
        { word: 'Sun', ar_word: 'شمس', img: '☀️' },
        { word: 'Star', ar_word: 'نجمة', img: '⭐' },
        { word: 'Snake', ar_word: 'ثعبان', img: '🐍' },
        { word: 'Spider', ar_word: 'عنكبوت', img: '🕷️' },
        { word: 'Strawberry', ar_word: 'فراولة', img: '🍓' },
        { word: 'Shoes', ar_word: 'حذاء', img: '👟' }
      ] 
    },
    { 
      letter: 'T', ar_letter: 'تي', 
      words: [
        { word: 'Tree', ar_word: 'شجرة', img: '🌳' },
        { word: 'Train', ar_word: 'قطار', img: '🚂' },
        { word: 'Tiger', ar_word: 'نمر', img: '🐅' },
        { word: 'Turtle', ar_word: 'سلحفاة', img: '🐢' },
        { word: 'Tomato', ar_word: 'طماطم', img: '🍅' },
        { word: 'Tent', ar_word: 'خيمة', img: '⛺' }
      ] 
    },
    { 
      letter: 'U', ar_letter: 'يو', 
      words: [
        { word: 'Umbrella', ar_word: 'مظلة', img: '☂️' },
        { word: 'Unicorn', ar_word: 'وحيد القرن', img: '🦄' },
        { word: 'Up', ar_word: 'أعلى', img: '⬆️' },
        { word: 'UFO', ar_word: 'طبق طائر', img: '🛸' },
        { word: 'Uniform', ar_word: 'زي موحد', img: '🥼' },
        { word: 'Unlock', ar_word: 'فتح', img: '🔓' }
      ] 
    },
    { 
      letter: 'V', ar_letter: 'في', 
      words: [
        { word: 'Van', ar_word: 'شاحنة', img: '🚐' },
        { word: 'Violin', ar_word: 'كمان', img: '🎻' },
        { word: 'Volcano', ar_word: 'بركان', img: '🌋' },
        { word: 'Vegetable', ar_word: 'خضار', img: '🥗' },
        { word: 'Vampire', ar_word: 'مصاص دماء', img: '🧛' },
        { word: 'Video', ar_word: 'فيديو', img: '🎬' }
      ] 
    },
    { 
      letter: 'W', ar_letter: 'دبليو', 
      words: [
        { word: 'Watermelon', ar_word: 'بطيخ', img: '🍉' },
        { word: 'Wolf', ar_word: 'ذئب', img: '🐺' },
        { word: 'Whale', ar_word: 'حوت', img: '🐳' },
        { word: 'Watch', ar_word: 'ساعة', img: '⌚' },
        { word: 'Window', ar_word: 'نافذة', img: '🪟' },
        { word: 'Wheel', ar_word: 'عجلة', img: '🛞' }
      ] 
    },
    { 
      letter: 'X', ar_letter: 'إكس', 
      words: [
        { word: 'Xylophone', ar_word: 'إكسيليفون', img: '🎶' },
        { word: 'X-ray', ar_word: 'أشعة سينية', img: '🩻' },
        { word: 'Fox', ar_word: 'ثعلب (ينتهي بـ X)', img: '🦊' },
        { word: 'Box', ar_word: 'صندوق (ينتهي بـ X)', img: '📦' },
        { word: 'Six', ar_word: 'ستة (ينتهي بـ X)', img: '6️⃣' },
        { word: 'Mix', ar_word: 'يخلط (ينتهي بـ X)', img: '🥣' }
      ] 
    },
    { 
      letter: 'Y', ar_letter: 'واي', 
      words: [
        { word: 'Yacht', ar_word: 'يخت', img: '🛥️' },
        { word: 'Yellow', ar_word: 'أصفر', img: '🟨' },
        { word: 'Yo-yo', ar_word: 'لعبة اليويو', img: '🪀' },
        { word: 'Yogurt', ar_word: 'زبادي', img: '🍦' },
        { word: 'Yarn', ar_word: 'خيوط الغزل', img: '🧶' },
        { word: 'Yawn', ar_word: 'تثاؤب', img: '🥱' }
      ] 
    },
    { 
      letter: 'Z', ar_letter: 'زد', 
      words: [
        { word: 'Zebra', ar_word: 'حمار وحشي', img: '🦓' },
        { word: 'Zoo', ar_word: 'حديقة حيوان', img: '🐘' },
        { word: 'Zero', ar_word: 'صفر', img: '0️⃣' },
        { word: 'Zipper', ar_word: 'سحاب', img: '🤐' },
        { word: 'Zigzag', ar_word: 'متعرج', img: '〰️' },
        { word: 'Zombie', ar_word: 'زومبي', img: '🧟' }
      ] 
    }
  ];

  ngOnInit() {
    if ('speechSynthesis' in window) {
      this.voices = speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => (this.voices = speechSynthesis.getVoices());
    }
    try {
      const s = JSON.parse(localStorage.getItem('abc-kids-progress') || '{}');
      this.learned.set(new Set(s.learned || []));
      this.stars.set(s.stars !== undefined ? s.stars : 10);
      if (s.unlockedStickers) {
        this.stickersData.update(list => list.map(st => ({ ...st, unlocked: s.unlockedStickers.includes(st.id) })));
      }
    } catch { /* ignore */ }
  }

  ngAfterViewInit() {
    this.initCanvas();
  }

  playCategoryItem(item: { en: string; ar: string; soundEffect?: string }) {
    if (item.soundEffect) {
      this.playRealSoundEffect(item.soundEffect);
      setTimeout(() => this.speak(item.en, 'en-US'), 1000);
    } else {
      this.speak(item.en, 'en-US');
    }
  }

  private playRealSoundEffect(type: string) {
    try {
      const c = (this.ctxAudio ??= new AudioContext());
      let freqs: number[] = [400, 600];
      if (type === 'roar') freqs = [150, 100, 80];
      if (type === 'meow') freqs = [700, 900, 650];
      if (type === 'bark') freqs = [250, 450];
      if (type === 'vroom') freqs = [120, 180, 240];
      if (type === 'trumpet') freqs = [500, 750, 900];

      freqs.forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sawtooth'; o.frequency.value = f; o.connect(g); g.connect(c.destination);
        const t = c.currentTime + i * 0.15;
        g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.start(t); o.stop(t + 0.35);
      });
    } catch { /* ignore */ }
  }

  speakMascot() {
    const lines = [
      'أهلاً بك يا بطل! استمتع بالصور الحقيقية والأصوات المميزة! 🌟',
      'هل استمعت لصوت الأسد وصوت السيارة اليوم؟ 🦁🚗',
      'اقرأ القصص المصورة لتصبح بطلاً في القراءة بالإنجليزي! 📖',
      'حل الاختبارات واكسب نجوم جديدة لشراء ملصقات الألبوم! 🏆'
    ];
    const line = lines[Math.floor(Math.random() * lines.length)];
    this.mascotSpeech.set(line);
    this.speak(line, 'ar-EG');
  }

  unlockSticker(st: Sticker) {
    if (this.stars() < st.cost) {
      this.speak('نجومك غير كافية، حل الاختبارات أولاً!', 'ar-EG');
      return;
    }
    this.stars.update(s => s - st.cost);
    this.stickersData.update(list => list.map(item => item.id === st.id ? { ...item, unlocked: true } : item));
    this.save();
    this.beep([523, 659, 784, 1047]);
    this.speak('مبروك! تم فتح ملصق ' + st.name, 'ar-EG');
  }

  countArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i + 1);
  }

  private save() {
    try {
      const unlockedStickers = this.stickersData().filter(s => s.unlocked).map(s => s.id);
      localStorage.setItem('abc-kids-progress', JSON.stringify({ learned: [...this.learned()], stars: this.stars(), unlockedStickers }));
    } catch { /* ignore */ }
  }

  imgUrl(e: string): string {
    const cps = [...e].map(c => c.codePointAt(0)!.toString(16)).filter(h => h !== 'fe0f' || e.includes('\u200d'));
    return 'https://cdn.jsdelivr.net/gh/jdecked/twemoji@15.1.0/assets/svg/' + cps.join('-') + '.svg';
  }
  markFailed(e: string) { this.failed.update(s => new Set(s).add(e)); }

  selectLetter(item: AlphabetItem) {
    this.selectedLetter.set(item);
    this.learned.update(s => new Set(s).add(item.letter));
    this.save();
  }
  closeModal() { this.playToken++; speechSynthesis?.cancel(); this.playing.set(null); this.selectedLetter.set(null); }
  step(dir: number) {
    const cur = this.selectedLetter(); if (!cur) return;
    const n = this.alphabetData.length;
    const i = (this.alphabetData.indexOf(cur) + dir + n) % n;
    this.selectLetter(this.alphabetData[i]);
  }

  openTracingModal(letter: string) {
    this.closeModal();
    this.tracingLetter.set(letter);
    this.activeTab.set('tracing');
    setTimeout(() => this.initCanvas(), 100);
  }

  setTracingLetter(l: string) {
    this.tracingLetter.set(l);
    this.clearTracingCanvas();
    this.speak(l, 'en-US');
  }

  setPenColor(color: string) {
    this.penColor = color;
  }

  private initCanvas() {
    if (!this.tracingCanvas) return;
    const cvs = this.tracingCanvas.nativeElement;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    this.clearTracingCanvas();

    const startDraw = (x: number, y: number) => {
      this.isDrawing = true;
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const draw = (x: number, y: number) => {
      if (!this.isDrawing) return;
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = this.penColor;
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const stopDraw = () => {
      this.isDrawing = false;
    };

    cvs.onmousedown = (e) => {
      const rect = cvs.getBoundingClientRect();
      startDraw(e.clientX - rect.left, e.clientY - rect.top);
    };

    cvs.onmousemove = (e) => {
      const rect = cvs.getBoundingClientRect();
      draw(e.clientX - rect.left, e.clientY - rect.top);
    };

    cvs.onmouseup = stopDraw;
    cvs.onmouseleave = stopDraw;

    cvs.ontouchstart = (e) => {
      const rect = cvs.getBoundingClientRect();
      const touch = e.touches[0];
      startDraw(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    cvs.ontouchmove = (e) => {
      const rect = cvs.getBoundingClientRect();
      const touch = e.touches[0];
      draw(touch.clientX - rect.left, touch.clientY - rect.top);
    };

    cvs.ontouchend = stopDraw;
  }

  clearTracingCanvas() {
    if (!this.tracingCanvas) return;
    const cvs = this.tracingCanvas.nativeElement;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, cvs.width, cvs.height);

    ctx.font = 'bold 200px Cairo, sans-serif';
    ctx.fillStyle = '#f3f4f6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.tracingLetter() + this.tracingLetter().toLowerCase(), cvs.width / 2, cvs.height / 2);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    ctx.strokeText(this.tracingLetter() + this.tracingLetter().toLowerCase(), cvs.width / 2, cvs.height / 2);
    ctx.setLineDash([]);
  }

  playNumber(num: { num: number; en: string; ar: string }) {
    this.sequence('N' + num.num, [
      [num.en, 'en-US'],
      [num.ar, 'ar-EG']
    ]);
  }

  private getBestVoice(lang: string): SpeechSynthesisVoice | null {
    const norm = (l: string) => l.replace('_', '-').toLowerCase();
    const prefix = lang.split('-')[0].toLowerCase();
    const score = (v: SpeechSynthesisVoice) =>
      (norm(v.lang) === lang.toLowerCase() ? 5 : 0) +
      (/natural|neural|online/i.test(v.name) ? 4 : 0) +
      (/google|samantha|siri|enhanced|premium|aria|jenny/i.test(v.name) ? 3 : 0) +
      (v.localService ? 0 : 1) - (/compact|espeak/i.test(v.name) ? 5 : 0);
    return this.voices.filter(v => norm(v.lang).startsWith(prefix)).sort((a, b) => score(b) - score(a))[0] ?? null;
  }

  private say(text: string, lang: string): Promise<void> {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) return resolve();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const v = this.getBestVoice(lang);
      if (v) u.voice = v;
      u.rate = (lang.startsWith('ar') ? 0.95 : 1) * (this.slow() ? 0.65 : 0.9);
      u.pitch = 1.1;
      u.onend = () => resolve();
      u.onerror = () => resolve();
      speechSynthesis.speak(u);
    });
  }

  private async sequence(key: string | null, steps: [string, string][]) {
    if (!('speechSynthesis' in window)) return;
    const token = ++this.playToken;
    speechSynthesis.cancel();
    this.playing.set(key);
    for (const [text, lang] of steps) {
      if (token !== this.playToken) return;
      await this.say(text, lang);
      await new Promise(r => setTimeout(r, 250));
    }
    if (token === this.playToken) this.playing.set(null);
  }

  speak(text: string, lang: string) { this.sequence(null, [[text, lang]]); }

  playLetter(item: AlphabetItem) {
    this.sequence('L' + item.letter, [
      [item.letter, 'en-US'],
      [item.letter + ' for ' + item.words[0].word, 'en-US'],
      [item.ar_letter, 'ar-EG']
    ]);
  }
  playWord(w: WordItem) {
    this.sequence('W' + w.word, [[w.word, 'en-US'], [w.ar_word, 'ar-EG']]);
  }
  spellWord(w: WordItem) {
    const letters = w.word.replace(/[^a-z]/gi, '').toUpperCase().split('').join('. ');
    this.sequence('W' + w.word, [[w.word, 'en-US'], [letters, 'en-US'], [w.word, 'en-US']]);
  }

  private beep(freqs: number[], type: OscillatorType = 'sine') {
    try {
      const c = (this.ctxAudio ??= new AudioContext());
      freqs.forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.value = f; o.connect(g); g.connect(c.destination);
        const t = c.currentTime + i * 0.13;
        g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.start(t); o.stop(t + 0.22);
      });
    } catch { /* ignore */ }
  }

  private newQuestion(type: 'letter' | 'word') {
    const item = this.alphabetData[Math.floor(Math.random() * this.alphabetData.length)];
    const word = item.words[Math.floor(Math.random() * item.words.length)];

    if (type === 'letter') {
      const others = this.alphabetData.map(a => a.letter).filter(l => l !== item.letter).sort(() => Math.random() - 0.5).slice(0, 3);
      return { word, answer: item.letter, options: [item.letter, ...others].sort(() => Math.random() - 0.5), type };
    } else {
      const allWords = this.alphabetData.flatMap(a => a.words).map(w => w.word);
      const others = allWords.filter(w => w !== word.word).sort(() => Math.random() - 0.5).slice(0, 3);
      return { word, answer: word.word, options: [word.word, ...others].sort(() => Math.random() - 0.5), type };
    }
  }

  startQuiz(type: 'letter' | 'word') {
    this.closeModal();
    this.quiz.set({ idx: 0, score: 0, answered: null, done: false, ...this.newQuestion(type) });
    setTimeout(() => this.speak(this.quiz()!.word.word, 'en-US'), 300);
  }

  answerQuiz(opt: string) {
    const q = this.quiz(); if (!q || q.answered) return;
    const ok = opt === q.answer;
    this.beep(ok ? [523, 659, 784] : [220, 165], ok ? 'sine' : 'square');
    this.quiz.set({ ...q, answered: opt, score: q.score + (ok ? 1 : 0) });
    if (ok) { this.stars.update(s => s + 1); this.save(); }
    setTimeout(() => this.nextQuestion(), 1600);
  }

  private nextQuestion() {
    const q = this.quiz(); if (!q) return;
    if (q.idx >= 9) { this.beep([523, 659, 784, 1047]); this.quiz.set({ ...q, done: true }); return; }
    this.quiz.set({ ...q, idx: q.idx + 1, answered: null, ...this.newQuestion(q.type) });
    this.speak(this.quiz()!.word.word, 'en-US');
  }

  startMemoryGame() {
    this.closeModal();
    const selectedItems = [...this.alphabetData].sort(() => Math.random() - 0.5).slice(0, 4);
    let cards: MemoryCard[] = [];
    let id = 1;
    selectedItems.forEach(item => {
      const wordObj = item.words[0];
      cards.push({ id: id++, letter: item.letter, img: '', word: wordObj.word, flipped: false, matched: false });
      cards.push({ id: id++, letter: item.letter, img: wordObj.img, word: wordObj.word, flipped: false, matched: false });
    });
    cards = cards.sort(() => Math.random() - 0.5);
    this.memoryGame.set({ cards, firstCard: null, lock: false, completed: false });
  }

  flipCard(card: MemoryCard) {
    const mg = this.memoryGame();
    if (!mg || mg.lock || card.flipped || card.matched) return;

    const updatedCards = mg.cards.map(c => c.id === card.id ? { ...c, flipped: true } : c);
    
    if (card.img) {
      this.speak(card.word, 'en-US');
    } else {
      this.speak(card.letter, 'en-US');
    }

    if (!mg.firstCard) {
      this.memoryGame.set({ ...mg, cards: updatedCards, firstCard: card });
    } else {
      this.memoryGame.set({ ...mg, cards: updatedCards, lock: true });
      const isMatch = mg.firstCard.letter === card.letter;

      if (isMatch) {
        this.beep([523, 659, 784]);
        setTimeout(() => {
          const matchedCards = updatedCards.map(c => c.letter === card.letter ? { ...c, matched: true } : c);
          const allMatched = matchedCards.every(c => c.matched);
          if (allMatched) {
            this.stars.update(s => s + 5);
            this.save();
          }
          this.memoryGame.set({ ...mg, cards: matchedCards, firstCard: null, lock: false, completed: allMatched });
        }, 800);
      } else {
        this.beep([220, 165], 'square');
        setTimeout(() => {
          const resetCards = updatedCards.map(c => (c.id === card.id || c.id === mg.firstCard!.id) ? { ...c, flipped: false } : c);
          this.memoryGame.set({ ...mg, cards: resetCards, firstCard: null, lock: false });
        }, 1200);
      }
    }
  }
}
