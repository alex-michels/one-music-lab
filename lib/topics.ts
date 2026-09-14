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
 * Canonical titles, terms, kinds, module assignments and rule links live in
 * lib/content. This module exposes the existing navigation/search projections;
 * lib/exercises.ts continues to own the executable exercise registry.
 */
import type { LocalText } from './i18n';
import { contentCatalog } from './content/catalog';
import { TOPIC_IDS, type TopicId } from './content/ids';
export { TOPIC_IDS };
export type { TopicId };
export { ruleTopic, ruleLabels, ruleKind } from './content/adapters';
import { ruleTopic } from './content/adapters';
import { lessons, terms } from './learning';
import { RULES, type Rule } from './exercises';
import { notationLessonPresets } from './notation-experiments';

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

export type Topic = {
  id: TopicId;
  /** Legacy inventory position; use lib/course.ts for chapter/reading order. */
  order: number;
  kind: TopicKind;
  title: LocalText;
  /**
   * The roadmap module this topic belongs to, once someone assigns it.
   *
   * Notation lessons use their programme's permanent module assignment.
   * Other topics remain null until assigned; adding one never changes its slug.
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
  return {
    id,
    order,
    kind: contentCatalog.topics[order].kind,
    title: lesson.title,
    module: contentCatalog.topics[order].module,
  };
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

/** The original English headword is an identity, not a localized display label. */
export function termAnchor(term: { title: LocalText; id?: string }): string {
  return encodeURIComponent(term.id ?? term.title.en).replaceAll('~', '%7E');
}

export function termSearchText(
  term: { title: LocalText; body: LocalText; aliases?: LocalText },
  lang: keyof LocalText,
): string {
  return `${term.title[lang]} ${term.body[lang]} ${term.aliases?.[lang] ?? ''}`.toLowerCase();
}

/** The encyclopedia entries that belong to each topic. Every topic has some. */
export const termsByTopic: Record<TopicId, readonly Term[]> = byTopic((id) =>
  terms.filter((term) => term.lesson === id),
);

/**
 * The rules a topic's prose has to anchor, so the trainer can link to the
 * sentence that teaches a rule rather than to the top of a lesson. The read
 * lens renders each of these as an id on the paragraph that states it.
 * A topic with no rules simply has no drill.
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
