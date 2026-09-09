import { test, expect } from 'vitest';
import { JSDOM } from 'jsdom';
import { generateFrom, grade, exerciseKinds } from '../lib/exercises.ts';
import { figures, figureScore } from '../scripts/notation-figures.mjs';
import rendered from '../lib/notation-figures.json';

const documents = new Map();
const xml = (id) => {
  if (!documents.has(id))
    documents.set(
      id,
      new JSDOM(figureScore(id), { contentType: 'application/xml' }).window
        .document,
    );
  return documents.get(id);
};
const images = new Map();
const svg = (id) => {
  if (!images.has(id))
    images.set(
      id,
      new JSDOM(rendered[id], { contentType: 'image/svg+xml' }).window.document,
    );
  return images.get(id);
};
const label = (item) =>
  item.options.find((option) => option.id === item.answer).label;

// Integer fraction oracle reads the score, independently of exercise builders.
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const ratio = (n, d) => {
  const g = gcd(n, d);
  return [n / g, d / g];
};
const sum = ([a, b], [c, d]) => ratio(a * d + c * b, b * d);
function duration(node) {
  let n = 1,
    d = Number(node.getAttribute('dur'));
  const dots = Number(node.getAttribute('dots') || 0);
  n *= 2 ** (dots + 1) - 1;
  d *= 2 ** dots;
  for (let parent = node.parentElement; parent; parent = parent.parentElement)
    if (parent.localName === 'tuplet') {
      n *= Number(parent.getAttribute('numbase'));
      d *= Number(parent.getAttribute('num'));
    }
  return ratio(n, d);
}
const fraction = (x) => x.join('/');

test('Contextual accidental answers follow signed pitches, registered scope and actual ties', () => {
  const expected = {
    'accidental-signature-reset': ['F4', 'F♯4'],
    'accidental-tie-scope': ['F4', 'F4', 'F♯4'],
    'accidental-octave-scope': ['F4', 'F♯5', 'F4'],
    'accidental-replacement': ['F𝄪4', 'F♯4', 'F♯4'],
    'accidental-natural': ['B♭4', 'B4', 'B4'],
  };
  const midis = {
    'accidental-signature-reset': [65, 66],
    'accidental-tie-scope': [65, 65, 66],
    'accidental-octave-scope': [65, 78, 65],
    'accidental-replacement': [67, 66, 66],
    'accidental-natural': [70, 71, 71],
  };
  const seen = new Set();
  for (let seed = 0; seed < 600; seed++) {
    const item = generateFrom('accidental-scope', 3, seed, 'en');
    if (!item.figure) continue;
    const event = Number(item.prompt.match(/event (\d+)/)[1]) - 1;
    seen.add(`${item.figure}:${event}`);
    expect(label(item)).toBe(expected[item.figure][event]);
    expect(item.staff).toBeUndefined();
    const notes = [...xml(item.figure).querySelectorAll('note')];
    const accidental = { n: 0, s: 1, f: -1, ss: 2 };
    const sounded = notes.map((note) => {
      const natural = { c: 0, d: 2, e: 4, f: 5, g: 7, a: 9, b: 11 }[
        note.getAttribute('pname')
      ];
      const sign = note.getAttribute('accid') || note.getAttribute('accid.ges');
      return (
        (Number(note.getAttribute('oct')) + 1) * 12 + natural + accidental[sign]
      );
    });
    expect(sounded).toEqual(midis[item.figure]);
    if (item.figure === 'accidental-tie-scope') {
      expect(notes.map((n) => n.getAttribute('tie'))).toEqual(['i', 't', null]);
      expect(notes[1].getAttribute('accid')).toBeNull();
      expect(svg(item.figure).querySelectorAll('.tie path')).toHaveLength(1);
    }
  }
  expect(seen.size).toBe(9);
});

test('Dotted notes and rests have exact fit, overflow and equal-boundary questions', () => {
  const seen = new Set();
  const restCounts = new Set();
  for (let seed = 0; seed < 600; seed++) {
    const item = generateFrom('dotted-value', 3, seed, 'en');
    if (
      item.prompt.includes('rest of base value') &&
      !item.prompt.includes('bar has')
    ) {
      const double = item.prompt.includes('double-dotted');
      expect(label(item)).toBe(double ? '7' : '3');
      restCounts.add(label(item));
    }
    const match = item.prompt.match(
      /bar has (\d+)\/(\d+).*a (double-)?dotted (rest|note) of base value 1\/(\d+)/,
    );
    if (!match) continue;
    const [, rn, rd, double, form, den] = match;
    const [n, d] = double ? [7, 4 * Number(den)] : [3, 2 * Number(den)];
    const diff = n * Number(rd) - d * Number(rn);
    expect(label(item)).toBe(diff <= 0 ? 'Fits' : 'Overflows');
    expect(item.explanation).toContain('not a verdict');
    seen.add(`${form}:${Math.sign(diff)}`);
  }
  expect([...seen].sort((a, b) => a.localeCompare(b))).toEqual([
    'note:-1',
    'note:0',
    'note:1',
    'rest:-1',
    'rest:0',
    'rest:1',
  ]);
  expect(restCounts.size).toBe(2);
});

test('Explicit tuplet ratios, rests, subdivisions and ties have independent rational durations', () => {
  const doc = xml('tuplet-mixed');
  const groups = [...doc.querySelectorAll('tuplet')];
  expect(
    groups.map((g) => [...g.querySelectorAll('note,rest')].map(duration)),
  ).toEqual([
    [
      [1, 6],
      [1, 12],
    ],
    [
      [1, 24],
      [1, 24],
      [1, 12],
      [1, 12],
    ],
  ]);
  const expected = {
    rest: fraction(duration(groups[0].querySelector('rest'))),
    subdivision: fraction(duration(groups[1].querySelector('note'))),
    tied: fraction(
      [...groups[1].querySelectorAll('note[tie]')]
        .map(duration)
        .reduce(sum, [0, 1]),
    ),
    group: fraction(
      [...groups[0].querySelectorAll('note,rest')]
        .map(duration)
        .reduce(sum, [0, 1]),
    ),
    thirteen: fraction(
      [...xml('tuplet-13-12').querySelectorAll('note')]
        .map(duration)
        .reduce(sum, [0, 1]),
    ),
  };
  expect(expected).toEqual({
    rest: '1/12',
    subdivision: '1/24',
    tied: '1/6',
    group: '1/4',
    thirteen: '3/4',
  });
  const seen = new Set();
  const regular = {
    '3:2': 2,
    '5:4': 4,
    '6:4': 4,
    '7:4': 4,
    '7:8': 8,
    '9:8': 8,
    '10:8': 8,
    '11:8': 8,
    '12:8': 8,
  };
  const names = {
    'half note': 2,
    'quarter note': 4,
    'eighth note': 8,
    'sixteenth note': 16,
    'thirty-second note': 32,
  };
  for (let seed = 0; seed < 800; seed++) {
    const item = generateFrom('tuplet', 3, seed, 'en');
    if (item.figure) {
      const key =
        item.figure === 'tuplet-13-12'
          ? 'thirteen'
          : item.prompt.includes('eighth rest')
            ? 'rest'
            : item.prompt.includes('one sixteenth')
              ? 'subdivision'
              : item.prompt.includes('tied pair')
                ? 'tied'
                : 'group';
      seen.add(key);
      expect(label(item)).toBe(expected[key]);
    } else {
      const [, base, relation] = item.prompt.match(
        /Starting value: (.+?)\..*as a (\d+:\d+)/,
      );
      seen.add(relation);
      expect(names[label(item)]).toBe(names[base] * regular[relation]);
    }
  }
  for (const key of [...Object.keys(expected), ...Object.keys(regular)])
    expect(seen.has(key)).toBe(true);
  for (const id of ['duplet', 'quartole', 'octole']) {
    const total = [...xml(id).querySelectorAll('note')]
      .map(duration)
      .reduce(sum, [0, 1]);
    expect(total).toEqual([3, 8]);
  }
});

test('Cross-bar tie questions distinguish each allocated portion from total sounding time', () => {
  const seen = new Set();
  for (let seed = 0; seed < 120; seed++) {
    const item = generateFrom('tie-sum', 3, seed, 'en');
    if (!item.figure) continue;
    const total = item.prompt.includes('total duration');
    expect(label(item)).toBe(total ? '1/2' : '1/4');
    seen.add(
      total ? 'total' : item.prompt.includes('bar 1') ? 'first' : 'second',
    );
  }
  expect(seen.size).toBe(3);
  expect(
    [...xml('cross-bar-tie').querySelectorAll('measure')].map((bar) =>
      [...bar.querySelectorAll('note,rest')].map(duration).reduce(sum, [0, 1]),
    ),
  ).toEqual([
    [3, 4],
    [3, 4],
  ]);
});

test('Marked navigation has actual repeat, volta, segno, coda and abbreviation signs', () => {
  const volta = xml('repeat-volta');
  expect(volta.querySelector('measure[n="1"]').getAttribute('left')).toBe(
    'rptstart',
  );
  expect(
    volta.querySelector('ending[n="1"] measure').getAttribute('right'),
  ).toBe('rptend');
  expect(svg('repeat-volta').querySelectorAll('.voltaBracket')).toHaveLength(2);
  expect(xml('repeat-implicit').querySelector('[left="rptstart"]')).toBeNull();
  expect(
    xml('repeat-implicit')
      .querySelector('measure[n="2"]')
      .getAttribute('right'),
  ).toBe('rptend');
  expect(
    xml('repeat-dc-fine').querySelector('measure[n="2"] dir').textContent,
  ).toBe('Fine');
  expect(
    xml('repeat-dc-fine').querySelector('measure[n="3"] dir').textContent,
  ).toBe('D.C. al Fine');
  const ds = xml('repeat-ds-coda');
  expect(
    ds.querySelector('measure[n="2"] rend').getAttribute('glyph.name'),
  ).toBe('segno');
  expect(ds.querySelector('measure[n="3"] dir').textContent).toBe('To Coda');
  expect(ds.querySelector('measure[n="4"] dir').textContent).toBe(
    'D.S. al Coda',
  );
  expect(
    ds.querySelector('measure[n="5"] rend').getAttribute('glyph.name'),
  ).toBe('coda');
  expect(
    svg('repeat-abbreviation').querySelectorAll('.mRpt > use'),
  ).toHaveLength(1);
  expect(
    xml('repeat-abbreviation').querySelector('measure[n="2"] mRpt'),
  ).not.toBeNull();
  // These playback examples remain expanded: the new signs do not change audio.
  for (const id of ['example-repeated', 'example-ending']) {
    expect(xml(id).querySelectorAll('note')).toHaveLength(8);
    expect(figureScore(id)).not.toContain('rptend');
  }
});

test('Advanced excerpts independently match each pitch and rhythm to the engraved event', () => {
  const pitches = {
    'excerpt-mixed': ['C4', null, 'F♯4', 'F♯4', 'F4'],
    'excerpt-cross-bar': ['B♭3', null, 'G3', 'G3', 'B3', null, 'C4'],
  };
  const seen = new Set();
  const written = {
    'excerpt-mixed': [
      ['c', '4', null, null],
      ['f', '4', 's', 'i'],
      ['f', '4', null, 't'],
      ['f', '4', 'n', null],
    ],
    'excerpt-cross-bar': [
      ['b', '3', 'f', null],
      ['g', '3', null, 'i'],
      ['g', '3', null, 't'],
      ['b', '3', null, null],
      ['c', '4', null, null],
    ],
  };
  for (let seed = 0; seed < 40; seed++)
    for (const level of [2, 3]) {
      const item = generateFrom('short-excerpt', level, seed, 'en');
      seen.add(item.figure);
      const events = [...xml(item.figure).querySelectorAll('note,rest')];
      expect(
        [...xml(item.figure).querySelectorAll('note')].map((note) =>
          ['pname', 'oct', 'accid', 'tie'].map((attribute) =>
            note.getAttribute(attribute),
          ),
        ),
      ).toEqual(written[item.figure]);
      const pitchParts = item.parts.filter((part) => part.kind === 'pitch');
      const rhythmParts = item.parts.filter((part) => part.kind === 'rhythm');
      expect(pitchParts.map((part) => part.answer)).toEqual(
        pitches[item.figure].filter(Boolean),
      );
      expect(rhythmParts.map((part) => part.answer)).toEqual(
        events.map((event) => fraction(duration(event))),
      );
      expect(item.staff).toBeUndefined();
      for (const part of item.parts) {
        expect(part.explanation.length).toBeGreaterThan(40);
        expect(
          part.options.filter((option) => option.id === part.answer),
        ).toHaveLength(1);
        expect(
          grade(
            { ...item, answer: part.answer, options: part.options },
            part.answer,
          ).correct,
        ).toBe(true);
        expect(
          grade(
            { ...item, answer: part.answer, options: part.options },
            part.options.find((o) => o.id !== part.answer).id,
          ).correct,
        ).toBe(false);
      }
      const bars = [...xml(item.figure).querySelectorAll('measure')];
      for (const bar of bars)
        expect(
          [...bar.querySelectorAll('note,rest')]
            .map(duration)
            .reduce(sum, [0, 1]),
        ).toEqual(item.figure === 'excerpt-mixed' ? [1, 1] : [3, 4]);
    }
  expect([...seen].sort((a, b) => a.localeCompare(b))).toEqual([
    'excerpt-cross-bar',
    'excerpt-mixed',
  ]);
  const localized = {
    ru: {
      'excerpt-mixed': [
        'до, первая октава',
        'фа-диез, первая октава',
        'фа-диез, первая октава',
        'фа, первая октава',
      ],
      'excerpt-cross-bar': [
        'си-бемоль, малая октава',
        'соль, малая октава',
        'соль, малая октава',
        'си, малая октава',
        'до, первая октава',
      ],
    },
    de: {
      'excerpt-mixed': ['c′', 'fis′', 'fis′', 'f′'],
      'excerpt-cross-bar': ['b', 'g', 'g', 'h', 'c′'],
    },
  };
  for (const lang of ['ru', 'de'])
    for (let seed = 0; seed < 20; seed++) {
      const item = generateFrom('short-excerpt', 3, seed, lang);
      const pitches = item.parts.filter((part) => part.kind === 'pitch');
      expect(pitches.map((part) => part.answer)).toEqual(
        localized[lang][item.figure],
      );
      for (const part of item.parts)
        expect(part.explanation).not.toContain('undefined');
    }
});

test('All contextual discussions are unscored and provide sign-specific figures', () => {
  const seen = new Set();
  for (const kind of ['beaming-review', 'ornament-review', 'performance-marks'])
    for (const lang of ['en', 'ru', 'de'])
      for (let seed = 0; seed < 250; seed++) {
        const item = generateFrom(kind, 3, seed, lang);
        if (!item.review) continue;
        seen.add(item.figure);
        expect(item.options).toEqual([]);
        expect(item.answer).toBe('');
        expect(item.explanation.length).toBeGreaterThan(100);
        expect(() => grade(item, 'anything')).toThrow(/Reflection/);
      }
  for (const id of [
    'beamed-mixed',
    'beamed-syllables',
    'duplet',
    'quartole',
    'octole',
    'upper-mordent',
    'long-grace',
    'after-grace',
    'slide',
    'arpeggio',
    'tempo-return',
    'dynamic-hairpin',
    'dynamic-fp',
    'articulation-phrase',
    'tremolo-two',
  ])
    expect(seen.has(id)).toBe(true);
  expect(exerciseKinds).toHaveLength(14);
});

test('Original figures actually engrave the promised families, not just captions', () => {
  expect(svg('grand-staff').querySelectorAll('.staff')).toHaveLength(2);
  expect(svg('organ-staves').querySelectorAll('.staff')).toHaveLength(3);
  expect(svg('signature-bass').querySelectorAll('.keyAccid')).toHaveLength(2);
  expect(
    xml('signature-bass').querySelector('staffDef').getAttribute('clef.shape'),
  ).toBe('F');
  expect(
    [...xml('stem-directions').querySelectorAll('note')].map((n) =>
      n.getAttribute('stem.dir'),
    ),
  ).toEqual(['up', 'down']);
  for (const [id, selector] of [
    ['upper-mordent', '.mordent use'],
    ['arpeggio', '.arpeg use'],
    ['tremolo-two', '.fTrem polygon'],
    ['dynamic-hairpin', '.hairpin polyline'],
    ['dynamic-fp', '.dynam'],
    ['articulation-phrase', '.slur path'],
    ['articulation-phrase', '.breath use'],
    ['historical-multirests', '.multiRest use'],
    ['beamed-syllables', '.verse'],
  ])
    expect(
      svg(id).querySelectorAll(selector).length,
      `${id}: ${selector}`,
    ).toBeGreaterThan(0);
  expect(
    xml('upper-mordent').querySelector('mordent').getAttribute('form'),
  ).toBe('upper');
  expect(xml('mordent').querySelector('mordent').getAttribute('form')).toBe(
    'lower',
  );
  expect(
    xml('long-grace').querySelector('note[grace]').getAttribute('stem.mod'),
  ).toBeNull();
  expect(
    xml('grace').querySelector('note[grace]').getAttribute('stem.mod'),
  ).toBe('1slash');
  expect(
    xml('after-grace').querySelector('graceGrp').getAttribute('attach'),
  ).toBe('post');
  expect(xml('slide').querySelectorAll('graceGrp note')).toHaveLength(2);
  expect(xml('tremolo-two').querySelectorAll('fTrem note')).toHaveLength(2);
  expect(
    xml('historical-multirests')
      .querySelector('multiRest')
      .getAttribute('block'),
  ).toBe('false');
  expect(
    [...svg('historical-multirests').querySelectorAll('.multiRest > use')].map(
      (node) => node.getAttribute('xlink:href').slice(1, 5),
    ),
  ).toEqual(['E4E1', 'E4E2', 'E4E3']);
  expect(svg('tempo-return').documentElement.textContent).toContain('= 96');
  expect(svg('tempo-return').documentElement.textContent).toContain('= 72');
  expect(figures['example-repeated']).toContain('pname="c"');
});
