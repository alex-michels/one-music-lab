import { german } from './german';
import { scales } from './scales';
import type { SpelledPattern } from './notation';
import type { ErrorTag, ExerciseKind } from './exercises';
import { localText as b } from './i18n';
export type { LocalText } from './i18n';
import type { LocalText } from './i18n';
import { nt } from './notation-tasks';
export { lessons, terms } from './content/adapters';
export const patterns: Record<
  'intervals' | 'scales' | 'chords',
  SpelledPattern[]
> = {
  intervals: [
    {
      de: german['Minor second'],
      en: 'Minor second',
      ru: 'Малая секунда',
      steps: [0, 1],
      degrees: [0, 1],
    },
    {
      de: german['Major second'],
      en: 'Major second',
      ru: 'Большая секунда',
      steps: [0, 2],
      degrees: [0, 1],
    },
    {
      de: german['Minor third'],
      en: 'Minor third',
      ru: 'Малая терция',
      steps: [0, 3],
      degrees: [0, 2],
    },
    {
      de: german['Major third'],
      en: 'Major third',
      ru: 'Большая терция',
      steps: [0, 4],
      degrees: [0, 2],
    },
    {
      de: german['Perfect fourth'],
      en: 'Perfect fourth',
      ru: 'Чистая кварта',
      steps: [0, 5],
      degrees: [0, 3],
    },
    {
      de: german['Tritone (augmented fourth)'],
      en: 'Tritone (augmented fourth)',
      ru: 'Тритон (увеличенная кварта)',
      steps: [0, 6],
      degrees: [0, 3],
    },
    {
      de: german['Perfect fifth'],
      en: 'Perfect fifth',
      ru: 'Чистая квинта',
      steps: [0, 7],
      degrees: [0, 4],
    },
    {
      de: german['Octave'],
      en: 'Octave',
      ru: 'Октава',
      steps: [0, 12],
      degrees: [0, 7],
    },
  ],
  scales,
  chords: [
    {
      de: german['Major triad'],
      en: 'Major triad',
      ru: 'Мажорное трезвучие',
      steps: [0, 4, 7],
      degrees: [0, 2, 4],
    },
    {
      de: german['Minor triad'],
      en: 'Minor triad',
      ru: 'Минорное трезвучие',
      steps: [0, 3, 7],
      degrees: [0, 2, 4],
    },
    {
      de: german['Diminished'],
      en: 'Diminished',
      ru: 'Уменьшённое',
      steps: [0, 3, 6],
      degrees: [0, 2, 4],
    },
    {
      de: german['Augmented'],
      en: 'Augmented',
      ru: 'Увеличенное',
      steps: [0, 4, 8],
      degrees: [0, 2, 4],
    },
    {
      de: german['Dominant seventh'],
      en: 'Dominant seventh',
      ru: 'Малый мажорный септаккорд',
      steps: [0, 4, 7, 10],
      degrees: [0, 2, 4, 6],
    },
    {
      de: german['Major seventh'],
      en: 'Major seventh',
      ru: 'Большой мажорный септаккорд',
      steps: [0, 4, 7, 11],
      degrees: [0, 2, 4, 6],
    },
    {
      de: german['Minor seventh'],
      en: 'Minor seventh',
      ru: 'Малый минорный септаккорд',
      steps: [0, 3, 7, 10],
      degrees: [0, 2, 4, 6],
    },
  ],
};

/**
 * The generated notation exercises offered in Practice (roadmap №558). The
 * kinds live in lib/exercises.ts; these are only their labels and the sentence
 * shown when an answer misses, so the trainer explains a mistake instead of
 * marking it.
 */
export const exerciseModes: { kind: ExerciseKind; label: LocalText }[] = [
  {
    kind: 'value-identification',
    label: nt(
      'Note and rest values',
      'Длительности нот и пауз',
      'Noten- und Pausenwerte',
    ),
  },
  {
    kind: 'beaming-review',
    label: nt(
      'Compare beaming',
      'Сравнение группировки',
      'Balkengruppierung vergleichen',
    ),
  },
  {
    kind: 'ornament-review',
    label: nt(
      'Recognize ornaments',
      'Узнавание украшений',
      'Verzierungen erkennen',
    ),
  },
  {
    kind: 'performance-marks',
    label: nt(
      'Performance indications',
      'Исполнительские обозначения',
      'Vortragsbezeichnungen',
    ),
  },
  {
    kind: 'short-excerpt',
    label: nt('Read an excerpt', 'Чтение фрагмента', 'Einen Ausschnitt lesen'),
  },
  { kind: 'octave-region', label: b('Registers', 'Октавы') },
  { kind: 'accidental-name', label: b('Altered notes', 'Знаки альтерации') },
  { kind: 'enharmonic', label: b('Enharmonic spelling', 'Энгармонизм') },
  { kind: 'dotted-value', label: b('Dotted values', 'Длительности с точкой') },
  { kind: 'tuplet', label: b('Irregular groups', 'Особые деления') },
  { kind: 'tie-sum', label: b('Tied values', 'Залигованные длительности') },
  { kind: 'read-pitch', label: b('Read a note', 'Чтение ноты') },
  { kind: 'clef-transform', label: b('Change of clef', 'Смена ключа') },
  {
    kind: 'accidental-scope',
    label: b('How far a sign reaches', 'Действие знака'),
  },
];

/** One sentence per way of being wrong, keyed by the generator's own tag. */
export const exerciseExplanations: Record<ErrorTag, LocalText> = {
  'duration-symbol': nt(
    'Inspect the head, stem, flags or rest shape; a whole-bar rest also requires the time signature.',
    'Проверьте головку, штиль, флажки или форму паузы; для тактовой паузы учитывайте размер.',
    'Prüfe Kopf, Hals, Fähnchen oder Pausenform; bei der Ganztaktpause auch die Taktart.',
  ),
  'tempo-unit': nt(
    'To find one metronome unit’s duration in seconds, divide 60 by the metronome number. Read the marked note value first.',
    'Чтобы найти длительность одного отсчёта метронома в секундах, разделите 60 на число метронома. Сначала прочитайте указанную рядом длительность.',
    'Teile 60 durch die Metronomzahl, um die Dauer eines Metronomschlags in Sekunden zu erhalten. Lies zuerst den angegebenen Notenwert.',
  ),
  'dynamic-level': nt(
    'Move along the relative ladder from piano toward forte.',
    'Двигайтесь по относительной шкале от пиано к форте.',
    'Gehe auf der relativen Skala von piano in Richtung forte.',
  ),
  'articulation-meaning': nt(
    'Distinguish the staccato dot from the tenuto line.',
    'Отличайте точку стаккато от черты тенуто.',
    'Unterscheide Staccatopunkt und Tenutostrich.',
  ),
  // Convention-neutral on purpose. Four of the five repeat figures carry no
  // endings at all, so a sentence about skipping ending 1 answered a reader
  // who had misread a D.S. or a percent bar with advice about volte that were
  // not on the page. The figure's own explanation supplies the specifics.
  'repeat-route': nt(
    'Re-read the sign that sends you back, the sign that stops you, and which of them count on this pass.',
    'Проверьте, какой знак задаёт возврат, какой — остановку и какие указания действуют при этом повторе.',
    'Lies erneut, welches Zeichen zurückschickt, welches anhält und welche davon in diesem Durchgang gelten.',
  ),
  correct: b('That is the one.', 'Именно так.'),
  'wrong-written-note': b(
    'Compare the clef, position and accidental with the correct note.',
    'Сравните ключ, положение на стане и знак альтерации с правильной нотой.',
  ),
  'neighbour-register': b(
    'An octave shift keeps the note name. Count the registers in the requested direction.',
    'Перенос на октаву сохраняет название ступени. Отсчитайте октавы в указанном направлении.',
  ),
  'wrong-letter': b(
    'That is the neighbouring step. Count the letters, not the keys.',
    'Это соседняя ступень. Считайте ступени, а не клавиши.',
  ),
  'wrong-alteration': b(
    'The step is right, the sign is not. Check how far the sign moves the note.',
    'Ступень верна, знак — нет. Проверьте, на сколько знак смещает ноту.',
  ),
  'same-sound-other-spelling': b(
    'That sounds the same but is written on another step, which is what the task asked to change.',
    'Это звучит так же, но записано от другой ступени, а изменить нужно было именно запись.',
  ),
  'forgot-the-dot': b(
    'That is the value with no dots. The first dot adds half the original value.',
    'Это длительность без точек. Первая точка прибавляет половину исходной длительности.',
  ),
  'forgot-second-dot': b(
    'That includes the first dot only. The second dot adds half of what the first dot added.',
    'Учтена только первая точка. Вторая прибавляет половину того, что прибавила первая.',
  ),
  'halved-instead-of-dotted': b(
    'That is how many parts the value was divided into, not how long it lasts.',
    'Это число частей, на которые поделена длительность, а не её продолжительность.',
  ),
  'read-the-other-clef': b(
    'That is what the same place would mean in another clef. The clef at the start decides which pitch each line and space carries.',
    'Так это место читалось бы в другом ключе. Ключ в начале определяет, какая нота стоит на каждой линейке и в каждом промежутке.',
  ),
  'ignored-the-sign': nt(
    'Check the effective accidental. A local sign replaces the signature at that letter and octave; it can still apply to a later note in the bar or a tied continuation.',
    'Проверьте действующий знак. Случайный знак заменяет ключевой на той же ступени в той же октаве; он может сохраняться у последующей ноты в такте или у связанного продолжения.',
    'Prüfe das geltende Versetzungszeichen. Es ersetzt das Tonartvorzeichen für denselben Stammton in derselben Oktave und kann noch für eine spätere Note im Takt oder eine gebundene Fortsetzung gelten.',
  ),
  'carried-the-sign-too-far': nt(
    'For a new attack after the barline, read the key signature again unless a new local sign applies. A tied continuation retains the previous pitch but does not set a local accidental for later attacks.',
    'При новой атаке после тактовой черты снова учитывайте ключевые знаки, если не действует новый случайный знак. Связанное продолжение сохраняет прежнюю высоту, но не устанавливает случайный знак для последующих атак.',
    'Für einen neuen Anschlag nach dem Taktstrich gilt wieder die Tonart, sofern kein neues Versetzungszeichen gilt. Eine gebundene Fortsetzung behält die vorherige Tonhöhe, setzt aber kein Versetzungszeichen für spätere Anschläge.',
  ),
  'one-step-too-long': b(
    'That value is one step longer than the group uses. The written value comes from the next larger regular division, not from the starting value.',
    'Эта длительность на ступень длиннее той, которой записана группа. Записывают ближайшей большей регулярной длительностью, а не исходной.',
  ),
  'counted-the-written-value': b(
    'Use the stated ratio: in a 3:2 group, three written eighths fill the time of two ordinary eighths.',
    'Учитывайте указанное отношение: в группе 3:2 три записанные восьмые занимают время двух обычных восьмых.',
  ),
  'added-wrong': nt(
    'Express all durations in the same unit, include any dots, then add or compare the values as the question asks.',
    'Выразите все длительности в одной единице, учтите точки, затем сложите или сравните значения по условию задания.',
    'Drücke alle Dauern in derselben Einheit aus und berücksichtige die Punkte. Addiere oder vergleiche die Werte anschließend so, wie es die Aufgabe verlangt.',
  ),
};
