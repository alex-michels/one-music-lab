import { z } from 'zod';
import {
  generateFrom,
  RULES,
  type Item,
  type Level,
  type Rule,
} from './exercises';
import { ruleKind } from './topics';
import type { Lang } from './client-store';

// Three intervening completed questions is a product rule, not a claim about
// optimal spacing or durable mastery. Each channel advances independently.
export const REVIEW_GAP = 3;
export const MAX_SEED = 2_000_000_000;
export const HEARING_KEYS = [
  'minor-third',
  'major-third',
  'fifth',
  'octave',
] as const;
const counter = z.number().int().min(0).max(Number.MAX_SAFE_INTEGER);
const score = z
  .strictObject({ asked: counter, correct: counter })
  .refine((value) => value.correct <= value.asked);
export const coachingRowSchema = z.strictObject({
  independent: score,
  assisted: score,
  checks: score,
  recent: z.array(z.number().int().min(1).max(MAX_SEED)).max(4),
  pending: z
    .strictObject({
      remaining: z.number().int().min(0).max(REVIEW_GAP),
      seed: z.number().int().min(1).max(MAX_SEED),
    })
    .nullable(),
});
export const reflectionSchema = z.strictObject({
  intention: z.enum(['revisit', 'met']),
  comparison: z.enum(['revisit', 'met']),
  explanation: z.enum(['revisit', 'met']),
});
export const coachingSchema = z.strictObject({
  knowledge: z.partialRecord(z.enum(RULES), coachingRowSchema),
  hearing: z.partialRecord(
    z.enum(HEARING_KEYS),
    coachingRowSchema.refine(
      (row) =>
        row.pending === null ||
        (row.pending.seed >= 57 && row.pending.seed <= 68),
    ),
  ),
  creative: reflectionSchema.nullable(),
});
export type CoachingRow = z.infer<typeof coachingRowSchema>;
export type Coaching = z.infer<typeof coachingSchema>;
export type Reflection = z.infer<typeof reflectionSchema>;
export type Attempt = {
  correct: boolean;
  assisted: boolean;
  seed: number;
  check: boolean;
};
export const emptyCoaching = (): Coaching => ({
  knowledge: {},
  hearing: {},
  creative: null,
});
export const emptyCoachingRow = (): CoachingRow => ({
  independent: { asked: 0, correct: 0 },
  assisted: { asked: 0, correct: 0 },
  checks: { asked: 0, correct: 0 },
  recent: [],
  pending: null,
});
function add(score: CoachingRow['independent'], correct: boolean) {
  if (score.asked === Number.MAX_SAFE_INTEGER) return score;
  return { asked: score.asked + 1, correct: score.correct + Number(correct) };
}
export function recordAttempt<K extends string>(
  rows: Partial<Record<K, CoachingRow>>,
  key: K,
  attempt: Attempt,
): Partial<Record<K, CoachingRow>> {
  const next = { ...rows };
  for (const id of Object.keys(next) as K[]) {
    const row = next[id]!;
    if (row.pending)
      next[id] = {
        ...row,
        pending: {
          ...row.pending,
          remaining: Math.max(0, row.pending.remaining - 1),
        },
      };
  }
  const before = rows[key] ?? emptyCoachingRow();
  const row = next[key] ?? before;
  const check =
    attempt.check &&
    before.pending?.remaining === 0 &&
    before.pending.seed !== attempt.seed;
  const passed = attempt.correct && !attempt.assisted;
  next[key] = {
    ...row,
    recent: [...row.recent, attempt.seed].slice(-4),
    [attempt.assisted ? 'assisted' : 'independent']: add(
      attempt.assisted ? row.assisted : row.independent,
      attempt.correct,
    ),
    checks: check ? add(row.checks, passed) : row.checks,
    pending: !passed
      ? { remaining: REVIEW_GAP, seed: attempt.seed }
      : check
        ? null
        : row.pending,
  };
  return next;
}

/** Search the existing generator, preserving the rule and rotating complexity. */
export function itemForRule(rule: Rule, seed: number, lang: Lang): Item {
  const firstLevel = Math.floor((seed - 1) / 101) % 3;
  for (let i = 0; i < 256; i += 1) {
    const level = (((firstLevel + i) % 3) + 1) as Level;
    const item = generateFrom(ruleKind[rule], level, seed + i * 31, lang);
    if (item.rule === rule) return item;
  }
  throw new Error(`No question found for rule ${rule}`);
}
/** Ignore locale, seed, explanation and answer ordering: compare the problem itself. */
export function problemSignature(item: Item): string {
  const canonical = generateFrom(item.kind, item.level, item.seed, 'en');
  return JSON.stringify([
    canonical.prompt,
    canonical.staff,
    canonical.figure,
    canonical.parts?.map((part) => part.prompt),
  ]);
}
export const nextSeed = (seed: number) => ((seed + 100) % MAX_SEED) + 1;
export type QuestionDraw = { rule: Rule; seed: number; check: boolean };
export function dueQuestion(
  rows: Coaching['knowledge'],
  eligible: readonly Rule[],
): QuestionDraw | null {
  for (const rule of eligible) {
    const pending = rows[rule]?.pending;
    if (!pending || pending.remaining !== 0) continue;
    const original = itemForRule(rule, pending.seed, 'en');
    if (original.review) continue;
    const recent = [pending.seed, ...rows[rule]!.recent].map((seed) =>
      problemSignature(itemForRule(rule, seed, 'en')),
    );
    let seed = pending.seed;
    for (let i = 0; i < 128; i += 1) {
      seed = nextSeed(seed);
      const candidate = itemForRule(rule, seed, 'en');
      if (!candidate.review && !recent.includes(problemSignature(candidate)))
        return { rule, seed, check: true };
    }
  }
  return null;
}

/** A changed starting pitch, with the same interval, checks near transfer only. */
export function hearingQuestion(
  rows: Coaching['hearing'],
  index: number,
  root: number,
) {
  const due = HEARING_KEYS.findIndex(
    (key) => rows[key]?.pending?.remaining === 0,
  );
  if (due < 0) return { index, root, check: false };
  const previousRoot = rows[HEARING_KEYS[due]]!.pending!.seed;
  return {
    index: due,
    root: root === previousRoot ? 57 + ((root - 56) % 12) : root,
    check: true,
  };
}
