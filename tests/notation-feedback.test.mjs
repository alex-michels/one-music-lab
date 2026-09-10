import { test, expect } from 'vitest';
import { generateFrom, grade } from '../lib/exercises.ts';

test('An in-bar replacement is never diagnosed as crossing a barline', () => {
  const seen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 0; seed < 250; seed++) {
      const item = generateFrom('accidental-scope', 3, seed, lang);
      if (item.figure !== 'accidental-replacement') continue;
      seen.add(lang);
      // Both the written single sharp and its later repetition remain in bar 1.
      for (const option of item.options)
        expect(grade(item, option.id).tag).not.toBe('carried-the-sign-too-far');
    }
  expect(seen.size).toBe(3);
});

test('Barline and tied-reattack errors are distinguished from wrong alterations', () => {
  const targets = new Set();
  for (let seed = 0; seed < 400; seed++) {
    const item = generateFrom('accidental-scope', 3, seed, 'en');
    if (
      !['accidental-signature-reset', 'accidental-tie-scope'].includes(
        item.figure,
      )
    )
      continue;
    const event = Number(item.prompt.match(/event (\d+)/)[1]);
    targets.add(`${item.figure}:${event}`);
    const correct = item.options.find((option) => option.id === item.answer);
    const natural = item.options.find((option) => option.label === 'F4');
    const sharp = item.options.find((option) => option.label === 'F♯4');
    if (item.figure === 'accidental-tie-scope' && event === 2) {
      expect(correct).toBe(natural);
      expect(grade(item, sharp.id).tag).toBe('ignored-the-sign');
    } else {
      expect(correct).toBe(sharp);
      expect(grade(item, natural.id).tag).toBe('carried-the-sign-too-far');
    }
    const double = item.options.find((option) => option.label === 'F𝄪4');
    expect(grade(item, double.id).tag).toBe('wrong-alteration');
  }
  expect(targets.size).toBe(3);
});

test('Written-value options require distinguishing nearby durations, including the shortest values', () => {
  let smallestWins = 0,
    count = 0;
  const forms = new Set();
  for (let seed = 0; seed < 1200; seed++) {
    const item = generateFrom('value-identification', 3, seed, 'en');
    const match = item.figure.match(/^(note|rest)-(\d+)$/);
    if (!match) continue;
    const denominator = Number(match[2]);
    forms.add(item.figure);
    const values = item.options.map((option) =>
      Number(option.label.split('/')[1]),
    );
    expect(values).toContain(denominator / 2);
    if (denominator < 128) expect(values).toContain(denominator * 2);
    expect(new Set(values).size).toBe(4);
    if (Math.max(...values) === denominator) smallestWins++;
    count++;
  }
  expect(forms.size).toBe(10);
  expect(smallestWins / count).toBeLessThan(0.35);
});

test('Metronome answers respect the printed unit and offer distinct positive durations in every locale', () => {
  const units = { '♩': 1 / 4, '♪': 1 / 8, '♩.': 3 / 8, '𝅗𝅥': 1 / 2 };
  const seen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 0; seed < 1600; seed++) {
      const item = generateFrom('performance-marks', 3, seed, lang);
      if (item.rule !== 'metronome-unit' || item.review) continue;
      const [, symbol, tempo] = item.prompt.match(/(♩\.|♩|♪|𝅗𝅥) = (\d+)/);
      const [, numerator, denominator] = item.prompt.match(/(\d+)\/(\d+)/);
      const clicks = Number(numerator) / Number(denominator) / units[symbol];
      const expected = (clicks * 60) / Number(tempo);
      expect(Number(item.answer.replace(',', '.'))).toBeCloseTo(expected, 3);
      const values = item.options.map((option) =>
        Number(option.label.replace(',', '.')),
      );
      expect(values).toHaveLength(4);
      expect(new Set(values).size).toBe(4);
      expect(values.every((value) => Number.isFinite(value) && value > 0)).toBe(
        true,
      );
      for (const option of item.options) {
        expect(option.label).toMatch(
          lang === 'en' ? /^\d+(\.\d+)?$/ : /^\d+(,\d+)?$/,
        );
        expect(grade(item, option.id).correct).toBe(option.id === item.answer);
      }
      seen.add(`${lang}:${symbol}:${tempo}`);
    }
  expect(seen.size).toBe(3 * 4 * 4);
});

test('Dotted-note and rest questions use grammatical counting units while preserving the duration', () => {
  const cases = new Set();
  for (const lang of ['en', 'ru', 'de']) {
    for (let seed = 0; seed < 160; seed++) {
      const item = generateFrom('dotted-value', 3, seed, lang);
      if (item.options.length === 2) continue; // The separate bar-overflow variant does not count note units.
      const isDouble = /double-dotted|двумя точками|doppelt/.test(item.prompt);
      const rest = /rest|пауза|Pause/.test(item.prompt);
      const answer = item.options.find((o) => o.id === item.answer);
      expect(answer.label).toBe(isDouble ? '7' : '3');
      if (lang === 'en')
        expect(item.prompt).toMatch(
          /^How many (half|quarter|eighth|sixteenth|thirty-second) notes have the same duration as a (double-)?dotted /,
        );
      if (lang === 'ru')
        expect(item.prompt).toMatch(
          /Сколько это (половинных|четвертей|восьмых|шестнадцатых|тридцать вторых)\?/,
        );
      if (lang === 'de')
        expect(item.prompt).toMatch(
          /^Wie viele (halbe Noten|Viertelnoten|Achtelnoten|Sechzehntelnoten|Zweiunddreißigstelnoten) sind zusammen so lang wie eine (doppelt )?punktierte /,
        );
      cases.add(`${lang}:${isDouble}:${rest}`);
    }
  }
  expect(cases.size).toBe(12);
});

test('Answer order does not preserve a fixed cyclic offset from a double-flat landmark', () => {
  const offsets = new Map();
  let count = 0;
  for (let seed = 0; seed < 1600; seed++) {
    const item = generateFrom('accidental-scope', 3, seed, 'en');
    const landmark = item.options.findIndex((option) =>
      option.label.includes('𝄫'),
    );
    const answer = item.options.findIndex(
      (option) => option.id === item.answer,
    );
    if (landmark < 0 || landmark === answer) continue;
    const offset =
      (answer - landmark + item.options.length) % item.options.length;
    offsets.set(offset, (offsets.get(offset) ?? 0) + 1);
    count++;
  }
  expect(offsets.size).toBe(4);
  expect(Math.max(...offsets.values()) / count).toBeLessThan(0.4);
});

test('An octave error in a mixed excerpt is not described as a wrong accidental', () => {
  for (let seed = 0; seed < 100; seed++) {
    const english = generateFrom('short-excerpt', 3, seed, 'en');
    for (const lang of ['en', 'ru', 'de']) {
      const item = generateFrom('short-excerpt', 3, seed, lang);
      english.parts.forEach((part, index) => {
        if (part.kind !== 'pitch') return;
        const [, name, octave] = part.answer.match(/^(.*?)(\d+)$/);
        const neighbour = part.options.findIndex(
          (option) => option.label === `${name}${Number(octave) + 1}`,
        );
        expect(neighbour).toBeGreaterThanOrEqual(0);
        expect(item.parts[index].options[neighbour].tag).toBe(
          'neighbour-register',
        );
      });
    }
  }
});
