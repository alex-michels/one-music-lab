import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise the real HTTP response, including framework metadata serialization.
// A caller supplies the running dev server or built Worker's local URL.
assert.ok(process.env.OML_TEST_BASE_URL, 'Set OML_TEST_BASE_URL to the running local site URL.');
const target = new URL('/', process.env.OML_TEST_BASE_URL);
assert.ok(['http:', 'https:'].includes(target.protocol), 'The target must use HTTP or HTTPS.');
assert.ok(['localhost', '127.0.0.1', '[::1]'].includes(target.hostname), 'Use a local server, not the public domain.');
const response = await fetch(target, { redirect: 'error', signal: AbortSignal.timeout(60_000) });
assert.equal(response.status, 200, 'The home page must render successfully.');
assert.match(response.headers.get('content-type') ?? '', /text\/html/);
const html = await response.text();

test('The document title identifies One Music Lab', () => {
  assert.match(html, /<title>OML — One Music Lab<\/title>/);
  assert.doesNotMatch(html, /<title>[^<]*Open Music Lab/);
});

test('The canonical URL uses the chosen public domain rather than the local host', () => {
  const links = html.match(/<link\b[^>]*>/g) ?? [];
  const canonicals = links.filter((link) => /\brel="canonical"/.test(link));
  assert.equal(canonicals.length, 1, 'Exactly one canonical link must be emitted.');
  const href = canonicals[0].match(/\bhref="([^"]+)"/)?.[1];
  assert.ok(href, 'The canonical link must have an absolute URL.');
  assert.equal(new URL(href).href, 'https://onemusiclab.org/');
});

test('The lab home link presents the chosen name visually and accessibly', () => {
  const anchors = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];
  const brand = anchors.find((anchor) => /\bclass="brand"/.test(anchor));
  assert.ok(brand, 'The brand link must be rendered in navigation.');
  assert.match(brand, /\bhref="#lab"/);
  assert.match(brand, /\baria-label="One Music Lab"/);
  assert.match(brand, /<small>ONE MUSIC LAB<\/small>/);
  assert.doesNotMatch(brand, /OPEN MUSIC LAB/);
});
