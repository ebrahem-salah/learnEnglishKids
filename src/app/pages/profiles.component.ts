import { Component, inject, signal } from '@angular/core';
import { AVATARS, MAX_PROFILES, Profile, ProfileService } from '../services/profile.service';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-profiles',
  standalone: true,
  template: `
    <div class="max-w-3xl mx-auto space-y-6" dir="rtl">
      <div class="bg-white rounded-3xl shadow-xl border-4 border-sky-200 p-6 text-center">
        <h2 class="text-3xl font-black text-sky-700 mb-1">👨‍👩‍👧‍👦 الأطفال</h2>
        <p class="font-bold text-gray-500">لكل طفل نجومه وتقدمه وحيوانه الأليف الخاص به.</p>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-4">
        @for (p of ps.profiles(); track p.id) {
          <div class="rounded-3xl p-4 text-center border-4 shadow-lg transition-all"
               [class]="p.id === ps.activeId() ? 'bg-gradient-to-b from-yellow-100 to-orange-100 border-orange-400 scale-105' : 'bg-white border-sky-100'">
            <div class="text-7xl mb-1">{{ p.avatar }}</div>
            <div class="font-black text-xl text-gray-800 truncate">{{ ps.nameOf(p) }}</div>
            @if (p.id === ps.activeId()) {
              <div class="mt-2 text-sm font-black text-orange-600">✅ الطفل الحالي ({{ data.stars() }} ⭐)</div>
              <div class="mt-2 flex flex-wrap justify-center gap-1">
                @for (a of avatars; track a) {
                  <button (click)="ps.setAvatar(a)" class="text-xl w-8 h-8 rounded-full hover:bg-white" [attr.aria-label]="'avatar ' + a">{{ a }}</button>
                }
              </div>
            } @else {
              <button (click)="ps.switchTo(p.id)" class="mt-3 w-full py-2 rounded-2xl bg-sky-500 text-white font-black shadow-[0_4px_0_#0369a1] active:translate-y-1 active:shadow-none transition-all">
                العب بهذا الحساب
              </button>
              @if (confirmDelete() === p.id) {
                <button (click)="ps.remove(p.id); confirmDelete.set(null)" class="mt-2 w-full py-1 rounded-xl bg-red-500 text-white font-black text-sm">تأكيد الحذف نهائيًا</button>
              } @else {
                <button (click)="confirmDelete.set(p.id)" class="mt-2 text-xs font-bold text-red-400 underline">حذف</button>
              }
            }
          </div>
        }

        @if (ps.profiles().length < max) {
          <button (click)="adding.set(true)" class="rounded-3xl p-4 text-center border-4 border-dashed border-sky-300 bg-sky-50 hover:bg-sky-100 flex flex-col items-center justify-center min-h-[11rem]">
            <span class="text-6xl">➕</span>
            <span class="font-black text-sky-700 mt-2">إضافة طفل</span>
          </button>
        }
      </div>

      @if (adding()) {
        <div class="bg-white rounded-3xl shadow-xl border-4 border-green-200 p-6 text-center">
          <h3 class="text-2xl font-black text-green-700 mb-3">اختر شخصية للطفل الجديد</h3>
          <div class="flex flex-wrap justify-center gap-3 mb-4">
            @for (a of avatars; track a) {
              <button (click)="chosen.set(a)" class="text-5xl w-20 h-20 rounded-2xl border-4 transition-all"
                      [class]="chosen() === a ? 'border-green-500 bg-green-50 scale-110' : 'border-gray-200 bg-white'">{{ a }}</button>
            }
          </div>
          <p class="font-bold text-gray-500 mb-3">بعد الضغط ستفتح الصفحة من جديد ويكتب الطفل اسمه.</p>
          <button (click)="ps.add(chosen())" class="px-8 py-3 rounded-2xl bg-green-500 text-white text-xl font-black shadow-[0_6px_0_#15803d] active:translate-y-1.5 active:shadow-none transition-all">ابدأ</button>
          <button (click)="adding.set(false)" class="mr-3 font-bold text-gray-500 underline">إلغاء</button>
        </div>
      }
    </div>
  `
})
export class ProfilesComponent {
  ps = inject(ProfileService);
  data = inject(DataService);
  avatars = AVATARS;
  max = MAX_PROFILES;
  adding = signal(false);
  chosen = signal(AVATARS[1]);
  confirmDelete = signal<string | null>(null);
  trackById(_: number, p: Profile) { return p.id; }
}
