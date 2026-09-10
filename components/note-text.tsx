import type { LocalText } from '@/lib/i18n';
import { markPitchName, noteTextParts } from '@/lib/note-text';

/** A note name is a musical term, not spoken emphasis: use semantic italic text. */
export function NoteText({
  text,
  lang,
  markup,
  pitch = false,
}: {
  text?: string | LocalText;
  lang: 'en' | 'ru' | 'de';
  markup?: string;
  /** For known pitch labels only; never guesses the meaning of a word in prose. */
  pitch?: boolean;
}) {
  const plain = typeof text === 'object' ? text[lang] : (text ?? '');
  if (lang !== 'ru') return plain;
  const marked =
    markup ??
    (typeof text === 'object' ? text.ruMarkup : undefined) ??
    (pitch ? markPitchName(plain, lang) : plain);
  return noteTextParts(marked).map((part, index) =>
    part.note ? (
      <i className="russian-note-name" key={index}>
        {part.text}
      </i>
    ) : (
      part.text
    ),
  );
}
