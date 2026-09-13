'use client';
import { useRef, useState } from 'react';
import { localizedText as text } from '@/lib/i18n';
import { hashOf, type Lang } from '@/lib/client-store';
import { diagnosticQuestions, diagnosticResult } from '@/lib/entry-diagnostic';
import { topicById } from '@/lib/topics';
import { NoteText } from './note-text';

export function EntryDiagnostic({ lang }: { lang: Lang }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const heading = useRef<HTMLHeadingElement>(null);
  const question = diagnosticQuestions[step];
  const result = diagnosticResult(answers);
  const answered = answers.length > step;
  const selected = question?.options.find(
    (option) => option.id === answers[step],
  );
  const lessonLink = (topic: string) =>
    hashOf({ lang, lens: 'read', topic, anchor: null });
  const restart = () => {
    setAnswers([]);
    setStep(0);
    heading.current?.focus();
  };
  return (
    <details className="entry-diagnostic">
      <summary>
        {
          text(
            'Find a starting point (optional)',
            'Выбрать отправную точку (необязательно)',
            'Einen Einstieg finden (freiwillig)',
          )[lang]
        }
      </summary>
      <p>
        {
          text(
            'Five short checks suggest lessons to revisit. They sample the available material; they do not certify mastery or test your hearing. You can open any chapter at any time. Answers stay here until you leave this view.',
            'Пять коротких вопросов помогут выбрать уроки для повторения. Они охватывают лишь часть доступного материала, не подтверждают освоение глав и не проверяют слух. Любую главу можно открыть в любое время. Ответы сохраняются здесь только до выхода из этого представления.',
            'Fünf kurze Fragen helfen dir, Lektionen zum Wiederholen auszuwählen. Sie prüfen nur Stichproben des verfügbaren Materials, bescheinigen keine Beherrschung und testen nicht dein Gehör. Du kannst jederzeit jedes Kapitel öffnen. Die Antworten bleiben nur bis zum Verlassen dieser Ansicht erhalten.',
          )[lang]
        }
      </p>
      <h2 ref={heading} tabIndex={-1}>
        {question
          ? `${text('Check', 'Вопрос', 'Frage')[lang]} ${step + 1} / ${diagnosticQuestions.length}`
          : text(
              'Your starting point',
              'Ваша отправная точка',
              'Dein Einstieg',
            )[lang]}
      </h2>
      {question ? (
        <>
          <p className="exercise-prompt">{question.prompt[lang]}</p>
          <div className="answer-grid">
            {question.options.map((option) => (
              <button
                type="button"
                key={option.id}
                disabled={answered}
                aria-pressed={answered && answers[step] === option.id}
                onClick={() => setAnswers([...answers, option.id])}
              >
                {option.label[lang]}
              </button>
            ))}
          </div>
          {!answered && (
            <button
              type="button"
              className="text-button"
              onClick={() => setAnswers([...answers, null])}
            >
              {text('I’m not sure', 'Не уверен(а)', 'Ich bin unsicher')[lang]}
            </button>
          )}
          {answered && (
            <output className="diagnostic-feedback">
              <p>
                {selected?.feedback[lang] ??
                  text(
                    'Mark this for review; no guess is needed.',
                    'Отметьте это для повторения; угадывать не нужно.',
                    'Merke dir dieses Thema zum Wiederholen vor; du musst nicht raten.',
                  )[lang]}
              </p>
              <a href={lessonLink(question.topic)}>
                {
                  text(
                    'Review this explanation',
                    'Повторить объяснение',
                    'Diese Erklärung wiederholen',
                  )[lang]
                }
              </a>
              <a
                className="source-link"
                href={question.source.url}
                target="_blank"
                rel="noreferrer"
              >
                {question.source.title}
              </a>
            </output>
          )}
          {answered && (
            <button
              type="button"
              className="primary-button"
              onClick={() => {
                setStep(step + 1);
                heading.current?.focus();
              }}
            >
              {step + 1 === diagnosticQuestions.length
                ? text(
                    'See the suggestion',
                    'Посмотреть рекомендацию',
                    'Empfehlung ansehen',
                  )[lang]
                : text('Next check', 'Следующий вопрос', 'Nächste Frage')[lang]}
            </button>
          )}
        </>
      ) : (
        result && (
          <output className="diagnostic-result">
            {result.recommended ? (
              <>
                <p>
                  {
                    text(
                      'Start by reviewing the earliest check you missed or skipped:',
                      'Начните с первого вопроса, в котором вы ошиблись или пропустили ответ:',
                      'Beginne mit der ersten Frage, die du falsch beantwortet oder übersprungen hast:',
                    )[lang]
                  }
                </p>
                <a
                  className="primary-button"
                  href={lessonLink(result.recommended)}
                >
                  <NoteText
                    text={topicById[result.recommended].title}
                    lang={lang}
                  />
                </a>
                <ul role="list">
                  {result.review.map((topic) => (
                    <li key={topic}>
                      <a href={lessonLink(topic)}>
                        <NoteText text={topicById[topic].title} lang={lang} />
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p>
                {
                  text(
                    'These five checks were correct. Choose a chapter below, or begin with the first lesson to cover the material these checks did not assess.',
                    'Все пять ответов верны. Выберите главу ниже или начните с первого урока, чтобы пройти материал, которого не касались вопросы.',
                    'Alle fünf Antworten waren richtig. Wähle unten ein Kapitel oder beginne mit der ersten Lektion, um auch das nicht geprüfte Material durchzugehen.',
                  )[lang]
                }
              </p>
            )}
          </output>
        )
      )}
      <div className="diagnostic-actions">
        <a href={lessonLink('sound')}>
          {
            text(
              'Start from the beginning',
              'Начать с начала',
              'Von vorne beginnen',
            )[lang]
          }
        </a>
        <button type="button" className="text-button" onClick={restart}>
          {
            text(
              'Restart the check',
              'Начать проверку заново',
              'Fragen neu beginnen',
            )[lang]
          }
        </button>
      </div>
    </details>
  );
}
