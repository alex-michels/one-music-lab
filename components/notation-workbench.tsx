'use client';
import { useState } from 'react';
import { nt } from '@/lib/notation-tasks';
import {
  ottava,
  resolveAccidentalSequence,
  signature,
  underSignature,
} from '@/lib/notation-workbench';
import {
  pitchLabel,
  pitchName,
  type MusicLanguage,
  type SpelledPitch,
} from '@/lib/notation';
import { glyphs, GLYPH_UNITS_PER_SPACE } from '@/lib/glyphs';
import { Staff } from './staff';

export function NotationWorkbench({
  pitch,
  lang,
  play,
  stop,
}: {
  pitch: SpelledPitch;
  lang: MusicLanguage;
  play: (midi: number) => void | Promise<void>;
  stop: () => void;
}) {
  const [count, setCount] = useState(0);
  const [explicit, setExplicit] = useState<number | null>(null);
  const [shift, setShift] = useState(0);
  const safeShift =
    pitch.octave + shift < 0 || pitch.octave + shift > 8 ? 0 : shift;
  const sounding = ottava(underSignature(pitch, count, explicit), safeShift);
  const signs = signature(count);
  const written = {
    ...sounding,
    octave: pitch.octave,
    midi: sounding.midi - 12 * safeShift,
  };
  const natural = {
    ...pitch,
    accidental: 0,
    midi: pitch.midi - pitch.accidental,
  };
  const otherOctave = ottava(natural, natural.octave === 8 ? -1 : 1);
  const sequence = resolveAccidentalSequence(
    [
      { pitch: natural, measure: 1, accidental: explicit },
      { pitch: otherOctave, measure: 1, accidental: null },
      { pitch: natural, measure: 1, accidental: null },
      { pitch: natural, measure: 2, accidental: null, tieFromPrevious: true },
      { pitch: natural, measure: 2, accidental: null },
    ],
    count,
  );
  const signatureLabel = nt(
    'Key signature in treble clef',
    'Ключевые знаки в скрипичном ключе',
    'Vorzeichen im Violinschlüssel',
  )[lang];
  const update = (action: () => void) => {
    stop();
    action();
  };
  return (
    <section className="panel notation-workbench">
      <h3>
        {
          nt(
            'Signature, accidental and octave shift',
            'Ключевые знаки, альтерация и перенос на октаву',
            'Vorzeichen, Versetzungszeichen und Oktavierung',
          )[lang]
        }
      </h3>
      <label>
        {signatureLabel}
        <select
          value={count}
          onChange={(e) => update(() => setCount(Number(e.target.value)))}
        >
          {Array.from({ length: 15 }, (_, i) => i - 7).map((n) => (
            <option key={n} value={n}>
              {Math.abs(n)} {n < 0 ? '♭' : '♯'}
            </option>
          ))}
        </select>
      </label>
      <svg
        aria-label={`${signatureLabel}: ${signs.map((sign) => pitchName({ ...pitch, ...sign }, lang)).join(', ') || '0'}`}
        viewBox="0 0 230 110"
        width="230"
        height="110"
      >
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1="4"
            x2="226"
            y1={30 + i * 12}
            y2={30 + i * 12}
            stroke="currentColor"
          />
        ))}
        <path
          d={glyphs.gClef}
          transform={`translate(10 66) scale(${12 / GLYPH_UNITS_PER_SPACE} ${-12 / GLYPH_UNITS_PER_SPACE})`}
          fill="currentColor"
        />
        {signs.map((sign, i) => (
          <path
            key={sign.letter}
            d={
              sign.accidental < 0
                ? glyphs.accidentalFlat
                : glyphs.accidentalSharp
            }
            transform={`translate(${54 + i * 22} ${78 - sign.step * 6}) scale(${12 / GLYPH_UNITS_PER_SPACE} ${-12 / GLYPH_UNITS_PER_SPACE})`}
            fill="currentColor"
          />
        ))}
      </svg>
      <label>
        {
          nt(
            'Accidental before this note',
            'Знак перед этой нотой',
            'Versetzungszeichen vor dieser Note',
          )[lang]
        }
        <select
          value={explicit ?? 'signature'}
          onChange={(e) =>
            update(() =>
              setExplicit(
                e.target.value === 'signature' ? null : Number(e.target.value),
              ),
            )
          }
        >
          <option value="signature">
            {
              nt(
                'Use the signature',
                'По ключевым знакам',
                'Vorzeichen gelten',
              )[lang]
            }
          </option>
          {[-2, -1, 0, 1, 2].map((n) => (
            <option key={n} value={n}>
              {['♭♭', '♭', '♮', '♯', '𝄪'][n + 2]}
            </option>
          ))}
        </select>
      </label>
      <label>
        {nt('Octave displacement', 'Перенос на октаву', 'Oktavierung')[lang]}
        <select
          value={safeShift}
          onChange={(e) => update(() => setShift(Number(e.target.value)))}
        >
          {[-2, -1, 0, 1, 2]
            .filter((n) => pitch.octave + n >= 0 && pitch.octave + n <= 8)
            .map((n) => (
              <option key={n} value={n}>
                {['15mb', '8vb', '0', '8va', '15ma'][n + 2]}
              </option>
            ))}
        </select>
      </label>
      {safeShift > 0 && (
        <div className="ottava-bracket">
          {['15mb', '8vb', '0', '8va', '15ma'][safeShift + 2]} ┄┄┄┄┄┄┄┐
        </div>
      )}
      <Staff
        pitches={[written]}
        accidentalVisibility={[true]}
        lang={lang}
        space={13}
      />
      <output>
        {safeShift < 0 && (
          <span className="ottava-bracket">
            {safeShift === -1 ? '8vb' : '15mb'} ┄┄┄┄┄┄┄┘
          </span>
        )}
        {nt('Sounding', 'Звучит', 'Klingend')[lang]}:{' '}
        {pitchLabel(sounding, lang)}
      </output>
      <button
        className="primary-button"
        disabled={sounding.midi < 24 || sounding.midi > 108}
        onClick={() => void play(sounding.midi)}
      >
        {nt('Hear the result', 'Послушать результат', 'Ergebnis anhören')[lang]}
      </button>
      <p>
        {
          nt(
            'The note above shows the resulting accidental explicitly. The signature applies in every octave; a written sign replaces it. The octave bracket changes the sounding register while preserving the written position.',
            'Нота выше явно показывает итоговый знак. Ключевые знаки действуют во всех октавах; случайный знак заменяет их. Октавный пунктир меняет звучащую октаву, сохраняя положение ноты.',
            'Die Note oben zeigt das resultierende Versetzungszeichen ausdrücklich. Vorzeichen gelten in allen Oktaven; ein Versetzungszeichen ersetzt sie. Die Oktavierung verändert die klingende Oktave bei gleicher Notenposition.',
          )[lang]
        }
      </p>
      <button
        className="text-button"
        onClick={() =>
          update(() => {
            setCount(0);
            setExplicit(null);
            setShift(0);
          })
        }
      >
        {
          nt(
            'Reset this comparison',
            'Сбросить это сравнение',
            'Diesen Vergleich zurücksetzen',
          )[lang]
        }
      </button>
      <h4>
        {
          nt(
            'Follow the sign through a barline',
            'Проследите действие знака через тактовую черту',
            'Das Zeichen über den Taktstrich verfolgen',
          )[lang]
        }
      </h4>
      <p>
        {
          nt(
            'The signature above applies here. The first note takes the selected local sign; the second is in another octave. The third continues into bar 2 under a tie. The fifth is a fresh attack and follows the signature again.',
            'Здесь действуют ключевые знаки выше. У первой ноты выбранный случайный знак; вторая находится в другой октаве. Третья продолжается во втором такте под связующей лигой. Пятая берётся заново и снова подчиняется ключевым знакам.',
            'Hier gilt die Vorzeichnung oben. Die erste Note erhält das gewählte Versetzungszeichen; die zweite steht in einer anderen Oktave. Die dritte wird in Takt 2 übergebunden. Die fünfte wird neu angeschlagen und folgt wieder der Vorzeichnung.',
          )[lang]
        }
      </p>
      <Staff
        pitches={sequence}
        accidentalVisibility={[explicit !== null, false, false, false, false]}
        barlines={[2]}
        ties={[2]}
        lang={lang}
        space={11}
      />
      <ol className="accidental-sequence">
        {sequence.map((note, index) => (
          <li key={index}>{pitchLabel(note, lang)}</li>
        ))}
      </ol>
    </section>
  );
}
