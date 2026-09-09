import test from 'node:test';
import assert from 'node:assert/strict';

// Exercise the real HTTP response, including framework metadata serialization.
// A caller supplies the running dev server or built Worker's local URL.
assert.ok(
  process.env.OML_TEST_BASE_URL,
  'Set OML_TEST_BASE_URL to the running local site URL.',
);
const target = new URL('/', process.env.OML_TEST_BASE_URL);
assert.ok(
  ['http:', 'https:'].includes(target.protocol),
  'The target must use HTTP or HTTPS.',
);
assert.ok(
  ['localhost', '127.0.0.1', '[::1]'].includes(target.hostname),
  'Use a local server, not the public domain.',
);
const response = await fetch(target, {
  redirect: 'error',
  signal: AbortSignal.timeout(60_000),
});
assert.equal(response.status, 200, 'The home page must render successfully.');
assert.match(response.headers.get('content-type') ?? '', /text\/html/);
const html = await response.text();

await test('The document title identifies One Music Lab', () => {
  assert.match(html, /<title>OML — One Music Lab<\/title>/);
  assert.doesNotMatch(html, /<title>[^<]*Open Music Lab/);
});

await test('The canonical URL uses the chosen public domain rather than the local host', () => {
  const links = html.match(/<link\b[^>]*>/g) ?? [];
  const canonicals = links.filter((link) => /\brel="canonical"/.test(link));
  assert.equal(
    canonicals.length,
    1,
    'Exactly one canonical link must be emitted.',
  );
  const href = canonicals[0].match(/\bhref="([^"]+)"/)?.[1];
  assert.ok(href, 'The canonical link must have an absolute URL.');
  assert.equal(new URL(href).href, 'https://onemusiclab.org/');
});

await test('The lab home link presents the chosen name visually and accessibly', () => {
  const anchors = html.match(/<a\b[^>]*>[\s\S]*?<\/a>/g) ?? [];
  const brand = anchors.find((anchor) => /\bclass="brand"/.test(anchor));
  assert.ok(brand, 'The brand link must be rendered in navigation.');
  assert.match(brand, /\bhref="#lab"/);
  assert.match(brand, /\baria-label="One Music Lab"/);
  assert.match(brand, /<small>ONE MUSIC LAB<\/small>/);
  assert.doesNotMatch(brand, /OPEN MUSIC LAB/);
});

await test('Each language root is served as its own document', async () => {
  // The export writes en.html, ru.html and de.html; whether the thing actually
  // serving the site hands them back at /en, /ru and /de is a separate
  // question, and the only place it can be asked is here, against the built
  // Worker. Everything else about step 10 was checked by reading files.
  for (const [lang, opening] of [
    ['en', 'Explore sound'],
    ['ru', 'Исследуйте звук'],
    ['de', 'Entdecke Klang'],
  ]) {
    const at = new URL(`/${lang}`, target);
    const page = await fetch(at, {
      redirect: 'follow',
      signal: AbortSignal.timeout(60_000),
    });
    assert.equal(page.status, 200, at.href);
    const body = await page.text();
    assert.match(body, new RegExp(`<html lang="${lang}"`), lang);
    const description = body.match(
      /<meta name="description" content="([^"]+)"/,
    )?.[1];
    assert.ok(description?.startsWith(opening), `${lang}: ${description}`);
    // Absolute, on the public domain, naming this language and no other.
    const canonical = (body.match(/<link\b[^>]*>/g) ?? []).filter((link) =>
      /\brel="canonical"/.test(link),
    );
    assert.equal(canonical.length, 1, lang);
    assert.equal(
      new URL(canonical[0].match(/\bhref="([^"]+)"/)[1]).href,
      `https://onemusiclab.org/${lang}`,
    );
  }
});

await test('The rendered page does not load fonts, scripts or styles from third parties', () => {
  const resourceTags = html.match(/<(?:link|script|iframe)\b[^>]*>/g) ?? [];
  for (const tag of resourceTags) {
    // The canonical and the hreflang alternates name the public origin on
    // purpose — they are claims about where this document lives, not
    // resources the page fetches. Everything else must come from this origin.
    if (/\brel="(?:canonical|alternate)"/.test(tag)) continue;
    const url = tag.match(/\b(?:src|href)="([^"]+)"/)?.[1];
    if (url) assert.equal(new URL(url, target).origin, target.origin, tag);
  }
  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com/);
});
