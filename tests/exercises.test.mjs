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
        text.replace(/\b(?:pppp|ffff)\b/g, ''),
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
