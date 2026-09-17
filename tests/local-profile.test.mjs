import { test, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import {
  createProfileStore,
  browserStorage,
  emptyProfile,
  initialRoute,
  isLearningAddress,
  MAX_BACKUP_BYTES,
  migrateLegacy,
  parseBackup,
  PROFILE_KEY,
  serializeProfile,
  profileStore,
  saveAnswers,
} from '../lib/local-profile.ts';
import { RULES } from '../lib/exercises.ts';
import {
  LANGUAGE_STORAGE_KEY,
  THEME_STORAGE_KEY,
  SIDEBAR_WIDTH_STORAGE_KEY,
  DRILL_STORAGE_KEY,
} from '../lib/client-store.ts';
import { progressionTemplates } from '../lib/chords.ts';

test('The committed version-1 backup remains readable independently of current defaults', () => {
  const original = readFileSync(
    new URL('./fixtures/local-profile-v1.json', import.meta.url),
    'utf8',
  );
  expect(parseBackup(serializeProfile(parseBackup(original)))).toEqual({
    ...JSON.parse(original),
    version: 2,
    coaching: emptyProfile().coaching,
  });
});
function memory(entries = {}) {
  const values = new Map(Object.entries(entries));
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
  };
}
test('Browser storage access handles a missing API and a denied property getter', () => {
  for (const kind of ['localStorage', 'sessionStorage']) {
    const original = Object.getOwnPropertyDescriptor(globalThis, kind);
    try {
      Object.defineProperty(globalThis, kind, {
        configurable: true,
        value: undefined,
      });
      expect(browserStorage(kind)).toBe(null);
      Object.defineProperty(globalThis, kind, {
        configurable: true,
        get() {
          throw new Error('denied');
        },
      });
      expect(browserStorage(kind)).toBe(null);
      const data = memory();
      Object.defineProperty(globalThis, kind, {
        configurable: true,
        value: data,
      });
      expect(browserStorage(kind)).toBe(data);
    } finally {
      if (original) Object.defineProperty(globalThis, kind, original);
      else delete globalThis[kind];
    }
  }
});
const makeStore = (storage = memory(), session = null) =>
  createProfileStore(
    () => storage,
    () => session,
  );
function populated() {
  const p = emptyProfile();
  const template = progressionTemplates[1];
  const draft = {
    key: { tonic: 2, mode: template.mode },
    chords: template.steps,
    tempo: 90,
    texture: template.texture,
    template: 1,
    edited: true,
  };
  p.settings = { language: 'de', theme: 'dark', sidebarWidth: 320 };
  p.lastRoute = '#/de/t/staff/read~staff-lines';
  p.completed = ['staff', 'clefs'];
  p.answers[RULES[0]] = { asked: 8, missed: 2, tag: null };
  p.lab = {
    ...p.lab,
    frequency: 432,
    reference: 442,
    tuning: 'just',
    wave: 'triangle',
    volume: 11,
    topic: 'staff',
    tab: 'notes',
    notes: {
      note: { letter: 2, accidental: -1, octave: 3 },
      group: 'pitch',
      tempo: 120,
    },
    experiment: { kind: 'scales', selected: 2, root: 'C' },
    chords: {
      history: { present: draft, past: [draft], future: [] },
      selectedCard: 1,
      sevenths: true,
      tone: 'sine',
      volume: 23,
      repeats: 2,
    },
  };
  return p;
}
test('All supported chord history slots fit in a portable backup', () => {
  const p = populated();
  const draft = p.lab.chords.history.present;
  draft.chords = Array.from({ length: 16 }, () => ({
    degree: 6,
    quality: 'halfDim7',
    inversion: 3,
    octave: 6,
    beats: 8,
  }));
  p.lab.chords.history.past = Array(60).fill(draft);
  p.lab.chords.history.future = Array(60).fill(draft);
  p.lab.notes = {
    ...p.lab.notes,
    clef: 'tenor',
    ledgerLines: 6,
    selectedExample: 'pulse',
  };
  const backup = serializeProfile(p);
  expect(new TextEncoder().encode(backup).length).toBeLessThan(
    MAX_BACKUP_BYTES,
  );
  expect(parseBackup(backup)).toEqual(p);
  for (const field of [
    { clef: 'unknown' },
    { ledgerLines: 7 },
    { selectedExample: 'unknown' },
  ]) {
    expect(() =>
      parseBackup(
        JSON.stringify({
          ...p,
          lab: { ...p.lab, notes: { ...p.lab.notes, ...field } },
        }),
      ),
    ).toThrow();
  }
});
test('A portable backup round-trips musical settings, chord edits, route and honest counts', () => {
  expect(parseBackup(serializeProfile(populated()))).toEqual(populated());
  const data = memory();
  const store = makeStore(data);
  expect(store.getServerSnapshot().ready).toBe(false);
  expect(store.replace(populated())).toBe(true);
  expect(makeStore(data).getSnapshot().profile).toEqual(populated());
  expect(store.getSnapshot().revision).toBe(1);
});
test('Version-0 preferences and the existing session migrate once without deleting legacy keys', () => {
  const data = memory({
    [LANGUAGE_STORAGE_KEY]: 'ru',
    [THEME_STORAGE_KEY]: 'dark',
    [SIDEBAR_WIDTH_STORAGE_KEY]: '999',
  });
  const session = memory({
    [DRILL_STORAGE_KEY]: JSON.stringify({
      [RULES[0]]: { asked: 3, missed: 1, tag: 'correct' },
      removed: { asked: 12, missed: 0 },
    }),
  });
  const store = makeStore(data, session);
  const migrated = store.getSnapshot().profile;
  expect(migrated.settings).toEqual({
    language: 'ru',
    theme: 'dark',
    sidebarWidth: 420,
  });
  expect(migrated.answers).toEqual({
    [RULES[0]]: { asked: 3, missed: 1, tag: 'correct' },
  });
  store.update((p) => p);
  session.setItem(DRILL_STORAGE_KEY, '{}');
  expect(makeStore(data, session).getSnapshot().profile.answers).toEqual(
    migrated.answers,
  );
  expect(data.getItem(LANGUAGE_STORAGE_KEY)).toBe('ru');
  expect(migrateLegacy(memory(), null)).toEqual(emptyProfile());
});
for (const [label, mutate] of [
  [
    'future version',
    (p) => {
      p.version = 3;
    },
  ],
  [
    'wrong product',
    (p) => {
      p.format = 'other';
    },
  ],
  [
    'unknown field',
    (p) => {
      p.playing = true;
    },
  ],
  [
    'unknown topic',
    (p) => {
      p.completed = ['removed'];
    },
  ],
  [
    'duplicate markers',
    (p) => {
      p.completed = ['staff', 'staff'];
    },
  ],
  [
    'external address',
    (p) => {
      p.lastRoute = 'https://example.org/';
    },
  ],
  [
    'unknown chapter',
    (p) => {
      p.lastRoute = '#/en/c/gone/read';
    },
  ],
  [
    'long address',
    (p) => {
      p.lastRoute = '#/en/t/staff/read~' + 'a'.repeat(300);
    },
  ],
  [
    'unknown rule',
    (p) => {
      p.answers.gone = { asked: 1, missed: 0, tag: null };
    },
  ],
  [
    'negative count',
    (p) => {
      p.answers[RULES[0]].asked = -1;
    },
  ],
  [
    'fractional count',
    (p) => {
      p.answers[RULES[0]].asked = 1.2;
    },
  ],
  [
    'impossible count',
    (p) => {
      p.answers[RULES[0]].missed = 9;
    },
  ],
  [
    'unsafe counter',
    (p) => {
      p.answers[RULES[0]].asked = Number.MAX_SAFE_INTEGER + 1;
    },
  ],
  [
    'unknown error tag',
    (p) => {
      p.answers[RULES[0]].tag = 'invented';
    },
  ],
  [
    'ultrasonic tone',
    (p) => {
      p.lab.frequency = 20001;
    },
  ],
  [
    'inaudible reference',
    (p) => {
      p.lab.reference = 0;
    },
  ],
  [
    'unbounded gain',
    (p) => {
      p.lab.volume = 101;
    },
  ],
  [
    'unknown waveform',
    (p) => {
      p.lab.wave = 'noise';
    },
  ],
  [
    'invalid note',
    (p) => {
      p.lab.notes.note.letter = 7;
    },
  ],
  [
    'invalid tempo',
    (p) => {
      p.lab.notes.tempo = 61;
    },
  ],
  [
    'unknown pattern',
    (p) => {
      p.lab.experiment.selected = 100;
    },
  ],
  [
    'invalid inversion',
    (p) => {
      p.lab.chords.history.present.chords = [
        { degree: 0, quality: 'major', inversion: 3, beats: 4 },
      ];
    },
  ],
  [
    'unbounded undo',
    (p) => {
      p.lab.chords.history.past = Array(61).fill(p.lab.chords.history.present);
    },
  ],
  [
    'empty progression',
    (p) => {
      p.lab.chords.history.present.chords = [];
    },
  ],
  [
    'unbounded repeats',
    (p) => {
      p.lab.chords.repeats = 5;
    },
  ],
])
  test(`Import rejects ${String(label)} before touching existing data`, () => {
    const p = structuredClone(populated());
    mutate(p);
    expect(() => parseBackup(JSON.stringify(p))).toThrow();
  });
test('Malformed, null, array, oversized and prototype-looking backups are rejected', () => {
  for (const value of [
    '{',
    'null',
    '[]',
    '{"__proto__":{}}',
    ' '.repeat(MAX_BACKUP_BYTES + 1),
    'ё'.repeat(MAX_BACKUP_BYTES / 2 + 1),
  ])
    expect(() => parseBackup(value)).toThrow();
  const p = populated();
  p.lastRoute = 'a'.repeat(MAX_BACKUP_BYTES);
  expect(() => serializeProfile(p)).toThrow();
});
test('Canonical addresses round-trip; explicit links win and locale paths remain authoritative', () => {
  const p = populated();
  expect(initialRoute('', 'ru', p)).toMatchObject({
    lang: 'ru',
    topic: 'staff',
    lens: 'read',
    anchor: 'staff-lines',
  });
  expect(initialRoute('#/en/t/clefs/play', 'ru', p)).toMatchObject({
    lang: 'en',
    topic: 'clefs',
    lens: 'play',
  });
  expect(initialRoute('', 'en', emptyProfile())).toMatchObject({
    topic: null,
    lens: 'play',
  });
  for (const route of [
    '#/en/play',
    '#/de/s/foundations/read',
    '#/ru/c/rhythm/drill',
  ])
    expect(isLearningAddress(route)).toBe(true);
  for (const route of ['#theory', 'javascript:alert(1)', '#/en/t/gone/read'])
    expect(isLearningAddress(route)).toBe(false);
});
test('Corrupt/newer stored data survives autosave and can be explicitly replaced', () => {
  const data = memory({ [PROFILE_KEY]: '{"version":99}' });
  const store = makeStore(data);
  expect(store.getSnapshot().problem).toBe('invalid');
  expect(store.update((p) => ({ ...p, completed: ['staff'] }))).toBe(false);
  expect(data.getItem(PROFILE_KEY)).toBe('{"version":99}');
  expect(store.getSnapshot().profile.completed).toEqual(['staff']);
  expect(store.replace(emptyProfile())).toBe(true);
  expect(store.getSnapshot().problem).toBe(null);
});
test('Unavailable, throwing and full storage never blocks learning or pretends an import succeeded', () => {
  for (const access of [
    () => null,
    () => {
      throw new Error('denied');
    },
    () => ({
      getItem() {
        throw new Error('denied');
      },
      setItem() {
        throw new Error('denied');
      },
    }),
  ]) {
    const store = createProfileStore(access, () => null);
    expect(store.getSnapshot().problem).toBe('unavailable');
    expect(store.update((p) => ({ ...p, completed: ['staff'] }))).toBe(false);
    expect(store.getSnapshot().profile.completed).toEqual(['staff']);
    expect(store.replace(emptyProfile())).toBe(false);
    expect(store.getSnapshot().profile.completed).toEqual(['staff']);
    expect(store.getSnapshot().revision).toBe(0);
  }
  const data = memory();
  const store = makeStore(data);
  store.update((p) => p);
  data.setItem = () => {
    throw new Error('quota');
  };
  expect(store.replace(populated())).toBe(false);
  expect(store.getSnapshot().profile).toEqual(emptyProfile());
});
test('A changed tab is never silently overwritten; explicit replacement resolves the conflict', () => {
  const data = memory();
  const first = makeStore(data);
  const second = makeStore(data);
  first.getSnapshot();
  second.getSnapshot();
  first.replace(populated());
  expect(second.update((p) => ({ ...p, completed: ['clefs'] }))).toBe(false);
  expect(second.getSnapshot().problem).toBe('conflict');
  expect(parseBackup(data.getItem(PROFILE_KEY))).toEqual(populated());
  second.replace(emptyProfile());
  expect(second.getSnapshot().problem).toBe(null);
});
test('Unchanged settings avoid redundant writes and notify only on actual profile changes', () => {
  const data = memory();
  const spy = vi.spyOn(data, 'setItem');
  const store = makeStore(data);
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  store.update((p) => p);
  store.update((p) => p);
  expect(spy).toHaveBeenCalledTimes(1);
  expect(listener).toHaveBeenCalledTimes(1);
  unsubscribe();
  // Versioned schema fields can have a different key order from caller-created
  // defaults. A reset must not make unchanged autosaves write forever.
  store.replace(emptyProfile());
  store.update((p) => p);
  expect(spy).toHaveBeenCalledTimes(2);
});
test('Recorded answers retain actual mistakes and saturate without rounding large counters', () => {
  vi.stubGlobal('localStorage', memory());
  vi.stubGlobal('sessionStorage', memory());
  profileStore.replace(emptyProfile());
  saveAnswers(RULES[0], [
    { correct: false, tag: 'wrong-written-note' },
    { correct: true, tag: 'correct' },
  ]);
  expect(profileStore.getSnapshot().profile.answers[RULES[0]]).toEqual({
    asked: 2,
    missed: 1,
    tag: 'wrong-written-note',
  });
  profileStore.update((p) => ({
    ...p,
    answers: {
      [RULES[0]]: { asked: Number.MAX_SAFE_INTEGER, missed: 0, tag: null },
    },
  }));
  saveAnswers(RULES[0], [{ correct: false, tag: 'wrong-written-note' }]);
  expect(profileStore.getSnapshot().profile.answers[RULES[0]].asked).toBe(
    Number.MAX_SAFE_INTEGER,
  );
  vi.unstubAllGlobals();
});
