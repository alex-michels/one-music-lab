import { pitchName, type MusicLanguage, type SpelledPitch } from './notation';

/** Accept typing conveniences, without treating an enharmonic note as the answer. */
export function normalizeNoteName(input: string) {
  return input
    .normalize('NFKC')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/[\s\-‐‑–]/g, '')
    .replace(/𝄪/gu, '##')
    .replace(/𝄫/gu, 'bb')
    .replace(/♯/g, '#')
    .replace(/♭/g, 'b');
}

export function parseNoteName(
  input: string,
  lang: MusicLanguage,
): Pick<SpelledPitch, 'letter' | 'accidental'> | null {
  const normalized = normalizeNoteName(input);
  for (let letter = 0; letter < 7; letter++) {
    for (let accidental = -2; accidental <= 2; accidental++) {
      const name = pitchName({ letter, accidental, octave: 4, midi: 0 }, lang);
      if (normalizeNoteName(name) === normalized) return { letter, accidental };
    }
  }
  return null;
}
