import { afterEach, expect, test, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { Staff } from '../../components/staff.tsx';
import { layout, stepY } from '../../lib/staff.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
const SPACE = 12;

function draw(props) {
  if (!container) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  return act(() =>
    root.render(createElement(Staff, { lang: 'en', space: SPACE, ...props })),
  );
}
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = null;
  container?.remove();
  container = null;
  vi.restoreAllMocks();
});

const at = (letter, octave, accidental = 0) => ({
  letter,
  accidental,
  octave,
  midi: (octave + 1) * 12 + [0, 2, 4, 5, 7, 9, 11][letter] + accidental,
});
const svg = () => container.querySelector('svg.staff');
const heads = () => [...container.querySelectorAll('path')];
// getBBox() reports a path in its own untransformed units, which for a glyph
// means font units. What has to be checked is what the reader sees, so every
// measurement below is taken from the rendered box relative to the drawing.
const box = (el) => {
  const r = el.getBoundingClientRect();
  const o = svg().getBoundingClientRect();
  return { x: r.x - o.x, y: r.y - o.y, width: r.width, height: r.height };
};

test('The drawing is a labelled picture of the pitches it shows', async () => {
  await draw({ pitches: [at(0, 4), at(4, 4)], clef: 'treble' });
  const el = svg();
  // The name comes from a <title> the svg points at, which is what readers
  // announce for an inline graphic.
  const titled = container.querySelector('svg.staff title');
  expect(titled.textContent).toBe('C4, G4');
  expect(el.getAttribute('aria-labelledby')).toBe(titled.id);
  // A reader who cannot see the staff still gets the list of pitches, named in
  // their own language. This is the reason the staff is drawn here at all.
  expect(
    container.querySelectorAll('svg.staff line').length,
  ).toBeGreaterThanOrEqual(5);
});

test('Glyphs are drawn at the scale the staff expects', async () => {
  await draw({ pitches: [at(0, 4)], clef: 'treble' });
  const paths = heads();
  // The clef comes first, then the note head. Measuring the rendered geometry
  // is the only way to catch a wrong scale factor or a missing y flip: the unit
  // tests can place a note correctly and still draw it the wrong size.
  const clefBox = box(paths[0]);
  const headBox = box(paths.at(-1));

  // SMuFL draws a black notehead about 1.18 staff spaces wide and one space
  // tall, and a treble clef spanning roughly seven spaces.
  expect(headBox.width / SPACE).toBeGreaterThan(1);
  expect(headBox.width / SPACE).toBeLessThan(1.5);
  expect(headBox.height / SPACE).toBeGreaterThan(0.8);
  expect(headBox.height / SPACE).toBeLessThan(1.3);
  expect(clefBox.height / SPACE).toBeGreaterThan(6);
  expect(clefBox.height / SPACE).toBeLessThan(8.5);

  // A flipped glyph would sit above the drawing instead of inside it.
  expect(headBox.y).toBeGreaterThanOrEqual(-1);
  expect(clefBox.y).toBeGreaterThanOrEqual(-1);
});

test('A note head sits at the height the geometry computed for it', async () => {
  for (const [pitch, clef] of [
    [at(4, 4), 'treble'], // g′ on the second line
    [at(3, 3), 'bass'], // f on the fourth line
    [at(0, 4), 'alto'], // c′ on the middle line
  ]) {
    await draw({ pitches: [pitch], clef });
    const plan = layout([pitch], clef);
    const expected = stepY(plan.notes[0].step, plan.top) * SPACE;
    const b = box(heads().at(-1));
    const centre = b.y + b.height / 2;
    expect(Math.abs(centre - expected)).toBeLessThan(SPACE * 0.35);
    if (root) await act(() => root.unmount());
    root = null;
    container?.remove();
    container = null;
  }
});

test('Middle C gets its ledger line in treble and in bass, and none inside the staff', async () => {
  await draw({ pitches: [at(0, 4)], clef: 'treble' });
  // Five staff lines plus one ledger line, plus the stem.
  const before = container.querySelectorAll('svg.staff line').length;
  expect(before).toBe(7);

  await draw({ pitches: [at(6, 4)], clef: 'treble' }); // b′, inside the staff
  expect(container.querySelectorAll('svg.staff line').length).toBe(6);
});

test('An accidental is drawn to the left of its own head', async () => {
  await draw({ pitches: [at(0, 4, 1)], clef: 'treble' });
  const paths = heads();
  const accidental = box(paths[1]);
  const head = box(paths[2]);
  expect(accidental.x + accidental.width).toBeLessThanOrEqual(head.x + 1);
  expect(container.querySelector('svg.staff title').textContent).toBe('C♯4');
});

test('Every clef renders, and German names the pitches its own way', async () => {
  for (const clef of ['treble', 'bass', 'alto', 'tenor']) {
    await draw({ pitches: [at(0, 4)], clef, lang: 'de' });
    expect(heads().length).toBeGreaterThanOrEqual(2);
    expect(container.querySelector('svg.staff title').textContent).toBe('c′');
    if (root) await act(() => root.unmount());
    root = null;
    container?.remove();
    container = null;
  }
});
