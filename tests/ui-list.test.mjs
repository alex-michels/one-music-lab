import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { fileURLToPath } from 'node:url';

await test('ItemGroup preserves explicit list semantics and native list items', async () => {
  // Use the installed TSX transformer with real React/Base UI, without the
  // application hosting plugins or a browser/listening HTTP server.
  const root = fileURLToPath(new URL('../', import.meta.url));
  const server = await createServer({
    root,
    configFile: false,
    resolve: { alias: { '@': root } },
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
  });
  try {
    const { ItemGroup, Item } = await server.ssrLoadModule(
      '/components/ui/item.tsx',
    );
    const html = renderToStaticMarkup(
      createElement(
        ItemGroup,
        {
          'aria-label': 'Selected notes',
          id: 'notes',
          className: 'list-none gap-8',
        },
        ...['A4', 'C5'].map((note) =>
          createElement(
            Item,
            {
              key: note,
              render: createElement('li'),
            },
            note,
          ),
        ),
      ),
    );

    assert.match(html, /^<ul\b[^>]*\brole="list"/);
    assert.match(html, /\baria-label="Selected notes"/);
    assert.match(html, /\bid="notes"/);
    assert.match(html, /\bdata-slot="item-group"/);
    assert.match(html, /\bclass="[^"]*\blist-none\b/);
    assert.match(html, /\bclass="[^"]*\bgap-8\b/);
    assert.equal((html.match(/<li\b/g) ?? []).length, 2);
    assert.match(html, />A4<\/li><li\b[^>]*>C5<\/li><\/ul>$/);

    const empty = renderToStaticMarkup(createElement(ItemGroup));
    assert.match(empty, /^<ul\b[^>]*\brole="list"[^>]*><\/ul>$/);
  } finally {
    await server.close();
  }
});
