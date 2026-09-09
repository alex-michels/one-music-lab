'use client';
import { useState } from 'react';
import { Piano, Volume2, Square } from 'lucide-react';
import {
  notationExamples,
  notationGroups,
  type NotesLabState,
  type NotationExampleId,
} from '@/lib/notation-experiments';
import { fixedNumber, translator } from '@/lib/i18n';
import {
  octaveName,
  pitchLabel,
  pitchName,
  type SpelledPitch,
} from '@/lib/notation';
import { frequencyForMidi, type Tuning } from '@/lib/music';
import { Staff } from '@/components/staff';
import { GLYPH_UNITS_PER_SPACE, glyphs, type GlyphName } from '@/lib/glyphs';
import type { Clef } from '@/lib/staff';
import { pitchAtStep, placementRange, staffStep } from '@/lib/staff';
import { StaffPosition } from './staff-answer';
import { NotationWorkbench } from './notation-workbench';
import { NotationFigure } from './notation-figure';
import { NotationSelect } from './notation-select';
import { nt } from '@/lib/notation-tasks';
type Lang = import('@/lib/client-store').Lang;

/**
 * The notes lab (roadmap №558). A written note, the key it lands on and the
 * frequency it makes, in one chain the reader can move from either end.
 *
 * The staff is drawn by components/staff.tsx from committed glyph outlines
 * (№553); no engine runs here and no font is fetched. What the panel adds
 * around it is the part a staff alone does not say: that the spelling and the
 * sounding pitch are different facts, and that the reference pitch and the
 * tuning map decide the frequency while the written note stays put.
 */

const NATURAL_STEPS = [0, 2, 4, 5, 7, 9, 11];
/** Written octaves the panel offers; `octaveName` is defined for 0–8. */
const OCTAVES = [0, 1, 2, 3, 4, 5, 6, 7, 8];

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

/**
 * The five signs, drawn rather than typed, at the size and the vertical
 * relationship they have on a staff: a double sharp is a small mark on the
 * note's own line, a flat reaches well above it.
 *
 * The width of each glyph is its own; the vertical window is shared, measured
 * from the committed outlines after the flip from y-up font units to y-down
 * SVG. One staff space is `GLYPH_UNITS_PER_SPACE` units, so the path is scaled
 * by its reciprocal and mirrored.
 */
const SIGN_TOP = -1.9;
const SIGN_HEIGHT = 2.85;
const SIGN_SPACE = 9;
const signGlyphs: { name: GlyphName; width: number }[] = [
  { name: 'accidentalDoubleFlat', width: 1.552 },
  { name: 'accidentalFlat', width: 0.792 },
  { name: 'accidentalNatural', width: 0.628 },
  { name: 'accidentalSharp', width: 0.788 },
  { name: 'accidentalDoubleSharp', width: 1.028 },
];

function AccidentalSign({ index }: { index: number }) {
  const { name, width } = signGlyphs[index];
  const scale = 1 / GLYPH_UNITS_PER_SPACE;
  return (
    <svg
      className="accidental-sign"
      viewBox={`0 ${SIGN_TOP} ${width} ${SIGN_HEIGHT}`}
      width={width * SIGN_SPACE}
      height={SIGN_HEIGHT * SIGN_SPACE}
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={glyphs[name]}
        transform={`scale(${scale} ${-scale})`}
        fill="currentColor"
      />
    </svg>
  );
}

const clefs: Clef[] = ['treble', 'bass', 'alto', 'tenor'];
const clefNames: Record<Clef, Record<Lang, string>> = {
  treble: { en: 'Treble', ru: 'Скрипичный', de: 'Violinschlüssel' },
  bass: { en: 'Bass', ru: 'Басовый', de: 'Bassschlüssel' },
  alto: { en: 'Alto', ru: 'Альтовый', de: 'Altschlüssel' },
  tenor: { en: 'Tenor', ru: 'Теноровый', de: 'Tenorschlüssel' },
};

export function NotesLab({
  lang,
  reference,
  tuning,
  play,
  state,
  onChange,
  playExample,
  stop,
}: {
  lang: Lang;
  reference: number;
  tuning: Tuning;
  play: (midi: number) => void | Promise<void>;
  state: NotesLabState;
  onChange: (state: NotesLabState) => void;
  playExample: (id: NotationExampleId, tempo: number) => void | Promise<void>;
  stop: () => void;
}) {
  const t = translator(lang);
  const [clef, setClef] = useState<Clef>('treble');
  const [ledgerLines, setLedgerLines] = useState(1);
  const placement = placementRange(ledgerLines);
  const [selectedExample, setSelectedExample] =
    useState<NotationExampleId | null>(null);
  const exampleIds = (
    Object.keys(notationExamples) as NotationExampleId[]
  ).filter((id) => notationExamples[id].group === state.group);
  const activeExample =
    selectedExample !== null && exampleIds.includes(selectedExample)
      ? selectedExample
      : exampleIds[0];
  const { letter, accidental, octave } = state.note;
  const setNote = (note: Partial<NotesLabState['note']>) => {
    stop();
    onChange({ ...state, note: { ...state.note, ...note } });
  };
  const pitch = spell(letter, accidental, octave);
  const hz = frequencyForMidi(pitch.midi, reference, tuning);
  const audible = hz >= 20 && hz <= 20000;
  /*
   * The sign is what is printed on a staff, and it is the same mark in every
   * language: German names the alteration inside the note name (es, is) and
   * Russian names it in words, but nobody writes those on the staff. So the
   * button shows the mark and says the word, in the reader's own language.
   *
   * Drawing the marks also closes the one hole in the font stack: the English
   * row used U+1D12B and U+1D12A, which are Supplementary-Plane characters that
   * Segoe UI and Arial do not have, so those two buttons were empty boxes.
   */
  const signNames: Record<Lang, string[]> = {
    en: ['double flat', 'flat', 'natural', 'sharp', 'double sharp'],
    ru: ['дубль-бемоль', 'бемоль', 'без знака', 'диез', 'дубль-диез'],
    de: ['eses', 'es', 'ohne', 'is', 'isis'],
  };
  return (
    <div className="notes-lab">
      <section className="panel note-builder">
        <div className="panel-heading">
          <h3>
            <span className="panel-number">01</span>
            {t('Write a note', 'Запишите ноту')}
          </h3>
        </div>
        <fieldset
          className="note-chooser note-letters"
          aria-label={t('Note name', 'Название ноты')}
        >
          <legend>{t('Note name', 'Название ноты')}</legend>
          {[0, 1, 2, 3, 4, 5, 6].map((value) => (
            <button
              key={value}
              className={value === letter ? 'selected' : ''}
              aria-pressed={value === letter}
              onClick={() => setNote({ letter: value })}
            >
              {pitchName(spell(value, 0, octave), lang)}
            </button>
          ))}
        </fieldset>
        <fieldset
          className="note-chooser note-signs"
          aria-label={t('Accidental', 'Знак альтерации')}
        >
          <legend>{t('Accidental', 'Знак альтерации')}</legend>
          {[-2, -1, 0, 1, 2].map((value) => (
            <button
              key={value}
              className={value === accidental ? 'selected' : ''}
              aria-pressed={value === accidental}
              aria-label={signNames[lang][value + 2]}
              onClick={() => setNote({ accidental: value })}
            >
              <AccidentalSign index={value + 2} />
            </button>
          ))}
        </fieldset>
        <div className="note-register-controls">
          <NotationSelect
            label={t('Octave', 'Октава')}
            value={String(octave)}
            options={OCTAVES.map((value) => ({
              value: String(value),
              label: octaveName(spell(letter, 0, value), lang),
            }))}
            onChange={(value) => setNote({ octave: Number(value) })}
          />
          <NotationSelect
            label={t('Clef', 'Ключ')}
            value={clef}
            options={clefs.map((value) => ({
              value,
              label: clefNames[value][lang],
            }))}
            onChange={(value) => setClef(value as Clef)}
          />
        </div>
      </section>
      <section className="panel note-readout">
        <div className="panel-heading">
          <h3>
            <span className="panel-number">02</span>
            {t('What it is', 'Что это')}
          </h3>
        </div>
        <div className="note-identity">
          <div className="staff-frame">
            <Staff pitches={[pitch]} clef={clef} lang={lang} space={11} />
          </div>
          <div>
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
          </div>
        </div>
        <div className="notation-transport">
          <button
            className="primary-button"
            disabled={!audible}
            onClick={() => void play(pitch.midi)}
          >
            <Volume2 size={17} />
            {t('Hear this note', 'Послушать ноту')}
          </button>
          <button className="text-button" onClick={stop}>
            <Square size={16} />
            {t('Stop sound', 'Остановить звук')}
          </button>
        </div>
        <p className="note-caption">
          {t(
            'The frequency follows the reference pitch and the tuning map chosen in the tone generator. The written note does not change when they do.',
            'Частота зависит от опорного тона и строя, выбранных в генераторе тонов. Запись ноты при этом не меняется.',
          )}
        </p>
      </section>
      <section className="panel notation-examples">
        <div className="panel-heading">
          <h3>{t('Compare short examples', 'Сравните короткие примеры')}</h3>
        </div>
        <fieldset
          className="note-chooser"
          aria-label={t('Experiment topic', 'Тема эксперимента')}
        >
          <legend>{t('Experiment topic', 'Тема эксперимента')}</legend>
          {notationGroups.map((group) => (
            <button
              key={group.id}
              aria-pressed={state.group === group.id}
              className={state.group === group.id ? 'selected' : ''}
              onClick={() => {
                stop();
                onChange({ ...state, group: group.id });
              }}
            >
              {group.label[lang]}
            </button>
          ))}
        </fieldset>
        <fieldset
          className="note-chooser"
          aria-label={t('Quarter notes per minute', 'Четвертей в минуту')}
        >
          <legend>{t('Quarter notes per minute', 'Четвертей в минуту')}</legend>
          {([60, 120] as const).map((tempo) => (
            <button
              key={tempo}
              aria-pressed={state.tempo === tempo}
              className={state.tempo === tempo ? 'selected' : ''}
              onClick={() => {
                stop();
                onChange({ ...state, tempo });
              }}
            >
              ♩ = {tempo}
            </button>
          ))}
        </fieldset>
        <div className="notation-example-actions">
          <div className="notation-example-score">
            <p className="notation-score-label">
              {notationExamples[activeExample].label[lang]}
            </p>
            <NotationFigure
              id={`example-${activeExample}`}
              label={notationExamples[activeExample].label[lang]}
            />
          </div>
          {(Object.keys(notationExamples) as NotationExampleId[])
            .filter((id) => notationExamples[id].group === state.group)
            .map((id) => (
              <button
                key={id}
                className={
                  activeExample === id
                    ? 'primary-button'
                    : 'notation-example-button'
                }
                aria-pressed={activeExample === id}
                onClick={() => {
                  setSelectedExample(id);
                  void playExample(id, state.tempo);
                }}
              >
                <Volume2 size={17} />
                {notationExamples[id].label[lang]}
              </button>
            ))}
          <button className="text-button" onClick={stop}>
            <Square size={16} />
            {t('Stop example', 'Остановить пример')}
          </button>
        </div>
        <p className="note-caption">
          {t(
            'Each button plays a finite example. Compare the attacks and gaps at the same tempo; the oscillator illustrates timing, not an instrument-specific articulation rule.',
            'Каждая кнопка запускает конечный пример. Сравнивайте атаки и паузы при одном темпе; генератор иллюстрирует временные отношения, а не правила штрихов конкретного инструмента.',
          )}
        </p>
      </section>
      <section className="panel note-placement">
        <h3>
          {
            nt(
              'Place a note on the staff',
              'Поставьте ноту на стан',
              'Eine Note ins System setzen',
            )[lang]
          }
        </h3>
        <div className="note-placement-grid">
          <div className="note-placement-canvas">
            <StaffPosition
              clef={clef}
              accidental={accidental}
              lang={lang}
              disabled={false}
              ledgerLines={ledgerLines}
              value={
                staffStep(pitch, clef) >= placement[0] &&
                staffStep(pitch, clef) <= placement[1]
                  ? staffStep(pitch, clef)
                  : null
              }
              help={
                nt(
                  'Click a position or use the arrow keys to place and hear a note.',
                  'Нажмите на позицию или используйте стрелки, чтобы поставить и услышать ноту.',
                  'Klicke auf eine Position oder verwende die Pfeiltasten, um eine Note zu setzen und zu hören.',
                )[lang]
              }
              onChange={(step) => {
                const placed = pitchAtStep(step, clef, accidental);
                setNote(placed);
                void play(placed.midi);
              }}
            />
          </div>
          <label className="notation-range">
            <span>
              {
                nt(
                  'Ledger lines per side',
                  'Добавочных линеек с каждой стороны',
                  'Hilfslinien je Seite',
                )[lang]
              }
              <output>{ledgerLines}</output>
            </span>
            <input
              type="range"
              min="0"
              max="6"
              step="1"
              value={ledgerLines}
              onChange={(event) => {
                stop();
                setLedgerLines(Number(event.target.value));
              }}
            />
          </label>
        </div>
      </section>
      <NotationWorkbench pitch={pitch} lang={lang} play={play} stop={stop} />
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
