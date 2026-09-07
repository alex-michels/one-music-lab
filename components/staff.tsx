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
 * The reason for drawing it here rather than handing the job to a library is
 * accessibility. A staff is a picture of a list of pitches, and a reader who
 * cannot see it still needs that list: this one carries the names in the
 * reader's own language, which no notation library produces because none of
 * them knows the language the site is being read in.
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
}: {
  pitches: SpelledPitch[];
  clef?: Clef;
  values?: NoteValue[];
  lang: Lang;
  /** One staff space in pixels; everything else is measured in these. */
  space?: number;
  /** Overrides the generated description when the picture means something more. */
  label?: string;
}) {
  const titleId = useId();
  const plan: StaffLayout = layout(pitches, clef, values);
  const names = plan.notes.map((n) => pitchLabel(n.pitch, lang)).join(', ');
  const lineY = (line: number) => stepY(line * 2, plan.top);
  return (
    <svg
      className="staff"
      viewBox={`0 0 ${plan.width * space} ${plan.height * space}`}
      width={plan.width * space}
      height={plan.height * space}
      // A titled, labelled graphic rather than role="img": an inline SVG
      // cannot become an <img> without losing currentColor theming, and a
      // <title> the label points at is what readers actually announce.
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
