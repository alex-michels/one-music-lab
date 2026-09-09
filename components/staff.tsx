'use client';
import { useId } from 'react';
import { GLYPH_UNITS_PER_SPACE, glyphs, type GlyphName } from '@/lib/glyphs';
import {
  layout,
  stepY,
  type Clef,
  type NoteValue,
  type StaffLayout,
} from '@/lib/staff';
import { pitchLabel, type SpelledPitch } from '@/lib/notation';
type Lang = import('@/lib/client-store').Lang;

/**
 * The staff (roadmap №553).
 *
 * Inline SVG over the project's own pitch model, drawn from committed glyph
 * outlines. No engine runs in the browser and no font is fetched, so the static
 * export stays self-contained.
 *
 * Localized title/aria-labelledby follow W3C WAI's SVG text-alternative
 * pattern. Exercise descriptions name positions and signs without revealing
 * the answer; longer score navigation remains outside this small prototype.
 */

const clefGlyph: Record<Clef, GlyphName> = {
  treble: 'gClef',
  bass: 'fClef',
  alto: 'cClef',
  tenor: 'cClef',
};
/** Step the clef glyph is anchored to: it is drawn from the line it names. */
const clefStep: Record<Clef, number> = {
  treble: 2,
  bass: 6,
  alto: 4,
  tenor: 6,
};

function Glyph({
  name,
  x,
  y,
  space,
}: {
  name: GlyphName;
  x: number;
  y: number;
  space: number;
}) {
  // Font units point up, SVG down, so the glyph is flipped as it is scaled.
  const s = space / GLYPH_UNITS_PER_SPACE;
  return (
    <path
      d={glyphs[name]}
      transform={`translate(${x * space} ${y * space}) scale(${s} ${-s})`}
      fill="currentColor"
    />
  );
}

export function Staff({
  pitches,
  clef = 'treble',
  values = [],
  lang,
  space = 9,
  label,
  barlines = [],
  accidentalVisibility = [],
  ties = [],
  range,
}: {
  pitches: SpelledPitch[];
  clef?: Clef;
  values?: NoteValue[];
  lang: Lang;
  /** One staff space in pixels; everything else is measured in these. */
  space?: number;
  /** Overrides the generated description when the picture means something more. */
  label?: string;
  /** Note indices a barline is drawn after, for showing how far a sign reaches. */
  barlines?: number[];
  /** Explicit/courtesy signs are independent of the sounding pitch. */
  accidentalVisibility?: boolean[];
  /** Adjacent equal written pitches connected without a new attack. */
  ties?: number[];
  range?: readonly [number, number];
}) {
  const titleId = useId();
  if (!Number.isFinite(space) || space < 4 || space > 64)
    throw new RangeError('Staff space must be 4–64 pixels');
  const plan: StaffLayout = layout(
    pitches,
    clef,
    values,
    accidentalVisibility,
    range,
  );
  const names = plan.notes.map((n) => pitchLabel(n.pitch, lang)).join(', ');
  for (const index of ties) {
    const from = pitches[index];
    const to = pitches[index + 1];
    if (
      !Number.isInteger(index) ||
      !from ||
      !to ||
      from.letter !== to.letter ||
      from.octave !== to.octave ||
      from.accidental !== to.accidental
    )
      throw new RangeError('A tie must join adjacent equal written pitches');
  }
  const lineY = (line: number) => stepY(line * 2, plan.top);
  return (
    <svg
      className="staff"
      viewBox={`0 0 ${plan.width * space} ${plan.height * space}`}
      width={plan.width * space}
      height={plan.height * space}
      aria-labelledby={titleId}
    >
      <title id={titleId}>{label ?? names}</title>
      {[0, 1, 2, 3, 4].map((line) => (
        <line
          key={line}
          x1={0.4 * space}
          x2={(plan.width - 0.4) * space}
          y1={lineY(line) * space}
          y2={lineY(line) * space}
          stroke="currentColor"
          strokeWidth={Math.max(1, space * 0.09)}
        />
      ))}
      <Glyph
        name={clefGlyph[clef]}
        x={1}
        y={stepY(clefStep[clef], plan.top)}
        space={space}
      />
      {[...new Set(barlines)].map((index) => {
        const note = plan.notes[index];
        const next = plan.notes[index + 1];
        if (!note) return null;
        const x = next ? (note.x + next.x) / 2 : plan.width - 0.5;
        return (
          <line
            data-barline={index}
            key={`bar-${index}`}
            x1={x * space}
            x2={x * space}
            y1={stepY(8, plan.top) * space}
            y2={stepY(0, plan.top) * space}
            stroke="currentColor"
            strokeWidth={Math.max(1, space * 0.1)}
          />
        );
      })}
      {[...new Set(ties)].map((index) => {
        const from = plan.notes[index];
        const to = plan.notes[index + 1];
        const x1 = (from.x + 0.5) * space;
        const x2 = (to.x - 0.5) * space;
        const y = (stepY(from.step, plan.top) + 0.8) * space;
        return (
          <path
            key={`tie-${index}`}
            data-tie={index}
            d={`M ${x1} ${y} Q ${(x1 + x2) / 2} ${y + 1.1 * space} ${x2} ${y}`}
            fill="none"
            stroke="currentColor"
            strokeWidth={Math.max(1, space * 0.12)}
          />
        );
      })}
      {plan.notes.map((note, i) => (
        <g key={i}>
          {note.ledger.map((step) => (
            <line
              key={step}
              x1={(note.x - 0.9) * space}
              x2={(note.x + 0.9) * space}
              y1={stepY(step, plan.top) * space}
              y2={stepY(step, plan.top) * space}
              stroke="currentColor"
              strokeWidth={Math.max(1, space * 0.09)}
            />
          ))}
          {note.accidental && note.accidentalX !== null && (
            <Glyph
              name={note.accidental}
              x={note.accidentalX}
              y={stepY(note.step, plan.top)}
              space={space}
            />
          )}
          {note.stem && (
            <line
              x1={(note.x + (note.stem === 'up' ? 0.58 : -0.58)) * space}
              x2={(note.x + (note.stem === 'up' ? 0.58 : -0.58)) * space}
              y1={stepY(note.step, plan.top) * space}
              y2={
                stepY(note.step + (note.stem === 'up' ? 7 : -7), plan.top) *
                space
              }
              stroke="currentColor"
              strokeWidth={Math.max(1, space * 0.1)}
            />
          )}
          <Glyph
            name={note.head}
            x={note.x - 0.6}
            y={stepY(note.step, plan.top)}
            space={space}
          />
        </g>
      ))}
    </svg>
  );
}
