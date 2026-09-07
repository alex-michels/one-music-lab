'use client';
import { useState } from 'react';
import { Piano, Volume2 } from 'lucide-react';
import { fixedNumber, translator } from '@/lib/i18n';
import {
  octaveName,
  pitchLabel,
  pitchName,
  type SpelledPitch,
} from '@/lib/notation';
import { frequencyForMidi, type Tuning } from '@/lib/music';
type Lang = import('@/lib/client-store').Lang;

/**
 * The notes lab (roadmap №558). A written note, the key it lands on and the
 * frequency it makes, in one chain the reader can move from either end.
 *
 * There is no staff here yet. Engraving waits on the engine chosen in №553, so
 * this panel works in note names, which the model already spells correctly in
 * all three systems. What it can already show is the part a staff would not
 * add: that the spelling and the sounding pitch are different facts, and that
 * the reference pitch and the tuning map decide the frequency.
 */

const NATURAL_STEPS = [0, 2, 4, 5, 7, 9, 11];
/** Written octaves the panel offers; `octaveName` is defined for 0–8. */
const OCTAVES = [1, 2, 3, 4, 5, 6, 7];

function spell(
  letter: number,
  accidental: number,
  octave: number,
): SpelledPitch {
  return {
    letter,
    accidental,
    octave,
    midi: (octave + 1) * 12 + NATURAL_STEPS[letter] + accidental,
  };
}

export function NotesLab({
  lang,
  reference,
  tuning,
  play,
}: {
  lang: Lang;
  reference: number;
  tuning: Tuning;
  play: (midi: number) => void | Promise<void>;
}) {
  const t = translator(lang);
  const [letter, setLetter] = useState(0);
  const [accidental, setAccidental] = useState(0);
  const [octave, setOctave] = useState(4);
  const pitch = spell(letter, accidental, octave);
  const hz = frequencyForMidi(pitch.midi, reference, tuning);
  const audible = hz >= 20 && hz <= 20000;
  // The reader's own signs. English shows the symbols, Russian and German name
  // the alteration the way each language names it.
  const signs: Record<Lang, string[]> = {
    en: ['𝄫', '♭', '♮', '♯', '𝄪'],
    ru: ['дубль-бемоль', 'бемоль', 'без знака', 'диез', 'дубль-диез'],
    de: ['eses', 'es', 'ohne', 'is', 'isis'],
  };
  return (
    <div className="notes-lab">
      <section className="panel">
        <div className="panel-heading">
          <span>
            <span className="panel-number">01</span>
            {t('Write a note', 'Запишите ноту')}
          </span>
        </div>
        <fieldset
          className="note-chooser"
          aria-label={t('Note name', 'Название ноты')}
        >
          {[0, 1, 2, 3, 4, 5, 6].map((value) => (
            <button
              key={value}
              className={value === letter ? 'selected' : ''}
              aria-pressed={value === letter}
              onClick={() => setLetter(value)}
            >
              {pitchName(spell(value, 0, octave), lang)}
            </button>
          ))}
        </fieldset>
        <fieldset
          className="note-chooser"
          aria-label={t('Accidental', 'Знак альтерации')}
        >
          {[-2, -1, 0, 1, 2].map((value) => (
            <button
              key={value}
              className={value === accidental ? 'selected' : ''}
              aria-pressed={value === accidental}
              onClick={() => setAccidental(value)}
            >
              {signs[lang][value + 2]}
            </button>
          ))}
        </fieldset>
        <fieldset className="note-chooser" aria-label={t('Octave', 'Октава')}>
          {OCTAVES.map((value) => (
            <button
              key={value}
              className={value === octave ? 'selected' : ''}
              aria-pressed={value === octave}
              onClick={() => setOctave(value)}
            >
              {octaveName(spell(letter, 0, value), lang)}
            </button>
          ))}
        </fieldset>
      </section>
      <section className="panel note-readout">
        <div className="panel-heading">
          <span>
            <span className="panel-number">02</span>
            {t('What it is', 'Что это')}
          </span>
        </div>
        <div className="note-name">{pitchLabel(pitch, lang)}</div>
        <dl>
          <div>
            <dt>{t('Written', 'Запись')}</dt>
            <dd>{pitchName(pitch, lang)}</dd>
          </div>
          <div>
            <dt>{t('Register', 'Октава')}</dt>
            <dd>{octaveName(pitch, lang)}</dd>
          </div>
          <div>
            <dt>{t('Sounding pitch', 'Звучащая высота')}</dt>
            <dd>
              {audible
                ? `${fixedNumber(hz, 2, lang)} Hz`
                : t('outside the audible range', 'вне слышимого диапазона')}
            </dd>
          </div>
          <div>
            <dt>{t('MIDI number', 'Номер MIDI')}</dt>
            <dd>{pitch.midi}</dd>
          </div>
        </dl>
        <button
          className="primary-button"
          disabled={!audible}
          onClick={() => void play(pitch.midi)}
        >
          <Volume2 size={17} />
          {t('Hear this note', 'Послушать ноту')}
        </button>
        <p className="note-caption">
          {t(
            'The frequency follows the reference pitch and the tuning map chosen in the tone generator. The written note does not change when they do.',
            'Частота зависит от опорного тона и строя, выбранных в генераторе тонов. Запись ноты при этом не меняется.',
          )}
        </p>
      </section>
      <section className="panel note-caveat">
        <span className="eyebrow">
          <Piano size={15} />
          {t('IF YOU ALSO USE SOFTWARE', 'ЕСЛИ ВЫ РАБОТАЕТЕ В ПРОГРАММЕ')}
        </span>
        <p>
          {t(
            'MIDI fixes the note number, not the name of its octave. The same key that is number 60 here appears as C3 in some programs, C4 in others and C5 in a few. Read the number when the names disagree.',
            'MIDI фиксирует номер ноты, а не название её октавы. Та же клавиша с номером 60 в одних программах называется C3, в других C4, а иногда C5. Когда названия расходятся, ориентируйтесь на номер.',
          )}
        </p>
      </section>
    </div>
  );
}
