import type { ErrorTag, Rule } from './exercises';

/**
 * Browser state that the server cannot know: the page selected through the URL
 * hash, and the language, sidebar width and theme saved in localStorage. Each
 * is read once, on the first client-side snapshot, and afterwards changes only
 * through `set`, so the application decides exactly when React re-renders. The
 * server value is used during prerendering and hydration, which keeps the
 * markup identical on both sides and avoids a state update inside an effect
 * right after mount.
 */

export const PAGES = [
  'lab',
  'chords',
  'theory',
  'practice',
  'encyclopedia',
] as const;
export type Page = (typeof PAGES)[number];

export const LANGUAGES = ['en', 'ru', 'de'] as const;
export type Lang = (typeof LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'oml-language';
export const SIDEBAR_WIDTH_STORAGE_KEY = 'oml-sidebar-width';
export const THEME_STORAGE_KEY = 'oml-theme';

/**
 * Navigation labels are translated, and a translation can be much longer than
 * the English it replaces: `Chords lab` becomes `Лаборатория аккордов`. The
 * default width fits the design, the range keeps the sidebar usable at either
 * end, and the reader can move it. Pixels, because the sidebar is measured in
 * pixels and the value is written straight into `--sidebar-width`.
 */
export const SIDEBAR_WIDTH = { min: 190, max: 420, preferred: 232 };

/** Any value the sidebar can actually take; anything unusable is the default. */
export function clampSidebarWidth(value: number): number {
  if (!Number.isFinite(value)) return SIDEBAR_WIDTH.preferred;
  return Math.min(
    SIDEBAR_WIDTH.max,
    Math.max(SIDEBAR_WIDTH.min, Math.round(value)),
  );
}

/** The saved sidebar width; missing, unreadable or nonsense values are the default. */
export function sidebarWidthFromStorage(
  storage: Pick<Storage, 'getItem'> | null | undefined,
): number {
  try {
    const saved = storage?.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
    if (saved === null || saved === undefined || saved.trim() === '')
      return SIDEBAR_WIDTH.preferred;
    return clampSidebarWidth(Number(saved));
  } catch {
    return SIDEBAR_WIDTH.preferred;
  }
}

export type ClientStore<T> = {
  /** Registers a listener and returns the function that removes it. */
  subscribe: (listener: () => void) => () => void;
  /** Reads the browser once on the first call, then returns the held value. */
  getSnapshot: () => T;
  /** The value used while prerendering and hydrating. */
  getServerSnapshot: () => T;
  /** Replaces the value and notifies listeners when it actually changed. */
  set: (value: T) => void;
};

export function createClientStore<T>(
  read: () => T,
  serverValue: T,
): ClientStore<T> {
  const listeners = new Set<() => void>();
  let initialized = false;
  let value = serverValue;
  return {
    subscribe(listener) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    getSnapshot() {
      if (!initialized) {
        value = read();
        initialized = true;
      }
      return value;
    },
    getServerSnapshot: () => serverValue,
    set(next) {
      if (initialized && Object.is(value, next)) return;
      value = next;
      initialized = true;
      for (const listener of listeners) listener();
    },
  };
}

/** Maps a location hash such as `#theory` (or `theory`) to a known page. */
export function pageFromHash(hash: string): Page {
  const name = hash.startsWith('#') ? hash.slice(1) : hash;
  return (PAGES as readonly string[]).includes(name) ? (name as Page) : 'lab';
}

export const LENSES = ['read', 'play', 'drill', 'define'] as const;
export type Lens = (typeof LENSES)[number];

/**
 * The lens the site opens on when the address names none.
 *
 * This is where the home page becomes a decision rather than an accident, and
 * for now it stays where it has always been. It becomes `read` when the read
 * index exists — a list of the topics in order is a better first screen than an
 * oscillator, but only once there is a list.
 */
export const DEFAULT_LENS: Lens = 'play';

/**
 * What the address means. `#/<lang>/t/<topic>/<lens>` — language first, topic
 * second, lens third, because the subject is what travels with the reader and
 * the lens is only how they are looking at it.
 *
 * The language is in the address at all for the first time here. Until now it
 * lived only in localStorage, so no Russian or German page could be linked,
 * bookmarked, shared or crawled.
 */
export type Route = {
  lang: Lang;
  lens: Lens;
  /** Null on the four lensless indexes: a lens with no subject. */
  topic: string | null;
  /**
   * A reading-rule anchor or encoded reference headword, after `~` rather than a second `#`.
   * A URL has one fragment, so `…/read#dot-adds-half` would leave the whole
   * string in `location.hash`, match no element and scroll nowhere.
   */
  anchor: string | null;
};

/** Five nav pages onto four lenses, until each lens has a layout of its own. */
const lensForPage: Record<Page, Lens> = {
  lab: 'play',
  chords: 'play',
  theory: 'read',
  practice: 'drill',
  encyclopedia: 'define',
};

/** Which page renders a route today. The chords lab is the play lens of one topic. */
export function pageForRoute(route: Route): Page {
  if (route.lens === 'read') return 'theory';
  if (route.lens === 'drill') return 'practice';
  if (route.lens === 'define') return 'encyclopedia';
  return route.topic === 'chords' ? 'chords' : 'lab';
}

/** The address a nav item stands for, while the nav is still five pages. */
export function routeForPage(page: Page, lang: Lang): Route {
  return {
    lang,
    lens: lensForPage[page],
    topic: page === 'chords' ? 'chords' : null,
    anchor: null,
  };
}

export function hashOf(route: Route): string {
  if (!route.topic) return `#/${route.lang}/${route.lens}`;
  const anchor = route.anchor ? `~${route.anchor}` : '';
  return `#/${route.lang}/t/${route.topic}/${route.lens}${anchor}`;
}

/**
 * Reads an address. Anything unrecognised lands on a page with content rather
 * than on a 404: the document is always underneath.
 *
 * `topics` is passed in rather than imported so this module keeps knowing
 * nothing about the curriculum, the same way `langFromStorage` is handed its
 * storage.
 */
export function routeFromHash(
  hash: string,
  context: { lang: Lang; topics: readonly string[] },
): Route {
  const text = hash.startsWith('#') ? hash.slice(1) : hash;
  if (text === '' || text === '/')
    return {
      lang: context.lang,
      lens: DEFAULT_LENS,
      topic: null,
      anchor: null,
    };
  // Everything the site minted before this grammar existed, and the brand mark.
  if (!text.startsWith('/'))
    return routeForPage(pageFromHash(text), context.lang);

  const parts = text.slice(1).split('/');
  const named = LANGUAGES.some((code) => code === parts[0]);
  const lang = named ? (parts[0] as Lang) : context.lang;
  const rest = named ? parts.slice(1) : parts;

  const topical = rest[0] === 't';
  // `#/en/t` names a subject and then does not say which one.
  const topic = topical ? (rest[1] ?? '') : null;
  const [name, anchor] = (rest[topical ? 2 : 0] ?? '').split('~');
  const lens = LENSES.find((candidate) => candidate === name) ?? null;

  // A topic nobody wrote is not an error page; it is the reader arriving at
  // the site with a stale link, so they get the document.
  if (topic !== null && !context.topics.includes(topic))
    return { lang, lens: 'read', topic: null, anchor: null };

  return {
    lang,
    // A topic named without a lens opens the passage, which is its default.
    lens: lens ?? (topic ? 'read' : DEFAULT_LENS),
    topic,
    anchor: topic && anchor ? anchor : null,
  };
}

/**
 * The language a path names, or null when it names none.
 *
 * The address is the source of truth for language and the address now has two
 * halves: `/ru/#/en/t/staff/read` is a contradiction only in theory, because
 * the hash is the more specific of the two and wins. What this reads is the
 * other case — `/de/` with no hash, which is the link a reader is actually
 * sent, and which used to open in whatever language their browser had stored.
 */
export function langFromPath(pathname: string): Lang | null {
  const first = pathname.split('/').filter(Boolean)[0] ?? '';
  return (LANGUAGES as readonly string[]).includes(first)
    ? (first as Lang)
    : null;
}

/** Reads the saved language; anything missing, unknown or unreadable is English. */
export function langFromStorage(
  storage: Pick<Storage, 'getItem'> | null | undefined,
): Lang {
  try {
    const saved = storage?.getItem(LANGUAGE_STORAGE_KEY);
    return (LANGUAGES as readonly string[]).includes(saved ?? '')
      ? (saved as Lang)
      : 'en';
  } catch {
    return 'en';
  }
}

export const THEMES = ['light', 'dark', 'system'] as const;
export type Theme = (typeof THEMES)[number];
/** What a theme resolves to once `system` has been asked what it means. */
export type ResolvedTheme = Exclude<Theme, 'system'>;

/**
 * The reader's machine decides until the reader says otherwise. This waited for
 * the colour literals in app/globals.css to become tokens: while the topbar and
 * the panels were still written as white, a dark chrome left light islands all
 * over the page and one heading at 1.10:1.
 */
export const DEFAULT_THEME: Theme = 'system';

/** The saved theme; anything missing, unknown or unreadable is the default. */
export function themeFromStorage(
  storage: Pick<Storage, 'getItem'> | null | undefined,
): Theme {
  try {
    const saved = storage?.getItem(THEME_STORAGE_KEY);
    return (THEMES as readonly string[]).includes(saved ?? '')
      ? (saved as Theme)
      : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}

/** What `system` means right now; the other two answer for themselves. */
export function resolveTheme(
  theme: Theme,
  prefersDark: boolean,
): ResolvedTheme {
  if (theme === 'system') return prefersDark ? 'dark' : 'light';
  return theme;
}

/** localStorage when the browser exposes it; null when access throws or is absent. */
export function localStorageOrNull(): Pick<Storage, 'getItem'> | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}

/**
 * The drill's memory of this session, keyed on the rule each item tests.
 *
 * `Rule` and `ErrorTag` arrive as types only, so this module still knows
 * nothing about the curriculum at run time: the import is erased and the
 * bundle carries no edge from browser state to the exercise generator. What
 * the types buy is that a fifteenth rule cannot slip into a saved ledger
 * without `tsc` naming the place it has to be handled.
 */
export const DRILL_STORAGE_KEY = 'oml-drill-session';

/**
 * One rule's standing. `tag` is the last mistake made on it, because a row
 * with no mistake has nothing to explain and the site does not print an
 * explanation that answers a question the reader did not get wrong.
 */
export type LedgerRow = {
  asked: number;
  missed: number;
  tag: ErrorTag | null;
};
export type Ledger = ReadonlyMap<Rule, LedgerRow>;

export const EMPTY_LEDGER: Ledger = new Map();

/** A count that survived the trip through storage: whole, non-negative, finite. */
function wholeCount(value: unknown): number | null {
  return typeof value === 'number' && Number.isInteger(value) && value >= 0
    ? value
    : null;
}

/**
 * Reads a saved ledger. Everything is checked rather than trusted: the key is
 * `sessionStorage`, which any script on the origin can write, and a row that
 * claims a rule nobody generates or a negative tally would print a tidy lie.
 *
 * `rules` and `tags` are passed in for the same reason `routeFromHash` is
 * handed its topics — the vocabulary belongs to the generator, not here.
 */
export function ledgerFromStorage(
  storage: Pick<Storage, 'getItem'> | null | undefined,
  vocabulary: { rules: readonly string[]; tags: readonly string[] },
): Ledger {
  let parsed: unknown;
  try {
    const saved = storage?.getItem(DRILL_STORAGE_KEY);
    if (saved === null || saved === undefined || saved === '')
      return EMPTY_LEDGER;
    parsed = JSON.parse(saved);
  } catch {
    return EMPTY_LEDGER;
  }
  if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
    return EMPTY_LEDGER;
  const ledger = new Map<Rule, LedgerRow>();
  for (const [rule, row] of Object.entries(parsed)) {
    if (!vocabulary.rules.includes(rule)) continue;
    if (row === null || typeof row !== 'object' || Array.isArray(row)) continue;
    const { asked, missed, tag } = row as Record<string, unknown>;
    const askedCount = wholeCount(asked);
    const missedCount = wholeCount(missed);
    // More misses than questions is not a ledger, it is corruption.
    if (askedCount === null || missedCount === null || missedCount > askedCount)
      continue;
    ledger.set(rule as Rule, {
      asked: askedCount,
      missed: missedCount,
      tag:
        typeof tag === 'string' && vocabulary.tags.includes(tag)
          ? (tag as ErrorTag)
          : null,
    });
  }
  return ledger;
}

/** The ledger as `sessionStorage` holds it. */
export function serializeLedger(ledger: Ledger): string {
  return JSON.stringify(Object.fromEntries(ledger));
}

/** The ledger after one answer, as a new map: the old one is never mutated. */
export function recordAnswer(
  ledger: Ledger,
  rule: Rule,
  verdict: { correct: boolean; tag: ErrorTag },
): Ledger {
  const previous = ledger.get(rule) ?? { asked: 0, missed: 0, tag: null };
  const next = new Map(ledger);
  next.set(rule, {
    asked: previous.asked + 1,
    missed: previous.missed + (verdict.correct ? 0 : 1),
    // A right answer does not erase the mistake that came before it; the row
    // keeps explaining the last thing that actually went wrong.
    tag: verdict.correct ? previous.tag : verdict.tag,
  });
  return next;
}

/**
 * The next rule to ask. Uniform over the eligible rules, except that a rule
 * missed this session is drawn twice as often — the only place the ledger
 * changes what happens, and stated in one sentence beside it.
 *
 * `roll` is a number in `[0, 1)`, so the caller owns the randomness and a test
 * can name the rule it wants.
 */
export function drawRule(
  rules: readonly Rule[],
  ledger: Ledger,
  roll: number,
): Rule {
  if (rules.length === 0) throw new RangeError('No rule to draw from');
  const weight = (rule: Rule) => ((ledger.get(rule)?.missed ?? 0) > 0 ? 2 : 1);
  const total = rules.reduce((sum, rule) => sum + weight(rule), 0);
  // A roll of exactly 1 would otherwise spend the whole total and fall off the
  // end of the loop, so it is pulled just inside the last rule's share.
  let remaining = Math.min(Math.max(roll, 0), 1 - Number.EPSILON) * total;
  let chosen = rules[0];
  for (const rule of rules) {
    chosen = rule;
    remaining -= weight(rule);
    if (remaining < 0) break;
  }
  return chosen;
}

/** sessionStorage when the browser exposes it; null when access throws or is absent. */
export function sessionStorageOrNull(): Pick<
  Storage,
  'getItem' | 'setItem'
> | null {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}
