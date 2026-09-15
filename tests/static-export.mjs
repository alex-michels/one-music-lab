import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createServer } from 'node:http';
import { chromium } from 'playwright';

const root = resolve('dist/client');
const html = await readFile(join(root, 'index.html'), 'utf8');

await test('Static export includes the page, RSC navigation payload and not-found page', async () => {
  assert.match(html, /<title>OML — One Music Lab<\/title>/);
  for (const file of ['index.rsc', '404.html', 'favicon.svg']) {
    assert.ok((await stat(join(root, file))).size > 0, file);
  }
});

await test('Each language is a prerendered document that says which language it is', async () => {
  // Until this existed, the only record of a reader's language was
  // localStorage: every crawler, every screen reader reading the markup and
  // every translation service saw one English page.
  for (const [lang, mustContain] of [
    ['en', 'Explore sound'],
    ['ru', 'Исследуйте звук'],
    ['de', 'Entdecke Klang'],
  ]) {
    const page = await readFile(join(root, `${lang}.html`), 'utf8');
    assert.match(page, new RegExp(`<html lang="${lang}"`), lang);
    const description = page.match(
      /<meta name="description" content="([^"]+)"/,
    )?.[1];
    assert.ok(description?.startsWith(mustContain), `${lang}: ${description}`);
    // One canonical, absolute, naming this language and no other.
    const links = page.match(/<link\b[^>]*>/g) ?? [];
    const canonical = links.filter((link) => /\brel="canonical"/.test(link));
    assert.equal(canonical.length, 1, lang);
    assert.match(
      canonical[0],
      new RegExp(`href="https://[^"]+/${lang}"`),
      lang,
    );
    // And the full hreflang set, every href absolute, including x-default.
    const alternates = Object.fromEntries(
      links
        .filter((link) => /\brel="alternate"/.test(link))
        .map((link) => [
          link.match(/\bhrefLang="([^"]+)"/i)?.[1],
          link.match(/\bhref="([^"]+)"/)?.[1],
        ]),
    );
    assert.deepEqual(Object.keys(alternates).sort(), [
      'de',
      'en',
      'ru',
      'x-default',
    ]);
    for (const [code, href] of Object.entries(alternates))
      assert.match(href ?? '', /^https:\/\//, `${lang} → ${code}`);
  }
  // `/` keeps the reader's saved language, so it claims none of the three and
  // points at itself as the default.
  assert.match(html, /<html lang="en"/);
  assert.match(
    html,
    /rel="alternate"[^>]*hrefLang="x-default"[^>]*href="https/i,
  );
});

await test('All initial executable and styling resources exist in the portable directory', async () => {
  const tags = html.match(/<(?:script|link)\b[^>]*>/g) ?? [];
  let scripts = 0;
  let styles = 0;
  for (const tag of tags) {
    // The canonical and the three hreflang alternates name the public origin
    // on purpose; everything else here has to be a file in this directory.
    if (/\brel="(?:canonical|alternate)"/.test(tag)) continue;
    const value = tag.match(/\b(?:src|href)="([^"]+)"/)?.[1];
    if (!value) continue;
    assert.ok(value.startsWith('/') && !value.startsWith('//'), tag);
    const url = new URL(value, 'http://127.0.0.1');
    const path = resolve(root, `.${decodeURIComponent(url.pathname)}`);
    assert.ok(
      path.startsWith(root + (process.platform === 'win32' ? '\\' : '/')),
    );
    assert.ok((await stat(path)).isFile(), value);
    if (tag.startsWith('<script')) scripts++;
    if (/\brel="stylesheet"/.test(tag)) styles++;
  }
  assert.ok(scripts > 0, 'Interactive browser entry must be emitted');
  assert.ok(styles > 0, 'Styles must be emitted');
});

await test('Browser assets contain no font CDN fallback or source maps', async () => {
  assert.doesNotMatch(html, /fonts\.(?:googleapis|gstatic)\.com/);
  const assets = join(root, '_next');
  const entries = await readdir(assets, {
    recursive: true,
    withFileTypes: true,
  });
  for (const entry of entries) {
    assert.ok(!entry.isSymbolicLink(), entry.name);
    if (!entry.isFile()) continue;
    assert.doesNotMatch(entry.name, /\.(?:map|pem)$/);
    assert.doesNotMatch(
      entry.name,
      /\.(?:wasm|woff2?|ttf|otf)$/i,
      'The notation prototype must ship no engine or font binary',
    );
    if (!/\.(?:css|js)$/.test(entry.name)) continue;
    const contents = await readFile(join(entry.parentPath, entry.name), 'utf8');
    assert.doesNotMatch(
      contents,
      /fonts\.(?:googleapis|gstatic)\.com/,
      entry.name,
    );
    assert.doesNotMatch(contents, /sourceMappingURL=/, entry.name);
    assert.doesNotMatch(
      contents,
      /vrvToolkit_|verovio-module|createVerovioModule/,
      'Build-time Verovio leaked into the browser',
    );
  }
});

await test('Portable labs and chapter routes work with external requests blocked', async () => {
  const server = createServer(async (request, response) => {
    try {
      const pathname = decodeURIComponent(
        new URL(request.url, 'http://localhost').pathname,
      );
      const file = resolve(
        root,
        '.' + (pathname === '/' ? '/index.html' : pathname),
      );
      if (
        !file.startsWith(root + (process.platform === 'win32' ? '\\' : '/'))
      ) {
        response.writeHead(403).end();
        return;
      }
      const type = file.endsWith('.js')
        ? 'text/javascript'
        : file.endsWith('.css')
          ? 'text/css'
          : file.endsWith('.svg')
            ? 'image/svg+xml'
            : 'text/html';
      response.setHeader('Content-Type', type);
      response.end(await readFile(file));
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((done) => server.listen(0, '127.0.0.1', done));
  let browser;
  try {
    const origin = `http://127.0.0.1:${server.address().port}`;
    browser = await chromium.launch();
    const context = await browser.newContext();
    const external = [];
    await context.route('**/*', (route) => {
      if (new URL(route.request().url()).origin === origin)
        return route.continue();
      external.push(route.request().url());
      return route.abort();
    });
    const page = await context.newPage();
    await page.goto(origin);
    await page.getByRole('button', { name: 'Notes', exact: true }).click();
    const staff = page.locator('.note-readout svg.staff');
    await staff.waitFor({ state: 'visible' });
    assert.ok((await staff.locator('path').count()) >= 2);
    assert.equal(
      await staff.getAttribute('aria-labelledby'),
      await staff.locator('title').getAttribute('id'),
    );
    assert.equal(await page.locator('.notes-lab svg.staff').count(), 4);
    assert.ok(await page.locator('.notation-figure svg use').count());
    assert.equal(
      await page
        .locator('.notation-figure')
        .evaluate((figure) =>
          [...figure.querySelectorAll('use')].every((use) =>
            document.getElementById(use.getAttribute('xlink:href').slice(1)),
          ),
        ),
      true,
      'Generated figures must resolve their local glyph outlines offline',
    );
    await page.getByRole('button', { name: 'Line 1', exact: true }).click();
    assert.equal(await page.locator('.note-name').textContent(), 'E4');
    await page
      .getByRole('combobox', { name: 'Accidental before this note' })
      .click();
    await page.getByRole('option', { name: 'Flat', exact: true }).click();
    assert.match(
      await page.locator('.notation-workbench output').textContent(),
      /E♭4/,
    );
    for (const [lang, title] of [
      ['en', 'Rhythm and musical time'],
      ['ru', 'Ритм и музыкальное время'],
      ['de', 'Rhythmus und musikalische Zeit'],
    ]) {
      for (const lens of ['read', 'play', 'drill', 'define']) {
        await page.goto(`${origin}/#/${lang}/c/rhythm/${lens}`);
        await page
          .getByRole('heading', { name: title, exact: true, level: 1 })
          .waitFor();
        assert.equal(await page.locator('.chapter-lessons > li').count(), 4);
        assert.equal(await page.locator('html').getAttribute('lang'), lang);
        await page.reload();
        await page
          .getByRole('heading', { name: title, exact: true, level: 1 })
          .waitFor();
        assert.equal(
          await page.locator('.chapter-lessons > li').count(),
          4,
          'A reloaded fragment keeps its chapter',
        );
      }
    }
    await mkdir('outputs/learning-routes', { recursive: true });
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${origin}/#/en/read`);
    await page.locator('.entry-diagnostic').waitFor();
    await page.screenshot({
      path: 'outputs/learning-routes/chapters-desktop.png',
      fullPage: true,
    });
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto(`${origin}/#/ru/c/pitch-relationships/read`);
    await page
      .getByRole('heading', {
        name: 'Строй, интервалы, гаммы и аккорды',
        level: 1,
        exact: true,
      })
      .waitFor();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await page.screenshot({
      path: 'outputs/learning-routes/chapter-mobile.png',
      fullPage: true,
    });
    // A real document reload verifies hydration against saved browser data,
    // beyond component tests whose module stores can outlive an unmount.
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${origin}/#/en/play`);
    await page.getByRole('button', { name: 'Tone', exact: true }).click();
    await page.locator('#frequency').fill('528');
    await page.locator('#frequency').press('Tab');
    await page.reload();
    assert.equal(await page.locator('#frequency').inputValue(), '528');
    await page.goto(`${origin}/#/en/t/staff/read`);
    await page
      .getByRole('checkbox', { name: 'I have worked through this lesson' })
      .check();
    const reopened = await context.newPage();
    await reopened.goto(origin);
    await reopened
      .getByRole('checkbox', { name: 'I have worked through this lesson' })
      .waitFor();
    assert.equal(await reopened.getByRole('checkbox').isChecked(), true);
    assert.match(reopened.url(), /#\/en\/t\/staff\/read$/);
    await reopened.close();
    await page.goto(`${origin}/#/en/t/dots-ties/drill`);
    await page.locator('.drill-question .answer-grid button').first().click();
    await page.locator('.local-data summary').click();
    const downloading = page.waitForEvent('download');
    await page
      .getByRole('button', { name: 'Export backup', exact: true })
      .click();
    const downloaded = await downloading;
    const backup = await readFile(await downloaded.path());
    const original = JSON.parse(backup.toString('utf8'));
    assert.deepEqual(original.completed, ['staff']);
    assert.equal(original.lab.frequency, 528);
    assert.equal(
      Object.values(original.answers).reduce((sum, row) => sum + row.asked, 0),
      1,
    );
    await page
      .getByRole('button', { name: 'Reset local data', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Confirm replacement', exact: true })
      .click();
    assert.equal(await page.locator('#frequency').inputValue(), '440');
    await page.locator('.local-data summary').click();
    await page.locator('input[type=file]').setInputFiles({
      name: 'backup.json',
      mimeType: 'application/json',
      buffer: backup,
    });
    await page
      .getByRole('button', { name: 'Confirm replacement', exact: true })
      .click();
    await page.locator('.drill-question').waitFor();
    const restored = await page.evaluate(() =>
      JSON.parse(localStorage.getItem('oml-profile')),
    );
    assert.deepEqual(restored.completed, original.completed);
    assert.deepEqual(restored.answers, original.answers);
    assert.equal(restored.lab.frequency, 528);
    await page.locator('.local-data summary').click();
    await mkdir('outputs/local-learning-data', { recursive: true });
    await page
      .locator('.local-data')
      .screenshot({ path: 'outputs/local-learning-data/desktop.png' });
    await page.setViewportSize({ width: 360, height: 800 });
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    await page
      .locator('.local-data')
      .screenshot({ path: 'outputs/local-learning-data/mobile.png' });
    assert.deepEqual(
      external,
      [],
      'The labs or chapters tried to fetch an external resource',
    );
  } finally {
    await browser?.close();
    await new Promise((done) => server.close(done));
  }
});
