import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir, stat } from 'node:fs/promises';
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

await test('All initial executable and styling resources exist in the portable directory', async () => {
  const tags = html.match(/<(?:script|link)\b[^>]*>/g) ?? [];
  let scripts = 0;
  let styles = 0;
  for (const tag of tags) {
    if (/\brel="canonical"/.test(tag)) continue;
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

await test('The portable Notes lab renders while every external request is blocked', async () => {
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
    const staff = page.locator('svg.staff');
    await staff.waitFor({ state: 'visible' });
    assert.ok((await staff.locator('path').count()) >= 2);
    assert.equal(
      await staff.getAttribute('aria-labelledby'),
      await staff.locator('title').getAttribute('id'),
    );
    assert.deepEqual(
      external,
      [],
      'The Notes lab tried to fetch an external resource',
    );
  } finally {
    await browser?.close();
    await new Promise((done) => server.close(done));
  }
});
