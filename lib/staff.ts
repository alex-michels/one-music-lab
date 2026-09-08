import type { SpelledPitch } from './notation';

/**
 * Staff geometry (roadmap №553).
 *
 * Pure placement, no drawing and no engine. Everything is measured in **staff
 * steps**: one step is the distance from a line to the next space, so two steps
 * make one staff space. Step 0 is the bottom line, step 8 the top line.
 *
 * The chapter's own claim — that every clef simply names one pitch — is what
 * makes this a formula rather than a table: a clef is one number, the diatonic
 * value sitting on its bottom line, and every other note follows by counting.
 */

export type Clef = 'treble' | 'bass' | 'alto' | 'tenor';

/** Diatonic value of a spelled pitch: letters counted straight through octaves. */
export const diatonic = (
  pitch: Pick<SpelledPitch, 'letter' | 'octave'>,
): number => pitch.letter + 7 * pitch.octave;

/**
 * The diatonic value that sits on each clef's bottom line. Treble puts g′ on
 * the second line, which places e′ on the first; bass puts F on the fourth,
 * which places G on the first; both C clefs put c′ on the line they name.
 */
const bottomLine: Record<Clef, number> = {
  treble: diatonic({ letter: 2, octave: 4 }), // e′
  bass: diatonic({ letter: 4, octave: 2 }), // G
  alto: diatonic({ letter: 3, octave: 3 }), // f
  tenor: diatonic({ letter: 1, octave: 3 }), // d
};

/** The pitch each clef names, for teaching and for labelling the drawing. */
export const clefAnchor: Record<
  Clef,
  { letter: number; octave: number; line: number }
> = {
  treble: { letter: 4, octave: 4, line: 2 }, // g′ on line 2
  bass: { letter: 3, octave: 3, line: 4 }, // f on line 4
  alto: { letter: 0, octave: 4, line: 3 }, // c′ on line 3
  tenor: { letter: 0, octave: 4, line: 4 }, // c′ on line 4
};

/** Steps above the bottom line. Negative is below the staff. */
export const staffStep = (pitch: SpelledPitch, clef: Clef): number =>
  diatonic(pitch) - bottomLine[clef];

/**
 * Ledger lines needed for a note, as step values. A note sitting in the space
 * just outside the staff needs none; the lines continue the staff's own
 * alternation of line and space, so they land on even steps only.
 */
export function ledgerSteps(step: number): number[] {
  const lines: number[] = [];
  for (let s = 10; s <= step; s += 2) lines.push(s);
  for (let s = -2; s >= step; s -= 2) lines.push(s);
  return lines;
}

/** Stems point away from the middle line; a note on it turns its stem down. */
export const stemDirection = (step: number): 'up' | 'down' =>
  step < 4 ? 'up' : 'down';

export type NoteValue = 'whole' | 'half' | 'quarter';

const heads = {
  whole: 'noteheadWhole',
  half: 'noteheadHalf',
  quarter: 'noteheadBlack',
} as const;

const accidentalGlyphs = [
  'accidentalDoubleFlat',
  'accidentalFlat',
  'accidentalNatural',
  'accidentalSharp',
  'accidentalDoubleSharp',
] as const;

export type PlacedNote = {
  pitch: SpelledPitch;
  step: number;
  /** Centre of the head, in staff spaces from the left edge of the drawing. */
  x: number;
  head: (typeof heads)[NoteValue];
  /** Only when the note carries one; a natural is drawn only if asked for. */
  accidental: (typeof accidentalGlyphs)[number] | null;
  accidentalX: number | null;
  ledger: number[];
  stem: 'up' | 'down' | null;
};

export type StaffLayout = {
  clef: Clef;
  notes: PlacedNote[];
  /** Drawing size in staff spaces, including the room notes take outside it. */
  width: number;
  height: number;
  /** Distance from the top of the drawing down to the staff's top line. */
  top: number;
};

const CLEF_WIDTH = 3;
const NOTE_SPACING = 3.2;
const ACCIDENTAL_WIDTH = 1.75;
const MARGIN = 1;

/**
 * How far each clef reaches above and below the staff, in steps. A G clef is
 * taller than the staff it stands on, so the drawing has to make room for it
 * or the box clips the glyph that names the whole system.
 */
const clefExtent: Record<Clef, { high: number; low: number }> = {
  treble: { high: 11, low: -4 },
  bass: { high: 9, low: 1 },
  alto: { high: 8, low: 0 },
  tenor: { high: 10, low: 2 },
};

/**
 * Places a run of notes. Spacing is even rather than proportional to duration:
 * this draws examples and exercise items, not engraved music, and even spacing
 * is what keeps a single note centred and a row of them readable.
 */
export function layout(
  pitches: SpelledPitch[],
  clef: Clef,
  values: NoteValue[] = [],
): StaffLayout {
  let x = MARGIN + CLEF_WIDTH;
  const notes: PlacedNote[] = pitches.map((pitch, i) => {
    const step = staffStep(pitch, clef);
    const showAccidental = pitch.accidental !== 0;
    const accidentalX = showAccidental ? x : null;
    if (showAccidental) x += ACCIDENTAL_WIDTH;
    const value = values[i] ?? 'quarter';
    const placed: PlacedNote = {
      pitch,
      step,
      x,
      head: heads[value],
      accidental: showAccidental
        ? accidentalGlyphs[pitch.accidental + 2]
        : null,
      accidentalX,
      ledger: ledgerSteps(step),
      stem: value === 'whole' ? null : stemDirection(step),
    };
    x += NOTE_SPACING;
    return placed;
  });

  // The drawing has to be tall enough for whatever sits outside the staff,
  // including the stem, or a note far above the lines is clipped by its own box.
  const steps = notes.flatMap((n) => [
    n.step,
    n.stem === 'up' ? n.step + 7 : n.step - 7,
  ]);
  const highest = Math.max(8, clefExtent[clef].high, ...steps);
  const lowest = Math.min(0, clefExtent[clef].low, ...steps);
  const top = (highest - 8) / 2 + MARGIN;
  return {
    clef,
    notes,
    width: x - NOTE_SPACING + MARGIN + 2,
    height: (highest - lowest) / 2 + 2 * MARGIN,
    top,
  };
}

/** Where a step sits vertically, in staff spaces below the drawing's top. */
export const stepY = (step: number, top: number): number =>
  top + (8 - step) / 2;
