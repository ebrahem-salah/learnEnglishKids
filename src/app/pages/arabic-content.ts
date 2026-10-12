/**
 * Arabic course content (28 letters).
 *
 * Audio files (your own recordings, optional - text-to-speech is used if a file is missing):
 *   public/assets/audio/ar/<id>.mp3        -> the letter NAME   (e.g. alef.mp3  says "ألف")
 *   public/assets/audio/ar/<id>_word.mp3   -> the EXAMPLE WORD  (e.g. alef_word.mp3 says "أسد")
 * Run `npm run audio -- --csv` for the full list of names.
 */
export interface ArabicLetter {
  id: string;           // file-name friendly transliteration
  glyph: string;        // isolated form
  letterName: string;   // how the letter is called
  exampleWord: string;  // word that STARTS with the letter
  emoji: string;
}

export const ARABIC_LETTERS: ArabicLetter[] = [
  { id: 'alef', glyph: 'أ', letterName: 'ألف', exampleWord: 'أسد', emoji: '🦁' },
  { id: 'baa', glyph: 'ب', letterName: 'باء', exampleWord: 'بطة', emoji: '🦆' },
  { id: 'taa', glyph: 'ت', letterName: 'تاء', exampleWord: 'تفاحة', emoji: '🍎' },
  { id: 'thaa', glyph: 'ث', letterName: 'ثاء', exampleWord: 'ثعلب', emoji: '🦊' },
  { id: 'jeem', glyph: 'ج', letterName: 'جيم', exampleWord: 'جمل', emoji: '🐪' },
  { id: 'haa', glyph: 'ح', letterName: 'حاء', exampleWord: 'حصان', emoji: '🐴' },
  { id: 'khaa', glyph: 'خ', letterName: 'خاء', exampleWord: 'خروف', emoji: '🐑' },
  { id: 'dal', glyph: 'د', letterName: 'دال', exampleWord: 'دب', emoji: '🐻' },
  { id: 'dhal', glyph: 'ذ', letterName: 'ذال', exampleWord: 'ذرة', emoji: '🌽' },
  { id: 'raa', glyph: 'ر', letterName: 'راء', exampleWord: 'ريشة', emoji: '🪶' },
  { id: 'zay', glyph: 'ز', letterName: 'زاي', exampleWord: 'زرافة', emoji: '🦒' },
  { id: 'seen', glyph: 'س', letterName: 'سين', exampleWord: 'سمكة', emoji: '🐟' },
  { id: 'sheen', glyph: 'ش', letterName: 'شين', exampleWord: 'شمس', emoji: '☀️' },
  { id: 'sad', glyph: 'ص', letterName: 'صاد', exampleWord: 'صاروخ', emoji: '🚀' },
  { id: 'dad', glyph: 'ض', letterName: 'ضاد', exampleWord: 'ضفدع', emoji: '🐸' },
  { id: 'tah', glyph: 'ط', letterName: 'طاء', exampleWord: 'طائرة', emoji: '✈️' },
  { id: 'zah', glyph: 'ظ', letterName: 'ظاء', exampleWord: 'ظرف', emoji: '✉️' },
  { id: 'ayn', glyph: 'ع', letterName: 'عين', exampleWord: 'عنب', emoji: '🍇' },
  { id: 'ghayn', glyph: 'غ', letterName: 'غين', exampleWord: 'غيمة', emoji: '☁️' },
  { id: 'faa', glyph: 'ف', letterName: 'فاء', exampleWord: 'فيل', emoji: '🐘' },
  { id: 'qaf', glyph: 'ق', letterName: 'قاف', exampleWord: 'قمر', emoji: '🌙' },
  { id: 'kaf', glyph: 'ك', letterName: 'كاف', exampleWord: 'كلب', emoji: '🐶' },
  { id: 'lam', glyph: 'ل', letterName: 'لام', exampleWord: 'ليمون', emoji: '🍋' },
  { id: 'meem', glyph: 'م', letterName: 'ميم', exampleWord: 'موز', emoji: '🍌' },
  { id: 'noon', glyph: 'ن', letterName: 'نون', exampleWord: 'نجمة', emoji: '⭐' },
  { id: 'ha', glyph: 'ه', letterName: 'هاء', exampleWord: 'هدية', emoji: '🎁' },
  { id: 'waw', glyph: 'و', letterName: 'واو', exampleWord: 'وردة', emoji: '🌹' },
  { id: 'ya', glyph: 'ي', letterName: 'ياء', exampleWord: 'يد', emoji: '✋' }
];

/** Letters that do not connect to the next letter (no initial / medial form). */
export const NON_JOINING = new Set(['أ', 'د', 'ذ', 'ر', 'ز', 'و']);

/** isolated / initial / medial / final shapes, built with the joining character (ZWJ). */
export function letterForms(g: string) {
  const ZWJ = '\u200D';
  const joins = !NON_JOINING.has(g);
  return [
    { label: 'منفصل', text: g },
    { label: 'أول الكلمة', text: joins ? g + ZWJ : '' },
    { label: 'وسط الكلمة', text: joins ? ZWJ + g + ZWJ : '' },
    { label: 'آخر الكلمة', text: ZWJ + g }
  ];
}

/** Short vowels (الحركات). Audio: public/assets/audio/ar/<letter-id>_<a|u|i>.mp3  e.g. baa_a.mp3 says "بَ" */
export interface Haraka { id: 'a' | 'u' | 'i'; mark: string; name: string; hint: string; }
export const HARAKAT: Haraka[] = [
  { id: 'a', mark: '\u064E', name: 'فتحة', hint: 'علامة صغيرة فوق الحرف: صوت «أَ»' },
  { id: 'u', mark: '\u064F', name: 'ضمة', hint: 'واو صغيرة فوق الحرف: صوت «أُ»' },
  { id: 'i', mark: '\u0650', name: 'كسرة', hint: 'علامة صغيرة تحت الحرف: صوت «إِ»' }
];
export const syllable = (glyph: string, h: Haraka) => glyph + h.mark;
