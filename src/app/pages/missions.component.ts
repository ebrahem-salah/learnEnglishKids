import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DataService } from '../services/data.service';
import { StatsService } from '../services/stats.service';
import { AudioService } from '../services/audio.service';
import { PetService } from './pet.component';

interface Badge { id: string; icon: string; ar: string; hint: string; have: number; need: number; }

@Component({
  selector: 'app-missions',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="max-w-3xl mx-auto space-y-6" dir="rtl">
      <div class="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl shadow-xl border-4 border-orange-300 p-6">
        <h2 class="text-3xl font-black text-orange-700 text-center mb-4">🎯 مهام اليوم</h2>
        <div class="space-y-3">
          @for (m of stats.missions(); track m.id) {
            <div class="bg-white rounded-2xl p-4 border-4 flex items-center gap-4 shadow"
                 [class]="m.claimed ? 'border-green-400 opacity-80' : m.done ? 'border-yellow-400' : 'border-orange-100'">
              <div class="text-5xl">{{ m.claimed ? '✅' : m.icon }}</div>
              <div class="flex-1">
                <div class="font-black text-lg text-gray-800">{{ m.ar }}</div>
                <div class="h-3 bg-gray-200 rounded-full overflow-hidden mt-2">
                  <div class="h-full bg-gradient-to-r from-orange-400 to-yellow-400 transition-all duration-500" [style.width.%]="(m.value / m.target) * 100"></div>
                </div>
                <div class="text-xs font-bold text-gray-500 mt-1">{{ m.value }} / {{ m.target }}</div>
              </div>
              @if (m.claimed) {
                <span class="font-black text-green-600">تم 🎉</span>
              } @else {
                <button (click)="claim(m.id, m.reward)" [disabled]="!m.done"
                        class="px-4 py-2 rounded-2xl font-black text-white shadow transition-all"
                        [class]="m.done ? 'bg-green-500 shadow-[0_4px_0_#15803d] active:translate-y-1 active:shadow-none animate-pulse' : 'bg-gray-300'">
                  +{{ m.reward }} ⭐
                </button>
              }
            </div>
          }
        </div>
        <a routerLink="/games" class="block text-center mt-4 font-black text-orange-700 underline">🎮 اذهب للألعاب</a>
      </div>

      <div class="bg-white rounded-3xl shadow-xl border-4 border-purple-200 p-6">
        <h2 class="text-3xl font-black text-purple-700 text-center mb-1">🏅 الأوسمة</h2>
        <p class="text-center font-bold text-gray-500 mb-4">{{ unlocked() }} من {{ badges().length }}</p>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
          @for (b of badges(); track b.id) {
            <div class="rounded-2xl p-3 text-center border-4"
                 [class]="b.have >= b.need ? 'bg-gradient-to-b from-yellow-50 to-amber-100 border-amber-400' : 'bg-gray-50 border-gray-200'">
              <div class="text-5xl" [class.grayscale]="b.have < b.need" [class.opacity-40]="b.have < b.need">{{ b.icon }}</div>
              <div class="font-black text-gray-800 mt-1">{{ b.ar }}</div>
              <div class="text-xs font-bold text-gray-500">{{ b.hint }}</div>
              @if (b.have < b.need) {
                <div class="text-xs font-black text-purple-600 mt-1">{{ min(b.have, b.need) }} / {{ b.need }}</div>
              }
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class MissionsComponent {
  stats = inject(StatsService);
  private data = inject(DataService);
  private audio = inject(AudioService);
  private pet = inject(PetService);

  badges = computed<Badge[]>(() => [
    { id: 'first', icon: '🎈', ar: 'البداية', hint: 'العب أول لعبة', have: this.stats.totalPlays(), need: 1 },
    { id: 'play10', icon: '🎮', ar: 'لاعب نشيط', hint: 'العب 10 مرات', have: this.stats.totalPlays(), need: 10 },
    { id: 'play50', icon: '🏆', ar: 'بطل الألعاب', hint: 'العب 50 مرة', have: this.stats.totalPlays(), need: 50 },
    { id: 'explorer', icon: '🧭', ar: 'المستكشف', hint: 'جرّب 10 ألعاب مختلفة', have: this.stats.gamesTried(), need: 10 },
    { id: 'streak3', icon: '🔥', ar: 'ثلاثة أيام', hint: 'ادخل 3 أيام ورا بعض', have: this.data.streak(), need: 3 },
    { id: 'streak7', icon: '🌋', ar: 'أسبوع كامل', hint: 'ادخل 7 أيام ورا بعض', have: this.data.streak(), need: 7 },
    { id: 'stars50', icon: '⭐', ar: 'جامع النجوم', hint: 'اجمع 50 نجمة', have: this.stats.totalStars(), need: 50 },
    { id: 'stars200', icon: '🌟', ar: 'نجم ساطع', hint: 'اجمع 200 نجمة', have: this.stats.totalStars(), need: 200 },
    { id: 'perfect3', icon: '💯', ar: 'الدرجة الكاملة', hint: '3 نتائج كاملة', have: this.stats.perfects(), need: 3 },
    { id: 'missions7', icon: '🎯', ar: 'منفّذ المهام', hint: 'أنجز 7 مهام', have: this.stats.missionsDone(), need: 7 },
    { id: 'letters', icon: '🔤', ar: 'خبير الحروف', hint: 'تعلّم 26 حرف', have: this.data.learned().size, need: 26 },
    { id: 'pet', icon: '🐔', ar: 'مربّي الحيوانات', hint: 'كبّر حيوانك لدجاجة', have: this.pet.stageIndex(), need: 3 }
  ]);

  unlocked = computed(() => this.badges().filter(b => b.have >= b.need).length);

  min(a: number, b: number) { return Math.min(a, b); }

  claim(id: string, reward: number) {
    this.audio.playSoundEffect('ding');
    this.stats.claim(id, reward, n => this.data.addStars(n));
  }
}
