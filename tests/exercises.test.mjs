import { test } from 'vitest';
import assert from 'node:assert/strict';
import { exerciseExplanations } from '../lib/learning.ts';
import {
  add,
  countIn,
  dotted,
  equal,
  exerciseKinds,
  generate,
  generateFrom,
  grade,
  reduce,
} from '../lib/exercises.ts';

const LANGS = ['en', 'ru', 'de'];
const LEVELS = [1, 2, 3];
const SEEDS = 250;

test('Enharmonic questions state both the source pitch and the required new spelling', () => {
  const examples = [
    ['en', 'A♭4', 'G♯4', 'F♯4', 'G♭4'],
    [
      'ru',
      'ля-бемоль, первая октава',
      'соль-диез, первая октава',
      'фа-диез, первая октава',
      'соль-бемоль, первая октава',
    ],
    ['de', 'as′', 'gis′', 'fis′', 'ges′'],
  ];
  for (const [
    lang,
    firstSource,
    firstAnswer,
    secondSource,
    secondAnswer,
  ] of examples) {
    for (const [seed, source, answer] of [
      [3, firstSource, firstAnswer],
      [10, secondSource, secondAnswer],
    ]) {
      const item = generateFrom('enharmonic', 1, seed, lang);
      assert.ok(item.prompt.includes(source), item.prompt);
      assert.equal(
        item.options.find((o) => o.id === item.answer).label,
        answer,
      );
      assert.match(item.prompt, /12|двенадцати/);
    }
  }
});

test('Every enharmonic key keeps the sound and sits on the requested step; the Russian stem is a full sentence', () => {
  const semitone = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const shift = { '𝄫': -2, '♭': -1, '': 0, '♯': 1, '𝄪': 2 };
  // Scientific pitch notation read back into a key number, without the model.
  const midi = (label) => {
    const [, letter, sign, octave] = label.match(/^([A-G])(𝄫|♭|♯|𝄪|)(\d)$/u);
    return (Number(octave) + 1) * 12 + semitone[letter] + shift[sign];
  };
  const russian =
    /^Исходная нота: ((?:до|ре|ми|фа|соль|ля|си)-(?:дубль-)?(?:диез|бемоль)), первая октава\. Замените её энгармонически равной нотой от основной ступени (до|ре|ми|фа|соль|ля|си) \(двенадцатиступенная равномерная темперация\)\.$/;
  let checked = 0;
  for (const level of LEVELS)
    for (let seed = 1; seed <= 150; seed += 1) {
      const en = generate('enharmonic', level, seed, 'en');
      const ru = generate('enharmonic', level, seed, 'ru');
      assert.equal(en === null, ru === null);
      if (!en) continue;
      const [, source, letter] = en.prompt.match(
        /^Respell (\S+) using the letter ([A-G]), keeping the sounding pitch \(12-tone equal temperament\)\.$/,
      );
      const key = en.options.find((o) => o.id === en.answer).label;
      assert.equal(key[0], letter, en.prompt);
      assert.equal(midi(key), midi(source), `${source} is not ${key}`);
      assert.notEqual(key, source);
      const stem = ru.prompt.match(russian);
      assert.ok(stem, ru.prompt);
      const name = ru.options
        .find((o) => o.id === ru.answer)
        .label.split(',')[0];
      assert.ok(
        name === stem[2] || name.startsWith(`${stem[2]}-`),
        `${name} is not written on ${stem[2]}`,
      );
      checked += 1;
    }
  assert.ok(checked > 150, `only ${checked} enharmonic items were checked`);
});

test('A natural note is asked for through its neighbour and is never printed in its own question', () => {
  const series = {
    en: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    ru: ['до', 'ре', 'ми', 'фа', 'соль', 'ля', 'си'],
    de: ['C', 'D', 'E', 'F', 'G', 'A', 'H'],
  };
  const stems = {
    en: /^Which natural note is the next one (?<side>above|below) (?<given>[A-G])\?$/,
    ru: /^Назовите основную ступень, соседнюю с нотой (?<given>до|ре|ми|фа|соль|ля|си) (?<side>сверху|снизу)\.$/,
    de: /^Welcher Stammton liegt eine Stufe (?<side>über|unter) (?<given>[A-H])\?$/,
  };
  const upward = { en: 'above', ru: 'сверху', de: 'über' };
  for (const lang of LANGS) {
    const names = series[lang];
    const apart = (a, b) => (names.indexOf(a) - names.indexOf(b) + 7) % 7;
    const adjacent = (a, b) => [1, 6].includes(apart(a, b));
    const seen = new Set();
    const rules = new Set();
    for (const level of LEVELS)
      for (let seed = 1; seed <= 200; seed += 1) {
        const item = generate('accidental-name', level, seed, lang);
        rules.add(`${level}:${item.rule}`);
        if (item.rule !== 'natural-name') {
          // An altered stem describes a change, never the absence of one.
          assert.match(
            item.prompt,
            /lowered|raised|пониженная|повышенная|erniedrigt|erhöht/,
          );
          continue;
        }
        const stem = item.prompt.match(stems[lang]);
        assert.ok(stem, item.prompt);
        const { given, side } = stem.groups;
        assert.ok(names.includes(given), item.prompt);
        const up = side === upward[lang];
        // The series wraps: above B (German H, Russian си) comes C again.
        const expected = names[(names.indexOf(given) + (up ? 1 : 6)) % 7];
        const answer = item.options.find((o) => o.id === item.answer).label;
        assert.equal(answer, expected, item.prompt);
        assert.notEqual(answer, given);
        assert.equal(item.options.length, 4);
        for (const option of item.options) {
          assert.ok(names.includes(option.label), option.label);
          if (option.id === item.answer) continue;
          // The feedback calls a wrong choice “the neighbouring step”, so
          // each one has to be a step away from the answer or the given note.
          assert.equal(option.tag, 'wrong-letter');
          assert.ok(
            adjacent(option.label, answer) || adjacent(option.label, given),
            `${option.label} is no neighbour in: ${item.prompt}`,
          );
        }
        if (lang === 'ru')
          assert.ok(item.promptMarkup.includes(`[[${given}]]`), item.prompt);
        seen.add(`${given}:${up}`);
      }
    assert.equal(seen.size, 14, `${lang} asked ${seen.size} of 14 neighbours`);
    // Level 1 has no altered notes at all; the higher levels mix both rules.
    assert.ok(!rules.has('1:alteration-name'));
    for (const rule of [
      '2:natural-name',
      '2:alteration-name',
      '3:natural-name',
    ])
      assert.ok(rules.has(rule), `${lang} never produced ${rule}`);
  }
});

test('A tuplet explanation says whose time the group takes, in a form that fits every ratio', () => {
  const sentence = {
    en: (count, regular) =>
      `the ${count} notes of the group take the time of ${regular} ordinary notes of the same written value`,
    ru: (count, regular) =>
      `группа из ${count} нот занимает время ${regular} обычных нот той же записанной длительности`,
    de: (count, regular) =>
      `dauern die ${count} Noten der Gruppe so lang wie ${regular} gewöhnliche Noten desselben Notenwerts`,
  };
  for (const lang of LANGS) {
    const ratios = new Set();
    for (let seed = 1; seed <= 400; seed += 1) {
      const item = generate('tuplet', 3, seed, lang);
      if (item.figure) continue;
      const [, count, regular] = item.prompt.match(/(\d+):(\d+)/);
      assert.ok(
        item.explanation.includes(sentence[lang](count, regular)),
        item.explanation,
      );
      // «2 записанных длительностей» was grammatical for the ratios in 8 only.
      assert.doesNotMatch(item.explanation, /записанных длительностей/);
      ratios.add(`${count}:${regular}`);
    }
    assert.equal(ratios.size, 9, `${lang} explained ${ratios.size} ratios`);
  }
});

test('Tuplets explicitly ask for notation within the stated ratio, not ordinary sounding duration', () => {
  for (const [lang, notation, answer] of [
    ['en', /basic note value/, 'eighth note'],
    ['ru', /базов.*длительност/, 'восьмая'],
    ['de', /Notenwert.*notiert/, 'Achtelnote'],
  ]) {
    const item = generateFrom('tuplet', 1, 1, lang);
    assert.match(item.prompt, /3:2/);
    assert.match(item.prompt, notation);
    assert.equal(item.options.find((o) => o.id === item.answer).label, answer);
  }
});

test('The tuplet value that is twice too long is answered with a division that gives the right one for every ratio', () => {
  // Denominators read off the option labels, without the generator's tables.
  const den = {
    'whole note': 1,
    'half note': 2,
    'quarter note': 4,
    'eighth note': 8,
    'sixteenth note': 16,
    'thirty-second note': 32,
  };
  const ratios = new Set();
  for (let seed = 1; seed <= 400; seed += 1) {
    const item = generate('tuplet', 3, seed, 'en');
    if (item.figure) continue;
    const [, base, ratio, regular] = item.prompt.match(
      /^Starting value: (.+?)\. Equal parts: \d+, written as a (\d+:(\d+)) tuplet\./,
    );
    const answer = item.options.find((o) => o.id === item.answer).label;
    // The feedback's own instruction, carried out by hand: the starting value
    // divided by the second number of the ratio.
    assert.equal(den[answer], den[base] * Number(regular), item.prompt);
    const long = item.options.find((o) => o.tag === 'one-step-too-long');
    assert.ok(long, item.prompt);
    // “Twice as long” is literal, in 3:2 as much as in 7:8.
    assert.equal(den[long.label] * 2, den[answer], item.prompt);
    assert.equal(grade(item, long.id).correct, false);
    assert.equal(grade(item, long.id).tag, 'one-step-too-long');
    ratios.add(ratio);
  }
  assert.equal(ratios.size, 9, `only ${ratios.size} ratios were checked`);
  // The sentence used to send the reader to “the next larger regular
  // division”. For 7:8 that is the very option it had just marked wrong.
  const says = {
    en: [/twice as long/, /second number of the ratio/],
    ru: [/вдвое/, /второе число отношения/],
    de: [/doppelt so lang/, /zweite Zahl des Verhältnisses/],
  };
  for (const lang of LANGS) {
    const sentence = exerciseExplanations['one-step-too-long'][lang];
    for (const part of says[lang]) assert.match(sentence, part);
    assert.doesNotMatch(
      sentence,
      /next larger|one step|ближайшей большей|на ступень|nächstgrößeren|eine Stufe/,
    );
  }
});

test('Russian register questions require an octave movement instead of stating the answer', () => {
  for (let seed = 1; seed <= 120; seed++) {
    const item = generateFrom('octave-region', 1, seed, 'ru');
    const answer = item.options.find((o) => o.id === item.answer).label;
    assert.ok(!item.prompt.includes(answer), item.prompt);
    assert.match(item.prompt, /выше|ниже/);
  }
});

test('Double-dot feedback distinguishes omitting the second dot from omitting both', () => {
  for (const lang of LANGS) {
    const item = generateFrom('dotted-value', 3, 5, lang);
    assert.equal(item.options.find((o) => o.id === item.answer).label, '7');
    assert.equal(
      grade(item, item.options.find((o) => o.label === '6').id).tag,
      'forgot-second-dot',
    );
    assert.equal(
      grade(item, item.options.find((o) => o.label === '4').id).tag,
      'forgot-the-dot',
    );
    assert.ok(exerciseExplanations['forgot-second-dot'][lang].length > 20);
  }
});

/** Every kind, level, language and seed the suite walks. */
function* everyItem(seeds = SEEDS) {
  for (const kind of exerciseKinds)
    for (const level of LEVELS)
      for (const lang of LANGS)
        for (let seed = 1; seed <= seeds; seed += 1) {
          const item = generate(kind, level, seed, lang);
          if (item) yield item;
        }
}

test('Durations are exact ratios and the dot adds half its own value', () => {
  assert.deepEqual(reduce({ num: 2, den: 8 }), { num: 1, den: 4 });
  // A dotted quarter is three eighths, stated independently of the implementation.
  assert.ok(equal(dotted({ num: 1, den: 4 }, 1), { num: 3, den: 8 }));
  // A double dotted quarter is a quarter plus an eighth plus a sixteenth.
  assert.ok(
    equal(
      dotted({ num: 1, den: 4 }, 2),
      add(add({ num: 1, den: 4 }, { num: 1, den: 8 }), { num: 1, den: 16 }),
    ),
  );
  assert.equal(countIn({ num: 3, den: 8 }, { num: 1, den: 8 }), 3);
  assert.equal(countIn({ num: 3, den: 8 }, { num: 1, den: 16 }), 6);
  // A unit that does not divide the value has no whole answer, and the
  // generator relies on that to refuse an ambiguous item.
  assert.equal(countIn({ num: 3, den: 8 }, { num: 1, den: 4 }), null);
});

test('The same seed always builds the same item', () => {
  for (const kind of exerciseKinds)
    for (const lang of LANGS) {
      const first = generate(kind, 2, 4242, lang);
      const second = generate(kind, 2, 4242, lang);
      assert.deepEqual(first, second, `${kind}/${lang} is not reproducible`);
    }
});

test('Every item has exactly one correct option and no duplicate labels', () => {
  let counted = 0;
  for (const item of everyItem()) {
    if (item.review) {
      assert.equal(item.options.length, 0);
      assert.equal(item.answer, '');
      continue;
    }
    counted += 1;
    const correct = item.options.filter((o) => o.tag === 'correct');
    assert.equal(
      correct.length,
      1,
      `${item.kind} seed ${item.seed} has ${correct.length} correct options`,
    );
    assert.equal(correct[0].id, item.answer);
    const labels = item.options.map((o) => o.label);
    assert.equal(
      new Set(labels).size,
      labels.length,
      `${item.kind} seed ${item.seed} repeats an option label: ${labels.join(' / ')}`,
    );
    assert.ok(item.options.length >= 2, `${item.kind} needs a real choice`);
  }
  assert.ok(counted > 5000, `only ${counted} items were checked`);
});

test('No rendered string leaks a placeholder, an undefined or another language', () => {
  // The German catalog and the Russian names share no ASCII letters with each
  // other, so a leak between them is visible without listing every word.
  for (const item of everyItem(60)) {
    const text = [item.prompt, ...item.options.map((o) => o.label)].join(' | ');
    assert.doesNotMatch(
      text,
      /\{|\}/,
      `${item.kind} left a placeholder: ${text}`,
    );
    assert.doesNotMatch(text, /undefined|NaN/, `${item.kind}: ${text}`);
    assert.ok(text.trim().length > 0);
    if (item.lang === 'ru')
      assert.doesNotMatch(
        // Marks a score prints in Italian whatever the language around it:
        // the dynamics everywhere, the tempo marks only under the one figure
        // that prints them.
        text
          .replace(/\b(?:pppp|ffff)\b/g, '')
          .replace(
            item.figure === 'tempo-return' ? /\b[Tt]empo\b/g : /(?!)/g,
            '',
          ),
        /[A-Za-z]{4,}/,
        `Russian item shows a latin word: ${text}`,
      );
  }
});

test('Grading returns a tag for every option, and only the answer is correct', () => {
  for (const item of everyItem(40)) {
    if (item.review) {
      assert.throws(() => grade(item, 'anything'), /Reflection/);
      continue;
    }
    let corrects = 0;
    for (const option of item.options) {
      const verdict = grade(item, option.id);
      assert.ok(typeof verdict.tag === 'string' && verdict.tag.length > 0);
      if (verdict.correct) corrects += 1;
      else
        assert.notEqual(
          verdict.tag,
          'correct',
          `${item.kind} tags a wrong option as correct`,
        );
    }
    assert.equal(corrects, 1);
    assert.throws(() => grade(item, 'zz'), RangeError);
  }
});

test('An item never offers the same sounding pitch twice under two spellings', () => {
  // The one case where two different labels would both be right: an enharmonic
  // item must not offer the prompt's own spelling as a distractor with the same
  // written letter, and must never offer two names for the same written note.
  for (let seed = 1; seed <= 400; seed += 1)
    for (const lang of LANGS) {
      const item = generate('enharmonic', 3, seed, lang);
      if (!item) continue;
      const labels = item.options.map((o) => o.label);
      assert.equal(new Set(labels).size, labels.length);
    }
});

test('Refused seeds are skipped rather than repaired', () => {
  // generate() returns null where the spelling would need a triple accidental;
  // generateFrom() steps forward instead of clamping the pitch into range.
  let refused = 0;
  for (let seed = 1; seed <= 400; seed += 1)
    if (!generate('enharmonic', 3, seed, 'de')) refused += 1;
  assert.ok(refused > 0, 'the guard never fired, so it is not being tested');
  for (let seed = 1; seed <= 50; seed += 1) {
    const item = generateFrom('enharmonic', 3, seed, 'de');
    assert.equal(item.kind, 'enharmonic');
    assert.ok(item.seed >= seed);
  }
});

test('Each language names notes in its own system only', () => {
  const german = [];
  const english = [];
  const russian = [];
  for (let seed = 1; seed <= 200; seed += 1) {
    for (const kind of ['accidental-name', 'enharmonic']) {
      const de = generate(kind, 3, seed, 'de');
      const en = generate(kind, 3, seed, 'en');
      const ru = generate(kind, 3, seed, 'ru');
      if (de) german.push(...de.options.map((o) => o.label));
      if (en) english.push(...en.options.map((o) => o.label));
      if (ru) russian.push(...ru.options.map((o) => o.label));
    }
  }
  // German writes H and never uses B for the English natural; English never
  // writes H at all. This is the trap the whole language rule exists to avoid.
  assert.ok(
    german.some((n) => n.startsWith('H')),
    'German never produced H',
  );
  assert.ok(
    english.every((n) => !n.startsWith('H')),
    'An English option was named with the German H',
  );
  assert.ok(
    english.some((n) => n.startsWith('B')),
    'English never produced B',
  );
  assert.ok(
    russian.every((n) => /^[а-яё]/i.test(n)),
    'A Russian option was not a Russian note name',
  );
});

test('Level widens what an item may use, and never narrows it', () => {
  // Level 1 alteration items stay on naturals and simple signs; level 3 may
  // reach the double accidentals. Asserted over the labels, not the internals.
  const doubleSigns = { en: /𝄫|𝄪/, ru: /дубль/, de: /isis|eses/ };
  for (const lang of LANGS) {
    let seenAtThree = false;
    for (let seed = 1; seed <= 300; seed += 1) {
      const one = generate('accidental-name', 1, seed, lang);
      if (one)
        assert.doesNotMatch(
          one.options.find((o) => o.tag === 'correct').label,
          doubleSigns[lang],
          `level 1 offered a double accidental as the answer in ${lang}`,
        );
      const three = generate('accidental-name', 3, seed, lang);
      if (
        three &&
        doubleSigns[lang].test(
          three.options.find((o) => o.tag === 'correct').label,
        )
      )
        seenAtThree = true;
    }
    assert.ok(
      seenAtThree,
      `level 3 never reached a double accidental in ${lang}`,
    );
  }
});
