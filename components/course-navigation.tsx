'use client';

import { ArrowLeft, ArrowRight, Check } from 'lucide-react';
import { localizedText as text } from '@/lib/i18n';
import { hashOf, type Lang, type Lens, type Route } from '@/lib/client-store';
import {
  chapters,
  chaptersFor,
  course,
  lessonAvailable,
  lessonBridges,
  lessonPosition,
} from '@/lib/course';
import {
  chapterProgress,
  courseProgress,
  resumePoint,
} from '@/lib/course-progress';
import {
  topicById,
  termsByTopic,
  termAnchor,
  type TopicId,
} from '@/lib/topics';
import { NoteText } from './note-text';
import { EntryDiagnostic } from './entry-diagnostic';
import { useLocalProfile } from './local-data';

const labels = {
  contents: text('Chapter contents', 'Оглавление главы', 'Kapitelinhalt'),
  all: text('All chapters', 'Все главы', 'Alle Kapitel'),
  before: text('Before you begin', 'Перед началом', 'Vor dem Einstieg'),
  none: text(
    'No previous lessons needed.',
    'Предыдущие уроки не требуются.',
    'Keine vorherigen Lektionen nötig.',
  ),
  chapter: text('Chapter', 'Глава', 'Kapitel'),
  lesson: text('Lesson', 'Урок', 'Lektion'),
  previous: text('Previous lesson', 'Предыдущий урок', 'Vorige Lektion'),
  next: text('Next lesson', 'Следующий урок', 'Nächste Lektion'),
  newChapter: text('Next chapter', 'Следующая глава', 'Nächstes Kapitel'),
  read: text('Read the lesson', 'Читать урок', 'Lektion lesen'),
  marked: text('Worked through', 'Проработано', 'Durchgearbeitet'),
  of: text('of', 'из', 'von'),
  done: text('worked through', 'проработан', 'durchgearbeitet'),
  absent: text(
    'No scored exercise for this lesson. Use its lab experiment.',
    'Для этого урока нет оцениваемого упражнения. Используйте его лабораторный эксперимент.',
    'Für diese Lektion gibt es keine bewertete Aufgabe. Nutze ihr Laborexperiment.',
  ),
};

const resume = {
  start: {
    eyebrow: text('START HERE', 'НАЧНИТЕ ЗДЕСЬ', 'HIER BEGINNEN'),
    action: text(
      'Start the first lesson',
      'Начать первый урок',
      'Erste Lektion beginnen',
    ),
  },
  resume: {
    eyebrow: text('CONTINUE', 'ПРОДОЛЖИТЬ', 'WEITERMACHEN'),
    action: text(
      'Continue this lesson',
      'Продолжить урок',
      'Lektion fortsetzen',
    ),
  },
  next: {
    eyebrow: text(
      'YOUR NEXT LESSON',
      'СЛЕДУЮЩИЙ УРОК',
      'DEINE NÄCHSTE LEKTION',
    ),
    action: text('Open the lesson', 'Открыть урок', 'Lektion öffnen'),
  },
  finished: text(
    'You have marked every lesson. Revisit any chapter below, or strengthen a skill in practice.',
    'Вы отметили все уроки. Вернитесь к любой главе ниже или закрепите навык в практике.',
    'Du hast jede Lektion markiert. Wiederhole unten ein Kapitel oder festige eine Fertigkeit beim Üben.',
  ),
  note: text(
    'The count is your own “worked through” markers, not a skill assessment.',
    'Счёт ведётся по вашим отметкам «проработано»; это не оценка навыка.',
    'Gezählt werden deine eigenen Markierungen „durchgearbeitet“, keine Bewertung deiner Fähigkeiten.',
  ),
};

const topicHref = (lang: Lang, lens: Lens, topic: string) =>
  hashOf({ lang, lens, topic, anchor: null });
const collectionHref = (
  lang: Lang,
  lens: Lens,
  kind: 'section' | 'chapter',
  id: string,
) =>
  hashOf({ lang, lens, topic: null, anchor: null, collection: { kind, id } });

/**
 * Where to go next, above the contents of the book.
 *
 * A reader who returns to the index wants one thing first: the lesson they
 * were in, or the next one. This states it with its chapter, its place in that
 * chapter and the sentence that connects it to what came before. It never
 * hides the rest of the book and never claims a lesson is mastered.
 */
export function CourseResume({
  lang,
  recent,
}: {
  lang: Lang;
  /** The lesson last opened for reading, if there was one. */
  recent: string | null;
}) {
  const { profile } = useLocalProfile();
  const point = resumePoint(profile.completed, recent);
  const progress = courseProgress(profile.completed);
  const tally = (
    <p className="course-resume-progress">
      {labels.marked[lang]}:{' '}
      <span className="num">
        {progress.done} {labels.of[lang]} {progress.total}
      </span>
      . {resume.note[lang]}
    </p>
  );
  if (!point)
    return (
      <section className="course-resume">
        <p>{resume.finished[lang]}</p>
        {tally}
      </section>
    );
  const copy = resume[point.reason];
  return (
    <section className="course-resume" aria-labelledby="course-resume-title">
      <p className="eyebrow">{copy.eyebrow[lang]}</p>
      <h2 id="course-resume-title">
        <NoteText text={topicById[point.topic].title} lang={lang} />
      </h2>
      <p className="course-resume-place">
        {point.chapter.title[lang]} · {labels.lesson[lang]} {point.position} /{' '}
        {point.chapter.lessons.length}
      </p>
      <p>
        <NoteText text={lessonBridges[point.topic]} lang={lang} />
      </p>
      <a className="primary-button" href={topicHref(lang, 'read', point.topic)}>
        {copy.action[lang]}
        <ArrowRight size={16} aria-hidden="true" />
      </a>
      {tally}
    </section>
  );
}

/** The same section/chapter hierarchy in all four indexes. */
export function CourseIndex({ route }: { route: Route }) {
  const { lang, lens, collection } = route;
  const { profile } = useLocalProfile();
  const selected = chaptersFor(collection);
  return (
    <div className="course-index">
      {lens === 'read' && !collection && <EntryDiagnostic lang={lang} />}
      {course.map((section) => {
        const visible = section.chapters.filter((chapter) =>
          selected.includes(chapter),
        );
        if (!visible.length) return null;
        return (
          <section className="course-section" key={section.id}>
            <h2>
              <a href={collectionHref(lang, lens, 'section', section.id)}>
                {section.title[lang]}
              </a>
            </h2>
            <p>{section.introduction[lang]}</p>
            {visible.map((chapter) => {
              const progress = chapterProgress(chapter, profile.completed);
              return (
                <section className="course-chapter" key={chapter.id}>
                  <div className="course-chapter-head">
                    <span className="course-chapter-number">
                      {labels.chapter[lang]} {chapters.indexOf(chapter) + 1}
                    </span>
                    <span className="course-chapter-progress">
                      {labels.marked[lang]}:{' '}
                      <span className="num">
                        {progress.done} / {progress.total}
                      </span>
                    </span>
                  </div>
                  <h3>
                    <a href={collectionHref(lang, lens, 'chapter', chapter.id)}>
                      {chapter.title[lang]}
                    </a>
                  </h3>
                  <p>{chapter.goal[lang]}</p>
                  <div className="chapter-prerequisites">
                    <strong>{labels.before[lang]}: </strong>
                    {chapter.prerequisites.length ? (
                      <ul role="list">
                        {chapter.prerequisites.map((id) => (
                          <li key={id}>
                            <a href={topicHref(lang, 'read', id)}>
                              <NoteText
                                text={topicById[id].title}
                                lang={lang}
                              />
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      labels.none[lang]
                    )}
                  </div>
                  <ol role="list" className="chapter-lessons">
                    {chapter.lessons.map((id) => {
                      const done = profile.completed.includes(id);
                      const mark = done && (
                        <span className="lesson-done">
                          <Check size={13} strokeWidth={3} aria-hidden="true" />
                          <span className="sr-only">{labels.done[lang]}</span>
                        </span>
                      );
                      return (
                        <li key={id}>
                          {lessonAvailable(id, lens) ? (
                            <>
                              <a href={topicHref(lang, lens, id)}>
                                <NoteText
                                  text={topicById[id].title}
                                  lang={lang}
                                />
                              </a>
                              {mark}
                            </>
                          ) : (
                            <>
                              <a href={topicHref(lang, 'read', id)}>
                                <NoteText
                                  text={topicById[id].title}
                                  lang={lang}
                                />
                              </a>
                              {mark}
                              <p className="course-unavailable">
                                {labels.absent[lang]}{' '}
                                <a href={topicHref(lang, 'play', id)}>
                                  {
                                    text(
                                      'Open the lab',
                                      'Открыть лабораторию',
                                      'Labor öffnen',
                                    )[lang]
                                  }
                                </a>
                              </p>
                            </>
                          )}
                        </li>
                      );
                    })}
                  </ol>
                </section>
              );
            })}
          </section>
        );
      })}
    </div>
  );
}

/** Context remains visible in theory, experiment, exercise and reference views. */
export function CourseNavigation({ route }: { route: Route }) {
  const { lang, lens, topic, collection } = route;
  const position = lessonPosition(topic);
  if (!position && !collection) {
    return lens === 'read' ? null : (
      <details className="course-browse">
        <summary>{labels.all[lang]}</summary>
        <CourseIndex route={route} />
      </details>
    );
  }
  const section =
    position?.section ??
    course.find((part) =>
      collection?.kind === 'section'
        ? part.id === collection.id
        : part.chapters.some((chapter) => chapter.id === collection?.id),
    );
  return (
    <div className="course-context">
      <nav
        aria-label={text('Learning path', 'Учебный маршрут', 'Lernweg')[lang]}
        className="course-breadcrumbs"
      >
        <ol role="list">
          <li>
            <a href={hashOf({ lang, lens, topic: null, anchor: null })}>
              {labels.all[lang]}
            </a>
          </li>
          {section && (
            <li>
              <a
                href={collectionHref(lang, lens, 'section', section.id)}
                aria-current={
                  collection?.kind === 'section' ? 'page' : undefined
                }
              >
                {section.title[lang]}
              </a>
            </li>
          )}
          {position && (
            <li>
              <a
                href={collectionHref(
                  lang,
                  lens,
                  'chapter',
                  position.chapter.id,
                )}
              >
                {position.chapter.title[lang]}
              </a>
            </li>
          )}
        </ol>
      </nav>
      {position && (
        <details
          className="chapter-contents"
          key={`${position.chapter.id}-${lens}`}
        >
          <summary>
            {labels.contents[lang]} · {labels.lesson[lang]}{' '}
            {position.inChapter + 1} / {position.chapter.lessons.length}
          </summary>
          <ol role="list">
            {position.chapter.lessons.map((id) => (
              <li key={id}>
                <a
                  href={topicHref(
                    lang,
                    lessonAvailable(id, lens) ? lens : 'read',
                    id,
                  )}
                  aria-current={topic === id ? 'page' : undefined}
                >
                  <NoteText text={topicById[id].title} lang={lang} />
                  {!lessonAvailable(id, lens) && (
                    <span> — {labels.read[lang]}</span>
                  )}
                </a>
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}

export function LessonConnections({
  topic,
  lang,
}: {
  topic: TopicId;
  lang: Lang;
}) {
  const position = lessonPosition(topic)!;
  const prerequisites =
    position.inChapter > 0
      ? [position.chapter.lessons[position.inChapter - 1]]
      : position.chapter.prerequisites;
  return (
    <aside className="lesson-connections">
      <p className="lesson-bridge">
        <NoteText text={lessonBridges[topic]} lang={lang} />
      </p>
      <div className="chapter-prerequisites">
        <strong>{labels.before[lang]}: </strong>
        {prerequisites.length ? (
          <ul role="list">
            {prerequisites.map((id) => (
              <li key={id}>
                <a href={topicHref(lang, 'read', id)}>
                  <NoteText text={topicById[id].title} lang={lang} />
                </a>
              </li>
            ))}
          </ul>
        ) : (
          labels.none[lang]
        )}
      </div>
      <details className="lesson-definitions">
        <summary>
          {
            text(
              'Definitions for this lesson',
              'Определения к этому уроку',
              'Begriffe zu dieser Lektion',
            )[lang]
          }
        </summary>
        <ul role="list">
          {termsByTopic[topic].map((term) => (
            <li key={termAnchor(term)}>
              <a
                href={hashOf({
                  lang,
                  lens: 'define',
                  topic,
                  anchor: termAnchor(term),
                })}
              >
                <NoteText text={term.title} lang={lang} />
              </a>
            </li>
          ))}
        </ul>
      </details>
    </aside>
  );
}

export function LessonNavigation({
  topic,
  lang,
}: {
  topic: TopicId;
  lang: Lang;
}) {
  const position = lessonPosition(topic)!;
  const { previous, next, chapter } = position;
  const nextChapter = next ? lessonPosition(next)!.chapter : null;
  return (
    <nav
      className="lesson-navigation"
      aria-label={
        text('Lesson sequence', 'Последовательность уроков', 'Lektionsfolge')[
          lang
        ]
      }
    >
      <p className="eyebrow">
        {chapter.title[lang]} · {labels.lesson[lang]} {position.inChapter + 1} /{' '}
        {chapter.lessons.length}
      </p>
      {previous && (
        <a rel="prev" href={topicHref(lang, 'read', previous)}>
          <span>
            <ArrowLeft size={14} aria-hidden="true" />
            {labels.previous[lang]}
          </span>
          <NoteText text={topicById[previous].title} lang={lang} />
        </a>
      )}
      {next ? (
        <a rel="next" href={topicHref(lang, 'read', next)}>
          <span>
            {nextChapter !== chapter
              ? `${labels.newChapter[lang]}: ${nextChapter!.title[lang]}`
              : labels.next[lang]}
            <ArrowRight size={14} aria-hidden="true" />
          </span>
          <NoteText text={topicById[next].title} lang={lang} />
          <p>
            <NoteText text={lessonBridges[next]} lang={lang} />
          </p>
        </a>
      ) : (
        <div className="course-finish">
          <p>
            {
              text(
                'You have reached the end of the available reading route. Revisit a chapter, experiment, or practise a skill you want to strengthen.',
                'Вы дошли до конца доступного учебного маршрута. Вернитесь к главе, проведите эксперимент или потренируйте навык, который хотите закрепить.',
                'Du bist am Ende des verfügbaren Lernwegs angekommen. Wiederhole ein Kapitel, experimentiere oder übe eine Fertigkeit, die du festigen möchtest.',
              )[lang]
            }
          </p>
          <a href={hashOf({ lang, lens: 'read', topic: null, anchor: null })}>
            {labels.all[lang]}
          </a>
          <a href={topicHref(lang, 'drill', 'staff')}>
            {
              text(
                'Practise reading a passage',
                'Потренировать чтение фрагмента',
                'Einen Ausschnitt lesen üben',
              )[lang]
            }
          </a>
        </div>
      )}
    </nav>
  );
}
