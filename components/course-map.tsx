'use client';
import { useEffect, useRef } from 'react';
import { Check } from 'lucide-react';
import { localizedText as text } from '@/lib/i18n';
import { hashOf, type Lang } from '@/lib/client-store';
import { course, lessonPosition } from '@/lib/course';
import {
  chapterProgress,
  courseProgress,
  resumePoint,
} from '@/lib/course-progress';
import { topicById } from '@/lib/topics';
import { NoteText } from './note-text';
import { useLocalProfile } from './local-data';

const labels = {
  course: text('Course', 'Курс', 'Kurs'),
  contents: text('Course contents', 'Содержание курса', 'Kursinhalt'),
  marked: text('Worked through', 'Проработано', 'Durchgearbeitet'),
  of: text('of', 'из', 'von'),
  done: text('worked through', 'проработан', 'durchgearbeitet'),
};

/**
 * The book's table of contents, where the reader can always see it.
 *
 * Sections, chapters and lessons in reading order, with the open lesson marked
 * and the reader's own "worked through" markers beside each title. The chapter
 * that holds the open lesson is expanded; with no lesson open it is the chapter
 * of the lesson the book would offer next, so the map opens where the reader
 * left off rather than at chapter one.
 *
 * A marker is drawn as a check and also said in words: colour and shape are
 * never the only channel. The count is the reader's own markers, not a grade.
 */
export function CourseMap({
  lang,
  topic,
  recent,
  onNavigate,
}: {
  lang: Lang;
  /** The lesson the address names, in whichever view it is open. */
  topic: string | null;
  /** The lesson last read, when the address names none. */
  recent: string | null;
  /** Closes the mobile sheet; the address change does the navigation. */
  onNavigate?: () => void;
}) {
  const { profile } = useLocalProfile();
  const total = courseProgress(profile.completed);
  const open =
    lessonPosition(topic)?.chapter ??
    resumePoint(profile.completed, recent)?.chapter ??
    null;
  const map = useRef<HTMLElement>(null);
  // The panel scrolls on its own, and the book is usually taller than it. When
  // the open lesson changes, bring its entry into view there; `nearest` moves
  // only as far as needed and not at all when the entry is already visible.
  useEffect(() => {
    map.current
      ?.querySelector('[aria-current="page"]')
      ?.scrollIntoView?.({ block: 'nearest' });
  }, [topic]);
  return (
    <nav className="course-map" aria-label={labels.contents[lang]} ref={map}>
      <div className="course-map-head">
        <a
          className="nav-label"
          href={hashOf({ lang, lens: 'read', topic: null, anchor: null })}
          onClick={onNavigate}
        >
          {labels.course[lang]}
        </a>
        <span className="course-map-count">
          {labels.marked[lang]}:{' '}
          <span className="num">
            {total.done} {labels.of[lang]} {total.total}
          </span>
        </span>
      </div>
      <div className="course-map-meter" aria-hidden="true">
        <span style={{ inlineSize: `${(total.done / total.total) * 100}%` }} />
      </div>
      {course.map((section) => (
        <div className="course-map-section" key={section.id}>
          <p>{section.title[lang]}</p>
          {section.chapters.map((chapter) => {
            const progress = chapterProgress(chapter, profile.completed);
            return (
              <details key={chapter.id} open={chapter === open}>
                <summary>
                  <span>{chapter.title[lang]}</span>
                  <span className="num">
                    {progress.done}/{progress.total}
                  </span>
                </summary>
                <ol role="list">
                  {chapter.lessons.map((id) => {
                    const done = profile.completed.includes(id);
                    return (
                      <li key={id}>
                        <a
                          href={hashOf({
                            lang,
                            lens: 'read',
                            topic: id,
                            anchor: null,
                          })}
                          aria-current={topic === id ? 'page' : undefined}
                          onClick={onNavigate}
                        >
                          <span
                            className="course-map-mark"
                            data-done={done || undefined}
                            aria-hidden="true"
                          >
                            {done && <Check size={11} strokeWidth={3} />}
                          </span>
                          <span>
                            <NoteText text={topicById[id].title} lang={lang} />
                            {done && (
                              <span className="sr-only">
                                {' '}
                                ({labels.done[lang]})
                              </span>
                            )}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ol>
              </details>
            );
          })}
        </div>
      ))}
    </nav>
  );
}
