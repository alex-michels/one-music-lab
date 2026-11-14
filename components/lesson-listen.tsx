'use client';
import { useEffect, useRef, useState } from 'react';
import { Play, Square } from 'lucide-react';
import { localizedText as text } from '@/lib/i18n';
import type { Lang } from '@/lib/client-store';
import type { TopicId } from '@/lib/content/ids';
import {
  lessonListening,
  namesOwnTuning,
  planListenStep,
  type ListenPlan,
} from '@/lib/lesson-listening';
import { NoteText } from './note-text';

const labels = {
  group: text('Listen here', 'Послушайте здесь', 'Hier anhören'),
  sounding: text('Sounding', 'Звучит', 'Es erklingt'),
  failed: text(
    'The sound could not start. Check the browser’s sound settings and try again.',
    'Звук не запустился. Проверьте настройки звука в браузере и попробуйте ещё раз.',
    'Der Klang konnte nicht starten. Prüfe die Klangeinstellungen des Browsers und versuche es erneut.',
  ),
  // What the examples are tuned to. True of every lesson but one: where the
  // buttons themselves name a tuning, the caption must not contradict them.
  equal: text(
    'These examples sound in equal temperament at A4 = 440 Hz, at the laboratory’s volume.',
    'Примеры звучат в равномерной темперации при [[ля]] первой октавы = 440 Гц, на громкости лаборатории.',
    'Die Beispiele erklingen gleichstufig gestimmt mit a′ = 440 Hz in der Lautstärke des Labors.',
  ),
  named: text(
    'Each example sounds at A4 = 440 Hz in the tuning its button names, at the laboratory’s volume.',
    'Каждый пример звучит при [[ля]] первой октавы = 440 Гц в том строе, который назван на его кнопке, на громкости лаборатории.',
    'Jedes Beispiel erklingt mit a′ = 440 Hz in der Stimmung, die sein Knopf nennt, in der Lautstärke des Labors.',
  ),
  stop: text(
    'Select an example again or press Escape to stop it.',
    'Чтобы остановить пример, выберите его ещё раз или нажмите Escape.',
    'Wähle ein Beispiel erneut oder drücke Escape, um es zu stoppen.',
  ),
};

/** Seconds allowed for a suspended audio context to resume before the tones. */
export const START_ALLOWANCE = 2;

/**
 * The lesson's own sounds, beside the sentence that describes them.
 *
 * Every example starts from a click or a key press, is a few seconds long and
 * ends by itself; selecting it again, starting another one or pressing Escape
 * stops it at once. The example that is sounding is named in a caption and by
 * the pressed state of its button, so a reader who cannot hear the tone still
 * sees that it started. A sound that could not start is announced in the same
 * place, beside the button that was pressed rather than at the top of a long
 * page.
 */
export function LessonListen({
  topic,
  lang,
  play,
  stop,
}: {
  topic: TopicId;
  lang: Lang;
  /** Resolves once the tones are scheduled; rejects when audio is unavailable. */
  play: (plan: ListenPlan) => Promise<void>;
  stop: () => void;
}) {
  const steps = lessonListening[topic];
  // Which example is sounding and for how long. The clock is an effect of this
  // state, so replacing or clearing the state is all it takes to stop it.
  const [sounding, setSounding] = useState<{
    index: number;
    seconds: number;
  } | null>(null);
  const [failed, setFailed] = useState(false);
  // Only the latest request may change the state: an earlier example that
  // resolves or fails late must not touch the one chosen after it.
  const request = useRef(0);
  useEffect(() => {
    if (!sounding) return;
    const timer = setTimeout(() => setSounding(null), sounding.seconds * 1000);
    return () => clearTimeout(timer);
  }, [sounding]);
  useEffect(() => {
    // The page silences every sound on Escape, when the tab is hidden and when
    // the page is left. The caption follows it, so no button goes on claiming
    // a sound the page has already stopped.
    const silence = () => {
      request.current++;
      setSounding(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') silence();
    };
    const hidden = () => {
      if (document.hidden) silence();
    };
    window.addEventListener('keydown', escape);
    window.addEventListener('pagehide', silence);
    document.addEventListener('visibilitychange', hidden);
    return () => {
      window.removeEventListener('keydown', escape);
      window.removeEventListener('pagehide', silence);
      document.removeEventListener('visibilitychange', hidden);
    };
  }, []);
  async function toggle(index: number) {
    const current = ++request.current;
    setFailed(false);
    if (sounding?.index === index) {
      stop();
      setSounding(null);
      return;
    }
    const plan = planListenStep(steps[index]);
    // Named at once, so the caption does not wait for the audio to be ready.
    setSounding({ index, seconds: plan.total + START_ALLOWANCE });
    try {
      await play(plan);
    } catch {
      // The button must not claim a sound that never began; say so here.
      if (current === request.current) {
        setSounding(null);
        setFailed(true);
      }
      return;
    }
    // The tones are scheduled now: count their length from this moment.
    if (current === request.current)
      setSounding({ index, seconds: plan.total });
  }
  const active = sounding?.index ?? null;
  return (
    <div className="lesson-listen">
      <ul role="list" aria-label={labels.group[lang]}>
        {steps.map((step, index) => (
          <li key={step.label.en}>
            <button
              type="button"
              className="listen-button"
              aria-pressed={active === index}
              onClick={() => void toggle(index)}
            >
              {active === index ? (
                <Square size={14} aria-hidden="true" />
              ) : (
                <Play size={14} aria-hidden="true" />
              )}
              <span>
                <NoteText text={step.label} lang={lang} />
              </span>
            </button>
          </li>
        ))}
      </ul>
      {/* The caption is for the eye and is not a live region: the pressed
          button already tells a screen reader what is sounding, and speech
          over a two-second tone would cover the tone. Only a sound that could
          not start is announced, because then there is nothing to hear. */}
      <div className={failed ? 'listen-status failed' : 'listen-status'}>
        {active !== null && (
          <>
            {labels.sounding[lang]}:{' '}
            <NoteText text={steps[active].label} lang={lang} />
          </>
        )}
        <output>{active === null && failed && labels.failed[lang]}</output>
      </div>
      <p className="listen-note">
        <NoteText
          text={namesOwnTuning(topic) ? labels.named : labels.equal}
          lang={lang}
        />{' '}
        {labels.stop[lang]}
      </p>
    </div>
  );
}
