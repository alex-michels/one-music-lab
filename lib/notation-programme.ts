import { nt, notationSources } from './notation-tasks';
import type { LocalText } from './i18n';

const lilySource = (section: string, path: string) => ({
  title: `LilyPond 2.24 · ${section}`,
  url: `https://lilypond.org/doc/v2.24/Documentation/${path}`,
});
export const notationContentSources = {
  rhythm: lilySource(
    'Notation Reference §1.2.1 · Durations, Tuplets, Ties',
    'notation/writing-rhythms',
  ),
  rests: lilySource(
    'Notation Reference §1.2.2 · Rests / Full measure rests',
    'notation/writing-rests',
  ),
  durationNames: lilySource(
    'Music Glossary §2 · Duration names, notes and rests',
    'music-glossary/duration-names-notes-and-rests',
  ),
  multirests: lilySource(
    'Music Glossary · Multi-measure rest',
    'music-glossary/multi_002dmeasure-rest',
  ),
  keyboards: lilySource(
    'Notation Reference §2.2.1 · References for keyboards',
    'notation/common-notation-for-keyboards#references-for-keyboards',
  ),
  pitches: lilySource(
    'Notation Reference §1.1.3 · Clef / Key signature / Ottava / Automatic accidentals',
    'notation/displaying-pitches',
  ),
  stems: lilySource(
    'Notation Reference §1.7.1 · Stems',
    'notation/inside-the-staff#stems',
  ),
  chords: lilySource(
    'Notation Reference §2.7.2 · Printing and customizing chord names',
    'notation/displaying-chords',
  ),
  grace: lilySource(
    'Notation Reference §1.2.6 · Grace notes / afterGrace',
    'notation/special-rhythmic-concerns#grace-notes',
  ),
  arpeggio: lilySource(
    'Notation Reference §1.3.3 · Arpeggio',
    'notation/expressive-marks-as-lines#arpeggio',
  ),
  acciaccatura: lilySource(
    'Music Glossary · Acciaccatura',
    'music-glossary/acciaccatura',
  ),
  instruments: {
    title: 'Lehrklänge · Grundlagen · Notenschlüssel · Instrument examples',
    url: 'https://www.lehrklaenge.de/PHP/Grundlagen/Notenschluessel.php',
  },
  bassoon: {
    title: 'Vienna Symphonic Library Academy · Bassoon · Notation',
    url: 'https://www.vsl.co.at/academy/woodwinds/bassoon',
  },
  trombone: {
    title: 'Vienna Symphonic Library Academy · Tenor trombone · Notation',
    url: 'https://www.vsl.co.at/academy/brass/tenor-trombone',
  },
  expression: {
    title:
      'Dolmetsch Online · Music Theory §21 · Tables of Dynamic and General Musical Markings',
    url: 'https://www.dolmetsch.com/musictheory21.htm',
  },
  mancando: {
    title: 'Dolmetsch Online · Music Dictionary M–Ma · mancando',
    url: 'https://www.dolmetsch.com/defsm.htm',
  },
  tumultuoso: {
    title: 'Dolmetsch Online · Music Dictionary Ts–Tz · tumultuoso',
    url: 'https://www.dolmetsch.com/defst5.htm',
  },
  graphicHistory: {
    title:
      'Zach Gist / Chelsey Hamm · Open Music Theory 2 · Graphic Notation and Scores · A Brief History / Measuring Time and Hybrid Scores (chapter in development)',
    url: 'https://viva.pressbooks.pub/openmusictheory/chapter/graphic-notation-and-scores/',
  },
  ornamentNames: {
    title:
      'Lehrklänge · Lexikon · Verzierungen · Praller, Mordent, Doppelschlag, Schleifer, Arpeggio, Acciaccatura',
    url: 'https://www.lehrklaenge.de/PHP/Lexikon/Verzierungen.php',
  },
  articulation: {
    title:
      'Lehrklänge · Lexikon · Artikulation · Note connection and separation',
    url: 'https://www.lehrklaenge.de/PHP/Lexikon/Artikulation.php',
  },
  staff: {
    title: 'Lehrklänge · Grundlagen · Das Notensystem',
    url: 'https://www.lehrklaenge.de/PHP/Grundlagen/Notensystem.php',
  },
  names: {
    title:
      'Lehrklänge · Grundlagen · Noten lesen · Repeated names and octave designation',
    url: 'https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php',
  },
  frequencies: {
    title:
      'Joe Wolfe · UNSW · Note names, MIDI numbers and frequencies · 12-TET and A4 = 440 Hz',
    url: 'https://newt.phys.unsw.edu.au/jw/notes.html',
  },
} as const;

/** Sources are selected by claim area, not inferred from a textbook's table of contents. */
export const notationTopicSources: Record<
  string,
  { title: string; url: string }
> = {
  'note-names': notationContentSources.names,
  staff: notationContentSources.staff,
  clefs: notationContentSources.pitches,
  'accidental-signs': notationContentSources.pitches,
  'accidental-scope': notationContentSources.pitches,
  enharmonics: notationSources.names,
  durations: notationContentSources.rhythm,
  'dots-ties': notationContentSources.rhythm,
  'beat-division': notationContentSources.rhythm,
  tempo: notationSources.terms,
  dynamics: notationSources.marks,
  articulation: notationContentSources.articulation,
  repeats: notationSources.repeats,
};

export const notationTermSources: Record<
  string,
  { title: string; url: string }
> = {
  Stem: notationContentSources.stems,
  System: notationContentSources.keyboards,
  Brace: notationContentSources.keyboards,
  Rest: notationContentSources.rests,
  'Whole-bar rest': notationContentSources.rests,
  'Dotted rest': notationContentSources.rests,
  Slur: notationSources.curves,
  phrasing: notationSources.curves,
  Beam: notationSources.beams,
  Grouping: notationSources.beams,
  portato: notationSources.ornaments,
  tenuto: notationSources.ornaments,
  staccatissimo: notationSources.ornaments,
  'Octave notation': notationSources.names,
  'Middle C': notationContentSources.frequencies,
  Semitone: notationContentSources.frequencies,
  'Whole tone': notationContentSources.frequencies,
};

/** The programme implements these permanent roadmap topics; it does not renumber them. */
export const notationProgramme = {
  'note-names': {
    tasks: ['003'],
    module: 'F01',
    pages: '2–3',
    source: notationSources.names,
    text: nt(
      'Read octave names at the written C boundary. In English, B♯3 and C4 may sound alike in 12-TET but keep different written octave numbers. The standard 88-key piano extends from A0 to C8; an instrument’s compass is not a universal limit of music.',
      'Границу записанной октавы проводят по до. Си-диез малой октавы и до первой могут совпадать по высоте в равномерном строе, сохраняя разные обозначения октав. Диапазон обычного 88-клавишного фортепиано: от ля субконтроктавы до до пятой октавы; это не универсальные границы музыки.',
      'Die geschriebene Oktave beginnt jeweils bei c. his und c′ können in gleichstufiger Stimmung gleich klingen, behalten aber verschiedene Oktavbezeichnungen. H bezeichnet den Stammton, B dessen Erniedrigung. Der übliche Flügel mit 88 Tasten reicht von A₂ bis c⁵; sein Tonumfang ist keine allgemeine Grenze der Musik.',
    ),
    figures: [],
  },
  staff: {
    tasks: ['012'],
    module: 'F03',
    pages: '1, 4–6',
    source: notationSources.pitch,
    text: nt(
      'Count five lines from the bottom, with four spaces between them. Ledger lines continue the same alternation. Read successive events from left to right; aligned notes in different voices share an onset. In the placement exercise, move one staff step at a time before naming the result.',
      'Пять линеек считают снизу; между ними четыре промежутка. Добавочные линейки продолжают тот же порядок. Последовательность читают слева направо; вертикальное совмещение нот разных голосов показывает общее время вступления. В упражнении на постановку перемещайтесь по одной позиции стана и называйте результат.',
      'Die fünf Linien werden von unten gezählt; dazwischen liegen vier Zwischenräume. Hilfslinien setzen diese Folge fort. Zeitlich aufeinanderfolgende Ereignisse liest man von links nach rechts; senkrecht ausgerichtete Noten verschiedener Stimmen haben denselben Einsatz. Bewege die Note in der Setzübung jeweils um eine Linien- oder Zwischenraumposition.',
    ),
    figures: [],
  },
  clefs: {
    tasks: ['013'],
    module: 'F03',
    pages: '3–6',
    source: notationSources.accidentals,
    text: nt(
      'Treble: G4 on line 2; bass: F3 on line 4; alto: C4 on line 3; tenor: C4 on line 4. Viola commonly uses alto clef; cello, bassoon and trombone can use tenor clef for higher passages. An 8 below a clef lowers its sounding octave. An 8va bracket shifts one octave, a 15ma bracket two; follow its printed span.',
      'Скрипичный ключ указывает соль первой октавы на второй линейке; басовый — фа малой на четвёртой; альтовый — до первой на третьей; теноровый — до первой на четвёртой. Альт обычно читает альтовый ключ; виолончель, фагот и тромбон используют также теноровый. Восьмёрка под ключом понижает звучание на октаву. Пунктир 8va переносит на октаву, 15ma — на две, в пределах указанного участка.',
      'Violinschlüssel: g′ auf Linie 2; Bassschlüssel: f auf Linie 4; Altschlüssel: c′ auf Linie 3; Tenorschlüssel: c′ auf Linie 4. Die Bratsche verwendet meist den Altschlüssel; Violoncello, Fagott und Posaune verwenden in höherer Lage auch den Tenorschlüssel. Eine 8 unter dem Schlüssel senkt die klingende Oktave. Eine 8va-Linie oktaviert um eine Oktave, 15ma um zwei; beachte ihren Geltungsbereich.',
    ),
    figures: ['grand-staff', 'organ-staves'],
  },
  'accidental-signs': {
    tasks: ['014'],
    module: 'F03',
    pages: '6–9',
    source: notationSources.accidentals,
    text: nt(
      'Read each accidental relative to the natural letter, not relative to the last accidental. After a double sharp, a single sharp means one semitone above the natural. Align the sign with the notehead; do not draw a ledger line through the sign. Examples: F–F♯–F𝄪; B–B♭–B𝄫.',
      'Каждый знак отсчитывают от основной ступени, а не от предыдущего знака. После дубль-диеза диез означает повышение основной ступени на полутон. Знак ставят на высоте головки; добавочная линейка через знак не проходит. Например: фа — фа-диез — фа-дубль-диез; си — си-бемоль — си-дубль-бемоль.',
      'Jedes Zeichen bezieht sich auf den Stammton, nicht auf das vorherige Zeichen. Nach einem Doppelkreuz bedeutet ein Kreuz einen Halbton über dem Stammton. Das Zeichen steht auf Höhe des Notenkopfs; Hilfslinien werden nicht durch das Zeichen gezogen. Beispiele: F–Fis–Fisis; H–B–Heses; E–Es und A–As.',
    ),
    figures: [],
  },
  'accidental-scope': {
    tasks: ['014'],
    module: 'F03',
    pages: '6–9',
    source: notationSources.accidentals,
    text: nt(
      'Common-practice signature order is F C G D A E B for sharps and B E A D G C F for flats. Standard signatures use single signs. A local sign replaces the signature for that written pitch within the bar; a tied continuation preserves it across the barline. A later untied note again follows the signature. Editions may print reminders or declare different conventions.',
      'Обычный порядок ключевых диезов: фа, до, соль, ре, ля, ми, си; бемолей: си, ми, ля, ре, соль, до, фа. В стандартных ключевых знаках нет двойных альтераций. Случайный знак заменяет ключевой для данной ноты в данной октаве до конца такта; связанная продолжением нота сохраняет его за чертой. Следующая незалигованная нота снова подчиняется ключевым знакам. Редакции могут давать напоминания или оговаривать другие правила.',
      'Übliche Reihenfolge der Kreuze: F C G D A E H; der Be: H E A D G C F. Reguläre Vorzeichnungen enthalten keine Doppelzeichen. Ein Versetzungszeichen ersetzt das Vorzeichen für diese Tonhöhe bis zum Taktende; eine übergebundene Fortsetzung behält es über den Taktstrich hinaus. Eine spätere, neu angeschlagene Note folgt wieder der Vorzeichnung. Ausgaben können Erinnerungszeichen oder ausdrücklich andere Regeln verwenden.',
    ),
    figures: [
      'signature-bass',
      'accidental-tie-scope',
      'accidental-octave-scope',
    ],
  },
  enharmonics: {
    tasks: ['014'],
    module: 'F03',
    pages: '10',
    source: notationSources.names,
    text: nt(
      'A sounding key alone cannot select a spelling. In 12-TET, C–D♯ is an augmented second, while C–E♭ is a minor third. The letters and harmonic context decide the written interval. Neither a sharp nor a flat universally dictates the direction of the next note.',
      'По одной звучащей клавише нельзя выбрать запись. В равномерном строе до — ре-диез образуют увеличенную секунду, а до — ми-бемоль — малую терцию. Записанный интервал определяется ступенями и гармоническим контекстом. Диез или бемоль сами по себе не предписывают направление следующей ноты.',
      'Die klingende Taste allein bestimmt die Schreibweise nicht. In gleichstufiger Stimmung ist C–Dis eine übermäßige Sekunde, C–Es eine kleine Terz. Buchstaben und harmonischer Zusammenhang bestimmen das notierte Intervall. Ein Kreuz oder Be schreibt nicht allgemein die Richtung des folgenden Tons vor.',
    ),
    figures: [],
  },
  durations: {
    tasks: ['017'],
    module: 'F04',
    pages: '11–13, 17',
    source: notationSources.rhythm,
    text: nt(
      'Read the halving chain through the 128th. Every additional flag or beam halves a filled note’s value. Rests have corresponding values; a whole-bar rest instead fills the stated meter. In 3/4 it lasts three quarters; in 6/8, six eighths. A multi-measure rest carries the number of complete bars. English pairs include whole/semibreve, half/minim, quarter/crotchet and eighth/quaver.',
      'Читайте последовательное деление длительностей пополам вплоть до сто двадцать восьмой. Каждый дополнительный флажок или ребро вдвое сокращает длительность закрашенной ноты. Паузам соответствуют те же значения; тактовая пауза заполняет весь указанный такт: три четверти в 3/4, шесть восьмых в 6/8. Число над многотактовой паузой обозначает количество целых тактов.',
      'Lies die Halbierungsfolge bis zur Hundertachtundzwanzigstelnote. Jedes zusätzliche Fähnchen oder jeder weitere Balken halbiert den Wert einer ausgefüllten Note. Pausen haben entsprechende Werte; die Ganztaktpause füllt dagegen den angegebenen Takt: drei Viertel in 3/4, sechs Achtel in 6/8. Die Zahl über einer Mehrtaktpause nennt die Anzahl ganzer Takte.',
    ),
    figures: [
      'note-1',
      'note-2',
      'note-4',
      'note-8',
      'note-16',
      'note-32',
      'note-64',
      'note-128',
      'rest-1',
      'rest-2',
      'rest-4',
      'rest-8',
      'rest-16',
      'rest-32',
      'rest-64',
      'rest-128',
      'whole-bar-3',
      'whole-bar-6',
      'multi-rest',
      'stem-directions',
      'historical-multirests',
    ],
  },
  'dots-ties': {
    tasks: ['022'],
    module: 'F05',
    pages: '13, 16–17',
    source: notationSources.rhythm,
    text: nt(
      'A dotted quarter equals three eighths; a double-dotted quarter equals seven sixteenths. Dots also extend rests. Tied notes add their durations without a new attack. A tie links equal pitches; a slur indicates connection or grouping and does not add their values. Whether a value fits in the bar is arithmetic; whether its spelling shows the beat clearly is a separate question.',
      'Четверть с точкой равна трём восьмым, с двумя точками — семи шестнадцатым. Точки увеличивают и паузы. Связующая лига суммирует длительности без новой атаки. Она соединяет ноты одной высоты; артикуляционная лига указывает связность или группировку и не складывает их длительности. Помещается ли значение в такт — вопрос арифметики; хорошо ли запись показывает доли — отдельный вопрос.',
      'Eine punktierte Viertel entspricht drei Achteln, eine doppelt punktierte Viertel sieben Sechzehnteln. Punkte verlängern auch Pausen. Ein Haltebogen addiert Dauern ohne neuen Anschlag. Er verbindet gleiche Tonhöhen; ein Bindebogen zeigt Verbindung oder Gruppierung und addiert keine Werte. Ob ein Wert in den Takt passt, ist eine Rechenfrage; ob seine Schreibweise die Zählzeiten gut zeigt, eine andere.',
    ),
    figures: [
      'dotted',
      'double-dotted',
      'tied',
      'dotted-rest',
      'cross-bar-tie',
    ],
  },
  'beat-division': {
    tasks: ['023', '024'],
    module: 'F05',
    pages: '12, 14–16',
    source: {
      title: 'LilyPond 2.24 · Notation Reference §1.2.1 · Tuplets',
      url: 'https://lilypond.org/doc/v2.24/Documentation/notation/writing-rhythms#tuplets',
    },
    text: nt(
      'Read an explicit n:m as n written values in the time of m of those values. Three triplet eighths at 3:2 fill one quarter; two eighths at 2:3 fill a dotted quarter. Ratios such as 5:4, 7:4 and 13:12 must be stated in context. A tuplet may contain rests, subdivisions or ties. Beaming should reveal the chosen meter; historical vocal beaming can instead follow syllables.',
      'Явное отношение n:m означает n записанных длительностей за время m таких же длительностей. Три восьмые при 3:2 заполняют четверть; две восьмые при 2:3 — четверть с точкой. Отношения 5:4, 7:4 и 13:12 читают в указанном контексте. В особом делении возможны паузы, дробление и лиги. Рёбра помогают видеть размер; историческая вокальная группировка может следовать слогам.',
      'Ein ausdrückliches Verhältnis n:m bedeutet n notierte Werte in der Zeit von m solchen Werten. Drei Achtel bei 3:2 füllen eine Viertel; zwei Achtel bei 2:3 eine punktierte Viertel. Verhältnisse wie 5:4, 7:4 und 13:12 müssen im Kontext angegeben sein. Eine unregelmäßige Teilung kann Pausen, Unterteilungen oder Haltebögen enthalten. Balken sollen die Taktgliederung zeigen; ältere Vokalnotation kann stattdessen Silben folgen.',
    ),
    figures: [
      'beamed',
      'flagged',
      'triplet',
      'duplet',
      'beamed-mixed',
      'beamed-syllables',
      'tuplet-mixed',
      'tuplet-13-12',
      'quartole',
      'octole',
    ],
  },
  tempo: {
    tasks: ['019'],
    module: 'F04',
    pages: '23–26',
    source: notationSources.tempo,
    text: nt(
      'Always read the note unit next to the metronome number. At quarter = 60 one quarter lasts one second; at eighth = 60 one eighth lasts one second. a tempo returns to the preceding tempo; Tempo I to the initial one. A fermata suspends regular timing without specifying a fixed multiplier. Tempo words also carry character and cannot be ranked as exact BPM values.',
      'Всегда читайте длительность рядом с числом метронома. При четверть = 60 четверть длится секунду; при восьмая = 60 секунду длится восьмая. A tempo возвращает предыдущий темп, Tempo I — первоначальный. Фермата нарушает регулярный отсчёт, не задавая точного множителя длительности. Темповые слова передают и характер, поэтому их нельзя ранжировать как точные значения метронома.',
      'Lies stets den Notenwert neben der Metronomzahl. Bei Viertel = 60 dauert eine Viertel eine Sekunde; bei Achtel = 60 eine Achtel. a tempo führt zum vorigen Tempo zurück, Tempo I zum Anfangstempo. Eine Fermate unterbricht das regelmäßige Zeitmaß ohne festen Verlängerungsfaktor. Tempowörter tragen auch Ausdruck und bilden keine exakte BPM-Rangfolge.',
    ),
    figures: ['tempo-return'],
  },
  dynamics: {
    tasks: ['124'],
    module: 'N02',
    pages: '26–28',
    source: notationSources.marks,
    text: nt(
      'Separate a sustained level from an accent: fp asks for a strong onset followed by a soft continuation; sfz emphasizes an event. A crescendo hairpin governs its drawn span, not an endless increase. pppp and ffff extend the relative ladder. Calando or morendo can combine changes of motion and intensity; interpret them with the phrase and edition.',
      'Отличайте постоянный уровень от акцента: fp требует громкого начала с тихим продолжением; sfz выделяет отдельное событие. Вилка крещендо относится к указанному участку, а не к бесконечному усилению. pppp и ffff расширяют относительную шкалу. Calando или morendo могут объединять изменения движения и силы звучания; учитывайте фразу и редакцию.',
      'Unterscheide einen anhaltenden Grad von einer Betonung: fp verlangt einen kräftigen Beginn mit leiser Fortsetzung; sfz hebt ein Ereignis hervor. Eine Crescendogabel gilt für ihre gezeichnete Strecke, nicht für endloses Lauterwerden. pppp und ffff erweitern die relative Skala. Calando oder morendo können Bewegung und Intensität zugleich verändern; beachte Phrase und Ausgabe.',
    ),
    figures: ['dynamic-hairpin', 'dynamic-fp'],
  },
  articulation: {
    tasks: ['125'],
    module: 'N02',
    pages: '19, 28–30',
    source: notationSources.ornaments,
    text: nt(
      'Distinguish articulation, phrasing and ornaments. Legato connects; staccato separates; tenuto asks that a note be held. Portato combines connection with gentle separation. A breath mark or caesura interrupts the line. A dot versus a wedge is not a universal numerical length rule across periods. Ornament recognition here is a reference exercise; realization needs the edition, period and instrument.',
      'Различайте артикуляцию, фразировку и украшения. Легато связывает, стаккато разделяет, тенуто требует выдержать звук. Портато сочетает связность с мягким разделением. Знак дыхания или цезура прерывает линию. Точка и клин не задают универсального числового соотношения длительностей во всех эпохах. Здесь упражнение на украшения проверяет узнавание; исполнение зависит от редакции, эпохи и инструмента.',
      'Unterscheide Artikulation, Phrasierung und Verzierungen. Legato verbindet, staccato trennt, tenuto verlangt Aushalten. Portato verbindet mit sanfter Trennung. Atemzeichen oder Zäsur unterbrechen die Linie. Punkt und Keil legen epochenübergreifend kein zahlenmäßiges Längenverhältnis fest. Die Verzierungsübung dient dem Erkennen; die Ausführung hängt von Ausgabe, Epoche und Instrument ab.',
    ),
    figures: [
      'detached',
      'tenuto',
      'trill',
      'mordent',
      'upper-mordent',
      'turn',
      'grace',
      'long-grace',
      'after-grace',
      'slide',
      'arpeggio',
      'articulation-phrase',
    ],
  },
  repeats: {
    tasks: ['127'],
    module: 'N02',
    pages: '18–22',
    source: notationSources.repeats,
    text: nt(
      'Trace a route before playing: for a body A with endings B and C, repeat signs and first/second endings give A–B–A–C. D.C. returns to the beginning, D.S. to the segno; al Fine or al Coda supplies the stopping or transfer instruction. A percent repeat substitutes a previous measure; tremolo slashes abbreviate repetitions. simile asks you to continue the established manner.',
      'Перед исполнением проследите путь: основной участок А с окончаниями Б и В под первой и второй вольтами даёт А–Б–А–В. D.C. возвращает к началу, D.S. — к сеньо; al Fine или al Coda уточняет остановку или переход. Знак повторения такта заменяет предыдущий такт; черты тремоло сокращают запись повторений. Simile предлагает продолжать установленный способ исполнения.',
      'Verfolge vor dem Spielen den Weg: Ein Abschnitt A mit den Endungen B und C unter erster und zweiter Klammer ergibt A–B–A–C. D.C. führt zum Anfang, D.S. zum Segno; al Fine oder al Coda bestimmt Halt oder Weiterleitung. Ein Taktwiederholungszeichen ersetzt den vorigen Takt; Tremolostriche kürzen Wiederholungen ab. Simile verlangt die Fortsetzung der etablierten Spielweise.',
    ),
    figures: [
      'tremolo',
      'repeat-volta',
      'repeat-implicit',
      'repeat-dc-fine',
      'repeat-ds-coda',
      'repeat-abbreviation',
      'tremolo-two',
    ],
  },
} as const;

export type NotationTopic = keyof typeof notationProgramme;

export const notationFigureDescriptions: Record<string, LocalText> = {
  'grand-staff': nt(
    'Two staves share one timeline. Middle C can be written below treble or above bass without changing pitch.',
    'Два стана имеют общую временную ось. До первой октавы можно записать под скрипичным или над басовым станом без изменения высоты.',
    'Zwei Systeme teilen dieselbe Zeitachse. c′ kann unter dem Violin- oder über dem Basssystem stehen, ohne die Tonhöhe zu ändern.',
  ),
  'organ-staves': nt(
    'Two manual staves and a pedal staff: read vertically aligned events together, not as three successive lines.',
    'Два мануальных стана и педальный: совмещённые по вертикали события читаются вместе, а не как три последовательные строки.',
    'Zwei Manualsysteme und ein Pedalsystem: senkrecht ausgerichtete Ereignisse gehören zusammen, nicht in drei aufeinanderfolgende Zeilen.',
  ),
  'stem-directions': nt(
    'Compare right-side upward stems and left-side downward stems. In multiple voices, stem direction can identify the voice.',
    'Сравните штили вверх справа от головки и вниз слева. В многоголосии направление может обозначать голос.',
    'Vergleiche aufwärts gerichtete Hälse rechts und abwärts gerichtete links. Bei mehreren Stimmen kann die Richtung die Stimme kennzeichnen.',
  ),
  'signature-bass': nt(
    'The bass-clef signature keeps the same order of altered letters, but places the signs for the bass clef.',
    'Порядок изменённых ступеней сохраняется; положение ключевых знаков соответствует басовому ключу.',
    'Die Vorzeichnung behält die Reihenfolge der alterierten Stammtöne; die Positionen passen zum Bassschlüssel.',
  ),
  'accidental-tie-scope': nt(
    'Follow the altered note across the tie: its continuation is not a new attack. Then compare the following untied note.',
    'Проследите изменённую ноту через лигу продления: продолжение не имеет новой атаки. Затем сравните следующую незалигованную ноту.',
    'Verfolge den alterierten Ton über den Haltebogen: die Fortsetzung ist kein neuer Anschlag. Vergleiche danach die neu angeschlagene Note.',
  ),
  'accidental-octave-scope': nt(
    'A local accidental affects its written octave. Compare the same letter in another octave with the signature rule.',
    'Случайный знак относится к своей записанной октаве. Сравните ту же ступень в другой октаве с правилом ключевых знаков.',
    'Ein Versetzungszeichen betrifft seine notierte Oktavlage. Vergleiche denselben Stammton in einer anderen Oktave mit der Vorzeichnungsregel.',
  ),
  'beamed-mixed': nt(
    'Mixed short values can share a beam. Count their total and locate the beat before judging the grouping.',
    'Разные короткие длительности могут иметь общее ребро. Сосчитайте сумму и найдите долю, прежде чем оценивать группировку.',
    'Verschiedene kurze Werte können einen Balken teilen. Zähle die Gesamtdauer und finde die Zählzeit, bevor du die Gruppierung beurteilst.',
  ),
  'beamed-syllables': nt(
    'Compare rhythmic grouping with a text-based grouping convention. Syllables and meter answer different reading questions; this comparison is unscored.',
    'Сравните ритмическую группировку с группировкой по тексту. Слоги и метр решают разные задачи чтения; сравнение не оценивается.',
    'Vergleiche rhythmische mit textbezogener Gruppierung. Silben und Metrum beantworten verschiedene Lesefragen; der Vergleich wird nicht bewertet.',
  ),
  'tuplet-mixed': nt(
    'Count the tuplet span, including rests and subdivided or tied members. The bracket ratio scales the whole group.',
    'Считайте всю группу, включая паузы, дробление и лиги. Отношение над скобкой изменяет длительность всей группы.',
    'Zähle die gesamte Gruppe mit Pausen, Unterteilungen und Haltebögen. Das Klammerverhältnis skaliert die ganze Gruppe.',
  ),
  'tuplet-13-12': nt(
    'At 13:12, thirteen written values occupy the time of twelve such values. The denominator is essential evidence.',
    'При 13:12 тринадцать записанных длительностей занимают время двенадцати таких же. Второе число необходимо для прочтения.',
    'Bei 13:12 nehmen dreizehn notierte Werte die Zeit von zwölf solchen Werten ein. Die zweite Zahl ist für das Lesen wesentlich.',
  ),
  quartole: nt(
    'Four equal members divide the indicated span. Read the ratio and written values rather than assuming four ordinary notes.',
    'Четыре равных элемента делят указанный промежуток времени. Читайте отношение и длительности, не предполагая четыре обычные ноты.',
    'Vier gleiche Teile teilen die angegebene Dauer. Lies Verhältnis und Notenwerte statt vier gewöhnliche Noten anzunehmen.',
  ),
  octole: nt(
    'Eight equal members divide the indicated span. Compare its total with the dotted value; the comparison is unscored.',
    'Восемь равных элементов делят указанную длительность. Сравните сумму с длительностью с точкой; сравнение не оценивается.',
    'Acht gleiche Teile teilen die angegebene Dauer. Vergleiche die Summe mit dem punktierten Wert; der Vergleich wird nicht bewertet.',
  ),
  'dotted-rest': nt(
    'A dot extends silence by half the rest’s value, just as it extends a note.',
    'Точка увеличивает молчание на половину длительности паузы, как и у ноты.',
    'Ein Punkt verlängert die Stille um den halben Pausenwert, genauso wie bei einer Note.',
  ),
  'cross-bar-tie': nt(
    'The sustained sound is split into written parts at the barline. Add the tied values without a new attack.',
    'Протяжённый звук разделён на записанные части тактовой чертой. Сложите залигованные длительности без новой атаки.',
    'Der gehaltene Klang ist am Taktstrich in notierte Teile aufgeteilt. Addiere die übergebundenen Werte ohne neuen Anschlag.',
  ),
  'historical-multirests': nt(
    'Compare the older combined rest signs with numbered silent measures. Count measures, not the number of printed glyphs.',
    'Сравните старые составные знаки пауз с обозначением пустых тактов числом. Считайте такты, а не напечатанные знаки.',
    'Vergleiche ältere zusammengesetzte Pausenzeichen mit bezifferten Pausentakten. Zähle Takte, nicht gedruckte Zeichen.',
  ),
  'repeat-volta': nt(
    'On the first pass take ending 1; after returning, skip it and take ending 2. Trace the route before playing.',
    'В первый раз возьмите первую вольту; после возврата пропустите её и возьмите вторую. Сначала проследите путь.',
    'Nimm zuerst Klammer 1; überspringe sie nach dem Rücksprung und nimm Klammer 2. Verfolge den Weg vor dem Spielen.',
  ),
  'repeat-implicit': nt(
    'Without an opening repeat sign, this closing repeat returns to the beginning of the passage.',
    'При отсутствии начального знака репризы этот конечный знак возвращает к началу фрагмента.',
    'Ohne öffnendes Wiederholungszeichen führt dieses schließende Zeichen zum Anfang des Abschnitts zurück.',
  ),
  'repeat-dc-fine': nt(
    'D.C. al Fine returns to the beginning and stops at Fine on the return, not on the first traversal.',
    'D.C. al Fine возвращает к началу и останавливает у Fine после возврата, а не при первом прохождении.',
    'D.C. al Fine führt zum Anfang zurück und endet beim Rücklauf bei Fine, nicht beim ersten Durchgang.',
  ),
  'repeat-ds-coda': nt(
    'D.S. al Coda returns to the segno, then transfers at the indicated coda instruction. Follow the signs in their stated order.',
    'D.S. al Coda возвращает к сеньо, затем направляет в коду по указанному знаку. Следуйте предписанному порядку.',
    'D.S. al Coda führt zum Segno zurück und springt danach an der bezeichneten Stelle zur Coda. Folge der angegebenen Reihenfolge.',
  ),
  'repeat-abbreviation': nt(
    'The repeat abbreviation replaces a previously written pattern. Its duration still occupies the indicated measure.',
    'Сокращение заменяет ранее записанный рисунок. Его длительность по-прежнему занимает указанный такт.',
    'Das Wiederholungskürzel ersetzt ein bereits notiertes Muster. Seine Dauer füllt weiterhin den angegebenen Takt.',
  ),
  'tremolo-two': nt(
    'Strokes between two notes indicate alternation. Read the values and any measured or unmeasured instruction before choosing a speed.',
    'Черты между двумя нотами обозначают чередование. Перед выбором скорости прочитайте длительности и указание на измеренное или неизмеренное тремоло.',
    'Striche zwischen zwei Noten bezeichnen einen Wechsel. Lies Notenwerte und die Angabe zur gemessenen oder ungemessenen Ausführung, bevor du das Tempo wählst.',
  ),
  'upper-mordent': nt(
    'The unstruck neighboring-note sign identifies the upper-neighbor form here; it does not prescribe one historical realization.',
    'Неперечёркнутый знак здесь обозначает мордент с верхним вспомогательным звуком; он не предписывает единственное историческое исполнение.',
    'Das nicht durchstrichene Nebentonzeichen bezeichnet hier den Pralltriller mit oberem Nebenton, keine einzige historische Ausführung.',
  ),
  'long-grace': nt(
    'An unslashed small note is distinguished from the slashed grace form. Its exact timing requires the edition and performance context.',
    'Неперечёркнутая мелкая нота отличается от перечёркнутого форшлага. Точное время исполнения определяется редакцией и контекстом.',
    'Eine kleine Note ohne Strich unterscheidet sich von der durchstrichenen Vorschlagsform. Der genaue Zeitpunkt verlangt Ausgabe und Aufführungskontext.',
  ),
  'after-grace': nt(
    'The small after-grace notes follow the principal written note. Do not turn their small size into a fixed timing formula.',
    'Мелкие ноты нахшлага следуют после основной записанной ноты. Их размер не превращается в фиксированную формулу времени.',
    'Die kleinen Nachschlagsnoten folgen auf die notierte Hauptnote. Ihre Größe ist keine feste Zeitformel.',
  ),
  slide: nt(
    'The slide approaches the principal tone stepwise. Recognize the approach, then consult the edition for timing.',
    'Шлейфер подходит к основному звуку поступенно. Узнайте подход, затем уточните время по редакции.',
    'Der Schleifer führt schrittweise zum Hauptton. Erkenne die Hinführung und kläre den Zeitpunkt anhand der Ausgabe.',
  ),
  arpeggio: nt(
    'The vertical wavy sign spreads chord attacks in time. An arrow can specify the direction; this is not a change of chord membership.',
    'Вертикальная волнистая черта разносит атаки звуков аккорда во времени. Стрелка может задать направление; состав аккорда не меняется.',
    'Die senkrechte Wellenlinie verteilt die Akkordanschläge zeitlich. Ein Pfeil kann die Richtung bestimmen; die Akkordtöne ändern sich nicht.',
  ),
  'tempo-return': nt(
    'Read where the tempo changes and where it returns. A tempo recalls the preceding tempo; Tempo I recalls the initial tempo.',
    'Найдите начало изменения и возврат темпа. A tempo возвращает предшествующий темп, Tempo I — первоначальный.',
    'Finde Tempoänderung und Rückkehr. A tempo ruft das vorherige Tempo auf, Tempo I das Anfangstempo.',
  ),
  'dynamic-hairpin': nt(
    'The hairpin changes intensity across its drawn span. Its endpoint matters; it is not an instruction to keep growing indefinitely.',
    'Вилка изменяет силу звука на указанном участке. Её конец существенен: усиление не продолжается бесконечно.',
    'Die Gabel verändert die Intensität auf ihrer gezeichneten Strecke. Ihr Ende zählt; sie verlangt keine unbegrenzte Steigerung.',
  ),
  'dynamic-fp': nt(
    'Fp combines a strong onset with a soft continuation. Distinguish the attack from the sustained level.',
    'Fp сочетает сильное начало с тихим продолжением. Различайте атаку и последующую динамику.',
    'Fp verbindet einen kräftigen Beginn mit leiser Fortsetzung. Unterscheide Anschlag und anhaltende Lautstärke.',
  ),
  'articulation-phrase': nt(
    'Compare articulation marks, a grouping curve and a break in the line. They answer different questions: connection, phrase shape and breathing.',
    'Сравните штрихи, объединяющую дугу и разрыв линии. Они отвечают на разные вопросы: связность, построение фразы и дыхание.',
    'Vergleiche Artikulationszeichen, einen gliedernden Bogen und einen Einschnitt. Sie betreffen Verbindung, Phrasenform und Atmung.',
  ),
};

/** Future curriculum homes are document links, never fictitious playable lessons. */
export const notationForwardLinks: Record<string, string> = {
  N03: 'https://github.com/alex-michels/one-music-lab/blob/main/docs/curriculum/notation.md#n03',
  N04: 'https://github.com/alex-michels/one-music-lab/blob/main/docs/curriculum/notation.md#n04',
  N05: 'https://github.com/alex-michels/one-music-lab/blob/main/docs/curriculum/notation.md#n05',
  H04: 'https://github.com/alex-michels/one-music-lab/blob/main/docs/curriculum/harmony.md#h04',
};

export const notationReferences = [
  {
    title: nt(
      'Metronome history',
      'История метронома',
      'Geschichte des Metronoms',
    ),
    aliases: nt(
      'Mälzel; Maelzel; Winkel; M.M.',
      'Мельцель; Винкель; М. М.',
      'Mälzel; Maelzel; Winkel; M. M.',
    ),
    body: nt(
      'M.M. refers to Mälzel’s metronome. The development of the portable mechanical instrument involved both Winkel and Mälzel; Brian Blood’s account distinguishes technical improvements from Mälzel’s wider commercialization and reports disputed priority. In a score, the practical information remains the marked note value and its count per minute.',
      'М. М. отсылает к метроному Мельцеля. В создании переносного механического прибора участвовали Винкель и Мельцель; Брайан Блад различает технические усовершенствования и широкое распространение прибора Мельцелем, отмечая спор о первенстве. Для чтения нот главное — указанная длительность и число её отсчётов в минуту.',
      'M. M. verweist auf Mälzels Metronom. An der Entwicklung des tragbaren mechanischen Geräts waren Winkel und Mälzel beteiligt; Brian Blood unterscheidet technische Verbesserungen von Mälzels breiter Vermarktung und berichtet von umstrittener Priorität. Für das Notenlesen zählen der angegebene Notenwert und seine Anzahl pro Minute.',
    ),
    lesson: 'tempo',
    source: notationSources.tempo,
  },
  {
    title: nt(
      'Unmarked articulation',
      'Артикуляция без обозначений',
      'Artikulation ohne Spielzeichen',
    ),
    aliases: nt(
      'historical performance; default articulation',
      'историческое исполнительство; нон легато',
      'historische Aufführungspraxis; Non legato',
    ),
    body: nt(
      'Missing slurs or dots do not prescribe identical playing in every period. Brian Blood contrasts Türk’s 1789 keyboard advice, which leaves a small gap in ordinary playing, with Clementi’s 1801 preference for sustained values. These are specific keyboard traditions, not a rule for all instruments or all eighteenth- and nineteenth-century music. Check the edition and performance context before choosing a default articulation.',
      'Отсутствие лиг и точек не предписывает одинакового исполнения во все эпохи. Брайан Блад сопоставляет клавирные рекомендации Тюрка 1789 года, допускающие небольшой промежуток при обычном исполнении, с предпочтением Клементи 1801 года выдерживать длительности. Это конкретные клавирные традиции, а не правило для всех инструментов и всей музыки XVIII–XIX веков. Уточняйте редакцию и исполнительский контекст.',
      'Fehlende Bögen oder Punkte verlangen nicht in jeder Epoche dasselbe Spiel. Brian Blood stellt Türks Klavierlehre von 1789, die beim gewöhnlichen Vortrag eine kleine Trennung vorsieht, Clementis Empfehlung von 1801 zum Aushalten der Notenwerte gegenüber. Das sind bestimmte Klaviertraditionen, keine Regel für alle Instrumente oder die gesamte Musik des 18. und 19. Jahrhunderts. Prüfe Ausgabe und Aufführungskontext.',
    ),
    lesson: 'articulation',
    source: {
      title:
        'Brian Blood · Dolmetsch Online · Music Theory §21 · Slur & Phrase (Türk 1789 / Clementi 1801 comparison)',
      url: 'https://www.dolmetsch.com/musictheory21.htm',
    },
  },
  {
    title: nt('Tempo words', 'Словесные обозначения темпа', 'Tempowörter'),
    body: nt(
      'Largo suggests breadth; Adagio a slow pace; Allegro liveliness. Più and meno mean more and less; molto and poco qualify the amount. These words describe movement and character, not fixed BPM values.',
      'Largo — широко; Adagio — медленно; Allegro — оживлённо. Più и meno означают больше и меньше, molto и poco уточняют степень. Слова характеризуют движение и характер, а не фиксированное число ударов в минуту.',
      'Largo bezeichnet Breite, Adagio langsames Tempo, Allegro Lebhaftigkeit. Più und meno bedeuten mehr und weniger; molto und poco bestimmen den Grad. Die Wörter beschreiben Bewegung und Charakter, keine festen Metronomzahlen.',
    ),
    lesson: 'tempo',
    source: notationSources.terms,
  },
  {
    title: nt(
      'Character and emphasis',
      'Характер и подчёркивание',
      'Charakter und Betonung',
    ),
    body: nt(
      'Dolce asks for sweetness; espressivo for expression. Rinforzando (rinf., rfz) requests emphasis. Calando suggests subsiding; morendo dying away. Follow the phrase and edition when translating these directions into timing and intensity.',
      'Dolce — нежно; espressivo — выразительно. Rinforzando (rinf., rfz) требует подчёркивания. Calando — затихая; morendo — замирая. Изменения времени и силы звучания уточняйте по фразе и редакции.',
      'Dolce verlangt Lieblichkeit, espressivo Ausdruck. Rinforzando (rinf., rfz) fordert Betonung. Calando bedeutet nachlassend, morendo ersterbend. Übertrage diese Angaben im Zusammenhang mit Phrase und Ausgabe auf Zeitmaß und Intensität.',
    ),
    lesson: 'dynamics',
    source: notationSources.terms,
  },
  {
    title: nt('Ottava', 'Октавный перенос', 'Oktavierung'),
    body: nt(
      '8 shifts one octave; 15 shifts two. Placement above or below indicates direction, and the line gives the scope.',
      '8 переносит на октаву, 15 — на две. Положение сверху или снизу задаёт направление, пунктир — область действия.',
      '8 versetzt um eine Oktave, 15 um zwei. Die Stellung oben oder unten gibt die Richtung an, die Linie den Geltungsbereich.',
    ),
    lesson: 'clefs',
    source: notationSources.accidentals,
  },
  {
    title: nt('Multi-measure rest', 'Многотактовая пауза', 'Mehrtaktpause'),
    body: nt(
      'Its number counts complete silent measures, not note values.',
      'Число указывает количество целых тактов молчания, а не длительностей нот.',
      'Ihre Zahl zählt vollständige pausierende Takte, nicht Notenwerte.',
    ),
    lesson: 'durations',
    source: notationContentSources.rests,
  },
  {
    title: nt('Ornament', 'Мелизм', 'Verzierung'),
    body: nt(
      'A written embellishment. Trill, mordent and turn signs need a historical and instrumental context for realization.',
      'Записанное украшение мелодии. Исполнение трели, мордента и группетто требует исторического и инструментального контекста.',
      'Eine notierte Ausschmückung. Triller, Mordent und Doppelschlag benötigen zur Ausführung einen historischen und instrumentalen Kontext.',
    ),
    lesson: 'articulation',
    source: notationSources.ornaments,
  },
  {
    title: nt('Trill', 'Трель', 'Triller'),
    body: nt(
      'Alternation involving a principal and neighboring pitch; starting note and rhythm depend on context.',
      'Чередование основного и соседнего звуков; начальный звук и ритм зависят от контекста.',
      'Wechsel zwischen Haupt- und Nebenton; Anfangston und Rhythmus hängen vom Kontext ab.',
    ),
    lesson: 'articulation',
    source: notationSources.ornaments,
  },
  {
    title: nt('Mordent', 'Мордент', 'Mordent und Pralltriller'),
    body: nt(
      'Specify upper or lower mordent rather than relying on the name alone. In the modern signs shown here, the unstruck form uses the upper neighbor, the struck-through form the lower. This identifies the sign, not a universal starting note or rhythm.',
      'Уточняйте вид: неперечёркнутый мордент связан с верхним вспомогательным звуком, перечёркнутый — с нижним. Здесь речь о показанных современных знаках, а не об универсальном начальном звуке или ритме исполнения.',
      'Unterscheide den Pralltriller mit oberem Nebenton vom Mordent mit unterem Nebenton. Bei den hier gezeigten modernen Zeichen trägt die untere Form einen Strich. Damit ist das Zeichen bestimmt, nicht allgemein Anfangston oder Rhythmus.',
    ),
    aliases: nt(
      'upper mordent; lower mordent',
      'неперечёркнутый мордент; перечёркнутый мордент',
      'Pralltriller; Mordent',
    ),
    lesson: 'articulation',
    source: notationContentSources.ornamentNames,
  },
  {
    title: nt('Turn', 'Группетто', 'Doppelschlag'),
    body: nt(
      'A neighboring-note figure indicated by a turn sign; its placement relative to a note matters for timing.',
      'Фигура из основных и соседних звуков, обозначенная знаком группетто; положение знака относительно ноты существенно для времени исполнения.',
      'Eine Nebentonfigur mit Doppelschlagzeichen; seine Stellung zur Note ist für den Zeitpunkt der Ausführung wesentlich.',
    ),
    lesson: 'articulation',
    source: notationSources.ornaments,
  },
  {
    title: nt('Grace note', 'Форшлаг', 'Vorschlag'),
    body: nt(
      'Small notes indicate an embellishment before a principal note. A slashed stem is a distinct written form, not a universal timing formula.',
      'Мелкие ноты обозначают украшение перед основной нотой. Перечёркнутый штиль — отдельная форма записи, а не универсальная формула длительности.',
      'Kleine Noten bezeichnen eine Verzierung vor einer Hauptnote. Ein durchstrichener Hals ist eine eigene Schreibform, keine allgemeine Zeitformel.',
    ),
    lesson: 'articulation',
    source: notationContentSources.grace,
  },
  {
    title: nt('After-grace', 'Нахшлаг', 'Nachschlag'),
    body: nt(
      'An embellishment following the principal note. Read its place within the phrase and the edition’s performance guidance.',
      'Украшение после основного звука. Учитывайте его место во фразе и исполнительские указания редакции.',
      'Eine Verzierung nach dem Hauptton. Beachte ihre Stellung in der Phrase und die Ausführungshinweise der Ausgabe.',
    ),
    lesson: 'articulation',
    source: notationContentSources.grace,
  },
  {
    title: nt('Slide ornament', 'Шлейфер', 'Schleifer'),
    body: nt(
      'A short stepwise approach to a principal tone; its historical execution is not inferred from a generic playback preset.',
      'Короткий поступенный подход к основному звуку; историческое исполнение не выводят из универсальной настройки воспроизведения.',
      'Eine kurze schrittweise Hinführung zum Hauptton; ihre historische Ausführung folgt keinem allgemeinen Wiedergabepreset.',
    ),
    lesson: 'articulation',
    source: notationContentSources.ornamentNames,
  },
  {
    title: nt('Arpeggio sign', 'Знак арпеджиато', 'Arpeggiozeichen'),
    body: nt(
      'A vertical wavy line asks that chord tones be spread in time. An arrow can specify direction.',
      'Вертикальная волнистая линия предлагает разложить звуки аккорда во времени. Стрелка может указывать направление.',
      'Eine senkrechte Wellenlinie verlangt zeitlich versetzte Akkordtöne. Ein Pfeil kann die Richtung angeben.',
    ),
    lesson: 'articulation',
    source: notationContentSources.arpeggio,
  },
  {
    title: nt('Tremolo notation', 'Запись тремоло', 'Tremolonotation'),
    body: nt(
      'Stem slashes abbreviate repeated notes; strokes between notes can indicate alternation. Distinguish measured and unmeasured instructions.',
      'Черты на штиле сокращают повторение звука; черты между нотами могут обозначать чередование. Различайте измеренные и неизмеренные повторения.',
      'Halsstriche kürzen Tonwiederholungen ab; Striche zwischen Noten können einen Wechsel anzeigen. Unterscheide gemessene und ungemessene Angaben.',
    ),
    lesson: 'repeats',
    source: notationSources.repeats,
  },
  {
    title: nt('Simile', 'Симиле', 'Simile'),
    body: nt(
      'Continue in the same manner; the context tells you whether this concerns articulation, accompaniment or another pattern.',
      'Продолжайте тем же способом; контекст определяет, касается ли это артикуляции, сопровождения или другого рисунка.',
      'In gleicher Weise fortfahren; der Kontext bestimmt, ob Artikulation, Begleitung oder ein anderes Muster gemeint ist.',
    ),
    lesson: 'repeats',
    source: notationSources.terms,
  },
  {
    title: nt('Tablature', 'Табулатура', 'Tabulatur'),
    body: nt(
      'Instrument-specific notation can show strings and frets rather than staff pitches. Read its tuning and legend; tablature is not one universal system.',
      'Инструментальная запись может показывать струны и лады вместо высот на стане. Проверьте настройку и условные обозначения; табулатура — не единая универсальная система.',
      'Instrumentbezogene Notation kann Saiten und Bünde statt Tonhöhen im Liniensystem zeigen. Prüfe Stimmung und Zeichenerklärung; Tabulatur ist kein einheitliches Universalsystem.',
    ),
    lesson: 'staff',
    forwardModules: ['N05'],
    source: notationSources.tablature,
  },
  {
    title: nt('Figured bass', 'Цифрованный бас', 'Generalbass'),
    body: nt(
      'Figures attached to a bass indicate intervals for a harmonic realization. They are not interchangeable with modern chord symbols.',
      'Цифры при басовом голосе обозначают интервалы для гармонической реализации. Они не взаимозаменяемы с современными обозначениями аккордов.',
      'Ziffern zu einer Bassstimme geben Intervalle für die harmonische Aussetzung an. Sie sind nicht mit heutigen Akkordsymbolen austauschbar.',
    ),
    lesson: 'repeats',
    aliases: nt('thoroughbass', 'генерал-бас', 'bezifferter Bass'),
    forwardModules: ['H04'],
    relatedTopics: ['chords'],
    source: notationSources.figured,
  },
  {
    title: nt('Graphic notation', 'Графическая нотация', 'Grafische Notation'),
    body: nt(
      'A score may use shapes, spatial relationships or action instructions. Read its own legend; horizontal space means elapsed time only when specified. Some choices may deliberately remain open.',
      'Партитура может использовать формы, пространственные отношения или инструкции действий. Читайте её условные обозначения: расстояние означает время только при соответствующем указании. Некоторые решения могут намеренно оставаться открытыми.',
      'Eine Partitur kann Formen, räumliche Beziehungen oder Handlungsanweisungen verwenden. Lies ihre eigene Legende: horizontaler Abstand bedeutet nur bei entsprechender Festlegung verstrichene Zeit. Manche Entscheidungen bleiben absichtlich offen.',
    ),
    lesson: 'staff',
    forwardModules: ['N05'],
    source: notationSources.graphic,
  },
  {
    title: nt(
      'Breath mark and caesura',
      'Знак дыхания и цезура',
      'Atemzeichen und Zäsur',
    ),
    body: nt(
      'They mark a breath or break in the musical line. Unlike a numbered rest, their duration is not specified by a note value alone.',
      'Обозначают вдох или разрыв музыкальной линии. В отличие от паузы с определённой длительностью, время не задаётся одним нотным значением.',
      'Sie kennzeichnen Atemholen oder einen Einschnitt in der musikalischen Linie. Anders als eine Pause mit festem Wert bestimmen sie die Dauer nicht allein durch einen Notenwert.',
    ),
    lesson: 'articulation',
    source: notationSources.curves,
  },
  {
    title: nt(
      'Chant divisions',
      'Разделительные знаки хорала',
      'Divisiones im Choral',
    ),
    body: nt(
      'Gregorian notation has its own phrase-division signs. Consult the chant edition; they are not ordinary metrical barlines.',
      'В григорианской нотации используются свои знаки разделения фраз. Обращайтесь к редакции хорала: это не обычные метрические тактовые черты.',
      'Gregorianische Notation besitzt eigene Gliederungszeichen. Beachte die Choralausgabe; es sind keine gewöhnlichen metrischen Taktstriche.',
    ),
    lesson: 'articulation',
    forwardModules: ['N04'],
    source: notationSources.chant,
  },
  {
    title: nt('Fortepiano (fp)', 'Фортепиано (fp)', 'Fortepiano (fp)'),
    body: nt(
      'A strong attack followed immediately by a soft continuation; it is not the instrument name in this context.',
      'Сильное начало звука с немедленным тихим продолжением; здесь это исполнительское указание, а не название инструмента.',
      'Kräftiger Beginn mit unmittelbar leiser Fortsetzung; hier eine Vortragsangabe, nicht der Instrumentenname.',
    ),
    lesson: 'dynamics',
    source: notationSources.marks,
  },
  {
    title: nt('Tempo I', 'Первоначальный темп', 'Tempo I'),
    body: nt(
      'Return to the initial tempo, which need not be the most recent tempo before a change.',
      'Возврат к первоначальному темпу, который не обязательно совпадает с последним темпом перед изменением.',
      'Rückkehr zum Anfangstempo, das nicht das unmittelbar vor einer Änderung geltende Tempo sein muss.',
    ),
    lesson: 'tempo',
    source: notationSources.terms,
  },
  {
    title: nt(
      'Instruments and clefs',
      'Инструменты и ключи',
      'Instrumente und Schlüssel',
    ),
    aliases: nt(
      'viola; cello; bassoon; trombone; flute',
      'альт; виолончель; фагот; тромбон; флейта',
      'Bratsche; Violoncello; Fagott; Posaune; Flöte',
    ),
    body: nt(
      'Read the printed clef, not an assumed instrument rule. Flute parts commonly use treble; viola parts alto and sometimes treble; cello parts bass, tenor or treble according to register. Tenor clef also occurs in bassoon and trombone parts. A clef change changes the pitch anchor, not the instrument.',
      'Читайте выставленный ключ, не подменяя его правилом об инструменте. Флейта обычно использует скрипичный; альт — альтовый, иногда скрипичный; виолончель — басовый, теноровый или скрипичный в зависимости от регистра. Теноровый встречается также у фагота и тромбона. Смена ключа меняет высотный ориентир, а не инструмент.',
      'Lies den gedruckten Schlüssel statt einer vermeintlichen Instrumentenregel. Die Flöte verwendet meist den Violin-, die Bratsche den Alt- und gelegentlich den Violinschlüssel; das Violoncello je nach Lage Bass-, Tenor- oder Violinschlüssel. Der Tenorschlüssel kommt auch bei Fagott und Posaune vor. Ein Schlüsselwechsel ändert den Tonhöhenbezug, nicht das Instrument.',
    ),
    lesson: 'clefs',
    source: notationContentSources.instruments,
    furtherSources: [
      notationContentSources.bassoon,
      notationContentSources.trombone,
    ],
    forwardModules: ['N03'],
  },
  {
    title: nt(
      'Keyboard and organ staves',
      'Станы фортепиано и органа',
      'Klavier- und Orgelsysteme',
    ),
    aliases: nt(
      'grand staff; organ pedals; bracket',
      'фортепианная система; педаль органа; скобка',
      'Klavierakkolade; Orgelpedal; Klammer',
    ),
    body: nt(
      'A piano part commonly combines two staves with a brace. Organ notation commonly adds a third staff for the pedals below the two manual staves. This is a layout convention: a hand or voice can cross between staves, and neither staff is permanently restricted to one clef.',
      'Фортепианная партия обычно объединяет два стана акколадой. В органной записи ниже двух мануальных станов часто расположен третий — для педали. Это способ размещения записи: рука или голос могут переходить между станами, и за станом не закреплён навсегда один ключ.',
      'Eine Klavierstimme verbindet meist zwei Notensysteme mit einer geschweiften Klammer. Bei der Orgel steht unter den beiden Manualsystemen häufig ein drittes System für das Pedal. Das ist eine Anordnungskonvention: Hand oder Stimme können das System wechseln; kein System ist auf einen einzigen Schlüssel festgelegt.',
    ),
    lesson: 'clefs',
    source: notationContentSources.keyboards,
    forwardModules: ['N03'],
  },
  {
    title: nt('Stem direction', 'Направление штиля', 'Halsrichtung'),
    body: nt(
      'An upward stem attaches to the right of the head, a downward stem to the left. For isolated notes in one voice, stems normally point toward the staff center; the middle-line note normally points down. Beamed groups, chords and multiple voices can override this convention: opposite stems can identify separate voices rather than different durations.',
      'Штиль вверх примыкает к головке справа, вниз — слева. У отдельных нот одного голоса штиль обычно направлен к середине стана; на средней линейке — вниз. Группировка, аккорды и многоголосие могут менять это правило: встречные штили способны обозначать разные голоса, а не разные длительности.',
      'Ein aufwärts gerichteter Hals sitzt rechts am Kopf, ein abwärts gerichteter links. Bei einzelnen Noten einer Stimme zeigt er meist zur Systemmitte; auf der Mittellinie gewöhnlich nach unten. Balkengruppen, Akkorde und mehrere Stimmen können davon abweichen: Gegenläufige Hälse können Stimmen unterscheiden, nicht Notenwerte.',
    ),
    lesson: 'durations',
    source: notationContentSources.stems,
  },
  {
    title: nt(
      'Duration names and aliases',
      'Названия длительностей',
      'Namen der Notenwerte',
    ),
    aliases: nt(
      'semibreve; minim; crotchet; quaver; semiquaver; demisemiquaver; hemidemisemiquaver; half note; quarter note; eighth note; sixteenth note; thirty-second note; sixty-fourth note; 128th note',
      'половинная; четверть; восьмая; шестнадцатая; тридцать вторая; шестьдесят четвёртая; сто двадцать восьмая',
      'Halbe; Viertel; Achtel; Sechzehntel; Zweiunddreißigstel; Vierundsechzigstel; Hundertachtundzwanzigstel',
    ),
    body: nt(
      'American whole, half, quarter and eighth correspond to British semibreve, minim, crotchet and quaver. Sixteenth, thirty-second and sixty-fourth are semiquaver, demisemiquaver and hemidemisemiquaver. The names change, not the ratios: each step halves the value; 128th continues that chain. Matching rest names describe silence of the same written duration.',
      'После целой следуют половинная, четверть, восьмая, шестнадцатая, тридцать вторая, шестьдесят четвёртая и сто двадцать восьмая. Каждая следующая длительность вдвое меньше предыдущей. Для пауз используются соответствующие названия. В англоязычных изданиях американское quarter note и британское crotchet, например, обозначают одну и ту же четверть.',
      'Auf die Ganze folgen Halbe, Viertel, Achtel, Sechzehntel, Zweiunddreißigstel, Vierundsechzigstel und Hundertachtundzwanzigstel. Jeder Schritt halbiert den Wert; die entsprechenden Pausen haben dieselben Dauern. In englischen Ausgaben bezeichnen etwa quarter note und crotchet denselben Viertelwert: verschiedene Benennungen, keine verschiedenen Rhythmen.',
    ),
    lesson: 'durations',
    source: notationContentSources.durationNames,
  },
  {
    title: nt(
      'Historical multi-measure rests',
      'Исторические многотактовые паузы',
      'Kirchenpausen',
    ),
    body: nt(
      'Some editions combine longa-, breve- and whole-rest shapes to show a short run of silent measures. A modern horizontal multi-rest with a number is another representation. Read the measure count and edition convention; do not mistake these combined symbols for a single ordinary rest value.',
      'В некоторых изданиях короткую последовательность пустых тактов показывают сочетанием знаков пауз лонги, бревиса и целой. Другой способ — современная многотактовая пауза с числом. Учитывайте количество тактов и правила издания; не принимайте сочетание знаков за одну обычную длительность паузы.',
      'Manche Ausgaben kombinieren Longa-, Brevis- und Ganzpausenzeichen für wenige pausierende Takte. Eine waagerechte Mehrtaktpause mit Zahl ist eine andere Darstellung. Lies die Taktzahl und die Konvention der Ausgabe; verwechsle die kombinierten Zeichen nicht mit einem einzelnen gewöhnlichen Pausenwert.',
    ),
    lesson: 'durations',
    source: notationContentSources.multirests,
    forwardModules: ['N04'],
  },
  {
    title: nt(
      'Tuplet families',
      'Виды особого деления',
      'Unregelmäßige Teilungen',
    ),
    aliases: nt(
      'quintuplet; sextuplet; septuplet; nonuplet; 11-tuplet; 13-tuplet; 15-tuplet; 17-tuplet; quadruplet; octuplet',
      'квинтоль; секстоль; септоль; ноноль; квартоль; октоль',
      'Quintole; Sextole; Septole; Nonole; Quartole; Oktole',
    ),
    body: nt(
      'Quintuplet, sextuplet, septuplet and nonuplet refer to groups of five, six, seven and nine. Larger numerals such as 11, 13, 15 or 17 also occur. They do not determine the replacement duration by themselves. At 13:12, thirteen written values occupy twelve such values. Duplets, quadruplets and octuplets can divide a dotted span evenly; compare their explicit ratios rather than inventing a universal convention.',
      'Квинтоль, секстоль, септоль и ноноль обозначают группы из пяти, шести, семи и девяти элементов. Встречаются также числа 11, 13, 15 и 17. Одно число ещё не определяет замещаемую длительность. При 13:12 тринадцать записанных длительностей занимают время двенадцати таких же. Дуоль, квартоль и октоль могут делить длительность с точкой на равные части; сравнивайте явные отношения.',
      'Quintole, Sextole, Septole und Nonole benennen Gruppen von fünf, sechs, sieben und neun. Auch Zahlen wie 11, 13, 15 oder 17 kommen vor. Die Zahl allein bestimmt die ersetzte Dauer nicht. Bei 13:12 nehmen dreizehn notierte Werte die Zeit von zwölf solchen Werten ein. Duolen, Quartolen und Oktolen können einen punktierten Wert gleichmäßig teilen; vergleiche die ausdrücklichen Verhältnisse.',
    ),
    lesson: 'beat-division',
    source: notationContentSources.rhythm,
  },
  {
    title: nt(
      'Slow and moderate tempo words',
      'Медленные и умеренные темпы',
      'Langsame und mäßige Tempowörter',
    ),
    aliases: nt(
      'Largo; Larghetto; Lento; Adagio; Adagietto; Andante; Andantino; Moderato',
      'ларго; ларгетто; ленто; адажио; адажиетто; анданте; андантино; модерато',
      'Largo; Larghetto; Lento; Adagio; Adagietto; Andante; Andantino; Moderato',
    ),
    body: nt(
      'Largo suggests breadth, Lento slowness, Adagio a slow, settled movement; Andante evokes walking and Moderato moderation. Diminutive forms such as Larghetto, Adagietto and Andantino qualify movement and character, but do not provide a dependable numerical conversion. Read them with the meter, phrase and edition; these overlapping descriptions are not a ranked BPM table.',
      'Largo передаёт широту, Lento — медленность, Adagio — спокойное медленное движение; Andante напоминает шаг, Moderato указывает на умеренность. Уменьшительные формы Larghetto, Adagietto и Andantino уточняют движение и характер, но не дают надёжного числового пересчёта. Учитывайте размер, фразу и редакцию; это не таблица ранжированных значений метронома.',
      'Largo vermittelt Breite, Lento Langsamkeit, Adagio ruhiges langsames Bewegen; Andante erinnert ans Gehen, Moderato an Mäßigung. Verkleinerungsformen wie Larghetto, Adagietto und Andantino verändern Bewegung und Charakter, liefern aber keine zuverlässige Zahlenumrechnung. Lies sie mit Takt, Phrase und Ausgabe; die Beschreibungen bilden keine BPM-Rangliste.',
    ),
    lesson: 'tempo',
    source: notationSources.terms,
    furtherSources: [notationSources.tempo],
  },
  {
    title: nt(
      'Lively and fast tempo words',
      'Подвижные и быстрые темпы',
      'Lebhafte und schnelle Tempowörter',
    ),
    aliases: nt(
      'Allegro; Allegretto; Allegro molto; Vivace; Vivo; Presto; Prestissimo',
      'аллегро; аллегретто; виваче; престо; престиссимо',
      'Allegro; Allegretto; Allegro molto; Vivace; Vivo; Presto; Prestissimo',
    ),
    body: nt(
      'Allegro asks for lively, usually fast movement; Allegretto often softens that character. Vivace or vivo emphasizes animation, Presto speed, and Prestissimo extreme speed. Molto intensifies the word it accompanies. None names an exact metronome value or overrides a separately printed note-unit marking.',
      'Allegro означает оживлённое, обычно быстрое движение; Allegretto часто смягчает этот характер. Vivace или vivo подчёркивает живость, Presto — быстроту, Prestissimo — предельную быстроту. Molto усиливает сопровождаемое слово. Ни одно слово не задаёт точного значения метронома и не отменяет отдельно указанную длительность отсчёта.',
      'Allegro verlangt lebhafte, meist schnelle Bewegung; Allegretto mildert häufig diesen Charakter. Vivace oder vivo betont Lebhaftigkeit, Presto Schnelligkeit, Prestissimo äußerste Schnelligkeit. Molto verstärkt das begleitete Wort. Keines nennt einen exakten Metronomwert oder ersetzt einen ausdrücklich angegebenen Zählwert.',
    ),
    lesson: 'tempo',
    source: notationSources.terms,
    furtherSources: [notationSources.tempo],
  },
  {
    title: nt(
      'Qualifying a direction',
      'Уточнения исполнительских указаний',
      'Vortragsangaben näher bestimmen',
    ),
    aliases: nt(
      'più; meno; molto; poco; poco a poco; assai; non troppo; quasi; comodo; sostenuto; con moto; con fuoco; appassionato; con passione',
      'пью; мено; мольто; поко; постепенно; не слишком; выдержанно; с движением; с огнём; страстно',
      'più; meno; molto; poco; poco a poco; assai; non troppo; quasi; comodo; sostenuto; con moto; con fuoco; appassionato; con passione',
    ),
    body: nt(
      'Più and meno mean more and less; molto/assai intensify, poco limits, poco a poco makes a change gradual, and non troppo limits excess. Quasi means “as if”. Comodo suggests ease, sostenuto sustained delivery, con moto movement and con fuoco fire. Appassionato or con passione asks for passion. Identify what each qualifier modifies before changing speed, attack or loudness.',
      'Più и meno — больше и меньше; molto/assai усиливают, poco ограничивает, poco a poco означает постепенность, non troppo — «не слишком». Quasi — «как бы». Comodo предполагает удобное, непринуждённое движение, sostenuto — выдержанность, con moto — подвижность, con fuoco — огонь. Appassionato или con passione требует страстности. Сначала определите, что уточняется: темп, атака или сила звука.',
      'Più und meno bedeuten mehr und weniger; molto/assai verstärken, poco begrenzt, poco a poco macht eine Änderung allmählich, non troppo begrenzt das Übermaß. Quasi bedeutet „gleichsam“. Comodo legt Bequemlichkeit nahe, sostenuto getragenes Spiel, con moto Bewegung, con fuoco Feuer. Appassionato oder con passione verlangt Leidenschaft. Bestimme zuerst, worauf sich der Zusatz bezieht.',
    ),
    lesson: 'tempo',
    source: notationSources.terms,
  },
  {
    title: nt(
      'Tempo changes and agogics',
      'Изменения темпа и агогика',
      'Tempoänderungen und Agogik',
    ),
    aliases: nt(
      'rallentando; ritenuto; allargando; stringendo; stretto; rubato; più mosso; meno mosso; in tempo',
      'раллентандо; ритенуто; алларгандо; стринджендо; стретто; рубато; более подвижно; менее подвижно',
      'rallentando; ritenuto; allargando; stringendo; stretto; rubato; più mosso; meno mosso; in tempo',
    ),
    body: nt(
      'Ritardando/rallentando slow the motion; ritenuto holds it back, often more immediately. Allargando broadens; stringendo presses forward, and stretto can urge the close onward. Più/meno mosso asks for more/less movement. Rubato permits expressive flexibility, not a new time signature. A tempo returns to the preceding tempo, Tempo I to the initial one; read in tempo as a contextual return to regular time. A spaced-out word or line marks a span, not an automatic reset at every barline.',
      'Ritardando/rallentando замедляет движение; ritenuto сдерживает его, часто более непосредственно. Allargando расширяет, stringendo подгоняет, stretto может устремлять к завершению. Più/meno mosso — более/менее подвижно. Rubato допускает выразительную свободу времени, но не меняет размер. A tempo возвращает предшествующий темп, Tempo I — первоначальный; in tempo читают как контекстное возвращение к регулярному движению. Растянутое слово или линия обозначает участок, а не автоматическую отмену на каждой тактовой черте.',
      'Ritardando/rallentando verlangsamt; ritenuto hält die Bewegung oft unmittelbarer zurück. Allargando verbreitert, stringendo drängt vorwärts; stretto kann zum Schluss hindrängen. Più/meno mosso verlangt mehr/weniger Bewegung. Rubato erlaubt zeitliche Ausdrucksfreiheit, keinen neuen Takt. A tempo kehrt zum vorigen, Tempo I zum Anfangstempo zurück; in tempo verlangt kontextabhängig wieder regelmäßiges Zeitmaß. Ein auseinandergezogenes Wort oder eine Linie bezeichnet eine Strecke, keinen automatischen Widerruf an jedem Taktstrich.',
    ),
    lesson: 'tempo',
    source: notationSources.terms,
    furtherSources: [notationSources.tempo],
  },
  {
    title: nt(
      'Character: line and expression',
      'Характер: линия и выражение',
      'Charakter: Linie und Ausdruck',
    ),
    aliases: nt(
      'cantabile; dolce; espressivo; affettuoso; amabile; con anima; con dolore; dolente; sotto voce',
      'кантабиле; дольче; эспрессиво; аффеттуозо; амабиле; с душой; с болью; жалобно; вполголоса',
      'cantabile; dolce; espressivo; affettuoso; amabile; con anima; con dolore; dolente; sotto voce',
    ),
    body: nt(
      'Cantabile asks for a singing line; dolce and amabile for gentleness; espressivo for expressive shaping. Affettuoso suggests warmth of feeling, con anima animation of expression, con dolore/dolente sorrow. Sotto voce restrains the delivery. These directions concern the manner of the phrase; they cannot be reduced to one gain or tempo setting.',
      'Cantabile требует певучей линии, dolce и amabile — мягкости, espressivo — выразительной формы. Affettuoso передаёт теплоту чувства, con anima — одушевлённость, con dolore/dolente — скорбь. Sotto voce сдерживает подачу звука. Эти указания относятся к ведению фразы и не сводятся к одной настройке громкости или темпа.',
      'Cantabile verlangt eine singende Linie, dolce und amabile Sanftheit, espressivo ausdrucksvolle Gestaltung. Affettuoso legt gefühlsvolle Wärme nahe, con anima Beseeltheit, con dolore/dolente Schmerz. Sotto voce nimmt den Vortrag zurück. Diese Angaben betreffen die Gestaltung der Phrase, nicht einen einzigen Lautstärke- oder Temporegler.',
    ),
    lesson: 'dynamics',
    source: notationSources.terms,
    furtherSources: [notationContentSources.expression],
  },
  {
    title: nt(
      'Character: motion and weight',
      'Характер: движение и вес',
      'Charakter: Bewegung und Gewicht',
    ),
    aliases: nt(
      'agitato; animato; brillante; con brio; furioso; tempestoso; tumultuoso; maestoso; marciale; grave; serioso; giusto; grazioso; giocoso; scherzando; piacevole; secco',
      'ажитато; анимато; брилланте; кон брио; фуриозо; маэстозо; марциально; граве; сериозо; грациозо; джокозо; скерцандо; сухо',
      'agitato; animato; brillante; con brio; furioso; tempestoso; tumultuoso; maestoso; marciale; grave; serioso; giusto; grazioso; giocoso; scherzando; piacevole; secco',
    ),
    body: nt(
      'Agitato is unsettled, animato animated, brillante brilliant, con brio energetic. Furioso, tempestoso and tumultuoso suggest turbulent intensity. Maestoso gives dignity, marciale a march character, grave/serioso seriousness, giusto an appropriate or regular manner. Grazioso is graceful, giocoso/scherzando playful, piacevole pleasant, secco dry. Compare the character words with the actual dynamics and articulation rather than treating them as synonyms for “fast” or “loud”.',
      'Agitato — взволнованно, animato — оживлённо, brillante — блестяще, con brio — энергично. Furioso, tempestoso и tumultuoso передают бурную напряжённость. Maestoso придаёт величавость, marciale — маршевость, grave/serioso — серьёзность, giusto — уместную или ровную манеру. Grazioso — грациозно, giocoso/scherzando — игриво, piacevole — приятно, secco — сухо. Сопоставляйте характер с выписанной динамикой и артикуляцией, не заменяя все слова указаниями «быстро» или «громко».',
      'Agitato wirkt erregt, animato belebt, brillante glänzend, con brio schwungvoll. Furioso, tempestoso und tumultuoso legen stürmische Intensität nahe. Maestoso gibt Würde, marciale Marschcharakter, grave/serioso Ernst, giusto ein angemessenes oder regelmäßiges Maß. Grazioso ist anmutig, giocoso/scherzando spielerisch, piacevole angenehm, secco trocken. Vergleiche den Charakter mit Dynamik und Artikulation statt alles mit „schnell“ oder „laut“ gleichzusetzen.',
    ),
    lesson: 'dynamics',
    source: notationSources.terms,
    furtherSources: [
      notationContentSources.expression,
      notationContentSources.tumultuoso,
    ],
  },
  {
    title: nt(
      'Subsiding directions',
      'Указания на угасание',
      'Nachlassender Vortrag',
    ),
    aliases: nt(
      'calando; morendo; perdendosi; smorzando',
      'каландо; морендо; пердендоси; сморцандо',
      'calando; morendo; perdendosi; smorzando',
    ),
    body: nt(
      'Calando asks the passage to subside; morendo suggests dying away, perdendosi losing itself, smorzando fading out. The phrase may need both less motion and less intensity. Do not automatically assign every word the same ritardando or volume curve: the printed dynamics, tempo and edition establish the context.',
      'Calando предлагает успокоить и ослабить движение; morendo — замирая, perdendosi — теряясь, smorzando — угасая. Фразе могут понадобиться и меньшая подвижность, и меньшая сила. Не назначайте каждому слову одинаковое замедление или кривую громкости: контекст задают выписанные темп, динамика и редакция.',
      'Calando lässt die Passage nachlassen; morendo bedeutet ersterbend, perdendosi sich verlierend, smorzando verlöschend. Die Phrase kann weniger Bewegung und weniger Intensität verlangen. Ordne nicht jedem Wort dieselbe Verzögerung oder Lautstärkekurve zu: gedruckte Dynamik, Tempo und Ausgabe bestimmen den Zusammenhang.',
    ),
    lesson: 'dynamics',
    source: notationSources.terms,
    furtherSources: [notationSources.tempo, notationContentSources.expression],
  },
  {
    title: nt(
      'Mancando: historical vocabulary',
      'Mancando: историческое указание',
      'Mancando: historischer Wortgebrauch',
    ),
    aliases: nt('mancando', 'манкандо; ослабевая', 'mancando'),
    body: nt(
      'Mancando asks the sound to lose strength. Dolmetsch’s dictionary describes fading, while its tempo table includes slowing as well as softening, as does Wolf’s 1985 account. These descriptions guide interpretation; they do not prescribe a numerical tempo or gain curve. Decide how the passage subsides from its phrase, instrument and edition.',
      'Mancando — ослабевая. Словарь Dolmetsch описывает угасание, а таблица темпов того же издания включает замедление вместе с ослаблением звучности, как и изложение Вольфа 1985 года. Эти толкования направляют исполнение, но не задают числовой кривой темпа или громкости. Характер угасания определяют фраза, инструмент и редакция.',
      'Mancando verlangt ein Nachlassen der Klangstärke. Das Dolmetsch-Wörterbuch beschreibt ein Verlöschen; seine Tempotabelle nennt zusätzlich eine Verlangsamung, ebenso wie Wolfs Darstellung von 1985. Daraus folgt keine feste Tempo- oder Lautstärkekurve. Phrase, Instrument und Ausgabe bestimmen, wie die Passage nachlässt.',
    ),
    lesson: 'dynamics',
    source: notationContentSources.mancando,
    furtherSources: [
      notationSources.tempo,
      {
        title:
          'S33 · Erich Wolf · Allgemeine Musiklehre · 7., korrigierte Auflage 1985, Nachdruck 2016 · §15b, p.28 · Historical wording only',
        url: 'https://github.com/alex-michels/one-music-lab/blob/main/docs/sources.md',
      },
    ],
  },
  {
    title: nt(
      'Acciaccatura: distinguish the usage',
      'Аччаккатура: различайте значения',
      'Acciaccatura: Gebrauch unterscheiden',
    ),
    aliases: nt(
      'acciaccatura; short grace',
      'аччаккатура; короткий форшлаг',
      'Acciaccatura; kurzer Vorschlag; Zusammenschlag',
    ),
    body: nt(
      'Modern references often use acciaccatura for a small slashed grace note. Older keyboard usage can instead concern a crushed added tone within a chord. These are not interchangeable instructions. Recognize the printed form and consult the edition; a slash alone does not license a universal duration or onset.',
      'В современных справочниках acciaccatura часто называют мелкую перечёркнутую ноту форшлага. В старой клавирной практике слово может относиться к добавленному, быстро снимаемому звуку внутри аккорда. Это не взаимозаменяемые указания. Определите форму записи и обратитесь к редакции; одна черта не задаёт универсальные длительность и момент вступления.',
      'Moderne Nachschlagewerke verwenden Acciaccatura häufig für eine kleine durchstrichene Vorschlagsnote. Älterer Tasteninstrumentengebrauch kann dagegen einen kurz angeschlagenen Zusatzton im Akkord meinen. Die Anweisungen sind nicht austauschbar. Erkenne die Schreibform und beachte die Ausgabe; ein Strich allein legt Dauer und Einsatz nicht allgemeingültig fest.',
    ),
    lesson: 'articulation',
    source: notationContentSources.acciaccatura,
    furtherSources: [notationContentSources.ornamentNames],
  },
  {
    title: nt(
      'Unslashed grace note',
      'Неперечёркнутый форшлаг',
      'Nicht durchstrichener Vorschlag',
    ),
    body: nt(
      'A small note without the slash is a distinct written form, often associated with an appoggiatura or long grace. Its size does not tell you a universal fraction of the principal note. Recognition here stops at the notation; realization belongs to the specified period, instrument and edition.',
      'Мелкая нота без черты — отдельная форма записи, часто связанная с долгим форшлагом, апподжиатурой. Размер головки не определяет универсальную долю основной ноты. Здесь требуется узнать запись; исполнение зависит от указанной эпохи, инструмента и редакции.',
      'Eine kleine Note ohne Strich ist eine eigene Schreibform, oft mit Appoggiatura oder langem Vorschlag verbunden. Die Kopfgröße bestimmt keinen allgemeinen Anteil am Hauptnotenwert. Hier geht es ums Erkennen; die Ausführung gehört zur angegebenen Epoche, zum Instrument und zur Ausgabe.',
    ),
    lesson: 'articulation',
    source: notationContentSources.grace,
  },
  {
    title: nt(
      'Non legato and leggiero',
      'Нон легато и легджиеро',
      'Non legato und leggiero',
    ),
    aliases: nt(
      'non legato; leggiero; leggero',
      'нон легато; легджиеро; легко',
      'non legato; leggiero; leggero',
    ),
    body: nt(
      'Non legato asks for notes that are not joined. Leggiero (also leggero) asks for lightness of delivery, not automatically shorter written values. A light phrase can still be connected. Read these words together with any slurs, dots and dynamic marks.',
      'Нон легато требует несвязного исполнения нот. Leggiero (также leggero) означает лёгкость подачи, а не автоматическое сокращение записанных длительностей. Лёгкая фраза может оставаться связной. Учитывайте лиги, точки и динамические знаки рядом с этими словами.',
      'Non legato verlangt unverbundene Töne. Leggiero (auch leggero) verlangt Leichtigkeit, nicht automatisch kürzere Notenwerte. Eine leichte Phrase kann dennoch gebunden sein. Lies die Wörter zusammen mit Bögen, Punkten und dynamischen Angaben.',
    ),
    lesson: 'articulation',
    source: notationSources.terms,
  },
  {
    title: nt('Segue', 'Сегве', 'Segue'),
    body: nt(
      'Segue asks you to continue. In a repeated-pattern context it can maintain an established manner, as simile does; in a transition it may require continuation without a break. Determine what continues from the surrounding instruction, not from the word alone.',
      'Segue означает «продолжайте». При повторяющемся рисунке оно может сохранять установленную манеру, подобно simile; при переходе — требовать продолжения без перерыва. Что именно продолжается, определяют по окружающему указанию, а не по одному слову.',
      'Segue bedeutet weiterführen. Bei einem wiederkehrenden Muster kann es wie simile die bisherige Art fortsetzen; bei einem Übergang kann es eine Fortsetzung ohne Unterbrechung verlangen. Was weitergeführt wird, ergibt sich aus der umgebenden Anweisung.',
    ),
    lesson: 'repeats',
    source: notationSources.terms,
  },
  {
    title: nt(
      'Chord symbols',
      'Буквенные обозначения аккордов',
      'Akkordsymbole',
    ),
    body: nt(
      'A chord symbol names a root and a chord type; a slash can specify a different bass. It does not prescribe one voicing or rhythm. In the Chords topic compare a symbol with its spelled chord tones and bass. Figured bass instead specifies intervals above a given bass; the two systems cannot simply exchange labels.',
      'Буквенное обозначение аккорда задаёт основной тон и тип; косая черта может уточнять другой бас. Оно не предписывает единственное расположение или ритм. В разделе «Аккорды» сопоставьте международное обозначение со звуками аккорда и басом. Цифрованный бас, напротив, задаёт интервалы над данным басом; обозначения этих систем нельзя просто заменять друг другом.',
      'Ein Akkordsymbol nennt Grundton und Akkordtyp; ein Schrägstrich kann einen anderen Basston bestimmen. Es schreibt weder eine einzige Lage noch einen Rhythmus vor. Vergleiche im Thema Akkorde das Symbol mit Akkordtönen und Bass. Generalbass bezeichnet dagegen Intervalle über einem gegebenen Bass; die Systeme können ihre Bezeichnungen nicht einfach austauschen.',
    ),
    lesson: 'chords',
    source: notationContentSources.chords,
    relatedTopics: ['repeats'],
  },
  {
    title: nt(
      'Why extend notation?',
      'Зачем расширять нотацию?',
      'Warum Notation erweitern?',
    ),
    aliases: nt(
      'proportional notation; action notation; microtones; clusters; open score',
      'пропорциональная нотация; нотация действий; микроинтервалы; кластеры; открытая форма',
      'proportionale Notation; Aktionsschrift; Mikrointervalle; Cluster; offene Partitur',
    ),
    body: nt(
      'A composer may need to indicate an action, a sound mass, pitches outside a conventional scale, or timing without a regular beat. Ordinary noteheads and barlines may then need additional signs or a different layout. A graphic score can specify some choices and leave others open. Its legend decides whether distance means elapsed time, gesture or something else; this is not a single replacement system for all music.',
      'Композитору может понадобиться обозначить действие, звуковую массу, высоты вне привычного звукоряда или время без регулярного пульса. Тогда обычные головки и тактовые черты дополняются знаками или иной организацией страницы. Графическая партитура может закреплять одни решения и оставлять другие открытыми. Её пояснения определяют, означает ли расстояние время, жест или что-то другое; это не единая замена всей музыкальной записи.',
      'Ein Komponist kann eine Handlung, eine Klangmasse, Tonhöhen außerhalb einer gewohnten Skala oder Zeit ohne regelmäßigen Puls bezeichnen wollen. Gewöhnliche Notenköpfe und Taktstriche benötigen dann Ergänzungen oder eine andere Anordnung. Eine grafische Partitur kann einige Entscheidungen festlegen und andere offenlassen. Ihre Legende bestimmt, ob Abstand Zeit, Geste oder anderes bedeutet; sie ist kein einheitlicher Ersatz für jede Musik.',
    ),
    lesson: 'staff',
    source: notationSources.graphic,
    furtherSources: [
      notationContentSources.pitches,
      notationContentSources.graphicHistory,
    ],
    forwardModules: ['N05'],
  },
  {
    title: nt(
      'Pitch-name systems',
      'Системы названий нот',
      'Systeme der Tonbenennung',
    ),
    aliases: nt(
      'German H; German B; scientific pitch; Helmholtz',
      'немецкая H; немецкая B; система Гельмгольца; научная нотация',
      'H und B; wissenschaftliche Tonhöhenbezeichnung; Helmholtz',
    ),
    body: nt(
      'Optional reference for reading another naming tradition: German H is English B natural, while German B is English B-flat. Scientific C4 and Helmholtz c′ identify middle C; Russian names that register the first octave. These correspondences compare written systems, not different sounds. Ordinary lessons teach the system of the selected language.',
      'Необязательная справка для чтения другой традиции: немецкая H — си, немецкая B — си-бемоль; в английской системе B — си, B-flat — си-бемоль. До первой октавы соответствует научному C4 и обозначению Гельмгольца c′. Сопоставляются системы записи, а не разные звуки. Обычные уроки используют систему выбранного языка.',
      'Optionale Hilfe zum Lesen einer anderen Tradition: Deutsches H entspricht englischem B natural, deutsches B dem englischen B-flat. Das wissenschaftliche C4 und Helmholtz’ c′ bezeichnen dasselbe mittlere C; die russische Tradition nennt diesen Bereich erste Oktave. Verglichen werden Schreibsysteme, nicht verschiedene Klänge. Die regulären Lektionen unterrichten das System der gewählten Sprache.',
    ),
    lesson: 'note-names',
    source: notationContentSources.frequencies,
    furtherSources: [notationContentSources.names],
  },
] as const;
