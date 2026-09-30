import { Component, ViewChild, ElementRef, AfterViewInit, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { StrokeGuideComponent } from '../components/stroke-guide.component';

@Component({
  selector: 'app-tracing',
  standalone: true,
  imports: [StrokeGuideComponent],
  template: `
    <div class="bg-white rounded-3xl p-6 md:p-8 shadow-xl border-4 border-amber-300 text-center max-w-5xl mx-auto">
      <h2 class="text-3xl font-black text-amber-700 mb-2">✏️ السبورة التفاعلية: ارسم وتعلّم الكلمات والحروف</h2>
      <p class="text-gray-600 font-bold mb-4">اختر حرفاً لتعلم كتابته، أو انطلق من صفحة الحروف لتعلم كتابة أي كلمة!</p>
      
      <!-- قائمة اختيار الحروف -->
      <div class="flex flex-wrap justify-center gap-2 mb-6 max-h-36 overflow-y-auto p-2 bg-amber-50 rounded-2xl border border-amber-200">
        @for (a of data.alphabetData; track a.letter) {
          <button (click)="setTracingText(a.letter)"
            class="w-10 h-10 rounded-xl font-black text-xl transition-all shadow-sm"
            [class]="data.tracingText() === a.letter ? 'bg-amber-500 text-white scale-110 shadow-md' : 'bg-white text-gray-700 hover:bg-amber-100'">
            {{ a.letter }}
          </button>
        }
      </div>

      <!-- عرض الحرف، الكلمة الصورية، والسبورة -->
      <div class="flex flex-col md:flex-row items-center justify-center gap-6">
        
        <!-- كارت الحرف والصورة التوضيحية -->
        <div class="bg-amber-100/60 p-6 rounded-3xl border-2 border-amber-200 text-center w-full md:w-72 shadow-inner flex flex-col justify-center items-center min-h-[300px]">
          @if (data.tracingText().length === 1) {
            <div class="text-8xl md:text-9xl font-black text-amber-600 mb-6 drop-shadow-md">
              {{ data.tracingText() }}<span class="text-6xl md:text-7xl text-amber-400 ml-2">{{ data.tracingText().toLowerCase() }}</span>
            </div>

            <div class="flex gap-2 w-full mb-2">
              <button (click)="audio.speak(data.tracingText(), 'en-US')" class="bg-amber-500 text-white px-3 py-3 rounded-xl font-black hover:bg-amber-600 shadow-md flex-1 text-base">
                🔊 اسم الحرف
              </button>
              <button (click)="audio.playPhonics(data.tracingText())" class="bg-pink-500 text-white px-3 py-3 rounded-xl font-black hover:bg-pink-600 shadow-md flex-1 text-base">
                🗣️ صوت الحرف
              </button>
            </div>
            <p class="text-gray-600 font-bold mt-2">تتبع مسار الحرف في السبورة المجاورة ➡️</p>
          } @else {
            <div class="text-5xl md:text-6xl font-black text-amber-600 mb-6 py-4 drop-shadow-md">
              {{ data.tracingText() }}
            </div>
            <button (click)="audio.speak(data.tracingText(), 'en-US')" class="bg-amber-500 text-white px-5 py-3 rounded-full font-black hover:bg-amber-600 shadow-md w-full text-lg mb-2">
              🔊 انطق الكلمة
            </button>
            <p class="text-gray-600 font-bold mt-4">قم بتتبع الكلمة كاملة في السبورة المجاورة ➡️</p>
          }
        </div>

        <!-- دليل كتابة الحرف (Stroke Order) - فقط للحروف -->
        @if (data.tracingText().length === 1) {
          <div class="bg-blue-50 p-4 rounded-3xl border-2 border-blue-200 text-center w-full md:w-56 shadow-inner flex flex-col items-center justify-center">
            <h3 class="font-black text-blue-700 mb-2">طريقة الكتابة الصحيحة</h3>
            <app-stroke-guide [text]="data.tracingText()"></app-stroke-guide>
          </div>
        }

        <!-- سبورة الرسم والتتبع -->
        <div class="relative bg-amber-50 rounded-3xl border-4 border-dashed border-amber-400 p-2 shadow-inner w-full md:w-auto">
          <canvas #tracingCanvas width="400" height="320" class="bg-white rounded-2xl cursor-crosshair touch-none shadow max-w-full"></canvas>
          
          <div class="flex flex-col gap-4 mt-4 px-2 w-full">
            <!-- شريط الألوان -->
            <div class="flex gap-2 flex-wrap justify-center bg-white p-2 rounded-2xl shadow-sm border-2 border-amber-200">
              <button (click)="setPenColor('#ef4444')" class="w-8 h-8 rounded-full bg-red-500 border-2 border-white shadow hover:scale-110 transition-transform" [class.ring-4]="penColor === '#ef4444'"></button>
              <button (click)="setPenColor('#f97316')" class="w-8 h-8 rounded-full bg-orange-500 border-2 border-white shadow hover:scale-110 transition-transform" [class.ring-4]="penColor === '#f97316'"></button>
              <button (click)="setPenColor('#eab308')" class="w-8 h-8 rounded-full bg-yellow-500 border-2 border-white shadow hover:scale-110 transition-transform" [class.ring-4]="penColor === '#eab308'"></button>
              <button (click)="setPenColor('#10b981')" class="w-8 h-8 rounded-full bg-green-500 border-2 border-white shadow hover:scale-110 transition-transform" [class.ring-4]="penColor === '#10b981'"></button>
              <button (click)="setPenColor('#3b82f6')" class="w-8 h-8 rounded-full bg-blue-500 border-2 border-white shadow hover:scale-110 transition-transform" [class.ring-4]="penColor === '#3b82f6'"></button>
              <button (click)="setPenColor('#8b5cf6')" class="w-8 h-8 rounded-full bg-purple-500 border-2 border-white shadow hover:scale-110 transition-transform" [class.ring-4]="penColor === '#8b5cf6'"></button>
              <button (click)="setPenColor('#ec4899')" class="w-8 h-8 rounded-full bg-pink-500 border-2 border-white shadow hover:scale-110 transition-transform" [class.ring-4]="penColor === '#ec4899'"></button>
              <button (click)="setPenColor('#000000')" class="w-8 h-8 rounded-full bg-black border-2 border-white shadow hover:scale-110 transition-transform" [class.ring-4]="penColor === '#000000'"></button>
            </div>
            
            <!-- أزرار التحكم -->
            <div class="flex justify-center gap-4">
              <button (click)="downloadCanvas()" class="bg-indigo-500 text-white px-6 py-2 rounded-full font-black hover:bg-indigo-600 shadow-md text-base flex items-center gap-2 transition-transform hover:scale-105">
                💾 حفظ الرسمة
              </button>
              <button (click)="clearTracingCanvas()" class="bg-red-500 text-white px-6 py-2 rounded-full font-black hover:bg-red-600 shadow-md text-base flex items-center gap-2 transition-transform hover:scale-105">
                🗑️ مسح
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class TracingComponent implements AfterViewInit {
  @ViewChild('tracingCanvas') tracingCanvas?: ElementRef<HTMLCanvasElement>;

  data = inject(DataService);
  audio = inject(AudioService);

  private isDrawing = false;
  penColor = '#ef4444';

  ngAfterViewInit() {
    this.initCanvas();
  }

  getAssociatedWord() {
    const text = this.data.tracingText();
    if (text.length !== 1) return null;
    const item = this.data.alphabetData.find(a => a.letter === text);
    return item ? item.words[0] : null;
  }

  getLetterGif() {
    const text = this.data.tracingText();
    if (text.length !== 1) return null;
    const item = this.data.alphabetData.find(a => a.letter === text);
    return item?.gifUrl || null;
  }

  setTracingText(text: string) {
    this.data.tracingText.set(text);
    this.clearTracingCanvas();
    const wordObj = this.getAssociatedWord();
    if (wordObj && text.length === 1) {
      this.audio.speak(text + ' for ' + wordObj.word, 'en-US');
    } else {
      this.audio.speak(text, 'en-US');
    }
  }

  setPenColor(color: string) {
    this.penColor = color;
  }

  downloadCanvas() {
    if (!this.tracingCanvas) return;
    const cvs = this.tracingCanvas.nativeElement;
    // Create a temporary canvas to draw the white background before saving
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = cvs.width;
    tempCanvas.height = cvs.height;
    const ctx = tempCanvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      ctx.drawImage(cvs, 0, 0);
      const dataUrl = tempCanvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `my-drawing-${this.data.tracingText()}.png`;
      link.href = dataUrl;
      link.click();
      
      this.data.addStars(5);
      alert('🎉 أحسنت! تم حفظ رسمتك وحصلت على 5 نجوم ذهبية!');
    }
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

    const text = this.data.tracingText();
    let displayText = text;
    let fontSize = 180;

    if (text.length === 1) {
      // Just trace the capital and small letter (e.g., Aa)
      displayText = text + text.toLowerCase();
    } else {
      // Trace a word, scale down font
      fontSize = Math.min(180, Math.floor(cvs.width / text.length * 1.5));
    }

    ctx.font = `bold ${fontSize}px Cairo, sans-serif`;
    ctx.fillStyle = '#f3f4f6';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(displayText, cvs.width / 2, cvs.height / 2);

    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = text.length === 1 ? 5 : 3;
    ctx.setLineDash(text.length === 1 ? [8, 8] : [5, 5]);
    ctx.strokeText(displayText, cvs.width / 2, cvs.height / 2);
    ctx.setLineDash([]);
  }
}
