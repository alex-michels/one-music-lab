import { expect, test, vi } from 'vitest';
import * as exercises from '../lib/exercises.ts';
import {
  coachingSchema,
  emptyCoaching,
  emptyCoachingRow,
  recordAttempt,
  dueQuestion,
  itemForRule,
  problemSignature,
  nextSeed,
  MAX_SEED,
  HEARING_KEYS,
  hearingQuestion,
} from '../lib/practice-coach.ts';
import { practiceHints, hearingHints } from '../lib/practice-hints.ts';
import {
  emptyProfile,
  parseBackup,
  serializeProfile,
  createProfileStore,
  PROFILE_KEY,
  profileStore,
  saveAnswers,
  saveHearing,
} from '../lib/local-profile.ts';
import { readFileSync } from 'node:fs';

const failed = { correct: false, assisted: false, seed: 1, check: false };
const correct = { ...failed, correct: true };
test('A later check requires three intervening completions and a changed problem; an ordinary correct answer does not clear it', () => {
  let rows = recordAttempt({}, 'natural-name', failed);
  const original = structuredClone(rows);
  for (let i = 0; i < 3; i++) {
    expect(dueQuestion(rows, ['natural-name'])).toBe(null);
    rows = recordAttempt(rows, 'dot-adds-half', correct);
  }
  expect(original['natural-name'].pending.remaining).toBe(3);
  const due = dueQuestion(rows, ['natural-name']);
  expect(due.rule).toBe('natural-name');
  expect(due.check).toBe(true);
  expect(problemSignature(itemForRule(due.rule, due.seed, 'en'))).not.toBe(
    problemSignature(itemForRule(due.rule, 1, 'en')),
  );
  expect(dueQuestion(rows, ['dot-adds-half'])).toBe(null);
  rows = recordAttempt(rows, due.rule, { ...correct, seed: 1 });
  expect(rows[due.rule].pending.remaining).toBe(0);
  rows = recordAttempt(rows, due.rule, {
    ...correct,
    seed: due.seed,
    check: true,
  });
  expect(rows[due.rule].pending).toBe(null);
  expect(rows[due.rule].checks).toEqual({ asked: 1, correct: 1 });
  expect(rows[due.rule].independent).toEqual({ asked: 3, correct: 2 });
});
test('Hints and failed checks remain distinct from independent success and reschedule the current example', () => {
  let rows = recordAttempt({}, 'a', { ...correct, assisted: true });
  expect(rows.a.assisted).toEqual({ asked: 1, correct: 1 });
  expect(rows.a.independent.asked).toBe(0);
  for (let i = 0; i < 3; i++) rows = recordAttempt(rows, 'b', correct);
  rows = recordAttempt(rows, 'a', {
    ...correct,
    assisted: true,
    check: true,
    seed: 102,
  });
  expect(rows.a.checks).toEqual({ asked: 1, correct: 0 });
  expect(rows.a.pending).toEqual({ remaining: 3, seed: 102 });
  rows = recordAttempt(rows, 'a', { ...failed, assisted: true, seed: 203 });
  expect(rows.a.assisted).toEqual({ asked: 3, correct: 2 });
  expect(rows.a.pending.seed).toBe(203);
});
test('Immediate retries, the original seed and a fabricated check without a queue do not count as later checks', () => {
  let rows = recordAttempt({}, 'a', { ...correct, check: true });
  expect(rows.a.checks.asked).toBe(0);
  rows = recordAttempt(rows, 'a', failed);
  rows = recordAttempt(rows, 'a', { ...correct, seed: 102, check: true });
  expect(rows.a.checks.asked).toBe(0);
  rows = recordAttempt(rows, 'a', correct);
  rows = recordAttempt(rows, 'a', correct);
  rows = recordAttempt(rows, 'a', { ...correct, check: true });
  expect(rows.a.checks.asked).toBe(0);
  expect(rows.a.pending.remaining).toBe(0);
});
test('Counters saturate without rounding; a pending task still advances', () => {
  const full = {
    asked: Number.MAX_SAFE_INTEGER,
    correct: Number.MAX_SAFE_INTEGER,
  };
  const row = {
    ...emptyCoachingRow(),
    independent: full,
    assisted: full,
    checks: full,
    pending: { remaining: 0, seed: 1 },
  };
  for (const assisted of [false, true]) {
    const next = recordAttempt({ a: row }, 'a', {
      ...correct,
      check: true,
      seed: 102,
      assisted,
    });
    expect(next.a.independent).toEqual(full);
    expect(next.a.assisted).toEqual(full);
    expect(next.a.checks).toEqual(full);
  }
  expect(nextSeed(MAX_SEED)).toBe(101);
});
test('Every scored rule can produce a changed problem, independent of locale and choice order', () => {
  for (const rule of exercises.RULES) {
    const item = itemForRule(rule, 1, 'en');
    expect(item.rule).toBe(rule);
    const row = { ...emptyCoachingRow(), pending: { remaining: 0, seed: 1 } };
    if (item.review) {
      expect(dueQuestion({ [rule]: row }, [rule])).toBe(null);
      continue;
    }
    const due = dueQuestion({ [rule]: row }, [rule]);
    expect(due, rule).not.toBe(null);
    const signature = problemSignature(item);
    for (const lang of ['ru', 'de'])
      expect(problemSignature(itemForRule(rule, 1, lang))).toBe(signature);
    expect(
      problemSignature({ ...item, options: [...item.options].reverse() }),
    ).toBe(signature);
    expect(problemSignature(itemForRule(rule, due.seed, 'en'))).not.toBe(
      signature,
    );
  }
  for (const hints of [...Object.values(practiceHints), hearingHints]) {
    expect(hints.length).toBe(2);
    for (const hint of hints)
      for (const lang of ['en', 'ru', 'de'])
        expect(hint[lang].length).toBeGreaterThan(15);
  }
});
test('A generator with no new example does not falsely certify transfer, and a missing rule fails explicitly', () => {
  const item = itemForRule('natural-name', 1, 'en');
  const spy = vi.spyOn(exercises, 'generateFrom').mockReturnValue(item);
  try {
    expect(
      dueQuestion(
        {
          'natural-name': {
            ...emptyCoachingRow(),
            pending: { remaining: 0, seed: 1 },
          },
        },
        ['natural-name'],
      ),
    ).toBe(null);
    expect(() => itemForRule('register-1', 1, 'en')).toThrow(
      'No question found',
    );
  } finally {
    spy.mockRestore();
  }
});
test('Later checks avoid recently completed problems as well as the example that scheduled them', () => {
  const rule = 'natural-name';
  const recent = [102, 203, 304, 405];
  const row = {
    ...emptyCoachingRow(),
    recent,
    pending: { remaining: 0, seed: 1 },
  };
  const due = dueQuestion({ [rule]: row }, [rule]);
  const used = [1, ...recent].map((seed) =>
    problemSignature(itemForRule(rule, seed, 'en')),
  );
  expect(used).not.toContain(
    problemSignature(itemForRule(rule, due.seed, 'en')),
  );
  const updated = recordAttempt({ [rule]: row }, rule, {
    ...correct,
    seed: due.seed,
    check: true,
  });
  expect(updated[rule].recent).toEqual([203, 304, 405, due.seed]);
  expect(() =>
    coachingSchema.parse({
      ...emptyCoaching(),
      knowledge: { [rule]: { ...row, recent: [1, 2, 3, 4, 5] } },
    }),
  ).toThrow();
});
test('Hearing checks transpose the original root, including the top boundary, without affecting knowledge', () => {
  expect(hearingQuestion({}, 2, 60)).toEqual({
    index: 2,
    root: 60,
    check: false,
  });
  for (const root of [57, 68]) {
    const rows = {
      octave: { ...emptyCoachingRow(), pending: { remaining: 0, seed: root } },
    };
    const q = hearingQuestion(rows, 0, root);
    expect(q.index).toBe(3);
    expect(q.root).not.toBe(root);
    expect(q.root).toBeGreaterThanOrEqual(57);
    expect(q.root).toBeLessThanOrEqual(68);
    expect(hearingQuestion(rows, 0, 61)).toEqual({
      index: 3,
      root: 61,
      check: true,
    });
  }
});
test('Current backups keep both queues and reflection; version 1 migrates without inventing independent or listening results', () => {
  const v1 = readFileSync(
    new URL('./fixtures/local-profile-v1.json', import.meta.url),
    'utf8',
  );
  const values = new Map([[PROFILE_KEY, v1]]);
  const access = {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
  const store = createProfileStore(
    () => access,
    () => null,
  );
  expect(store.getSnapshot().profile.coaching).toEqual(emptyCoaching());
  expect(store.getSnapshot().profile.answers).toEqual(JSON.parse(v1).answers);
  expect(
    store.update((p) => ({
      ...p,
      coaching: {
        knowledge: recordAttempt({}, 'natural-name', failed),
        hearing: recordAttempt({}, 'octave', { ...failed, seed: 68 }),
        creative: {
          intention: 'met',
          comparison: 'revisit',
          explanation: 'met',
        },
      },
    })),
  ).toBe(true);
  const saved = values.get(PROFILE_KEY);
  expect(parseBackup(saved).version).toBe(2);
  expect(serializeProfile(parseBackup(saved))).toBe(saved);
  expect(
    createProfileStore(
      () => access,
      () => null,
    ).getSnapshot().profile,
  ).toEqual(store.getSnapshot().profile);
  expect(() =>
    parseBackup(
      JSON.stringify({ ...JSON.parse(v1), answers: { unknown: {} } }),
    ),
  ).toThrow();
});
test('Invalid, unknown, oversized and impossible coaching data is refused', () => {
  for (const update of [
    (p) => (p.coaching.knowledge.unknown = emptyCoachingRow()),
    (p) => (p.coaching.hearing.unknown = emptyCoachingRow()),
    (p) =>
      (p.coaching.creative = {
        intention: 'perfect',
        comparison: 'met',
        explanation: 'met',
      }),
    ...[-1, 1.5, Number.MAX_SAFE_INTEGER + 1].map(
      (n) => (p) =>
        (p.coaching.knowledge['natural-name'].independent.asked = n),
    ),
    (p) => (p.coaching.knowledge['natural-name'].independent.correct = 1),
    (p) => (p.coaching.knowledge['natural-name'].pending.remaining = 4),
    (p) => (p.coaching.knowledge['natural-name'].pending.seed = 0),
    (p) => (p.coaching.knowledge['natural-name'].pending.seed = MAX_SEED + 1),
    (p) =>
      (p.coaching.hearing.octave = {
        ...emptyCoachingRow(),
        pending: { remaining: 0, seed: 56 },
      }),
    (p) =>
      (p.coaching.hearing.octave = {
        ...emptyCoachingRow(),
        pending: { remaining: 0, seed: 69 },
      }),
  ]) {
    const p = emptyProfile();
    p.coaching.knowledge['natural-name'] = {
      ...emptyCoachingRow(),
      pending: { remaining: 3, seed: 1 },
    };
    update(p);
    expect(() => parseBackup(JSON.stringify(p))).toThrow();
  }
  const all = emptyCoaching();
  for (const rule of exercises.RULES) all.knowledge[rule] = emptyCoachingRow();
  for (const key of HEARING_KEYS)
    all.hearing[key] = {
      ...emptyCoachingRow(),
      pending: { remaining: 0, seed: 60 },
    };
  expect(coachingSchema.parse(all)).toEqual(all);
});
test('Multipart knowledge counts once, empty rubrics never score, and hearing writes to its own channel', () => {
  const values = new Map();
  vi.stubGlobal('localStorage', {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  });
  try {
    profileStore.replace(emptyProfile());
    saveAnswers('natural-name', [], correct);
    expect(profileStore.getSnapshot().profile.coaching).toEqual(
      emptyCoaching(),
    );
    saveAnswers(
      'read-a-short-excerpt',
      [
        { correct: true, tag: 'correct' },
        { correct: false, tag: 'duration-symbol' },
      ],
      failed,
    );
    saveHearing('octave', { ...correct, seed: 60 });
    const p = profileStore.getSnapshot().profile;
    expect(p.answers['read-a-short-excerpt'].asked).toBe(2);
    expect(p.coaching.knowledge['read-a-short-excerpt'].independent).toEqual({
      asked: 1,
      correct: 0,
    });
    expect(p.coaching.hearing.octave.independent).toEqual({
      asked: 1,
      correct: 1,
    });
    expect(p.coaching.knowledge['read-a-short-excerpt'].pending.remaining).toBe(
      3,
    );
  } finally {
    vi.unstubAllGlobals();
  }
});
