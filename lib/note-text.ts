/** Explicit editorial notation, never a search for ordinary words such as «до». */
const name =
  '(?:до|ре|ми|фа|соль|ля|си)(?:-(?:дубль-диез|дубль-бемоль|диез|бемоль))?';
const markedNote = new RegExp(`\\[\\[(${name})\\]\\]`, 'giu');
const pitchLabel = new RegExp(`^(${name})(?=,|$)`, 'iu');

export type NoteTextPart = { text: string; note: boolean };

/** Parse only explicitly marked, valid note names; other text stays literal. */
export function noteTextParts(markup: string): NoteTextPart[] {
  const parts: NoteTextPart[] = [];
  let start = 0;
  for (const match of markup.matchAll(markedNote)) {
    if (match.index > start)
      parts.push({ text: markup.slice(start, match.index), note: false });
    parts.push({ text: match[1], note: true });
    start = match.index + match[0].length;
  }
  if (start < markup.length)
    parts.push({ text: markup.slice(start), note: false });
  return parts;
}

export function plainNoteText(markup: string): string {
  return noteTextParts(markup)
    .map((part) => part.text)
    .join('');
}

/** Only call for a semantic pitch label, not arbitrary Russian prose. */
export function markPitchName(text: string, lang: string): string {
  return lang === 'ru' ? text.replace(pitchLabel, '[[$1]]') : text;
}

/** Keep markup alongside plain text, never inside search, speech or answer keys. */
export function noteTextValue(markup: string): {
  text: string;
  markup?: string;
} {
  const text = plainNoteText(markup);
  return text === markup ? { text } : { text, markup };
}
