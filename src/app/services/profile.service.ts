import { Injectable, inject, signal } from '@angular/core';
import { DataService } from './data.service';

export interface Profile { id: string; name: string; avatar: string; }

/** localStorage keys that belong to ONE child. They are snapshotted per profile when switching. */
const CHILD_KEYS = ['childName', 'streak', 'lastLoginDate', 'abc-kids-progress', 'abc-kids-pet', 'abc-kids-gift', 'abc-kids-stats'];
const META = 'abc-profiles';
const SNAP = (id: string) => `abc-profile-data:${id}`;
export const AVATARS = ['🦁', '🐼', '🦄', '🐯', '🐸', '🐰', '🦊', '🐵', '🐧', '🐙', '🦋', '🚀'];
export const MAX_PROFILES = 5;

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private data = inject(DataService);

  profiles = signal<Profile[]>([]);
  activeId = signal<string>('p1');

  constructor() {
    try {
      const m = JSON.parse(localStorage.getItem(META) || 'null');
      if (m?.list?.length) { this.profiles.set(m.list); this.activeId.set(m.active || m.list[0].id); }
      else this.profiles.set([{ id: 'p1', name: '', avatar: AVATARS[0] }]);
    } catch { this.profiles.set([{ id: 'p1', name: '', avatar: AVATARS[0] }]); }
  }

  active() { return this.profiles().find(p => p.id === this.activeId()) ?? this.profiles()[0]; }

  /** Name shown for a profile: the live name for the active child, the saved one for the others. */
  nameOf(p: Profile) {
    return (p.id === this.activeId() ? this.data.childName() : p.name) || 'طفل جديد';
  }

  private persistMeta() {
    try { localStorage.setItem(META, JSON.stringify({ list: this.profiles(), active: this.activeId() })); } catch { /* ignore */ }
  }

  private snapshotActive() {
    this.data.save();
    const snap: Record<string, string> = {};
    for (const k of CHILD_KEYS) { const v = localStorage.getItem(k); if (v !== null) snap[k] = v; }
    try { localStorage.setItem(SNAP(this.activeId()), JSON.stringify(snap)); } catch { /* ignore */ }
    const name = this.data.childName();
    this.profiles.update(l => l.map(p => (p.id === this.activeId() ? { ...p, name } : p)));
  }

  private restore(id: string) {
    for (const k of CHILD_KEYS) localStorage.removeItem(k);
    try {
      const snap: Record<string, string> = JSON.parse(localStorage.getItem(SNAP(id)) || '{}');
      for (const [k, v] of Object.entries(snap)) localStorage.setItem(k, v);
    } catch { /* ignore */ }
  }

  private commit(id: string) {
    this.activeId.set(id);
    this.persistMeta();
    location.reload(); // services re-read their data from the restored keys
  }

  switchTo(id: string) {
    if (id === this.activeId()) return;
    this.snapshotActive();
    this.restore(id);
    this.commit(id);
  }

  add(avatar: string) {
    if (this.profiles().length >= MAX_PROFILES) return;
    this.snapshotActive();
    const id = 'p' + Date.now().toString(36);
    this.profiles.update(l => [...l, { id, name: '', avatar }]);
    this.restore(id); // empty -> the app asks for the new child's name
    this.commit(id);
  }

  setAvatar(avatar: string) {
    this.profiles.update(l => l.map(p => (p.id === this.activeId() ? { ...p, avatar } : p)));
    this.persistMeta();
  }

  remove(id: string) {
    if (id === this.activeId() || this.profiles().length <= 1) return;
    this.profiles.update(l => l.filter(p => p.id !== id));
    try { localStorage.removeItem(SNAP(id)); } catch { /* ignore */ }
    this.persistMeta();
  }
}
