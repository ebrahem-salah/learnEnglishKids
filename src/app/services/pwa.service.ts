import { Injectable, inject, signal } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';

/** Install prompt, "new version" notice, online/offline state and sharing for the website/PWA. */
@Injectable({ providedIn: 'root' })
export class PwaService {
  private sw = inject(SwUpdate, { optional: true });
  private deferred: any = null;

  canInstall = signal(false);
  installed = signal(this.isStandalone());
  online = signal(navigator.onLine);
  updateReady = signal(false);
  readonly isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

  constructor() {
    window.addEventListener('beforeinstallprompt', (e: any) => {
      e.preventDefault();          // keep the event, show our own button
      this.deferred = e;
      this.canInstall.set(true);
    });
    window.addEventListener('appinstalled', () => { this.installed.set(true); this.canInstall.set(false); this.deferred = null; });
    window.addEventListener('online', () => this.online.set(true));
    window.addEventListener('offline', () => this.online.set(false));

    if (this.sw?.isEnabled) {
      this.sw.versionUpdates.subscribe(ev => { if (ev.type === 'VERSION_READY') this.updateReady.set(true); });
    }
  }

  private isStandalone() {
    return window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone === true;
  }

  async install() {
    if (!this.deferred) return;
    this.deferred.prompt();
    try { await this.deferred.userChoice; } catch { /* ignore */ }
    this.deferred = null;
    this.canInstall.set(false);
  }

  async applyUpdate() {
    try { await this.sw?.activateUpdate(); } finally { location.reload(); }
  }

  /** Returns 'shared' | 'copied' | 'failed'. */
  async share(): Promise<'shared' | 'copied' | 'failed'> {
    const data = { title: 'تعلم مع يونس', text: 'ألعاب وقصص لتعليم الأطفال الإنجليزية والعربية', url: location.origin };
    try {
      if (navigator.share) { await navigator.share(data); return 'shared'; }
      await navigator.clipboard.writeText(data.url);
      return 'copied';
    } catch { return 'failed'; }
  }
}
