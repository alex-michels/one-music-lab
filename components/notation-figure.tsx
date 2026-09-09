'use client';
import { useId } from 'react';
import figures from '@/lib/notation-figures.json';

/** Only committed SVG, never uploaded XML/HTML. Unique IDs prevent cross-figure glyph collisions. */
export function NotationFigure({ id, label }: { id: string; label: string }) {
  const instance = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  if (!Object.hasOwn(figures, id))
    throw new RangeError('Unknown notation figure');
  const raw = figures[id as keyof typeof figures];
  const svg = raw
    .replace(/\bid="([^"]+)"/g, `id="${instance}-$1"`)
    .replace(/#([a-zA-Z][\w-]*)/g, `#${instance}-$1`)
    .replaceAll('color="black"', 'color="currentColor"')
    .replace('<svg ', '<svg fill="currentColor" ');
  return (
    <figure className="notation-figure" aria-label={label}>
      <div aria-hidden="true" dangerouslySetInnerHTML={{ __html: svg }} />
    </figure>
  );
}
