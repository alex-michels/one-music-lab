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
   * The paragraph to scroll to, written after a `~` rather than a second `#`.
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
