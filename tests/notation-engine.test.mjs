import { test, expect, vi } from 'vitest';
import { VerovioToolkit } from 'verovio/esm';
import { readFile, writeFile, mkdtemp, rm, mkdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { JSDOM } from 'jsdom';
import {
  engrave,
  extractGlyphs,
  runGlyphs,
} from '../scripts/notation-engine.mjs';
import { glyphs } from '../lib/glyphs.ts';

const fixture = (name) =>
  readFile(new URL(`./fixtures/notation/${name}`, import.meta.url), 'utf8');
const xml = (text) =>
  new JSDOM(text, { contentType: 'text/xml' }).window.document;
function music(text) {
  const doc = xml(text);
  return [...doc.querySelectorAll('note, rest')].map((note) => [
    note.localName,
    note.getAttribute('pname'),
    note.getAttribute('oct'),
    note.getAttribute('dur'),
    note.getAttribute('accid') ||
      note.querySelector('accid')?.getAttribute('accid') ||
      '',
  ]);
}

test('Pinned Verovio regenerates exactly the shipped outlines; CLI check is non-mutating', async () => {
  const result = await engrave(await fixture('glyphs.mei'));
  expect(result.version).toMatch(/^6\.3\.0/);
  expect(extractGlyphs(result.pages.join(''))).toEqual(glyphs);
  const before = await readFile(
    new URL('../lib/glyphs.json', import.meta.url),
    'utf8',
  );
  const argv = process.argv;
  try {
    process.argv = ['node', 'scripts/extract-glyphs.mjs', '--check'];
    await import('../scripts/extract-glyphs.mjs');
  } finally {
    process.argv = argv;
  }
  expect(
    await readFile(new URL('../lib/glyphs.json', import.meta.url), 'utf8'),
  ).toBe(before);
});

test('Glyph regeneration writes the artifact, detects drift and refuses incomplete outlines', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'oml-glyphs-'));
  try {
    const target = join(dir, 'glyphs.json');
    await runGlyphs(['--write'], target);
    expect(await runGlyphs(['--check'], target)).toEqual(glyphs);
    await writeFile(target, '{}');
    await expect(runGlyphs(['--check'], target)).rejects.toThrow('drifted');
  } finally {
    await rm(dir, { recursive: true });
  }
  for (const args of [[], ['--invalid'], ['--check', '--write']])
    await expect(runGlyphs(args)).rejects.toThrow('Usage');
  for (const svg of [
    '',
    '<g id="E050-x"></g>',
    '<g id="E050-x"><path d="url(x)"/></g>',
  ])
    expect(() => extractGlyphs(svg)).toThrow('outline');
});

test('MEI round-trip preserves supported pitches, durations and signs', async () => {
  const first = await engrave(await fixture('glyphs.mei'));
  const again = await engrave(first.mei);
  expect(music(first.mei)).toEqual([
    ['note', 'c', '4', '4', 's'],
    ['note', 'd', '4', '2', 'f'],
    ['note', 'e', '4', '4', 'n'],
    ['note', 'g', '3', '4', 'x'],
    ['note', 'a', '3', '4', 'ff'],
    ['note', 'b', '3', '2', ''],
    ['note', 'c', '4', '1', ''],
  ]);
  expect(music(again.mei)).toEqual(music(first.mei));
});

test('MusicXML converts spelled pitches and rests into MEI, without claiming lossless XML export', async () => {
  const result = await engrave(await fixture('spelling.musicxml'), 'xml');
  expect(music(result.mei)).toEqual([
    ['note', 'c', '4', '4', 's'],
    ['note', 'e', '4', '4', 'f'],
    ['note', 'b', '3', '4', 'ff'],
    ['rest', null, null, '4', ''],
  ]);
  expect(music((await engrave(result.mei)).mei)).toEqual(music(result.mei));
});

test('All four quarter-tone signs are distinct SVG outlines and survive MEI export', async () => {
  const result = await engrave(await fixture('quarter-tones.mei'));
  const paths = extractGlyphs(result.pages.join(''), {
    E280: 'half-flat',
    E281: 'half-sharp',
    E282: 'three-half-flat',
    E283: 'three-half-sharp',
  });
  expect(new Set(Object.values(paths)).size).toBe(4);
  expect(music(result.mei).map((row) => row[4])).toEqual([
    '1qf',
    '1qs',
    '3qf',
    '3qs',
  ]);
  expect(music((await engrave(result.mei)).mei)).toEqual(music(result.mei));
});

test('Long examples paginate, retain every note and need no external font', async () => {
  const result = await engrave(await fixture('layout.mei'), 'mei', {
    pageWidth: 1100,
    pageHeight: 1000,
  });
  expect(result.pages.length).toBeGreaterThan(1);
  let notes = 0;
  for (const page of result.pages) {
    const doc = xml(page);
    notes += doc.querySelectorAll('g.note').length;
    expect(doc.querySelectorAll('g.system').length).toBeGreaterThan(0);
    for (const node of doc.querySelectorAll('use')) {
      const ref = node.getAttribute('xlink:href');
      expect(ref.startsWith('#')).toBe(true);
      expect(doc.getElementById(ref.slice(1))).not.toBeNull();
    }
    expect(page).not.toMatch(
      /<script|<foreignObject|@font-face|https?:\/\/[^"\s]+\.(woff|ttf)/i,
    );
  }
  expect(notes).toBe(96);
  await mkdir('outputs/notation-553', { recursive: true });
  for (let i = 0; i < result.pages.length; i++)
    await writeFile(
      `outputs/notation-553/layout-${i + 1}.svg`,
      result.pages[i],
    );
});

test('Invalid or oversized input is refused, and a later valid score still renders', async () => {
  for (const bad of [
    null,
    '',
    ' ',
    'x'.repeat(1_000_001),
    '<!DOCTYPE mei>',
    '<!ENTITY x "y">',
  ])
    await expect(engrave(bad)).rejects.toThrow('bounded');
  await expect(engrave('<mei/>', 'mxl')).rejects.toThrow('MEI or MusicXML');
  await expect(engrave('<not-a-score/>')).rejects.toThrow('rejected');
  await expect(engrave('<mei><music><body/></music></mei>')).rejects.toThrow();
  expect(
    (await engrave(await fixture('glyphs.mei'))).pages.length,
  ).toBeGreaterThan(0);
});

test('Unsupported MEI containers are demonstrably lost; exports must not replace originals', async () => {
  const score = (await fixture('glyphs.mei')).replace(
    '<section>',
    '<section><ossia xml:id="unsupported-553"><note pname="f" oct="5" dur="4"/></ossia>',
  );
  const result = await engrave(score);
  expect(result.mei).not.toContain('unsupported-553');
  expect(music(result.mei)).toHaveLength(7);
});

test('A failed engraving producing no pages is refused, not emitted as a successful artifact', async () => {
  const pageCount = vi
    .spyOn(VerovioToolkit.prototype, 'getPageCount')
    .mockReturnValue(0);
  try {
    await expect(engrave(await fixture('glyphs.mei'))).rejects.toThrow(
      'no engravable music',
    );
  } finally {
    pageCount.mockRestore();
  }
});
