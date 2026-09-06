import type { MusicLanguage } from './notation';

/**
 * Counted nouns take different forms in the two interface languages. English
 * has two; Russian has three, selected by the last digits of the number, so
 * `1 доля`, `2 доли` and `5 долей` are each correct and `2 долей` is not.
 * Every visible counter goes through this helper so that none of them has to
 * repeat the rule, and so that a wrong form is a test failure rather than a
 * string that only a Russian reader notices.
 */
export type EnglishForms = { one: string; other: string };
export type RussianForms = { one: string; few: string; many: string };

/**
 * The Russian form for a whole count. 11–14 take the `many` form despite
 * ending in 1–4, which is why the teens are checked before the last digit.
 */
export function russianForm(count: number, forms: RussianForms): string {
  if (!Number.isInteger(count) || count < 0)
    throw new RangeError('A counted noun needs a whole, non-negative count');
  const teens = count % 100;
  if (teens >= 11 && teens <= 14) return forms.many;
  const last = count % 10;
  if (last === 1) return forms.one;
  if (last >= 2 && last <= 4) return forms.few;
  return forms.many;
}

/** `2 beats` / `2 доли`: the number followed by the form the language needs. */
export function counted(
  count: number,
  lang: MusicLanguage,
  en: EnglishForms,
  ru: RussianForms,
): string {
  if (lang === 'ru') return `${count} ${russianForm(count, ru)}`;
  if (!Number.isInteger(count) || count < 0)
    throw new RangeError('A counted noun needs a whole, non-negative count');
  return `${count} ${count === 1 ? en.one : en.other}`;
}

/** The counters this interface shows, so that a caller cannot invent a form. */
export const nouns = {
  beats: {
    en: { one: 'beat', other: 'beats' },
    ru: { one: 'доля', few: 'доли', many: 'долей' },
  },
  chords: {
    en: { one: 'chord', other: 'chords' },
    ru: { one: 'аккорд', few: 'аккорда', many: 'аккордов' },
  },
  octaves: {
    en: { one: 'octave', other: 'octaves' },
    ru: { one: 'октаву', few: 'октавы', many: 'октав' },
  },
  semitones: {
    en: { one: 'semitone', other: 'semitones' },
    ru: { one: 'полутон', few: 'полутона', many: 'полутонов' },
  },
} as const;

/** `counted` for one of the known nouns above. */
export function count(
  amount: number,
  lang: MusicLanguage,
  noun: keyof typeof nouns,
): string {
  return counted(amount, lang, nouns[noun].en, nouns[noun].ru);
}
