import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  DEFAULT_LENS,
  DEFAULT_THEME,
  LANGUAGE_STORAGE_KEY,
  LENSES,
  PAGES,
  hashOf,
  pageForRoute,
  routeForPage,
  routeFromHash,
  SIDEBAR_WIDTH,
  SIDEBAR_WIDTH_STORAGE_KEY,
  THEMES,
  THEME_STORAGE_KEY,
  clampSidebarWidth,
  createClientStore,
  langFromStorage,
  localStorageOrNull,
  pageFromHash,
  resolveTheme,
  sidebarWidthFromStorage,
  themeFromStorage,
} from '../lib/client-store.ts';

test('The page comes from the URL hash and unknown hashes open the lab', () => {
  for (const page of PAGES) {
    assert.equal(pageFromHash('#' + page), page);
    assert.equal(pageFromHash(page), page);
  }
  for (const hash of ['', '#', '#settings', '#Lab', '#lab/extra', 'theory ']) {
    assert.equal(pageFromHash(hash), 'lab', JSON.stringify(hash));
  }
});

test('The saved language is honoured only when it is a supported value', () => {
  const storage = (value) => ({
    getItem(key) {
      assert.equal(key, LANGUAGE_STORAGE_KEY);
      return value;
    },
  });
  assert.equal(langFromStorage(storage('ru')), 'ru');
  assert.equal(langFromStorage(storage('en')), 'en');
  assert.equal(langFromStorage(storage(null)), 'en');
  assert.equal(langFromStorage(storage('')), 'en');
  assert.equal(langFromStorage(storage('de')), 'de');
  assert.equal(langFromStorage(storage('fr')), 'en');
  assert.equal(langFromStorage(storage('RU')), 'en');
  assert.equal(langFromStorage(null), 'en');
  assert.equal(langFromStorage(undefined), 'en');
  assert.equal(
    langFromStorage({
      getItem() {
        throw new Error('SecurityError');
      },
    }),
    'en',
  );
});

test('Storage access that is absent or throws degrades to null', () => {
  const descriptor = Object.getOwnPropertyDescriptor(
    globalThis,
    'localStorage',
  );
  try {
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('SecurityError');
      },
    });
    assert.equal(localStorageOrNull(), null);
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: undefined,
    });
    assert.equal(localStorageOrNull(), null, 'absent storage is null');
    assert.equal(langFromStorage(localStorageOrNull()), 'en');
    const fake = { getItem: () => 'ru' };
    Object.defineProperty(globalThis, 'localStorage', {
      configurable: true,
      value: fake,
    });
    assert.equal(localStorageOrNull(), fake);
    assert.equal(langFromStorage(localStorageOrNull()), 'ru');
  } finally {
    if (descriptor)
      Object.defineProperty(globalThis, 'localStorage', descriptor);
    else delete globalThis.localStorage;
  }
});

test('A client store reads the browser once and changes only through set', () => {
  let reads = 0;
  const store = createClientStore(() => {
    reads += 1;
    return 'theory';
  }, 'lab');
  assert.equal(store.getServerSnapshot(), 'lab');
  assert.equal(reads, 0, 'the server snapshot never touches the browser');
  assert.equal(store.getSnapshot(), 'theory');
  assert.equal(store.getSnapshot(), 'theory');
  assert.equal(reads, 1, 'the browser is read exactly once');
  assert.equal(
    store.getServerSnapshot(),
    'lab',
    'the server value stays fixed',
  );

  const seen = [];
  const unsubscribe = store.subscribe(() => seen.push(store.getSnapshot()));
  store.set('practice');
  assert.deepEqual(seen, ['practice']);
  store.set('practice');
  assert.deepEqual(
    seen,
    ['practice'],
    'setting the same value does not notify',
  );
  unsubscribe();
  store.set('encyclopedia');
  assert.deepEqual(seen, ['practice'], 'removed listeners are not called');
  assert.equal(store.getSnapshot(), 'encyclopedia');
  assert.equal(reads, 1);
});

test('Setting a value before the first snapshot skips the browser read', () => {
  let reads = 0;
  const store = createClientStore(() => {
    reads += 1;
    return 'en';
  }, 'en');
  const seen = [];
  store.subscribe(() => seen.push(store.getSnapshot()));
  store.set('ru');
  assert.deepEqual(seen, ['ru']);
  assert.equal(store.getSnapshot(), 'ru');
  assert.equal(reads, 0);
});

test('Every subscriber is notified and unsubscribing one leaves the others active', () => {
  const store = createClientStore(() => 1, 0);
  const calls = [];
  const unsubscribeA = store.subscribe(() => calls.push('a'));
  const unsubscribeB = store.subscribe(() => calls.push('b'));
  store.set(2);
  assert.deepEqual(calls, ['a', 'b']);
  unsubscribeA();
  store.set(3);
  assert.deepEqual(calls, ['a', 'b', 'b']);
  unsubscribeA();
  store.set(4);
  assert.deepEqual(calls, ['a', 'b', 'b', 'b'], 'a second removal is harmless');
  unsubscribeB();
  store.set(5);
  assert.deepEqual(calls, ['a', 'b', 'b', 'b']);
  assert.equal(store.getSnapshot(), 5);
});

test('The saved sidebar width is used only when it is a usable number', () => {
  const storage = (value) => ({
    getItem(key) {
      assert.equal(key, SIDEBAR_WIDTH_STORAGE_KEY);
      return value;
    },
  });
  assert.equal(sidebarWidthFromStorage(storage('300')), 300);
  assert.equal(sidebarWidthFromStorage(storage(' 300 ')), 300);
  assert.equal(sidebarWidthFromStorage(storage('300.6')), 301);
  for (const missing of [null, undefined, '', '   ']) {
    assert.equal(
      sidebarWidthFromStorage(storage(missing)),
      SIDEBAR_WIDTH.preferred,
      JSON.stringify(missing),
    );
  }
  for (const nonsense of ['wide', 'NaN', '{}', 'Infinity']) {
    assert.equal(
      sidebarWidthFromStorage(storage(nonsense)),
      SIDEBAR_WIDTH.preferred,
      nonsense,
    );
  }
  // A width saved by an older build, or edited by hand, is brought into range
  // rather than collapsing or hiding the panel.
  assert.equal(sidebarWidthFromStorage(storage('40')), SIDEBAR_WIDTH.min);
  assert.equal(sidebarWidthFromStorage(storage('9999')), SIDEBAR_WIDTH.max);
  assert.equal(sidebarWidthFromStorage(storage('-1')), SIDEBAR_WIDTH.min);
  assert.equal(sidebarWidthFromStorage(null), SIDEBAR_WIDTH.preferred);
  assert.equal(
    sidebarWidthFromStorage({
      getItem() {
        throw new Error('SecurityError');
      },
    }),
    SIDEBAR_WIDTH.preferred,
  );
});

const TOPICS = ['staff', 'chords', 'dots-ties'];
const read = (hash, lang = 'en') =>
  routeFromHash(hash, { lang, topics: TOPICS });

test('The address carries the language, the subject and the view of it', () => {
  const cases = [
    [
      '#/de/t/staff/play',
      { lang: 'de', lens: 'play', topic: 'staff', anchor: null },
    ],
    ['#/en/define', { lang: 'en', lens: 'define', topic: null, anchor: null }],
    // The paragraph a ledger row points at, written after a `~` and not a
    // second `#`: a URL has one fragment, and two would scroll nowhere.
    [
      '#/en/t/dots-ties/read~dot-adds-half',
      { lang: 'en', lens: 'read', topic: 'dots-ties', anchor: 'dot-adds-half' },
    ],
  ];
  for (const [hash, route] of cases) {
    assert.deepEqual(read(hash), route, hash);
    assert.equal(hashOf(route), hash, 'writing an address undoes reading it');
  }
  // A topic named without a lens opens the passage: read is a topic's default.
  assert.deepEqual(read('#/ru/t/staff'), {
    lang: 'ru',
    lens: 'read',
    topic: 'staff',
    anchor: null,
  });
});

test('An address nobody minted still lands on a page with content', () => {
  // A stale link to a topic that was never written is not an error page.
  assert.deepEqual(read('#/en/t/ornaments/drill'), {
    lang: 'en',
    lens: 'read',
    topic: null,
    anchor: null,
  });
  assert.equal(read('#/en/sideways').lens, DEFAULT_LENS);
  assert.equal(
    read('#/t/staff/play', 'ru').lang,
    'ru',
    'the reader keeps theirs',
  );
  assert.equal(read('#/t/staff/play').topic, 'staff');
  for (const hash of ['', '#', '#/'])
    assert.deepEqual(
      read(hash, 'de'),
      { lang: 'de', lens: DEFAULT_LENS, topic: null, anchor: null },
      JSON.stringify(hash),
    );
  assert.equal(
    read('#/en/read~dot-adds-half').anchor,
    null,
    'an anchor with no subject anchors nothing',
  );
  // An address that announces a subject and then does not name one.
  for (const hash of ['#/en/t', '#/en/t/'])
    assert.deepEqual(
      read(hash),
      { lang: 'en', lens: 'read', topic: null, anchor: null },
      hash,
    );
});

test('Every address the site minted before this grammar still works', () => {
  for (const [legacy, lens, topic] of [
    ['#lab', 'play', null],
    ['#theory', 'read', null],
    ['#practice', 'drill', null],
    ['#encyclopedia', 'define', null],
    ['#chords', 'play', 'chords'],
  ]) {
    const route = read(legacy, 'de');
    assert.equal(route.lens, lens, legacy);
    assert.equal(route.topic, topic, legacy);
    assert.equal(route.lang, 'de', 'an old link cannot name a language');
  }
});

test('Each of the five pages is a lens, and every lens renders one of them', () => {
  for (const page of PAGES) {
    const route = routeForPage(page, 'en');
    assert.equal(pageForRoute(route), page, page);
    assert.ok(LENSES.includes(route.lens), page);
  }
  // Two pages share the play lens; the subject is what tells them apart.
  assert.equal(pageForRoute(routeForPage('lab', 'en')), 'lab');
  assert.equal(pageForRoute(routeForPage('chords', 'en')), 'chords');
});

test('The saved theme is honoured only when it is a supported value', () => {
  const storage = (value) => ({
    getItem(key) {
      assert.equal(key, THEME_STORAGE_KEY);
      return value;
    },
  });
  for (const theme of THEMES)
    assert.equal(themeFromStorage(storage(theme)), theme);
  for (const bad of [null, undefined, '', 'Dark', 'sepia', 'auto', ' light'])
    assert.equal(
      themeFromStorage(storage(bad)),
      DEFAULT_THEME,
      JSON.stringify(bad),
    );
  assert.equal(themeFromStorage(null), DEFAULT_THEME);
  assert.equal(themeFromStorage(undefined), DEFAULT_THEME);
  assert.equal(
    themeFromStorage({
      getItem() {
        throw new Error('SecurityError');
      },
    }),
    DEFAULT_THEME,
  );
});

test('Only `system` asks the operating system what it means', () => {
  assert.equal(resolveTheme('system', true), 'dark');
  assert.equal(resolveTheme('system', false), 'light');
  // A reader who has chosen is not overruled by the machine they read on.
  assert.equal(resolveTheme('light', true), 'light');
  assert.equal(resolveTheme('dark', false), 'dark');
  // Whatever the default is, it resolves to something the stylesheet defines.
  assert.ok(['light', 'dark'].includes(resolveTheme(DEFAULT_THEME, false)));
  assert.ok(['light', 'dark'].includes(resolveTheme(DEFAULT_THEME, true)));
});

test('The sidebar width is clamped to a range that keeps the panel usable', () => {
  assert.ok(SIDEBAR_WIDTH.min < SIDEBAR_WIDTH.preferred);
  assert.ok(SIDEBAR_WIDTH.preferred < SIDEBAR_WIDTH.max);
  assert.equal(clampSidebarWidth(SIDEBAR_WIDTH.min - 1), SIDEBAR_WIDTH.min);
  assert.equal(clampSidebarWidth(SIDEBAR_WIDTH.max + 1), SIDEBAR_WIDTH.max);
  assert.equal(clampSidebarWidth(SIDEBAR_WIDTH.min), SIDEBAR_WIDTH.min);
  assert.equal(clampSidebarWidth(SIDEBAR_WIDTH.max), SIDEBAR_WIDTH.max);
  assert.equal(clampSidebarWidth(250.4), 250);
  assert.equal(clampSidebarWidth(250.5), 251);
  for (const bad of [NaN, Infinity, -Infinity])
    assert.equal(clampSidebarWidth(bad), SIDEBAR_WIDTH.preferred, String(bad));
});
