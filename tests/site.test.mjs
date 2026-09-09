import { test } from 'vitest';
import assert from 'node:assert/strict';
import {
  SITE_ORIGIN,
  alternatesFor,
  languageAlternates,
  pathFor,
} from '../lib/site.ts';
import { LANGUAGES } from '../lib/client-store.ts';

test('Every language has a path, and the set is the languages themselves', () => {
  for (const lang of LANGUAGES) assert.equal(pathFor(lang), `/${lang}`);
  // Derived from LANGUAGES rather than copied from it, so a fourth language is
  // an alternate the moment it is a value.
  assert.deepEqual(Object.keys(languageAlternates()), [...LANGUAGES]);
  assert.deepEqual(
    Object.values(languageAlternates()),
    [...LANGUAGES].map(pathFor),
  );
});

test('A language root is its own canonical and names the other two', () => {
  for (const lang of LANGUAGES) {
    const { canonical, languages } = alternatesFor(lang);
    assert.equal(canonical, `/${lang}`);
    // All three plus x-default, and x-default is `/` — the language-neutral
    // entry, which keeps the reader's saved language and so claims none.
    assert.deepEqual(Object.keys(languages).sort(), [
      ...[...LANGUAGES].sort(),
      'x-default',
    ]);
    assert.equal(languages['x-default'], '/');
    assert.equal(languages[lang], canonical);
  }
});

test('The origin is the public domain, absolute and without a trailing slash', () => {
  const url = new URL(SITE_ORIGIN);
  assert.equal(url.protocol, 'https:');
  assert.equal(url.pathname, '/');
  assert.doesNotMatch(SITE_ORIGIN, /\/$/);
  // Every alternate resolves against it to an absolute URL on that origin,
  // which is what hreflang requires and what a relative href would not be.
  for (const href of Object.values(alternatesFor('ru').languages))
    assert.equal(new URL(href, SITE_ORIGIN).origin, url.origin);
});
