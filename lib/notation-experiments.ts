import { localText as b } from './i18n';

/** Finite examples of Western notation. Times are measured in quarter-note beats. */
export const notationExamples = {
  soft: {
    label: { en: 'Softer', ru: 'Тише', de: 'Leiser' },
    group: 'dynamics',
    midis: [60],
    length: 2,
    spacing: 2,
  },
  strong: {
    label: { en: 'Louder', ru: 'Громче', de: 'Lauter' },
    group: 'dynamics',
    midis: [60],
    length: 2,
    spacing: 2,
  },
  successive: {
    label: b('One after another', 'По очереди'),
    group: 'pitch',
    midis: [60, 67],
    length: 1,
    spacing: 1,
  },
  together: {
    label: b('Together', 'Одновременно'),
    group: 'pitch',
    midis: [60, 67],
    length: 1,
    spacing: 0,
  },
  pulse: {
    label: b('Four steady beats', 'Четыре ровные доли'),
    group: 'tempo',
    midis: [60, 60, 60, 60],
    length: 0.25,
    spacing: 1,
  },
  whole: {
    label: b('One whole note', 'Одна целая'),
    group: 'durations',
    midis: [60],
    length: 4,
    spacing: 4,
  },
  halves: {
    label: b('Two half notes', 'Две половинные'),
    group: 'durations',
    midis: [60, 60],
    length: 2,
    spacing: 2,
  },
  quarters: {
    label: b('Four quarter notes', 'Четыре четверти'),
    group: 'durations',
    midis: [60, 60, 60, 60],
    length: 1,
    spacing: 1,
  },
  untied: {
    label: b('Two separate quarter notes', 'Две отдельные четверти'),
    group: 'ties',
    midis: [62, 62],
    length: 1,
    spacing: 1,
  },
  tied: {
    label: b('Two quarter notes tied', 'Две четверти под лигой продления'),
    group: 'ties',
    midis: [62],
    length: 2,
    spacing: 2,
  },
  eighths: {
    label: b('Two eighths per beat', 'Две восьмые на долю'),
    group: 'division',
    midis: Array<number>(8).fill(60),
    length: 0.5,
    spacing: 0.5,
  },
  triplets: {
    label: b('Three triplet eighths per beat', 'Три триольные восьмые на долю'),
    group: 'division',
    midis: Array<number>(12).fill(60),
    length: 1 / 3,
    spacing: 1 / 3,
  },
  sustained: {
    label: b('Full-length tones', 'Тоны полной длительности'),
    group: 'articulation',
    midis: [60, 62, 64, 65],
    length: 1,
    spacing: 1,
  },
  detached: {
    label: b('Short detached tones', 'Короткие раздельные тоны'),
    group: 'articulation',
    midis: [60, 62, 64, 65],
    length: 0.25,
    spacing: 1,
  },
  figure: {
    label: b('Four-note figure', 'Фигура из четырёх нот'),
    group: 'repeats',
    midis: [60, 62, 64, 67],
    length: 1,
    spacing: 1,
  },
  repeated: {
    label: b('Repeat the figure', 'Повторить фигуру'),
    group: 'repeats',
    midis: [60, 62, 64, 67, 60, 62, 64, 67],
    length: 1,
    spacing: 1,
  },
  ending: {
    label: b('Repeat with a changed ending', 'Повторить с другим окончанием'),
    group: 'repeats',
    midis: [60, 62, 64, 67, 60, 62, 64, 60],
    length: 1,
    spacing: 1,
  },
} as const;

export type NotationExampleId = keyof typeof notationExamples;
export type NotationGroup =
  (typeof notationExamples)[NotationExampleId]['group'];
export type WrittenNote = {
  letter: number;
  accidental: number;
  octave: number;
};
export type NotesLabState = {
  note: WrittenNote;
  group: NotationGroup;
  tempo: 60 | 120;
};
export const initialNotesLabState: NotesLabState = {
  note: { letter: 0, accidental: 0, octave: 4 },
  group: 'tempo',
  tempo: 60,
};

export const notationGroups: {
  id: NotationGroup;
  label: ReturnType<typeof b>;
}[] = [
  {
    id: 'pitch',
    label: b('Successive and simultaneous notes', 'Ноты подряд и одновременно'),
  },
  { id: 'tempo', label: b('Tempo', 'Темп') },
  { id: 'durations', label: b('Note values', 'Длительности нот') },
  { id: 'ties', label: b('Ties', 'Лиги продления') },
  { id: 'division', label: b('Beat division', 'Деление доли') },
  { id: 'articulation', label: b('Articulation', 'Артикуляция') },
  { id: 'repeats', label: b('Repeats', 'Повторы') },
  { id: 'dynamics', label: { en: 'Dynamics', ru: 'Динамика', de: 'Dynamik' } },
];

/** Safe inputs for AudioEngine.preview; no timers or audio are created here. */
export function planNotationExample(id: NotationExampleId, tempo: number) {
  if (!Object.hasOwn(notationExamples, id) || ![60, 120].includes(tempo))
    throw new RangeError('Unknown notation example or unsupported tempo');
  const example = notationExamples[id];
  const beat = 60 / tempo;
  return {
    midis: [...example.midis],
    duration: example.length * beat,
    spacing: example.spacing * beat,
    gain: id === 'soft' ? 0.25 : 1,
  };
}

/** Lessons share the lab's actual controls; unknown/old lessons retain their tone preset. */
export const notationLessonPresets: Record<
  string,
  Pick<NotesLabState, 'note' | 'group'>
> = {
  'note-names': {
    note: { letter: 0, accidental: 0, octave: 4 },
    group: 'pitch',
  },
  staff: { note: { letter: 0, accidental: 0, octave: 4 }, group: 'pitch' },
  clefs: { note: { letter: 0, accidental: 0, octave: 4 }, group: 'pitch' },
  'accidental-signs': {
    note: { letter: 0, accidental: 0, octave: 4 },
    group: 'pitch',
  },
  'accidental-scope': {
    note: { letter: 6, accidental: 0, octave: 4 },
    group: 'pitch',
  },
  enharmonics: {
    note: { letter: 3, accidental: 1, octave: 4 },
    group: 'pitch',
  },
  durations: {
    note: { letter: 0, accidental: 0, octave: 4 },
    group: 'durations',
  },
  'dots-ties': { note: { letter: 1, accidental: 0, octave: 4 }, group: 'ties' },
  'beat-division': {
    note: { letter: 0, accidental: 0, octave: 4 },
    group: 'division',
  },
  tempo: { note: { letter: 0, accidental: 0, octave: 4 }, group: 'tempo' },
  articulation: {
    note: { letter: 0, accidental: 0, octave: 4 },
    group: 'articulation',
  },
  repeats: { note: { letter: 0, accidental: 0, octave: 4 }, group: 'repeats' },
  dynamics: {
    note: { letter: 0, accidental: 0, octave: 4 },
    group: 'dynamics',
  },
};
