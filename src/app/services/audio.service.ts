import { Injectable, signal } from '@angular/core';

export interface WordItem { word: string; ar_word: string; img: string; realImg?: string; sound?: string; category?: string; }
export interface AlphabetItem { letter: string; ar_letter: string; words: WordItem[]; gifUrl?: string; }
export interface Sticker { id: string; name: string; img: string; cost: number; unlocked: boolean; }
export interface Song { title: string; ar_title: string; lyrics: string; icon: string; audioText: string; }
export interface Phrase { en: string; ar: string; context: string; icon: string; }
export interface ShortStory { title: string; ar_title: string; icon: string; pages: { en: string; ar: string; img: string }[]; }

export interface ExtraCategory {
  id: string;
  title: string;
  icon: string;
  items: { en: string; ar: string; img: string; realImg?: string; soundEffect?: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private voices: SpeechSynthesisVoice[] = [];
  private playToken = 0;
  private ctxAudio?: AudioContext;
  slow = signal(false);
  playing = signal<string | null>(null);

  constructor() {
    if ('speechSynthesis' in window) {
      this.voices = speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => (this.voices = speechSynthesis.getVoices());
    }
    const unlock = () => {
      this.unlockAudio();
      window.removeEventListener('click', unlock);
      window.removeEventListener('touchstart', unlock);
    };
    window.addEventListener('click', unlock);
    window.addEventListener('touchstart', unlock);
  }

  unlockAudio() {
    try {
      if (this.ctxAudio && this.ctxAudio.state === 'suspended') {
        this.ctxAudio.resume();
      }
      if ('speechSynthesis' in window) {
        if (speechSynthesis.paused) speechSynthesis.resume();
        if (this.voices.length === 0) this.voices = speechSynthesis.getVoices();
      }
    } catch { /* ignore */ }
  }

  private getBestVoice(lang: string): SpeechSynthesisVoice | null {
    const norm = (l: string) => l.replace('_', '-').toLowerCase();
    const prefix = lang.split('-')[0].toLowerCase();
    const score = (v: SpeechSynthesisVoice) =>
      (norm(v.lang) === lang.toLowerCase() ? 5 : 0) +
      (/natural|neural|online/i.test(v.name) ? 4 : 0) +
      (/google|samantha|siri|enhanced|premium|aria|jenny/i.test(v.name) ? 3 : 0) +
      (v.localService ? 0 : 1) - (/compact|espeak/i.test(v.name) ? 5 : 0);
    return this.voices.filter(v => norm(v.lang).startsWith(prefix)).sort((a, b) => score(b) - score(a))[0] ?? null;
  }

  say(text: string, lang: string): Promise<void> {
    return new Promise(resolve => {
      if (!('speechSynthesis' in window)) return resolve();
      this.unlockAudio();
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang;
      const v = this.getBestVoice(lang);
      if (v) u.voice = v;
      u.rate = (lang.startsWith('ar') ? 0.95 : 1) * (this.slow() ? 0.65 : 0.9);
      u.pitch = 1.1;

      let resolved = false;
      const done = () => {
        if (!resolved) { resolved = true; resolve(); }
      };

      u.onend = done;
      u.onerror = done;
      setTimeout(done, 4000);

      speechSynthesis.speak(u);
    });
  }

  async sequence(key: string | null, steps: [string, string][]) {
    if (!('speechSynthesis' in window)) return;
    const token = ++this.playToken;
    speechSynthesis.cancel();
    this.playing.set(key);
    for (const [text, lang] of steps) {
      if (token !== this.playToken) return;
      await this.say(text, lang);
      await new Promise(r => setTimeout(r, 250));
    }
    if (token === this.playToken) this.playing.set(null);
  }

  speak(text: string, lang: string) { this.sequence(null, [[text, lang]]); }

  beep(freqs: number[], type: OscillatorType = 'sine') {
    try {
      const c = (this.ctxAudio ??= new AudioContext());
      freqs.forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = type; o.frequency.value = f; o.connect(g); g.connect(c.destination);
        const t = c.currentTime + i * 0.13;
        g.gain.setValueAtTime(0.15, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        o.start(t); o.stop(t + 0.22);
      });
    } catch { /* ignore */ }
  }

  playSoundEffect(type: string) {
    try {
      const c = (this.ctxAudio ??= new AudioContext());
      let freqs: number[] = [400, 600];
      if (type === 'roar') freqs = [150, 100, 80];
      if (type === 'meow') freqs = [700, 900, 650];
      if (type === 'bark') freqs = [250, 450];
      if (type === 'vroom') freqs = [120, 180, 240];
      if (type === 'trumpet') freqs = [500, 750, 900];

      freqs.forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sawtooth'; o.frequency.value = f; o.connect(g); g.connect(c.destination);
        const t = c.currentTime + i * 0.15;
        g.gain.setValueAtTime(0.2, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
        o.start(t); o.stop(t + 0.35);
      });
    } catch { /* ignore */ }
  }

  isListening = signal<boolean>(false);

  listenForWord(expectedWord: string): Promise<boolean> {
    return new Promise((resolve) => {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('متصفحك لا يدعم ميزة الميكروفون. يرجى استخدام متصفح جوجل كروم.');
        return resolve(false);
      }
      
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;
      
      this.isListening.set(true);
      this.playSoundEffect('bell'); // indicate start

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript.toLowerCase();
        const expected = expectedWord.toLowerCase().replace(/[^a-z\s]/g, '');
        const said = transcript.replace(/[^a-z\s]/g, '');
        
        // Simple matching logic
        if (said.includes(expected) || expected.includes(said) || said === expected) {
          resolve(true);
        } else {
          resolve(false);
        }
      };

      recognition.onerror = () => {
        this.isListening.set(false);
        resolve(false);
      };

      recognition.onend = () => {
        this.isListening.set(false);
      };
      
      recognition.start();
    });
  }
}
