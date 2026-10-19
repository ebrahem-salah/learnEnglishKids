import { Injectable, signal } from '@angular/core';

export interface WordItem { word: string; ar_word: string; img: string; realImg?: string; imagePath?: string; sound?: string; category?: string; }
export interface AlphabetItem { letter: string; ar_letter: string; words: WordItem[]; gifUrl?: string; videoId?: string; }
export interface Sticker { id: string; name: string; img: string; imagePath?: string; cost: number; unlocked: boolean; }
export interface Song { title: string; ar_title: string; lyrics: string; icon: string; audioText: string; }
export interface Phrase { en: string; ar: string; context: string; icon: string; }
export interface ShortStory { 
  title: string; 
  ar_title: string; 
  icon: string; 
  imagePath?: string; 
  pages: { en: string; ar: string; img: string; imagePath?: string }[]; 
}

export interface ExtraCategory {
  id: string;
  title: string;
  icon: string;
  items: { en: string; ar: string; img: string; realImg?: string; imagePath?: string; soundEffect?: string }[];
}

@Injectable({
  providedIn: 'root'
})
export class AudioService {
  private voices: SpeechSynthesisVoice[] = [];
  private playToken = 0;
  private ctxAudio?: AudioContext;
  slow = signal(true);
  /** Parents can mute everything from the parent dashboard. */
  soundOn = signal(localStorage.getItem('abc-sound') !== 'off');
  setSound(on: boolean) {
    this.soundOn.set(on);
    try { localStorage.setItem('abc-sound', on ? 'on' : 'off'); } catch { /* ignore */ }
    if (!on && 'speechSynthesis' in window) speechSynthesis.cancel();
  }
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

  activeAudio: HTMLAudioElement | null = null;

  stopAll() {
    this.playToken++;
    this.playing.set(null);
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.src = '';
      } catch { /* ignore */ }
      this.activeAudio = null;
    }
    if ('speechSynthesis' in window) {
      try {
        speechSynthesis.cancel();
      } catch { /* ignore */ }
    }
  }

  say(text: string, lang: string): Promise<void> {
    const token = ++this.playToken;
    return this.sayWithToken(token, text, lang);
  }

  private sayWithToken(token: number, text: string, lang: string): Promise<void> {
    if (!this.soundOn()) return Promise.resolve();
    return new Promise(resolve => {
      if (token !== this.playToken) {
        resolve();
        return;
      }
      this.unlockAudio();
      
      // Stop any currently playing audio and TTS
      if (this.activeAudio) {
        try {
          this.activeAudio.pause();
          this.activeAudio.currentTime = 0;
          this.activeAudio.src = '';
        } catch { /* ignore */ }
        this.activeAudio = null;
      }
      if ('speechSynthesis' in window) {
        try { speechSynthesis.cancel(); } catch { /* ignore */ }
      }

      const tl = lang.startsWith('ar') ? 'ar' : 'en';
      const cleanWord = text.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 45);
      const localUrl = tl === 'ar' ? `assets/audio/ar/${cleanWord}.mp3` : `assets/audio/words/${cleanWord}.mp3`;

      let currentTimer: any = null;

      const tryPlayUrl = (src: string) => {
        if (token !== this.playToken) {
          resolve();
          return;
        }
        const audio = new Audio(src);
        this.activeAudio = audio;
        
        if (this.slow() && tl === 'en' && text.split(/\s+/).length <= 2) {
          audio.playbackRate = 0.85;
        } else {
          audio.playbackRate = 1.0;
        }

        let resolved = false;
        const done = () => {
          if (currentTimer) clearTimeout(currentTimer);
          if (!resolved) { 
            resolved = true; 
            if (this.activeAudio === audio) this.activeAudio = null;
            resolve(); 
          }
        };

        audio.onended = () => done();
        audio.onerror = () => done();

        if (token === this.playToken) {
          audio.play().catch(() => done());
          currentTimer = setTimeout(done, 20000);
        } else {
          done();
        }
      };

      tryPlayUrl(localUrl);
    });
  }

  async sequence(key: string | null, steps: [string, string][]) {
    const token = ++this.playToken;
    if ('speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch { /* ignore */ }
    }
    this.playing.set(key);
    for (const [text, lang] of steps) {
      if (token !== this.playToken) return;
      await this.sayWithToken(token, text, lang);
      if (token !== this.playToken) return;
      await new Promise(r => setTimeout(r, 250));
    }
    if (token === this.playToken) this.playing.set(null);
  }

  speak(text: string, lang: string) { 
    this.say(text, lang); 
  }

  speakSlow(text: string, lang: string) {
    const prev = this.slow();
    this.slow.set(true);
    this.speak(text, lang);
    setTimeout(() => this.slow.set(prev), 2000);
  }

  playAudioFile(src: string, fallbackText?: string, fallbackLang = 'en-US') {
    if (!this.soundOn()) return;
    this.unlockAudio();
    const token = ++this.playToken;
    if (this.activeAudio) {
      try {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
        this.activeAudio.src = '';
      } catch { /* ignore */ }
      this.activeAudio = null;
    }
    if ('speechSynthesis' in window) {
      try { speechSynthesis.cancel(); } catch { /* ignore */ }
    }
    const audio = new Audio(src);
    this.activeAudio = audio;
    audio.onended = () => { if (this.activeAudio === audio) this.activeAudio = null; };
    audio.onerror = () => {
      if (this.activeAudio === audio) this.activeAudio = null;
      if (token === this.playToken && fallbackText) this.sayWithToken(token, fallbackText, fallbackLang);
    };
    audio.play().catch(() => {
      if (token === this.playToken && audio.onerror) {
        (audio.onerror as any)(new Event('error'));
      }
    });
  }

  playFileAsync(src: string, fallbackText?: string, fallbackLang = 'en-US'): Promise<void> {
    if (!this.soundOn()) return Promise.resolve();
    this.unlockAudio();
    const token = ++this.playToken;
    return new Promise<void>(resolve => {
      if (this.activeAudio) {
        try {
          this.activeAudio.pause();
          this.activeAudio.currentTime = 0;
          this.activeAudio.src = '';
        } catch { /* ignore */ }
        this.activeAudio = null;
      }
      if ('speechSynthesis' in window) {
        try { speechSynthesis.cancel(); } catch { /* ignore */ }
      }

      const audio = new Audio(src);
      this.activeAudio = audio;
      audio.playbackRate = 1.0;

      let resolved = false;
      let timer: any = null;
      const finish = () => {
        if (timer) clearTimeout(timer);
        if (!resolved) {
          resolved = true;
          if (this.activeAudio === audio) this.activeAudio = null;
          resolve();
        }
      };

      audio.onended = finish;
      audio.onerror = () => {
        if (token === this.playToken && fallbackText) {
          this.sayWithToken(token, fallbackText, fallbackLang).then(finish);
        } else {
          finish();
        }
      };

      timer = setTimeout(finish, 15000);

      audio.play().catch(() => {
        if (token === this.playToken && audio.onerror) {
          (audio.onerror as any)(new Event('error'));
        } else {
          finish();
        }
      });
    });
  }

  /** Arabic line: plays YOUR recording public/assets/audio/ar/<english-key>.mp3 if it exists,
   *  otherwise falls back to browser / Google text-to-speech. (key = same name as the English mp3) */
  speakArabic(enText: string, arText: string) {
    const key = enText.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 45);
    this.playAudioFile(`assets/audio/ar/${key}.mp3`, arText, 'ar-EG');
  }

  playPhonics(letter: string) {
    const key = `phonics_${letter.toLowerCase()}`;
    this.playAudioFile(`assets/audio/words/${key}.mp3`, letter);
  }

  beep(freqs: number[], type: OscillatorType = 'sine') {
    if (!this.soundOn()) return;
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

  playCelebration() {
    this.beep([523, 659, 784, 1046], 'triangle');
  }

  playSoundEffect(type: string) {
    if (!this.soundOn()) return;
    if (type === 'error') type = 'buzz';
    try {
      const c = (this.ctxAudio ??= new AudioContext());
      let freqs: number[] = [400, 600];
      if (type === 'ding') freqs = [523, 659, 784];
      if (type === 'buzz') freqs = [150, 120];
      if (type === 'pop') freqs = [350, 500];
      if (type === 'bell') freqs = [880, 1174];
      if (type === 'roar') freqs = [150, 100, 80];
      if (type === 'meow') freqs = [700, 900, 650];
      if (type === 'bark') freqs = [250, 450];
      if (type === 'vroom') freqs = [120, 180, 240];
      if (type === 'trumpet') freqs = [500, 750, 900];
      if (type === 'click') freqs = [520];

      freqs.forEach((f, i) => {
        const o = c.createOscillator(), g = c.createGain();
        o.type = (type === 'ding' || type === 'bell') ? 'sine' : 'sawtooth';
        o.frequency.value = f;
        o.connect(g);
        g.connect(c.destination);
        const t = c.currentTime + i * 0.12;
        g.gain.setValueAtTime(0.2, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
        o.start(t);
        o.stop(t + 0.3);
      });
    } catch { /* ignore */ }
  }

  isListening = signal<boolean>(false);


  // ---------- speaking whole sentences ----------
  /** The native plugin is optional: npm i @capacitor-community/speech-recognition && npx cap sync */
  private nativeRecognizer(): any {
    const cap = (window as any).Capacitor;
    if (cap?.isNativePlatform?.()) {
      try { return cap.registerPlugin('SpeechRecognition'); } catch { /* not installed */ }
    }
    return null;
  }

  canListen(): boolean {
    return !!(this.nativeRecognizer() || (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
  }

  /** 0..1 = share of the expected words that were heard. */
  private sentenceScore(expected: string, heard: string): number {
    const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9\s']/g, ' ').split(/\s+/).filter(Boolean);
    const exp = norm(expected);
    const got = new Set(norm(heard));
    return exp.length ? exp.filter(w => got.has(w)).length / exp.length : 0;
  }

  /** Listens once and compares with `expected`. Never shows alert(); returns an `error` code instead. */
  async listenForSentence(expected: string, lang = 'en-US'): Promise<{ heard: string; score: number; ok: boolean; error?: 'unsupported' | 'denied' | 'network' | 'nospeech' }> {
    const fail = (error: 'unsupported' | 'denied' | 'network' | 'nospeech') => ({ heard: '', score: 0, ok: false, error });
    const best = (list: string[]) => {
      let heard = list[0] || '', score = 0;
      for (const h of list) { const sc = this.sentenceScore(expected, h); if (sc >= score) { score = sc; heard = h; } }
      return { heard, score, ok: score >= 0.7 };
    };

    const native = this.nativeRecognizer();
    if (native) {
      try {
        const perm = await native.requestPermissions();
        if (perm?.speechRecognition && perm.speechRecognition !== 'granted') return fail('denied');
        this.isListening.set(true);
        this.playSoundEffect('bell');
        const r = await native.start({ language: lang, maxResults: 3, partialResults: false, popup: false });
        const matches: string[] = r?.matches ?? [];
        return matches.length ? best(matches) : fail('nospeech');
      } catch { return fail('nospeech'); } finally { this.isListening.set(false); }
    }

    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return fail('unsupported');
    return new Promise(resolve => {
      const rec = new SR();
      rec.lang = lang;
      rec.interimResults = false;
      rec.maxAlternatives = 3;
      let done = false;
      const finish = (v: any) => { if (!done) { done = true; this.isListening.set(false); resolve(v); } };
      this.isListening.set(true);
      this.playSoundEffect('bell');
      rec.onresult = (e: any) => finish(best([...e.results[0]].map((a: any) => a.transcript as string)));
      rec.onerror = (e: any) => finish(fail(e.error === 'not-allowed' || e.error === 'service-not-allowed' ? 'denied' : e.error === 'network' ? 'network' : 'nospeech'));
      rec.onend = () => finish(fail('nospeech'));
      try { rec.start(); } catch { finish(fail('nospeech')); }
    });
  }

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
        
        if (said.includes(expected) || expected.includes(said) || said === expected) {
          this.speak('Excellent!', 'en-US');
          resolve(true);
        } else {
          this.speak(`You said ${transcript}. Try again!`, 'en-US');
          resolve(false);
        }
      };

      recognition.onerror = (e: any) => {
        this.isListening.set(false);
        if (e.error === 'not-allowed') {
          alert('عذراً، يجب عليك السماح للمتصفح باستخدام الميكروفون لتعمل هذه الميزة!');
        } else if (e.error === 'network') {
          this.speak('Network error. Check your connection.', 'en-US');
        } else {
          console.error('Speech error:', e.error);
        }
        resolve(false);
      };

      recognition.onend = () => {
        this.isListening.set(false);
      };
      
      recognition.start();
    });
  }
}
