import { Injectable, signal } from '@angular/core';

interface OfflineManifest { version: string; bytes: number; files: { u: string; s: number }[]; }
const DONE_KEY = 'abc-offline-version';

/**
 * "Download for offline": fetches every audio / image file once so the service worker caches it.
 * The list comes from public/offline-manifest.json (made by `npm run offline-manifest`, also run by `npm run build`).
 */
@Injectable({ providedIn: 'root' })
export class OfflineService {
  state = signal<'idle' | 'loading' | 'done' | 'error'>('idle');
  progress = signal(0);
  totalMB = signal(0);
  private manifest: OfflineManifest | null = null;

  constructor() {
    this.loadManifest().then(m => {
      if (!m) return;
      this.totalMB.set(Math.round(m.bytes / 1e5) / 10);
      try { if (localStorage.getItem(DONE_KEY) === m.version) this.state.set('done'); } catch { /* ignore */ }
    });
  }

  private async loadManifest() {
    if (this.manifest) return this.manifest;
    try {
      const r = await fetch('offline-manifest.json', { cache: 'no-cache' });
      if (r.ok) this.manifest = await r.json();
    } catch { /* offline or missing */ }
    return this.manifest;
  }

  async download() {
    const m = await this.loadManifest();
    if (!m || this.state() === 'loading') { if (!m) this.state.set('error'); return; }
    this.state.set('loading');
    this.progress.set(0);
    const files = m.files;
    let done = 0, failed = 0, next = 0;
    const worker = async () => {
      while (next < files.length) {
        const f = files[next++];
        try { const r = await fetch(f.u); if (!r.ok) failed++; } catch { failed++; }
        this.progress.set(++done / files.length);
      }
    };
    await Promise.all(Array.from({ length: 6 }, worker));   // 6 downloads at a time
    if (failed > files.length * 0.05) { this.state.set('error'); return; }
    try { localStorage.setItem(DONE_KEY, m.version); } catch { /* ignore */ }
    this.state.set('done');
  }
}
