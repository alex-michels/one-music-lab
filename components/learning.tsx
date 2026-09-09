'use client';
import { nt } from '@/lib/notation-tasks';
import {
  notationForwardLinks,
  notationProgramme,
} from '@/lib/notation-programme';
import { termAnchor, termSearchText } from '@/lib/topics';
import { translator, type Translate } from '@/lib/i18n';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { count } from '@/lib/plural';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Headphones,
  Search,
  X,
} from 'lucide-react';
import { exerciseExplanations, lessons, terms } from '@/lib/learning';
import {
  TOPIC_IDS,
  TOPIC_KINDS,
  paragraphAnchors,
  ruleKind,
  ruleTopic,
  topicById,
  topics,
  type TopicId,
  type TopicKind,
} from '@/lib/topics';
import {
  RULES,
  generateFrom,
  grade,
  type ExerciseKind,
  type Item,
  type Level,
  type Rule,
} from '@/lib/exercises';
import {
  DRILL_STORAGE_KEY,
  EMPTY_LEDGER,
  createClientStore,
  drawRule,
  hashOf,
  ledgerFromStorage,
  recordAnswer,
  serializeLedger,
  sessionStorageOrNull,
  type Ledger,
} from '@/lib/client-store';
import { Staff } from '@/components/staff';
import { StaffAnswer } from '@/components/staff-answer';
import { NotationFigure } from './notation-figure';
import { NotationResponse } from './notation-response';
import { NotationReading } from './notation-reading';
import type { Wave } from '@/lib/music';
type Lang = import('@/lib/client-store').Lang;
const notationOrder = Object.keys(notationProgramme);

type SortBy = 'term' | 'kind';

export { Experiments } from './experiments';

/**
 * One generated question, set in the prose immediately after the rule it tests.
 *
 * The generator already writes the rule onto every item and the topics table
 * says which topic teaches which rule, so a topic that has a rule can ask about
 * it here rather than sending the reader to a separate page. A topic with no
 * rule simply renders nothing: the site does not manufacture a question it
 * cannot mark honestly.
 */
function InlineExercise({
  lang,
  topic,
  anchor,
}: {
  lang: Lang;
  topic: string;
  /**
   * The rule a ledger row asked for. A topic can teach four rules and this
   * paragraph shows one, so without the anchor three of the ledger's exits
   * would land on a question about something else.
   */
  anchor: string | null;
}) {
  const t = translator(lang);
  const [chosen, setChosen] = useState<string | null>(null);
  const here = useRef<HTMLElement>(null);
  const rules = Object.hasOwn(paragraphAnchors, topic)
    ? paragraphAnchors[topic as TopicId]
    : [];
  const rule = rules.find((candidate) => candidate === anchor) ?? rules[0];
  // The address names a paragraph, and the browser will not scroll to it: the
  // anchor is written after a `~` precisely so the fragment stays one piece,
  // which means nothing native matches it.
  useEffect(() => {
    if (rule && anchor === rule)
      here.current?.scrollIntoView({ block: 'center' });
  }, [anchor, rule]);
  if (!rule) return null;
  const item = itemForRule(rule, 1, lang);
  const verdict = chosen && chosen !== 'review' ? grade(item, chosen) : null;
  if (item.review || item.parts)
    return (
      <section className="inline-exercise" id={rule} ref={here}>
        <NotationResponse
          key={`${rule}-${lang}`}
          item={item}
          onComplete={() => setChosen('review')}
        />
      </section>
    );
  return (
    // The paragraph that states the rule carries its id, so a ledger row can
    // link to the sentence rather than to the top of a lesson.
    <section className="inline-exercise" id={rule} ref={here}>
      <span className="eyebrow">{t('Try it here', 'Попробуйте здесь')}</span>
      <p className="exercise-prompt">{item.prompt}</p>
      {item.figure && <NotationFigure id={item.figure} label={item.prompt} />}
      {item.staff && (
        <div className="exercise-staff">
          <Staff
            pitches={item.staff.pitches}
            clef={item.staff.clef}
            barlines={item.staff.barlines}
            accidentalVisibility={item.staff.accidentalVisibility}
            lang={lang}
            space={13}
            label={staffPrompt(item.kind, t)}
          />
        </div>
      )}
      <div className="answer-grid">
        {item.options.map((option) => (
          <button
            key={option.id}
            disabled={chosen !== null}
            className={
              chosen === option.id
                ? verdict?.correct
                  ? 'answer-correct'
                  : 'answer-wrong'
                : ''
            }
            onClick={() => setChosen(option.id)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {verdict && (
        <p
          className={
            verdict.correct ? 'answer-feedback' : 'answer-feedback incorrect'
          }
        >
          {exerciseExplanations[verdict.tag][lang]}
          {item.explanation && <span> {item.explanation}</span>}
        </p>
      )}
      {/* Into the drill scoped to this topic, not to the whole trainer: the
          reader asked about this rule, so this is the rule to practise. */}
      <a
        className="text-button"
        href={hashOf({ lang, lens: 'drill', topic, anchor: null })}
      >
        {t('Practise this rule', 'Потренировать это правило')}
        <ChevronRight size={16} />
      </a>
    </section>
  );
}

export function Theory({
  lang,
  lessonId,
  setLessonId,
  openLab,
  anchor,
}: {
  lang: Lang;
  lessonId: string | null;
  setLessonId: (id: string | null) => void;
  openLab: (hz: number, wave: Wave, lessonId: string) => void;
  anchor: string | null;
}) {
  const t = translator(lang);
  const lesson = lessons.find((l) => l.id === lessonId);
  const position = notationOrder.indexOf(lessonId ?? '');
  const previous = topicById[notationOrder[position - 1] as TopicId];
  const next = topicById[notationOrder[position + 1] as TopicId];
  if (lesson)
    return (
      <article className="lens-read lesson-article">
        <button className="text-button" onClick={() => setLessonId(null)}>
          <ArrowLeft size={16} />
          {t('All foundations', 'Все основы')}
        </button>
        {lesson.paragraphs.map((p, i) => (
          <p className="prose" key={i}>
            {p[lang]}
          </p>
        ))}
        {/* The rule this topic teaches, asked right where it is stated, rather
            than saved up for a page the reader has to go and find. */}
        <InlineExercise
          key={`${lesson.id}-${anchor ?? ''}-${lang}`}
          lang={lang}
          topic={lesson.id}
          anchor={anchor}
        />
        <div className="formula">{lesson.formula[lang]}</div>
        <NotationReading topic={lesson.id} lang={lang} />
        {/* The experiment card links the explanation to its laboratory. */}
        <aside className="breakout lesson-experiment">
          <div className="eyebrow">{t('MAKE IT AUDIBLE', 'УСЛЫШЬТЕ ЭТО')}</div>
          <Headphones size={32} />
          <h3>{t('Try it in the lab', 'Попробуйте в лаборатории')}</h3>
          <p>{lesson.experiment[lang]}</p>
          <div className="lesson-experiment-actions">
            <button
              className="primary-button"
              onClick={() => openLab(lesson.hz, lesson.wave as Wave, lesson.id)}
            >
              {t('Open this experiment', 'Открыть эксперимент')}
              <ArrowRight size={16} />
            </button>
            {/* “Train your ear” used to point at the trainer, which is where
                ear training no longer is: it is an experiment in the lab now,
                one button up. A second link to the same place is not a route. */}
          </div>
        </aside>
        <a
          className="source-link"
          href={lesson.source}
          target="_blank"
          rel="noreferrer"
        >
          {t('Further reading', 'Для дальнейшего чтения')}
          <ArrowUpRight size={15} />
        </a>
        {position >= 0 && (
          <nav
            className="lesson-navigation"
            aria-label={
              nt(
                'Notation programme',
                'Программа нотной записи',
                'Notenschrift lernen',
              )[lang]
            }
          >
            <p className="eyebrow">
              {nt('Lesson', 'Урок', 'Lektion')[lang]} {position + 1} /{' '}
              {notationOrder.length}
            </p>
            {previous && (
              <a
                rel="prev"
                href={hashOf({
                  lang,
                  lens: 'read',
                  topic: previous.id,
                  anchor: null,
                })}
              >
                <span>
                  {
                    nt('Previous lesson', 'Предыдущий урок', 'Vorige Lektion')[
                      lang
                    ]
                  }
                </span>
                {previous.title[lang]}
              </a>
            )}
            {next && (
              <a
                rel="next"
                href={hashOf({
                  lang,
                  lens: 'read',
                  topic: next.id,
                  anchor: null,
                })}
              >
                <span>
                  {nt('Next lesson', 'Следующий урок', 'Nächste Lektion')[lang]}
                </span>
                {next.title[lang]}
              </a>
            )}
          </nav>
        )}
      </article>
    );
  const groupName: Record<TopicKind, string> = {
    sign: t('Signs on the page', 'Знаки на бумаге'),
    concept: t('Ideas and definitions', 'Понятия и определения'),
    measure: t('Rhythm and duration', 'Ритм и длительность'),
    tone: t('Sound itself', 'Сам звук'),
  };
  return (
    <div className="lens-read">
      {/* Grouped by subject; the notation lessons also have a reading route. */}
      {TOPIC_KINDS.map((group) => {
        const inGroup = topics.filter((topic) => topic.kind === group);
        if (!inGroup.length) return null;
        return (
          <section className="topic-group" key={group}>
            <h2>{groupName[group]}</h2>
            <ul role="list">
              {inGroup.map((topic) => (
                <li key={topic.id}>
                  <button
                    className="topic-row"
                    onClick={() => setLessonId(topic.id)}
                  >
                    <span className="topic-name">{topic.title[lang]}</span>
                    {topic.order === 0 && (
                      <span className="start-here">
                        {t('Start here', 'Начните здесь')}
                      </span>
                    )}
                    <ArrowUpRight size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      <p className="culture-note">
        {t(
          'Musical traditions deserve their own context, terminology and sources. A raga or maqam is not simply a scale preset.',
          'Музыкальные традиции требуют собственного контекста, терминологии и источников. Рага или макам — не просто настройка звукоряда.',
        )}
      </p>
      {/* The one place on the site that says how big it is, and it counts what
          exists rather than showing a fraction of what does not. */}
      <p className="scope-line">
        {count(terms.length, lang, 'terms')} ·{' '}
        {count(lessons.length, lang, 'lessons')} ·{' '}
        {t('written so far', 'написано на сегодня')}.{' '}
        <a
          href="https://github.com/alex-michels/one-music-lab/blob/main/ROADMAP.md"
          target="_blank"
          rel="noreferrer"
        >
          {t(
            'The plan for the rest is in the roadmap.',
            'План на всё остальное — в дорожной карте.',
          )}
        </a>
      </p>
    </div>
  );
}

export function Encyclopedia({
  lang,
  openLesson,
  subject,
  anchor = null,
}: {
  lang: Lang;
  openLesson: (id: string) => void;
  /**
   * The topic the address names, which preselects the topic facet. Without it
   * a ledger row's second exit — the terms that govern the rule — would land
   * on the whole index and leave the reader to find them.
   */
  subject: string | null;
  anchor?: string | null;
}) {
  const t = translator(lang);
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<TopicKind | null>(null);
  const [topic, setTopic] = useState<TopicId | null>(
    subject !== null && (TOPIC_IDS as readonly string[]).includes(subject)
      ? (subject as TopicId)
      : null,
  );
  const [opened, setOpened] = useState<string | null>(
    () => terms.find((term) => termAnchor(term) === anchor)?.title.en ?? null,
  );
  // The index opens alphabetically, which is what a reference is for.
  const [sortBy, setSortBy] = useState<SortBy>('term');
  const [ascending, setAscending] = useState(true);

  const kindOf = (term: (typeof terms)[number]) =>
    topicById[term.lesson as TopicId].kind;
  const kindName: Record<TopicKind, string> = {
    sign: t('sign', 'знак'),
    concept: t('concept', 'понятие'),
    measure: t('measure', 'мера'),
    tone: t('tone', 'звук'),
  };
  /*
   * Every example is in the reader's own language. The hint used to read
   * “pitch”, “interval”, “строй” — an English sentence with a Russian word in
   * it, which is the one thing the site is not allowed to do outside an entry
   * whose subject IS the difference between traditions.
   */
  const hint: Record<Lang, string> = {
    en: 'Try “pitch”, “interval”, or a shorter search.',
    ru: 'Попробуйте «высота», «строй» или более короткий запрос.',
    de: 'Versuchen Sie „Tonhöhe“, „Stimmung“ oder eine kürzere Suche.',
  };

  // The two facets are not independent — a kind is a set of topics — so
  // choosing a kind narrows which topics are offered rather than leaving
  // combinations that can only ever be empty.
  const offeredTopics = TOPIC_IDS.filter(
    (id) => kind === null || topicById[id].kind === kind,
  );
  const matching = terms.filter(
    (term) =>
      (kind === null || kindOf(term) === kind) &&
      (topic === null || term.lesson === topic) &&
      termSearchText(term, lang).includes(query.toLowerCase()),
  );
  /*
   * Alphabetical in the reader's own alphabet: a collator for the language
   * being read, not for English. Ä sorts with A in German and the Cyrillic
   * order is not the Latin one, so comparing the raw strings would file half
   * the Russian index in the wrong place.
   *
   * Sorting by kind sorts by the translated kind name, so the groups come out
   * in the order the reader sees written beside each row, with the term as the
   * tiebreaker inside a group.
   */
  const collator = new Intl.Collator(lang);
  const filtered = [...matching].sort((a, b) => {
    const byTerm = collator.compare(a.title[lang], b.title[lang]);
    const value =
      sortBy === 'kind'
        ? collator.compare(kindName[kindOf(a)], kindName[kindOf(b)]) || byTerm
        : byTerm;
    return ascending ? value : -value;
  });
  const entry =
    filtered.find((term) => term.title.en === opened) ?? filtered[0];
  const filtering = kind !== null || topic !== null;

  const sortColumn = (key: SortBy, label: string) => {
    const active = sortBy === key;
    const direction = ascending
      ? t('ascending', 'по возрастанию')
      : t('descending', 'по убыванию');
    return (
      <button
        type="button"
        className={active ? 'sort-by selected' : 'sort-by'}
        aria-pressed={active}
        // The direction is only true of the column actually doing the sorting;
        // saying it on the other one would describe a state that is not on.
        aria-label={active ? `${label}, ${direction}` : label}
        onClick={() => {
          if (active) setAscending(!ascending);
          else {
            setSortBy(key);
            setAscending(true);
          }
        }}
      >
        {label}
        {active &&
          (ascending ? <ChevronUp size={14} /> : <ChevronDown size={14} />)}
      </button>
    );
  };

  const chip = (
    label: string,
    on: boolean,
    press: () => void,
    hue?: string,
  ) => (
    <button
      key={label}
      type="button"
      className={on ? 'facet selected' : 'facet'}
      aria-pressed={on}
      data-kind={hue}
      onClick={press}
    >
      {label}
    </button>
  );

  return (
    <div className="define-lens">
      <div className="facet-bar">
        <fieldset aria-label={t('Kind', 'Вид')}>
          <span className="facet-label">{t('Kind', 'Вид')}</span>
          {chip(t('All', 'Все'), kind === null, () => {
            setKind(null);
            setTopic(null);
          })}
          {TOPIC_KINDS.map((value) =>
            chip(
              kindName[value],
              kind === value,
              () => {
                setKind(value);
                // A topic outside the new kind would filter to nothing.
                if (topic && topicById[topic].kind !== value) setTopic(null);
              },
              value,
            ),
          )}
        </fieldset>
        <fieldset aria-label={t('Topic', 'Тема')}>
          <span className="facet-label">{t('Topic', 'Тема')}</span>
          {chip(t('All', 'Все'), topic === null, () => setTopic(null))}
          {offeredTopics.map((id) =>
            chip(topicById[id].title[lang], topic === id, () => setTopic(id)),
          )}
        </fieldset>
      </div>

      <div className="define-body">
        <div className="term-index">
          <label className="search-field">
            <Search size={17} />
            <input
              aria-label={t('Search musical terms', 'Найти музыкальный термин')}
              placeholder={t('Search a term…', 'Найти термин…')}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            {/* A count of what this view matches, not a count of what the site
                has: the one place that names the site's scope is elsewhere. */}
            <span className="num">{filtered.length}</span>
          </label>
          {/* The two things a row shows are the two things it can be ordered
              by, so the column names are the controls. */}
          <fieldset
            className="index-head"
            aria-label={t('Sort the index', 'Сортировка списка')}
          >
            {sortColumn('term', t('Term', 'Термин'))}
            {sortColumn('kind', t('Kind', 'Вид'))}
          </fieldset>
          <ul role="list">
            {filtered.map((term) => (
              <li key={term.title.en}>
                <button
                  type="button"
                  className={term === entry ? 'term-row selected' : 'term-row'}
                  aria-pressed={term === entry}
                  onClick={() => setOpened(term.title.en)}
                >
                  {/* Hue never carries the meaning alone: the kind is also
                      written out, so the index survives deuteranopia and print. */}
                  <span className="kind-bar" data-kind={kindOf(term)} />
                  <span className="term-name">{term.title[lang]}</span>
                  <span className="term-kind">{kindName[kindOf(term)]}</span>
                </button>
              </li>
            ))}
            {!filtered.length && (
              <li className="term-row empty">
                <span>{t('No term matches', 'Ничего не найдено')}</span>
              </li>
            )}
          </ul>
          {!filtered.length && (
            <div className="index-actions">
              <p>{hint[lang]}</p>
              {query && (
                <button
                  className="text-button"
                  onClick={() => setQuery('')}
                  type="button"
                >
                  {t('Clear the search', 'Очистить поиск')}
                </button>
              )}
              {filtering && (
                <button
                  className="text-button"
                  type="button"
                  onClick={() => {
                    setKind(null);
                    setTopic(null);
                  }}
                >
                  {t('Clear the filters', 'Сбросить фильтры')}
                </button>
              )}
            </div>
          )}
        </div>

        {entry && (
          <article className="term-entry">
            <p className="term-entry-kind">
              <span className="kind-bar" data-kind={kindOf(entry)} />
              {kindName[kindOf(entry)]} ·{' '}
              {topicById[entry.lesson as TopicId].title[lang]}
            </p>
            <h2>{entry.title[lang]}</h2>
            <p>{entry.body[lang]}</p>
            <a
              className="text-button"
              href={hashOf({
                lang,
                lens: 'define',
                topic: entry.lesson,
                anchor: termAnchor(entry),
              })}
            >
              {
                nt(
                  'Link to this term',
                  'Ссылка на этот термин',
                  'Link zu diesem Begriff',
                )[lang]
              }
            </a>
            {'source' in entry && (
              <a
                className="source-link"
                href={entry.source.url}
                target="_blank"
                rel="noreferrer"
              >
                {entry.source.title}
              </a>
            )}
            {'furtherSources' in entry &&
              entry.furtherSources.map((source) => (
                <a
                  key={source.url}
                  className="source-link"
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  {source.title}
                </a>
              ))}
            {'relatedTopics' in entry &&
              entry.relatedTopics.map((id) => (
                <a
                  key={id}
                  className="text-button"
                  href={hashOf({ lang, lens: 'read', topic: id, anchor: null })}
                >
                  {topicById[id as TopicId].title[lang]}
                </a>
              ))}
            {'forwardModules' in entry &&
              entry.forwardModules.map((id) => (
                <a
                  key={id}
                  className="text-button"
                  href={notationForwardLinks[id]}
                  target="_blank"
                  rel="noreferrer"
                >
                  {
                    nt(
                      'Further study',
                      'Дальнейшее изучение',
                      'Weiterführendes Lernen',
                    )[lang]
                  }{' '}
                  · {id}
                </a>
              ))}
            <button
              className="text-button"
              type="button"
              onClick={() => openLesson(entry.lesson)}
            >
              {t('Explore the idea', 'Исследовать понятие')}
              <ArrowUpRight size={15} />
            </button>
            <a
              className="text-button"
              href={hashOf({
                lang,
                lens: 'play',
                topic: entry.lesson,
                anchor: null,
              })}
            >
              {
                nt(
                  'Open the laboratory',
                  'Открыть лабораторию',
                  'Labor öffnen',
                )[lang]
              }
            </a>
            {paragraphAnchors[entry.lesson as TopicId].length > 0 && (
              <a
                className="text-button"
                href={hashOf({
                  lang,
                  lens: 'drill',
                  topic: entry.lesson,
                  anchor: null,
                })}
              >
                {
                  nt(
                    'Practise this topic',
                    'Потренировать эту тему',
                    'Dieses Thema üben',
                  )[lang]
                }
              </a>
            )}
          </article>
        )}
      </div>
    </div>
  );
}

/**
 * The tags the generator can attach to an option, as a value rather than a
 * union: the explanations table is keyed by the whole of `ErrorTag`, so its own
 * keys are the list, and a fifteenth tag joins it without being remembered.
 */
const ERROR_TAGS = Object.keys(exerciseExplanations);

/**
 * The ledger, above the lens rather than inside it: a reader who follows a row
 * out to the passage that teaches the rule and comes back has not lost the
 * reason they left. It is `sessionStorage` and not `localStorage` on purpose —
 * a permanent record of a reader's mistakes is a mastery record by the back
 * door, and this site does not keep one.
 */
const drillStore = createClientStore<Ledger>(
  () =>
    ledgerFromStorage(sessionStorageOrNull(), {
      rules: RULES,
      tags: ERROR_TAGS,
    }),
  EMPTY_LEDGER,
);

function saveLedger(next: Ledger) {
  drillStore.set(next);
  try {
    sessionStorageOrNull()?.setItem(DRILL_STORAGE_KEY, serializeLedger(next));
  } catch {}
}

/**
 * An item that tests the drawn rule.
 *
 * Two of the kinds ask about more than one rule — `octave-region` carries the
 * register in its rule and `dotted-value` asks about the first dot or the
 * second — so the level and the seed are both searched until the generator
 * emits the rule that was asked for. Failure is explicit: an unrelated
 * question must never stand in for the rule named by a lesson or ledger link.
 */
function itemForRule(rule: Rule, seed: number, lang: Lang): Item {
  const kind = ruleKind[rule];
  // Successive questions start at different complexities. Searching from level
  // 1 every time would leave advanced variants unreachable for single-rule kinds.
  const firstLevel = Math.floor((seed - 1) / 101) % 3;
  for (let i = 0; i < 256; i += 1) {
    const level = (((firstLevel + i) % 3) + 1) as Level;
    const item = generateFrom(kind, level, seed + i * 31, lang);
    if (item.rule === rule) return item;
  }
  throw new Error(`No question found for rule ${rule}`);
}

/**
 * A picture of a question must not read the answer out.
 *
 * `components/staff.tsx` names itself from the pitches it drew, which is the
 * right description of an illustration and exactly the wrong one of a question:
 * a screen-reader user was told the note before being asked to name it. Every
 * engraved kind passes its own neutral sentence instead.
 */
function staffPrompt(kind: ExerciseKind, t: Translate): string {
  if (kind === 'clef-transform')
    return t(
      'The place to read in another clef',
      'Место для чтения в другом ключе',
    );
  if (kind === 'accidental-scope')
    return t('The bar the sign stands in', 'Такт, в котором стоит знак');
  return t('The note to name', 'Нота, которую нужно назвать');
}

/**
 * DRILL. One question at a time and a ledger of the rules behind them.
 *
 * What the trainer used to show was a score, a progress bar and a percentage —
 * three ways of saying the same number, none of which tells a reader what to do
 * next. They are gone. What is here instead is a count of what each rule has
 * cost, the explanation of the last mistake made on it, and two ways out of the
 * drill and into the text: the paragraph that states the rule, and the terms
 * that govern it.
 *
 * `topic` scopes it. `#/<lang>/drill` interleaves every rule, because
 * interleaved practice builds retrieval strength and blocked practice does not;
 * `#/<lang>/t/<topic>/drill` narrows it to the rules one passage teaches.
 */
export function Practice({
  lang,
  topic,
}: {
  lang: Lang;
  topic: string | null;
}) {
  return (
    <PracticeSession key={`${lang}-${topic ?? ''}`} lang={lang} topic={topic} />
  );
}

function PracticeSession({
  lang,
  topic,
}: {
  lang: Lang;
  topic: string | null;
}) {
  const t = translator(lang);
  const ledger = useSyncExternalStore(
    drillStore.subscribe,
    drillStore.getSnapshot,
    drillStore.getServerSnapshot,
  );
  const scoped =
    topic !== null && Object.hasOwn(paragraphAnchors, topic)
      ? paragraphAnchors[topic as TopicId]
      : null;
  const eligible = scoped && scoped.length > 0 ? scoped : RULES;
  // The seed is the item. Keeping it in state means a reader can be sent back
  // to the exact question they saw, and the tests can reproduce it.
  const [drawn, setDrawn] = useState<{ rule: Rule; seed: number }>(() => ({
    rule: eligible[0],
    seed: 1,
  }));
  const [chosen, setChosen] = useState<string | null>(null);
  // A scope change is a different drill; the first question has to come from
  // the rules the address now names rather than from the ones it used to.
  const rule = eligible.includes(drawn.rule) ? drawn.rule : eligible[0];
  const item = itemForRule(rule, drawn.seed, lang);
  const resultFor = (id: string) =>
    id === 'written-wrong'
      ? { correct: false, tag: 'wrong-written-note' as const }
      : grade(item, id);
  const verdict =
    chosen === null || chosen === 'review' ? null : resultFor(chosen);
  const answer = (id: string) => {
    if (chosen !== null) return;
    setChosen(id);
    // Written from the item, not from the draw: the item knows which rule it
    // actually asked about, and the ledger may only claim what happened.
    saveLedger(recordAnswer(ledger, item.rule, resultFor(id)));
  };
  const nextQuestion = () => {
    setDrawn((previous) => ({
      rule: drawRule(eligible, ledger, Math.random()),
      seed: previous.seed + 101,
    }));
    setChosen(null);
  };
  const startOver = () => {
    saveLedger(EMPTY_LEDGER);
    setDrawn({ rule: eligible[0], seed: 1 });
    setChosen(null);
  };
  const missedAny = eligible.some((r) => (ledger.get(r)?.missed ?? 0) > 0);
  return (
    <div className="lens-drill" data-lens="drill">
      <section className="drill-question">
        <div className="eyebrow">
          {scoped
            ? topicById[topic as TopicId].title[lang]
            : t('READING NOTATION', 'ЧТЕНИЕ НОТНОЙ ЗАПИСИ')}
        </div>
        {item.review || item.parts ? (
          <NotationResponse
            key={`${rule}-${drawn.seed}-${lang}`}
            item={item}
            onComplete={(results) => {
              if (chosen !== null) return;
              if (results.length)
                saveLedger(
                  results.reduce(
                    (current, correct, index) =>
                      recordAnswer(current, item.rule, {
                        correct,
                        tag: correct
                          ? 'correct'
                          : item.parts?.[index].kind === 'rhythm'
                            ? 'duration-symbol'
                            : 'wrong-written-note',
                      }),
                    ledger,
                  ),
                );
              setChosen('review');
            }}
          />
        ) : item.kind === 'read-pitch' ? (
          <StaffAnswer
            key={`${drawn.seed}-${item.level}-${lang}`}
            item={item}
            chosen={chosen}
            onAnswer={answer}
          />
        ) : (
          <>
            {item.figure && (
              <NotationFigure id={item.figure} label={item.prompt} />
            )}
            {item.staff && (
              <div className="exercise-staff">
                <Staff
                  pitches={item.staff.pitches}
                  clef={item.staff.clef}
                  barlines={item.staff.barlines}
                  accidentalVisibility={item.staff.accidentalVisibility}
                  lang={lang}
                  space={13}
                  label={staffPrompt(item.kind, t)}
                />
              </div>
            )}
            <h2 className="exercise-prompt">{item.prompt}</h2>
            <div className="answer-grid">
              {item.options.map((option) => (
                <button
                  key={option.id}
                  disabled={chosen !== null}
                  onClick={() => answer(option.id)}
                  className={
                    chosen !== null && option.id === item.answer
                      ? 'answer-correct'
                      : chosen === option.id
                        ? 'answer-wrong'
                        : ''
                  }
                >
                  <span>{option.label}</span>
                  {chosen !== null && option.id === item.answer ? (
                    <Check size={18} />
                  ) : chosen === option.id ? (
                    <X size={18} />
                  ) : null}
                </button>
              ))}
            </div>
          </>
        )}
        {verdict && (
          <output
            className={
              'answer-feedback ' + (verdict.correct ? 'correct' : 'incorrect')
            }
          >
            <strong>
              {verdict.correct
                ? t('That’s right.', 'Верно.')
                : t('Not quite.', 'Не совсем.')}
            </strong>{' '}
            {exerciseExplanations[verdict.tag][lang]}
            {item.explanation && <span> {item.explanation}</span>}
          </output>
        )}
        {verdict && item.source && (
          <a
            className="source-link"
            href={item.source.url}
            target="_blank"
            rel="noreferrer"
          >
            {item.source.title}
          </a>
        )}
        {/* Never on a timer. The explanation is the point of getting it wrong,
            and a question that advances itself takes it away from a slow
            reader before they have finished it. */}
        {chosen !== null && (
          <button className="primary-button" onClick={nextQuestion}>
            {t('Next question', 'Следующий вопрос')}
            <ArrowRight size={17} />
          </button>
        )}
      </section>
      <RuleLedger
        lang={lang}
        rules={eligible}
        ledger={ledger}
        missedAny={missedAny}
        onStartOver={startOver}
      />
    </div>
  );
}

/**
 * The rule ledger: one row per rule the drill can ask about, whether or not it
 * has been asked yet.
 *
 * A `<details>` at every width rather than a panel that becomes one below
 * 900 px. The rail may never be disclosed, but this may: it is a record of
 * work, not a way to get anywhere, and one element that behaves the same at
 * both widths is one fewer thing that can be open on a phone and closed on a
 * desk.
 */
function RuleLedger({
  lang,
  rules,
  ledger,
  missedAny,
  onStartOver,
}: {
  lang: Lang;
  rules: readonly Rule[];
  ledger: Ledger;
  missedAny: boolean;
  onStartOver: () => void;
}) {
  const t = translator(lang);
  return (
    <details className="drill-ledger" open>
      <summary>
        <span className="eyebrow">
          {t('RULES THIS SESSION', 'ПРАВИЛА ЭТОЙ СЕССИИ')}
        </span>
      </summary>
      {missedAny && (
        <p className="ledger-note">
          {t(
            'A rule you have missed comes up twice as often as one you have not.',
            'Правило, в котором вы ошиблись, встречается вдвое чаще остальных.',
          )}
        </p>
      )}
      <dl className="ledger-rows">
        {rules.map((rule) => {
          const row = ledger.get(rule);
          const topic = ruleTopic[rule];
          return (
            <div
              key={rule}
              className="ledger-row"
              data-missed={row && row.missed > 0 ? 'yes' : undefined}
            >
              <dt>
                <code className="num">{rule}</code>
              </dt>
              <dd>
                <p className="ledger-tally">
                  {rule === 'compare-beaming' ||
                  rule === 'recognize-an-ornament'
                    ? nt(
                        'Unscored review',
                        'Разбор без оценки',
                        'Unbewerteter Vergleich',
                      )[lang]
                    : row
                      ? `${count(row.asked, lang, 'questions')} · ${count(row.missed, lang, 'mistakes')}`
                      : t('not yet asked', 'ещё не спрашивали')}
                </p>
                {row?.tag && <p>{exerciseExplanations[row.tag][lang]}</p>}
                {/* Two exits, because a rule is taught in a passage and named
                    in the glossary, and a reader who missed it may want
                    either. */}
                <p className="ledger-exits">
                  <a
                    href={hashOf({
                      lang,
                      lens: 'read',
                      topic,
                      anchor: rule,
                    })}
                  >
                    {t('the passage', 'к тексту')}
                  </a>
                  <a
                    href={hashOf({
                      lang,
                      lens: 'define',
                      topic,
                      anchor: null,
                    })}
                  >
                    {t('the terms', 'к терминам')}
                  </a>
                </p>
              </dd>
            </div>
          );
        })}
      </dl>
      <button className="text-button" onClick={onStartOver}>
        {t('Start a new session', 'Начать новую сессию')}
      </button>
    </details>
  );
}
