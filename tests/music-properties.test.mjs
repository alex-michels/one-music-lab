import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  frequencyForMidi,
  nearestNote,
  noteName,
  ratios,
} from '../lib/music.ts';

// Property-based checks over many generated inputs, so a rule is stated once
// and held to across the range instead of at a few hand-picked notes. The
// generator is seeded, so a failure reproduces exactly.

const TUNINGS = ['equal', 'just', 'pythagorean'];
const RUNS = 400;

/** Deterministic 32-bit generator: same seed, same cases, every run. */
function generator(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const between = (random, low, high) => low + random() * (high - low);
const midiValue = (random) => Math.floor(between(random, 0, 128));
const tuningValue = (random) => TUNINGS[Math.floor(random() * TUNINGS.length)];

test('Raising a note by an octave always doubles its frequency', () => {
  const random = generator(1);
  for (let run = 0; run < RUNS; run++) {
    const reference = between(random, 20, 2000);
    const tuning = tuningValue(random);
    const midi = midiValue(random);
    const low = frequencyForMidi(midi, reference, tuning);
    const high = frequencyForMidi(midi + 12, reference, tuning);
    assert.ok(
      Math.abs(high - 2 * low) < 1e-9 * Math.max(1, high),
      `${tuning} at ${reference} Hz, midi ${midi}: ${high} ≠ 2 × ${low}`,
    );
  }
});

test('A higher note is always a higher frequency', () => {
  const random = generator(2);
  for (let run = 0; run < RUNS; run++) {
    const reference = between(random, 20, 2000);
    const tuning = tuningValue(random);
    const midi = midiValue(random);
    assert.ok(
      frequencyForMidi(midi + 1, reference, tuning) >
        frequencyForMidi(midi, reference, tuning),
      `${tuning} at ${reference} Hz is not rising at midi ${midi}`,
    );
  }
});

test('Naming a frequency and sounding that name agree', () => {
  const random = generator(3);
  for (let run = 0; run < RUNS; run++) {
    const reference = between(random, 20, 2000);
    const tuning = tuningValue(random);
    const midi = midiValue(random);
    const frequency = frequencyForMidi(midi, reference, tuning);
    const note = nearestNote(frequency, reference, tuning);
    assert.equal(note.midi, midi, `${tuning} at ${reference} Hz, midi ${midi}`);
    assert.equal(note.cents, 0);
    assert.equal(note.name, noteName(midi));
  }
});

test('A detuned frequency keeps the nearest name and reports the distance', () => {
  const random = generator(4);
  for (let run = 0; run < RUNS; run++) {
    const reference = between(random, 200, 880);
    const tuning = tuningValue(random);
    const midi = 24 + Math.floor(between(random, 0, 80));
    // Equal temperament has 100 cents between neighbours, so anything under
    // half of that keeps the name. The historical tunings do not: the closest
    // pair in just intonation is about 71 cents apart, so a smaller detuning
    // is the honest bound for them.
    const limit = tuning === 'equal' ? 45 : 30;
    const offset = between(random, -limit, limit);
    const frequency =
      frequencyForMidi(midi, reference, tuning) * 2 ** (offset / 1200);
    const note = nearestNote(frequency, reference, tuning);

    assert.equal(
      note.midi,
      midi,
      `${tuning}: ${offset.toFixed(1)} cents from midi ${midi} named ${note.name}`,
    );
    assert.ok(
      Math.abs(note.cents - offset) < 0.001,
      `reported ${note.cents} for ${offset}`,
    );
    assert.ok(Math.abs(note.cents) <= 50.001);
  }
});

test('No named note is further than half a semitone from its frequency', () => {
  const random = generator(5);
  for (let run = 0; run < RUNS; run++) {
    const reference = between(random, 200, 880);
    const tuning = tuningValue(random);
    const frequency = between(random, 20, 20000);
    const note = nearestNote(frequency, reference, tuning);

    assert.ok(Number.isInteger(note.midi));
    assert.ok(
      Math.abs(note.cents) <= 60,
      `${frequency} Hz in ${tuning} is ${note.cents} cents from ${note.name}`,
    );
    for (const neighbour of [note.midi - 1, note.midi + 1]) {
      const distance = Math.abs(
        1200 *
          Math.log2(frequency / frequencyForMidi(neighbour, reference, tuning)),
      );
      assert.ok(
        distance >= Math.abs(note.cents) - 1e-9,
        `${neighbour} is closer than the chosen ${note.midi}`,
      );
    }
  }
});

test('Every tuning states twelve steps within the octave', () => {
  for (const tuning of ['just', 'pythagorean']) {
    const steps = ratios[tuning];
    assert.equal(steps.length, 12);
    assert.equal(steps[0], 1);
    for (let i = 1; i < steps.length; i++) {
      assert.ok(steps[i] > steps[i - 1], `${tuning} step ${i} does not rise`);
      assert.ok(steps[i] < 2, `${tuning} step ${i} leaves the octave`);
    }
  }
});

test('Unusable input produces a defined result instead of hanging', () => {
  // Searching outwards from an infinite estimate used to loop forever and
  // freeze the tab, so each of these must simply return.
  for (const frequency of [
    Number.NaN,
    Number.POSITIVE_INFINITY,
    Number.NEGATIVE_INFINITY,
    0,
    -440,
    Number.MAX_VALUE,
    Number.MIN_VALUE,
  ]) {
    const note = nearestNote(frequency);
    assert.ok(
      Number.isInteger(note.midi),
      `${frequency} named a fractional note ${note.midi}`,
    );
    assert.equal(typeof note.name, 'string');
    assert.ok(note.name.length > 0, `${frequency} produced an empty name`);
  }

  for (const midi of [Number.NaN, Number.POSITIVE_INFINITY, -1, 1000]) {
    const value = frequencyForMidi(midi);
    assert.equal(typeof value, 'number');
  }

  // A reference the interface cannot produce still has to stay finite.
  for (const reference of [20, 2000]) {
    for (const tuning of TUNINGS) {
      for (const midi of [0, 127]) {
        const value = frequencyForMidi(midi, reference, tuning);
        assert.ok(
          Number.isFinite(value) && value > 0,
          `${tuning} at ${reference} Hz, midi ${midi} gave ${value}`,
        );
      }
    }
  }
});
