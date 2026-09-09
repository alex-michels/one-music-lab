import { assertStaffPitch } from './staff';
import type { SpelledPitch } from './notation';

/** Common-practice key-signature order. Signed count: flats negative, sharps positive. */
export function signature(
  count: number,
): { letter: number; accidental: number; step: number }[] {
  if (!Number.isInteger(count) || Math.abs(count) > 7)
    throw new RangeError('Signature must contain 0–7 sharps or flats');
  const letters = count < 0 ? [6, 2, 5, 1, 4, 0, 3] : [3, 0, 4, 1, 5, 2, 6];
  const steps = count < 0 ? [4, 7, 3, 6, 2, 5, 1] : [8, 5, 9, 6, 3, 7, 4];
  return letters.slice(0, Math.abs(count)).map((letter, index) => ({
    letter,
    accidental: Math.sign(count),
    step: steps[index],
  }));
}

/** An explicit accidental REPLACES the signature. It is never added to it. */
export function underSignature(
  pitch: SpelledPitch,
  count: number,
  explicit: number | null,
): SpelledPitch {
  assertStaffPitch(pitch);
  const accidental =
    explicit ??
    signature(count).find((sign) => sign.letter === pitch.letter)?.accidental ??
    0;
  // Validate count even when explicit is provided.
  signature(count);
  const result = {
    ...pitch,
    accidental,
    midi: pitch.midi - pitch.accidental + accidental,
  };
  assertStaffPitch(result);
  return result;
}

export function ottava(pitch: SpelledPitch, octaves: number): SpelledPitch {
  assertStaffPitch(pitch);
  if (!Number.isInteger(octaves) || Math.abs(octaves) > 2)
    throw new RangeError('Use at most two octaves');
  const result = {
    ...pitch,
    octave: pitch.octave + octaves,
    midi: pitch.midi + 12 * octaves,
  };
  assertStaffPitch(result);
  return result;
}

export type AccidentalEvent = {
  pitch: SpelledPitch;
  measure: number;
  accidental: number | null;
  tieFromPrevious?: boolean;
};

/** One voice under common-practice bar/registered-pitch accidental scope. */
export function resolveAccidentalSequence(
  events: readonly AccidentalEvent[],
  signatureCount: number,
): SpelledPitch[] {
  signature(signatureCount);
  if (events.length === 0 || events.length > 128)
    throw new RangeError('Use 1–128 written events');
  const localSigns = new Map<number, number>();
  let measure = 0;
  let previous: SpelledPitch | undefined;
  return events.map((event) => {
    assertStaffPitch(event.pitch);
    if (
      !Number.isInteger(event.measure) ||
      event.measure < 1 ||
      event.measure < measure
    )
      throw new RangeError(
        'Measures must be positive integers in reading order',
      );
    if (
      event.accidental !== null &&
      (!Number.isInteger(event.accidental) || Math.abs(event.accidental) > 2)
    )
      throw new RangeError('Use a natural, single or double accidental');
    if (event.measure !== measure) localSigns.clear();
    measure = event.measure;
    const key = event.pitch.octave * 7 + event.pitch.letter;
    let result: SpelledPitch;
    if (event.tieFromPrevious) {
      if (
        !previous ||
        previous.letter !== event.pitch.letter ||
        previous.octave !== event.pitch.octave ||
        event.accidental !== null
      )
        throw new RangeError(
          'A tied continuation needs the same written pitch and no new sign',
        );
      result = underSignature(event.pitch, signatureCount, previous.accidental);
    } else {
      if (event.accidental !== null) localSigns.set(key, event.accidental);
      result = underSignature(
        event.pitch,
        signatureCount,
        localSigns.get(key) ?? null,
      );
    }
    previous = result;
    return result;
  });
}
