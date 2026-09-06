export type Tuning = 'equal' | 'just' | 'pythagorean';
export type Wave = 'sine' | 'triangle' | 'square' | 'sawtooth';
export const ratios = {
  just: [
    1,
    16 / 15,
    9 / 8,
    6 / 5,
    5 / 4,
    4 / 3,
    45 / 32,
    3 / 2,
    8 / 5,
    5 / 3,
    9 / 5,
    15 / 8,
  ],
  pythagorean: [
    1,
    256 / 243,
    9 / 8,
    32 / 27,
    81 / 64,
    4 / 3,
    729 / 512,
    3 / 2,
    128 / 81,
    27 / 16,
    16 / 9,
    243 / 128,
  ],
};
// Fixed chromatic realizations anchored to A, not universal models of these traditions.
export function frequencyForMidi(
  midi: number,
  reference = 440,
  tuning: Tuning = 'equal',
): number {
  const offset = midi - 69;
  if (tuning === 'equal') return reference * 2 ** (offset / 12);
  return (
    reference *
    2 ** Math.floor(offset / 12) *
    ratios[tuning][((offset % 12) + 12) % 12]
  );
}
export function noteName(midi: number) {
  return (
    ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'][
      ((midi % 12) + 12) % 12
    ] +
    (Math.floor(midi / 12) - 1)
  );
}
export function nearestNote(
  frequency: number,
  reference = 440,
  tuning: Tuning = 'equal',
) {
  // An unusable frequency must still leave a finite starting point: searching
  // outwards from Infinity never ends, because Infinity + 1 is Infinity.
  // `|| 0` also folds the -0 that rounding produces just below the reference.
  const guess = Math.round(69 + 12 * Math.log2(frequency / reference));
  const estimate = Number.isFinite(guess) ? guess || 0 : 0;
  let midi = estimate;
  let cents =
    1200 * Math.log2(frequency / frequencyForMidi(midi, reference, tuning));
  for (let candidate = estimate - 2; candidate <= estimate + 2; candidate++) {
    const delta =
      1200 *
      Math.log2(frequency / frequencyForMidi(candidate, reference, tuning));
    if (Math.abs(delta) < Math.abs(cents)) {
      midi = candidate;
      cents = delta;
    }
  }
  return {
    midi,
    cents: Math.abs(cents) < 0.00001 ? 0 : cents,
    name: noteName(midi),
  };
}
