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
/** The value a note or rest shows on its own, before any tuplet ratio. */
function notated(node) {
  const dots = Number(node.getAttribute('dots') || 0);
  return ratio(
    2 ** (dots + 1) - 1,
    Number(node.getAttribute('dur')) * 2 ** dots,
  );
}
function duration(node) {
  let [n, d] = notated(node);
  for (let parent = node.parentElement; parent; parent = parent.parentElement)
    if (parent.localName === 'tuplet') {
      n *= Number(parent.getAttribute('numbase'));
      d *= Number(parent.getAttribute('num'));
    }
  return ratio(n, d);
}
const fraction = (x) => x.join('/');
const added = (nodes, measure = duration) =>
  fraction(nodes.map(measure).reduce(sum, [0, 1]));
/** Glyph codes of the outlines an engraved element uses, in drawing order. */
const glyphs = (id, selector) =>
  [...svg(id).querySelectorAll(`${selector} use`)].map((use) =>
    use.getAttribute('xlink:href').slice(1, 5),
  );
/** Which part of a tuplet figure an English tuplet-context question asks for. */
const tupletTarget = (item) =>
  item.figure === 'tuplet-13-12'
    ? 'thirteen'
    : item.prompt.includes('eighth rest')
      ? 'rest'
      : item.prompt.includes('one sixteenth')
        ? 'subdivision'
        : item.prompt.includes('tied pair')
          ? 'tied'
          : 'group';

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
    const accidental = { n: 0, s: 1, f: -1, x: 2 };
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

test('The double sharp is engraved as the croix that the answer labels print', () => {
  // MEI "ss" draws two sharp signs side by side (SMuFL E269), a sign no lesson
  // teaches; "x" draws the croix (E263) that F𝄪 stands for everywhere else.
  const [double, single, repeated] = [
    ...xml('accidental-replacement').querySelectorAll('note'),
  ];
  expect(double.getAttribute('accid')).toBe('x');
  expect(single.getAttribute('accid')).toBe('s');
  expect(repeated.getAttribute('accid')).toBeNull();
  expect(glyphs('accidental-replacement', '.accid')).toEqual(['E263', 'E262']);
  // The same croix as the pitch options of that item are written with.
  let offered = 0;
  for (let seed = 0; seed < 200; seed++) {
    const item = generateFrom('accidental-scope', 3, seed, 'en');
    if (item.figure !== 'accidental-replacement') continue;
    expect(item.options.map((option) => option.label)).toContain('F𝄪4');
    offered++;
  }
  expect(offered).toBeGreaterThan(0);
});

test('Dotted notes and rests have exact fit, overflow and equal-boundary questions', () => {
  const seen = new Set();
  const restCounts = new Set();
  for (let seed = 0; seed < 600; seed++) {
    const item = generateFrom('dotted-value', 3, seed, 'en');
    if (
      /dotted (whole|half|quarter|eighth) rest\?$/.test(item.prompt) &&
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
      const key = tupletTarget(item);
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
  for (const id of ['duplet', 'quartole', 'octole'])
    expect(added([...xml(id).querySelectorAll('note')])).toBe('3/8');
});

test('Each irregular division called explicit prints its ratio, its 3/8 bar and one beam', () => {
  // SMuFL: time-signature digits are E080–E089, tuplet digits E880–E889 and
  // the tuplet colon E88A.
  const digits = (value, base) => Array.from(String(value), (n) => base + n);
  for (const id of ['duplet', 'quartole', 'octole']) {
    const score = xml(id);
    const tuplet = score.querySelector('tuplet');
    const [count, replaced] = ['num', 'numbase'].map((name) =>
      tuplet.getAttribute(name),
    );
    // A bare “2” over the bracket left 2:3 to be guessed, while the question
    // calls the division explicit and the rubric says to read the ratio.
    expect(glyphs(id, '.tupletNum'), id).toEqual([
      ...digits(count, 'E88'),
      'E88A',
      ...digits(replaced, 'E88'),
    ]);
    const meter = score.querySelector('scoreDef');
    expect(meter.getAttribute('meter.visible'), id).toBe('true');
    expect(glyphs(id, '.meterSig'), id).toEqual([
      ...digits(meter.getAttribute('meter.count'), 'E08'),
      ...digits(meter.getAttribute('meter.unit'), 'E08'),
    ]);
    expect(
      ['meter.count', 'meter.unit'].map((name) => meter.getAttribute(name)),
    ).toEqual(['3', '8']);
    // The group fills its bar, so it is beamed as one, like its siblings.
    expect(score.querySelectorAll('tuplet > beam')).toHaveLength(1);
    expect(score.querySelectorAll('tuplet > beam > note')).toHaveLength(
      Number(count),
    );
    expect(svg(id).querySelectorAll('.beam')).toHaveLength(1);
  }
});

test('Tuplet-context options offer the unscaled written value and no other value longer than the bar', () => {
  const [first, second] = [...xml('tuplet-mixed').querySelectorAll('tuplet')];
  // What each asked part reads as when the ratio is ignored, off the score.
  const unscaled = {
    rest: added([first.querySelector('rest')], notated),
    subdivision: added([second.querySelector('note')], notated),
    tied: added([...second.querySelectorAll('note[tie]')], notated),
    group: added([...first.querySelectorAll('note,rest')], notated),
    thirteen: added([...xml('tuplet-13-12').querySelectorAll('note')], notated),
  };
  expect(unscaled).toEqual({
    rest: '1/8',
    subdivision: '1/16',
    tied: '1/4',
    group: '3/8',
    thirteen: '13/16',
  });
  const size = (text) => {
    const [n, d] = text.split('/').map(Number);
    return n / d;
  };
  const bar = (id) => {
    const meter = xml(id).querySelector('scoreDef');
    return size(
      `${meter.getAttribute('meter.count')}/${meter.getAttribute('meter.unit')}`,
    );
  };
  const places = new Map();
  const seen = new Set();
  let count = 0;
  for (let seed = 0; seed < 800; seed++) {
    const item = generateFrom('tuplet', 3, seed, 'en');
    if (!item.figure) continue;
    const key = tupletTarget(item);
    seen.add(key);
    expect(new Set(item.options.map((o) => o.label)).size).toBe(5);
    // The misreading the feedback names is always on offer, and it alone is
    // answered with “use the stated ratio”.
    const misread = item.options.find((o) => o.label === unscaled[key]);
    expect(misread, `${key}: ${unscaled[key]}`).toBeDefined();
    expect(grade(item, misread.id).tag).toBe('counted-the-written-value');
    for (const option of item.options) {
      if (option.id === item.answer || option === misread) continue;
      expect(grade(item, option.id).tag, option.label).toBe('added-wrong');
      // 3/4 and 13/16 used to be offered under the 2/4 bar of the 3:2 figure.
      expect(size(option.label), `${key}: ${option.label}`).toBeLessThanOrEqual(
        bar(item.figure),
      );
    }
    // Thirteen sixteenths read without the ratio overflow their 3/4 bar: that
    // is the misreading itself, and the only such value.
    expect(size(unscaled[key]) > bar(item.figure)).toBe(key === 'thirteen');
    const place = item.options.findIndex((o) => o.id === item.answer);
    places.set(place, (places.get(place) ?? 0) + 1);
    count++;
  }
  expect(seen.size).toBe(5);
  expect([...places.keys()].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
  expect(Math.max(...places.values()) / count).toBeLessThan(0.3);
});

test('Cross-bar tie questions distinguish each allocated portion from total sounding time', () => {
  const seen = new Set();
  // Two beats of silence in 3/4 are two quarter rests, not a half rest, and
  // the explanation describes the bars as they are engraved.
  expect(
    [...xml('cross-bar-tie').querySelectorAll('measure')].map((bar) =>
      [...bar.querySelectorAll('note,rest')].map(
        (event) => `${event.localName} ${event.getAttribute('dur')}`,
      ),
    ),
  ).toEqual([
    ['rest 4', 'rest 4', 'note 4'],
    ['note 4', 'rest 4', 'rest 4'],
  ]);
  const described = {
    en: /^Bar 1: two quarter rests \+ quarter = 3\/4\. Bar 2: tied quarter \+ two quarter rests = 3\/4\./,
    ru: /^Такт 1: две четвертные паузы \+ четверть = 3\/4\. Такт 2: связанная четверть \+ две четвертные паузы = 3\/4\./,
    de: /^Takt 1: zwei Viertelpausen \+ Viertel = 3\/4\. Takt 2: übergebundene Viertel \+ zwei Viertelpausen = 3\/4\./,
  };
  for (let seed = 0; seed < 120; seed++) {
    const item = generateFrom('tie-sum', 3, seed, 'en');
    if (!item.figure) continue;
    const total = item.prompt.includes('total duration');
    expect(label(item)).toBe(total ? '1/2' : '1/4');
    for (const lang of ['en', 'ru', 'de']) {
      const { explanation } = generateFrom('tie-sum', 3, seed, lang);
      expect(explanation).toMatch(described[lang]);
      expect(explanation).not.toMatch(/half rest|половинная пауза|halbe Pause/);
    }
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

test('Only a sign carried over the barline of an excerpt is diagnosed as carried too far', () => {
  // Read off the score: a note with no sign of its own that restrikes, in a
  // later bar, a line or space which carried a written sign in an earlier one.
  const inheritors = (id) => {
    const notes = [...xml(id).querySelectorAll('measure')].flatMap((bar) =>
      [...bar.querySelectorAll('note')].map((note) => ({
        bar: Number(bar.getAttribute('n')),
        place: note.getAttribute('pname') + note.getAttribute('oct'),
        sign: note.getAttribute('accid'),
        continued: note.getAttribute('tie') === 't',
      })),
    );
    const pairs = new Map();
    notes.forEach((note, index) => {
      if (note.sign || note.continued) return;
      const source = notes.findLastIndex(
        (earlier) =>
          earlier.bar < note.bar &&
          earlier.place === note.place &&
          earlier.sign,
      );
      if (source >= 0) pairs.set(index, source);
    });
    return pairs;
  };
  // One bar has no barline to cross; the other restrikes B after a B flat.
  expect([...inheritors('excerpt-mixed')]).toEqual([]);
  expect([...inheritors('excerpt-cross-bar')]).toEqual([[3, 0]]);
  const seen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (const level of [2, 3])
      for (let seed = 0; seed < 40; seed++) {
        const item = generateFrom('short-excerpt', level, seed, lang);
        const pairs = inheritors(item.figure);
        const pitches = item.parts.filter((part) => part.kind === 'pitch');
        pitches.forEach((part, index) => {
          const carried = part.options
            .filter((option) => option.tag === 'carried-the-sign-too-far')
            .map((option) => option.label);
          if (!pairs.has(index)) {
            expect(carried, `${item.figure} note ${index + 1}`).toEqual([]);
            return;
          }
          // The wrong choice is the earlier note's own name: B flat again.
          expect(carried).toEqual([pitches[pairs.get(index)].answer]);
          // It used to be answered as a plain wrong sign, which the sharp on
          // the same line still is; the octave above stays a register slip.
          expect(
            part.options
              .map((option) => option.tag)
              .sort((a, b) => a.localeCompare(b)),
          ).toEqual([
            'carried-the-sign-too-far',
            'correct',
            'neighbour-register',
            'wrong-alteration',
          ]);
          seen.add(`${lang}:${item.figure}`);
        });
      }
  expect([...seen].sort((a, b) => a.localeCompare(b))).toEqual([
    'de:excerpt-cross-bar',
    'en:excerpt-cross-bar',
    'ru:excerpt-cross-bar',
  ]);
});

test('A beaming or tuplet rubric describes the one figure on screen', () => {
  const ratios = ['2:3', '4:3', '8:6'];
  const seen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 0; seed < 120; seed++) {
      const item = generateFrom('beaming-review', 3, seed, lang);
      const score = xml(item.figure);
      const tuplet = score.querySelector('tuplet');
      const own = tuplet
        ? `${tuplet.getAttribute('num')}:${tuplet.getAttribute('numbase')}`
        : null;
      // One rubric used to list 2:3, 4:3 and 8:6 under each of the three, so
      // a ratio counts as named however it is punctuated.
      for (const printed of ratios)
        expect(
          item.explanation.includes(printed),
          `${lang} ${item.figure} ${printed}`,
        ).toBe(printed === own);
      // A figure without a tuplet is answered about its beams, not with the
      // rubric of a ratio that is not on the page.
      if (!tuplet)
        expect(item.explanation, `${lang} ${item.figure}`).toMatch(
          /beam|ребр|[Bb]alk/,
        );
      // … and described the text underlay beneath figures that have no text.
      expect(
        /syllable|слог|Silbe/.test(item.explanation),
        `${lang} ${item.figure}`,
      ).toBe(score.querySelector('syl') !== null);
      expect(
        /sixteenth|шестнадцат|Sechzehntel/.test(item.explanation),
        `${lang} ${item.figure}`,
      ).toBe(
        [...score.querySelectorAll('note')].some(
          (note) => note.getAttribute('dur') === '16',
        ),
      );
      seen.add(item.figure);
    }
  expect(seen.size).toBe(7);
});

test('A dynamics discussion asks about and explains only the marks its figure prints', () => {
  const marks = ['p', 'f', 'fp', 'sfz', 'rfz'];
  const names = (text, mark) =>
    new RegExp(`(?<![A-Za-z])${mark}(?![A-Za-z])`).test(text);
  const hairpin = { en: /hairpin/i, ru: /вилк/i, de: /Gabel/ };
  const seen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 0; seed < 400; seed++) {
      const item = generateFrom('performance-marks', 3, seed, lang);
      if (!item.review || item.rule !== 'relative-dynamic-level') continue;
      const score = xml(item.figure);
      const printed = [...score.querySelectorAll('dynam')].map(
        (mark) => mark.textContent,
      );
      const drawn = score.querySelector('hairpin') !== null;
      // With fp, sfz and rfz on screen the rubric opened with a hairpin; with
      // the hairpin on screen the question asked about fp, sfz and rfz.
      for (const text of [item.prompt, item.explanation]) {
        for (const mark of marks)
          expect(names(text, mark), `${lang} ${item.figure} ${mark}`).toBe(
            printed.includes(mark),
          );
        expect(hairpin[lang].test(text), `${lang} ${item.figure}`).toBe(drawn);
      }
      seen.add(`${lang}:${item.figure}:${printed.join(' ')}:${drawn}`);
    }
  expect([...seen].sort((a, b) => a.localeCompare(b))).toEqual(
    ['de', 'en', 'ru'].flatMap((lang) => [
      `${lang}:dynamic-fp:fp sfz rfz:false`,
      `${lang}:dynamic-hairpin:p f:true`,
    ]),
  );
});

test('Only the slashed grace note is answered with the remark on the acciaccatura', () => {
  const remark = { en: /acciaccatura/i, ru: /аччаккатур/i, de: /Acciaccatura/ };
  const slashed = new Set();
  const figuresSeen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 0; seed < 300; seed++) {
      const item = generateFrom('ornament-review', 2, seed, lang);
      const slash = [...xml(item.figure).querySelectorAll('note')].some(
        (note) =>
          note.getAttribute('grace') !== null &&
          note.getAttribute('stem.mod') === '1slash',
      );
      // A trill, a turn or an arpeggio sign used to be followed by two lines
      // about a grace note that was not on the page.
      expect(
        remark[lang].test(item.explanation),
        `${lang} ${item.figure}`,
      ).toBe(slash);
      figuresSeen.add(item.figure);
      if (slash) slashed.add(item.figure);
    }
  expect(figuresSeen.size).toBe(17);
  expect([...slashed].sort((a, b) => a.localeCompare(b))).toEqual([
    'grace',
    'grace-c4',
    'grace-f3',
  ]);
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

test('The tempo-return question names the marks its figure prints, in every language', () => {
  // Read off the score, not typed here: the two tempos and three directions.
  const printed = (tag) =>
    [...xml('tempo-return').querySelectorAll(tag)].map((node) =>
      node.textContent.trim(),
    );
  expect(printed('dir')).toEqual(['rit.', 'a tempo', 'Tempo I']);
  expect(printed('tempo').map((text) => text.split(':')[0])).toEqual([
    'Tempo I',
    'Tempo II',
  ]);
  const seen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 0; seed < 400 && !seen.has(lang); seed++) {
      const item = generateFrom('performance-marks', 3, seed, lang);
      if (item.figure !== 'tempo-return') continue;
      seen.add(lang);
      // The reader is asked about the two return marks by the words on the
      // page. Russian used to paraphrase them («в прежнем темпе»), so the
      // question named nothing the reader could find in the figure.
      for (const mark of ['a tempo', 'Tempo I'])
        expect(item.prompt, `${lang} prompt`).toContain(mark);
      for (const mark of [...printed('dir'), 'Tempo II'])
        expect(item.explanation, `${lang} explanation`).toContain(mark);
    }
  expect(seen).toEqual(new Set(['en', 'ru', 'de']));
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
