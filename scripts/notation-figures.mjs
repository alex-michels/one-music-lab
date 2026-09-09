import { engrave } from './notation-engine.mjs';
import { readFile, writeFile } from 'node:fs/promises';

/** Original, deliberately small teaching scores. No source-book artwork. */
export const figures = {};
const note = (dur, extra = '') =>
  `<note pname="g" oct="4" dur="${dur}" ${extra}/>`;
for (const dur of [1, 2, 4, 8, 16, 32, 64, 128]) {
  figures[`note-${dur}`] = note(dur);
  figures[`rest-${dur}`] = `<rest dur="${dur}"/>`;
}
figures['whole-bar-3'] = '<mRest/>';
figures['whole-bar-6'] = '<mRest/>';
figures.dotted = note(4, 'dots="1"') + note(8);
figures['double-dotted'] = note(4, 'dots="2"') + note(16);
figures.beamed = `<beam>${note(8)}${note(8)}</beam>`;
figures.flagged = note(8) + note(8);
figures.triplet = `<tuplet num="3" numbase="2">${note(8).repeat(3)}</tuplet>`;
figures.duplet = `<tuplet num="2" numbase="3">${note(8).repeat(2)}</tuplet>`;
figures.tied = note(4, 'tie="i"') + note(4, 'tie="t"');
figures.detached = note(4, 'artic="stacc"').repeat(4);
figures.tenuto = note(4, 'artic="ten"').repeat(4);
figures.trill = note(4, 'xml:id="n1"');
figures.mordent = note(4, 'xml:id="n1"');
figures.turn = note(4, 'xml:id="n1"');
figures.grace = note(8, 'grace="unacc" stem.mod="1slash"') + note(4);
figures.tremolo = `<bTrem>${note(2, 'stem.mod="2slash"')}</bTrem>`;
figures['multi-rest'] = '<multiRest num="4"/>';

// A separate series follows the lab's sounding pitches exactly. Quarter units
// in notation-experiments.ts are checked against these scores by tests.
const c = (dur) => `<note pname="c" oct="4" dur="${dur}"/>`;
const melody = (names) =>
  [...names]
    .map((pname) => `<note pname="${pname}" oct="4" dur="4"/>`)
    .join('');
figures['example-soft'] = c(2);
figures['example-strong'] = c(2);
figures['example-successive'] = melody('cg');
figures['example-together'] =
  `<chord dur="4">${c(4)}<note pname="g" oct="4" dur="4"/></chord>`;
figures['example-pulse'] = c(4).repeat(4);
figures['example-whole'] = c(1);
figures['example-halves'] = c(2).repeat(2);
figures['example-quarters'] = c(4).repeat(4);
figures['example-untied'] = melody('dd');
figures['example-tied'] =
  '<note pname="d" oct="4" dur="4" tie="i"/><note pname="d" oct="4" dur="4" tie="t"/>';
figures['example-eighths'] = `<beam>${c(8).repeat(2)}</beam>`.repeat(4);
figures['example-triplets'] =
  `<tuplet num="3" numbase="2"><beam>${c(8).repeat(3)}</beam></tuplet>`.repeat(
    4,
  );
figures['example-sustained'] = melody('cdef');
figures['example-detached'] = melody('cdef').replaceAll(
  'dur="4"',
  'dur="4" artic="stacc"',
);
figures['example-figure'] = melody('cdeg');
figures['example-repeated'] = melody('cdegcdeg');
figures['example-ending'] = melody('cdegcdec');

const layouts = {};
const staff = (notes, n = 1) =>
  `<staff n="${n}"><layer n="1">${notes}</layer></staff>`;
const measure = (notes, number, marks = '', attributes = '') =>
  `<measure metcon="false" n="${number}" ${attributes}>${staff(notes)}${marks}</measure>`;
const pitched = (name, octave, dur, extra = '') =>
  `<note pname="${name}" oct="${octave}" dur="${dur}" ${extra}/>`;
const direction = (text, time = 1) =>
  `<dir staff="1" tstamp="${time}" place="above">${text}</dir>`;
function register(id, content, layout = {}) {
  figures[id] = content;
  layouts[id] = layout;
}
const treble = 'clef.shape="G" clef.line="2"';
const bass = 'clef.shape="F" clef.line="4"';
const group = (organ) =>
  `<staffGrp symbol="brace" bar.thru="true"><staffDef n="1" lines="5" ${treble}/><staffDef n="2" lines="5" ${bass}/>${organ ? `<staffDef n="3" lines="5" ${bass}/>` : ''}</staffGrp>`;
for (const [id, organ] of [
  ['grand-staff', false],
  ['organ-staves', true],
]) {
  register(
    id,
    `<measure n="1">${staff(c(1))}${staff(pitched('c', 3, 1), 2)}${organ ? staff(pitched('c', 2, 1), 3) : ''}</measure>`,
    { section: true, group: group(organ), meterVisible: true },
  );
}
register(
  'stem-directions',
  pitched('g', 4, 4, 'stem.dir="up"') + pitched('d', 5, 4, 'stem.dir="down"'),
);
register(
  'signature-bass',
  pitched('b', 2, 2, 'accid.ges="f"') + pitched('e', 3, 2, 'accid.ges="f"'),
  { clef: bass, signature: '2f', meterVisible: true },
);
register(
  'accidental-tie-scope',
  measure(pitched('f', 4, 2, 'accid="n" tie="i"'), 1) +
    measure(
      pitched('f', 4, 4, 'accid.ges="n" tie="t"') +
        pitched('f', 4, 4, 'accid.ges="s"'),
      2,
    ),
  { section: true, signature: '1s', meter: [2, 4], meterVisible: true },
);
register(
  'accidental-octave-scope',
  pitched('f', 4, 4, 'accid="n"') +
    pitched('f', 5, 4, 'accid.ges="s"') +
    pitched('f', 4, 2, 'accid.ges="n"'),
  { signature: '1s', meterVisible: true },
);
register(
  'accidental-replacement',
  pitched('f', 4, 4, 'accid="ss"') +
    pitched('f', 4, 4, 'accid="s"') +
    pitched('f', 4, 2, 'accid.ges="s"'),
  { meterVisible: true },
);
register(
  'accidental-natural',
  pitched('b', 4, 4, 'accid.ges="f"') +
    pitched('b', 4, 4, 'accid="n"') +
    pitched('b', 4, 2, 'accid.ges="n"'),
  { signature: '1f', meterVisible: true },
);
register(
  'accidental-signature-reset',
  measure(pitched('f', 4, 2, 'accid="n"'), 1) +
    measure(pitched('f', 4, 2, 'accid.ges="s"'), 2),
  { section: true, signature: '1s', meter: [2, 4], meterVisible: true },
);
register(
  'beamed-mixed',
  `<beam>${note(8)}${note(16)}${note(16)}</beam><beam>${note(16)}${note(16, 'breaksec="1"')}${note(16)}${note(16)}</beam>`,
  { meter: [2, 4], meterVisible: true },
);
register(
  'beamed-syllables',
  '<note pname="g" oct="4" dur="8"><verse n="1"><syl>la</syl></verse></note>' +
    '<note pname="a" oct="4" dur="8"><verse n="1"><syl>la</syl></verse></note>' +
    '<beam><note pname="g" oct="4" dur="8"><verse n="1"><syl con="u">la</syl></verse></note>' +
    pitched('a', 4, 8) +
    '</beam>',
  { meter: [2, 4], meterVisible: true },
);
register(
  'tuplet-mixed',
  `<tuplet num="3" numbase="2" num.format="ratio">${note(4)}<rest dur="8"/></tuplet>` +
    `<tuplet num="3" numbase="2" num.format="ratio"><beam>${note(16)}${note(16)}${note(8, 'tie="i"')}${note(8, 'tie="t"')}</beam></tuplet>`,
  { meter: [2, 4], meterVisible: true },
);
register(
  'tuplet-13-12',
  `<tuplet num="13" numbase="12" num.format="ratio"><beam>${note(16).repeat(13)}</beam></tuplet>`,
  { meter: [3, 4], meterVisible: true },
);
register(
  'quartole',
  `<tuplet num="4" numbase="3" num.format="ratio"><beam>${note(8).repeat(4)}</beam></tuplet>`,
  { meter: [3, 8], meterVisible: true },
);
register(
  'octole',
  `<tuplet num="8" numbase="6" num.format="ratio"><beam>${note(16).repeat(8)}</beam></tuplet>`,
  { meter: [3, 8], meterVisible: true },
);
register('dotted-rest', '<rest dur="4" dots="1"/>' + note(8), {
  meter: [2, 4],
  meterVisible: true,
});
register(
  'cross-bar-tie',
  measure('<rest dur="2"/>' + note(4, 'tie="i"'), 1) +
    measure(note(4, 'tie="t"') + '<rest dur="2"/>', 2),
  { section: true, meter: [3, 4], meterVisible: true },
);
register('historical-multirests', '<multiRest num="7" block="false"/>', {
  meterVisible: true,
});
register(
  'repeat-volta',
  measure(c(1), 1, '', 'left="rptstart"') +
    `<ending n="1">${measure(pitched('d', 4, 1), 2, '', 'right="rptend"')}</ending>` +
    `<ending n="2">${measure(pitched('e', 4, 1), 3, '', 'right="end"')}</ending>`,
  { section: true, meterVisible: true },
);
register(
  'repeat-implicit',
  measure(c(1), 1) + measure(pitched('d', 4, 1), 2, '', 'right="rptend"'),
  { section: true, meterVisible: true },
);
register(
  'repeat-dc-fine',
  measure(c(1), 1) +
    measure(pitched('d', 4, 1), 2, direction('Fine', 4)) +
    measure(pitched('e', 4, 1), 3, direction('D.C. al Fine', 4), 'right="end"'),
  { section: true, meterVisible: true },
);
register(
  'repeat-ds-coda',
  measure(c(1), 1) +
    measure(
      pitched('d', 4, 1),
      2,
      '<reh staff="1" tstamp="1"><rend glyph.auth="smufl" glyph.name="segno">𝄋</rend></reh>',
    ) +
    measure(pitched('e', 4, 1), 3, direction('To Coda', 4)) +
    measure(
      pitched('f', 4, 1),
      4,
      direction('D.S. al Coda', 4),
      'right="dbl"',
    ) +
    measure(
      pitched('g', 4, 1),
      5,
      '<reh staff="1" tstamp="1"><rend glyph.auth="smufl" glyph.name="coda">𝄌</rend></reh>',
      'right="end"',
    ),
  { section: true, meterVisible: true },
);
register(
  'repeat-abbreviation',
  measure(melody('cdeg'), 1) +
    measure('<mRpt/>', 2) +
    measure(melody('cdeg'), 3),
  { section: true, meterVisible: true },
);
register(
  'tremolo-two',
  `<fTrem beams="3">${pitched('g', 4, 2)}${pitched('b', 4, 2)}</fTrem>`,
);
register('upper-mordent', note(4, 'xml:id="n1"'), {
  marks: '<mordent staff="1" startid="#n1" form="upper"/>',
});
register('long-grace', pitched('a', 4, 8, 'grace="acc"') + note(4));
register(
  'after-grace',
  note(2) +
    `<graceGrp attach="post" grace="unacc">${pitched('a', 4, 16)}</graceGrp>` +
    note(4),
);
register(
  'slide',
  `<graceGrp attach="pre" grace="unacc"><beam>${pitched('e', 4, 16)}${pitched('f', 4, 16)}</beam></graceGrp>${note(4)}`,
);
register(
  'arpeggio',
  `<chord dur="2" xml:id="chord">${pitched('g', 4, 2)}${pitched('b', 4, 2)}${pitched('d', 5, 2)}</chord>`,
  { marks: '<arpeg staff="1" startid="#chord"/>' },
);
register(
  'tempo-return',
  measure(
    c(1),
    1,
    '<tempo staff="1" tstamp="1" mm="96" mm.unit="4">Tempo I: ♩ = 96</tempo>',
  ) +
    measure(
      pitched('d', 4, 1),
      2,
      '<tempo staff="1" tstamp="1" mm="72" mm.unit="4">Tempo II: ♩ = 72</tempo>' +
        direction('rit.', 3),
    ) +
    measure(pitched('e', 4, 1), 3, direction('a tempo')) +
    measure(pitched('f', 4, 1), 4, direction('Tempo I')),
  { section: true, meterVisible: true },
);
register(
  'dynamic-hairpin',
  melody('cdef')
    .replace('pname="c"', 'xml:id="hp1" pname="c"')
    .replace('pname="f"', 'xml:id="hp2" pname="f"'),
  {
    marks:
      '<dynam staff="1" startid="#hp1">p</dynam><hairpin staff="1" startid="#hp1" endid="#hp2" form="cres"/><dynam staff="1" startid="#hp2">f</dynam>',
  },
);
register('dynamic-fp', melody('cdef'), {
  marks:
    '<dynam staff="1" tstamp="1">fp</dynam><dynam staff="1" tstamp="3">sfz</dynam><dynam staff="1" tstamp="4">rfz</dynam>',
});
register(
  'articulation-phrase',
  pitched('c', 4, 4, 'xml:id="ph1" artic="stacc"') +
    pitched('d', 4, 4, 'artic="ten"') +
    pitched('e', 4, 4, 'xml:id="ph3" artic="acc"') +
    pitched('f', 4, 4, 'artic="stacciss"'),
  {
    marks:
      '<slur staff="1" startid="#ph1" endid="#ph3"/><breath staff="1" startid="#ph3"/>',
  },
);
register(
  'excerpt-mixed',
  pitched('c', 4, 4, 'dots="1"') +
    '<rest dur="8"/>' +
    `<beam>${pitched('f', 4, 8, 'accid="s" tie="i"')}${pitched('f', 4, 8, 'accid.ges="s" tie="t"')}</beam>` +
    pitched('f', 4, 4, 'accid="n"'),
  { meterVisible: true },
);
register(
  'excerpt-cross-bar',
  measure(
    pitched('b', 3, 4, 'accid="f"') +
      '<rest dur="8"/>' +
      pitched('g', 3, 4, 'dots="1" tie="i"'),
    1,
  ) +
    measure(
      pitched('g', 3, 4, 'tie="t"') +
        pitched('b', 3, 8) +
        '<rest dur="8"/>' +
        pitched('c', 4, 4),
      2,
    ),
  { section: true, clef: bass, meter: [3, 4], meterVisible: true },
);

// Recognition varies the principal pitch and clef, not just the answer order.
for (const base of ['trill', 'mordent', 'turn', 'grace']) {
  figures[base + '-c4'] = figures[base].replaceAll('pname="g"', 'pname="c"');
  figures[base + '-f3'] = figures[base].replaceAll(
    'pname="g" oct="4"',
    'pname="f" oct="3"',
  );
}

export function figureScore(id) {
  if (!Object.hasOwn(figures, id))
    throw new RangeError('Unknown teaching figure');
  const layout = layouts[id] ?? {};
  const meter =
    layout.meter ??
    (id === 'whole-bar-3'
      ? [3, 4]
      : id === 'whole-bar-6' || id === 'duplet'
        ? [6, 8]
        : [4, 4]);
  const base = id.split('-')[0];
  const ornament = ['trill', 'mordent', 'turn'].includes(base)
    ? `<${base} staff="1" startid="#n1"${base === 'mordent' ? ' form="lower"' : ''}/>`
    : '';
  const notes = figures[id].match(/<note[^>]*\/>/g);
  const content = layout.section
    ? figures[id]
    : id === 'example-repeated' || id === 'example-ending'
      ? measure(notes.slice(0, 4).join(''), 1) +
        measure(notes.slice(4).join(''), 2)
      : measure(figures[id], 1, layout.marks ?? ornament);
  const clef =
    layout.clef ??
    (id.endsWith('-f3')
      ? 'clef.shape="F" clef.line="4"'
      : 'clef.shape="G" clef.line="2"');
  const meterVisible =
    layout.meterVisible ||
    id.startsWith('whole-bar') ||
    [
      'example-pulse',
      'example-whole',
      'example-halves',
      'example-quarters',
      'example-eighths',
      'example-triplets',
      'example-sustained',
      'example-detached',
      'example-figure',
      'example-repeated',
      'example-ending',
    ].includes(id);
  return `<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0"><meiHead><fileDesc><titleStmt><title>OML ${id}</title></titleStmt><pubStmt/></fileDesc></meiHead><music><body><mdiv><score><scoreDef meter.count="${meter[0]}" meter.unit="${meter[1]}" meter.visible="${meterVisible}"${layout.signature ? ` key.sig="${layout.signature}"` : ''}>${layout.group ?? `<staffGrp><staffDef n="1" lines="5" ${clef}/></staffGrp>`}</scoreDef><section>${content}</section></score></mdiv></body></music></mei>`;
}

export async function generateFigures(
  mode,
  target = new URL('../lib/notation-figures.json', import.meta.url),
) {
  if (!['--check', '--write'].includes(mode))
    throw new RangeError('Use --check or --write');
  const result = {};
  for (const id of Object.keys(figures)) {
    const { pages } = await engrave(figureScore(id), 'mei', {
      adjustPageHeight: true,
      adjustPageWidth: true,
      breaks: 'none',
      header: 'none',
      footer: 'none',
    });
    result[id] = pages[0];
  }
  const serialized = JSON.stringify(result, null, 2) + '\n';
  if (mode === '--write') await writeFile(target, serialized);
  else if ((await readFile(target, 'utf8')) !== serialized)
    throw new Error('Teaching figures have drifted');
  return result;
}
