import { Component, signal, inject } from '@angular/core';
import { DataService } from '../services/data.service';
import { AudioService } from '../services/audio.service';
import { NgClass } from '@angular/common';

interface PuzzlePiece {
  id: number;
  bgPosition: string;
  currentSlot: number | null; // null means in the pool
}

interface PuzzleSlot {
  id: number;
  expectedPieceId: number;
}

@Component({
  selector: 'app-puzzle-game',
  standalone: true,
  imports: [NgClass],
  template: `
    <div class="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-inner flex flex-col items-center select-none bg-gradient-to-b from-indigo-200 to-purple-100" dir="ltr">
        
        <div class="absolute top-4 w-full flex justify-between items-center px-8 z-30 pointer-events-none">
            <div class="bg-white/80 backdrop-blur-sm px-6 py-2 rounded-full font-black text-xl text-indigo-700 shadow-md">
                Score: {{ score() }}
            </div>
            
            <button (click)="audio.playSoundEffect('click'); $event.stopPropagation()" class="bg-yellow-400 pointer-events-auto hover:bg-yellow-500 text-indigo-900 w-14 h-14 rounded-full flex items-center justify-center text-3xl shadow-lg transition-transform hover:scale-110 active:scale-95">
                🧩
            </button>
        </div>

        @if (gameState() === 'start') {
            <div class="absolute inset-0 z-50 flex flex-col items-center justify-center text-center p-4 bg-black/40 backdrop-blur-sm">
                <div class="bg-white p-8 rounded-[3rem] shadow-2xl max-w-sm w-full border-[8px] border-indigo-400">
                    <div class="text-8xl mb-2 animate-bounce">🧩</div>
                    <h2 class="text-4xl font-black text-indigo-600 mb-2 font-[Bubblegum]">Jigsaw Puzzle</h2>
                    <p class="text-gray-600 mb-6 font-bold text-xl">Drag the pieces to complete the picture!</p>
                    <button (click)="startGame()" class="w-full py-4 font-[Bubblegum] bg-indigo-500 hover:bg-indigo-600 text-white text-3xl font-black rounded-2xl shadow-[0_8px_0_#4338ca] active:translate-y-2 active:shadow-none transition-all">
                        Start Game!
                    </button>
                </div>
            </div>
        } @else {
            <div class="w-full h-full flex flex-col md:flex-row items-center justify-center gap-8 px-4 pt-10">
                
                <!-- Puzzle Board -->
                <div class="relative w-72 h-72 bg-white/50 rounded-xl border-4 border-dashed border-indigo-400 p-2 shadow-inner grid grid-cols-2 grid-rows-2 gap-1">
                    <!-- Faint background hint -->
                    <div class="absolute inset-2 opacity-20 bg-no-repeat bg-cover pointer-events-none" style="background-image: url('assets/images/dog.jpg')"></div>
                    
                    @for (slot of slots(); track slot.id) {
                        <div class="relative w-full h-full bg-black/5 rounded-lg border-2 border-transparent transition-colors"
                             [class.border-green-400]="dragHoverSlot === slot.id"
                             [class.bg-green-100]="dragHoverSlot === slot.id"
                             (dragover)="onDragOver($event, slot.id)"
                             (dragleave)="onDragLeave($event)"
                             (drop)="onDrop($event, slot.id)">
                             
                            @if (getPieceInSlot(slot.id); as piece) {
                                <div class="w-full h-full cursor-grab active:cursor-grabbing bg-no-repeat bg-[length:200%_200%] rounded-lg shadow-md"
                                     draggable="true"
                                     (dragstart)="onDragStart($event, piece)"
                                     style="background-image: url('assets/images/dog.jpg');"
                                     [style.backgroundPosition]="piece.bgPosition">
                                </div>
                            }
                        </div>
                    }
                </div>

                <!-- Pieces Pool -->
                <div class="w-full md:w-48 bg-white/70 backdrop-blur-sm border-4 border-white p-4 rounded-3xl shadow-xl flex flex-wrap justify-center gap-2 min-h-[300px]">
                    @for (piece of getPiecesInPool(); track piece.id) {
                        <div class="w-20 h-20 cursor-grab active:cursor-grabbing bg-no-repeat bg-[length:200%_200%] rounded-lg shadow-lg hover:scale-105 transition-transform border-2 border-white"
                             draggable="true"
                             (dragstart)="onDragStart($event, piece)"
                             style="background-image: url('assets/images/dog.jpg');"
                             [style.backgroundPosition]="piece.bgPosition">
                        </div>
                    }
                </div>
            </div>

            @if (gameState() === 'win') {
                <div class="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div class="text-center animate-[bounceIn_0.5s_ease-out]">
                        <div class="w-64 h-64 mx-auto border-[10px] border-white shadow-2xl rounded-2xl bg-no-repeat bg-cover mb-6 rotate-3" style="background-image: url('assets/images/dog.jpg')"></div>
                        <h2 class="text-6xl font-black text-green-400 mb-4 font-[Bubblegum] drop-shadow-lg">Beautiful! 🎉</h2>
                        <button (click)="startGame()" class="px-8 py-3 bg-green-500 text-white font-bold text-2xl font-[Bubblegum] rounded-full shadow-[0_6px_0_#16a34a] hover:bg-green-600 active:translate-y-2 active:shadow-none transition-all">
                            Play Again
                        </button>
                    </div>
                </div>
            }
        }
    </div>
  `
})
export class PuzzleGameComponent {
  data = inject(DataService);
  audio = inject(AudioService);

  gameState = signal<'start' | 'playing' | 'win'>('start');
  score = signal(0);
  
  pieces = signal<PuzzlePiece[]>([]);
  slots = signal<PuzzleSlot[]>([]);
  
  dragHoverSlot: number | null = null;
  draggedPiece: PuzzlePiece | null = null;

  startGame() {
    this.score.set(0);
    this.gameState.set('playing');
    this.initPuzzle();
  }

  initPuzzle() {
    // 2x2 Grid setup
    const positions = ['0% 0%', '100% 0%', '0% 100%', '100% 100%'];
    
    let initialPieces: PuzzlePiece[] = positions.map((pos, index) => ({
        id: index,
        bgPosition: pos,
        currentSlot: null
    }));

    // Shuffle pieces
    initialPieces.sort(() => 0.5 - Math.random());
    this.pieces.set(initialPieces);

    const initialSlots: PuzzleSlot[] = [
        { id: 0, expectedPieceId: 0 },
        { id: 1, expectedPieceId: 1 },
        { id: 2, expectedPieceId: 2 },
        { id: 3, expectedPieceId: 3 },
    ];
    this.slots.set(initialSlots);
  }

  getPiecesInPool() {
      return this.pieces().filter(p => p.currentSlot === null);
  }

  getPieceInSlot(slotId: number) {
      return this.pieces().find(p => p.currentSlot === slotId);
  }

  onDragStart(e: DragEvent, piece: PuzzlePiece) {
      this.draggedPiece = piece;
      e.dataTransfer?.setData('text/plain', piece.id.toString());
  }

  onDragOver(e: DragEvent, slotId: number) {
      e.preventDefault();
      this.dragHoverSlot = slotId;
  }

  onDragLeave(e: DragEvent) {
      this.dragHoverSlot = null;
  }

  onDrop(e: DragEvent, slotId: number) {
      e.preventDefault();
      this.dragHoverSlot = null;
      
      if (!this.draggedPiece) return;

      const pieceToMove = this.draggedPiece;
      const existingPiece = this.getPieceInSlot(slotId);

      this.pieces.update(allPieces => {
          return allPieces.map(p => {
              if (p.id === pieceToMove.id) {
                  return { ...p, currentSlot: slotId };
              }
              // If dropping onto a slot that already has a piece, move the existing piece back to the pool
              if (existingPiece && p.id === existingPiece.id) {
                  return { ...p, currentSlot: null };
              }
              return p;
          });
      });

      this.audio.playSoundEffect('click');
      this.checkWin();
      this.draggedPiece = null;
  }

  checkWin() {
      const isWin = this.slots().every(slot => {
          const piece = this.getPieceInSlot(slot.id);
          return piece && piece.id === slot.expectedPieceId;
      });

      if (isWin) {
          setTimeout(() => {
              this.gameState.set('win');
              this.audio.playSoundEffect('bell');
              this.score.update(s => s + 10);
              this.data.addStars(3);
              this.audio.speak('Beautiful dog!', 'en-US');
          }, 500);
      }
  }
}
