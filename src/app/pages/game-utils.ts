import { DataService } from '../services/data.service';

export interface GameWord {
  word: string;
  ar: string;
  emoji: string;
  letter: string;
}

/** Fisher-Yates shuffle (unbiased, unlike sort(() => Math.random() - 0.5)). */
export function shuffle<T>(arr: readonly T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** Keeps track of timers so a game can cancel all of them in ngOnDestroy. */
export class Timers {
  private timeouts = new Set<ReturnType<typeof setTimeout>>();
  private intervals = new Set<ReturnType<typeof setInterval>>();

  after(fn: () => void, ms: number) {
    const id = setTimeout(() => {
      this.timeouts.delete(id);
      fn();
    }, ms);
    this.timeouts.add(id);
    return id;
  }

  every(fn: () => void, ms: number) {
    const id = setInterval(fn, ms);
    this.intervals.add(id);
    return id;
  }

  clearAll() {
    this.timeouts.forEach(clearTimeout);
    this.intervals.forEach(clearInterval);
    this.timeouts.clear();
    this.intervals.clear();
  }
}

/** Flat list of unique words (with an emoji) from the alphabet data. */
export function wordPool(data: DataService): GameWord[] {
  const seen = new Set<string>();
  const out: GameWord[] = [];
  for (const a of data.alphabetData) {
    for (const w of a.words) {
      const key = w.word.toLowerCase();
      if (!w.img || seen.has(key)) continue;
      seen.add(key);
      out.push({ word: w.word, ar: w.ar_word, emoji: w.img, letter: w.word[0].toUpperCase() });
    }
  }
  return out;
}

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
