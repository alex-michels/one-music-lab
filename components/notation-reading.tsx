import {
  notationFigureDescriptions,
  notationProgramme,
  type NotationTopic,
} from '@/lib/notation-programme';
import { nt } from '@/lib/notation-tasks';
import type { Lang } from '@/lib/client-store';
import { NotationFigure } from './notation-figure';

export function NotationReading({
  topic,
  lang,
}: {
  topic: string;
  lang: Lang;
}) {
  if (!Object.hasOwn(notationProgramme, topic)) return null;
  const chapter = notationProgramme[topic as NotationTopic];
  return (
    <section className="notation-reading">
      <h2>
        {
          nt(
            'Read, compare, explain',
            'Прочитайте, сравните, объясните',
            'Lesen, vergleichen, erklären',
          )[lang]
        }
      </h2>
      <p>{chapter.text[lang]}</p>
      <div className="notation-figure-grid">
        {chapter.figures.map((id) => (
          <figure key={id}>
            <NotationFigure
              id={id}
              label={
                id.startsWith('note-')
                  ? `${nt('Note value', 'Длительность ноты', 'Notenwert')[lang]} 1/${id.split('-')[1]}`
                  : id.startsWith('rest-')
                    ? `${nt('Rest value', 'Длительность паузы', 'Pausenwert')[lang]} 1/${id.split('-')[1]}`
                    : (notationFigureDescriptions[id]?.[lang] ??
                      nt(
                        'Worked notation example',
                        'Нотный пример с разбором',
                        'Erläutertes Notationsbeispiel',
                      )[lang])
              }
            />
            <figcaption>
              {id.startsWith('note-') || id.startsWith('rest-')
                ? `1/${id.split('-')[1]}`
                : (notationFigureDescriptions[id]?.[lang] ?? '')}
            </figcaption>
          </figure>
        ))}
      </div>
      <a
        className="source-link"
        href={chapter.source.url}
        target="_blank"
        rel="noreferrer"
      >
        {chapter.source.title}
      </a>
    </section>
  );
}
