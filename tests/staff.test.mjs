import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  clefAnchor,
  diatonic,
  layout,
  ledgerSteps,
  staffStep,
  stemDirection,
  stepY,
} from '../lib/staff.ts';
import { glyphs, GLYPH_UNITS_PER_SPACE } from '../lib/glyphs.ts';
import { keyboardPitch, spellPattern } from '../lib/notation.ts';

const at = (letter, octave, accidental = 0) => ({
  letter,
  accidental,
  octave,
  midi: (octave + 1) * 12 + [0, 2, 4, 5, 7, 9, 11][letter] + accidental,
});

test('Each clef puts the pitch it names on the line it names', () => {
  // The whole placement rests on this, so it is checked against a hand-written
  // table rather than against the formula that produced it.
  const expected = [
    ['treble', at(4, 4), 2], // g′ on the second line
    ['bass', at(3, 3), 4], // f on the fourth
    ['alto', at(0, 4), 3], // c′ on the third
    ['tenor', at(0, 4), 4], // c′ on the fourth
  ];
  for (const row of expected) {
    const clef = /** @type {string} */ (row[0]);
    const pitch = row[1];
    const line = row[2];
    assert.equal(
      staffStep(pitch, clef),
      (line - 1) * 2,
      `${String(clef)} misplaces the pitch it is named for`,
    );
    const anchor = clefAnchor[clef];
    assert.equal(diatonic(anchor), diatonic(pitch));
    assert.equal(anchor.line, line);
  }
});

test('Known landmarks land where a reader expects them', () => {
  // Middle C is one ledger line below the treble staff and one above the bass.
  assert.equal(staffStep(at(0, 4), 'treble'), -2);
  assert.equal(staffStep(at(0, 4), 'bass'), 10);
  assert.deepEqual(ledgerSteps(-2), [-2]);
  assert.deepEqual(ledgerSteps(10), [10]);
  // The five treble lines from the bottom are e′ g′ h′/b′ d″ f″.
  const lines = [at(2, 4), at(4, 4), at(6, 4), at(1, 5), at(3, 5)];
  assert.deepEqual(
    lines.map((p) => staffStep(p, 'treble')),
    [0, 2, 4, 6, 8],
  );
  // The four bass lines above its bottom G are h/b, d, f, a.
  const bass = [at(4, 2), at(6, 2), at(1, 3), at(3, 3), at(5, 3)];
  assert.deepEqual(
    bass.map((p) => staffStep(p, 'bass')),
    [0, 2, 4, 6, 8],
  );
});

test('A note inside the staff needs no ledger line, and outside it needs one per step', () => {
  for (let step = 0; step <= 8; step += 1)
    assert.deepEqual(ledgerSteps(step), [], `step ${step} drew a ledger line`);
  // The space directly above the top line still belongs to the staff.
  assert.deepEqual(ledgerSteps(9), []);
  assert.deepEqual(ledgerSteps(-1), []);
  assert.deepEqual(ledgerSteps(12), [10, 12]);
  assert.deepEqual(ledgerSteps(-4), [-2, -4]);
  // Ledger lines only ever fall on even steps: they continue the staff's own
  // alternation of line and space.
  for (let step = -12; step <= 20; step += 1)
    for (const line of ledgerSteps(step))
      assert.equal(Math.abs(line % 2), 0, `ledger line at odd step ${line}`);
});

test('Stems turn down from the middle line upwards', () => {
  for (let step = 0; step < 4; step += 1)
    assert.equal(stemDirection(step), 'up');
  for (let step = 4; step <= 10; step += 1)
    assert.equal(stemDirection(step), 'down', `step ${step}`);
});

test('Every pitch the model can spell can also be placed and drawn', () => {
  // The generator's own range, walked through the layout: nothing may land
  // outside the drawing it reports, and every glyph it names must exist.
  for (let midi = 24; midi <= 96; midi += 1)
    for (const clef of ['treble', 'bass', 'alto', 'tenor']) {
      const pitch = keyboardPitch(midi);
      const plan = layout([pitch], clef);
      const note = plan.notes[0];
      assert.ok(glyphs[note.head], `missing head glyph ${note.head}`);
      if (note.accidental)
        assert.ok(glyphs[note.accidental], `missing ${note.accidental}`);
      const y = stepY(note.step, plan.top);
      assert.ok(
        y >= 0 && y <= plan.height,
        `${clef} midi ${midi}: head at ${y} outside a drawing ${plan.height} tall`,
      );
      const stemEnd = stepY(
        note.step + (note.stem === 'up' ? 7 : -7),
        plan.top,
      );
      assert.ok(
        stemEnd >= 0 && stemEnd <= plan.height,
        `${clef} midi ${midi}: stem ends at ${stemEnd} outside the drawing`,
      );
    }
});

test('Accidentals sit left of their own head and never overlap the next note', () => {
  const pitches = spellPattern('C', {
    steps: [0, 1, 3, 6, 8],
    degrees: [0, 1, 2, 3, 4],
  });
  const plan = layout(pitches, 'treble');
  for (const [i, note] of plan.notes.entries()) {
    if (note.accidentalX === null) continue;
    assert.ok(
      note.accidentalX < note.x,
      `accidental ${i} is not left of its head`,
    );
    const previous = plan.notes[i - 1];
    if (previous)
      assert.ok(
        note.accidentalX > previous.x,
        `accidental ${i} collides with the previous head`,
      );
  }
});

test('The glyph set is complete, self-contained and in font units', () => {
  const needed = [
    'gClef',
    'fClef',
    'cClef',
    'noteheadWhole',
    'noteheadHalf',
    'noteheadBlack',
    'accidentalDoubleFlat',
    'accidentalFlat',
    'accidentalNatural',
    'accidentalSharp',
    'accidentalDoubleSharp',
  ];
  for (const name of needed) {
    assert.ok(glyphs[name], `glyph ${name} is missing`);
    assert.match(glyphs[name], /^M/, `${name} is not a path`);
    // Nothing may reference a font, an image or a network location: the whole
    // point of committing outlines is that the export fetches nothing.
    assert.doesNotMatch(
      glyphs[name],
      /url\(|http|font/i,
      `${name} is not self-contained`,
    );
  }
  assert.equal(GLYPH_UNITS_PER_SPACE, 250);
  const bytes = needed.reduce((n, name) => n + glyphs[name].length, 0);
  assert.ok(bytes < 12000, `glyph data grew to ${bytes} bytes`);
});

test('A run of notes is laid out left to right without overlap', () => {
  const pitches = [at(0, 4), at(2, 4), at(4, 4), at(6, 4)];
  const plan = layout(pitches, 'treble', [
    'quarter',
    'half',
    'whole',
    'quarter',
  ]);
  const xs = plan.notes.map((n) => n.x);
  for (let i = 1; i < xs.length; i += 1)
    assert.ok(xs[i] > xs[i - 1], 'notes are not in order');
  assert.ok(plan.width > xs.at(-1), 'the last note falls outside the drawing');
  // A whole note has no stem; the others do.
  assert.equal(plan.notes[2].stem, null);
  assert.equal(plan.notes[2].head, 'noteheadWhole');
  assert.equal(plan.notes[1].head, 'noteheadHalf');
  assert.equal(plan.notes[0].head, 'noteheadBlack');
});
