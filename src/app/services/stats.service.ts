import { Injectable, computed, signal } from '@angular/core';

export type Metric = 'plays' | 'stars' | 'perfect' | 'newgame';

export interface MissionDef { id: string; ar: string; icon: string; metric: Metric; target: number; reward: number; }

export const MISSION_POOL: MissionDef[] = [
  { id: 'play3', ar: 'العب 3 ألعاب', icon: '🎮', metric: 'plays', target: 3, reward: 2 },
  { id: 'play5', ar: 'العب 5 ألعاب', icon: '🕹️', metric: 'plays', target: 5, reward: 3 },
  { id: 'stars5', ar: 'اجمع 5 نجوم', icon: '⭐', metric: 'stars', target: 5, reward: 2 },
  { id: 'stars12', ar: 'اجمع 12 نجمة', icon: '🌟', metric: 'stars', target: 12, reward: 3 },
  { id: 'perfect1', ar: 'احصل على نتيجة كاملة في لعبة', icon: '💯', metric: 'perfect', target: 1, reward: 3 },
  { id: 'newgame', ar: 'جرّب لعبة جديدة لأول مرة', icon: '🆕', metric: 'newgame', target: 1, reward: 2 }
];

interface DayStats { plays: number; stars: number; perfect: number; newgame: number; claimed: string[]; }
interface StatsData {
  plays: Record<string, number>;
  misses: Record<string, number>;
  totalStars: number;
  perfects: number;
  missionsDone: number;
  days: Record<string, DayStats>;
}

const KEY = 'abc-kids-stats';
const emptyDay = (): DayStats => ({ plays: 0, stars: 0, perfect: 0, newgame: 0, claimed: [] });
const emptyData = (): StatsData => ({ plays: {}, misses: {}, totalStars: 0, perfects: 0, missionsDone: 0, days: {} });

export function dayKey(d = new Date()) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

/** Everything the parent dashboard, daily missions and badges need. Stored in localStorage. */
@Injectable({ providedIn: 'root' })
export class StatsService {
  private data = signal<StatsData>(this.load());
  private muted = false;

  private load(): StatsData {
    try { return { ...emptyData(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return emptyData(); }
  }

  private update(fn: (d: StatsData) => void) {
    const d: StatsData = structuredClone(this.data());
    fn(d);
    // keep the file small: only the last 30 days
    const keys = Object.keys(d.days).sort();
    keys.slice(0, Math.max(0, keys.length - 30)).forEach(k => delete d.days[k]);
    this.data.set(d);
    try { localStorage.setItem(KEY, JSON.stringify(d)); } catch { /* ignore */ }
  }

  private today(d: StatsData) { return (d.days[dayKey()] ??= emptyDay()); }

  // ---- recording ----
  playedGame(id: string) {
    this.update(d => {
      const t = this.today(d);
      if (!d.plays[id]) t.newgame++;
      d.plays[id] = (d.plays[id] || 0) + 1;
      t.plays++;
    });
  }

  onStars(n: number) {
    if (n <= 0 || this.muted) return;
    this.update(d => { this.today(d).stars += n; d.totalStars += n; });
  }

  result(_gameId: string, correct: number, total: number) {
    if (total > 0 && correct === total) this.update(d => { d.perfects++; this.today(d).perfect++; });
  }

  miss(word: string) {
    if (!word) return;
    this.update(d => { d.misses[word] = (d.misses[word] || 0) + 1; });
  }

  // ---- reading ----
  totalPlays = computed(() => Object.values(this.data().plays).reduce((a, b) => a + b, 0));
  gamesTried = computed(() => Object.keys(this.data().plays).length);
  playsByGame = computed(() => Object.entries(this.data().plays).sort((a, b) => b[1] - a[1]));
  topMisses = computed(() => Object.entries(this.data().misses).sort((a, b) => b[1] - a[1]).slice(0, 8));
  totalStars = computed(() => this.data().totalStars);
  perfects = computed(() => this.data().perfects);
  missionsDone = computed(() => this.data().missionsDone);
  last7 = computed(() => {
    const out: { day: string; plays: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      out.push({ day: d.toLocaleDateString('ar-EG', { weekday: 'short' }), plays: this.data().days[dayKey(d)]?.plays ?? 0 });
    }
    return out;
  });

  // ---- missions ----
  missions = computed(() => {
    const d = this.data();
    const t = d.days[dayKey()] ?? emptyDay();
    const order = [...MISSION_POOL].sort((a, b) => hash(dayKey() + a.id) - hash(dayKey() + b.id)).slice(0, 3);
    return order.map(m => {
      const value = Math.min(t[m.metric], m.target);
      return { ...m, value, done: value >= m.target, claimed: t.claimed.includes(m.id) };
    });
  });

  /** `give` adds the stars (e.g. data.addStars); they are not counted again towards "collect stars" missions. */
  claim(id: string, reward: number, give: (n: number) => void) {
    const m = this.missions().find(x => x.id === id);
    if (!m || !m.done || m.claimed) return;
    this.update(d => { this.today(d).claimed.push(id); d.missionsDone++; });
    this.muted = true;
    try { give(reward); } finally { this.muted = false; }
  }

  resetAll() {
    this.data.set(emptyData());
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  }
}
