'use client';
import { useState } from 'react';
import type { Item } from '@/lib/exercises';
import { nt } from '@/lib/notation-tasks';
import { NotationFigure } from './notation-figure';
import { Staff } from './staff';

/** Open rubric and per-note reading do not collapse into an all-or-nothing score. */
export function NotationResponse({
  item,
  onComplete,
}: {
  item: Item;
  onComplete: (correct: boolean[]) => void;
}) {
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const lang = item.lang;
  const parts = item.parts ?? [];
  const hasRhythm = parts.some((part) => part.kind === 'rhythm');
  const complete =
    parts.length > 0 && Object.keys(answers).length === parts.length;
  return (
    <div className="notation-response">
      <h2 className="exercise-prompt">{item.prompt}</h2>
      {item.figure && (
        <NotationFigure
          id={item.figure}
          label={
            nt(
              'Notation to inspect',
              'Нотная запись для изучения',
              'Zu untersuchende Notation',
            )[lang]
          }
        />
      )}
      {item.staff && (
        <>
          <p>4/4 · ♩ ♩ ♩ ♩</p>
          <Staff
            {...item.staff}
            lang={lang}
            space={13}
            label={
              nt(
                'Four notes to read in order',
                'Четыре ноты для чтения по порядку',
                'Vier nacheinander zu lesende Noten',
              )[lang]
            }
          />
        </>
      )}
      {item.review && (
        <>
          {!revealed && (
            <button
              className="primary-button"
              onClick={() => {
                setRevealed(true);
                onComplete([]);
              }}
            >
              {
                nt(
                  'Compare with the rubric',
                  'Сравнить с разбором',
                  'Mit den Kriterien vergleichen',
                )[lang]
              }
            </button>
          )}
          {revealed && (
            <output className="answer-feedback">{item.explanation}</output>
          )}
          {item.figure === 'beamed' || item.figure === 'flagged' ? (
            <NotationFigure
              id={item.figure === 'beamed' ? 'flagged' : 'beamed'}
              label={
                nt(
                  'Alternative grouping',
                  'Другая группировка',
                  'Andere Gruppierung',
                )[lang]
              }
            />
          ) : null}
        </>
      )}
      {parts.map((part, index) => (
        <fieldset key={index} disabled={answers[index] !== undefined}>
          <legend>{part.prompt}</legend>
          <div className="answer-grid">
            {part.options.map((option) => (
              <button
                key={option.id}
                onClick={() => {
                  const next = { ...answers, [index]: option.id };
                  setAnswers(next);
                  if (Object.keys(next).length === parts.length)
                    onComplete(
                      parts.map((entry, i) => next[i] === entry.answer),
                    );
                }}
                className={
                  answers[index] === option.id
                    ? option.id === part.answer
                      ? 'answer-correct'
                      : 'answer-wrong'
                    : ''
                }
              >
                {option.label}
              </button>
            ))}
          </div>
          {answers[index] !== undefined && (
            <output className="answer-feedback">
              {answers[index] === part.answer
                ? nt('Correct', 'Верно', 'Richtig')[lang]
                : part.kind === 'rhythm'
                  ? nt(
                      'Compare the written value and its context',
                      'Сравните длительность и её контекст',
                      'Vergleiche den Notenwert und seinen Kontext',
                    )[lang]
                  : nt(
                      'Compare the clef and position',
                      'Сравните ключ и положение',
                      'Vergleiche Schlüssel und Position',
                    )[lang]}
              : {part.answer}
              {part.explanation && <span> {part.explanation}</span>}
            </output>
          )}
        </fieldset>
      ))}
      {complete && (
        <output aria-live="polite">
          {
            (hasRhythm
              ? nt('Answers correct', 'Верных ответов', 'Richtige Antworten')
              : nt(
                  'Notes read correctly',
                  'Верно прочитано нот',
                  'Richtig gelesene Noten',
                ))[lang]
          }
          :{' '}
          {parts.filter((part, index) => part.answer === answers[index]).length}{' '}
          / {parts.length}
          {hasRhythm && (
            <span>
              {' · '}
              {(['pitch', 'rhythm'] as const).map((kind) => {
                const indices = parts.flatMap((part, index) =>
                  (part.kind ?? 'pitch') === kind ? [index] : [],
                );
                const correct = indices.filter(
                  (index) => parts[index].answer === answers[index],
                ).length;
                return (
                  <span key={kind}>
                    {kind === 'pitch'
                      ? nt('Pitch', 'Высота', 'Tonhöhe')[lang]
                      : nt('Rhythm', 'Ритм', 'Rhythmus')[lang]}
                    : {correct} / {indices.length}{' '}
                  </span>
                );
              })}
            </span>
          )}
        </output>
      )}
      {item.source && (
        <a
          className="source-link"
          href={item.source.url}
          target="_blank"
          rel="noreferrer"
        >
          {item.source.title}
        </a>
      )}
    </div>
  );
}
