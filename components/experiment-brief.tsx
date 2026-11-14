'use client';
import { ArrowLeft, ArrowRight, FlaskConical } from 'lucide-react';
import { localizedText as text } from '@/lib/i18n';
import { hashOf, type Lang } from '@/lib/client-store';
import { lessonAvailable } from '@/lib/course';
import { lessons } from '@/lib/learning';
import type { TopicId } from '@/lib/topics';
import { NoteText } from './note-text';

const labels = {
  title: text(
    'Experiment for this lesson',
    'Эксперимент к этому уроку',
    'Experiment zu dieser Lektion',
  ),
  back: text('Back to the lesson', 'Вернуться к уроку', 'Zurück zur Lektion'),
  practise: text('Practise this topic', 'Потренировать тему', 'Thema üben'),
};

/**
 * What to do in the laboratory, on the laboratory page.
 *
 * A lesson's play view used to open the whole instrument with its preset and
 * nothing else: the sentence that says what to try stayed behind in the text.
 * This repeats that sentence above the instrument and gives the two ways out,
 * back to the explanation and on to the questions when the topic has any.
 * It renders nothing for an address that names no lesson, which is the free lab.
 */
export function ExperimentBrief({
  topic,
  lang,
}: {
  topic: string | null;
  lang: Lang;
}) {
  const lesson = lessons.find((entry) => entry.id === topic);
  if (!lesson) return null;
  const id = lesson.id as TopicId;
  return (
    <aside
      className="experiment-brief"
      aria-labelledby="experiment-brief-title"
    >
      <span className="experiment-brief-icon" aria-hidden="true">
        <FlaskConical size={18} />
      </span>
      <div>
        <h2 id="experiment-brief-title">{labels.title[lang]}</h2>
        <p>
          <NoteText text={lesson.experiment} lang={lang} />
        </p>
        <div className="experiment-brief-links">
          <a href={hashOf({ lang, lens: 'read', topic: id, anchor: null })}>
            <ArrowLeft size={15} aria-hidden="true" />
            {labels.back[lang]}
          </a>
          {lessonAvailable(id, 'drill') && (
            <a href={hashOf({ lang, lens: 'drill', topic: id, anchor: null })}>
              {labels.practise[lang]}
              <ArrowRight size={15} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </aside>
  );
}
