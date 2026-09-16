import { localizedText as text, type LocalText } from './i18n';
import type { ExerciseKind } from './exercises';

// Original procedural prompts. Musical scope and source sections: docs/practice-feedback.md.
const pitch = [
  text(
    'Find the clef and the written position first.',
    'Сначала найдите ключ и положение ноты.',
    'Bestimme zuerst Schlüssel und Notenposition.',
  ),
  text(
    'Read the note name, then check its accidental and octave separately.',
    'Определите название ноты, затем отдельно проверьте знак альтерации и октаву.',
    'Lies den Notennamen; prüfe dann Vorzeichen und Oktave getrennt.',
  ),
] as const;
const rhythm = [
  text(
    'Identify the written value and the unit requested by the question.',
    'Определите записанную длительность и единицу, указанную в вопросе.',
    'Bestimme den notierten Wert und die gefragte Zähleinheit.',
  ),
  text(
    'Express each value in that unit before calculating the total.',
    'Выразите каждую длительность в этой единице, прежде чем вычислять итог.',
    'Drücke jeden Wert in dieser Einheit aus, bevor du die Summe berechnest.',
  ),
] as const;
export const practiceHints: Record<
  ExerciseKind,
  readonly [LocalText, LocalText]
> = {
  'octave-region': [
    text(
      'Separate the note name from its register.',
      'Отделите название ноты от её регистра.',
      'Trenne Notenname und Register.',
    ),
    text(
      'Locate the written note within its octave before applying any accidental.',
      'Найдите записанную ноту в её октаве до применения знака альтерации.',
      'Ordne die geschriebene Note ihrer Oktave zu, bevor du das Vorzeichen anwendest.',
    ),
  ],
  'accidental-name': [
    text(
      'Read the basic note name first.',
      'Сначала прочитайте основное название ноты.',
      'Lies zuerst den Stammton.',
    ),
    text(
      'Check the sign separately: does it raise, lower or cancel an alteration?',
      'Отдельно проверьте знак: он повышает, понижает или отменяет альтерацию?',
      'Prüfe das Zeichen getrennt: erhöht, erniedrigt oder löst es eine Alteration auf?',
    ),
  ],
  enharmonic: [
    text(
      'Keep the requested spelling in view, not only the sound.',
      'Учитывайте требуемое написание, а не только звучание.',
      'Beachte die geforderte Schreibweise, nicht nur den Klang.',
    ),
    text(
      'Start with the requested note name; choose the accidental that reaches the same key in this 12-TET model.',
      'Начните с требуемого названия; подберите знак, ведущий к той же клавише в этой модели равномерного строя.',
      'Beginne beim geforderten Stammton und suche das Vorzeichen für dieselbe Taste in diesem gleichstufigen Modell.',
    ),
  ],
  'dotted-value': [
    rhythm[0],
    text(
      'The first dot adds half the base value; a second dot adds half of the first dot’s addition.',
      'Первая точка добавляет половину основной длительности; вторая — половину прибавки первой.',
      'Der erste Punkt ergänzt die Hälfte des Grundwerts; ein zweiter Punkt ergänzt die Hälfte des ersten Zusatzes.',
    ),
  ],
  tuplet: [
    rhythm[0],
    text(
      'Read the group ratio before counting individual written notes.',
      'Прочитайте соотношение группы перед подсчётом отдельных нот.',
      'Lies das Gruppenverhältnis, bevor du einzelne Noten zählst.',
    ),
  ],
  'tie-sum': rhythm,
  'read-pitch': pitch,
  'clef-transform': [
    pitch[0],
    text(
      'Read the same position again using the new clef’s reference note.',
      'Прочитайте ту же позицию заново, опираясь на ноту нового ключа.',
      'Lies dieselbe Position anhand des Bezugstons im neuen Schlüssel erneut.',
    ),
  ],
  'accidental-scope': [
    text(
      'Follow the notes from left to right and locate the barline.',
      'Проследите ноты слева направо и найдите тактовую черту.',
      'Gehe die Noten von links nach rechts durch und finde den Taktstrich.',
    ),
    text(
      'Check which sign applies at this exact written position and whether a barline intervenes.',
      'Проверьте, какой знак действует в этой позиции и есть ли перед ней тактовая черта.',
      'Prüfe, welches Vorzeichen an dieser Notenposition gilt und ob ein Taktstrich dazwischenliegt.',
    ),
  ],
  'value-identification': rhythm,
  'beaming-review': [
    rhythm[0],
    text(
      'Compare which beat groups each notation makes easier to follow.',
      'Сравните, какие группы долей легче проследить в каждой записи.',
      'Vergleiche, welche Schlaggruppen die jeweilige Notation leichter erkennbar macht.',
    ),
  ],
  'ornament-review': [
    pitch[0],
    text(
      'Separate the written sign from choices that depend on style and performance context.',
      'Отделите записанный знак от решений, зависящих от стиля и исполнительского контекста.',
      'Trenne das notierte Zeichen von Entscheidungen, die von Stil und Aufführungskontext abhängen.',
    ),
  ],
  'performance-marks': [
    text(
      'Identify whether the question concerns tempo, dynamics, articulation or the route through the score.',
      'Определите, касается ли вопрос темпа, динамики, артикуляции или порядка исполнения.',
      'Kläre, ob nach Tempo, Dynamik, Artikulation oder dem Ablauf gefragt wird.',
    ),
    text(
      'Apply that instruction in the given context; check the beat unit or follow the indicated route step by step.',
      'Примените указание в данном контексте: проверьте единицу пульса или проследите порядок исполнения по шагам.',
      'Wende die Anweisung im gegebenen Kontext an: prüfe die Schlageinheit oder verfolge den Ablauf Schritt für Schritt.',
    ),
  ],
  'short-excerpt': [pitch[0], rhythm[0]],
};
export const hearingHints = [
  text(
    'Replay and hum the two notes if comfortable. Compare their distance.',
    'Послушайте ещё раз и, если удобно, напойте обе ноты. Сравните расстояние между ними.',
    'Höre erneut zu und summe die beiden Töne, wenn du möchtest. Vergleiche ihren Abstand.',
  ),
  text(
    'Compare the smaller third-sized choices with the wider fifth or octave before choosing the interval quality.',
    'Сначала сравните более узкие терции с широкой квинтой или октавой, затем выберите качество интервала.',
    'Vergleiche zuerst die engeren Terzen mit Quinte oder Oktave und wähle dann die Intervallqualität.',
  ),
] as const;
