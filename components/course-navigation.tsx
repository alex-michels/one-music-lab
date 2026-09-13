'use client';

import { localizedText as text } from '@/lib/i18n';
import { hashOf, type Lang, type Lens, type Route } from '@/lib/client-store';
import {
  chaptersFor,
  course,
  lessonAvailable,
  lessonBridges,
  lessonPosition,
} from '@/lib/course';
import {
  topicById,
  termsByTopic,
  termAnchor,
  type TopicId,
} from '@/lib/topics';
import { NoteText } from './note-text';
import { EntryDiagnostic } from './entry-diagnostic';

const labels = {
  contents: text('Chapter contents', 'Оглавление главы', 'Kapitelinhalt'),
  all: text('All chapters', 'Все главы', 'Alle Kapitel'),
  before: text('Before you begin', 'Перед началом', 'Vor dem Einstieg'),
  none: text(
    'No previous lessons needed.',
    'Предыдущие уроки не требуются.',
    'Keine vorherigen Lektionen nötig.',
  ),
  lesson: text('Lesson', 'Урок', 'Lektion'),
  previous: text('Previous lesson', 'Предыдущий урок', 'Vorige Lektion'),
  next: text('Next lesson', 'Следующий урок', 'Nächste Lektion'),
  newChapter: text('Next chapter', 'Следующая глава', 'Nächstes Kapitel'),
  read: text('Read the lesson', 'Читать урок', 'Lektion lesen'),
  absent: text(
    'No scored exercise for this lesson. Use its lab experiment.',
    'Для этого урока нет оцениваемого упражнения. Используйте его лабораторный эксперимент.',
    'Für diese Lektion gibt es keine bewertete Aufgabe. Nutze ihr Laborexperiment.',
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

/** The same section/chapter hierarchy in all four indexes. */
export function CourseIndex({ route }: { route: Route }) {
  const { lang, lens, collection } = route;
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
            {visible.map((chapter) => (
              <section className="course-chapter" key={chapter.id}>
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
                            <NoteText text={topicById[id].title} lang={lang} />
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    labels.none[lang]
                  )}
                </div>
                <ol role="list" className="chapter-lessons">
                  {chapter.lessons.map((id) => (
                    <li key={id}>
                      {lessonAvailable(id, lens) ? (
                        <a href={topicHref(lang, lens, id)}>
                          <NoteText text={topicById[id].title} lang={lang} />
                        </a>
                      ) : (
                        <>
                          <a href={topicHref(lang, 'read', id)}>
                            <NoteText text={topicById[id].title} lang={lang} />
                          </a>
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
                  ))}
                </ol>
              </section>
            ))}
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
      <p>
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
          <span>{labels.previous[lang]}</span>
          <NoteText text={topicById[previous].title} lang={lang} />
        </a>
      )}
      {next ? (
        <a rel="next" href={topicHref(lang, 'read', next)}>
          <span>
            {nextChapter !== chapter
              ? `${labels.newChapter[lang]}: ${nextChapter!.title[lang]}`
              : labels.next[lang]}
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
