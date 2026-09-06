import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  LANGUAGE_STORAGE_KEY,
  PAGES,
  createClientStore,
  langFromStorage,
  localStorageOrNull,
  pageFromHash,
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
  assert.equal(langFromStorage(storage('de')), 'en');
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
