import { afterEach, expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { act, createElement } from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../../app/page.tsx';
import {
  Experiments,
  Theory,
  Encyclopedia,
  Practice,
} from '../../components/learning.tsx';
import { ChordsLab } from '../../components/chords-lab.tsx';
import { AudioEngine } from '../../lib/audio.ts';
import { ChordPlayer } from '../../lib/chord-audio.ts';
import { LANGUAGE_STORAGE_KEY } from '../../lib/client-store.ts';
import '../../app/globals.css';

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
let root, container, meta;
function render(Component, props = {}) {
  if (!container) {
    container = document.createElement('div');
    document.body.append(container);
    root = createRoot(container);
  }
  void act(() => root.render(createElement(Component, props)));
}
afterEach(async () => {
  if (root) await act(() => root.unmount());
  root = null;
  container?.remove();
  container = null;
  meta?.remove();
  meta = null;
  localStorage.removeItem(LANGUAGE_STORAGE_KEY);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  await page.viewport(1280, 900);
});
const click = (name) =>
  act(async () => page.getByRole('button', { name, exact: true }).click());
async function choose(label, option) {
  const box = page.getByRole('combobox', { name: label, exact: true });
  await act(async () => box.click());
  await act(async () =>
    page.getByRole('option', { name: option, exact: true }).click(),
  );
  await expect.poll(() => box.element().textContent).toContain(option);
}

test('German persists, updates metadata and all navigation, uses H on the keyboard, and translates existing errors', async () => {
  await page.viewport(1280, 900);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, 'de');
  meta = document.createElement('meta');
  meta.name = 'description';
  document.head.append(meta);
  render(Home);
  expect(document.documentElement.lang).toBe('de');
  expect(meta.content).toContain('Entdecke Klang');
  expect(container.querySelector('h1').textContent).toBe(
    'Klang in deinen Händen.',
  );
  expect(
    [...container.querySelectorAll('.white-key')].map((el) => el.textContent),
  ).toContain('h′');
  expect(
    [...container.querySelectorAll('.black-key')].map((el) => el.textContent),
  ).toContain('ais′');
  expect(container.querySelector('.current-note').textContent).toBe('a′');
  // An error raised in EN must change language along with the rest of the page.
  vi.spyOn(AudioEngine.prototype, 'start').mockRejectedValue(
    new Error('test failure'),
  );
  await click('EN');
  await click('Play tone Space');
  await expect.element(page.getByRole('alert')).toBeVisible();
  await click('DE');
  expect(page.getByRole('alert').element().textContent).toContain(
    'Die Wiedergabe konnte nicht starten',
  );
  expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('de');
  for (const [label, heading] of [
    ['Akkordlabor', 'Akkorde verbinden.'],
    ['Musiktheorie', 'Die Ideen hinter der Musik.'],
    ['Gehörbildung', 'Hören lernen.'],
    ['Lexikon', 'Die Sprache der Musik.'],
    ['Klanglabor', 'Klang in deinen Händen.'],
  ]) {
    await click(label);
    expect(container.querySelector('h1').textContent).toBe(heading);
  }
  await click('RU');
  expect(document.documentElement.lang).toBe('ru');
  expect(container.querySelector('h1').textContent).toBe('Звук в ваших руках.');
  await click('DE');
  await page.viewport(390, 844);
  await click('Navigation öffnen');
  await expect
    .element(page.getByRole('dialog', { name: 'Navigation', exact: true }))
    .toBeVisible();
  await click('Musiktheorie');
  expect(container.querySelector('h1').textContent).toBe(
    'Die Ideen hinter der Musik.',
  );
  // The language control remains usable on a phone, without horizontal page overflow.
  expect(document.documentElement.scrollWidth).toBeLessThanOrEqual(
    window.innerWidth + 1,
  );
});

test('All six German lessons include translated prose, experiments and formulas, and the glossary searches German', async () => {
  await page.viewport(1280, 900);
  const lessonCases = [
    ['sound', 'Schall & Frequenz', 'Druckänderungen'],
    ['tuning', 'Ein Bezugston für ein ganzes System', 'eingestrichene a'],
    ['intervals', 'Der Abstand zwischen Tönen', 'Stammtonstufen'],
    ['timbre', 'Eine Tonhöhe, viele Klangfarben', 'harmonische Teiltöne'],
    ['scales', 'Tonleitern & Modi', 'Ganz- und Halbtonschritten'],
    ['chords', 'Einen Akkord aufbauen', 'Molldreiklang'],
  ];
  for (const [lessonId, title, prose] of lessonCases) {
    const openLab = vi.fn();
    render(Theory, {
      lang: 'de',
      lessonId,
      setLessonId: vi.fn(),
      openLab,
      openPractice: vi.fn(),
    });
    expect(container.querySelector('h2').textContent).toBe(title);
    expect(container.querySelector('.lesson-body').textContent).toContain(
      prose,
    );
    expect(container.querySelector('.formula').textContent).not.toMatch(
      /Major|Minor|A4|cents/,
    );
    await click('Dieses Experiment öffnen');
    expect(openLab).toHaveBeenCalledOnce();
  }
  render(Theory, {
    lang: 'de',
    lessonId: null,
    setLessonId: vi.fn(),
    openLab: vi.fn(),
    openPractice: vi.fn(),
  });
  expect(container.querySelectorAll('.lesson-tile')).toHaveLength(6);
  expect(container.textContent).toContain('Alte Musik & Mehrstimmigkeit');
  render(Encyclopedia, { lang: 'de', openLesson: vi.fn() });
  await page
    .getByRole('textbox', { name: 'Musikalische Begriffe suchen' })
    .fill('Stimmführung');
  expect(container.querySelectorAll('.term-card')).toHaveLength(1);
  expect(container.querySelector('.term-card h3').textContent).toBe(
    'Stimmführung',
  );
  await page.getByRole('textbox').fill('xyzkeinbegriff');
  expect(container.textContent).toContain('Noch kein passender Begriff');
  await click('Alle Begriffe anzeigen');
  expect(container.querySelectorAll('.term-card')).toHaveLength(12);
});

test('German minor scales spell Es/As/B and raise H only in the appropriate forms; playback keeps its pitches', async () => {
  const play = vi.fn().mockResolvedValue();
  render(Experiments, { lang: 'de', reference: 440, tuning: 'equal', play });
  await page
    .getByRole('tab', { name: 'Tonleitern & Modi', exact: true })
    .click();
  await choose('Grundton', 'c′');
  const names = () =>
    [...container.querySelectorAll('.note-sequence > div > span')].map(
      (el) => el.textContent,
    );
  for (const [title, expected] of [
    ['c-Moll – natürlich', 'c′ d′ es′ f′ g′ as′ b′ c″'],
    ['c-Moll – harmonisch', 'c′ d′ es′ f′ g′ as′ h′ c″'],
    ['c-Moll – melodisch (aufwärts)', 'c′ d′ es′ f′ g′ a′ h′ c″'],
    ['c-Moll – melodisch (abwärts)', 'c″ b′ as′ g′ f′ es′ d′ c′'],
  ]) {
    await choose('Erkunden', title);
    expect(names().join(' ')).toBe(expected);
  }
  await click('Nacheinander');
  expect(play.mock.lastCall[0][0]).toBeCloseTo(523.251, 2);
  expect(play.mock.lastCall[0].at(-1)).toBeCloseTo(261.626, 2);
  render(Experiments, { lang: 'de', reference: 20, tuning: 'equal', play });
  expect(container.textContent).toContain('Einige Töne liegen außerhalb');
});

test('The German chord lab transposes H/B, spells inversions, counts beats and gives localized feedback and audio failures', async () => {
  // WebKit under Playwright has no Web Audio, so `new ChordPlayer()` throws in
  // its constructor and never reaches the spy: the German error banner would
  // then appear for a different reason than the one under test, and the
  // assertion that playback was attempted would fail on that engine alone.
  vi.stubGlobal(
    'AudioContext',
    class {
      currentTime = 0;
      close() {
        return Promise.resolve();
      }
    },
  );
  const playback = vi
    .spyOn(ChordPlayer.prototype, 'play')
    .mockRejectedValue(new Error('test failure'));
  render(ChordsLab, { lang: 'de' });
  await choose('Grundton der Tonart · transponieren', 'H');
  const cards = () =>
    [...container.querySelectorAll('.chord-card strong')].map(
      (el) => el.textContent,
    );
  expect(cards()).toEqual(['H', 'E', 'Fis7', 'H']);
  expect(container.textContent).toContain('H-Dur');
  await choose('Basston / Umkehrung', 'Dis · im Bass');
  expect(cards()[0]).toBe('H/Dis');
  await choose('Dauer', '2 Zählzeiten');
  await choose('Grundton der Tonart · transponieren', 'B');
  expect(cards()[0]).toBe('B/D');
  expect(container.querySelector('.chord-pitches').textContent).toContain('d');
  await click('Anhören');
  expect(playback).toHaveBeenCalledOnce();
  expect(container.textContent).toContain(
    'Die Wiedergabe konnte nicht starten',
  );
  await page
    .getByRole('tab', { name: 'Eine Aufgabe ausprobieren', exact: true })
    .click();
  await click('B');
  expect(container.textContent).toContain('Ja. Der Grundton bleibt');
  await page
    .getByRole('tab', { name: 'Begriffe & Quellen', exact: true })
    .click();
  expect(container.textContent).toContain('Zwischendominanten');
  expect(container.textContent).toContain(
    'in der deutschen Fassung mit H und B',
  );
});

test('German interval training spells the heard third, explains mistakes and counts the result', async () => {
  vi.spyOn(Math, 'random')
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(2 / 12);
  const play = vi.fn().mockResolvedValue();
  render(Practice, { lang: 'de', reference: 440, play });
  await click('Übung starten'); // MIDI 59: h, followed by d′ (minor third).
  await click('Große Terz 2');
  expect(container.querySelector('output').textContent).toContain(
    'Kleine Terz · 3 Halbtöne',
  );
  expect(container.querySelector('.answer-detail').textContent).toContain(
    'h → d′',
  );
  expect(container.querySelector('.answer-detail').textContent).toContain(
    'a′ = 440 Hz',
  );
  await click('Übungsrunde zurücksetzen');
  expect(container.textContent).toContain('Übung starten');
});
