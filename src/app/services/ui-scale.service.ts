import { Injectable, signal } from '@angular/core';

/** Lets families make the whole site smaller / bigger. Default = responsive size from styles.css. */
const LEVELS = [
  { id: 'small', label: 'صغير', pct: 95 as number | null },
  { id: 'auto', label: 'عادي', pct: null as number | null },
  { id: 'large', label: 'كبير', pct: 150 as number | null }
];
const KEY = 'abc-ui-scale';

@Injectable({ providedIn: 'root' })
export class UiScaleService {
  index = signal(1);

  constructor() {
    try {
      const i = LEVELS.findIndex(l => l.id === localStorage.getItem(KEY));
      if (i >= 0) this.index.set(i);
    } catch { /* ignore */ }
    this.apply();
  }

  get label() { return LEVELS[this.index()].label; }

  cycle() {
    this.index.set((this.index() + 1) % LEVELS.length);
    try { localStorage.setItem(KEY, LEVELS[this.index()].id); } catch { /* ignore */ }
    this.apply();
  }

  private apply() {
    const pct = LEVELS[this.index()].pct;
    document.documentElement.style.fontSize = pct ? pct + '%' : '';
  }
}
