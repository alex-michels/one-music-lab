import { test, expect } from 'vitest';
import { generateFrom, grade } from '../lib/exercises.ts';
import { exerciseExplanations } from '../lib/learning.ts';

test('An in-bar replacement is never diagnosed as crossing a barline', () => {
  const seen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 0; seed < 250; seed++) {
      const item = generateFrom('accidental-scope', 3, seed, lang);
      if (item.figure !== 'accidental-replacement') continue;
      seen.add(lang);
      // Both the written single sharp and its later repetition remain in bar 1.
      for (const option of item.options)
        expect(grade(item, option.id).tag).not.toBe('carried-the-sign-too-far');
    }
  expect(seen.size).toBe(3);
});

test('Barline and tied-reattack errors are distinguished from wrong alterations', () => {
  const targets = new Set();
  for (let seed = 0; seed < 400; seed++) {
    const item = generateFrom('accidental-scope', 3, seed, 'en');
    if (
      !['accidental-signature-reset', 'accidental-tie-scope'].includes(
        item.figure,
      )
    )
      continue;
    const event = Number(item.prompt.match(/event (\d+)/)[1]);
    targets.add(`${item.figure}:${event}`);
    const correct = item.options.find((option) => option.id === item.answer);
    const natural = item.options.find((option) => option.label === 'F4');
    const sharp = item.options.find((option) => option.label === 'F♯4');
    if (item.figure === 'accidental-tie-scope' && event === 2) {
      expect(correct).toBe(natural);
      expect(grade(item, sharp.id).tag).toBe('ignored-the-sign');
    } else {
      expect(correct).toBe(sharp);
      expect(grade(item, natural.id).tag).toBe('carried-the-sign-too-far');
    }
    const double = item.options.find((option) => option.label === 'F𝄪4');
    expect(grade(item, double.id).tag).toBe('wrong-alteration');
  }
  expect(targets.size).toBe(3);
});

test('A sign borrowed from another octave is answered as that mistake, and only where one was written', () => {
  // The octave figure: F♮4 is written, then F5 with no sign of its own, under
  // a signature of one sharp. Event 2 sounds F♯5; reading the natural there is
  // the mistake the figure exists to catch.
  const borrowed = new Set();
  const figures = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 0; seed < 400; seed++) {
      const item = generateFrom('accidental-scope', 3, seed, lang);
      figures.add(item.figure);
      // The rule also draws items with no numbered event; they must not carry
      // the tag either, which the comparison below then reports.
      const event = Number(item.prompt.match(/\d+/)?.[0]);
      for (const option of item.options) {
        const tag = grade(item, option.id).tag;
        if (tag !== 'carried-the-sign-to-another-octave') continue;
        // Nowhere else: not on the same octave later in the bar (event 3),
        // not across a barline, not in the figures with one octave only.
        expect(`${item.figure}:${event}`).toBe('accidental-octave-scope:2');
        expect(option.id).not.toBe(item.answer);
        borrowed.add(`${lang}:${option.label}`);
      }
      if (item.figure !== 'accidental-octave-scope') continue;
      const labels = item.options.map((option) => option.label);
      if (event === 2) {
        // The natural is offered, and it is the only option answered this way;
        // the other wrong signs are still plain wrong alterations.
        const other = item.options.filter(
          (option) =>
            option.id !== item.answer &&
            grade(item, option.id).tag !== 'carried-the-sign-to-another-octave',
        );
        expect(other.length).toBe(labels.length - 2);
        for (const option of other)
          expect(grade(item, option.id).tag).toBe('wrong-alteration');
      } else {
        // Event 3 is the F♮4 itself, still under its own sign: nothing was
        // borrowed, so no option carries the tag.
        expect(
          item.options.map((option) => grade(item, option.id).tag),
        ).not.toContain('carried-the-sign-to-another-octave');
      }
    }
  expect(figures.has('accidental-octave-scope')).toBe(true);
  // One label per language, and it is the natural in the upper octave.
  expect(borrowed.size).toBe(3);
  expect(borrowed.has('en:F5')).toBe(true);
  // The sentence the reader gets names the octave, in each language.
  const said = exerciseExplanations['carried-the-sign-to-another-octave'];
  expect(said.en).toMatch(/own octave/);
  expect(said.ru).toMatch(/в той октаве/);
  expect(said.de).toMatch(/Oktavlage/);
  // …and the letter: a sign on F says nothing about a G in the same octave.
  expect(said.en).toMatch(/own letter/);
  expect(said.ru).toMatch(/на той ступени/);
  expect(said.de).toMatch(/Stammton/);
  expect(said.de).not.toMatch(/\bSie\b|Tonart/);
});

test('Written-value options require distinguishing nearby durations, including the shortest values', () => {
  let smallestWins = 0,
    count = 0;
  const forms = new Set();
  for (let seed = 0; seed < 1200; seed++) {
    const item = generateFrom('value-identification', 3, seed, 'en');
    const match = item.figure.match(/^(note|rest)-(\d+)$/);
    if (!match) continue;
    const denominator = Number(match[2]);
    forms.add(item.figure);
    const values = item.options.map((option) =>
      Number(option.label.split('/')[1]),
    );
    expect(values).toContain(denominator / 2);
    if (denominator < 128) expect(values).toContain(denominator * 2);
    expect(new Set(values).size).toBe(4);
    if (Math.max(...values) === denominator) smallestWins++;
    count++;
  }
  expect(forms.size).toBe(10);
  expect(smallestWins / count).toBeLessThan(0.35);
});

test('Metronome answers respect the printed unit and offer distinct positive durations in every locale', () => {
  const units = { '♩': 1 / 4, '♪': 1 / 8, '♩.': 3 / 8, '𝅗𝅥': 1 / 2 };
  const seen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 0; seed < 1600; seed++) {
      const item = generateFrom('performance-marks', 3, seed, lang);
      if (item.rule !== 'metronome-unit' || item.review) continue;
      const [, symbol, tempo] = item.prompt.match(/(♩\.|♩|♪|𝅗𝅥) = (\d+)/);
      const [, numerator, denominator] = item.prompt.match(/(\d+)\/(\d+)/);
      const clicks = Number(numerator) / Number(denominator) / units[symbol];
      const expected = (clicks * 60) / Number(tempo);
      expect(Number(item.answer.replace(',', '.'))).toBeCloseTo(expected, 3);
      const values = item.options.map((option) =>
        Number(option.label.replace(',', '.')),
      );
      expect(values).toHaveLength(4);
      expect(new Set(values).size).toBe(4);
      expect(values.every((value) => Number.isFinite(value) && value > 0)).toBe(
        true,
      );
      for (const option of item.options) {
        expect(option.label).toMatch(
          lang === 'en' ? /^\d+(\.\d+)?$/ : /^\d+(,\d+)?$/,
        );
        expect(grade(item, option.id).correct).toBe(option.id === item.answer);
      }
      seen.add(`${lang}:${symbol}:${tempo}`);
    }
  expect(seen.size).toBe(3 * 4 * 4);
});

test('The metronome explanation counts one click in the singular and contrasts the unit with a quarter only when it is not one', () => {
  // U+1D15E, the half note, is spelled as an escape: it has a canonical
  // decomposition, and an editor that normalizes the file would split it.
  const units = { '♩': 1 / 4, '♪': 1 / 8, '♩.': 3 / 8, '\u{1D15E}': 1 / 2 };
  const counted = {
    en: (clicks) => `= ${clicks} ${clicks === 1 ? 'click' : 'clicks'};`,
    ru: (clicks) => `= ${clicks} (число отсчётов);`,
    de: (clicks) => `= ${clicks} ${clicks === 1 ? 'Schlag' : 'Schläge'};`,
  };
  const notAQuarter = {
    en: ', not a quarter:',
    ru: ', а не четверть:',
    de: ', nicht einer Viertel:',
  };
  const seconds = { en: 's', ru: 'с', de: 's' };
  const seen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (const level of [1, 3])
      for (let seed = 0; seed < 800; seed++) {
        const item = generateFrom('performance-marks', level, seed, lang);
        if (item.rule !== 'metronome-unit' || item.review) continue;
        const [, symbol] = item.prompt.match(/(♩\.|♩|♪|\u{1D15E}) = \d+/u);
        const [, numerator, denominator] = item.prompt.match(/(\d+)\/(\d+)/);
        const clicks = Number(numerator) / Number(denominator) / units[symbol];
        // Level 1 always asks for one click, which used to read “= 1 clicks”
        // and „= 1 Schläge“; Russian dropped the unit after the count.
        if (level === 1) expect(clicks).toBe(1);
        expect(item.explanation, item.prompt).toContain(counted[lang](clicks));
        // “1/4 of a whole note, not necessarily a quarter” contradicted itself.
        expect(item.explanation.includes(notAQuarter[lang]), item.prompt).toBe(
          symbol !== '♩',
        );
        expect(item.explanation).not.toMatch(
          /necessarily|zwingend|обязательно/,
        );
        // “1 seconds” / „1 Sekunden“: the result ends in the unit's symbol.
        expect(item.explanation).not.toMatch(/seconds|Sekunden/);
        expect(
          item.explanation.endsWith(`= ${item.answer} ${seconds[lang]}.`),
          item.explanation,
        ).toBe(true);
        seen.add(`${lang}:${clicks}:${symbol === '♩'}`);
      }
  // One, two and four clicks, with a quarter and with another unit.
  expect(seen.size).toBe(3 * 3 * 2);
});

test('A level-one excerpt puts the right note anywhere among four neighbouring names and calls only a step away the neighbouring step', () => {
  const step = (name) => {
    const [, letter, octave] = name.match(/^([A-G])(\d)$/);
    return 'CDEFGAB'.indexOf(letter) + 7 * Number(octave);
  };
  const places = new Map();
  let count = 0;
  for (let seed = 1; seed <= 300; seed++) {
    const english = generateFrom('short-excerpt', 1, seed, 'en');
    const others = ['ru', 'de'].map((lang) =>
      generateFrom('short-excerpt', 1, seed, lang),
    );
    english.parts.forEach((part, index) => {
      const answer = step(part.answer);
      const steps = part.options.map((option) => step(option.label));
      // Four different lines and spaces next to one another.
      expect(new Set(steps).size).toBe(4);
      expect(Math.max(...steps) - Math.min(...steps)).toBe(3);
      // The answer used to be the second-lowest name in every question, so it
      // could be picked from the labels without reading the staff.
      const below = steps.filter((other) => other < answer).length;
      places.set(below, (places.get(below) ?? 0) + 1);
      count++;
      part.options.forEach((option, at) => {
        const apart = Math.abs(steps[at] - answer);
        // “That is the neighbouring step” used to answer the note two steps
        // away as well, the next line or space of the same kind.
        const tag =
          apart === 0
            ? 'correct'
            : apart === 1
              ? 'wrong-letter'
              : 'wrong-written-note';
        expect(option.tag, `${part.answer} / ${option.label}`).toBe(tag);
        for (const item of others)
          expect(item.parts[index].options[at].tag).toBe(tag);
      });
      expect(part.options.some((option) => option.tag === 'wrong-letter')).toBe(
        true,
      );
    });
    // The same seed still builds the same question.
    expect(generateFrom('short-excerpt', 1, seed, 'en')).toEqual(english);
  }
  expect([...places.keys()].sort((a, b) => a - b)).toEqual([0, 1, 2, 3]);
  for (const share of places.values()) {
    expect(share / count).toBeGreaterThan(0.15);
    expect(share / count).toBeLessThan(0.35);
  }
});

test('Dotted-note and rest questions use grammatical counting units while preserving the duration', () => {
  const cases = new Set();
  const den = {
    whole: 1,
    half: 2,
    quarter: 4,
    eighth: 8,
    sixteenth: 16,
    'thirty-second': 32,
  };
  // A rest carries its own name in each language, as the note beside it does.
  const restName = {
    en: /a (double-)?dotted (whole|half|quarter|eighth) rest\?$/,
    ru: /^Дано: (целая|половинная|четвертная|восьмая) пауза с (точкой|двумя точками)\./,
    de: /eine (doppelt )?punktierte (ganze Pause|halbe Pause|Viertelpause|Achtelpause)\?$/,
  };
  for (const lang of ['en', 'ru', 'de']) {
    for (let seed = 0; seed < 160; seed++) {
      const item = generateFrom('dotted-value', 3, seed, lang);
      if (item.options.length === 2) continue; // The separate bar-overflow variant does not count note units.
      const isDouble = /double-dotted|двумя точками|doppelt/.test(item.prompt);
      const rest = /rest|пауза|[Pp]ause/.test(item.prompt);
      const answer = item.options.find((o) => o.id === item.answer);
      expect(answer.label).toBe(isDouble ? '7' : '3');
      if (rest) expect(item.prompt).toMatch(restName[lang]);
      // Neither form is paraphrased by the fraction of its base value.
      expect(item.prompt).not.toMatch(
        /\d\/\d|base value|основная длительность|Grundwert/,
      );
      if (lang === 'en') {
        const [, unit, , value] = item.prompt.match(
          /^How many (\S+) notes have the same duration as a (double-)?dotted (\S+) (?:note|rest)\?$/,
        );
        // A dotted quarter is three eighths; doubly dotted, seven sixteenths.
        expect(den[unit]).toBe(den[value] * (isDouble ? 4 : 2));
      }
      if (lang === 'en')
        expect(item.prompt).toMatch(
          /^How many (half|quarter|eighth|sixteenth|thirty-second) notes have the same duration as a (double-)?dotted /,
        );
      if (lang === 'ru')
        expect(item.prompt).toMatch(
          /Сколько это (половинных|четвертей|восьмых|шестнадцатых|тридцать вторых)\?/,
        );
      if (lang === 'de')
        expect(item.prompt).toMatch(
          /^Wie viele (halbe Noten|Viertelnoten|Achtelnoten|Sechzehntelnoten|Zweiunddreißigstelnoten) sind zusammen so lang wie eine (doppelt )?punktierte /,
        );
      cases.add(`${lang}:${isDouble}:${rest}`);
    }
  }
  expect(cases.size).toBe(12);
});

test('Tied-value questions name the unit they count in, and the key is the sum in that unit', () => {
  const den = { half: 2, quarter: 4, eighth: 8 };
  const stems = {
    en: /^Two notes of the same pitch are tied: (half|quarter|eighth) note and (half|quarter|eighth) note\. How many (half|quarter|eighth) notes does the tied sound last\?$/,
    ru: /^Две ноты одной высоты соединены связующей лигой: (половинная|четверть|восьмая) и (половинная|четверть|восьмая)\. Сколько (половинных|четвертей|восьмых) длится получившийся звук\?$/,
    de: /^Zwei Noten gleicher Tonhöhe sind übergebunden: (halbe Note|Viertelnote|Achtelnote) und (halbe Note|Viertelnote|Achtelnote)\. Wie viele (halbe Noten|Viertelnoten|Achtelnoten) dauert der Ton insgesamt\?$/,
  };
  const units = new Set();
  for (const level of [1, 2, 3])
    for (let seed = 0; seed < 120; seed++) {
      const english = generateFrom('tie-sum', level, seed, 'en');
      if (english.figure) continue; // The cross-bar variant asks for a fraction.
      const [, first, second, unit] = english.prompt.match(stems.en);
      // 1/first + 1/second, counted in 1/unit, without the generator's help.
      const expected = den[unit] / den[first] + den[unit] / den[second];
      expect(Number.isInteger(expected)).toBe(true);
      for (const lang of ['en', 'ru', 'de']) {
        const item = generateFrom('tie-sum', level, seed, lang);
        expect(item.prompt).toMatch(stems[lang]);
        // The unit used to trail the question as “(quarter note)”.
        expect(item.prompt).not.toMatch(/[()]/);
        expect(item.options.find((o) => o.id === item.answer).label).toBe(
          String(expected),
        );
      }
      units.add(unit);
    }
  expect([...units].sort((a, b) => a.localeCompare(b))).toEqual([
    'eighth',
    'half',
    'quarter',
  ]);
});

test('Cross-bar tie questions name 3/4 as the metre in every language and keep one key', () => {
  const stems = {
    en: /^In this 3\/4 example, give /,
    ru: /^В этом примере в размере 3\/4 укажите /,
    de: /^Gib in diesem 3\/4-Beispiel /,
  };
  const whole = {
    en: 'total duration',
    ru: 'полную длительность',
    de: 'Gesamtdauer',
  };
  const seen = new Set();
  for (const lang of ['en', 'ru', 'de'])
    for (let seed = 0; seed < 120; seed++) {
      const item = generateFrom('tie-sum', 3, seed, lang);
      if (!item.figure) continue;
      expect(item.prompt).toMatch(stems[lang]);
      const total = item.prompt.includes(whole[lang]);
      // Two tied quarters sound for a half note; each bar holds one quarter.
      expect(item.answer).toBe(total ? '1/2' : '1/4');
      // „gebunden“ is the German word for legato, the slur this lesson tells
      // apart from the tie. A tied note is „übergebunden“, in the stem as in
      // the explanation.
      if (lang === 'de')
        for (const text of [item.prompt, item.explanation]) {
          expect(text).toMatch(/übergebunden/);
          expect(text).not.toMatch(/(?<!über)gebunden/);
        }
      seen.add(`${lang}:${total}`);
    }
  expect(seen.size).toBe(6);
});

test('The German bar-remainder question and its two answers mirror each other', () => {
  const seen = new Set();
  for (let seed = 0; seed < 600; seed++) {
    const item = generateFrom('dotted-value', 3, seed, 'de');
    if (item.options.length !== 2) continue;
    const match = item.prompt.match(
      /^Im Takt ist noch Platz für (\d+)\/(\d+) einer ganzen Note\. Passt eine (doppelt )?punktierte (?:Pause|Note) mit dem Grundwert 1\/(\d+) hinein, ohne den Taktstrich zu überschreiten\?$/,
    );
    expect(match, item.prompt).not.toBeNull();
    const [, rn, rd, double, base] = match;
    // A dotted value is 3/2 of its base, a doubly dotted one 7/4.
    const [n, d] = double ? [7, 4 * Number(base)] : [3, 2 * Number(base)];
    const fits = n * Number(rd) <= d * Number(rn);
    expect(
      item.options.map((o) => o.label).sort((a, b) => a.localeCompare(b)),
    ).toEqual(['Passt', 'Passt nicht']);
    expect(item.options.find((o) => o.id === item.answer).label).toBe(
      fits ? 'Passt' : 'Passt nicht',
    );
    seen.add(fits);
  }
  expect(seen.size).toBe(2);
});

test('Answer order does not preserve a fixed cyclic offset from a double-flat landmark', () => {
  const offsets = new Map();
  let count = 0;
  for (let seed = 0; seed < 1600; seed++) {
    const item = generateFrom('accidental-scope', 3, seed, 'en');
    const landmark = item.options.findIndex((option) =>
      option.label.includes('𝄫'),
    );
    const answer = item.options.findIndex(
      (option) => option.id === item.answer,
    );
    if (landmark < 0 || landmark === answer) continue;
    const offset =
      (answer - landmark + item.options.length) % item.options.length;
    offsets.set(offset, (offsets.get(offset) ?? 0) + 1);
    count++;
  }
  expect(offsets.size).toBe(4);
  expect(Math.max(...offsets.values()) / count).toBeLessThan(0.4);
});

test('An octave error in a mixed excerpt is not described as a wrong accidental', () => {
  for (let seed = 0; seed < 100; seed++) {
    const english = generateFrom('short-excerpt', 3, seed, 'en');
    for (const lang of ['en', 'ru', 'de']) {
      const item = generateFrom('short-excerpt', 3, seed, lang);
      english.parts.forEach((part, index) => {
        if (part.kind !== 'pitch') return;
        const [, name, octave] = part.answer.match(/^(.*?)(\d+)$/);
        const neighbour = part.options.findIndex(
          (option) => option.label === `${name}${Number(octave) + 1}`,
        );
        expect(neighbour).toBeGreaterThanOrEqual(0);
        expect(item.parts[index].options[neighbour].tag).toBe(
          'neighbour-register',
        );
      });
    }
  }
});
