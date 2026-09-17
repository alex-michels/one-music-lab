'use client';
import { useEffect, useRef, useState } from 'react';
import { nt } from '@/lib/notation-tasks';
import { HEARING_KEYS, hearingQuestion } from '@/lib/practice-coach';
import { hearingHints } from '@/lib/practice-hints';
import { profileStore, saveHearing } from '@/lib/local-profile';
import { useLocalProfile } from './local-data';
import { PracticeHints, AttemptNotice, checkLabel } from './practice-coach';
import { ArrowRight, Check, Headphones, Play, Volume2, X } from 'lucide-react';
import { localNumber, translator } from '@/lib/i18n';
import { german } from '@/lib/german';
import { count } from '@/lib/plural';
import { intervalLabels } from '@/lib/notation';
import { frequencyForMidi, noteName, type Wave } from '@/lib/music';
type Lang = import('@/lib/client-store').Lang;
type PlaySequence = (
  frequencies: number[],
  spacing?: number,
  wave?: Wave,
) => Promise<void>;

const quizIntervals = [
  {
    de: german['Minor third'],
    en: 'Minor third',
    ru: 'Малая терция',
    step: 3,
    degree: 2,
  },
  {
    de: german['Major third'],
    en: 'Major third',
    ru: 'Большая терция',
    step: 4,
    degree: 2,
  },
  {
    de: german['Perfect fifth'],
    en: 'Perfect fifth',
    ru: 'Чистая квинта',
    step: 7,
    degree: 4,
  },
  { de: german['Octave'], en: 'Octave', ru: 'Октава', step: 12, degree: 7 },
];

/**
 * Hearing the distance between two notes, as an experiment on the play lens of
 * intervals rather than half of the trainer.
 *
 * Hearing has its own four categories and local assessment history. It never
 * contributes to the written-knowledge ledger. Answering requires a successful
 * playback request; it cannot prove listening or attention. A visual alternative
 * would measure a different skill.
 */
export function EarTraining({
  lang,
  reference,
  play,
}: {
  lang: Lang;
  reference: number;
  play: PlaySequence;
}) {
  const t = translator(lang);
  const [question, setQuestion] = useState<{
    index: number;
    root: number;
    reference: number;
    check: boolean;
  } | null>(null);
  const [answer, setAnswer] = useState<number | null>(null);
  const [hasHeard, setHasHeard] = useState(false);
  const [hints, setHints] = useState(0);
  const [failed, setFailed] = useState(false);
  const { profile } = useLocalProfile();
  const request = useRef(0);
  useEffect(
    () => () => {
      request.current += 1;
    },
    [],
  );
  const replay = async (q = question) => {
    if (q) {
      const token = ++request.current;
      setHasHeard(false);
      setFailed(false);
      try {
        await play(
          [
            frequencyForMidi(q.root, q.reference),
            frequencyForMidi(q.root + quizIntervals[q.index].step, q.reference),
          ],
          0.75,
          'sine',
        );
        if (request.current === token) setHasHeard(true);
      } catch {
        if (request.current === token) setFailed(true);
      }
    }
  };
  const next = () => {
    const q = {
      ...hearingQuestion(
        profileStore.getSnapshot().profile.coaching.hearing,
        Math.floor(Math.random() * quizIntervals.length),
        57 + Math.floor(Math.random() * 12),
      ),
      reference,
    };
    setQuestion(q);
    setAnswer(null);
    setHasHeard(false);
    setHints(0);
    void replay(q);
  };
  const choose = (i: number) => {
    if (!question || answer !== null || !hasHeard) return;
    setAnswer(i);
    saveHearing(HEARING_KEYS[question.index], {
      correct: i === question.index,
      assisted: hints > 0,
      seed: question.root,
      check: question.check,
    });
  };
  return (
    <div className="ear-training">
      <div className="eyebrow">
        {t('EAR TRAINING · INTERVALS', 'ТРЕНИРОВКА СЛУХА · ИНТЕРВАЛЫ')}
      </div>
      <span className="practice-icon">
        <Headphones size={38} strokeWidth={1.4} />
      </span>
      <h3>
        {t('Listen to the space between.', 'Услышьте расстояние между нотами.')}
      </h3>
      <p>
        {t(
          'Two notes, played one after the other. Which interval do you hear?',
          'Две ноты звучат последовательно. Какой интервал вы слышите?',
        )}
      </p>
      <div className="quiz-pitch">
        <span>♪</span>
        <span className="quiz-dashes">· · · · ·</span>
        <span>?</span>
      </div>
      {!question ? (
        <button className="primary-button" onClick={next}>
          <Play size={17} />
          {t('Start listening', 'Начать тренировку')}
        </button>
      ) : (
        <>
          {question.check && <p className="later-check">{checkLabel[lang]}</p>}
          <button className="secondary-button" onClick={() => void replay()}>
            <Volume2 size={18} />
            {t('Listen again', 'Послушать ещё раз')}
          </button>
          {failed && (
            <p role="alert">
              {
                nt(
                  'Audio could not start. Try listening again.',
                  'Звук не запустился. Послушайте ещё раз.',
                  'Die Wiedergabe konnte nicht starten. Höre erneut zu.',
                )[lang]
              }
            </p>
          )}
          <PracticeHints
            lang={lang}
            hints={hearingHints}
            shown={hints}
            onHint={() => setHints(hints + 1)}
            answered={answer !== null}
          />
          <div className="answer-grid">
            {quizIntervals.map((option, i) => (
              <button
                key={i}
                disabled={answer !== null || !hasHeard}
                onClick={() => choose(i)}
                className={
                  answer !== null && i === question.index
                    ? 'answer-correct'
                    : answer === i
                      ? 'answer-wrong'
                      : ''
                }
              >
                <span>{option[lang]}</span>
                {answer !== null && i === question.index ? (
                  <Check size={18} />
                ) : answer === i ? (
                  <X size={18} />
                ) : (
                  <span className="answer-number">{i + 1}</span>
                )}
              </button>
            ))}
          </div>
          {answer !== null && (
            <output
              className={
                'answer-feedback ' +
                (answer === question.index ? 'correct' : 'incorrect')
              }
            >
              <strong>
                {answer === question.index
                  ? t('That’s right.', 'Верно.')
                  : t('Keep listening.', 'Продолжайте слушать.')}
              </strong>{' '}
              {quizIntervals[question.index][lang]} ·{' '}
              {count(quizIntervals[question.index].step, lang, 'semitones')}.
              {answer !== question.index && (
                <span>
                  {' '}
                  {
                    (quizIntervals[answer].step <
                    quizIntervals[question.index].step
                      ? nt(
                          'Your choice is narrower than the played interval.',
                          'Выбранный интервал уже прозвучавшего.',
                          'Deine Auswahl ist enger als das gespielte Intervall.',
                        )
                      : nt(
                          'Your choice is wider than the played interval.',
                          'Выбранный интервал шире прозвучавшего.',
                          'Deine Auswahl ist weiter als das gespielte Intervall.',
                        ))[lang]
                  }
                </span>
              )}
              <span className="answer-detail">
                {lang === 'de'
                  ? intervalLabels(
                      question.root,
                      quizIntervals[question.index].step,
                      quizIntervals[question.index].degree,
                      lang,
                    ).join(' → ')
                  : `${noteName(question.root)} → ${noteName(question.root + quizIntervals[question.index].step)}`}{' '}
                · {lang === 'de' ? 'a′' : 'A4'} ={' '}
                {localNumber(question.reference, lang)} Hz
              </span>
            </output>
          )}
          {answer !== null && (
            <>
              <AttemptNotice
                lang={lang}
                assisted={hints > 0}
                check={question.check}
                pending={
                  profile.coaching.hearing[HEARING_KEYS[question.index]]
                    ?.pending ?? null
                }
              />
              <a href={`#/${lang}/t/intervals/read`}>
                {
                  nt(
                    'Review intervals',
                    'Повторить интервалы',
                    'Intervalle wiederholen',
                  )[lang]
                }
              </a>
            </>
          )}
          {answer !== null && (
            <button className="primary-button" onClick={next}>
              {t('Next interval', 'Следующий интервал')}
              <ArrowRight size={17} />
            </button>
          )}
        </>
      )}
      <p className="experiment-hint">
        {t(
          'Sing the first note, then the second. Notice the distance, not just whether it sounds familiar.',
          'Спойте первую ноту, затем вторую. Обращайте внимание на расстояние, а не только на знакомое звучание.',
        )}{' '}
        {t(
          'Exercises use 12-tone equal temperament. Your chosen A4 is captured when each question starts.',
          'Упражнения используют 12-ступенный равномерный строй. Выбранная A4 фиксируется в начале вопроса.',
        )}
      </p>
    </div>
  );
}
