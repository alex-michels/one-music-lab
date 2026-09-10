import { afterEach, expect, test, vi } from 'vitest';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { page } from 'vitest/browser';
import { NoteText } from '../../components/note-text.tsx';
import { Theory, Encyclopedia, Practice } from '../../components/learning.tsx';
import { NotationResponse } from '../../components/notation-response.tsx';
import { StaffAnswer } from '../../components/staff-answer.tsx';
import { NotationWorkbench } from '../../components/notation-workbench.tsx';
import { ChordsLab } from '../../components/chords-lab.tsx';
import { localizedText } from '../../lib/i18n.ts';
import { generateFrom } from '../../lib/exercises.ts';
import { pitchName } from '../../lib/notation.ts';
import { DRILL_STORAGE_KEY } from '../../lib/client-store.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container;
async function mount(component, props) {
  if (!container) {
    container = document.body.appendChild(document.createElement('div'));
    root = createRoot(container);
  }
  await act(() => root.render(createElement(component, props)));
}
afterEach(async () => {
  if (root) await act(() => root.unmount());
  container?.remove();
  root = container = null;
  sessionStorage.removeItem(DRILL_STORAGE_KEY);
});
const notes = (within = container) =>
  [...within.querySelectorAll('i.russian-note-name')].map((n) => n.textContent);

test('Explicit Russian note names are italic; the intervening preposition and EN/DE stay plain', async () => {
  const text = localizedText(
    'From C to G',
    'От [[до]] до [[соль]]',
    'Von C bis G',
  );
  for (const lang of ['ru', 'en', 'de']) {
    await mount(NoteText, { text, lang });
    expect(container.textContent).toBe(text[lang]);
    expect(notes()).toEqual(lang === 'ru' ? ['до', 'соль'] : []);
    for (const note of container.querySelectorAll('i'))
      expect(getComputedStyle(note).fontStyle).toBe('italic');
  }
  await mount(NoteText, { lang: 'ru', text: 'до завтра' });
  expect(notes()).toEqual([]);
  await mount(NoteText, { lang: 'ru', text: 'ля, первая октава', pitch: true });
  expect(notes()).toEqual(['ля']);
  expect(container.textContent).toBe('ля, первая октава');
  await mount(NoteText, {
    lang: 'ru',
    text: 'до <img src=x>',
    markup: '[[до]] <img src=x>',
  });
  expect(container.querySelector('img')).toBeNull();
  expect(container.textContent).toBe('до <img src=x>');
  await mount(NoteText, { lang: 'ru' });
  expect(container.textContent).toBe('');
});

test('Lessons and glossary distinguish notes from adjacent instances of до without changing search or links', async () => {
  await mount(Theory, {
    lang: 'ru',
    lessonId: 'note-names',
    anchor: null,
    setLessonId: vi.fn(),
    openLab: vi.fn(),
  });
  const experiment = container.querySelector('.lesson-experiment p');
  expect(experiment.textContent).toContain('Пройдите кнопками ступеней до си');
  expect(notes(experiment)).toEqual(['до', 'си', 'до']);
  expect(container.textContent).not.toContain('[[');
  await mount(Encyclopedia, {
    lang: 'ru',
    subject: null,
    anchor: encodeURIComponent('Octave register'),
    openLesson: vi.fn(),
  });
  const entry = container.querySelector('.term-entry');
  expect(entry.textContent).toContain('от до до ближайшего си');
  expect(notes(entry)).toEqual(['до', 'си']);
  const link = entry.querySelector('a');
  expect(link.getAttribute('href')).toContain('Octave%20register');
});

test('Practice formats pitch options and continues to grade their original IDs', async () => {
  await mount(Practice, { lang: 'ru', topic: 'accidental-signs' });
  const buttons = [...container.querySelectorAll('.answer-grid button')];
  expect(buttons.length).toBeGreaterThan(1);
  for (const button of buttons) expect(notes(button)).toHaveLength(1);
  await act(() => buttons[0].click());
  expect(container.querySelector('.answer-feedback')).not.toBeNull();
  expect(container.textContent).not.toContain('[[');
  expect(
    container.querySelector('[data-rule="alteration-name"] .ledger-tally')
      .textContent,
  ).toContain('1');
});

test('Excerpt options and per-note feedback italicize only the note, keeping the octave readable', async () => {
  const item = generateFrom('short-excerpt', 1, 48, 'ru');
  await mount(NotationResponse, { item, onComplete: vi.fn() });
  const field = container.querySelector('fieldset');
  expect(notes(field)).toHaveLength(item.parts[0].options.length);
  await act(() => field.querySelector('button').click());
  expect(notes(field.querySelector('output')).length).toBeGreaterThan(0);
  expect(field.querySelector('output').textContent).toContain(
    item.parts[0].answer,
  );
  expect(container.textContent).not.toContain('[[');
});

test('Typed-note hints, placement prompts and correct-answer feedback retain plain input and accessible labels', async () => {
  const item = generateFrom('read-pitch', 1, 12, 'ru'),
    onAnswer = vi.fn();
  await mount(StaffAnswer, { item, chosen: null, onAnswer });
  await act(() =>
    page.getByRole('button', { name: 'Ввести название', exact: true }).click(),
  );
  expect(notes(container.querySelector('.staff-answer-form p'))).toEqual([
    'до',
    'до-диез',
    'ми-бемоль',
    'фа-дубль-диез',
  ]);
  const correct = pitchName(item.staff.pitches[0], 'ru');
  await act(() =>
    page
      .getByRole('textbox', { name: 'Название ноты', exact: true })
      .fill(correct),
  );
  await act(() =>
    page.getByRole('button', { name: 'Проверить ответ', exact: true }).click(),
  );
  expect(onAnswer).toHaveBeenCalledWith(item.answer);
  await mount(StaffAnswer, { item, chosen: item.answer, onAnswer });
  expect(notes(container.querySelector('strong'))).toEqual([correct]);
  await mount(StaffAnswer, { key: 'placement', item, chosen: null, onAnswer });
  await act(() =>
    page
      .getByRole('button', { name: 'Поставить на стане', exact: true })
      .click(),
  );
  expect(notes(container.querySelector('.exercise-prompt'))).toEqual([correct]);
  for (const node of container.querySelectorAll('[aria-label]'))
    expect(node.getAttribute('aria-label')).not.toContain('[[');
});

test('Notation comparisons distinguish pitch names from octave descriptions in every locale', async () => {
  const pitch = { letter: 0, accidental: 0, octave: 4, midi: 60 };
  for (const lang of ['ru', 'en', 'de']) {
    await mount(NotationWorkbench, {
      pitch,
      lang,
      play: vi.fn(),
      stop: vi.fn(),
    });
    expect(notes(container.querySelector('.notation-result output'))).toEqual(
      lang === 'ru' ? ['до'] : [],
    );
    for (const note of container.querySelectorAll('.accidental-sequence li')) {
      expect(notes(note)).toEqual(lang === 'ru' ? ['до'] : []);
      expect(note.textContent).not.toContain('[[');
    }
  }
});

test('Chord-study answers and explanations use italic pitch names while chord symbols remain plain', async () => {
  await mount(ChordsLab, { lang: 'ru' });
  for (const name of container.querySelectorAll('.chord-palette-list small'))
    expect(notes(name).length).toBeGreaterThanOrEqual(3);
  expect(
    container.querySelector('.chord-keyboard .russian-note-name'),
  ).toBeNull();
  await act(() =>
    page.getByRole('tab', { name: 'Проверьте себя', exact: true }).click(),
  );
  const answers = [
    ...container.querySelectorAll('.chord-answer-options button'),
  ];
  expect(answers.length).toBeGreaterThanOrEqual(3);
  for (const answer of answers) expect(notes(answer)).toHaveLength(1);
  await act(() => answers[0].click());
  expect(notes(container.querySelector('.chord-feedback'))).toHaveLength(1);
  expect(container.textContent).not.toContain('[[');
});
