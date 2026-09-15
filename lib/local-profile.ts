import { z } from 'zod';
import {
  createClientStore,
  hashOf,
  langFromStorage,
  themeFromStorage,
  sidebarWidthFromStorage,
  ledgerFromStorage,
  recordAnswer,
  routeFromHash,
  LANGUAGES,
  THEMES,
  SIDEBAR_WIDTH,
  type LedgerRow,
  type Ledger,
  type Route,
} from './client-store';
import { TOPIC_IDS } from './topics';
import { courseAddresses } from './course';
import { RULES, type Rule, type Verdict } from './exercises';
import { exerciseExplanations, patterns } from './learning';
import {
  initialNotesLabState,
  notationGroups,
  notationExamples,
} from './notation-experiments';
import { experimentTonics } from './notation';
import { chordQualities, progressionTemplates, textures } from './chords';

export const PROFILE_KEY = 'oml-profile';
export const MAX_BACKUP_BYTES = 1_000_000;
const integer = (min: number, max: number) =>
  z.number().int().min(min).max(max);
const topic = z.enum(TOPIC_IDS);
const chord = z
  .strictObject({
    degree: integer(0, 6),
    quality: z.enum(
      Object.keys(chordQualities) as [keyof typeof chordQualities],
    ),
    inversion: integer(0, 3),
    beats: integer(1, 8),
    octave: integer(1, 6).optional(),
  })
  .refine(
    (value) => value.inversion < chordQualities[value.quality].steps.length,
  );
const draft = z.strictObject({
  key: z.strictObject({
    tonic: integer(0, 11),
    mode: z.enum(['major', 'minor']),
  }),
  chords: z.array(chord).min(1).max(16),
  tempo: z.number().min(40).max(200),
  texture: z.enum(textures),
  template: integer(0, progressionTemplates.length - 1),
  edited: z.boolean(),
});
const experiment = z
  .strictObject({
    kind: z.enum(['intervals', 'scales', 'chords']),
    selected: integer(0, 100),
    root: z.enum(experimentTonics),
  })
  .refine((value) => value.selected < patterns[value.kind].length);
const row = z
  .strictObject({
    asked: integer(0, Number.MAX_SAFE_INTEGER),
    missed: integer(0, Number.MAX_SAFE_INTEGER),
    tag: z
      .enum(
        Object.keys(exerciseExplanations) as [
          keyof typeof exerciseExplanations,
        ],
      )
      .nullable(),
  })
  .refine((value) => value.missed <= value.asked);

/** Only canonical, local lesson addresses are accepted, never URLs or scripts. */
export function isLearningAddress(value: string): boolean {
  return (
    value.length <= 256 &&
    value ===
      hashOf(
        routeFromHash(value, {
          lang: 'en',
          topics: TOPIC_IDS,
          ...courseAddresses,
        }),
      )
  );
}
export const profileSchema = z.strictObject({
  format: z.literal('one-music-lab'),
  version: z.literal(1),
  settings: z.strictObject({
    language: z.enum(LANGUAGES),
    theme: z.enum(THEMES),
    sidebarWidth: integer(SIDEBAR_WIDTH.min, SIDEBAR_WIDTH.max),
  }),
  lastRoute: z.string().refine(isLearningAddress).nullable(),
  completed: z
    .array(topic)
    .max(TOPIC_IDS.length)
    .refine((ids) => new Set(ids).size === ids.length),
  answers: z.partialRecord(z.enum(RULES), row),
  lab: z.strictObject({
    topic: topic.nullable(),
    frequency: z.number().min(20).max(20000),
    reference: z.number().min(20).max(2000),
    tuning: z.enum(['equal', 'just', 'pythagorean']),
    wave: z.enum(['sine', 'triangle', 'square', 'sawtooth']),
    volume: z.number().min(0).max(100),
    octave: integer(0, 8),
    tab: z.enum(['tone', 'notes']),
    notes: z.strictObject({
      note: z.strictObject({
        letter: integer(0, 6),
        accidental: integer(-2, 2),
        octave: integer(0, 8),
      }),
      group: z.enum(notationGroups.map((group) => group.id)),
      tempo: z.union([z.literal(60), z.literal(120)]),
      clef: z.enum(['treble', 'bass', 'alto', 'tenor']).optional(),
      ledgerLines: integer(0, 6).optional(),
      selectedExample: z
        .enum(Object.keys(notationExamples) as [keyof typeof notationExamples])
        .optional(),
    }),
    experiment: experiment.optional(),
    chords: z
      .strictObject({
        history: z.strictObject({
          past: z.array(draft).max(60),
          present: draft,
          future: z.array(draft).max(60),
        }),
        selectedCard: integer(0, 15),
        sevenths: z.boolean(),
        tone: z.enum(['sine', 'triangle']),
        volume: z.number().min(0).max(100),
        repeats: integer(1, 4),
      })
      .optional(),
  }),
});
export type LocalProfile = z.infer<typeof profileSchema>;
export function emptyProfile(): LocalProfile {
  return {
    format: 'one-music-lab',
    version: 1,
    settings: {
      language: 'en',
      theme: 'system',
      sidebarWidth: SIDEBAR_WIDTH.preferred,
    },
    lastRoute: null,
    completed: [],
    answers: {},
    lab: {
      topic: null,
      frequency: 440,
      reference: 440,
      tuning: 'equal',
      wave: 'sine',
      volume: 18,
      octave: 4,
      tab: 'tone',
      notes: structuredClone(initialNotesLabState),
    },
  };
}

/** The pre-538 keys are version 0. They remain untouched until an explicit reset. */
export function migrateLegacy(
  storage: Pick<Storage, 'getItem'>,
  session: Pick<Storage, 'getItem'> | null,
): LocalProfile {
  const profile = emptyProfile();
  profile.settings = {
    language: langFromStorage(storage),
    theme: themeFromStorage(storage),
    sidebarWidth: sidebarWidthFromStorage(storage),
  };
  profile.answers = Object.fromEntries(
    ledgerFromStorage(session, {
      rules: RULES,
      tags: Object.keys(exerciseExplanations),
    }),
  );
  // Old counters accepted unsafe integers. Refuse those instead of exporting a rounded history.
  return profileSchema.parse(profile);
}

export function parseBackup(text: string): LocalProfile {
  if (new TextEncoder().encode(text).length > MAX_BACKUP_BYTES)
    throw new Error('backup-size');
  // Version 1 is the first portable format. Never guess how to downgrade a future format.
  return profileSchema.parse(JSON.parse(text));
}
export function serializeProfile(profile: LocalProfile): string {
  // All arrays, strings and counts are bounded by the schema; canonical output
  // fits below the import byte limit even with both full chord history stacks.
  return JSON.stringify(profileSchema.parse(profile));
}
type StorageAccess = Pick<Storage, 'getItem' | 'setItem'>;
export type ProfileProblem = 'unavailable' | 'invalid' | 'conflict' | null;
type ProfileState = {
  profile: LocalProfile;
  ready: boolean;
  revision: number;
  problem: ProfileProblem;
};

/** Atomic single-key writes; failed autosaves keep usable, exportable in-memory work.
 * A different tab's write is detected before saving and is never silently replaced.
 */
export function createProfileStore(
  access: () => StorageAccess | null,
  session: () => Pick<Storage, 'getItem'> | null,
) {
  let observed: string | null = null;
  let blocked = false;
  const initial: ProfileState = {
    profile: emptyProfile(),
    ready: false,
    revision: 0,
    problem: null,
  };
  const store = createClientStore<ProfileState>(() => {
    let profile = emptyProfile();
    let problem: ProfileProblem = null;
    try {
      const storage = access();
      if (!storage) throw new Error('storage');
      observed = storage.getItem(PROFILE_KEY);
      try {
        profile =
          observed === null
            ? migrateLegacy(storage, session())
            : parseBackup(observed);
      } catch {
        blocked = true;
        problem = 'invalid';
      }
    } catch {
      problem = 'unavailable';
    }
    return { ...initial, ready: true, profile, problem };
  }, initial);
  function write(profile: LocalProfile, replace: boolean): boolean {
    const current = store.getSnapshot();
    const text = serializeProfile(profile);
    if (
      !replace &&
      text === JSON.stringify(current.profile) &&
      current.problem === null &&
      observed !== null
    )
      return true;
    let problem: ProfileProblem = null;
    try {
      const storage = access();
      if (!storage) throw new Error('storage');
      if (!replace && blocked) problem = 'invalid';
      else if (!replace && storage.getItem(PROFILE_KEY) !== observed)
        problem = 'conflict';
      else {
        storage.setItem(PROFILE_KEY, text);
        observed = text;
        blocked = false;
      }
    } catch {
      problem = 'unavailable';
    }
    // A confirmed import/reset must succeed durably before changing the live application.
    store.set({
      ...current,
      profile: replace && problem ? current.profile : profile,
      revision: current.revision + (replace && !problem ? 1 : 0),
      problem,
    });
    return problem === null;
  }
  return {
    ...store,
    update: (change: (profile: LocalProfile) => LocalProfile) =>
      write(change(store.getSnapshot().profile), false),
    replace: (profile: LocalProfile) => write(profile, true),
  };
}
export function browserStorage(
  kind: 'localStorage' | 'sessionStorage',
): Storage | null {
  try {
    return globalThis[kind] ?? null;
  } catch {
    return null;
  }
}
export const profileStore = createProfileStore(
  () => browserStorage('localStorage'),
  () => browserStorage('sessionStorage'),
);
export function saveAnswers(
  rule: Rule,
  results: readonly Pick<Verdict, 'correct' | 'tag'>[],
) {
  profileStore.update((profile) => {
    const ledger = new Map(
      Object.entries(profile.answers) as [Rule, LedgerRow][],
    );
    const next = results.reduce<Ledger>((current, result) => {
      // Saturation preserves integer accuracy without blocking a question's feedback.
      if (current.get(rule)?.asked === Number.MAX_SAFE_INTEGER) return current;
      return recordAnswer(current, rule, result);
    }, ledger);
    return { ...profile, answers: Object.fromEntries(next) };
  });
}
export function initialRoute(
  hash: string,
  lang: Route['lang'],
  profile: LocalProfile,
): Route {
  const route = routeFromHash(hash || profile.lastRoute || '', {
    lang,
    topics: TOPIC_IDS,
    ...courseAddresses,
  });
  return hash ? route : { ...route, lang };
}
