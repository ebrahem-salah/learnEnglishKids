import { Injectable, signal } from '@angular/core';

export interface WordItem { word: string; ar_word: string; img: string; realImg?: string; imagePath?: string; sound?: string; category?: string; }
export interface AlphabetItem { letter: string; ar_letter: string; words: WordItem[]; gifUrl?: string; }
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

  say(text: string, lang: string): Promise<void> {
    return new Promise(resolve => {
      this.unlockAudio();
      
      // Stop any currently playing audio and TTS
      if (this.activeAudio) {
        this.activeAudio.pause();
        this.activeAudio.currentTime = 0;
      }
      if ('speechSynthesis' in window) {
        speechSynthesis.cancel();
      }

      const tl = lang.startsWith('ar') ? 'ar' : 'en';
      const cleanWord = text.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
      const localUrl = `assets/audio/words/${cleanWord}.mp3`;
      const fallbackUrl = `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(text)}&tl=${tl}`;

      // Check if we should attempt local offline file first (for English words/numbers/letters)
      const tryPlayUrl = (src: string, isLocal: boolean) => {
        const audio = new Audio(src);
        this.activeAudio = audio;
        
        if (this.slow() && tl === 'en') {
          audio.playbackRate = 0.75;
        }

        let resolved = false;
        const done = () => {
          if (!resolved) { 
            resolved = true; 
            if (this.activeAudio === audio) this.activeAudio = null;
            resolve(); 
          }
        };

        audio.onended = done;
        audio.onpause = done;
        audio.onerror = () => {
          if (isLocal) {
            // Local file didn't exist for this complex sentence, fallback to remote/TTS
            tryPlayUrl(fallbackUrl, false);
          } else {
            // Fallback to robotic browser TTS
            if (!('speechSynthesis' in window)) return done();
            speechSynthesis.cancel();
            const u = new SpeechSynthesisUtterance(text);
            u.lang = lang;
            const v = this.getBestVoice(lang);
            if (v) u.voice = v;
            u.rate = (lang.startsWith('ar') ? 0.95 : 1) * (this.slow() ? 0.65 : 0.9);
            u.pitch = 1.1;
            u.onend = done;
            u.onerror = done;
            speechSynthesis.speak(u);
          }
        };

        audio.play().catch(audio.onerror);
        setTimeout(done, 3000);
      };

      if (tl === 'en') {
        tryPlayUrl(localUrl, true);
      } else {
        tryPlayUrl(fallbackUrl, false);
      }
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
  speakSlow(text: string, lang: string) {
    const prev = this.slow();
    this.slow.set(true);
    this.speak(text, lang);
    setTimeout(() => this.slow.set(prev), 2000);
  }

  playAudioFile(src: string, fallbackText?: string) {
    this.unlockAudio();
    if (this.activeAudio) {
      this.activeAudio.pause();
      this.activeAudio.currentTime = 0;
      this.activeAudio = null;
    }
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }
    const audio = new Audio(src);
    this.activeAudio = audio;
    audio.onended = () => { if (this.activeAudio === audio) this.activeAudio = null; };
    audio.onerror = () => {
      if (this.activeAudio === audio) this.activeAudio = null;
      if (fallbackText) this.speak(fallbackText, 'en-US');
    };
    audio.play().catch(audio.onerror);
  }

  playPhonics(letter: string) {
    const key = `phonics_${letter.toLowerCase()}`;
    this.playAudioFile(`assets/audio/words/${key}.mp3`, letter);
  }

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

  playCelebration() {
    this.beep([523, 659, 784, 1046], 'triangle');
  }

  playSoundEffect(type: string) {
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
