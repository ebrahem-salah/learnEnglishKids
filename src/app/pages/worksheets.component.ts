import { Component, ElementRef, computed, inject, signal, viewChild } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { DataService } from '../services/data.service';
import { ALPHABET, shuffle, wordPool } from './game-utils';

type Kind = 'trace' | 'match' | 'missing' | 'count';

const KINDS: { id: Kind; icon: string; ar: string; hint: string }[] = [
  { id: 'trace', icon: '✏️', ar: 'تتبّع الحرف', hint: 'الطفل يمشي بالقلم فوق الحرف المنقّط' },
  { id: 'match', icon: '🔗', ar: 'وصّل الكلمة بالصورة', hint: 'يوصّل بخط بين الصورة وكلمتها' },
  { id: 'missing', icon: '🔡', ar: 'الحرف الناقص', hint: 'يكتب الحرف الناقص في الكلمة' },
  { id: 'count', icon: '🔢', ar: 'عدّ واكتب الرقم', hint: 'يعدّ الصور ويكتب الرقم' }
];

const CSS = `
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { font-family: 'Cairo', Arial, Tahoma, sans-serif; margin: 0; color: #1f2937; }
  .page { width: 186mm; min-height: 270mm; padding: 4mm; }
  h1 { font-size: 22pt; margin: 0 0 2mm; color: #1d4ed8; display: flex; justify-content: space-between; align-items: baseline; }
  .name { font-size: 12pt; color: #6b7280; font-weight: 600; }
  .sub { font-size: 11pt; color: #6b7280; margin-bottom: 6mm; }
  .row { display: flex; align-items: center; gap: 4mm; border-bottom: 2px dashed #cbd5e1; padding: 3mm 0; }
  .emoji { font-size: 34pt; line-height: 1; }
  .box { width: 22mm; height: 16mm; border: 2.5px solid #94a3b8; border-radius: 4mm; margin-inline-start: auto; }
  .blank { display: inline-block; width: 12mm; border-bottom: 3px solid #1d4ed8; margin: 0 1mm; }
  .word { font-size: 24pt; font-weight: 800; letter-spacing: 1.5mm; }
  .match { display: flex; justify-content: space-between; margin-top: 6mm; }
  .col { display: flex; flex-direction: column; gap: 9mm; }
  .dot { display: inline-block; width: 4mm; height: 4mm; border-radius: 50%; background: #3b82f6; margin: 0 3mm; }
  .cell { display: flex; align-items: center; height: 24mm; }
  .cell.w { font-size: 20pt; font-weight: 800; }
  .count-row { display: flex; align-items: center; gap: 3mm; border-bottom: 2px dashed #cbd5e1; padding: 3mm 0; }
  .count-row .emojis { font-size: 24pt; line-height: 1.2; flex: 1; }
  .foot { margin-top: 6mm; font-size: 9pt; color: #9ca3af; text-align: center; }
`;

@Component({
  selector: 'app-worksheets',
  standalone: true,
  template: `
    <div class="max-w-5xl mx-auto space-y-5" dir="rtl">
      <div class="bg-white rounded-3xl shadow-xl border-4 border-amber-200 p-6">
        <h2 class="text-3xl font-black text-amber-700 text-center mb-1">🖨️ أوراق عمل للطباعة</h2>
        <p class="text-center font-bold text-gray-500 mb-4">اختر النوع، ثم اضغط «طباعة / حفظ PDF» (ورقة A4 جاهزة).</p>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          @for (k of kinds; track k.id) {
            <button (click)="kind.set(k.id); refresh()" class="rounded-2xl p-3 border-4 text-center transition-all"
                    [class]="kind() === k.id ? 'bg-amber-100 border-amber-400 scale-105' : 'bg-white border-amber-100'">
              <div class="text-4xl">{{ k.icon }}</div>
              <div class="font-black text-gray-800">{{ k.ar }}</div>
              <div class="text-xs font-bold text-gray-500">{{ k.hint }}</div>
            </button>
          }
        </div>

        <div class="flex flex-wrap items-center gap-3 mt-4 justify-center">
          @if (kind() === 'trace') {
            <label class="font-black text-gray-700">الحرف:
              <select class="border-2 border-amber-300 rounded-xl px-3 py-1 font-black" [value]="letter()" (change)="letter.set($any($event.target).value)">
                @for (l of letters; track l) { <option [value]="l">{{ l }}</option> }
              </select>
            </label>
          } @else if (kind() === 'match' || kind() === 'missing') {
            <label class="font-black text-gray-700">الموضوع:
              <select class="border-2 border-amber-300 rounded-xl px-3 py-1 font-black" [value]="topic()" (change)="topic.set($any($event.target).value)">
                <option value="all">كل الكلمات</option>
                @for (c of data.extraCategories; track c.id) { <option [value]="c.id">{{ c.title }}</option> }
              </select>
            </label>
          }
          <button (click)="refresh()" class="px-4 py-2 rounded-xl bg-sky-100 text-sky-800 font-black border-2 border-sky-200">🔄 ورقة جديدة</button>
          <button (click)="print()" class="px-6 py-2 rounded-xl bg-green-500 text-white font-black shadow-[0_4px_0_#15803d] active:translate-y-1 active:shadow-none transition-all">🖨️ طباعة / حفظ PDF</button>
        </div>
      </div>

      <iframe #frame [srcdoc]="srcdoc()" title="معاينة الورقة" class="w-full h-[75vh] bg-white rounded-2xl border-4 border-amber-100 shadow-lg"></iframe>
    </div>
  `
})
export class WorksheetsComponent {
  data = inject(DataService);
  private san = inject(DomSanitizer);
  private frame = viewChild.required<ElementRef<HTMLIFrameElement>>('frame');

  kinds = KINDS;
  letters = ALPHABET;
  kind = signal<Kind>('trace');
  letter = signal('A');
  topic = signal('all');
  private seed = signal(0);

  refresh() { this.seed.update(s => s + 1); }

  srcdoc = computed(() => {
    this.seed(); // new random sheet on refresh
    const body = this.build();
    const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
      <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;800&display=swap" rel="stylesheet">
      <style>${CSS}</style></head><body><div class="page" dir="rtl">${body}
      <div class="foot">تعلم مع يونس · Learn With Younis</div></div></body></html>`;
    return this.san.bypassSecurityTrustHtml(html);
  });

  print() { this.frame().nativeElement.contentWindow?.print(); }

  private pool(): { word: string; ar: string; emoji: string }[] {
    const all = wordPool(this.data);
    if (this.topic() === 'all') return all;
    const cat = this.data.extraCategories.find(c => c.id === this.topic());
    const set = new Set((cat?.items ?? []).map(i => i.en.toLowerCase()));
    const f = all.filter(w => set.has(w.word.toLowerCase()));
    return f.length >= 4 ? f : all;
  }

  private build(): string {
    const head = (title: string, sub: string) =>
      `<h1><span>${title}</span><span class="name">الاسم: ${this.data.childName() || '____________'}</span></h1><div class="sub">${sub}</div>`;
    const kind = this.kind();

    if (kind === 'trace') {
      const L = this.letter();
      const ex = wordPool(this.data).find(w => w.letter === L);
      const glyph = (txt: string) => `<svg width="110" height="100" viewBox="0 0 110 100"><text x="55" y="82" text-anchor="middle" font-family="Arial, sans-serif" font-weight="900" font-size="96" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-dasharray="5 5">${txt}</text></svg>`;
      const row = () => `<div class="row">${[`${L}`, `${L.toLowerCase()}`, `${L}`, `${L.toLowerCase()}`, `${L}`].map(glyph).join('')}</div>`;
      return head(`Trace the letter ${L} ${L.toLowerCase()}`, ex ? `${L} is for ${ex.word} ${ex.emoji}` : '') + Array.from({ length: 7 }, row).join('');
    }

    if (kind === 'match') {
      const items = shuffle(this.pool()).slice(0, 6);
      const words = shuffle(items);
      return head('Match the picture to the word', 'صِل كل صورة بكلمتها') +
        `<div class="match"><div class="col">${items.map(i => `<div class="cell"><span class="emoji">${i.emoji}</span></div>`).join('')}</div>
          <div class="col">${items.map(() => `<div class="cell"><span class="dot"></span></div>`).join('')}</div>
          <div class="col" dir="ltr">${words.map(w => `<div class="cell w"><span class="dot"></span>${w.word}</div>`).join('')}</div></div>`;
    }

    if (kind === 'missing') {
      const items = shuffle(this.pool().filter(w => /^[A-Za-z]{3,7}$/.test(w.word))).slice(0, 8);
      const row = (w: { word: string; emoji: string; ar: string }) => {
        const i = Math.floor(Math.random() * w.word.length);
        const shown = w.word.toUpperCase().split('').map((c, k) => (k === i ? '<span class="blank"></span>' : c)).join('');
        return `<div class="row"><span class="emoji">${w.emoji}</span><span class="word" dir="ltr">${shown}</span></div>`;
      };
      return head('Write the missing letter', 'اكتب الحرف الناقص في كل كلمة') + items.map(row).join('');
    }

    // count
    const icons = shuffle(wordPool(this.data).map(w => w.emoji)).slice(0, 8);
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).slice(0, 8);
    return head('Count and write the number', 'عُدّ الصور واكتب الرقم') +
      nums.map((n, i) => `<div class="count-row"><div class="emojis">${icons[i].repeat(n)}</div><div class="box"></div></div>`).join('');
  }
}
