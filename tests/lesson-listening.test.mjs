import { expect, test } from 'vitest';
import {
  LESSON_REFERENCE,
  MAX_LISTEN_SECONDS,
  lessonListening,
  planListenStep,
} from '../lib/lesson-listening.ts';
import { TOPIC_IDS } from '../lib/content/ids.ts';
import { plainNoteText } from '../lib/note-text.ts';
import { scales } from '../lib/scales.ts';
import { patterns } from '../lib/learning.ts';
import { readingOrder } from '../lib/course.ts';

const plans = (topic) => lessonListening[topic].map(planListenStep);
const semitones = (low, high) => 12 * Math.log2(high / low);
const steps = (frequencies) =>
  frequencies.map((hz) => Math.round(semitones(frequencies[0], hz)));

test('Every lesson of the book offers one to four bounded, audible examples in all three languages', () => {
  expect(Object.keys(lessonListening).sort()).toEqual([...TOPIC_IDS].sort());
  expect(new Set(readingOrder)).toEqual(new Set(Object.keys(lessonListening)));
  for (const topic of TOPIC_IDS) {
    const list = lessonListening[topic];
    expect(list.length, topic).toBeGreaterThanOrEqual(1);
    expect(list.length, topic).toBeLessThanOrEqual(4);
    const seen = new Set();
    for (const step of list) {
      for (const lang of ['en', 'ru', 'de'])
        expect(step.label[lang].trim().length, topic).toBeGreaterThan(0);
      // Plain Russian for search and speech; the italic markup stays beside it.
      expect(step.label.ru).not.toContain('[[');
      if (step.label.ruMarkup)
        expect(plainNoteText(step.label.ruMarkup)).toBe(step.label.ru);
      // Two buttons that read the same cannot be told apart.
      expect(seen.has(step.label.en), `${topic}: ${step.label.en}`).toBe(false);
      seen.add(step.label.en);
      const plan = planListenStep(step);
      expect(plan.frequencies.length).toBeGreaterThan(0);
      for (const hz of plan.frequencies) {
        expect(hz).toBeGreaterThanOrEqual(20);
        expect(hz).toBeLessThan(20000);
      }
      expect(plan.duration).toBeGreaterThan(0);
      expect(plan.spacing).toBeGreaterThanOrEqual(0);
      expect(plan.gain).toBeGreaterThan(0);
      expect(plan.gain).toBeLessThanOrEqual(1);
      expect(plan.total).toBeCloseTo(
        plan.spacing * (plan.frequencies.length - 1) + plan.duration,
        9,
      );
      expect(plan.total, `${topic}: ${step.label.en}`).toBeLessThanOrEqual(
        MAX_LISTEN_SECONDS,
      );
    }
  }
});

test('The sound lesson plays exactly the frequencies its text names, as pure tones', () => {
  const [low, high, pair] = plans('sound');
  expect(low.frequencies).toEqual([220]);
  expect(high.frequencies).toEqual([440]);
  expect(pair.frequencies).toEqual([220, 440]);
  expect(pair.spacing).toBeGreaterThan(0);
  for (const plan of [low, high, pair]) expect(plan.wave).toBe('sine');
  // One held tone: nothing follows it, so nothing is spaced.
  expect(low.spacing).toBe(0);
  expect(low.total).toBe(low.duration);
});

test('The tuning lesson keeps A4 and changes only the third above it', () => {
  const [equal, just, pythagorean] = plans('tuning');
  for (const plan of [equal, just, pythagorean]) {
    expect(plan.frequencies[0]).toBe(LESSON_REFERENCE);
    expect(plan.spacing).toBe(0);
  }
  expect(equal.frequencies[1] / 440).toBeCloseTo(2 ** (4 / 12), 12);
  expect(just.frequencies[1] / 440).toBeCloseTo(5 / 4, 12);
  expect(pythagorean.frequencies[1] / 440).toBeCloseTo(81 / 64, 12);
  // The three thirds are audibly different sizes, in this order.
  expect(just.frequencies[1]).toBeLessThan(equal.frequencies[1]);
  expect(equal.frequencies[1]).toBeLessThan(pythagorean.frequencies[1]);
});

test('Interval, scale and chord examples sound the patterns their labels name', () => {
  expect(plans('intervals').map((plan) => steps(plan.frequencies))).toEqual([
    [0, 3],
    [0, 4],
    [0, 7],
  ]);
  for (const step of lessonListening.intervals) {
    const size = steps(planListenStep(step).frequencies)[1];
    for (const lang of ['en', 'ru', 'de'])
      expect(step.label[lang]).toContain(String(size));
  }
  const scale = (name) => scales.find((entry) => entry.en === name).steps;
  const [major, dorian] = plans('scales');
  expect(steps(major.frequencies)).toEqual(scale('Major'));
  expect(steps(dorian.frequencies)).toEqual(scale('Dorian'));
  expect(major.frequencies[0]).toBe(dorian.frequencies[0]);
  const chord = (name) =>
    patterns.chords.find((entry) => entry.en === name).steps;
  const [majorArp, majorBlock, minorArp, minorBlock] = plans('chords');
  expect(steps(majorArp.frequencies)).toEqual(chord('Major triad'));
  expect(steps(minorArp.frequencies)).toEqual(chord('Minor triad'));
  expect(majorBlock.frequencies).toEqual(majorArp.frequencies);
  expect(minorBlock.frequencies).toEqual(minorArp.frequencies);
  expect(majorArp.spacing).toBeGreaterThan(0);
  expect(majorBlock.spacing).toBe(0);
  expect(minorBlock.spacing).toBe(0);
});

test('Timbre changes the waveform and nothing else', () => {
  const list = plans('timbre');
  expect(list.map((plan) => plan.wave)).toEqual([
    'sine',
    'triangle',
    'square',
    'sawtooth',
  ]);
  for (const plan of list) {
    expect(plan.frequencies).toEqual([440]);
    expect(plan.duration).toBe(list[0].duration);
    expect(plan.gain).toBe(1);
  }
});

test('Pitch-reading lessons sound the written notes they name', () => {
  const hz = (midi) => 440 * 2 ** ((midi - 69) / 12);
  expect(steps(plans('note-names')[0].frequencies)).toEqual([
    0, 2, 4, 5, 7, 9, 11, 12,
  ]);
  expect(plans('note-names')[0].frequencies[0]).toBeCloseTo(hz(60), 9);
  const [treble, bass, both] = plans('clefs');
  expect(treble.frequencies[0]).toBeCloseTo(hz(67), 9);
  expect(bass.frequencies[0]).toBeCloseTo(hz(53), 9);
  expect(both.frequencies).toEqual([
    treble.frequencies[0],
    bass.frequencies[0],
  ]);
  const [semitone, tone] = plans('accidental-signs');
  expect(steps(semitone.frequencies)).toEqual([0, 1]);
  expect(steps(tone.frequencies)).toEqual([0, 2]);
  const [upper, lower] = plans('accidental-scope');
  expect(steps(upper.frequencies)).toEqual([0, -1]);
  expect(steps(lower.frequencies)).toEqual([0, -1]);
  // The same pair, exactly one octave lower.
  expect(upper.frequencies[0] / lower.frequencies[0]).toBeCloseTo(2, 12);
  expect(plans('enharmonics')[0].frequencies[0]).toBeCloseTo(hz(66), 9);
  const [successive, together] = plans('staff');
  expect(successive.frequencies).toEqual(together.frequencies);
  expect(successive.spacing).toBeGreaterThan(0);
  expect(together.spacing).toBe(0);
});

test('Rhythm lessons keep the time span and change only what the lesson compares', () => {
  const [whole, halves, quarters] = plans('durations');
  expect(
    [whole, halves, quarters].map((plan) => plan.frequencies.length),
  ).toEqual([1, 2, 4]);
  for (const plan of [whole, halves, quarters]) expect(plan.total).toBe(4);
  const [untied, tied] = plans('dots-ties');
  expect(untied.frequencies).toHaveLength(2);
  expect(tied.frequencies).toHaveLength(1);
  expect(untied.total).toBe(tied.total);
  const [eighths, triplets] = plans('beat-division');
  expect(eighths.frequencies).toHaveLength(8);
  expect(triplets.frequencies).toHaveLength(12);
  expect(eighths.total).toBeCloseTo(triplets.total, 9);
  const [slow, fast] = plans('tempo');
  expect(slow.frequencies).toHaveLength(4);
  expect(fast.frequencies).toHaveLength(4);
  expect(slow.spacing).toBe(1);
  expect(fast.spacing).toBe(0.5);
  for (const step of lessonListening.tempo)
    for (const lang of ['en', 'ru', 'de'])
      expect(step.label[lang]).toContain(`♩ = ${step.tempo}`);
});

test('Performance lessons change loudness, length or route and keep the pitches', () => {
  const [soft, strong] = plans('dynamics');
  expect(soft.frequencies).toEqual(strong.frequencies);
  expect(soft.gain).toBeLessThan(strong.gain);
  const [sustained, detached] = plans('articulation');
  expect(sustained.frequencies).toEqual(detached.frequencies);
  // The attacks stay where they were; only the sounding length shrinks.
  expect(sustained.spacing).toBe(detached.spacing);
  expect(detached.duration).toBeLessThan(sustained.duration);
  const [figure, repeated, ending] = plans('repeats');
  expect(figure.frequencies).toHaveLength(4);
  expect(repeated.frequencies).toEqual([
    ...figure.frequencies,
    ...figure.frequencies,
  ]);
  expect(ending.frequencies.slice(0, 7)).toEqual(
    repeated.frequencies.slice(0, 7),
  );
  expect(ending.frequencies[7]).not.toBe(repeated.frequencies[7]);
});

test('A lesson example never follows the laboratory tuning or an unknown example', () => {
  // C4 in twelve-tone equal temperament at A4 = 440 Hz, whatever the lab holds.
  expect(plans('durations')[0].frequencies[0]).toBeCloseTo(261.6255653, 6);
  expect(() =>
    planListenStep({
      label: { en: 'x', ru: 'x', de: 'x' },
      example: 'nope',
      tempo: 60,
    }),
  ).toThrow(RangeError);
  expect(() =>
    planListenStep({
      label: { en: 'x', ru: 'x', de: 'x' },
      example: 'pulse',
      tempo: 90,
    }),
  ).toThrow(RangeError);
});
