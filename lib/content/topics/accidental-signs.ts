import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'accidental-signs',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: ['note-names'],
    locales: ['en', 'ru', 'de'],
    kind: 'sign',
    module: 'F03',
    roadmapIds: ['014'],
    lessonIds: ['accidental-signs'],
    experimentIds: ['accidental-signs'],
    exerciseIds: ['alteration-name'],
    conceptIds: [
      'Accidental',
      'Sharp',
      'Flat',
      'Double sharp',
      'Double flat',
      'Natural',
      'Semitone',
      'Whole tone',
    ],
  },
  lesson: {
    id: 'accidental-signs',
    version: 2,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'accidental-signs',
    title: {
      en: 'The five signs',
      ru: 'Пять знаков альтерации',
      de: 'Die fünf Zeichen',
    },
    category: {
      en: 'Notation',
      ru: 'Нотация',
      de: 'Notenschrift',
    },
    summary: {
      en: 'Read the five accidentals and know how far each moves.',
      ru: 'Читайте пять знаков альтерации и знайте, насколько каждый сдвигает высоту.',
      de: 'Die fünf Versetzungszeichen lesen und ihre Wirkung kennen.',
    },
    formula: {
      en: '♯ +1 · ♭ −1 · × +2 · ♭♭ −2 · ♮ 0 (semitones)',
      ru: '♯ +1 · ♭ −1 · × +2 · ♭♭ −2 · ♮ 0 (в полутонах)',
      de: '♯ Kreuz +1 · ♭ Be −1 · × Doppelkreuz +2 · ♭♭ Doppel-Be −2 · ♮ Auflösungszeichen 0 (Halbtöne)',
    },
    paragraphs: [
      {
        en: 'An accidental changes the pitch of the written note it stands before. A sharp raises it by a semitone, a flat lowers it by a semitone; the double sharp raises by a whole tone, the double flat lowers by a whole tone. A natural cancels any of them and restores the unaltered note.',
        ru: 'Знак альтерации меняет высоту ноты, перед которой он стоит. Диез повышает её на полутон, бемоль понижает на полутон. Дубль-диез повышает на целый тон, дубль-бемоль понижает на целый тон. Бекар отменяет действие любого из них и возвращает основную ступень.',
        de: 'Ein Versetzungszeichen verändert die Tonhöhe des Stammtons, vor dem es steht. Das Kreuz erhöht um einen Halbton, das Be erniedrigt um einen Halbton. Das Doppelkreuz erhöht um einen Ganzton, das Doppel-Be erniedrigt um einen Ganzton. Das Auflösungszeichen nimmt die Veränderung zurück und stellt den Stammton wieder her.',
      },
      {
        en: 'The sign stands to the left of the note head, on the same line or space, and is spoken after the letter: C sharp, B flat. The letter itself does not change. To replace a double sharp with a single sharp, the single sign is written alone.',
        ru: 'Знак пишется слева от нотной головки, на той же линейке или в том же промежутке, а в названии идёт после ступени: до-диез, си-бемоль. Сама ступень при этом не меняется: нота остаётся на своём месте на нотоносце. Чтобы заменить дубль-диез простым диезом, пишут один диез.',
        de: 'Das Zeichen steht links vom Notenkopf, auf derselben Linie oder in demselben Zwischenraum. Der Notenkopf bleibt dabei an seinem Platz im Notensystem. Im Deutschen steckt die Veränderung zugleich im Namen: Das Kreuz hängt die Silbe -is an, das Doppelkreuz -isis, aus C werden Cis und Cisis. Das Be hängt -es an, das Doppel-Be -eses, aus D werden Des und Deses. Unregelmäßig gebildet sind Es, As und B; das doppelt erniedrigte H heißt Heses. Soll aus einem Doppelkreuz ein einfaches Kreuz werden, steht das einfache Zeichen allein.',
        ruMarkup:
          'Знак пишется слева от нотной головки, на той же линейке или в том же промежутке, а в названии идёт после ступени: [[до-диез]], [[си-бемоль]]. Сама ступень при этом не меняется: нота остаётся на своём месте на нотоносце. Чтобы заменить дубль-диез простым диезом, пишут один диез.',
      },
    ],
    guide: {
      question: {
        en: 'What do the signs in front of a note do to its pitch, and by how much?',
        ru: 'Что делают с высотой ноты знаки, которые стоят перед ней, и на сколько они её меняют?',
        de: 'Was bewirken die Zeichen, die vor einer Note stehen, und um wie viel verändern sie deren Tonhöhe?',
      },
      example: [
        {
          en: 'Start with a plain C, with no sign in front of it. This natural letter is the point every sign is counted from.',
          ru: 'Возьмите ноту до без знака. Это основная ступень: от неё отсчитывают каждый знак.',
          de: 'Beginne mit einem C ohne Zeichen. Das ist der Stammton: Auf ihn bezieht sich jedes Zeichen.',
          ruMarkup:
            'Возьмите ноту [[до]] без знака. Это основная ступень: от неё отсчитывают каждый знак.',
        },
        {
          en: 'Write a sharp to the left of the note head: C sharp. It sounds one semitone above C (♯ +1).',
          ru: 'Поставьте диез слева от нотной головки: получится до-диез. Он звучит на полутон выше до (♯ +1).',
          de: 'Setze ein Kreuz links vor den Notenkopf: Aus C wird Cis. Der Ton liegt einen Halbton über C (♯ +1).',
          ruMarkup:
            'Поставьте диез слева от нотной головки: получится [[до-диез]]. Он звучит на полутон выше [[до]] (♯ +1).',
        },
        {
          en: 'Write a double sharp instead: C double sharp. It sounds a whole tone, that is two semitones, above C (× +2).',
          ru: 'Поставьте вместо диеза дубль-диез: получится до-дубль-диез. Он звучит на целый тон, то есть на два полутона, выше до (× +2).',
          de: 'Setze stattdessen ein Doppelkreuz: Aus C wird Cisis. Der Ton liegt einen Ganzton, also zwei Halbtöne, über C (× +2).',
          ruMarkup:
            'Поставьте вместо диеза дубль-диез: получится [[до-дубль-диез]]. Он звучит на целый тон, то есть на два полутона, выше [[до]] (× +2).',
        },
        {
          en: 'Now replace the double sharp with a single sharp, written alone. The note is C sharp again: one semitone above C, not three, because signs are not added to one another.',
          ru: 'Теперь замените дубль-диез простым диезом: для этого пишут один диез. Это снова до-диез — на полутон выше до, а не на три полутона, потому что знаки не складываются друг с другом.',
          de: 'Ersetze nun das Doppelkreuz durch ein einfaches Kreuz; dafür steht das einfache Zeichen allein. Der Ton heißt wieder Cis und liegt einen Halbton über C, nicht drei Halbtöne, denn die Zeichen werden nicht addiert.',
          ruMarkup:
            'Теперь замените дубль-диез простым диезом: для этого пишут один диез. Это снова [[до-диез]] — на полутон выше [[до]], а не на три полутона, потому что знаки не складываются друг с другом.',
        },
        {
          en: 'Finally write a natural. It cancels the sign and restores the unaltered note, plain C (♮ 0).',
          ru: 'Наконец, поставьте бекар. Он отменяет действие знака и возвращает основную ступень до (♮ 0).',
          de: 'Setze zum Schluss ein Auflösungszeichen. Es nimmt die Veränderung zurück und stellt den Stammton C wieder her (♮ 0).',
          ruMarkup:
            'Наконец, поставьте бекар. Он отменяет действие знака и возвращает основную ступень [[до]] (♮ 0).',
        },
      ],
      listen: {
        en: 'Play “C4, then C♯4”: the step up is one semitone, the amount a sharp raises a note. Then play “C4, then D4” and compare the two distances: this step is two semitones, a whole tone, the amount a double sharp raises a note.',
        ru: 'Послушайте «до первой октавы, затем до-диез»: шаг вверх равен полутону — на столько диез повышает ноту. Затем послушайте «до первой октавы, затем ре» и сравните два расстояния: этот шаг равен двум полутонам, то есть целому тону, — на столько ноту повышает дубль-диез.',
        de: 'Spiele „c′, dann cis′“: Der Schritt nach oben beträgt einen Halbton – um so viel erhöht ein Kreuz den Ton. Spiele dann „c′, dann d′“ und vergleiche die beiden Abstände: Dieser Schritt beträgt zwei Halbtöne, also einen Ganzton – um so viel erhöht ein Doppelkreuz den Ton.',
        ruMarkup:
          'Послушайте «[[до]] первой октавы, затем [[до-диез]]»: шаг вверх равен полутону — на столько диез повышает ноту. Затем послушайте «[[до]] первой октавы, затем [[ре]]» и сравните два расстояния: этот шаг равен двум полутонам, то есть целому тону, — на столько ноту повышает дубль-диез.',
      },
      mistake: {
        en: 'A sign does not move a note to the neighbouring letter. C sharp keeps the letter C and stays on the same line or space; only its pitch changes. Read the letter first, then check the sign separately: does it raise, lower or cancel?',
        ru: 'Знак не переносит ноту на соседнюю ступень. До-диез пишется на том же месте нотоносца, что и до, и ступень остаётся прежней; меняется только высота. Сначала определите основную ступень, затем отдельно проверьте знак: он повышает, понижает или отменяет альтерацию?',
        de: 'Ein Zeichen verschiebt eine Note nicht zum benachbarten Stammton. Cis steht im Notensystem an derselben Stelle wie C, und der Stammton bleibt C; nur die Tonhöhe ändert sich. Lies zuerst den Stammton und prüfe dann das Zeichen getrennt: Erhöht es, erniedrigt es oder löst es eine Veränderung auf?',
        ruMarkup:
          'Знак не переносит ноту на соседнюю ступень. [[До-диез]] пишется на том же месте нотоносца, что и [[до]], и ступень остаётся прежней; меняется только высота. Сначала определите основную ступень, затем отдельно проверьте знак: он повышает, понижает или отменяет альтерацию?',
      },
      takeaways: [
        {
          en: 'A sharp raises a note by one semitone and a flat lowers it by one; the double signs move it by a whole tone, which is two semitones.',
          ru: 'Диез повышает ноту на полутон, бемоль понижает на полутон; дубль-диез и дубль-бемоль смещают её на целый тон, то есть на два полутона.',
          de: 'Das Kreuz erhöht einen Ton um einen Halbton, das Be erniedrigt ihn um einen Halbton; Doppelkreuz und Doppel-Be verändern ihn um einen Ganzton, also um zwei Halbtöne.',
        },
        {
          en: 'A natural cancels any of these signs and restores the unaltered note.',
          ru: 'Бекар отменяет действие любого из этих знаков и возвращает основную ступень.',
          de: 'Das Auflösungszeichen nimmt die Veränderung zurück und stellt den Stammton wieder her.',
        },
        {
          en: 'Every sign is read from the natural letter, not from the sign before it: signs are not added to one another.',
          ru: 'Каждый знак отсчитывают от основной ступени, а не от предыдущего знака: знаки не складываются друг с другом.',
          de: 'Jedes Zeichen bezieht sich auf den Stammton, nicht auf das vorherige Zeichen: Die Zeichen werden nicht addiert.',
        },
        {
          en: 'The sign is written to the left of the note head, on the same line or space, and spoken after the letter: C sharp.',
          ru: 'Знак пишут слева от нотной головки, на той же линейке или в том же промежутке, а называют после ступени: до-диез.',
          de: 'Das Zeichen steht links vom Notenkopf, auf derselben Linie oder in demselben Zwischenraum; im Namen hängt das Kreuz die Silbe -is an: Cis.',
          ruMarkup:
            'Знак пишут слева от нотной головки, на той же линейке или в том же промежутке, а называют после ступени: [[до-диез]].',
        },
      ],
    },
    sourceId: 'source-048',
    experimentId: 'accidental-signs',
    reading: {
      pages: '6–9',
      sourceId: 'source-002',
      text: {
        en: 'Read each accidental relative to the natural letter, not relative to the last accidental. After a double sharp, a single sharp means one semitone above the natural. Align the sign with the notehead; do not draw a ledger line through the sign. Examples: F–F♯–F𝄪; B–B♭–B𝄫.',
        ru: 'Каждый знак отсчитывают от основной ступени, а не от предыдущего знака. После дубль-диеза диез означает повышение основной ступени на полутон. Знак ставят на высоте головки; добавочная линейка через знак не проходит. Например: фа — фа-диез — фа-дубль-диез; си — си-бемоль — си-дубль-бемоль.',
        de: 'Jedes Zeichen bezieht sich auf den Stammton, nicht auf das vorherige Zeichen. Nach einem Doppelkreuz bedeutet ein Kreuz einen Halbton über dem Stammton. Das Zeichen steht auf Höhe des Notenkopfs; Hilfslinien werden nicht durch das Zeichen gezogen. Beispiele: F–Fis–Fisis; H–B–Heses; E–Es und A–As.',
        ruMarkup:
          'Каждый знак отсчитывают от основной ступени, а не от предыдущего знака. После дубль-диеза диез означает повышение основной ступени на полутон. Знак ставят на высоте головки; добавочная линейка через знак не проходит. Например: [[фа]] — [[фа-диез]] — [[фа-дубль-диез]]; [[си]] — [[си-бемоль]] — [[си-дубль-бемоль]].',
      },
      assetIds: [],
    },
  },
  experiment: {
    id: 'accidental-signs',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'accidental-signs',
    instructions: {
      en: 'Play C4 and C♯4 one after the other, then C4 and D4, and compare the two distances.',
      ru: 'Сыграйте до первой октавы и до-диез, затем до и ре, и сравните два расстояния.',
      de: 'Spiele c′ und cis′ nacheinander, dann c′ und d′, und vergleiche die beiden Abstände.',
      ruMarkup:
        'Сыграйте [[до]] первой октавы и [[до-диез]], затем [[до]] и [[ре]], и сравните два расстояния.',
    },
    engine: 'sound-lab',
    preset: {
      hz: 261.625565,
      wave: 'triangle',
    },
    notation: {
      note: {
        letter: 0,
        accidental: 0,
        octave: 4,
      },
      group: 'pitch',
    },
  },
  exercises: [
    {
      id: 'alteration-name',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-signs',
      label: {
        en: 'Name an altered note',
        ru: 'Название альтерированной ступени',
        de: 'Einen veränderten Ton benennen',
      },
      generator: 'accidental-name',
      sourceIds: ['source-002'],
      kind: 'generated',
    },
  ],
  concepts: [
    {
      id: 'Accidental',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-signs',
      order: 73,
      reference: false,
      title: {
        en: 'Accidental',
        ru: 'Знак альтерации',
        de: 'Versetzungszeichen',
      },
      body: {
        en: 'A sign that specifies a note’s alteration relative to its natural letter name: sharp, flat, double sharp, double flat or natural. A natural restores the unaltered pitch; signs are not added to one another.',
        ru: 'Знак, указывающий изменение основной ступени: диез, бемоль, дубль-диез, дубль-бемоль или бекар. Бекар восстанавливает основную ступень; знаки не складываются друг с другом.',
        de: 'Ein Zeichen, das die Veränderung gegenüber dem Stammton festlegt: Kreuz, Be, Doppelkreuz, Doppel-Be oder Auflösungszeichen. Das Auflösungszeichen stellt den Stammton wieder her; die Zeichen werden nicht addiert.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Sharp',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-signs',
      order: 74,
      reference: false,
      title: {
        en: 'Sharp',
        ru: 'Диез',
        de: 'Kreuz',
      },
      body: {
        en: 'A sign that raises a note one semitone above its natural letter.',
        ru: 'Знак, повышающий основную ступень на полутон.',
        de: 'Ein Zeichen, das den Stammton um einen Halbton erhöht; der Name erhält die Endung -is.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Flat',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-signs',
      order: 75,
      reference: false,
      title: {
        en: 'Flat',
        ru: 'Бемоль',
        de: 'Be',
      },
      body: {
        en: 'A sign that lowers a note one semitone below its natural letter.',
        ru: 'Знак, понижающий основную ступень на полутон.',
        de: 'Ein Zeichen, das den Stammton um einen Halbton erniedrigt. Meist wird -es angehängt; die gebräuchlichen Ausnahmen sind Es, As und B (das erniedrigte H).',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Double sharp',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-signs',
      order: 76,
      reference: false,
      title: {
        en: 'Double sharp',
        ru: 'Дубль-диез',
        de: 'Doppelkreuz',
      },
      body: {
        en: 'A sign that raises a note two semitones above its natural letter.',
        ru: 'Знак, повышающий основную ступень на два полутона.',
        de: 'Ein Zeichen, das den Stammton um einen Ganzton erhöht; der Name erhält die Endung -isis.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Double flat',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-signs',
      order: 77,
      reference: false,
      title: {
        en: 'Double flat',
        ru: 'Дубль-бемоль',
        de: 'Doppel-Be',
      },
      body: {
        en: 'A sign that lowers a note two semitones below its natural letter.',
        ru: 'Знак, понижающий основную ступень на два полутона.',
        de: 'Ein Zeichen, das den Stammton um einen Ganzton erniedrigt. Die Namen lauten Ceses, Deses, Eses, Feses, Geses, Ases und Heses; für Ases kommt auch Asas vor.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Natural',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-signs',
      order: 78,
      reference: false,
      title: {
        en: 'Natural',
        ru: 'Бекар',
        de: 'Auflösungszeichen',
      },
      body: {
        en: 'A sign that removes an earlier raising or lowering of a note.',
        ru: 'Знак, снимающий сделанное ранее повышение или понижение ноты.',
        de: 'Ein Zeichen, das eine Erhöhung oder Erniedrigung zurücknimmt.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Semitone',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-signs',
      order: 79,
      reference: false,
      title: {
        en: 'Semitone',
        ru: 'Полутон',
        de: 'Halbton',
      },
      body: {
        en: 'The smallest step between adjacent keys in twelve-tone equal temperament.',
        ru: 'Наименьший шаг между соседними клавишами в двенадцатиступенной равномерной темперации.',
        de: 'Der kleinste Schritt zwischen benachbarten Tasten in der zwölfstufigen gleichstufigen Stimmung.',
      },
      sourceId: 'source-040',
    },
    {
      id: 'Whole tone',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-signs',
      order: 80,
      reference: false,
      title: {
        en: 'Whole tone',
        ru: 'Целый тон',
        de: 'Ganzton',
      },
      body: {
        en: 'An interval that spans two semitones.',
        ru: 'Интервал, охватывающий два полутона.',
        de: 'Ein Abstand von zwei Halbtönen.',
      },
      sourceId: 'source-040',
    },
  ],
};
export default content;
