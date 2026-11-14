import { Check, X } from 'lucide-react';
import { localizedText as text } from '@/lib/i18n';
import type { Lang } from '@/lib/client-store';

/** What the mark on an answered option means, for readers who cannot see it. */
export const answerMarks = {
  correct: text('correct answer', 'правильный ответ', 'richtige Antwort'),
  chosen: text('your answer', 'ваш ответ', 'deine Antwort'),
};

/**
 * The mark on an answered option: the right answer, or the reader's own wrong
 * choice. An icon and words as well as a tint, because the two tints are
 * equally dark and a tint says nothing to a screen reader or without colour.
 */
export function AnswerMark({
  kind,
  lang,
}: {
  kind: keyof typeof answerMarks;
  lang: Lang;
}) {
  const Icon = kind === 'correct' ? Check : X;
  return (
    <>
      <Icon size={18} aria-hidden="true" />
      <span className="sr-only">{answerMarks[kind][lang]}</span>
    </>
  );
}
