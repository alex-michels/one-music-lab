import { test } from 'vitest';
import assert from 'node:assert/strict';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Item, ItemGroup } from '../components/ui/item.tsx';

test('ItemGroup preserves explicit list semantics and native list items', () => {
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
});
