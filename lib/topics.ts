/**
 * The primary key.
 *
 * A topic id is what the whole site is addressed by: `#/<lang>/t/<id>/<lens>`.
 * Read, play, drill and define are four views of one of these, which is why the
 * id is the identity and everything else here is a column beside it.
 *
 * The id is the bare slug, deliberately: the nineteen slugs already exist as
 * `lessons[].id`, every link made with one survives, and the roadmap's module
 * numbering can arrive later as metadata without invalidating a single URL.
 *
 * Nothing here authors content. The titles, the terms and the order come from
 * lib/learning.ts; the rules come from lib/exercises.ts; the two authored maps
 * — which kind a topic is, and which topic a rule belongs to — are checked
 * against that data by tests/topics.test.mjs.
 */
import type { LocalText } from './i18n';
import { lessons, terms } from './learning';
import { RULES, type ExerciseKind, type Rule } from './exercises';
import { notationLessonPresets } from './notation-experiments';

/**
 * In reading order, which is the order lib/learning.ts writes them in. The list
 * is spelled out rather than derived so that `Record<TopicId, …>` below is
 * exhaustive at compile time; a test asserts it still matches `lessons`.
 */
export const TOPIC_IDS = [
  'sound',
  'tuning',
  'intervals',
  'timbre',
  'scales',
  'chords',
  'note-names',
  'staff',
  'clefs',
  'accidental-signs',
  'accidental-scope',
  'enharmonics',
  'durations',
  'dots-ties',
  'beat-division',
  'tempo',
  'dynamics',
  'articulation',
  'repeats',
] as const;
export type TopicId = (typeof TOPIC_IDS)[number];

/**
 * What a topic is about, which is the one thing hue is allowed to carry. Bound
 * to the topic rather than to each term, so the budget stays at four however
 * many terms are written later.
 *
 * Named `tone` and not `tuning`: `tuning` is also one of the nineteen topic ids,
 * and the encyclopedia shows the kind facet and the topic facet side by side.
 * Two chips reading "tuning" and meaning different things announce identically.
 */
export const TOPIC_KINDS = ['sign', 'concept', 'measure', 'tone'] as const;
export type TopicKind = (typeof TOPIC_KINDS)[number];

const topicKind: Record<TopicId, TopicKind> = {
  sound: 'tone',
  tuning: 'tone',
  timbre: 'tone',
  intervals: 'concept',
  scales: 'concept',
  chords: 'concept',
  dynamics: 'concept',
  articulation: 'concept',
  repeats: 'concept',
  'note-names': 'sign',
  staff: 'sign',
  clefs: 'sign',
  'accidental-signs': 'sign',
  'accidental-scope': 'sign',
  enharmonics: 'sign',
  durations: 'measure',
  'dots-ties': 'measure',
  'beat-division': 'measure',
  tempo: 'measure',
};

/**
 * Which topic teaches each rule the generator tests. This is the edge that did
 * not exist: an item knows the rule it is testing and nothing read it, so a
 * reader who missed a rule had nowhere to be sent. Every rule resolves, and tsc
 * requires an entry the moment a fifteenth rule is added.
 */
export const ruleTopic: Record<Rule, TopicId> = {
  'register-1': 'note-names',
  'register-2': 'note-names',
  'register-3': 'note-names',
  'natural-name': 'note-names',
  'alteration-name': 'accidental-signs',
  'enharmonic-respelling': 'enharmonics',
  'dot-adds-half': 'dots-ties',
  'second-dot-adds-half-the-first': 'dots-ties',
  'tied-values-add': 'dots-ties',
  'irregular-group-written-value': 'beat-division',
  'read-a-notated-pitch': 'staff',
  'same-place-other-clef': 'clefs',
  'sign-stops-at-the-barline': 'accidental-scope',
  'sign-holds-to-the-barline': 'accidental-scope',
};

/**
 * Which generator asks about each rule. The generator is the source of truth —
 * it writes both onto every item — so this table exists only so the trainer can
 * choose a kind for a topic without generating items to find out, and a test
 * regenerates the corpus to check the two still agree.
 */
export const ruleKind: Record<Rule, ExerciseKind> = {
  'register-1': 'octave-region',
  'register-2': 'octave-region',
  'register-3': 'octave-region',
  'natural-name': 'accidental-name',
  'alteration-name': 'accidental-name',
  'enharmonic-respelling': 'enharmonic',
  'dot-adds-half': 'dotted-value',
  'second-dot-adds-half-the-first': 'dotted-value',
  'tied-values-add': 'tie-sum',
  'irregular-group-written-value': 'tuplet',
  'read-a-notated-pitch': 'read-pitch',
  'same-place-other-clef': 'clef-transform',
  'sign-stops-at-the-barline': 'accidental-scope',
  'sign-holds-to-the-barline': 'accidental-scope',
};

export type Topic = {
  id: TopicId;
  /** Reading order, and the only sequence the site claims. */
  order: number;
  kind: TopicKind;
  title: LocalText;
  /**
   * The roadmap module this topic belongs to, once someone assigns it.
   *
   * Null on every row today, and honestly so: the roadmap numbers its 511
   * topics and links each to a module anchor, but the nineteen lessons written
   * so far carry no roadmap number, so there is nothing to derive an assignment
   * from. Deciding it is content work, not a migration — and because the id is
   * the slug, filling this in later breaks no link anyone has saved.
   */
  module: string | null;
};

/**
 * Built from the lessons rather than by looking each one up, so there is no
 * "what if it is missing" branch to guard: the two lists being the same list,
 * in the same order, is the first thing tests/topics.test.mjs asserts.
 */
export const topics: readonly Topic[] = lessons.map((lesson, order) => {
  const id = lesson.id as TopicId;
  return { id, order, kind: topicKind[id], title: lesson.title, module: null };
});

/** One entry per topic, by construction: the key type cannot drift from the list. */
function byTopic<T>(of: (id: TopicId) => T): Record<TopicId, T> {
  const table = {} as Record<TopicId, T>;
  for (const id of TOPIC_IDS) table[id] = of(id);
  return table;
}

export const topicById: Record<TopicId, Topic> = byTopic(
  (id) => topics[TOPIC_IDS.indexOf(id)],
);

type Term = (typeof terms)[number];

/** The encyclopedia entries that belong to each topic. Every topic has some. */
export const termsByTopic: Record<TopicId, readonly Term[]> = byTopic((id) =>
  terms.filter((term) => term.lesson === id),
);

/**
 * The rules a topic's prose has to anchor, so the trainer can link to the
 * sentence that teaches a rule rather than to the top of a lesson. The read
 * lens renders each of these as an id on the paragraph that states it.
 * Eight of the nineteen topics have rules; the rest are empty, and a topic with
 * no rules simply has no drill.
 */
export const paragraphAnchors: Record<TopicId, readonly Rule[]> = byTopic(
  (id) => RULES.filter((rule) => ruleTopic[rule] === id),
);

/** The topics a drill can be built for at all. */
export const drilledTopics: readonly TopicId[] = TOPIC_IDS.filter(
  (id) => paragraphAnchors[id].length > 0,
);

/**
 * Topics whose play lens is the tone bench rather than the notes bench, because
 * no notation preset exists for them. The two lenses say different things —
 * "hear this pitch" against "open in the notes lab" — so the site never
 * promises engraving it cannot draw for that topic.
 */
export const toneBedTopics: readonly TopicId[] = TOPIC_IDS.filter(
  (id) => !(id in notationLessonPresets),
);
