import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'enharmonics',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: ['note-names'],
    locales: ['en', 'ru', 'de'],
    kind: 'sign',
    module: 'F03',
    roadmapIds: ['014'],
    lessonIds: ['enharmonics'],
    experimentIds: ['enharmonics'],
    exerciseIds: ['enharmonic-respelling'],
    conceptIds: [
      'Enharmonic spelling',
      'Letter name',
      'Scale degree',
      'Raised degree',
      'Lowered degree',
      'Chromatic semitone',
      'Diatonic semitone',
    ],
  },
  lesson: {
    id: 'enharmonics',
    version: 2,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'enharmonics',
    title: {
      en: 'Two spellings, one sound',
      ru: 'Две записи, один звук',
      de: 'Zwei Schreibweisen, ein Klang',
    },
    category: {
      en: 'Notation',
      ru: 'Нотация',
      de: 'Notenschrift',
    },
    summary: {
      en: 'Tell enharmonic spellings apart and know why the spelling matters.',
      ru: 'Различайте энгармонически равные ноты и понимайте, зачем нужна каждая запись.',
      de: 'Enharmonische Schreibweisen unterscheiden und ihren Sinn verstehen.',
    },
    formula: {
      en: 'C♯ = D♭ · F♯ = G♭ · E = F♭ · in equal temperament',
      ru: 'до-диез = ре-бемоль · фа-диез = соль-бемоль · ми = фа-бемоль · в равномерной темперации',
      de: 'Cis = Des · Fis = Ges · E = Fes · in gleichstufiger Stimmung',
      ruMarkup:
        '[[до-диез]] = [[ре-бемоль]] · [[фа-диез]] = [[соль-бемоль]] · [[ми]] = [[фа-бемоль]] · в равномерной темперации',
    },
    paragraphs: [
      {
        en: 'In twelve-tone equal temperament one pitch can be written in more than one way. C sharp and D flat sound the same; so do F sharp and G flat, and E and F flat. Each spelling names a different letter, and the letter decides which scale degree the note occupies.',
        ru: 'В двенадцатиступенной равномерной темперации один и тот же звук можно записать по-разному. До-диез и ре-бемоль звучат одинаково; так же соотносятся фа-диез и соль-бемоль, ми и фа-бемоль. Каждая запись называет свою основную ступень, и именно она определяет место ноты в звукоряде.',
        de: 'In der zwölfstufigen gleichstufigen Stimmung lässt sich derselbe Klang unterschiedlich schreiben. Cis und Des klingen gleich, ebenso Fis und Ges oder E und Fes. Jede Schreibweise nennt einen anderen Stammton, und der Stammton bestimmt, welche Stufe der Ton in der Tonleiter einnimmt.',
        ruMarkup:
          'В двенадцатиступенной равномерной темперации один и тот же звук можно записать по-разному. [[До-диез]] и [[ре-бемоль]] звучат одинаково; так же соотносятся [[фа-диез]] и [[соль-бемоль]], [[ми]] и [[фа-бемоль]]. Каждая запись называет свою основную ступень, и именно она определяет место ноты в звукоряде.',
      },
      {
        en: 'Spelling identifies the written interval and its harmonic context. C–D sharp spans two letters and is an augmented second; C–E flat spans three letters and is a minor third. A sharp does not oblige the next note to rise, and a flat does not oblige it to fall.',
        ru: 'Запись определяет название интервала и проясняет гармонический контекст. До и ре-диез — соседние ступени, это увеличенная секунда; до и ми-бемоль — ступени через одну, это малая терция. Диез не обязывает следующую ноту идти вверх, а бемоль — вниз.',
        de: 'Die Schreibweise bezeichnet das notierte Intervall und verdeutlicht den harmonischen Zusammenhang. C–Dis umfasst zwei Stammtöne und ist eine übermäßige Sekunde; C–Es umfasst drei Stammtöne und ist eine kleine Terz. Ein Kreuz zwingt den nächsten Ton nicht nach oben, ein Be nicht nach unten.',
        ruMarkup:
          'Запись определяет название интервала и проясняет гармонический контекст. [[До]] и [[ре-диез]] — соседние ступени, это увеличенная секунда; [[до]] и [[ми-бемоль]] — ступени через одну, это малая терция. Диез не обязывает следующую ноту идти вверх, а бемоль — вниз.',
      },
    ],
    guide: {
      question: {
        en: 'If F sharp and G flat are the same key, why does it have two names, and how do I know which one to write?',
        ru: 'Если фа-диез и соль-бемоль — одна и та же клавиша, зачем ей два названия и как понять, какое из них писать?',
        de: 'Wenn Fis und Ges dieselbe Taste sind, warum hat sie dann zwei Namen, und woher weiß ich, welchen ich schreiben soll?',
        ruMarkup:
          'Если [[фа-диез]] и [[соль-бемоль]] — одна и та же клавиша, зачем ей два названия и как понять, какое из них писать?',
      },
      example: [
        {
          en: 'Start on C and count three semitones up. In twelve-tone equal temperament you arrive at one key, and that key can be written in more than one way.',
          ru: 'Начните с до и отсчитайте три полутона вверх. В двенадцатиступенной равномерной темперации вы придёте к одной клавише, а записать её можно по-разному.',
          de: 'Beginne bei C und zähle drei Halbtöne aufwärts. In der zwölfstufigen gleichstufigen Stimmung kommst du bei einer einzigen Taste an, und sie lässt sich unterschiedlich schreiben.',
          ruMarkup:
            'Начните с [[до]] и отсчитайте три полутона вверх. В двенадцатиступенной равномерной темперации вы придёте к одной клавише, а записать её можно по-разному.',
        },
        {
          en: 'Write it with the letter D: D sharp. C–D sharp spans two letters, C and D, and is an augmented second.',
          ru: 'Запишите её как ре-диез: основная ступень здесь ре. До и ре-диез — соседние ступени, это увеличенная секунда.',
          de: 'Schreibe sie mit dem Stammton D: Dis. C–Dis umfasst zwei Stammtöne, C und D, und ist eine übermäßige Sekunde.',
          ruMarkup:
            'Запишите её как [[ре-диез]]: основная ступень здесь [[ре]]. [[До]] и [[ре-диез]] — соседние ступени, это увеличенная секунда.',
        },
        {
          en: 'Now write it with the letter E: E flat. C–E flat spans three letters, C, D and E, and is a minor third.',
          ru: 'Теперь запишите её как ми-бемоль: основная ступень здесь ми. До и ми-бемоль — ступени через одну, это малая терция.',
          de: 'Schreibe sie nun mit dem Stammton E: Es. C–Es umfasst drei Stammtöne, C, D und E, und ist eine kleine Terz.',
          ruMarkup:
            'Теперь запишите её как [[ми-бемоль]]: основная ступень здесь [[ми]]. [[До]] и [[ми-бемоль]] — ступени через одну, это малая терция.',
        },
        {
          en: 'Both spellings sound alike here, so the sounding key alone cannot choose between them. The letters decide the name of the written interval, and the harmonic context decides which spelling is written.',
          ru: 'Звучат обе записи здесь одинаково, поэтому по одной звучащей клавише запись не выбрать. Название интервала определяют основные ступени, а запись выбирают по гармоническому контексту.',
          de: 'Beide Schreibweisen klingen hier gleich, die klingende Taste allein bestimmt die Schreibweise also nicht. Die Stammtöne bestimmen den Namen des notierten Intervalls; über die Schreibweise entscheidet der harmonische Zusammenhang.',
        },
      ],
      listen: {
        en: 'Play “F♯4, the same key as G♭4”. It is a single sound: in equal temperament the two spellings do not differ to the ear. In the lab, set F♯4, then look for G♭4: both names point at one frequency.',
        ru: 'Послушайте «фа-диез первой октавы — та же клавиша, что соль-бемоль». Звук здесь один: в равномерной темперации две записи на слух не различаются. В лаборатории установите фа-диез первой октавы, затем найдите соль-бемоль: оба названия указывают на одну частоту.',
        de: 'Spiele „fis′, dieselbe Taste wie ges′“. Es ist ein einziger Klang: In gleichstufiger Stimmung unterscheiden sich die beiden Schreibweisen für das Ohr nicht. Stelle im Labor fis′ ein und suche danach ges′: Beide Namen führen auf dieselbe Frequenz.',
        ruMarkup:
          'Послушайте «[[фа-диез]] первой октавы — та же клавиша, что [[соль-бемоль]]». Звук здесь один: в равномерной темперации две записи на слух не различаются. В лаборатории установите [[фа-диез]] первой октавы, затем найдите [[соль-бемоль]]: оба названия указывают на одну частоту.',
      },
      mistake: {
        en: 'Because F sharp and G flat sound the same in equal temperament, it is tempting to treat them as one note. They are written on different letters, so when a task asks for one spelling, the other is not the answer. Keep the requested spelling in view, not only the sound.',
        ru: 'Раз фа-диез и соль-бемоль в равномерной темперации звучат одинаково, хочется считать их одной нотой. Но они записаны на разных ступенях, и если в задании нужна одна запись, другая ответом не будет. Учитывайте требуемое написание, а не только звучание.',
        de: 'Weil Fis und Ges in gleichstufiger Stimmung gleich klingen, liegt es nahe, sie für denselben Ton zu halten. Beide gehören aber zu verschiedenen Stammtönen: Verlangt eine Aufgabe die eine Schreibweise, ist die andere nicht die Antwort. Achte auf die geforderte Schreibweise, nicht nur auf den Klang.',
        ruMarkup:
          'Раз [[фа-диез]] и [[соль-бемоль]] в равномерной темперации звучат одинаково, хочется считать их одной нотой. Но они записаны на разных ступенях, и если в задании нужна одна запись, другая ответом не будет. Учитывайте требуемое написание, а не только звучание.',
      },
      takeaways: [
        {
          en: 'In twelve-tone equal temperament one pitch can be written in more than one way: C sharp and D flat sound the same.',
          ru: 'В двенадцатиступенной равномерной темперации один и тот же звук можно записать по-разному: до-диез и ре-бемоль звучат одинаково.',
          de: 'In der zwölfstufigen gleichstufigen Stimmung lässt sich derselbe Klang unterschiedlich schreiben: Cis und Des klingen gleich.',
          ruMarkup:
            'В двенадцатиступенной равномерной темперации один и тот же звук можно записать по-разному: [[до-диез]] и [[ре-бемоль]] звучат одинаково.',
        },
        {
          en: 'Each spelling names a different letter, and the letter decides which scale degree the note occupies.',
          ru: 'Каждая запись называет свою основную ступень, и именно она определяет место ноты в звукоряде.',
          de: 'Jede Schreibweise nennt einen anderen Stammton, und der Stammton bestimmt, welche Stufe der Ton in der Tonleiter einnimmt.',
        },
        {
          en: 'The letters decide the name of the written interval (C–D sharp is an augmented second, C–E flat a minor third), and the harmonic context decides which spelling is written.',
          ru: 'Название интервала определяют основные ступени (до и ре-диез — увеличенная секунда, до и ми-бемоль — малая терция), а запись выбирают по гармоническому контексту.',
          de: 'Die Stammtöne bestimmen den Namen des notierten Intervalls (C–Dis ist eine übermäßige Sekunde, C–Es eine kleine Terz); welche Schreibweise gewählt wird, entscheidet der harmonische Zusammenhang.',
          ruMarkup:
            'Название интервала определяют основные ступени ([[до]] и [[ре-диез]] — увеличенная секунда, [[до]] и [[ми-бемоль]] — малая терция), а запись выбирают по гармоническому контексту.',
        },
        {
          en: 'A sharp does not oblige the next note to rise, and a flat does not oblige it to fall.',
          ru: 'Диез не обязывает следующую ноту идти вверх, а бемоль — вниз.',
          de: 'Ein Kreuz zwingt den nächsten Ton nicht nach oben, ein Be nicht nach unten.',
        },
      ],
    },
    sourceId: 'source-049',
    experimentId: 'enharmonics',
    reading: {
      pages: '10',
      sourceId: 'source-001',
      text: {
        en: 'A sounding key alone cannot select a spelling. C–D♯ is written as an augmented second and C–E♭ as a minor third: the letters decide the name of the written interval. In 12-TET both span three semitones and sound alike, so the harmonic context decides which spelling is written. A sharp does not oblige the next note to rise, nor a flat to fall.',
        ru: 'По одной звучащей клавише нельзя выбрать запись. До и ре-диез образуют увеличенную секунду, а до и ми-бемоль — малую терцию: название интервала определяют основные ступени. В равномерной темперации оба интервала содержат три полутона и звучат одинаково, поэтому запись выбирают по гармоническому контексту. Диез не обязывает следующую ноту идти вверх, а бемоль — вниз.',
        de: 'Die klingende Taste allein bestimmt die Schreibweise nicht. C–Dis wird als übermäßige Sekunde notiert, C–Es als kleine Terz: Die Stammtöne bestimmen den Namen des notierten Intervalls. In gleichstufiger Stimmung umfassen beide drei Halbtöne und klingen gleich; welche Schreibweise gewählt wird, entscheidet der harmonische Zusammenhang. Ein Kreuz zwingt den folgenden Ton nicht nach oben, ein Be nicht nach unten.',
        ruMarkup:
          'По одной звучащей клавише нельзя выбрать запись. [[До]] и [[ре-диез]] образуют увеличенную секунду, а [[до]] и [[ми-бемоль]] — малую терцию: название интервала определяют основные ступени. В равномерной темперации оба интервала содержат три полутона и звучат одинаково, поэтому запись выбирают по гармоническому контексту. Диез не обязывает следующую ноту идти вверх, а бемоль — вниз.',
      },
      assetIds: [],
    },
  },
  experiment: {
    id: 'enharmonics',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'enharmonics',
    instructions: {
      en: 'Set the lab to F♯4, then look for G♭4, and notice that both names point at one frequency.',
      ru: 'Установите фа-диез первой октавы, затем найдите соль-бемоль и убедитесь, что оба названия указывают на одну частоту.',
      de: 'Stelle fis′ ein, suche danach ges′ und stelle fest, dass beide Namen auf dieselbe Frequenz führen.',
      ruMarkup:
        'Установите [[фа-диез]] первой октавы, затем найдите [[соль-бемоль]] и убедитесь, что оба названия указывают на одну частоту.',
    },
    engine: 'sound-lab',
    preset: {
      hz: 369.994423,
      wave: 'triangle',
    },
    notation: {
      note: {
        letter: 3,
        accidental: 1,
        octave: 4,
      },
      group: 'pitch',
    },
  },
  exercises: [
    {
      id: 'enharmonic-respelling',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'enharmonics',
      label: {
        en: 'Respell the same pitch',
        ru: 'Энгармоническая замена',
        de: 'Enharmonisch umschreiben',
      },
      generator: 'enharmonic',
      sourceIds: ['source-001'],
      kind: 'generated',
    },
  ],
  concepts: [
    {
      id: 'Enharmonic spelling',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'enharmonics',
      order: 87,
      reference: false,
      title: {
        en: 'Enharmonic spelling',
        ru: 'Энгармонизм',
        de: 'Enharmonische Verwechslung',
      },
      body: {
        en: 'Two different written notes that sound as one pitch in equal temperament.',
        ru: 'Совпадение по высоте звуков, разных по названию и записи: в равномерной темперации до-диез и ре-бемоль звучат одинаково. Такие звуки называют энгармонически равными.',
        de: 'Das Umschreiben eines Tons in einen anders benannten Ton, der in gleichstufiger Stimmung gleich hoch klingt, etwa Cis in Des.',
        ruMarkup:
          'Совпадение по высоте звуков, разных по названию и записи: в равномерной темперации [[до-диез]] и [[ре-бемоль]] звучат одинаково. Такие звуки называют энгармонически равными.',
      },
      sourceId: 'source-001',
    },
    {
      id: 'Letter name',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'enharmonics',
      order: 88,
      reference: false,
      title: {
        en: 'Letter name',
        ru: 'Название основной ступени',
        de: 'Stammtonname',
      },
      body: {
        en: 'The plain name of a note with no accidental: C, D, E, F, G, A or B.',
        ru: 'Название ноты без знака альтерации: до, ре, ми, фа, соль, ля или си.',
        de: 'Der Name des Tons ohne Versetzungszeichen: C, D, E, F, G, A oder H.',
        ruMarkup:
          'Название ноты без знака альтерации: [[до]], [[ре]], [[ми]], [[фа]], [[соль]], [[ля]] или [[си]].',
      },
      sourceId: 'source-001',
    },
    {
      id: 'Scale degree',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'enharmonics',
      order: 89,
      reference: false,
      title: {
        en: 'Scale degree',
        ru: 'Ступень звукоряда',
        de: 'Tonleiterstufe',
      },
      body: {
        en: 'The numbered position a note occupies in its scale.',
        ru: 'Порядковое место, которое нота занимает в своём звукоряде.',
        de: 'Die nummerierte Position, die ein Ton in seiner Tonleiter einnimmt.',
      },
      sourceId: 'source-001',
    },
    {
      id: 'Raised degree',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'enharmonics',
      order: 90,
      reference: false,
      title: {
        en: 'Raised degree',
        ru: 'Повышенная ступень',
        de: 'Erhöhte Stufe',
      },
      body: {
        en: 'A degree raised relative to the scale being discussed, usually by a semitone: G becomes G♯ when the seventh degree of A natural minor is raised.',
        ru: 'Ступень, повышенная относительно рассматриваемой гаммы, обычно на полутон: при повышении VII ступени натурального ля минора соль превращается в соль-диез.',
        de: 'Eine gegenüber der betrachteten Tonleiter erhöhte Stufe, meist um einen Halbton: Wird die siebte Stufe der natürlichen a-Moll-Tonleiter erhöht, wird G zu Gis.',
        ruMarkup:
          'Ступень, повышенная относительно рассматриваемой гаммы, обычно на полутон: при повышении VII ступени натурального [[ля]] минора [[соль]] превращается в [[соль-диез]].',
      },
      sourceId: 'source-001',
    },
    {
      id: 'Lowered degree',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'enharmonics',
      order: 91,
      reference: false,
      title: {
        en: 'Lowered degree',
        ru: 'Пониженная ступень',
        de: 'Erniedrigte Stufe',
      },
      body: {
        en: 'A degree lowered relative to the scale being discussed, usually by a semitone: lowering the third degree of C major changes E to E♭.',
        ru: 'Ступень, пониженная относительно рассматриваемой гаммы, обычно на полутон: при понижении III ступени до мажора ми превращается в ми-бемоль.',
        de: 'Eine gegenüber der betrachteten Tonleiter erniedrigte Stufe, meist um einen Halbton: Wird die dritte Stufe von C-Dur erniedrigt, wird E zu Es.',
        ruMarkup:
          'Ступень, пониженная относительно рассматриваемой гаммы, обычно на полутон: при понижении III ступени [[до]] мажора [[ми]] превращается в [[ми-бемоль]].',
      },
      sourceId: 'source-001',
    },
    {
      id: 'Chromatic semitone',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'enharmonics',
      order: 92,
      reference: false,
      title: {
        en: 'Chromatic semitone',
        ru: 'Хроматический полутон',
        de: 'Chromatischer Halbton',
      },
      body: {
        en: 'A semitone between two notes that share a letter, such as C and C sharp.',
        ru: 'Полутон между двумя нотами одной ступени, например до и до-диез.',
        de: 'Ein Halbton zwischen zwei Tönen desselben Stammtons, etwa C und Cis.',
        ruMarkup:
          'Полутон между двумя нотами одной ступени, например [[до]] и [[до-диез]].',
      },
      sourceId: 'source-001',
    },
    {
      id: 'Diatonic semitone',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'enharmonics',
      order: 93,
      reference: false,
      title: {
        en: 'Diatonic semitone',
        ru: 'Диатонический полутон',
        de: 'Diatonischer Halbton',
      },
      body: {
        en: 'A semitone between two neighbouring letters, such as C sharp and D.',
        ru: 'Полутон между двумя соседними ступенями, например до-диез и ре.',
        de: 'Ein Halbton zwischen zwei benachbarten Stammtönen, etwa Cis und D.',
        ruMarkup:
          'Полутон между двумя соседними ступенями, например [[до-диез]] и [[ре]].',
      },
      sourceId: 'source-001',
    },
  ],
};
export default content;
