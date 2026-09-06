/**
 * Browser state that the server cannot know: the page selected through the URL
 * hash and the language saved in localStorage. Both are read once, on the first
 * client-side snapshot, and afterwards change only through `set`, so the
 * application decides exactly when React re-renders. The server value is used
 * during prerendering and hydration, which keeps the markup identical on both
 * sides and avoids a state update inside an effect right after mount.
 */

export const PAGES = ['lab', 'theory', 'practice', 'encyclopedia'] as const;
export type Page = (typeof PAGES)[number];

export const LANGUAGES = ['en', 'ru'] as const;
export type Lang = (typeof LANGUAGES)[number];

export const LANGUAGE_STORAGE_KEY = 'oml-language';

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

/** localStorage when the browser exposes it; null when access throws or is absent. */
export function localStorageOrNull(): Pick<Storage, 'getItem'> | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
