import type { Item, Level, Option } from './exercises';
import { localizedText } from './i18n';
import { markPitchName } from './note-text';
import { pitchAtStep } from './staff';
import {
  pitchLabel as plainPitchLabel,
  type MusicLanguage,
  type SpelledPitch,
} from './notation';
import { resolveAccidentalSequence, signature } from './notation-workbench';

export const nt = localizedText;
// Builder text retains explicit notation until generate() separates display and answer data.
const taskText = (en: string, ru: string, de: string) => ({ en, ru, de });
const pitchLabel = (pitch: SpelledPitch, lang: MusicLanguage) =>
  markPitchName(plainPitchLabel(pitch, lang), lang);
export const notationSources = {
  names: {
    title:
      'Chelsey Hamm / Bryn Hughes · Open Music Theory 2 · American Standard Pitch Notation · ASPN and Octave Designations',
    url: 'https://viva.pressbooks.pub/openmusictheory/chapter/aspn/',
  },
  accidentals: {
    title:
      'LilyPond 2.24.4 · §1.1.3 Displaying pitches · Key signature / Automatic accidentals / Ottava brackets',
    url: 'https://lilypond.org/doc/v2.24/Documentation/notation/displaying-pitches',
  },
  terms: {
    title:
      'Lehrklänge · Lexikon · Vortragsbezeichnungen · alphabetical entries',
    url: 'https://www.lehrklaenge.de/PHP/Lexikon/Vortragsbezeichnungen.php',
  },
  chant: {
    title: 'LilyPond 2.24.4 Music Glossary · divisio',
    url: 'https://lilypond.org/doc/v2.24/Documentation/music-glossary/divisio',
  },
  graphic: {
    title:
      'Saffron Hall · Graphic scores explained · opening explanation (11 May 2022)',
    url: 'https://www.saffronhall.com/articles/graphic-scores-explained',
  },
  figured: {
    title:
      'LilyPond 2.24.4 · §2.7.3 Figured bass · Introduction / Entering figured bass',
    url: 'https://lilypond.org/doc/v2.24/Documentation/notation/figured-bass',
  },
  tablature: {
    title:
      'LilyPond 2.24.4 · §2.4.1 Common notation for fretted strings · Default tablatures',
    url: 'https://lilypond.org/doc/v2.24/Documentation/notation/common-notation-for-fretted-strings',
  },
  curves: {
    title:
      'LilyPond 2.24.4 · §1.3.2 Expressive marks as curves · Slurs / Phrasing slurs',
    url: 'https://lilypond.org/doc/v2.24/Documentation/notation/expressive-marks-as-curves',
  },
  rhythm: {
    title:
      'Gotham / Hamm / Hughes · Open Music Theory 2 · Notating Rhythm · Note Values / Rest Values / Dots and ties',
    url: 'https://viva.pressbooks.pub/openmusictheory/chapter/notating-rhythm/',
  },
  tuplets: {
    title:
      'LilyPond 2.24.4 · §1.2.1 Writing rhythms · Tuplets / Scaling durations',
    url: 'https://lilypond.org/doc/v2.24/Documentation/notation/writing-rhythms#tuplets',
  },
  ties: {
    title: 'LilyPond 2.24.4 · §1.2.1 Writing rhythms · Ties',
    url: 'https://lilypond.org/doc/v2.24/Documentation/notation/writing-rhythms#ties',
  },
  marks: {
    title:
      'Mark Gotham / Chelsey Hamm · Open Music Theory 2 · Other Aspects of Notation · Dynamics / Articulations / Tempo / Structural Features',
    url: 'https://viva.pressbooks.pub/openmusictheory/chapter/other-aspects-of-notation/',
  },
  tempo: {
    title:
      'Dolmetsch Online · Music Theory §5 Tempo · Table of Tempo Markings / Metronome Marks',
    url: 'https://www.dolmetsch.com/musictheory5.htm',
  },
  beams: {
    title: 'LilyPond 2.24.4 · §1.2.4 Beams',
    url: 'https://lilypond.org/doc/v2.24/Documentation/notation/beams',
  },
  ornaments: {
    title: 'LilyPond 2.24.4 · §1.3.1 Articulations and ornamentations',
    url: 'https://lilypond.org/doc/v2.24/Documentation/notation/expressive-marks-attached-to-notes',
  },
  repeats: {
    title: 'LilyPond 2.24.4 · §1.4 Repeats',
    url: 'https://lilypond.org/doc/v2.24/Documentation/notation/repeats',
  },
  pitch: {
    title:
      'Chelsey Hamm · Open Music Theory 2 · Reading Clefs · Clefs and Ranges / Reading Treble, Bass, Alto and Tenor Clef',
    url: 'https://viva.pressbooks.pub/openmusictheory/chapter/clefs/',
  },
} as const;

type Built = Omit<Item, 'kind' | 'level' | 'seed' | 'lang'>;
const pick = <T>(next: () => number, values: readonly T[]): T =>
  values[Math.floor(next() * values.length)];
/**
 * `tag` may be a function of the label. A single tag is right when every
 * distractor really is the same mistake, and wrong the moment they are not:
 * the tag is the sentence a reader is answered with, so naming a mistake they
 * did not make is worse than saying nothing.
 */
function options(
  answer: string,
  others: string[],
  next: () => number,
  tag: Option['tag'] | ((label: string) => Option['tag']),
): Option[] {
  const tagFor = typeof tag === 'function' ? tag : () => tag;
  const result: Option[] = [
    { id: answer, label: answer, tag: 'correct' },
    ...others
      .filter((x, i) => x !== answer && others.indexOf(x) === i)
      .map((label) => ({ id: label, label, tag: tagFor(label) })),
  ];
  /*
   * Shuffle, not rotate. Rotating avoids the unstable random comparator, which
   * was the right instinct, but a rotation is a cyclic permutation: it moves
   * the answer's absolute position while preserving the cyclic ORDER of the
   * list completely. Wherever the distractors are a fixed list rather than one
   * derived from the answer, that leaves the answer at a constant cyclic
   * offset from a recognisable landmark — so a reader who spots the landmark
   * can pick correctly without reading a note, and a histogram of answer
   * positions still looks uniform, which is why nothing caught it.
   */
  return shuffle(next, result);
}

/**
 * Fisher-Yates, the shared one. It lives here rather than in `lib/exercises.ts`
 * because that module already imports this one at run time; the reverse edge
 * would be a cycle.
 */
export function shuffle<T>(next: () => number, items: T[]): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Every written value the figures can show, each one flag from its neighbour. */
const durationScale = [1, 2, 4, 8, 16, 32, 64, 128];

export function valueIdentification(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Built {
  const wholeBar = level > 1 && next() < 0.25;
  const denominator = pick(
    next,
    level === 1
      ? [1, 2, 4, 8]
      : level === 2
        ? [2, 4, 8, 16, 32]
        : [8, 16, 32, 64, 128],
  );
  const rest = next() < 0.5;
  const meter = pick(next, [3, 6]);
  const answer = wholeBar
    ? `${meter}/${meter === 3 ? 4 : 8}`
    : `1/${denominator}`;
  const scaleIndex = durationScale.indexOf(denominator);
  return {
    rule: 'identify-written-duration',
    prompt: taskText(
      'What fraction of a whole note does this symbol represent here?',
      'Какую долю целой ноты обозначает этот знак в данном контексте?',
      'Welchem Anteil einer ganzen Note entspricht dieses Zeichen hier?',
    )[lang],
    figure: wholeBar
      ? `whole-bar-${meter}`
      : `${rest ? 'rest' : 'note'}-${denominator}`,
    answer,
    options: options(
      answer,
      wholeBar
        ? ['1/1', '1/2', '1/8']
        : // The neighbours of the written value, not the head of a fixed list.
          // Taking the first three of an ascending list always offered 1/1,
          // 1/2 and 1/4, so at level 3 — where the answer is a 128th to an
          // eighth — the answer was the only short value on screen and "pick
          // the smallest fraction" won without reading anything. One flag
          // more or fewer is the misreading `duration-symbol` actually names.
          durationScale
            .map((d, index) => ({ d, apart: Math.abs(index - scaleIndex) }))
            .filter((entry) => entry.apart > 0)
            .sort((a, b) => a.apart - b.apart || a.d - b.d)
            .slice(0, 3)
            .map((entry) => `1/${entry.d}`),
      next,
      'duration-symbol',
    ),
    explanation: wholeBar
      ? taskText(
          `A whole-bar rest fills this ${meter}/${meter === 3 ? 4 : 8} bar: ${answer} of a whole note.`,
          `Тактовая пауза заполняет весь такт ${meter}/${meter === 3 ? 4 : 8}: ${answer} целой ноты.`,
          `Die Ganztaktpause füllt diesen ${meter}/${meter === 3 ? 4 : 8}-Takt: ${answer} einer ganzen Note.`,
        )[lang]
      : taskText(
          `The written value is ${answer}; tempo determines its duration in seconds.`,
          `Записанная длительность — ${answer}; время в секундах зависит от темпа.`,
          `Der notierte Wert beträgt ${answer}; die Dauer in Sekunden hängt vom Tempo ab.`,
        )[lang],
    source: notationSources.rhythm,
  };
}

export function beamingReview(
  next: () => number,
  _level: Level,
  lang: MusicLanguage,
): Built {
  const figure = pick(next, [
    'beamed',
    'flagged',
    'beamed-mixed',
    'beamed-syllables',
    'duplet',
    'quartole',
    'octole',
  ]);
  const irregular = ['duplet', 'quartole', 'octole'].includes(figure);
  return {
    rule: 'compare-beaming',
    answer: '',
    options: [],
    figure,
    review: true,
    prompt: irregular
      ? taskText(
          'Compare this explicit irregular division with an ordinary dotted beat. What remains equal, and what changes?',
          'Сравните это явно указанное особое деление с обычной долей с точкой. Что остаётся равным, а что меняется?',
          'Vergleiche diese ausdrücklich bezeichnete Teilung mit einem gewöhnlichen punktierten Schlag. Was bleibt gleich, was ändert sich?',
        )[lang]
      : taskText(
          'Read the values, then discuss this beaming or text-underlay choice. Could another grouping communicate the same durations?',
          'Прочитайте длительности, затем обсудите рёбра или подтекстовку. Может ли другая группировка передать те же длительности?',
          'Lies die Werte und besprich Balken oder Textunterlegung. Könnte eine andere Gruppierung dieselben Dauern vermitteln?',
        )[lang],
    explanation: irregular
      ? taskText(
          'Here 2:3 eighths, 4:3 eighths and 8:6 sixteenths each fill a dotted quarter. The equal subdivisions differ. State the displayed ratio rather than inferring a universal denominator from the group name. This comparison is unscored.',
          'Здесь восьмые 2:3, восьмые 4:3 и шестнадцатые 8:6 заполняют четверть с точкой, но делят её по-разному. Читайте указанное отношение: название группы не задаёт универсального знаменателя. Сравнение без оценки.',
          'Hier füllen Achtel 2:3, Achtel 4:3 und Sechzehntel 8:6 jeweils eine punktierte Viertel, teilen sie aber unterschiedlich. Lies das angegebene Verhältnis, statt aus dem Namen einen universellen Nenner abzuleiten. Ohne Bewertung.',
        )[lang]
      : taskText(
          'Compare flags, mixed eighth/sixteenth values and the secondary-beam break: durations do not change. In the text example two syllables have separate flags, then one syllable spans a beamed pair. This historical vocal convention is not compulsory today. Discuss beat, voice, text and readability; neither an internal break nor syllabic beaming has one universal correct layout. Unscored.',
          'Сравните флажки, смешанные восьмые и шестнадцатые и разрыв второго ребра: длительности не меняются. В примере подтекстовки два слога имеют отдельные флажки, затем один слог объединяет пару под ребром. Эта историческая вокальная практика сегодня не обязательна. Обсудите долю, голос, текст и читаемость; единственной универсальной группировки нет. Без оценки.',
          'Vergleiche Fähnchen, gemischte Achtel/Sechzehntel und den sekundären Balkenbruch: Die Dauern bleiben gleich. Im Textbeispiel stehen zwei Silben unter einzeln gefähnten Noten, dann eine Silbe unter einem verbalkten Paar. Diese historische vokale Praxis ist heute nicht verpflichtend. Begründe mit Zählzeit, Stimme, Text und Lesbarkeit; es gibt kein universelles Balkenbild. Ohne Bewertung.',
        )[lang],
    source: irregular ? notationSources.tuplets : notationSources.beams,
  };
}

export const ornaments = [
  { figure: 'trill', title: taskText('Trill', 'Трель', 'Triller') },
  {
    figure: 'mordent',
    title: taskText('Lower mordent', 'Перечёркнутый мордент', 'Mordent'),
  },
  { figure: 'turn', title: taskText('Turn', 'Группетто', 'Doppelschlag') },
  {
    figure: 'grace',
    title: taskText(
      'Slashed grace note',
      'Перечёркнутый форшлаг',
      'Durchstrichene Vorschlagsnote',
    ),
  },
  {
    figure: 'upper-mordent',
    title: taskText(
      'Upper mordent / Pralltriller',
      'Неперечёркнутый мордент (верхний)',
      'Pralltriller',
    ),
  },
  {
    figure: 'long-grace',
    title: taskText(
      'Unslashed grace note',
      'Неперечёркнутый форшлаг',
      'Nicht durchstrichener Vorschlag',
    ),
  },
  {
    figure: 'after-grace',
    title: taskText('After-grace', 'Нахшлаг', 'Nachschlag'),
  },
  {
    figure: 'slide',
    title: taskText('Slide ornament', 'Шлейфер', 'Schleifer'),
  },
  {
    figure: 'arpeggio',
    title: taskText('Arpeggio sign', 'Знак арпеджиато', 'Arpeggiozeichen'),
  },
] as const;
export function ornamentReview(
  next: () => number,
  _level: Level,
  lang: MusicLanguage,
): Built {
  const row = pick(next, ornaments);
  const context = pick(
    next,
    ['trill', 'mordent', 'turn', 'grace'].includes(row.figure)
      ? ['g4', 'c4', 'f3']
      : ['g4'],
  );
  return {
    rule: 'recognize-an-ornament',
    answer: '',
    options: [],
    figure: context === 'g4' ? row.figure : `${row.figure}-${context}`,
    review: true,
    prompt: taskText(
      'Name the ornament, then say what you would check before performing it.',
      'Назовите украшение и объясните, что нужно выяснить перед исполнением.',
      'Benenne die Verzierung. Was musst du vor ihrer Ausführung klären?',
    )[lang],
    explanation: `${row.title[lang]}. ${taskText('This is the modern sign convention shown here. Consult the edition, period, instrument and surrounding harmony for starting note, auxiliary pitch, timing and speed. Recognition does not prescribe a single realization. A slashed grace is often called acciaccatura today; the historical keyboard acciaccatura was a dissonant note struck with a principal chord and immediately released, not a universal synonym for every short grace.', 'Здесь показана современная форма знака. Начальный и вспомогательный звуки, момент вступления и скорость уточняют по редакции, эпохе, инструменту и гармонии. Единственный вариант исполнения не задан. Современный перечёркнутый форшлаг часто называют аччаккатурой; историческая клавирная аччаккатура — диссонирующий звук, взятый вместе с основным аккордом и сразу отпущенный, а не общее название любого короткого форшлага.', 'Hier ist die moderne Zeichenform gemeint. Ausgabe, Epoche, Instrument und Harmonie bestimmen Anfangs- und Nebenton, Einsatz und Geschwindigkeit. Keine einzige Ausführung wird vorgeschrieben. Der durchstrichene Vorschlag heißt heute oft Acciaccatura; die historische Tasten-Acciaccatura war ein mit dem Hauptakkord angeschlagener, sofort losgelassener dissonanter Ton, kein universelles Synonym für jeden kurzen Vorschlag.')[lang]}`,
    source: notationSources.ornaments,
  };
}

export function performanceMarks(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Built {
  const shape = pick(next, [
    'tempo',
    'dynamics',
    'articulation',
    'repeats',
    'tempo-return',
    'dynamic-context',
    'phrase',
    'tremolo',
  ]);
  if (shape === 'tremolo')
    return {
      rule: 'follow-repeat-route',
      figure: 'tremolo-two',
      review: true,
      answer: '',
      options: [],
      prompt: taskText(
        'Compare this two-note tremolo abbreviation with a written-out alternation. What information must an expansion preserve?',
        'Сравните это сокращение двухзвучного тремоло с выписанным чередованием. Какую информацию должна сохранить расшифровка?',
        'Vergleiche dieses zweitonige Tremolokürzel mit einem ausgeschriebenen Wechsel. Welche Informationen muss die Auflösung erhalten?',
      )[lang],
      explanation: taskText(
        'The strokes connect two different pitches, G4 and B4: alternate them, unlike a one-note repeated tremolo. Preserve the indicated span and the edition’s measured or unmeasured convention when expanding it; the picture alone is not a licence to invent an exact universal speed. This is an unscored abbreviation comparison, not a navigation route.',
        'Штрихи соединяют разные высоты, [[соль]] и [[си]] первой октавы: их чередуют, в отличие от повторения одного звука. При расшифровке сохраните длительность и указанный в редакции точный ритм тремоло или отсутствие точного числа повторений; рисунок не задаёт универсальной скорости. Это сравнение сокращения без оценки, а не маршрут по тактам.',
        'Die Striche verbinden zwei verschiedene Tonhöhen, g′ und h′: Sie wechseln sich ab, anders als beim Tremolo auf einem Ton. Die angegebene Zeitspanne und die gemessene oder ungemessene Konvention der Ausgabe müssen erhalten bleiben; das Bild legt kein universelles Tempo fest. Unbewerteter Vergleich einer Abbreviatur, keine Sprungfolge.',
      )[lang],
      source: notationSources.repeats,
    };
  if (['tempo-return', 'dynamic-context', 'phrase'].includes(shape)) {
    const tempo = shape === 'tempo-return';
    const dynamic = shape === 'dynamic-context';
    return {
      rule: tempo
        ? 'metronome-unit'
        : dynamic
          ? 'relative-dynamic-level'
          : 'articulation-sign',
      figure: tempo
        ? 'tempo-return'
        : dynamic
          ? pick(next, ['dynamic-fp', 'dynamic-hairpin'])
          : 'articulation-phrase',
      review: true,
      answer: '',
      options: [],
      prompt: tempo
        ? taskText(
            'Explain what a tempo and Tempo I restore in this explicitly labelled two-tempo example.',
            'Объясните, какой темп возвращают указания «в прежнем темпе» и «первоначальный темп» в этом примере с двумя явно заданными темпами.',
            'Erkläre, welches Tempo a tempo und Tempo I in diesem ausdrücklich beschrifteten Beispiel wiederherstellen.',
          )[lang]
        : dynamic
          ? taskText(
              'Compare a sustained dynamic level, fp, sfz/rfz and a hairpin. Which describes an onset and which a change over time?',
              'Сравните устойчивую динамику, fp, sfz/rfz и вилку. Что относится к началу звука, а что — к изменению во времени?',
              'Vergleiche eine anhaltende Dynamikstufe, fp, sfz/rfz und eine Gabel. Was betrifft den Einsatz, was eine Veränderung im Verlauf?',
            )[lang]
          : taskText(
              'Compare staccato, tenuto, accent, staccatissimo, the slur and the breath. What does each mark leave to the performer?',
              'Сравните стаккато, тенуто, акцент, стаккатиссимо, лигу и цезуру для дыхания. Что каждый знак оставляет на усмотрение исполнителя?',
              'Vergleiche Staccato, Tenuto, Akzent, Staccatissimo, Bogen und Atemzeichen. Was bleibt jeweils der Ausführung überlassen?',
            )[lang],
      explanation: tempo
        ? taskText(
            'In this example: Tempo I is quarter = 96; Tempo II is quarter = 72. After rit. in Tempo II, a tempo restores 72; the later Tempo I restores 96. Do not rank tempo words or assume that every return means the opening tempo. This semantic discussion is unscored, not a metronome-arithmetic result.',
            'В этом примере: первый темп — четверть = 96, второй — четверть = 72. После замедления во втором темпе указание о возврате восстанавливает 72; позднейший возврат к первому темпу — 96. Не выстраивайте темповые слова в абсолютный ряд и не считайте любой возврат возвратом к началу. Обсуждение смысла без оценки; это не метрономическая арифметика.',
            'In diesem Beispiel: Tempo I bedeutet Viertel = 96, Tempo II Viertel = 72. Nach rit. in Tempo II stellt a tempo 72 wieder her; das spätere Tempo I dagegen 96. Tempowörter bilden keine absolute Rangfolge, und nicht jede Rückkehr meint das Anfangstempo. Unbewertete Bedeutungsfrage, keine Metronomrechnung.',
          )[lang]
        : dynamic
          ? taskText(
              'The p–f hairpin asks for a gradual increase across its span. fp asks for a strong onset followed by soft continuation; sfz and rfz ask for emphasis, whose extent depends on context. They are not extra rungs of a calibrated loudness ladder. Compare the surrounding phrase and instrument; no unique gain envelope is prescribed. Unscored.',
              'Вилка от p к f требует постепенного усиления на своём протяжении. fp — сильное начало с последующим тихим продолжением; sfz и rfz — выделение, область действия которого зависит от контекста. Это не дополнительные ступени калиброванной громкости. Учтите фразу и инструмент; единственная огибающая громкости не задана. Без оценки.',
              'Die Gabel von p nach f verlangt eine allmähliche Zunahme über ihre Spanne. fp fordert einen starken Einsatz mit leiser Fortsetzung; sfz und rfz eine kontextabhängige Hervorhebung. Das sind keine zusätzlichen Stufen einer kalibrierten Lautstärkeskala. Phrase und Instrument sind zu berücksichtigen; keine eindeutige Hüllkurve ist vorgegeben. Ohne Bewertung.',
            )[lang]
          : taskText(
              'Dots and wedges indicate degrees of separation, tenuto sustaining or weighting, and an accent emphasis. A slur may indicate connected articulation or a phrase; it is not a tie between different pitches. The breath invites a break without specifying a universal number of milliseconds. Signs can coexist; instrument, style and phrase settle their realization. Unscored.',
              'Точки и клинья обозначают степени отрывистости, тенуто — выдерживание или вес, акцент — выделение. Лига может указывать связность или фразу; между разными высотами это не лига продления. Знак дыхания предлагает разделение, но не универсальную длительность в миллисекундах. Знаки могут сочетаться; исполнение зависит от инструмента, стиля и фразы. Без оценки.',
              'Punkte und Keile zeigen Abstufungen des Absetzens, Tenuto ein Aushalten oder Gewichten, der Akzent eine Betonung. Ein Bogen kann Bindung oder Phrasierung bedeuten; zwischen verschiedenen Tonhöhen ist er kein Haltebogen. Das Atemzeichen regt eine Unterbrechung ohne universelle Millisekundenzahl an. Zeichen können zusammentreffen; Instrument, Stil und Phrase bestimmen die Ausführung. Ohne Bewertung.',
            )[lang],
      source: tempo
        ? notationSources.tempo
        : dynamic
          ? notationSources.marks
          : notationSources.curves,
    };
  }
  if (shape === 'tempo') {
    const bpm = pick(next, [40, 60, 80, 120]);
    const unit = pick(next, [
      { glyph: '♩', num: 1, den: 4 },
      { glyph: '♪', num: 1, den: 8 },
      { glyph: '♩.', num: 3, den: 8 },
      { glyph: '𝅗𝅥', num: 1, den: 2 },
    ]);
    const beats = level === 1 ? 1 : pick(next, [1, 2, 4]);
    const total = `${beats * unit.num}/${unit.den}`;
    const show = (value: number) =>
      String(Number(value.toFixed(3))).replace('.', lang === 'en' ? '.' : ',');
    const seconds = (clicks: number) => (60 * clicks) / bpm;
    const answer = show(seconds(beats));
    return {
      rule: 'metronome-unit',
      prompt: taskText(
        `At ${unit.glyph} = ${bpm}, how many seconds does ${total} of a whole note last?`,
        `При ${unit.glyph} = ${bpm} сколько секунд длится ${total} целой ноты?`,
        `Wie viele Sekunden dauern ${total} einer ganzen Note bei ${unit.glyph} = ${bpm}?`,
      )[lang],
      answer,
      options: options(
        answer,
        // The three misreadings the item exists to catch, rather than round
        // numbers: reading the marked unit as a plain quarter, inverting
        // 60/bpm, and counting written values instead of clicks. The old pool
        // offered "0" in every scored item — a duration no sound can have —
        // and none of its options could be arrived at by any of these.
        [
          seconds(((beats * unit.num) / unit.den) * 4),
          (beats * bpm) / 60,
          seconds(beats * 2),
          seconds(beats / 2),
          seconds(beats * 4),
          seconds(beats + 1),
        ]
          .map(show)
          .filter(
            (label, index, all) =>
              label !== answer && all.indexOf(label) === index,
          )
          .slice(0, 3),
        next,
        'tempo-unit',
      ),
      explanation: taskText(
        `The metronome unit is ${unit.num}/${unit.den} of a whole note, not necessarily a quarter: (${total}) ÷ (${unit.num}/${unit.den}) = ${beats} clicks; ${beats} × 60 / ${bpm} = ${answer} seconds.`,
        `Единица метронома — ${unit.num}/${unit.den} целой ноты, не обязательно четверть: (${total}) ÷ (${unit.num}/${unit.den}) = ${beats}; ${beats} × 60 / ${bpm} = ${answer} с.`,
        `Die Metronomeinheit ist ${unit.num}/${unit.den} einer ganzen Note, nicht zwingend eine Viertel: (${total}) ÷ (${unit.num}/${unit.den}) = ${beats} Schläge; ${beats} × 60 / ${bpm} = ${answer} Sekunden.`,
      )[lang],
      source: notationSources.tempo,
    };
  }
  if (shape === 'dynamics') {
    const ladder = [
      'pppp',
      'ppp',
      'pp',
      'p',
      'mp',
      'mf',
      'f',
      'ff',
      'fff',
      'ffff',
    ];
    const i = 1 + Math.floor(next() * (ladder.length - 2));
    const answer = ladder[i + 1];
    return {
      rule: 'relative-dynamic-level',
      prompt: taskText(
        `Which marking asks for a louder level than ${ladder[i]} in this relative ladder?`,
        `Какое обозначение требует более громкой динамики, чем ${ladder[i]}, на этой относительной шкале?`,
        `Welche Angabe verlangt auf dieser relativen Skala eine höhere Lautstärke als ${ladder[i]}?`,
      )[lang],
      answer,
      options: options(
        answer,
        [ladder[i], ladder[i - 1]],
        next,
        'dynamic-level',
      ),
      explanation: taskText(
        'pppp → ppp → pp → p → mp → mf → f → ff → fff → ffff. These are relative instructions, not calibrated sound-pressure values.',
        'pppp → ppp → pp → p → mp → mf → f → ff → fff → ffff. Это относительные указания, а не фиксированные уровни звукового давления.',
        'pppp → ppp → pp → p → mp → mf → f → ff → fff → ffff. Dies sind relative Angaben, keine festgelegten Schalldruckpegel.',
      )[lang],
      source: notationSources.marks,
    };
  }
  if (shape === 'articulation') {
    const detached = next() < 0.5;
    const labels = taskText(
      'Detached notes|Held notes',
      'Отрывистые звуки|Выдержанные звуки',
      'Abgesetzte Töne|Ausgehaltene Töne',
    )[lang].split('|');
    const answer = labels[detached ? 0 : 1];
    return {
      rule: 'articulation-sign',
      figure: detached ? 'detached' : 'tenuto',
      prompt: taskText(
        'Which broad instruction does this mark convey in modern notation?',
        'Какое общее указание передаёт этот знак в современной нотации?',
        'Welche allgemeine Spielanweisung vermittelt dieses Zeichen in moderner Notation?',
      )[lang],
      answer,
      options: options(answer, labels, next, 'articulation-meaning'),
      explanation: taskText(
        'A dot asks for separation; a tenuto line asks that the note be held. Exact length and emphasis depend on context and instrument.',
        'Точка указывает на отрывистое исполнение; черта тенуто — на выдерживание звука. Точная длительность и акцент зависят от контекста и инструмента.',
        'Der Punkt verlangt abgesetztes Spiel, der Tenutostrich ein Aushalten des Tons. Genaue Länge und Gewichtung hängen von Kontext und Instrument ab.',
      )[lang],
      source: notationSources.marks,
    };
  }
  const route = pick(next, [
    {
      figure: 'repeat-volta',
      answer: '1–2–1–3',
      wrong: ['1–2–3', '1–2–1–2–3'],
      convention: taskText(
        'Take ending 1 on pass 1 and ending 2 on pass 2, then stop.',
        'Первое проведение — первая вольта, второе — вторая; затем остановитесь.',
        'Erster Durchgang: Klammer 1; zweiter: Klammer 2, dann Schluss.',
      ),
    },
    {
      figure: 'repeat-implicit',
      answer: '1–2–1–2',
      wrong: ['1–2', '1–2–2'],
      convention: taskText(
        'The closing repeat has no opening sign: return to the beginning once, then stop after measure 2.',
        'У закрывающего знака репризы нет открывающего: один раз вернитесь к началу, затем остановитесь после такта 2.',
        'Ohne öffnendes Wiederholungszeichen einmal zum Anfang zurück; danach nach Takt 2 enden.',
      ),
    },
    {
      figure: 'repeat-dc-fine',
      answer: '1–2–3–1–2',
      wrong: ['1–2', '1–2–3–1–2–3'],
      convention: taskText(
        'Ignore Fine on the first pass. D.C. returns to measure 1; on this return stop at Fine after measure 2.',
        'В первом проведении пройдите мимо конца, отмеченного в такте 2. Возврат к началу из такта 3 выполняется один раз; после возврата остановитесь в конце такта 2.',
        'Fine im ersten Durchgang übergehen. D.C. führt zu Takt 1; bei dieser Rückkehr nach Takt 2 am Fine enden.',
      ),
    },
    {
      figure: 'repeat-ds-coda',
      answer: '1–2–3–4–2–3–5',
      wrong: ['1–2–3–5', '1–2–3–4–1–2–3–5'],
      convention: taskText(
        'Ignore To Coda on pass 1. D.S. returns to the segno at 2 once; then transfer after 3 to coda 5 and stop. Do not visit 4 again.',
        'При первом проведении не переходите к коде. Из такта 4 вернитесь к знаку в такте 2 один раз; после такта 3 перейдите в коду 5 и остановитесь. Повторно такт 4 не играйте.',
        'To Coda zunächst übergehen. D.S. führt einmal zum Segno in 2; danach nach 3 zur Coda 5 springen und enden. Takt 4 nicht erneut spielen.',
      ),
    },
    {
      figure: 'repeat-abbreviation',
      answer: '1–1–3',
      wrong: ['1–3', '1–2–1–3'],
      convention: taskText(
        'Give the source measure for each written bar. The percent sign in bar 2 repeats bar 1; bar 3 is the written-out comparison, played once. It is not a backward navigation sign.',
        'Укажите такт-источник для каждого записанного такта. Знак в такте 2 повторяет содержание такта 1; такт 3 — выписанное сравнение, исполняемое один раз. Это не знак возврата.',
        'Gib den Quelltakt für jeden notierten Takt an. Das Prozentzeichen in 2 wiederholt den Inhalt von 1; Takt 3 ist der ausgeschriebene Vergleich, einmal gespielt. Kein Rücksprungzeichen.',
      ),
    },
  ]);
  const answer = route.answer;
  return {
    rule: 'follow-repeat-route',
    figure: route.figure,
    prompt: `${taskText('Read the notated example. Give the measure sequence under this convention:', 'Прочитайте нотный пример. Укажите порядок тактов при следующем условии:', 'Lies das Notenbeispiel. Gib die Taktfolge nach dieser Konvention an:')[lang]} ${route.convention[lang]}`,
    answer,
    options: options(answer, route.wrong, next, 'repeat-route'),
    explanation: `${route.convention[lang]} ${answer}.`,
    source: notationSources.repeats,
  };
}

export function shortExcerpt(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Built {
  if (level > 1) return contextualExcerpt(next, level, lang);
  // Level 1 only: every higher level returned above. The clef list and the
  // widened step range that used to be written here as level ternaries were
  // unreachable, and said in source that bass, alto and tenor excerpts already
  // existed when they did not. `pick` is kept so the draw count — and so every
  // item after this one — is unchanged.
  const clef = pick(next, ['treble'] as const);
  const pitches = Array.from({ length: 4 }, () =>
    pitchAtStep(Math.floor(next() * 9), clef),
  );
  const parts = pitches.map((pitch, index) => {
    const answer = pitchLabel(pitch, lang);
    const step = pitch.letter + 7 * pitch.octave;
    const wrong = pitchAtStep(0, clef);
    const baseline = wrong.letter + 7 * wrong.octave;
    return {
      kind: 'pitch' as const,
      prompt: taskText(
        `Note ${index + 1}`,
        `Нота ${index + 1}`,
        `Note ${index + 1}`,
      )[lang],
      answer,
      options: options(
        answer,
        [-1, 1, 2].map((offset) =>
          pitchLabel(pitchAtStep(step - baseline + offset, clef), lang),
        ),
        next,
        'wrong-letter',
      ),
    };
  });
  return {
    rule: 'read-a-short-excerpt',
    prompt: taskText(
      'Read this 4/4 bar, one quarter note at a time. Each note earns its own result.',
      'Прочитайте этот такт 4/4 по одной четверти. Результат учитывается отдельно для каждой ноты.',
      'Lies diesen 4/4-Takt Viertelnote für Viertelnote. Jede Note erhält eine eigene Rückmeldung.',
    )[lang],
    staff: { clef, pitches, barlines: [3] },
    parts,
    answer: parts[0].answer,
    options: parts[0].options,
    source: notationSources.pitch,
  };
}

const writtenPitch = (letter: number, octave: number): SpelledPitch => ({
  letter,
  octave,
  accidental: 0,
  midi: (octave + 1) * 12 + [0, 2, 4, 5, 7, 9, 11][letter],
});

export function accidentalContext(
  next: () => number,
  _level: Level,
  lang: MusicLanguage,
): Built {
  const f4 = writtenPitch(3, 4);
  const b4 = writtenPitch(6, 4);
  const scenarios = [
    {
      figure: 'accidental-signature-reset',
      signature: 1,
      events: [
        { pitch: f4, measure: 1, accidental: 0 },
        { pitch: f4, measure: 2, accidental: null },
      ],
      targets: [1],
      stops: true,
    },
    {
      figure: 'accidental-tie-scope',
      signature: 1,
      events: [
        { pitch: f4, measure: 1, accidental: 0 },
        { pitch: f4, measure: 2, accidental: null, tieFromPrevious: true },
        { pitch: f4, measure: 2, accidental: null },
      ],
      targets: [1, 2],
      stops: true,
    },
    {
      figure: 'accidental-octave-scope',
      signature: 1,
      events: [
        { pitch: f4, measure: 1, accidental: 0 },
        { pitch: writtenPitch(3, 5), measure: 1, accidental: null },
        { pitch: f4, measure: 1, accidental: null },
      ],
      targets: [1, 2],
      stops: false,
    },
    {
      figure: 'accidental-replacement',
      signature: 0,
      events: [
        { pitch: f4, measure: 1, accidental: 2 },
        { pitch: f4, measure: 1, accidental: 1 },
        { pitch: f4, measure: 1, accidental: null },
      ],
      targets: [1, 2],
      stops: false,
    },
    {
      figure: 'accidental-natural',
      signature: -1,
      events: [
        { pitch: b4, measure: 1, accidental: null },
        { pitch: b4, measure: 1, accidental: 0 },
        { pitch: b4, measure: 1, accidental: null },
      ],
      targets: [1, 2],
      stops: false,
    },
  ];
  const scenario = pick(next, scenarios);
  const index = pick(next, scenario.targets);
  const resolved = resolveAccidentalSequence(
    scenario.events,
    scenario.signature,
  );
  const pitch = resolved[index];
  const answer = pitchLabel(pitch, lang);
  // The two distractors that are a named mistake rather than a wrong sign: the
  // pitch the signature alone would give, and the pitch held over from the
  // previous event on the same letter and octave.
  const spelling = (accidental: number) =>
    pitchLabel(
      {
        ...pitch,
        accidental,
        midi: pitch.midi - pitch.accidental + accidental,
      },
      lang,
    );
  const signatureReading = spelling(
    signature(scenario.signature).find((sign) => sign.letter === pitch.letter)
      ?.accidental ?? 0,
  );
  const previous = resolved[index - 1];
  const carriedOver =
    previous &&
    previous.letter === pitch.letter &&
    previous.octave === pitch.octave
      ? spelling(previous.accidental)
      : null;
  return {
    rule: scenario.stops
      ? 'sign-stops-at-the-barline'
      : 'sign-holds-to-the-barline',
    figure: scenario.figure,
    prompt: taskText(
      `Name written event ${index + 1} as it sounds, retaining its letter and octave. Use this single-voice modern convention: the signature applies in every octave; a local sign replaces it only at the same letter and octave within the bar; ties carry the previous pitch without establishing a new-bar local sign.`,
      `Назовите звучащую высоту события ${index + 1}, сохранив написание и октаву. Условие для одного голоса: ключевые знаки действуют во всех октавах; случайный знак заменяет их только на той же ступени в той же октаве до конца такта; лига продлевает прежнюю высоту, не устанавливая случайный знак в новом такте.`,
      `Benenne Ereignis ${index + 1} in seiner klingenden Höhe mit notiertem Stammton und Register. Einstimmige moderne Konvention: Vorzeichen der Tonart gelten in allen Oktaven; ein Versetzungszeichen ersetzt sie nur für denselben Stammton in derselben Oktave im Takt; eine Bindung setzt den alten Ton fort, ohne ein Versetzungszeichen im neuen Takt zu etablieren.`,
    )[lang],
    answer,
    options: options(
      answer,
      [-2, -1, 0, 1, 2]
        .filter((a) => a !== pitch.accidental)
        .map((accidental) =>
          pitchLabel(
            {
              ...pitch,
              accidental,
              midi: pitch.midi - pitch.accidental + accidental,
            },
            lang,
          ),
        ),
      next,
      // Every distractor used to be answered with "that is the note without
      // its sign", which is true of exactly one of them: a double sharp is
      // emphatically not the note with its sign ignored. Name the mistake the
      // reader actually made — the signature reading, the pitch carried past
      // the barline, or simply the wrong alteration.
      (label) =>
        label === signatureReading
          ? 'ignored-the-sign'
          : scenario.stops && label === carriedOver
            ? 'carried-the-sign-too-far'
            : 'wrong-alteration',
    ),
    explanation: taskText(
      `Event ${index + 1}: ${answer}. A natural or a single accidental replaces, never adds to, a signature or double accidental. Local scope does not jump octaves. At a barline the signature resumes for fresh attacks; only the actual tied continuation retains the old sound. These rule labels describe the stated convention, not every historical accidental practice.`,
      `Событие ${index + 1}: ${answer}. Бекар или одиночный знак заменяет, а не суммирует ключевой или двойной знак. Случайный знак не переносится в другую октаву. После тактовой черты новые атаки подчиняются ключевым знакам; лишь связанное продолжение сохраняет прежнюю высоту. Правило относится к данному условию, не ко всем историческим практикам.`,
      `Ereignis ${index + 1}: ${answer}. Auflösungszeichen oder einfaches Versetzungszeichen ersetzen Tonart- oder Doppelvorzeichen, statt sich zu addieren. Lokale Geltung springt nicht in andere Oktaven. Nach dem Taktstrich gilt für neue Anschläge die Tonart; nur die gebundene Fortsetzung behält den alten Ton. Dies bezeichnet die genannte Konvention, nicht jede historische Praxis.`,
    )[lang],
    source: notationSources.accidentals,
  };
}

export function tupletContext(
  next: () => number,
  _level: Level,
  lang: MusicLanguage,
): Built {
  const thirteen = next() < 0.4;
  const target = thirteen
    ? 'thirteen'
    : pick(next, ['rest', 'subdivision', 'tied', 'group'] as const);
  const answer = {
    thirteen: '3/4',
    rest: '1/12',
    subdivision: '1/24',
    tied: '1/6',
    group: '1/4',
  }[target];
  const subject = {
    thirteen: taskText(
      'the entire 13:12 group of sixteenths',
      'вся группа шестнадцатых 13:12',
      'die gesamte 13:12-Sechzehntelgruppe',
    ),
    rest: taskText(
      'the eighth rest inside the first 3:2 group',
      'восьмая пауза внутри первой группы 3:2',
      'die Achtelpause in der ersten 3:2-Gruppe',
    ),
    subdivision: taskText(
      'one sixteenth in the second 3:2 group',
      'одна шестнадцатая во второй группе 3:2',
      'eine Sechzehntel in der zweiten 3:2-Gruppe',
    ),
    tied: taskText(
      'the tied pair of eighths in the second 3:2 group',
      'связанная пара восьмых во второй группе 3:2',
      'das gebundene Achtelpaar in der zweiten 3:2-Gruppe',
    ),
    group: taskText(
      'the entire first mixed 3:2 group',
      'вся первая смешанная группа 3:2',
      'die gesamte erste gemischte 3:2-Gruppe',
    ),
  }[target];
  return {
    rule: 'irregular-group-written-value',
    figure: thirteen ? 'tuplet-13-12' : 'tuplet-mixed',
    prompt: taskText(
      `What duration, as a fraction of a whole note, does ${subject.en} occupy? Apply the printed ratio to notes and rests, including subdivisions.`,
      `Какую долю целой ноты занимает ${subject.ru}? Примените указанное отношение к нотам, паузам и более мелким делениям.`,
      `Welchen Anteil einer ganzen Note umfasst ${subject.de}? Wende das gedruckte Verhältnis auf Noten, Pausen und Unterteilungen an.`,
    )[lang],
    answer,
    options: options(
      answer,
      ['3/4', '13/16', '1/4', '1/6', '1/8', '1/12', '1/24']
        .filter((x) => x !== answer)
        .slice(0, 4),
      next,
      'counted-the-written-value',
    ),
    explanation: thirteen
      ? taskText(
          '13 × 1/16 × 12/13 = 3/4. This example explicitly uses 13:12, not an inferred 13:8 convention.',
          '13 × 1/16 × 12/13 = 3/4. Здесь явно указано 13:12, а не предполагаемое отношение 13:8.',
          '13 × 1/16 × 12/13 = 3/4. Hier steht ausdrücklich 13:12, nicht ein vermutetes 13:8.',
        )[lang]
      : taskText(
          'Scale every written value by 2/3. First group: (1/4 + 1/8) × 2/3 = 1/4, including the rest. Second: (1/16 + 1/16 + 1/8 + 1/8) × 2/3 = 1/4. Each sixteenth lasts 1/24; the tied eighth pair sounds for 1/6 with one attack. A tuplet need not contain equal noteheads or only notes.',
          'Умножьте каждую записанную длительность на 2/3. Первая группа: (1/4 + 1/8) × 2/3 = 1/4, включая паузу. Вторая: (1/16 + 1/16 + 1/8 + 1/8) × 2/3 = 1/4. Шестнадцатая длится 1/24, связанная пара восьмых — 1/6 с одной атакой. В особой группе допустимы разные длительности и паузы.',
          'Multipliziere jeden notierten Wert mit 2/3. Erste Gruppe: (1/4 + 1/8) × 2/3 = 1/4 einschließlich Pause. Zweite: (1/16 + 1/16 + 1/8 + 1/8) × 2/3 = 1/4. Eine Sechzehntel dauert 1/24, das gebundene Achtelpaar 1/6 mit einem Anschlag. Eine N-tole darf ungleiche Notenwerte und Pausen enthalten.',
        )[lang],
    source: notationSources.tuplets,
  };
}

function contextualExcerpt(
  next: () => number,
  level: Level,
  lang: MusicLanguage,
): Built {
  const crossBar = level === 3 && next() < 0.5;
  const events = crossBar
    ? [
        { letter: 6, octave: 3, measure: 1, accidental: -1, duration: '1/4' },
        { letter: null, duration: '1/8' },
        { letter: 4, octave: 3, measure: 1, accidental: null, duration: '3/8' },
        {
          letter: 4,
          octave: 3,
          measure: 2,
          accidental: null,
          duration: '1/4',
          tieFromPrevious: true,
        },
        { letter: 6, octave: 3, measure: 2, accidental: null, duration: '1/8' },
        { letter: null, duration: '1/8' },
        { letter: 0, octave: 4, measure: 2, accidental: null, duration: '1/4' },
      ]
    : [
        { letter: 0, octave: 4, measure: 1, accidental: null, duration: '3/8' },
        { letter: null, duration: '1/8' },
        { letter: 3, octave: 4, measure: 1, accidental: 1, duration: '1/8' },
        {
          letter: 3,
          octave: 4,
          measure: 1,
          accidental: null,
          duration: '1/8',
          tieFromPrevious: true,
        },
        { letter: 3, octave: 4, measure: 1, accidental: 0, duration: '1/4' },
      ];
  const pitches = resolveAccidentalSequence(
    events.flatMap((event) =>
      event.letter === null
        ? []
        : [
            {
              pitch: writtenPitch(event.letter, event.octave),
              measure: event.measure,
              accidental: event.accidental,
              tieFromPrevious: event.tieFromPrevious,
            },
          ],
    ),
    0,
  );
  const parts: NonNullable<Item['parts']> = [];
  let pitchIndex = 0;
  events.forEach((event, index) => {
    if (event.letter !== null) {
      const pitch = pitches[pitchIndex++];
      const answer = pitchLabel(pitch, lang);
      const octaveAbove = pitchLabel(
        { ...pitch, octave: pitch.octave + 1, midi: pitch.midi + 12 },
        lang,
      );
      parts.push({
        kind: 'pitch',
        prompt: taskText(
          `Event ${index + 1} · pitch`,
          `Событие ${index + 1} · высота`,
          `Ereignis ${index + 1} · Tonhöhe`,
        )[lang],
        answer,
        options: options(
          answer,
          [-1, 0, 1]
            .filter((a) => a !== pitch.accidental)
            .map((accidental) =>
              pitchLabel(
                {
                  ...pitch,
                  accidental,
                  midi: pitch.midi - pitch.accidental + accidental,
                },
                lang,
              ),
            )
            .concat(octaveAbove),
          next,
          // The octave option is not a wrong alteration: its step and its sign
          // are both right and only the register is wrong, which is exactly
          // what `neighbour-register` says and `wrong-alteration` denies.
          (label) =>
            label === octaveAbove ? 'neighbour-register' : 'wrong-alteration',
        ),
        explanation: taskText(
          `${answer}: keep the written letter and register. ${event.tieFromPrevious ? 'This is a tied continuation of the previous pitch, not a new attack.' : 'Apply explicit accidentals at this register; after a barline a fresh attack returns to the signature (none here).'} A correct rhythm cannot cancel a pitch-reading error.`,
          `${answer}: сохраните записанную ступень и октаву. ${event.tieFromPrevious ? 'Это связанное продолжение прежней высоты, а не новая атака.' : 'Учтите явные знаки в этой октаве; после тактовой черты новая атака подчиняется ключевым знакам (знаков здесь нет).'} Правильный ритм не отменяет ошибки высоты.`,
          `${answer}: Stammton und Register beibehalten. ${event.tieFromPrevious ? 'Gebundene Fortsetzung des vorigen Tons, kein neuer Anschlag.' : 'Explizite Zeichen in diesem Register beachten; nach dem Taktstrich gilt beim Neuanschlag wieder die Tonart (hier ohne Vorzeichen).'} Ein richtiger Rhythmus gleicht keinen Tonhöhenfehler aus.`,
        )[lang],
      });
    }
    parts.push({
      kind: 'rhythm',
      prompt: taskText(
        `Event ${index + 1} · written duration (fraction of a whole note)`,
        `Событие ${index + 1} · записанная длительность (доля целой)`,
        `Ereignis ${index + 1} · notierter Wert (Anteil einer ganzen Note)`,
      )[lang],
      answer: event.duration,
      options: options(
        event.duration,
        ['1/8', '1/4', '3/8', '1/2'],
        next,
        'duration-symbol',
      ),
      explanation: taskText(
        `${event.duration} of a whole note. ${event.letter === null ? 'This is silence, but it still occupies measured time.' : event.tieFromPrevious ? 'Count this written segment in its own bar; the tie continues the sound without another attack.' : 'Count the written value including any dot; a following tie joins durations, not extra attacks.'} Rhythm is assessed separately from pitch.`,
        `${event.duration} целой ноты. ${event.letter === null ? 'Это тишина, но она занимает измеряемое время.' : event.tieFromPrevious ? 'Считайте этот записанный отрезок в своём такте; лига продолжает звук без новой атаки.' : 'Учтите записанную длительность и точку; последующая лига складывает время, а не атаки.'} Ритм оценивается отдельно от высоты.`,
        `${event.duration} einer ganzen Note. ${event.letter === null ? 'Stille beansprucht ebenfalls gemessene Zeit.' : event.tieFromPrevious ? 'Diesen notierten Abschnitt in seinem eigenen Takt zählen; der Bogen setzt den Ton ohne neuen Anschlag fort.' : 'Den Wert samt Punkt zählen; ein folgender Haltebogen addiert Dauern, keine Anschläge.'} Rhythmus wird getrennt von Tonhöhe beurteilt.`,
      )[lang],
    });
  });
  return {
    rule: 'read-a-short-excerpt',
    figure: crossBar ? 'excerpt-cross-bar' : 'excerpt-mixed',
    prompt: taskText(
      'Read each event from left to right, including rests and tied continuations. Name sounding pitches with their written spelling; give each written duration separately. Pitch and rhythm receive independent feedback.',
      'Прочитайте события слева направо, включая паузы и связанные продолжения. Назовите звучащие высоты с сохранением написания; отдельно укажите каждую записанную длительность. Высота и ритм получают независимую обратную связь.',
      'Lies jedes Ereignis von links nach rechts, einschließlich Pausen und gebundener Fortsetzungen. Benenne klingende Tonhöhen mit ihrer Schreibweise und jeden notierten Wert einzeln. Tonhöhe und Rhythmus erhalten getrennte Rückmeldungen.',
    )[lang],
    parts,
    answer: parts[0].answer,
    options: parts[0].options,
    source: notationSources.ties,
  };
}
