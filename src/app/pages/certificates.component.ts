import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-certificates',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-amber-300 max-w-5xl mx-auto font-[Bubblegum]" dir="ltr">
      <!-- Top Title -->
      <div class="text-center mb-8">
        <div class="text-6xl mb-2 animate-bounce">🏆</div>
        <h2 class="text-3xl md:text-5xl font-black text-amber-600 mb-2">Certificates of Achievement</h2>
        <p class="text-gray-500 font-bold text-lg">Celebrate your milestones! Customize and print your official certificate!</p>
      </div>

      <!-- Certificate Type Selector -->
      <div class="flex justify-center gap-3 mb-8 flex-wrap">
        @for (cert of certTypes; track cert.id) {
          <button (click)="selectedCert.set(cert)"
                  class="px-5 py-2.5 rounded-2xl border-3 font-black text-base transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                  [class]="selectedCert().id === cert.id ? 'bg-amber-500 text-white border-amber-600 shadow-lg scale-105' : 'bg-amber-50 text-amber-900 border-amber-200 hover:bg-amber-100'">
            <span>{{ cert.icon }}</span>
            <span>{{ cert.title }}</span>
          </button>
        }
      </div>

      <!-- Student Name Input Control -->
      <div class="max-w-md mx-auto mb-8 bg-amber-50/70 p-4 rounded-2xl border-2 border-amber-200 flex items-center gap-3">
        <span class="text-2xl">✍️</span>
        <input #nameInput
               type="text"
               [value]="data.childName()"
               (input)="updateName(nameInput.value)"
               placeholder="Enter student or child name..."
               class="w-full bg-white px-4 py-2 rounded-xl border border-amber-300 font-black text-amber-900 text-lg focus:outline-none focus:border-amber-500 text-center" />
      </div>

      <!-- Printable Certificate Paper Sheet -->
      <div id="printable-certificate" class="relative bg-gradient-to-br from-amber-50 via-white to-yellow-50 rounded-[2.5rem] p-8 md:p-12 border-8 border-double border-amber-400 shadow-2xl text-center overflow-hidden my-6 select-none">
        <!-- Corner Medals -->
        <div class="absolute -top-6 -left-6 text-7xl opacity-20 pointer-events-none">⭐</div>
        <div class="absolute -top-6 -right-6 text-7xl opacity-20 pointer-events-none">⭐</div>
        <div class="absolute -bottom-6 -left-6 text-7xl opacity-20 pointer-events-none">🎓</div>
        <div class="absolute -bottom-6 -right-6 text-7xl opacity-20 pointer-events-none">🎉</div>

        <!-- Certificate Sub-Header -->
        <div class="text-amber-600 font-serif tracking-widest uppercase text-sm md:text-base font-extrabold mb-2">
          Certificate of Excellence & Completion
        </div>

        <h1 class="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 mb-4 font-serif">
          Learn English with Younis
        </h1>

        <p class="text-gray-500 text-base md:text-lg font-sans font-medium mb-4">
          This certificate is proudly awarded to:
        </p>

        <!-- Recipient Name -->
        <div class="inline-block border-b-4 border-amber-500 px-8 py-2 mb-6">
          <span class="text-3xl md:text-6xl font-black text-purple-900 tracking-wide font-sans">
            {{ recipientName() || 'Brilliant Champion' }}
          </span>
        </div>

        <!-- Reason / Milestone -->
        <p class="text-gray-700 text-lg md:text-xl font-bold max-w-xl mx-auto mb-8 leading-relaxed font-sans">
          For demonstrating extraordinary enthusiasm, mastering English letters, vocabulary, and games with outstanding excellence!
        </p>

        <!-- Stats & Badges -->
        <div class="flex justify-center items-center gap-6 mb-8 flex-wrap">
          <div class="bg-amber-100/80 px-4 py-2 rounded-2xl border border-amber-300 font-black text-amber-900 flex items-center gap-2">
            <span>⭐ Stars Earned:</span>
            <span class="text-xl text-amber-700">{{ data.stars() }}</span>
          </div>
          <div class="bg-green-100/80 px-4 py-2 rounded-2xl border border-green-300 font-black text-green-900 flex items-center gap-2">
            <span>📚 Letters Mastered:</span>
            <span class="text-xl text-green-700">{{ data.learned().size }} / 26</span>
          </div>
        </div>

        <!-- Seal & Date -->
        <div class="flex justify-between items-end max-w-lg mx-auto pt-6 border-t-2 border-amber-200">
          <div class="text-left font-sans">
            <div class="text-sm font-bold text-gray-500">Date Awarded:</div>
            <div class="font-black text-gray-800 text-base">{{ today | date:'mediumDate' }}</div>
          </div>

          <!-- Official Stamp Seal -->
          <div class="w-24 h-24 rounded-full border-4 border-dashed border-amber-500 flex flex-col items-center justify-center rotate-[-12deg] bg-amber-50 shadow-inner">
            <span class="text-3xl">🎖️</span>
            <span class="text-[10px] font-black uppercase text-amber-800 tracking-tighter">Verified</span>
          </div>

          <div class="text-right font-sans">
            <div class="text-sm font-bold text-gray-500">Supervised By:</div>
            <div class="font-black text-purple-800 text-base">Ebrahem Salah</div>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex justify-center gap-4 mt-6">
        <button (click)="printCert()" class="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xl px-8 py-3.5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
          <span>🖨️</span> Print / Save PDF
        </button>

        <button (click)="celebrate()" class="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-black text-xl px-8 py-3.5 rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all">
          <span>🎉</span> Celebrate!
        </button>
      </div>
    </div>
  `
})
export class CertificatesComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  today = new Date();

  certTypes = [
    { id: 'alphabet', title: 'Alphabet Explorer', icon: '🔤' },
    { id: 'mastery', title: 'Vocabulary Master', icon: '⭐' },
    { id: 'games', title: 'Game Champion', icon: '🎮' }
  ];

  selectedCert = signal(this.certTypes[0]);
  recipientName = signal(this.data.childName() || 'Brilliant Champion');

  updateName(name: string) {
    this.recipientName.set(name);
    if (name.trim()) {
      this.data.setChildName(name);
    }
  }

  printCert() {
    window.print();
  }

  celebrate() {
    this.audio.playCelebration();
    this.audio.speak('Congratulations ' + this.recipientName() + '! You are a true champion!', 'en-US');
  }
}
