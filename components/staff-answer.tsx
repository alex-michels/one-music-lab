'use client';
import { useId, useRef, useState } from 'react';
import { Staff } from './staff';
import { layout, pitchAtStep, staffStep, stepY, type Clef } from '@/lib/staff';
import { parseNoteName } from '@/lib/staff-answers';
import { pitchLabel, pitchName, type MusicLanguage } from '@/lib/notation';
import type { Item } from '@/lib/exercises';

// Localized controls for the bounded №553 prototype. This is not a score editor.
export const staffWords = {
  en: {
    modes: 'Answer with',
    choices: 'Choices',
    type: 'Type a name',
    place: 'Place on the staff',
    check: 'Check answer',
    input: 'Note name',
    hint: 'Examples: C, C#, Eb, F##. The note name is enough.',
    invalid: 'Enter a note name in English, including its accidental.',
    placePrompt: 'Place this written pitch:',
    position: 'Staff position',
    line: 'Line',
    space: 'Space',
    below: 'Steps below the bottom line:',
    above: 'Steps above the top line:',
    clef: 'Clef',
    sign: 'Accidental',
    signs: ['double flat', 'flat', 'none', 'sharp', 'double sharp'],
    help: 'Click a position or use the arrow keys. Home and End reach the lowest and highest positions. Then check your answer.',
    answer: 'Correct note:',
    clefs: { treble: 'treble', bass: 'bass', alto: 'alto', tenor: 'tenor' },
  },
  ru: {
    modes: 'Способ ответа',
    choices: 'Варианты',
    type: 'Ввести название',
    place: 'Поставить на стане',
    check: 'Проверить ответ',
    input: 'Название ноты',
    hint: 'Примеры: до, до-диез, ми-бемоль, фа-дубль-диез. Достаточно названия ноты.',
    invalid: 'Введите русское название ноты со знаком альтерации.',
    placePrompt: 'Поставьте эту ноту на стане:',
    position: 'Положение на стане',
    line: 'Линейка',
    space: 'Промежуток',
    below: 'Шагов ниже нижней линейки:',
    above: 'Шагов выше верхней линейки:',
    clef: 'Ключ',
    sign: 'Знак альтерации',
    signs: ['дубль-бемоль', 'бемоль', 'без знака', 'диез', 'дубль-диез'],
    help: 'Нажмите на нужное место или используйте стрелки. Home и End — крайние положения. Затем проверьте ответ.',
    answer: 'Правильная нота:',
    clefs: {
      treble: 'скрипичный',
      bass: 'басовый',
      alto: 'альтовый',
      tenor: 'теноровый',
    },
  },
  de: {
    modes: 'Antwortform',
    choices: 'Auswahl',
    type: 'Namen eingeben',
    place: 'Im Notensystem setzen',
    check: 'Antwort prüfen',
    input: 'Tonname',
    hint: 'Beispiele: C, Cis, Es, Fisis, H, B. Der Tonname genügt.',
    invalid: 'Geben Sie einen deutschen Tonnamen mit seiner Alteration ein.',
    placePrompt: 'Setzen Sie diesen Ton:',
    position: 'Position im Notensystem',
    line: 'Linie',
    space: 'Zwischenraum',
    below: 'Schritte unter der untersten Linie:',
    above: 'Schritte über der obersten Linie:',
    clef: 'Schlüssel',
    sign: 'Versetzungszeichen',
    signs: ['Doppel-Be', 'Be', 'ohne', 'Kreuz', 'Doppelkreuz'],
    help: 'Klicken Sie auf eine Position oder verwenden Sie die Pfeiltasten. Pos1 und Ende erreichen die tiefste und höchste Position. Prüfen Sie dann Ihre Antwort.',
    answer: 'Richtiger Ton:',
    clefs: {
      treble: 'Violinschlüssel',
      bass: 'Bassschlüssel',
      alto: 'Altschlüssel',
      tenor: 'Tenorschlüssel',
    },
  },
} as const;

export function positionLabel(step: number, lang: MusicLanguage) {
  const t = staffWords[lang];
  if (step < 0) return `${t.below} ${-step}`;
  if (step > 8) return `${t.above} ${step - 8}`;
  return `${step % 2 === 0 ? t.line : t.space} ${Math.floor(step / 2) + 1}`;
}

const RANGE = [-3, 11] as const;
const POSITIONS = Array.from({ length: 15 }, (_, i) => i - 3);

function StaffPosition({
  clef,
  accidental,
  lang,
  disabled,
  value,
  onChange,
}: {
  clef: Clef;
  accidental: number;
  lang: MusicLanguage;
  disabled: boolean;
  value: number | null;
  onChange: (value: number) => void;
}) {
  const t = staffWords[lang];
  const buttons = useRef(new Map<number, HTMLButtonElement>());
  const helpId = useId();
  const pitches = value === null ? [] : [pitchAtStep(value, clef, accidental)];
  const plan = layout(pitches, clef, [], [], RANGE);
  return (
    <>
      <p id={helpId}>{t.help}</p>
      <fieldset
        className="staff-position"
        aria-label={t.position}
        aria-describedby={helpId}
        style={{ width: plan.width * 26, height: plan.height * 26 }}
      >
        <Staff
          pitches={pitches}
          clef={clef}
          lang={lang}
          range={RANGE}
          space={26}
          label={`${t.clef}: ${t.clefs[clef]}`}
        />
        {POSITIONS.map((step) => (
          <button
            key={step}
            type="button"
            ref={(el) => {
              if (el) buttons.current.set(step, el);
              else buttons.current.delete(step);
            }}
            aria-label={positionLabel(step, lang)}
            aria-pressed={value === step}
            tabIndex={step === (value ?? 4) ? 0 : -1}
            disabled={disabled}
            style={{
              top: `${(100 * stepY(step, plan.top)) / plan.height}%`,
              height: `${50 / plan.height}%`,
            }}
            onClick={() => onChange(step)}
            onKeyDown={(event) => {
              let next: number;
              if (event.key === 'ArrowUp' || event.key === 'ArrowRight')
                next = Math.min(RANGE[1], step + 1);
              else if (event.key === 'ArrowDown' || event.key === 'ArrowLeft')
                next = Math.max(RANGE[0], step - 1);
              else if (event.key === 'Home') next = RANGE[0];
              else if (event.key === 'End') next = RANGE[1];
              else return;
              event.preventDefault();
              onChange(next);
              buttons.current.get(next)?.focus();
            }}
          />
        ))}
      </fieldset>
    </>
  );
}

export function StaffAnswer({
  item,
  chosen,
  onAnswer,
}: {
  item: Item;
  chosen: string | null;
  onAnswer: (id: string) => void;
}) {
  const [mode, setMode] = useState<'choices' | 'type' | 'place'>('choices');
  const [text, setText] = useState('');
  const [invalid, setInvalid] = useState(false);
  const [position, setPosition] = useState<number | null>(null);
  const hintId = useId();
  if (item.kind !== 'read-pitch' || !item.staff)
    throw new Error('StaffAnswer requires a read-pitch item');
  const { lang, staff } = item;
  const target = staff.pitches[0];
  const t = staffWords[lang];
  const done = chosen !== null;
  const description = `${t.clef}: ${t.clefs[staff.clef]}; ${positionLabel(staffStep(target, staff.clef), lang)}; ${t.sign}: ${t.signs[target.accidental + 2]}`;
  return (
    <>
      <fieldset className="note-chooser" aria-label={t.modes} disabled={done}>
        {(['choices', 'type', 'place'] as const).map((value) => (
          <button
            key={value}
            type="button"
            aria-pressed={mode === value}
            onClick={() => {
              setMode(value);
              setInvalid(false);
            }}
          >
            {t[value]}
          </button>
        ))}
      </fieldset>
      <h2 className="exercise-prompt">
        {mode === 'place'
          ? `${t.placePrompt} ${pitchLabel(target, lang)}`
          : item.prompt}
      </h2>
      {mode === 'place' ? (
        <StaffPosition
          clef={staff.clef}
          accidental={target.accidental}
          lang={lang}
          disabled={done}
          value={position}
          onChange={setPosition}
        />
      ) : (
        <div className="exercise-staff">
          <Staff
            pitches={staff.pitches}
            clef={staff.clef}
            lang={lang}
            space={18}
            label={description}
          />
        </div>
      )}
      {mode === 'choices' ? (
        <div className="answer-grid">
          {item.options.map((option) => (
            <button
              key={option.id}
              disabled={done}
              onClick={() => onAnswer(option.id)}
              className={
                done && option.id === item.answer
                  ? 'answer-correct'
                  : chosen === option.id
                    ? 'answer-wrong'
                    : ''
              }
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : (
        <form
          className="staff-answer-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (done) return;
            if (mode === 'place') {
              if (position !== null)
                onAnswer(
                  position === staffStep(target, staff.clef)
                    ? item.answer
                    : 'written-wrong',
                );
            } else {
              const parsed = parseNoteName(text, lang);
              if (!parsed) {
                setInvalid(true);
                return;
              }
              onAnswer(
                parsed.letter === target.letter &&
                  parsed.accidental === target.accidental
                  ? item.answer
                  : 'written-wrong',
              );
            }
          }}
        >
          {mode === 'type' && (
            <>
              <label>
                {t.input}
                <input
                  value={text}
                  disabled={done}
                  maxLength={64}
                  aria-invalid={invalid}
                  aria-describedby={hintId}
                  onChange={(event) => {
                    setText(event.target.value);
                    setInvalid(false);
                  }}
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <p id={hintId}>{t.hint}</p>
              {invalid && <p role="alert">{t.invalid}</p>}
            </>
          )}
          <button
            className="primary-button"
            disabled={done || (mode === 'place' && position === null)}
          >
            {t.check}
          </button>
        </form>
      )}
      {done && (
        <p>
          {t.answer}{' '}
          <strong>
            {mode === 'place'
              ? pitchLabel(target, lang)
              : pitchName(target, lang)}
          </strong>
        </p>
      )}
    </>
  );
}
