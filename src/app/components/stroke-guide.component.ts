import { Component, Input, ViewChild, ElementRef, OnChanges, SimpleChanges, AfterViewInit, inject, ChangeDetectorRef } from '@angular/core';

interface Point { x: number; y: number; }
interface MoveSegment { type: 'move'; p: Point; }
interface LineSegment { type: 'line'; p0: Point; p1: Point; }
interface BezierSegment { type: 'bezier'; p0: Point; p1: Point; p2: Point; p3: Point; }
type Segment = MoveSegment | LineSegment | BezierSegment;

@Component({
  selector: 'app-stroke-guide',
  standalone: true,
  template: `
    <div class="relative flex flex-col items-center w-full">
      <div class="flex gap-2 w-full mb-3">
        <button (click)="setCase(true)" [class]="isUpper ? 'bg-amber-500 text-white shadow-inner' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'" class="flex-1 py-1.5 rounded-full font-black text-lg transition-all">{{ text.charAt(0).toUpperCase() }}</button>
        <button (click)="setCase(false)" [class]="!isUpper ? 'bg-amber-500 text-white shadow-inner' : 'bg-white text-gray-500 hover:bg-gray-100 border border-gray-200'" class="flex-1 py-1.5 rounded-full font-black text-lg transition-all">{{ text.charAt(0).toLowerCase() }}</button>
      </div>

      <div class="relative bg-white rounded-2xl shadow-inner border-2 border-blue-200 overflow-hidden" style="width: 200px; height: 200px;">
        <canvas #guideCanvas width="400" height="400" class="w-full h-full"
                style="background-image: linear-gradient(#f1f5f9 2px, transparent 2px), linear-gradient(90deg, #f1f5f9 2px, transparent 2px); background-size: 40px 40px;">
        </canvas>
        @if (!hasPath) {
          <div class="absolute inset-0 flex items-center justify-center bg-white/80 p-4 text-center">
            <span class="text-sm font-bold text-gray-500">مسار الحرف غير متوفر بعد، سيتم إضافته قريباً!</span>
          </div>
        }
      </div>
      <button (click)="drawLetterAnimated()" [disabled]="isAnimating || !hasPath" 
              class="mt-3 bg-blue-500 text-white px-4 py-2 rounded-full font-black text-sm hover:bg-blue-600 shadow disabled:opacity-50 transition-all w-full flex items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        إعادة الرسم
      </button>
    </div>
  `
})
export class StrokeGuideComponent implements AfterViewInit, OnChanges {
  @Input() text: string = 'A'; // Can be 'A' or 'a' or even a word, but we take the first char.
  @ViewChild('guideCanvas') canvasRef?: ElementRef<HTMLCanvasElement>;

  cdr = inject(ChangeDetectorRef);
  private ctx?: CanvasRenderingContext2D | null;
  isAnimating = false;
  hasPath = false;
  isUpper = true;
  private animationFrameId?: number;

  // قاموس مسارات الحروف (مأخوذ من طلبك وموسع)
  private letterData: Record<string, Segment[]> = {
    'a': [
        {
            'type': 'move',
            'p': {
                'x': 250,
                'y': 150
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 250,
                'y': 150
            },
            'p1': {
                'x': 180,
                'y': 120
            },
            'p2': {
                'x': 120,
                'y': 150
            },
            'p3': {
                'x': 100,
                'y': 220
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 220
            },
            'p1': {
                'x': 90,
                'y': 290
            },
            'p2': {
                'x': 160,
                'y': 310
            },
            'p3': {
                'x': 220,
                'y': 270
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 220,
                'y': 270
            },
            'p1': {
                'x': 250,
                'y': 150
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 250,
                'y': 150
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 150
            },
            'p1': {
                'x': 250,
                'y': 290
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 250,
                'y': 290
            },
            'p1': {
                'x': 250,
                'y': 320
            },
            'p2': {
                'x': 280,
                'y': 320
            },
            'p3': {
                'x': 310,
                'y': 290
            }
        }
    ],
    'b': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 80
            },
            'p1': {
                'x': 120,
                'y': 300
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 180
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 120,
                'y': 180
            },
            'p1': {
                'x': 200,
                'y': 170
            },
            'p2': {
                'x': 240,
                'y': 210
            },
            'p3': {
                'x': 240,
                'y': 250
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 240,
                'y': 250
            },
            'p1': {
                'x': 240,
                'y': 290
            },
            'p2': {
                'x': 190,
                'y': 310
            },
            'p3': {
                'x': 120,
                'y': 300
            }
        }
    ],
    'c': [
        {
            'type': 'move',
            'p': {
                'x': 260,
                'y': 160
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 260,
                'y': 160
            },
            'p1': {
                'x': 200,
                'y': 120
            },
            'p2': {
                'x': 120,
                'y': 140
            },
            'p3': {
                'x': 100,
                'y': 220
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 220
            },
            'p1': {
                'x': 90,
                'y': 290
            },
            'p2': {
                'x': 160,
                'y': 320
            },
            'p3': {
                'x': 260,
                'y': 280
            }
        }
    ],
    'd': [
        {
            'type': 'move',
            'p': {
                'x': 250,
                'y': 150
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 250,
                'y': 150
            },
            'p1': {
                'x': 180,
                'y': 120
            },
            'p2': {
                'x': 120,
                'y': 150
            },
            'p3': {
                'x': 100,
                'y': 220
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 220
            },
            'p1': {
                'x': 90,
                'y': 290
            },
            'p2': {
                'x': 160,
                'y': 310
            },
            'p3': {
                'x': 220,
                'y': 270
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 220,
                'y': 270
            },
            'p1': {
                'x': 250,
                'y': 150
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 250,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 80
            },
            'p1': {
                'x': 250,
                'y': 290
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 250,
                'y': 290
            },
            'p1': {
                'x': 250,
                'y': 320
            },
            'p2': {
                'x': 280,
                'y': 320
            },
            'p3': {
                'x': 310,
                'y': 290
            }
        }
    ],
    'e': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 250
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 250
            },
            'p1': {
                'x': 260,
                'y': 250
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 260,
                'y': 250
            },
            'p1': {
                'x': 260,
                'y': 150
            },
            'p2': {
                'x': 100,
                'y': 150
            },
            'p3': {
                'x': 100,
                'y': 250
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 250
            },
            'p1': {
                'x': 100,
                'y': 350
            },
            'p2': {
                'x': 260,
                'y': 350
            },
            'p3': {
                'x': 260,
                'y': 300
            }
        }
    ],
    'f': [
        {
            'type': 'move',
            'p': {
                'x': 200,
                'y': 80
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 200,
                'y': 80
            },
            'p1': {
                'x': 150,
                'y': 80
            },
            'p2': {
                'x': 150,
                'y': 130
            },
            'p3': {
                'x': 150,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 150,
                'y': 180
            },
            'p1': {
                'x': 150,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 180
            },
            'p1': {
                'x': 220,
                'y': 180
            }
        }
    ],
    'g': [
        {
            'type': 'move',
            'p': {
                'x': 250,
                'y': 180
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 250,
                'y': 180
            },
            'p1': {
                'x': 250,
                'y': 100
            },
            'p2': {
                'x': 100,
                'y': 100
            },
            'p3': {
                'x': 100,
                'y': 250
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 250
            },
            'p1': {
                'x': 100,
                'y': 300
            },
            'p2': {
                'x': 250,
                'y': 300
            },
            'p3': {
                'x': 250,
                'y': 250
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 250
            },
            'p1': {
                'x': 250,
                'y': 320
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 250,
                'y': 320
            },
            'p1': {
                'x': 250,
                'y': 400
            },
            'p2': {
                'x': 100,
                'y': 400
            },
            'p3': {
                'x': 100,
                'y': 360
            }
        }
    ],
    'h': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 80
            },
            'p1': {
                'x': 120,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 200
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 120,
                'y': 200
            },
            'p1': {
                'x': 120,
                'y': 150
            },
            'p2': {
                'x': 250,
                'y': 150
            },
            'p3': {
                'x': 250,
                'y': 220
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 220
            },
            'p1': {
                'x': 250,
                'y': 320
            }
        }
    ],
    'i': [
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 180
            },
            'p1': {
                'x': 190,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 120
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 120
            },
            'p1': {
                'x': 190,
                'y': 125
            }
        }
    ],
    'j': [
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 180
            },
            'p1': {
                'x': 190,
                'y': 350
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 190,
                'y': 350
            },
            'p1': {
                'x': 190,
                'y': 400
            },
            'p2': {
                'x': 120,
                'y': 400
            },
            'p3': {
                'x': 120,
                'y': 360
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 120
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 120
            },
            'p1': {
                'x': 190,
                'y': 125
            }
        }
    ],
    'k': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 80
            },
            'p1': {
                'x': 120,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 250,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 180
            },
            'p1': {
                'x': 120,
                'y': 250
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 250
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 250
            },
            'p1': {
                'x': 250,
                'y': 320
            }
        }
    ],
    'l': [
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 80
            },
            'p1': {
                'x': 190,
                'y': 320
            }
        }
    ],
    'm': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 180
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 200
            },
            'p1': {
                'x': 100,
                'y': 150
            },
            'p2': {
                'x': 190,
                'y': 150
            },
            'p3': {
                'x': 190,
                'y': 200
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 200
            },
            'p1': {
                'x': 190,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 200
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 190,
                'y': 200
            },
            'p1': {
                'x': 190,
                'y': 150
            },
            'p2': {
                'x': 280,
                'y': 150
            },
            'p3': {
                'x': 280,
                'y': 200
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 280,
                'y': 200
            },
            'p1': {
                'x': 280,
                'y': 320
            }
        }
    ],
    'n': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 180
            },
            'p1': {
                'x': 120,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 200
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 120,
                'y': 200
            },
            'p1': {
                'x': 120,
                'y': 150
            },
            'p2': {
                'x': 250,
                'y': 150
            },
            'p3': {
                'x': 250,
                'y': 220
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 220
            },
            'p1': {
                'x': 250,
                'y': 320
            }
        }
    ],
    'o': [
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 180
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 190,
                'y': 180
            },
            'p1': {
                'x': 100,
                'y': 180
            },
            'p2': {
                'x': 100,
                'y': 320
            },
            'p3': {
                'x': 190,
                'y': 320
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 190,
                'y': 320
            },
            'p1': {
                'x': 280,
                'y': 320
            },
            'p2': {
                'x': 280,
                'y': 180
            },
            'p3': {
                'x': 190,
                'y': 180
            }
        }
    ],
    'p': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 180
            },
            'p1': {
                'x': 120,
                'y': 400
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 200
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 120,
                'y': 200
            },
            'p1': {
                'x': 120,
                'y': 150
            },
            'p2': {
                'x': 250,
                'y': 150
            },
            'p3': {
                'x': 250,
                'y': 250
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 250,
                'y': 250
            },
            'p1': {
                'x': 250,
                'y': 350
            },
            'p2': {
                'x': 120,
                'y': 350
            },
            'p3': {
                'x': 120,
                'y': 300
            }
        }
    ],
    'q': [
        {
            'type': 'move',
            'p': {
                'x': 250,
                'y': 180
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 250,
                'y': 180
            },
            'p1': {
                'x': 250,
                'y': 150
            },
            'p2': {
                'x': 120,
                'y': 150
            },
            'p3': {
                'x': 120,
                'y': 250
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 120,
                'y': 250
            },
            'p1': {
                'x': 120,
                'y': 350
            },
            'p2': {
                'x': 250,
                'y': 350
            },
            'p3': {
                'x': 250,
                'y': 300
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 300
            },
            'p1': {
                'x': 250,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 180
            },
            'p1': {
                'x': 250,
                'y': 400
            }
        }
    ],
    'r': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 180
            },
            'p1': {
                'x': 120,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 230
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 120,
                'y': 230
            },
            'p1': {
                'x': 120,
                'y': 180
            },
            'p2': {
                'x': 200,
                'y': 180
            },
            'p3': {
                'x': 240,
                'y': 190
            }
        }
    ],
    's': [
        {
            'type': 'move',
            'p': {
                'x': 250,
                'y': 200
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 250,
                'y': 200
            },
            'p1': {
                'x': 200,
                'y': 150
            },
            'p2': {
                'x': 120,
                'y': 180
            },
            'p3': {
                'x': 120,
                'y': 220
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 120,
                'y': 220
            },
            'p1': {
                'x': 120,
                'y': 260
            },
            'p2': {
                'x': 250,
                'y': 250
            },
            'p3': {
                'x': 250,
                'y': 280
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 250,
                'y': 280
            },
            'p1': {
                'x': 250,
                'y': 320
            },
            'p2': {
                'x': 120,
                'y': 340
            },
            'p3': {
                'x': 120,
                'y': 300
            }
        }
    ],
    't': [
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 120
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 120
            },
            'p1': {
                'x': 190,
                'y': 300
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 190,
                'y': 300
            },
            'p1': {
                'x': 190,
                'y': 340
            },
            'p2': {
                'x': 240,
                'y': 340
            },
            'p3': {
                'x': 260,
                'y': 300
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 140,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 140,
                'y': 180
            },
            'p1': {
                'x': 250,
                'y': 180
            }
        }
    ],
    'u': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 180
            },
            'p1': {
                'x': 120,
                'y': 280
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 120,
                'y': 280
            },
            'p1': {
                'x': 120,
                'y': 340
            },
            'p2': {
                'x': 250,
                'y': 340
            },
            'p3': {
                'x': 250,
                'y': 280
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 280
            },
            'p1': {
                'x': 250,
                'y': 180
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 250,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 180
            },
            'p1': {
                'x': 250,
                'y': 320
            }
        }
    ],
    'v': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 180
            },
            'p1': {
                'x': 190,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 320
            },
            'p1': {
                'x': 260,
                'y': 180
            }
        }
    ],
    'w': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 180
            },
            'p1': {
                'x': 140,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 140,
                'y': 320
            },
            'p1': {
                'x': 190,
                'y': 220
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 220
            },
            'p1': {
                'x': 240,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 240,
                'y': 320
            },
            'p1': {
                'x': 280,
                'y': 180
            }
        }
    ],
    'x': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 180
            },
            'p1': {
                'x': 260,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 260,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 260,
                'y': 180
            },
            'p1': {
                'x': 120,
                'y': 320
            }
        }
    ],
    'y': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 180
            },
            'p1': {
                'x': 190,
                'y': 300
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 300
            },
            'p1': {
                'x': 260,
                'y': 180
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 300
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 300
            },
            'p1': {
                'x': 190,
                'y': 350
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 190,
                'y': 350
            },
            'p1': {
                'x': 190,
                'y': 400
            },
            'p2': {
                'x': 120,
                'y': 400
            },
            'p3': {
                'x': 120,
                'y': 380
            }
        }
    ],
    'z': [
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 180
            },
            'p1': {
                'x': 260,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 260,
                'y': 180
            },
            'p1': {
                'x': 120,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 320
            },
            'p1': {
                'x': 260,
                'y': 320
            }
        }
    ],
    'A': [
        {
            'type': 'move',
            'p': {
                'x': 200,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 200,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 200,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 200,
                'y': 80
            },
            'p1': {
                'x': 300,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 130,
                'y': 230
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 130,
                'y': 230
            },
            'p1': {
                'x': 270,
                'y': 230
            }
        }
    ],
    'B': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 250,
                'y': 80
            },
            'p2': {
                'x': 250,
                'y': 190
            },
            'p3': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 200
            },
            'p1': {
                'x': 280,
                'y': 200
            },
            'p2': {
                'x': 280,
                'y': 320
            },
            'p3': {
                'x': 100,
                'y': 320
            }
        }
    ],
    'C': [
        {
            'type': 'move',
            'p': {
                'x': 280,
                'y': 120
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 280,
                'y': 120
            },
            'p1': {
                'x': 200,
                'y': 40
            },
            'p2': {
                'x': 80,
                'y': 100
            },
            'p3': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 200
            },
            'p1': {
                'x': 100,
                'y': 320
            },
            'p2': {
                'x': 200,
                'y': 360
            },
            'p3': {
                'x': 280,
                'y': 280
            }
        }
    ],
    'D': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 280,
                'y': 80
            },
            'p2': {
                'x': 280,
                'y': 320
            },
            'p3': {
                'x': 100,
                'y': 320
            }
        }
    ],
    'E': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 280,
                'y': 80
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 200
            },
            'p1': {
                'x': 250,
                'y': 200
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 320
            },
            'p1': {
                'x': 280,
                'y': 320
            }
        }
    ],
    'F': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 280,
                'y': 80
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 200
            },
            'p1': {
                'x': 250,
                'y': 200
            }
        }
    ],
    'G': [
        {
            'type': 'move',
            'p': {
                'x': 280,
                'y': 120
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 280,
                'y': 120
            },
            'p1': {
                'x': 200,
                'y': 40
            },
            'p2': {
                'x': 80,
                'y': 100
            },
            'p3': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 200
            },
            'p1': {
                'x': 100,
                'y': 320
            },
            'p2': {
                'x': 200,
                'y': 360
            },
            'p3': {
                'x': 280,
                'y': 280
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 280,
                'y': 280
            },
            'p1': {
                'x': 280,
                'y': 200
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 280,
                'y': 200
            },
            'p1': {
                'x': 200,
                'y': 200
            }
        }
    ],
    'H': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 280,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 280,
                'y': 80
            },
            'p1': {
                'x': 280,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 200
            },
            'p1': {
                'x': 280,
                'y': 200
            }
        }
    ],
    'I': [
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 80
            },
            'p1': {
                'x': 190,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 80
            },
            'p1': {
                'x': 260,
                'y': 80
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 120,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 120,
                'y': 320
            },
            'p1': {
                'x': 260,
                'y': 320
            }
        }
    ],
    'J': [
        {
            'type': 'move',
            'p': {
                'x': 220,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 220,
                'y': 80
            },
            'p1': {
                'x': 220,
                'y': 250
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 220,
                'y': 250
            },
            'p1': {
                'x': 220,
                'y': 320
            },
            'p2': {
                'x': 100,
                'y': 320
            },
            'p3': {
                'x': 100,
                'y': 250
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 150,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 150,
                'y': 80
            },
            'p1': {
                'x': 290,
                'y': 80
            }
        }
    ],
    'K': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 280,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 280,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 200
            },
            'p1': {
                'x': 280,
                'y': 320
            }
        }
    ],
    'L': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 320
            },
            'p1': {
                'x': 280,
                'y': 320
            }
        }
    ],
    'M': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 320
            },
            'p1': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 190,
                'y': 200
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 200
            },
            'p1': {
                'x': 280,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 280,
                'y': 80
            },
            'p1': {
                'x': 280,
                'y': 320
            }
        }
    ],
    'N': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 320
            },
            'p1': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 280,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 280,
                'y': 320
            },
            'p1': {
                'x': 280,
                'y': 80
            }
        }
    ],
    'O': [
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 80
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 190,
                'y': 80
            },
            'p1': {
                'x': 80,
                'y': 80
            },
            'p2': {
                'x': 80,
                'y': 320
            },
            'p3': {
                'x': 190,
                'y': 320
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 190,
                'y': 320
            },
            'p1': {
                'x': 300,
                'y': 320
            },
            'p2': {
                'x': 300,
                'y': 80
            },
            'p3': {
                'x': 190,
                'y': 80
            }
        }
    ],
    'P': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 320
            },
            'p1': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 250,
                'y': 80
            },
            'p2': {
                'x': 250,
                'y': 200
            },
            'p3': {
                'x': 100,
                'y': 200
            }
        }
    ],
    'Q': [
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 80
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 190,
                'y': 80
            },
            'p1': {
                'x': 80,
                'y': 80
            },
            'p2': {
                'x': 80,
                'y': 300
            },
            'p3': {
                'x': 190,
                'y': 300
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 190,
                'y': 300
            },
            'p1': {
                'x': 300,
                'y': 300
            },
            'p2': {
                'x': 300,
                'y': 80
            },
            'p3': {
                'x': 190,
                'y': 80
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 230,
                'y': 230
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 230,
                'y': 230
            },
            'p1': {
                'x': 300,
                'y': 320
            }
        }
    ],
    'R': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 320
            },
            'p1': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 250,
                'y': 80
            },
            'p2': {
                'x': 250,
                'y': 200
            },
            'p3': {
                'x': 100,
                'y': 200
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 180,
                'y': 200
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 180,
                'y': 200
            },
            'p1': {
                'x': 280,
                'y': 320
            }
        }
    ],
    'S': [
        {
            'type': 'move',
            'p': {
                'x': 280,
                'y': 120
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 280,
                'y': 120
            },
            'p1': {
                'x': 200,
                'y': 50
            },
            'p2': {
                'x': 100,
                'y': 100
            },
            'p3': {
                'x': 100,
                'y': 150
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 150
            },
            'p1': {
                'x': 100,
                'y': 200
            },
            'p2': {
                'x': 280,
                'y': 200
            },
            'p3': {
                'x': 280,
                'y': 250
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 280,
                'y': 250
            },
            'p1': {
                'x': 280,
                'y': 300
            },
            'p2': {
                'x': 200,
                'y': 350
            },
            'p3': {
                'x': 100,
                'y': 280
            }
        }
    ],
    'T': [
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 80
            },
            'p1': {
                'x': 190,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 280,
                'y': 80
            }
        }
    ],
    'U': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 250
            }
        },
        {
            'type': 'bezier',
            'p0': {
                'x': 100,
                'y': 250
            },
            'p1': {
                'x': 100,
                'y': 350
            },
            'p2': {
                'x': 280,
                'y': 350
            },
            'p3': {
                'x': 280,
                'y': 250
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 280,
                'y': 250
            },
            'p1': {
                'x': 280,
                'y': 80
            }
        }
    ],
    'V': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 190,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 320
            },
            'p1': {
                'x': 280,
                'y': 80
            }
        }
    ],
    'W': [
        {
            'type': 'move',
            'p': {
                'x': 80,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 80,
                'y': 80
            },
            'p1': {
                'x': 130,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 130,
                'y': 320
            },
            'p1': {
                'x': 190,
                'y': 160
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 160
            },
            'p1': {
                'x': 250,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 250,
                'y': 320
            },
            'p1': {
                'x': 300,
                'y': 80
            }
        }
    ],
    'X': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 280,
                'y': 320
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 280,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 280,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        }
    ],
    'Y': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 190,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 180
            },
            'p1': {
                'x': 280,
                'y': 80
            }
        },
        {
            'type': 'move',
            'p': {
                'x': 190,
                'y': 180
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 190,
                'y': 180
            },
            'p1': {
                'x': 190,
                'y': 320
            }
        }
    ],
    'Z': [
        {
            'type': 'move',
            'p': {
                'x': 100,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 80
            },
            'p1': {
                'x': 280,
                'y': 80
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 280,
                'y': 80
            },
            'p1': {
                'x': 100,
                'y': 320
            }
        },
        {
            'type': 'line',
            'p0': {
                'x': 100,
                'y': 320
            },
            'p1': {
                'x': 280,
                'y': 320
            }
        }
    ]
};

  ngAfterViewInit() {
    if (this.canvasRef) {
      this.ctx = this.canvasRef.nativeElement.getContext('2d');
      if (this.ctx) {
        this.ctx.lineWidth = 24;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.strokeStyle = '#2563eb';
      }
    }
    this.checkPath();
    setTimeout(() => this.drawLetterAnimated(), 500);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['text']) {
      // By default, reset to upper case when a new letter is chosen
      this.isUpper = true;
      this.checkPath();
      this.drawLetterAnimated();
    }
  }

  setCase(upper: boolean) {
    if (this.isAnimating) return; // Prevent switching while drawing
    this.isUpper = upper;
    this.checkPath();
    this.drawLetterAnimated();
  }

  private checkPath() {
    let char = this.text.charAt(0);
    char = this.isUpper ? char.toUpperCase() : char.toLowerCase();
    this.hasPath = !!this.letterData[char];
  }

  private getBezierPoint(t: number, p0: Point, p1: Point, p2: Point, p3: Point): Point {
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    return {
      x: uuu * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + ttt * p3.x,
      y: uuu * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + ttt * p3.y
    };
  }

  private getLinePoint(t: number, p0: Point, p1: Point): Point {
    return {
      x: p0.x + (p1.x - p0.x) * t,
      y: p0.y + (p1.y - p0.y) * t
    };
  }

  clearCanvas() {
    if (!this.ctx || !this.canvasRef) return;
    this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    this.isAnimating = false;
  }

  drawLetterAnimated() {
    this.clearCanvas(); // Unconditionally clear canvas first
    if (!this.ctx || !this.hasPath) {
      return;
    }
    
    this.isAnimating = true;
    let char = this.text.charAt(0);
    char = this.isUpper ? char.toUpperCase() : char.toLowerCase();
    const path = this.letterData[char];
    
    let currentSegment = 0;
    let t = 0;
    const speed = 0.05;

    const animate = () => {
      if (!this.ctx) return;
      
      if (currentSegment >= path.length) {
        this.isAnimating = false;
        this.cdr.detectChanges(); // <-- Trigger update so button is re-enabled
        return;
      }

      const seg = path[currentSegment];
      
      if (seg.type === 'move') {
        this.ctx.beginPath();
        this.ctx.moveTo(seg.p.x, seg.p.y);
        currentSegment++;
        t = 0;
        this.animationFrameId = requestAnimationFrame(animate);
        return;
      }

      let currentPoint: Point;
      if (seg.type === 'bezier') {
        currentPoint = this.getBezierPoint(t, seg.p0, seg.p1, seg.p2, seg.p3);
      } else {
        currentPoint = this.getLinePoint(t, seg.p0, seg.p1);
      }

      this.ctx.lineTo(currentPoint.x, currentPoint.y);
      this.ctx.stroke();

      t += speed;

      if (t >= 1) {
        t = 0;
        currentSegment++;
        if (currentSegment < path.length && path[currentSegment].type !== 'move') {
          this.ctx.beginPath();
          this.ctx.moveTo(currentPoint.x, currentPoint.y);
        }
      }

      this.animationFrameId = requestAnimationFrame(animate);
    };

    animate();
  }
}
