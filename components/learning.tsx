'use client';
import { nt } from '@/lib/notation-tasks';
import { LessonProgress, useLocalProfile } from './local-data';
import { profileStore, saveAnswers } from '@/lib/local-profile';
import {
  dueQuestion,
  itemForRule,
  nextSeed,
  type QuestionDraw,
} from '@/lib/practice-coach';
import { practiceHints } from '@/lib/practice-hints';
import { PracticeHints, AttemptNotice, checkLabel } from './practice-coach';
import {
  CourseIndex,
  CourseResume,
  LessonConnections,
  LessonNavigation,
} from './course-navigation';
import { notationForwardLinks } from '@/lib/notation-programme';
import { termAnchor, termSearchText } from '@/lib/topics';
import { translator, type Translate } from '@/lib/i18n';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { count } from '@/lib/plural';
import {
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
import { lessonGuides } from '@/lib/content/adapters';
import {
  TOPIC_IDS,
  TOPIC_KINDS,
  paragraphAnchors,
  ruleLabels,
  ruleTopic,
  topicById,
  topics,
  type TopicId,
  type TopicKind,
} from '@/lib/topics';
import { RULES, grade, type ExerciseKind, type Rule } from '@/lib/exercises';
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
import { NoteText } from './note-text';
import { AnswerMark } from './answer-mark';
import { LessonListen } from './lesson-listen';
import type { ListenPlan } from '@/lib/lesson-listening';
import type { Wave } from '@/lib/music';
type Lang = import('@/lib/client-store').Lang;

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
  const [hints, setHints] = useState(0);
  const { profile } = useLocalProfile();
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
        <PracticeHints
          lang={lang}
          hints={practiceHints[item.kind]}
          shown={hints}
          onHint={() => setHints(hints + 1)}
          answered={chosen !== null}
        />
        <NotationResponse
          key={`${rule}-${lang}`}
          item={item}
          onComplete={(results) => {
            if (chosen !== null) return;
            saveAnswers(
              item.rule,
              results.map((correct, index) => ({
                correct,
                tag: correct
                  ? 'correct'
                  : item.parts?.[index].kind === 'rhythm'
                    ? 'duration-symbol'
                    : 'wrong-written-note',
              })),
              { seed: 1, assisted: hints > 0, check: false },
            );
            setChosen('review');
          }}
        />
        {chosen !== null && !item.review && (
          <AttemptNotice
            lang={lang}
            assisted={hints > 0}
            check={false}
            pending={profile.coaching.knowledge[rule]?.pending ?? null}
          />
        )}
      </section>
    );
  return (
    // The paragraph that states the rule carries its id, so a ledger row can
    // link to the sentence rather than to the top of a lesson.
    <section className="inline-exercise" id={rule} ref={here}>
      <span className="eyebrow">{t('Try it here', 'Попробуйте здесь')}</span>
      <p className="exercise-prompt">
        <NoteText text={item.prompt} markup={item.promptMarkup} lang={lang} />
      </p>
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
      <PracticeHints
        lang={lang}
        hints={practiceHints[item.kind]}
        shown={hints}
        onHint={() => setHints(hints + 1)}
        answered={chosen !== null}
      />
      <div className="answer-grid">
        {item.options.map((option) => (
          <button
            key={option.id}
            disabled={chosen !== null}
            // As in the drill: once answered, the right option is marked
            // whether or not it was the one chosen. A miss used to show only
            // that it was a miss and never what the answer was.
            className={
              chosen !== null && option.id === item.answer
                ? 'answer-correct'
                : chosen === option.id
                  ? 'answer-wrong'
                  : ''
            }
            onClick={() => {
              if (chosen !== null) return;
              saveAnswers(item.rule, [grade(item, option.id)], {
                seed: 1,
                assisted: hints > 0,
                check: false,
              });
              setChosen(option.id);
            }}
          >
            {/* One box for the label: a Russian label is several runs of text
                and italic note names, and the button spreads its children. */}
            <span>
              <NoteText
                text={option.label}
                markup={option.labelMarkup}
                lang={lang}
              />
            </span>
            {/* A mark and words as well as a tint: the two tints are equally
                dark, and a tint says nothing to a screen reader. */}
            {chosen !== null && option.id === item.answer ? (
              <AnswerMark kind="correct" lang={lang} />
            ) : chosen === option.id ? (
              <AnswerMark kind="chosen" lang={lang} />
            ) : null}
          </button>
        ))}
      </div>
      {verdict && (
        <output
          className={
            verdict.correct ? 'answer-feedback' : 'answer-feedback incorrect'
          }
        >
          {/* The verdict in words first, so it does not rest on colour. */}
          <strong>
            {verdict.correct
              ? t('That’s right.', 'Верно.')
              : t('Not quite.', 'Не совсем.')}
          </strong>{' '}
          {/* The sentence for the kind of mistake; a right answer needs none. */}
          {!verdict.correct && (
            <NoteText text={exerciseExplanations[verdict.tag]} lang={lang} />
          )}
          {item.explanation && (
            <span>
              {' '}
              <NoteText
                text={item.explanation}
                markup={item.explanationMarkup}
                lang={lang}
              />
            </span>
          )}
        </output>
      )}
      {verdict && (
        <AttemptNotice
          lang={lang}
          assisted={hints > 0}
          check={false}
          pending={profile.coaching.knowledge[rule]?.pending ?? null}
        />
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

const guideLabels = {
  question: nt('The question', 'Вопрос урока', 'Die Frage'),
  example: nt('Step by step', 'Разберём по шагам', 'Schritt für Schritt'),
  listen: nt('Listen for', 'На что обратить внимание', 'Darauf achten'),
  mistake: nt('A common mix-up', 'Частая ошибка', 'Häufige Verwechslung'),
  takeaways: nt('Keep in mind', 'Запомните', 'Merke dir'),
};

export function Theory({
  lang,
  lessonId,
  openLab,
  anchor,
  recent = null,
  listen,
  stopSound,
}: {
  lang: Lang;
  lessonId: string | null;
  openLab: (hz: number, wave: Wave, lessonId: string) => void;
  anchor: string | null;
  /** The lesson last opened for reading, which the index offers to continue. */
  recent?: string | null;
  /**
   * Starts one of the lesson's own sound examples. Without it the lesson is
   * text and figures only and says nothing about sound it cannot make.
   */
  listen?: (plan: ListenPlan) => Promise<void>;
  stopSound?: () => void;
}) {
  const t = translator(lang);
  const lesson = lessons.find((l) => l.id === lessonId);
  if (lesson) {
    // Every lesson has a walk-through: the content schema requires one.
    const guide = lessonGuides[lesson.id as TopicId];
    return (
      <article className="lens-read lesson-article">
        <LessonConnections topic={lesson.id as TopicId} lang={lang} />
        <section className="lesson-goal">
          <h2>
            {
              nt('What you will learn', 'Чему вы научитесь', 'Das lernst du')[
                lang
              ]
            }
          </h2>
          <p className="prose">
            <NoteText text={lesson.summary} lang={lang} />
          </p>
        </section>
        {/* The question the explanation answers, asked before it begins. */}
        <p className="lesson-question">
          <span>{guideLabels.question[lang]}</span>
          <NoteText text={guide.question} lang={lang} />
        </p>
        <h2>
          {nt('How it works', 'Как это устроено', 'So funktioniert es')[lang]}
        </h2>
        {lesson.paragraphs.map((p, i) => (
          <p className="prose" key={i}>
            <NoteText text={p} lang={lang} />
          </p>
        ))}
        {/* One example, one step at a time, with the lesson's own numbers. */}
        <section className="lesson-example">
          <h2>{guideLabels.example[lang]}</h2>
          {/* An explicit list role: the markers are drawn, and a list
              without native markers is not announced as one everywhere. */}
          <ol role="list">
            {guide.example.map((step, index) => (
              <li key={index}>
                {/* One box beside the number. A Russian step is several
                    runs of text and italic note names; set straight into
                    the row's grid, each run became a cell of its own and
                    the sentence fell apart into one line per note name. */}
                <span>
                  <NoteText text={step} lang={lang} />
                </span>
              </li>
            ))}
          </ol>
        </section>
        <h2>
          {nt('At a glance', 'Коротко о главном', 'Auf einen Blick')[lang]}
        </h2>
        <div className="formula">
          <NoteText text={lesson.formula} lang={lang} />
        </div>
        <NotationReading topic={lesson.id} lang={lang} />
        {/* Hearing comes before the question: the reader meets the sound the
            text describes, then is asked about it. On a wide page this card
            stays beside the text for the whole lesson. */}
        <aside className="lesson-experiment">
          <div className="eyebrow">
            <Headphones size={16} aria-hidden="true" />
            {t('MAKE IT AUDIBLE', 'УСЛЫШЬТЕ ЭТО')}
          </div>
          {/* A second-level heading like its siblings: as the page's only h3
              it read as a subsection of whatever happened to precede it. */}
          <h2>{t('Try it in the lab', 'Попробуйте в лаборатории')}</h2>
          <p>
            <NoteText text={lesson.experiment} lang={lang} />
          </p>
          {/* What the ear should look for, beside the buttons that sound it. */}
          <p className="listen-for">
            <strong>{guideLabels.listen[lang]}:</strong>{' '}
            <NoteText text={guide.listen} lang={lang} />
          </p>
          {listen &&
            stopSound && (
              // Keyed on the lesson: the next lesson's first button must not
              // inherit "sounding" from the example that was playing in this one.
              <LessonListen
                key={lesson.id}
                topic={lesson.id as TopicId}
                lang={lang}
                play={listen}
                stop={stopSound}
              />
            )}
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
        {/* The confusion this lesson's own feedback corrects, named before the
            reader meets it in a question. */}
        <aside className="lesson-mistake">
          <h2>{guideLabels.mistake[lang]}</h2>
          <p>
            <NoteText text={guide.mistake} lang={lang} />
          </p>
        </aside>
        {/* Explain, show and sound the musical example before asking the reader to apply it. */}
        <InlineExercise
          key={`${lesson.id}-${anchor ?? ''}-${lang}`}
          lang={lang}
          topic={lesson.id}
          anchor={anchor}
        />
        {/* What to carry into the next lesson, in the lesson's own words. */}
        <section className="lesson-takeaways">
          <h2>{guideLabels.takeaways[lang]}</h2>
          <ul role="list">
            {guide.takeaways.map((point, index) => (
              <li key={index}>
                <NoteText text={point} lang={lang} />
              </li>
            ))}
          </ul>
        </section>
        <a
          className="source-link"
          href={lesson.source}
          target="_blank"
          rel="noreferrer"
        >
          {t('Further reading', 'Для дальнейшего чтения')}
          <ArrowUpRight size={15} />
        </a>
        {/* The reader's own marker belongs at the end of the lesson it marks. */}
        <LessonProgress topic={lesson.id as TopicId} lang={lang} />
        <LessonNavigation topic={lesson.id as TopicId} lang={lang} />
      </article>
    );
  }
  return (
    <div className="lens-read course-home">
      <CourseResume lang={lang} recent={recent} />
      <CourseIndex route={{ lang, lens: 'read', topic: null, anchor: null }} />
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
  const entryRef = useRef<HTMLElement>(null);
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
    de: 'Versuche „Tonhöhe“, „Stimmung“ oder eine kürzere Suche.',
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
                  onClick={() => {
                    setOpened(term.title.en);
                    // On a narrow page the entry is below the list. Bring it
                    // into view once it has rendered; beside the list it is
                    // already visible and nothing moves.
                    requestAnimationFrame(() =>
                      entryRef.current?.scrollIntoView?.({ block: 'nearest' }),
                    );
                  }}
                >
                  {/* Hue never carries the meaning alone: the kind is also
                      written out, so the index survives deuteranopia and print. */}
                  <span className="kind-bar" data-kind={kindOf(term)} />
                  <span className="term-name">
                    <NoteText text={term.title} lang={lang} />
                  </span>
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
              <p>
                <NoteText text={hint} lang={lang} />
              </p>
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
          <article className="term-entry" ref={entryRef}>
            <p className="term-entry-kind">
              <span className="kind-bar" data-kind={kindOf(entry)} />
              {kindName[kindOf(entry)]} ·{' '}
              <NoteText
                text={topicById[entry.lesson as TopicId].title}
                lang={lang}
              />
            </p>
            <h2>
              <NoteText text={entry.title} lang={lang} />
            </h2>
            <p>
              <NoteText text={entry.body} lang={lang} />
            </p>
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
            {entry.source !== undefined && (
              <a
                className="source-link"
                href={entry.source.url}
                target="_blank"
                rel="noreferrer"
              >
                {entry.source.title}
              </a>
            )}
            {entry.furtherSources !== undefined &&
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
            {entry.relatedTopics !== undefined &&
              entry.relatedTopics.map((id) => (
                <a
                  key={id}
                  className="text-button"
                  href={hashOf({ lang, lens: 'read', topic: id, anchor: null })}
                >
                  <NoteText text={topicById[id as TopicId].title} lang={lang} />
                </a>
              ))}
            {entry.forwardModules !== undefined &&
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
 * reason they left. Session misses guide the next draw. The separate local
 * profile keeps answer counts across sessions, without claiming mastery.
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
export function resetPracticeSession() {
  saveLedger(EMPTY_LEDGER);
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
 * `topic` scopes it. `#/<lang>/drill` interleaves every rule for mixed practice;
 * `#/<lang>/t/<topic>/drill` narrows it to the rules one passage teaches.
 */
export function Practice({
  lang,
  topic,
}: {
  lang: Lang;
  topic: string | null;
}) {
  if (
    topic &&
    Object.hasOwn(paragraphAnchors, topic) &&
    paragraphAnchors[topic as TopicId].length === 0
  )
    return (
      <section className="practice-unavailable">
        <p>
          {
            nt(
              'This lesson has no scored exercise yet. Use its experiment and explanation to explore the topic.',
              'Для этого урока пока нет оцениваемого упражнения. Исследуйте тему с помощью эксперимента и объяснения.',
              'Für diese Lektion gibt es noch keine bewertete Aufgabe. Erkunde das Thema mit dem Experiment und der Erklärung.',
            )[lang]
          }
        </p>
        {/* Two ways on, drawn as the two actions they are: bare links here
            took the page's ink and ran together as one unreadable phrase. */}
        <div className="practice-unavailable-actions">
          <a
            className="primary-button"
            href={hashOf({ lang, topic, lens: 'play', anchor: null })}
          >
            {nt('Open the lab', 'Открыть лабораторию', 'Labor öffnen')[lang]}
          </a>
          <a
            className="text-button"
            href={hashOf({ lang, topic, lens: 'read', anchor: null })}
          >
            {nt('Read the lesson', 'Читать урок', 'Lektion lesen')[lang]}
          </a>
        </div>
      </section>
    );
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
  const [drawn, setDrawn] = useState<QuestionDraw>(
    () =>
      dueQuestion(
        profileStore.getSnapshot().profile.coaching.knowledge,
        eligible,
      ) ?? { rule: eligible[0], seed: 1, check: false },
  );
  const [chosen, setChosen] = useState<string | null>(null);
  const [hints, setHints] = useState(0);
  const { profile } = useLocalProfile();
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
    saveAnswers(item.rule, [resultFor(id)], {
      seed: drawn.seed,
      assisted: hints > 0,
      check: drawn.check,
    });
    saveLedger(recordAnswer(ledger, item.rule, resultFor(id)));
  };
  const nextQuestion = () => {
    setDrawn(
      (previous) =>
        dueQuestion(
          profileStore.getSnapshot().profile.coaching.knowledge,
          eligible,
        ) ?? {
          rule: drawRule(eligible, ledger, Math.random()),
          seed: nextSeed(previous.seed),
          check: false,
        },
    );
    setChosen(null);
    setHints(0);
  };
  const startOver = () => {
    saveLedger(EMPTY_LEDGER);
    setDrawn(
      dueQuestion(
        profileStore.getSnapshot().profile.coaching.knowledge,
        eligible,
      ) ?? { rule: eligible[0], seed: 1, check: false },
    );
    setChosen(null);
    setHints(0);
  };
  const missedAny = eligible.some((r) => (ledger.get(r)?.missed ?? 0) > 0);
  return (
    <div className="lens-drill" data-lens="drill">
      <section className="drill-question">
        <div className="eyebrow">
          <NoteText text={topicById[ruleTopic[rule]].title} lang={lang} />
        </div>
        <p className="drill-skill">
          <NoteText text={ruleLabels[rule]} lang={lang} />
        </p>
        {drawn.check && <p className="later-check">{checkLabel[lang]}</p>}
        <PracticeHints
          lang={lang}
          hints={practiceHints[item.kind]}
          shown={hints}
          onHint={() => setHints(hints + 1)}
          answered={chosen !== null}
        />
        {item.review || item.parts ? (
          <NotationResponse
            key={`${rule}-${drawn.seed}-${lang}`}
            item={item}
            onComplete={(results) => {
              if (chosen !== null) return;
              saveAnswers(
                item.rule,
                results.map((correct, index) => ({
                  correct,
                  tag: correct
                    ? 'correct'
                    : item.parts?.[index].kind === 'rhythm'
                      ? 'duration-symbol'
                      : 'wrong-written-note',
                })),
                { seed: drawn.seed, assisted: hints > 0, check: drawn.check },
              );
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
            <h2 className="exercise-prompt">
              <NoteText
                text={item.prompt}
                markup={item.promptMarkup}
                lang={lang}
              />
            </h2>
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
                  <span>
                    <NoteText
                      text={option.label}
                      markup={option.labelMarkup}
                      lang={lang}
                    />
                  </span>
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
            <NoteText text={exerciseExplanations[verdict.tag]} lang={lang} />
            {item.explanation && (
              <span>
                {' '}
                <NoteText
                  text={item.explanation}
                  markup={item.explanationMarkup}
                  lang={lang}
                />
              </span>
            )}
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
        {chosen !== null && !item.review && (
          <>
            <AttemptNotice
              lang={lang}
              assisted={hints > 0}
              check={drawn.check}
              pending={profile.coaching.knowledge[rule]?.pending ?? null}
            />
            <a
              className="text-button"
              href={hashOf({
                lang,
                topic: ruleTopic[rule],
                lens: 'read',
                anchor: rule,
              })}
            >
              {
                nt(
                  'Review this explanation',
                  'Повторить объяснение',
                  'Erklärung wiederholen',
                )[lang]
              }
            </a>
          </>
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
      {topics
        .filter((topic) => rules.some((rule) => ruleTopic[rule] === topic.id))
        .map((group) => (
          <section
            className="ledger-group"
            key={group.id}
            aria-labelledby={`drill-group-${group.id}`}
          >
            <h3 id={`drill-group-${group.id}`}>
              <a
                href={hashOf({
                  lang,
                  lens: 'drill',
                  topic: group.id,
                  anchor: null,
                })}
              >
                <NoteText text={group.title} lang={lang} />
              </a>
            </h3>
            <dl className="ledger-rows">
              {rules
                .filter((rule) => ruleTopic[rule] === group.id)
                .map((rule) => {
                  const row = ledger.get(rule);
                  const topic = ruleTopic[rule];
                  return (
                    <div
                      key={rule}
                      data-rule={rule}
                      className="ledger-row"
                      data-missed={row && row.missed > 0 ? 'yes' : undefined}
                    >
                      <dt>
                        <span className="rule-name">
                          <NoteText text={ruleLabels[rule]} lang={lang} />
                        </span>
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
                        {row?.tag && (
                          <p>
                            <NoteText
                              text={exerciseExplanations[row.tag]}
                              lang={lang}
                            />
                          </p>
                        )}
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
          </section>
        ))}
      <button className="text-button" onClick={onStartOver}>
        {t('Start a new session', 'Начать новую сессию')}
      </button>
    </details>
  );
}
