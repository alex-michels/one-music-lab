'use client';
import { useState } from 'react';
import { nt } from '@/lib/notation-tasks';
import type { Lang } from '@/lib/client-store';
import type { LocalText } from '@/lib/i18n';
import { profileStore } from '@/lib/local-profile';
import {
  HEARING_KEYS,
  type Coaching,
  type CoachingRow,
  type Reflection,
} from '@/lib/practice-coach';
import { ruleLabels } from '@/lib/topics';
import type { Rule } from '@/lib/exercises';
import { NoteText } from './note-text';

export function PracticeHints({
  lang,
  hints,
  shown,
  onHint,
  answered,
}: {
  lang: Lang;
  hints: readonly LocalText[];
  shown: number;
  onHint: () => void;
  answered: boolean;
}) {
  return (
    <div className="practice-hints">
      {!answered && shown < hints.length && (
        <button type="button" className="secondary-button" onClick={onHint}>
          {shown === 0
            ? nt('Show a hint', 'Показать подсказку', 'Hinweis anzeigen')[lang]
            : nt(
                'Show another hint',
                'Ещё подсказка',
                'Weiteren Hinweis anzeigen',
              )[lang]}
        </button>
      )}
      <ol aria-live="polite">
        {hints.slice(0, shown).map((hint, index) => (
          <li key={index}>{hint[lang]}</li>
        ))}
      </ol>
    </div>
  );
}

export function AttemptNotice({
  lang,
  assisted,
  check,
  pending,
}: {
  lang: Lang;
  assisted: boolean;
  check: boolean;
  pending: CoachingRow['pending'];
}) {
  return (
    <output className="attempt-notice">
      {
        (assisted
          ? nt(
              'Recorded with hints.',
              'Записано с подсказками.',
              'Mit Hinweisen erfasst.',
            )
          : nt(
              'Recorded without hints.',
              'Записано без подсказок.',
              'Ohne Hinweise erfasst.',
            ))[lang]
      }{' '}
      {pending ? (
        <>
          {
            nt(
              'A changed example is queued. Further completed questions before it is due:',
              'Запланирован другой пример. До проверки осталось завершить заданий:',
              'Ein verändertes Beispiel ist vorgemerkt. Weitere abgeschlossene Aufgaben bis zur Kontrolle:',
            )[lang]
          }{' '}
          {pending.remaining}.
        </>
      ) : check ? (
        nt(
          'This later check was correct without hints. It is one observation, not proof of mastery.',
          'Эта отложенная проверка выполнена верно без подсказок. Это одно наблюдение, а не доказательство освоения.',
          'Diese spätere Kontrolle war ohne Hinweise richtig. Das ist eine einzelne Beobachtung, kein Nachweis sicherer Beherrschung.',
        )[lang]
      ) : null}
    </output>
  );
}
export const checkLabel = nt(
  'Later check · changed example',
  'Отложенная проверка · другой пример',
  'Spätere Kontrolle · verändertes Beispiel',
);
const channelLabels = {
  knowledge: nt('Knowledge', 'Знания', 'Wissen'),
  hearing: nt('Hearing', 'Слух', 'Hören'),
};
const hearingLabels = [
  nt('Minor third', 'Малая терция', 'Kleine Terz'),
  nt('Major third', 'Большая терция', 'Große Terz'),
  nt('Perfect fifth', 'Чистая квинта', 'Reine Quinte'),
  nt('Octave', 'Октава', 'Oktave'),
];
const reflectionLabels: Record<keyof Reflection, LocalText> = {
  intention: nt(
    'My version expresses my chosen intention',
    'Мой вариант выражает мой замысел',
    'Meine Fassung drückt meine gewählte Absicht aus',
  ),
  comparison: nt(
    'I compared my version with an alternative',
    'Я сравнил(а) свой вариант с альтернативой',
    'Ich habe meine Fassung mit einer Alternative verglichen',
  ),
  explanation: nt(
    'I can explain a choice and a next experiment',
    'Я могу объяснить одно решение и следующий эксперимент',
    'Ich kann eine Entscheidung und einen nächsten Versuch erklären',
  ),
};
const ratingLabels = {
  revisit: nt('Revisit', 'Доработать', 'Überarbeiten'),
  met: nt(
    'Met in my view',
    'По моей оценке выполнено',
    'Aus meiner Sicht erfüllt',
  ),
};
export function CoachingHistory({
  lang,
  coaching,
}: {
  lang: Lang;
  coaching: Coaching;
}) {
  return (
    <section
      className="coaching-history"
      aria-label={
        nt(
          'Separate assessments',
          'Раздельные оценки',
          'Getrennte Einschätzungen',
        )[lang]
      }
    >
      <p>
        {
          nt(
            'Since feedback tracking began. Correct / attempted; written exercises count once as a whole. Earlier answer totals remain below. These results do not certify mastery.',
            'С начала учёта обратной связи. Верно / попыток; письменное задание учитывается целиком один раз. Прежние числа ответов сохранены ниже. Результаты не подтверждают освоение.',
            'Seit Beginn dieser Erfassung. Richtig / versucht; schriftliche Aufgaben zählen einmal als Ganzes. Frühere Antwortzahlen stehen weiterhin unten. Diese Ergebnisse bestätigen keine Beherrschung.',
          )[lang]
        }
      </p>
      {(['knowledge', 'hearing'] as const).map((channel) => (
        <div key={channel}>
          <h3>{channelLabels[channel][lang]}</h3>
          {Object.keys(coaching[channel]).length === 0 && (
            <p>
              {
                nt(
                  'No attempts recorded yet.',
                  'Попыток пока нет.',
                  'Noch keine Versuche erfasst.',
                )[lang]
              }
            </p>
          )}
          <dl className="saved-answers">
            {Object.entries(coaching[channel]).map(([key, row]) => (
              <div key={key}>
                <dt>
                  <NoteText
                    text={
                      channel === 'knowledge'
                        ? ruleLabels[key as Rule]
                        : hearingLabels[
                            HEARING_KEYS.indexOf(
                              key as (typeof HEARING_KEYS)[number],
                            )
                          ]
                    }
                    lang={lang}
                  />
                </dt>
                <dd>
                  {nt('Without hints', 'Без подсказок', 'Ohne Hinweise')[lang]}:{' '}
                  {row.independent.correct}/{row.independent.asked} ·{' '}
                  {nt('With hints', 'С подсказками', 'Mit Hinweisen')[lang]}:{' '}
                  {row.assisted.correct}/{row.assisted.asked} ·{' '}
                  {
                    nt(
                      'Later checks: unassisted successes / all',
                      'Отложенные: верно без подсказок / всего',
                      'Spätere Kontrollen: ohne Hinweise richtig / alle',
                    )[lang]
                  }
                  : {row.checks.correct}/{row.checks.asked}
                  {row.pending && (
                    <>
                      {' '}
                      ·{' '}
                      {
                        nt(
                          'Questions until the next check',
                          'Заданий до проверки',
                          'Aufgaben bis zur Kontrolle',
                        )[lang]
                      }
                      : {row.pending.remaining}
                    </>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      ))}
      <h3>
        {
          nt(
            'Creative work · last self-assessment',
            'Творческая работа · последняя самооценка',
            'Kreative Arbeit · letzte Selbsteinschätzung',
          )[lang]
        }
      </h3>
      <p>
        {
          nt(
            'Your judgment about your chord experiment, separate from automatically checked answers. Later edits do not update this reflection.',
            'Ваша оценка эксперимента с аккордами, отдельно от автоматически проверенных ответов. Последующие правки не изменяют эту самооценку.',
            'Deine Einschätzung zum Akkordexperiment, getrennt von automatisch geprüften Antworten. Spätere Änderungen aktualisieren diese Reflexion nicht.',
          )[lang]
        }
      </p>
      {coaching.creative ? (
        <dl>
          {Object.entries(coaching.creative).map(([key, value]) => (
            <div key={key}>
              <dt>{reflectionLabels[key as keyof Reflection][lang]}</dt>
              <dd>{ratingLabels[value][lang]}</dd>
            </div>
          ))}
        </dl>
      ) : (
        <p>
          {
            nt(
              'No self-assessment saved yet.',
              'Самооценка пока не сохранена.',
              'Noch keine Selbsteinschätzung gespeichert.',
            )[lang]
          }
        </p>
      )}
      <a href={`#/${lang}/t/chords/play`}>
        {
          nt(
            'Open the chord experiment',
            'Открыть эксперимент с аккордами',
            'Akkordexperiment öffnen',
          )[lang]
        }
      </a>
    </section>
  );
}

export function CreativeReflection({ lang }: { lang: Lang }) {
  const [ratings, setRatings] = useState<Partial<Reflection>>({});
  const [saved, setSaved] = useState(false);
  const keys = Object.keys(reflectionLabels) as (keyof Reflection)[];
  return (
    <section
      className="creative-reflection"
      aria-label={
        nt(
          'Reflect on your creative work',
          'Оцените свою творческую работу',
          'Kreative Arbeit reflektieren',
        )[lang]
      }
    >
      <h3>
        {
          nt(
            'Reflect on your creative work',
            'Оцените свою творческую работу',
            'Kreative Arbeit reflektieren',
          )[lang]
        }
      </h3>
      <p>
        {
          nt(
            'Choose an intention for your progression. Edit it, compare an alternative, then assess your choices. These are reflection prompts, not universal rules of harmony or an automatic quality score.',
            'Выберите замысел последовательности. Измените её, сравните с альтернативой и оцените свои решения. Это вопросы для размышления, а не универсальные правила гармонии или автоматическая оценка качества.',
            'Wähle eine Absicht für deine Akkordfolge. Bearbeite sie, vergleiche eine Alternative und beurteile deine Entscheidungen. Dies sind Reflexionsfragen, keine universellen Harmonieregeln oder automatische Qualitätsnote.',
          )[lang]
        }
      </p>
      {keys.map((key) => (
        <fieldset key={key}>
          <legend>{reflectionLabels[key][lang]}</legend>
          {(['revisit', 'met'] as const).map((value) => (
            <label key={value}>
              <input
                type="radio"
                name={`reflection-${key}`}
                checked={ratings[key] === value}
                onChange={() => {
                  setRatings({ ...ratings, [key]: value });
                  setSaved(false);
                }}
              />{' '}
              {ratingLabels[value][lang]}
            </label>
          ))}
        </fieldset>
      ))}
      <button
        type="button"
        className="secondary-button"
        disabled={saved || keys.some((key) => !ratings[key])}
        onClick={() => {
          profileStore.update((profile) => ({
            ...profile,
            coaching: { ...profile.coaching, creative: ratings as Reflection },
          }));
          setSaved(true);
        }}
      >
        {
          nt(
            'Save self-assessment',
            'Сохранить самооценку',
            'Selbsteinschätzung speichern',
          )[lang]
        }
      </button>
      {saved && (
        <output>
          {keys.some((key) => ratings[key] === 'revisit')
            ? nt(
                'Reflection recorded. Choose one criterion to revisit, change one musical choice and compare again.',
                'Самооценка записана. Выберите один критерий для доработки, измените одно музыкальное решение и сравните снова.',
                'Reflexion erfasst. Wähle ein Kriterium zur Überarbeitung, ändere eine musikalische Entscheidung und vergleiche erneut.',
              )[lang]
            : nt(
                'Reflection recorded. Try a different intention next and explain what you changed.',
                'Самооценка записана. Попробуйте другой замысел и объясните, что изменили.',
                'Reflexion erfasst. Probiere als Nächstes eine andere Absicht und erkläre deine Änderungen.',
              )[lang]}
        </output>
      )}
    </section>
  );
}
