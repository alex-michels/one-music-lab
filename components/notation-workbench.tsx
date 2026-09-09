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
import { Volume2, RotateCcw, Square } from 'lucide-react';
import { NotationSelect } from './notation-select';

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
      <div className="notation-comparison">
        <div className="notation-settings">
          <NotationSelect
            label={signatureLabel}
            value={String(count)}
            options={Array.from({ length: 15 }, (_, i) => i - 7).map((n) => ({
              value: String(n),
              label:
                n === 0
                  ? nt(
                      'No key signature',
                      'Без ключевых знаков',
                      'Keine Vorzeichen',
                    )[lang]
                  : `${Math.abs(n)} ${n < 0 ? '♭' : '♯'}`,
            }))}
            onChange={(value) => update(() => setCount(Number(value)))}
          />
          <svg
            className="notation-signature"
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
          <NotationSelect
            label={
              nt(
                'Accidental before this note',
                'Знак перед этой нотой',
                'Versetzungszeichen vor dieser Note',
              )[lang]
            }
            value={String(explicit ?? 'signature')}
            onChange={(value) =>
              update(() =>
                setExplicit(value === 'signature' ? null : Number(value)),
              )
            }
            options={[
              {
                value: 'signature',
                label: nt(
                  'Use the signature',
                  'По ключевым знакам',
                  'Vorzeichen gelten',
                )[lang],
              },
              ...[-2, -1, 0, 1, 2].map((n) => ({
                value: String(n),
                label: {
                  en: [
                    'Double flat',
                    'Flat',
                    'Natural',
                    'Sharp',
                    'Double sharp',
                  ],
                  ru: ['Дубль-бемоль', 'Бемоль', 'Бекар', 'Диез', 'Дубль-диез'],
                  de: [
                    'Doppel-Be',
                    'Be',
                    'Auflösungszeichen',
                    'Kreuz',
                    'Doppelkreuz',
                  ],
                }[lang][n + 2],
              })),
            ]}
          />
          <NotationSelect
            label={
              nt('Octave displacement', 'Перенос на октаву', 'Oktavierung')[
                lang
              ]
            }
            value={String(safeShift)}
            onChange={(value) => update(() => setShift(Number(value)))}
            options={[-2, -1, 0, 1, 2]
              .filter((n) => pitch.octave + n >= 0 && pitch.octave + n <= 8)
              .map((n) => ({
                value: String(n),
                label:
                  n === 0
                    ? nt(
                        'No displacement',
                        'Без переноса',
                        'Keine Oktavierung',
                      )[lang]
                    : ['15mb', '8vb', '', '8va', '15ma'][n + 2],
              }))}
          />
        </div>
        <div className="notation-result">
          <div className="notation-result-score">
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
          </div>
          <div className="notation-transport">
            <button
              className="primary-button"
              disabled={sounding.midi < 24 || sounding.midi > 108}
              onClick={() => void play(sounding.midi)}
            >
              <Volume2 size={17} />
              {
                nt(
                  'Hear the result',
                  'Послушать результат',
                  'Ergebnis anhören',
                )[lang]
              }
            </button>
            <button className="notation-stop" onClick={stop}>
              <Square size={16} />
              {
                nt(
                  'Stop comparison',
                  'Остановить сравнение',
                  'Vergleich stoppen',
                )[lang]
              }
            </button>
          </div>
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
            <RotateCcw size={16} />
            {
              nt(
                'Reset this comparison',
                'Сбросить это сравнение',
                'Diesen Vergleich zurücksetzen',
              )[lang]
            }
          </button>
        </div>
      </div>
      <div className="notation-sequence-study">
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
      </div>
    </section>
  );
}
