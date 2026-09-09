import { expect, test } from 'vitest';
import { resolveAccidentalSequence } from '../lib/notation-workbench.ts';
import { ledgerSteps, placementRange } from '../lib/staff.ts';

const f4 = { letter: 3, accidental: 0, octave: 4, midi: 65 };
const f5 = { ...f4, octave: 5, midi: 77 };
const event = (pitch, measure, accidental = null, tieFromPrevious = false) => ({
  pitch,
  measure,
  accidental,
  tieFromPrevious,
});

test('A local sign stays in its octave and carries only its tied continuation across a barline', () => {
  const events = [
    event(f4, 1, 0),
    event(f5, 1),
    event(f4, 1),
    event(f4, 2, null, true),
    event(f4, 2),
  ];
  const frozen = Object.freeze(events.map((entry) => Object.freeze(entry)));
  const result = resolveAccidentalSequence(frozen, 1);
  // F natural in bar 1, F sharp in the other octave, then a tied F natural
  // and a freshly attacked F sharp in bar 2.
  expect(result.map((pitch) => pitch.midi)).toEqual([65, 78, 65, 65, 66]);
  expect(result.map((pitch) => pitch.accidental)).toEqual([0, 1, 0, 0, 1]);
  expect(resolveAccidentalSequence(frozen, 1)).toEqual(result);
  expect(frozen[0].pitch).toEqual(f4);
});

test('Later explicit signs replace doubles, and tie chains do not establish a new-bar accidental', () => {
  const events = [
    event(f4, 1, 2),
    event(f4, 1, 1),
    event(f4, 1),
    event(f4, 2, null, true),
    event(f4, 3, null, true),
    event(f4, 3),
  ];
  expect(
    resolveAccidentalSequence(events, 0).map((pitch) => pitch.midi),
  ).toEqual([67, 66, 66, 66, 66, 65]);
  const b4 = { letter: 6, accidental: 0, octave: 4, midi: 71 };
  const b5 = { ...b4, octave: 5, midi: 83 };
  expect(
    resolveAccidentalSequence(
      [
        event(b4, 1, 0),
        event(b5, 1),
        event(b4, 1),
        event(b4, 2, null, true),
        event(b4, 2),
      ],
      -1,
    ).map((pitch) => pitch.midi),
  ).toEqual([71, 82, 71, 71, 70]);
  expect(
    resolveAccidentalSequence([event(f4, 1), event(f5, 2)], 1).map(
      (pitch) => pitch.midi,
    ),
  ).toEqual([66, 78]);
});

test('Malformed sequences and contradictory tie instructions are rejected, not silently corrected', () => {
  for (const events of [
    [],
    Array.from({ length: 129 }, () => event(f4, 1)),
    [event(f4, 0)],
    [event(f4, 1.5)],
    [event(f4, Infinity)],
    [event(f4, 2), event(f4, 1)],
    [event(f4, 1, 3)],
    [event(f4, 1, NaN)],
    [event(f4, 1, 0.5)],
    [event(f4, 1, null, true)],
    [event(f4, 1), event(f5, 2, null, true)],
    [
      event(f4, 1),
      event({ letter: 4, accidental: 0, octave: 4, midi: 67 }, 1, null, true),
    ],
    [event(f4, 1), event(f4, 2, 0, true)],
    [event({ ...f4, midi: 66 }, 1)],
  ])
    expect(() => resolveAccidentalSequence(events, 0)).toThrow(RangeError);
  expect(() => resolveAccidentalSequence([event(f4, 1)], 8)).toThrow(
    RangeError,
  );
  expect(
    resolveAccidentalSequence(
      Array.from({ length: 128 }, () => event(f4, 1)),
      0,
    ),
  ).toHaveLength(128);
});

test('The placement budget allows the outer spaces but never another ledger line', () => {
  expect(placementRange(0)).toEqual([-1, 9]);
  expect(placementRange(1)).toEqual([-3, 11]);
  expect(placementRange(6)).toEqual([-13, 21]);
  for (let budget = 0; budget <= 6; budget++) {
    const [low, high] = placementRange(budget);
    expect(ledgerSteps(low)).toHaveLength(budget);
    expect(ledgerSteps(high)).toHaveLength(budget);
    expect(ledgerSteps(low - 1)).toHaveLength(budget + 1);
    expect(ledgerSteps(high + 1)).toHaveLength(budget + 1);
  }
  for (const value of [-1, 7, 0.5, NaN, Infinity])
    expect(() => placementRange(value)).toThrow(RangeError);
});
