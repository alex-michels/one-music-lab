import { expect, test } from 'vitest';
import {
  notationExamples,
  notationLessonPresets,
  planNotationExample,
} from '../lib/notation-experiments.ts';
import { lessons } from '../lib/learning.ts';

const span = (plan) => (plan.midis.length - 1) * plan.spacing + plan.duration;

test('Whole, half and quarter notes occupy the same four beats, with different attacks', () => {
  const plans = ['whole', 'halves', 'quarters'].map((id) =>
    planNotationExample(id, 60),
  );
  expect(plans.map((p) => p.midis.length)).toEqual([1, 2, 4]);
  expect(plans.map(span)).toEqual([4, 4, 4]);
  expect(plans.map((p) => p.duration)).toEqual([4, 2, 1]);
});

test('A tie keeps two beats sounding without a second attack', () => {
  const separate = planNotationExample('untied', 60);
  const tied = planNotationExample('tied', 60);
  expect(separate.midis).toEqual([62, 62]);
  expect(tied.midis).toEqual([62]);
  expect(span(separate)).toBe(2);
  expect(span(tied)).toBe(2);
});

test('Eight ordinary eighths and twelve triplet eighths fill the same four beats', () => {
  const eighths = planNotationExample('eighths', 60);
  const triplets = planNotationExample('triplets', 60);
  expect(eighths.midis).toHaveLength(8);
  expect(triplets.midis).toHaveLength(12);
  expect(eighths.spacing).toBe(0.5);
  expect(triplets.spacing).toBeCloseTo(1 / 3, 12);
  expect(span(eighths)).toBe(4);
  expect(span(triplets)).toBeCloseTo(4, 12);
});

test('Doubling tempo halves timing without changing pitches or attack count; every example is finite', () => {
  for (const id of Object.keys(notationExamples)) {
    const slow = planNotationExample(id, 60);
    const fast = planNotationExample(id, 120);
    expect(fast.midis).toEqual(slow.midis);
    expect(fast.duration).toBe(slow.duration / 2);
    expect(fast.spacing).toBe(slow.spacing / 2);
    expect(fast.duration).toBeGreaterThanOrEqual(0.125);
    expect(span(slow)).toBeLessThanOrEqual(8);
    expect(
      slow.midis.every((n) => Number.isInteger(n) && n >= 60 && n <= 67),
    ).toBe(true);
    fast.midis[0] = -1;
    expect(planNotationExample(id, 120).midis[0]).toBeGreaterThanOrEqual(60);
  }
});

test('Articulation changes note length while preserving onsets, and repeats preserve the figure', () => {
  const full = planNotationExample('sustained', 60);
  const short = planNotationExample('detached', 60);
  expect(short.midis).toEqual(full.midis);
  expect(short.spacing).toBe(full.spacing);
  expect(short.duration).toBeLessThan(full.duration);
  const figure = planNotationExample('figure', 60).midis;
  expect(planNotationExample('repeated', 60).midis).toEqual([
    ...figure,
    ...figure,
  ]);
  const ending = planNotationExample('ending', 60).midis;
  expect(ending.slice(0, 7)).toEqual([...figure, ...figure].slice(0, 7));
  expect(ending[7]).not.toBe(figure[3]);
  expect(planNotationExample('together', 60).spacing).toBe(0);
  expect(planNotationExample('successive', 60).spacing).toBeGreaterThan(0);
});

test('Unknown examples and invalid tempos are rejected before scheduling audio', () => {
  for (const tempo of [0, 59, 61, 121, NaN, Infinity, -60, '60'])
    expect(() => planNotationExample('pulse', tempo)).toThrow(RangeError);
  for (const id of ['missing', 'toString', '__proto__'])
    expect(() => planNotationExample(id, 60)).toThrow(RangeError);
});

test('Every notation lesson preset points to an existing lesson and a working example group', () => {
  const ids = lessons.map((l) => l.id);
  const groups = new Set(Object.values(notationExamples).map((e) => e.group));
  expect(Object.keys(notationLessonPresets)).toHaveLength(13);
  for (const [id, preset] of Object.entries(notationLessonPresets)) {
    expect(ids).toContain(id);
    expect(groups.has(preset.group)).toBe(true);
  }
  expect(notationLessonPresets['accidental-signs'].note).toEqual({
    letter: 0,
    accidental: 0,
    octave: 4,
  });
  expect(notationLessonPresets.enharmonics.note).toEqual({
    letter: 3,
    accidental: 1,
    octave: 4,
  });
  expect(notationLessonPresets.tempo.group).toBe('tempo');
  expect(notationLessonPresets.dynamics.group).toBe('dynamics');
});
