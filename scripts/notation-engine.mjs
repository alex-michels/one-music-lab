import createVerovioModule from 'verovio/wasm';
import { VerovioToolkit } from 'verovio/esm';
import { readFile, writeFile } from 'node:fs/promises';

// Build-time only. The browser imports committed outlines, never this module.
const verovioModule = createVerovioModule();
export async function engrave(data, inputFrom = 'mei', options = {}) {
  if (!['mei', 'xml'].includes(inputFrom))
    throw new RangeError('Use MEI or MusicXML');
  if (
    typeof data !== 'string' ||
    !data.trim() ||
    data.length > 1_000_000 ||
    /<!DOCTYPE|<!ENTITY/i.test(data)
  )
    throw new RangeError('Expected a bounded, standalone XML score');
  const toolkit = new VerovioToolkit(await verovioModule);
  try {
    toolkit.setOptions({
      font: 'Leipzig',
      xmlIdSeed: 553,
      svgViewBox: true,
      scale: 40,
      ...options,
      inputFrom,
    });
    if (!toolkit.loadData(data)) throw new Error('Verovio rejected the score');
    const pages = Array.from({ length: toolkit.getPageCount() }, (_, i) =>
      toolkit.renderToSVG(i + 1),
    );
    if (!pages.length) throw new Error('Score contains no engravable music');
    return { version: toolkit.getVersion(), mei: toolkit.getMEI(), pages };
  } finally {
    toolkit.destroy();
  }
}

export const glyphNames = {
  E050: 'gClef',
  E062: 'fClef',
  E05C: 'cClef',
  E0A4: 'noteheadBlack',
  E0A3: 'noteheadHalf',
  E0A2: 'noteheadWhole',
  E260: 'accidentalFlat',
  E261: 'accidentalNatural',
  E262: 'accidentalSharp',
  E263: 'accidentalDoubleSharp',
  E264: 'accidentalDoubleFlat',
};

export function extractGlyphs(svg, names = glyphNames) {
  const found = new Map();
  for (const [, code, body] of svg.matchAll(
    /<g id="([0-9A-F]{4})-[^"]*">([\s\S]*?)<\/g>/g,
  )) {
    if (!names[code]) continue;
    const paths = [...body.matchAll(/<path[^>]*\sd="([^"]+)"/g)].map(
      (match) => match[1],
    );
    if (paths.length) found.set(code, paths.join(' '));
  }
  return Object.fromEntries(
    Object.entries(names).map(([code, name]) => {
      const path = found.get(code);
      if (!path || !/^[Mm][\s\d.,eE+\-MmLlHhVvCcSsQqTtAaZz]+$/.test(path))
        throw new Error(`Missing or invalid outline: ${code} (${name})`);
      return [name, path];
    }),
  );
}

export async function runGlyphs(
  args,
  target = new URL('../lib/glyphs.json', import.meta.url),
) {
  if (args.length !== 1 || !['--check', '--write'].includes(args[0]))
    throw new Error('Usage: node scripts/extract-glyphs.mjs --check|--write');
  const score = await readFile(
    new URL('../tests/fixtures/notation/glyphs.mei', import.meta.url),
    'utf8',
  );
  const { pages } = await engrave(score, 'mei', { adjustPageHeight: true });
  const data = extractGlyphs(pages.join('\n'));
  if (args[0] === '--write')
    await writeFile(target, JSON.stringify(data, null, 2) + '\n');
  else if (
    JSON.stringify(JSON.parse(await readFile(target, 'utf8'))) !==
    JSON.stringify(data)
  )
    throw new Error(
      'Glyph outlines have drifted; run npm run glyphs:generate and review',
    );
  return data;
}
