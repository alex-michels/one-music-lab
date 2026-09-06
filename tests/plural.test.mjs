import { expect, test } from 'vitest';
import { count, counted, nouns, russianForm } from '../lib/plural.ts';

const beats = nouns.beats;

test('Russian picks one of three forms, and the teens are the exception', () => {
  // Written out rather than generated, because the rule is what is being tested.
  const expected = {
    0: 'долей',
    1: 'доля',
    2: 'доли',
    3: 'доли',
    4: 'доли',
    5: 'долей',
    10: 'долей',
    11: 'долей',
    12: 'долей',
    13: 'долей',
    14: 'долей',
    15: 'долей',
    20: 'долей',
    21: 'доля',
    22: 'доли',
    25: 'долей',
    100: 'долей',
    101: 'доля',
    102: 'доли',
    111: 'долей',
    112: 'долей',
    121: 'доля',
    1002: 'доли',
  };
  for (const [number, form] of Object.entries(expected))
    expect(russianForm(Number(number), beats.ru), number).toBe(form);
});

test('The counted phrase carries the number and the right form in both languages', () => {
  expect(counted(1, 'en', beats.en, beats.ru)).toBe('1 beat');
  expect(counted(2, 'en', beats.en, beats.ru)).toBe('2 beats');
  expect(counted(0, 'en', beats.en, beats.ru)).toBe('0 beats');
  expect(counted(1, 'ru', beats.en, beats.ru)).toBe('1 доля');
  expect(counted(2, 'ru', beats.en, beats.ru)).toBe('2 доли');
  expect(counted(8, 'ru', beats.en, beats.ru)).toBe('8 долей');
});

test('The known nouns cover every counter the interface shows', () => {
  expect(count(1, 'ru', 'beats')).toBe('1 доля');
  expect(count(4, 'ru', 'beats')).toBe('4 доли');
  expect(count(4, 'en', 'beats')).toBe('4 beats');
  expect(count(2, 'ru', 'chords')).toBe('2 аккорда');
  expect(count(16, 'ru', 'chords')).toBe('16 аккордов');
  expect(count(1, 'ru', 'semitones')).toBe('1 полутон');
  expect(count(2, 'ru', 'semitones')).toBe('2 полутона');
  expect(count(7, 'ru', 'semitones')).toBe('7 полутонов');
  expect(count(11, 'ru', 'semitones')).toBe('11 полутонов');
  for (const noun of Object.values(nouns))
    expect(new Set([noun.ru.one, noun.ru.few, noun.ru.many]).size).toBe(3);
});

test('A count that has no grammatical form is refused rather than guessed', () => {
  for (const bad of [-1, 1.5, NaN, Infinity, -0.5]) {
    expect(() => russianForm(bad, beats.ru)).toThrow(RangeError);
    expect(() => counted(bad, 'ru', beats.en, beats.ru)).toThrow(RangeError);
    expect(() => counted(bad, 'en', beats.en, beats.ru)).toThrow(RangeError);
  }
});
