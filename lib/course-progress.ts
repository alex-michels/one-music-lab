import { chapters, readingOrder, type Chapter } from './course';
import { routeFromHash } from './client-store';
import type { TopicId } from './topics';

/**
 * Where a reader stands in the book, worked out from what the local profile
 * already stores: their own "worked through" markers and the last learning
 * address. Nothing here is a grade. A marker is the reader's statement about a
 * lesson, so a count of markers is a count of statements, and every caption
 * that prints one says so.
 */
export type Progress = { done: number; total: number };

/** Markers that still name a lesson of the book, without repeats. */
function marked(completed: readonly string[]): Set<string> {
  return new Set(
    completed.filter((id) => readingOrder.includes(id as TopicId)),
  );
}

export function chapterProgress(
  chapter: Chapter,
  completed: readonly string[],
): Progress {
  const done = marked(completed);
  return {
    done: chapter.lessons.filter((id) => done.has(id)).length,
    total: chapter.lessons.length,
  };
}

export function courseProgress(completed: readonly string[]): Progress {
  return { done: marked(completed).size, total: readingOrder.length };
}

/**
 * The lesson a saved address was reading, or null.
 *
 * Only the reading view counts. The Chords lab is the play view of the chords
 * topic and is also a tool in the main navigation, so "the last address named
 * a topic" would turn one visit to an instrument into a lesson in progress.
 */
export function lessonReadAt(address: string | null): TopicId | null {
  if (!address) return null;
  const route = routeFromHash(address, { lang: 'en', topics: readingOrder });
  return route.lens === 'read' ? (route.topic as TopicId | null) : null;
}

export type ResumePoint = {
  topic: TopicId;
  chapter: Chapter;
  /** 1-based position inside the chapter, as the lesson pages print it. */
  position: number;
  /**
   * `start`: nothing is marked and no lesson was opened.
   * `resume`: the lesson the reader last had open and has not marked.
   * `next`: the first unmarked lesson in reading order.
   */
  reason: 'start' | 'resume' | 'next';
};

/**
 * The lesson to offer next, or null once every lesson carries a marker.
 *
 * The last opened lesson wins while it is unmarked. Otherwise the book offers
 * its first unmarked lesson rather than the one after the last marker, so a
 * lesson skipped on purpose is offered again instead of being silently treated
 * as read.
 */
export function resumePoint(
  completed: readonly string[],
  lastLesson: string | null,
): ResumePoint | null {
  const done = marked(completed);
  const at = (topic: TopicId, reason: ResumePoint['reason']): ResumePoint => {
    const chapter = chapters.find((entry) => entry.lessons.includes(topic))!;
    return {
      topic,
      chapter,
      position: chapter.lessons.indexOf(topic) + 1,
      reason,
    };
  };
  const last = readingOrder.find((id) => id === lastLesson);
  if (last && !done.has(last)) return at(last, 'resume');
  const next = readingOrder.find((id) => !done.has(id));
  if (!next) return null;
  // An opened-and-unmarked lesson returned above, so no marker means no start.
  return at(next, done.size === 0 ? 'start' : 'next');
}
