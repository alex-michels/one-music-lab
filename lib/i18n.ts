import { german, type GermanKey } from './german';
import type { Lang } from './client-store';

export type LocalText = Record<Lang, string>;
export type Translate = (en: GermanKey, ru: string) => string;

/** No English fallback: a new source string must have a German catalog entry. */
export function translator(lang: Lang): Translate {
  return (en, ru) => (lang === 'de' ? german[en] : lang === 'ru' ? ru : en);
}

export function localText(en: GermanKey, ru: string): LocalText {
  return { en, ru, de: german[en] };
}

/**
 * A number as the reader wrote it, with the German decimal comma but no forced
 * digits: the A4 reference is a whole number until someone types 432.55, and
 * padding every readout to two decimals would change what EN and RU show.
 */
export function localNumber(value: number, lang: Lang): string {
  return lang === 'de' ? String(value).replace('.', ',') : String(value);
}

/** Display decimals in German convention; native number inputs keep their numeric value. */
export function fixedNumber(value: number, digits: number, lang: Lang): string {
  const text = value.toFixed(digits);
  return lang === 'de' ? text.replace('.', ',') : text;
}

export const siteDescription = localText(
  'Explore sound, tuning and music theory in English, Russian and German. Tone generator, chord progressions, lessons and ear training.',
  'Исследуйте звук, строй и теорию музыки на русском, английском и немецком. Генератор тона, аккордовые последовательности, уроки и тренировка слуха.',
);
