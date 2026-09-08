import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * The stylesheet spent a long time as two hundred hand-tuned greens written
 * straight into rules, which is why it had no theme, no focus token and no
 * notation ink of its own. These tests keep the palette in one place. They are
 * about where a colour is written, not which colour it is: docs/design-system.md
 * holds the reasoning for the values themselves.
 */
const source = readFileSync(
  fileURLToPath(new URL('../app/globals.css', import.meta.url)),
  'utf8',
);
// A comment can mention a colour or a selector; only declarations are policed.
const css = source.replace(/\/\*[\s\S]*?\*\//g, (block) =>
  block.replace(/[^\n]/g, ' '),
);
const lines = css.split('\n');

/** The blocks that declare the palette, and so are allowed to hold literals. */
function paletteRegions() {
  const regions = [];
  let depth = 0;
  let start = -1;
  for (const [index, line] of lines.entries()) {
    if (depth === 0 && /^\s*(:root\b|@theme\b)/.test(line)) start = index;
    depth += (line.match(/\{/g) ?? []).length;
    depth -= (line.match(/\}/g) ?? []).length;
    if (start >= 0 && depth === 0) {
      regions.push([start, index]);
      start = -1;
    }
  }
  return regions;
}

const palette = paletteRegions();
const inPalette = (index) => palette.some(([a, b]) => index >= a && index <= b);

/** Every declaration outside the palette, as {line, property, value}. */
function declarations() {
  const found = [];
  for (const [index, line] of lines.entries()) {
    if (inPalette(index)) continue;
    const match = line.match(/^\s*([-a-z]+)\s*:\s*([^;]+);/);
    if (match)
      found.push({ line: index + 1, property: match[1], value: match[2] });
  }
  return found;
}

test('The palette is declared in one place and every rule reads it from there', () => {
  assert.ok(palette.length >= 2, 'the token blocks were not found');
  const literal = /#[0-9a-fA-F]{3,8}\b|\bwhite\b|\bblack\b/;
  const offenders = declarations()
    .filter((d) => literal.test(d.value))
    .map((d) => `${d.line}: ${d.property}: ${d.value.trim()}`);
  assert.deepEqual(
    offenders,
    [],
    'a colour is written into a rule instead of read from a token',
  );
});

test('The legacy names are aliases for @theme inline, not a second palette', () => {
  const aliases = [
    '--background',
    '--foreground',
    '--card',
    '--primary',
    '--muted',
    '--muted-foreground',
    '--accent',
    '--border',
    '--radius',
    '--font-geist-sans',
    '--font-geist-mono',
  ];
  // They exist because roughly six hundred utilities across components/ui
  // resolve through them. An authored rule reads the token itself.
  const theme = css.slice(css.indexOf('@theme inline {'));
  const outside = css.replace(theme.slice(0, theme.indexOf('\n}') + 2), '');
  const strays = aliases.filter((name) =>
    new RegExp(`var\\(${name}\\)`).test(outside),
  );
  assert.deepEqual(strays, [], 'an authored rule reads a legacy alias');
});

test('Every token a rule reads is a token the palette declares', () => {
  const declared = new Set(
    [...css.matchAll(/^\s*(--[\w-]+)\s*:/gm)].map((m) => m[1]),
  );
  assert.ok(declared.has('--c-ink'), 'the chrome tokens were not found');
  assert.ok(declared.has('--s-paper'), 'the score tokens were not found');
  const used = new Set(
    [...css.matchAll(/var\(\s*(--[\w-]+)/g)].map((m) => m[1]),
  );
  const missing = [...used].filter(
    (name) => !declared.has(name) && !name.startsWith('--sidebar-'),
  );
  assert.deepEqual(missing, [], 'a rule reads a token nothing declares');
});

test('Notation keeps its own ink and paper in the dark theme', () => {
  const dark = source.slice(source.indexOf(":root[data-theme='dark']"));
  const block = dark.slice(0, dark.indexOf('}'));
  assert.ok(block.includes('--c-ground'), 'the dark block was not found');
  const flipped = [...block.matchAll(/^\s*(--s-[\w-]+)\s*:/gm)].map(
    (m) => m[1],
  );
  assert.deepEqual(
    flipped,
    [],
    'the dark theme redefines a score token, so notation would not be black ink on white paper',
  );
});

test('One unqualified focus ring, and it is the token one', () => {
  const rings = lines.filter((line) => /^:focus-visible\b/.test(line.trim()));
  assert.equal(
    rings.length,
    1,
    'a second unqualified :focus-visible rule silently wins the outline',
  );
  const start = lines.findIndex((line) =>
    /^:focus-visible\b/.test(line.trim()),
  );
  const rule = lines.slice(start, start + 6).join('\n');
  assert.match(rule, /outline:\s*var\(--bw-2\)\s+solid\s+var\(--focus\)/);
});

test('Only the reduced-motion switch overrides the cascade with !important', () => {
  const flagged = lines
    .map((line, index) => ({ line: index + 1, text: line }))
    .filter((entry) => entry.text.includes('!important'));
  // The kill switch is a deliberate last-wins override, not specificity debt.
  const reduced = source.indexOf('@media (prefers-reduced-motion: reduce)');
  assert.ok(reduced > 0, 'the reduced-motion block was not found');
  const firstLine = source.slice(0, reduced).split('\n').length;
  const strays = flagged
    .filter((entry) => entry.line < firstLine || entry.line > firstLine + 10)
    .map((entry) => `${entry.line}: ${entry.text.trim()}`);
  assert.deepEqual(strays, [], 'raise specificity instead of using !important');
});
