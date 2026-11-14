import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'scales',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: ['sound', 'enharmonics', 'tempo'],
    locales: ['en', 'ru', 'de'],
    kind: 'concept',
    module: null,
    roadmapIds: [],
    lessonIds: ['scales'],
    experimentIds: ['scales'],
    exerciseIds: [],
    conceptIds: ['Scale'],
  },
  lesson: {
    id: 'scales',
    version: 2,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'scales',
    title: {
      en: 'Scales & modes',
      ru: 'Гаммы и лады',
      de: 'Tonleitern & Modi',
    },
    category: {
      en: 'Melody',
      ru: 'Мелодия',
      de: 'Melodie',
    },
    summary: {
      en: 'Recognize the step pattern and listen for a tonal centre.',
      ru: 'Распознавайте последовательность тонов и полутонов и вслушивайтесь в ладовую опору.',
      de: 'Erkenne das Schrittmuster und höre auf das tonale Zentrum.',
    },
    formula: {
      en: 'Major scale steps, in semitones: 2 – 2 – 1 – 2 – 2 – 2 – 1',
      ru: 'Шаги мажорной гаммы в полутонах: 2 – 2 – 1 – 2 – 2 – 2 – 1',
      de: 'Schritte der Durtonleiter in Halbtönen: 2 – 2 – 1 – 2 – 2 – 2 – 1',
    },
    paragraphs: [
      {
        en: 'A scale orders a collection of pitches. A major scale follows a repeating pattern of whole tones and semitones. A mode also concerns how a tonal centre and characteristic notes are heard; it is more than starting a familiar scale on another note.',
        ru: 'Звукоряд — это ряд звуков, расположенных по высоте. Мажорная гамма следует определённой последовательности тонов и полутонов. Лад связан также с ощущением опоры и характерных ступеней: это больше, чем начало знакомой гаммы с другой ноты.',
        de: 'Eine Tonleiter ordnet eine Auswahl von Tonhöhen. Die Durtonleiter folgt einer wiederkehrenden Folge von Ganz- und Halbtonschritten. Ein Modus betrifft auch die Wahrnehmung eines tonalen Zentrums und charakteristischer Töne; er ist mehr als eine bekannte Tonleiter mit einem anderen Anfangston.',
      },
      {
        en: 'Try major, natural minor, Dorian and pentatonic collections in the lab. The blues example is a six-note equal-tempered simplification. Expressive blue notes are not restricted to fixed piano-key pitches.',
        ru: 'Сравните мажор, натуральный минор, дорийский лад и пентатонику. Блюзовый пример — упрощённый шестиступенный звукоряд в равномерной темперации. Выразительные блюзовые ноты не ограничены фиксированными высотами клавиш.',
        de: 'Probiere Dur, natürliches Moll, Dorisch und pentatonische Tonleitern im Labor aus. Das Bluesbeispiel ist eine gleichstufige Vereinfachung mit sechs Tönen. Ausdrucksvolle Blue Notes sind nicht auf feste Klaviertonhöhen beschränkt.',
      },
    ],
    guide: {
      question: {
        en: 'Why do C major and C Dorian sound different when both run from C up to the next C?',
        ru: 'Почему до мажор и дорийский лад от до звучат по-разному, хотя оба начинаются и заканчиваются нотой до?',
        de: 'Warum klingen C-Dur und Dorisch auf C verschieden, obwohl beide von C bis zum nächsten C laufen?',
        ruMarkup:
          'Почему [[до]] мажор и дорийский лад от [[до]] звучат по-разному, хотя оба начинаются и заканчиваются нотой [[до]]?',
      },
      example: [
        {
          en: 'Start on C. The major scale begins with two steps of 2 semitones each: two semitones above C is D, and two more bring you to E.',
          ru: 'Начните с ноты до. Мажорная гамма начинается с двух шагов по 2 полутона: на два полутона выше до находится ре, ещё на два выше — ми.',
          de: 'Beginne bei C. Die Durtonleiter beginnt mit zwei Schritten von je 2 Halbtönen: Zwei Halbtöne über C liegt D, zwei weitere führen zu E.',
          ruMarkup:
            'Начните с ноты [[до]]. Мажорная гамма начинается с двух шагов по 2 полутона: на два полутона выше [[до]] находится [[ре]], ещё на два выше — [[ми]].',
        },
        {
          en: 'The third step is 1 semitone: from E to F. The next three steps, 2 – 2 – 2, give G, A and B.',
          ru: 'Третий шаг равен одному полутону: от ми к фа. Следующие три шага, 2 – 2 – 2, дают соль, ля и си.',
          de: 'Der dritte Schritt ist 1 Halbton: von E nach F. Die nächsten drei Schritte, 2 – 2 – 2, ergeben G, A und H.',
          ruMarkup:
            'Третий шаг равен одному полутону: от [[ми]] к [[фа]]. Следующие три шага, 2 – 2 – 2, дают [[соль]], [[ля]] и [[си]].',
        },
        {
          en: 'The last step is 1 semitone again: from B to C. You now have the C major scale: C D E F G A B C.',
          ru: 'Последний шаг снова равен одному полутону: от си к до. Получилась гамма до мажор: до, ре, ми, фа, соль, ля, си, до.',
          de: 'Der letzte Schritt ist wieder 1 Halbton: von H nach C. Damit hast du die C-Dur-Tonleiter: C D E F G A H C.',
          ruMarkup:
            'Последний шаг снова равен одному полутону: от [[си]] к [[до]]. Получилась гамма [[до]] мажор: [[до]], [[ре]], [[ми]], [[фа]], [[соль]], [[ля]], [[си]], [[до]].',
        },
        {
          en: 'Number the degrees from the tonic, C. The third degree is E and the seventh degree is B.',
          ru: 'Пронумеруйте ступени, начиная с тоники до. Третья ступень — ми, седьмая — си.',
          de: 'Nummeriere die Stufen vom Grundton C aus. Die dritte Stufe ist E, die siebte H.',
          ruMarkup:
            'Пронумеруйте ступени, начиная с тоники [[до]]. Третья ступень — [[ми]], седьмая — [[си]].',
        },
        {
          en: 'In the C Dorian example exactly these two degrees are a semitone lower, E♭ and B♭. The tonic is still C.',
          ru: 'В примере «Дорийский лад от до» именно эти две ступени звучат на полутон ниже: ми-бемоль и си-бемоль. Тоника по-прежнему до.',
          de: 'Im Beispiel „Dorisch auf C“ liegen genau diese beiden Stufen einen Halbton tiefer: Es und B. Der Grundton bleibt C.',
          ruMarkup:
            'В примере «Дорийский лад от [[до]]» именно эти две ступени звучат на полутон ниже: [[ми-бемоль]] и [[си-бемоль]]. Тоника по-прежнему [[до]].',
        },
      ],
      listen: {
        en: 'Play C major, then C Dorian. Both run from C4 up to C5. Listen especially to the third and seventh degrees: C major has E and B there, C Dorian has E♭ and B♭. All the other notes are the same.',
        ru: 'Послушайте «До мажор», затем «Дорийский лад от до». Оба примера поднимаются от до первой октавы к до второй. Особенно вслушайтесь в третью и седьмую ступени: в до мажоре это ми и си, в дорийском ладу — ми-бемоль и си-бемоль. Остальные звуки совпадают.',
        de: 'Spiele C-Dur und danach Dorisch auf C. Beide laufen von c′ bis c″. Achte besonders auf die dritte und siebte Stufe: In C-Dur sind es E und H, in Dorisch auf C sind es Es und B. Alle übrigen Töne sind gleich.',
        ruMarkup:
          'Послушайте «[[До]] мажор», затем «Дорийский лад от [[до]]». Оба примера поднимаются от [[до]] первой октавы к [[до]] второй. Особенно вслушайтесь в третью и седьмую ступени: в [[до]] мажоре это [[ми]] и [[си]], в дорийском ладу — [[ми-бемоль]] и [[си-бемоль]]. Остальные звуки совпадают.',
      },
      mistake: {
        en: 'It is easy to think a mode is just a familiar scale started on another note. It is more than that: a mode also concerns how a tonal centre and characteristic notes are heard. In the two examples the tonic stays C, and the third and seventh degrees change.',
        ru: 'Лад легко принять за знакомую гамму, просто начатую с другой ноты. Но лад — это больше: он связан также с ощущением опоры и характерных ступеней. В двух примерах тоника остаётся прежней, до, а меняются третья и седьмая ступени.',
        de: 'Es liegt nahe, einen Modus für eine bekannte Tonleiter zu halten, die bloß mit einem anderen Ton beginnt. Er ist mehr: Ein Modus betrifft auch die Wahrnehmung eines tonalen Zentrums und charakteristischer Töne. In den beiden Beispielen bleibt der Grundton C, und die dritte und siebte Stufe ändern sich.',
        ruMarkup:
          'Лад легко принять за знакомую гамму, просто начатую с другой ноты. Но лад — это больше: он связан также с ощущением опоры и характерных ступеней. В двух примерах тоника остаётся прежней, [[до]], а меняются третья и седьмая ступени.',
      },
      takeaways: [
        {
          en: 'A scale is an ordered collection of pitches; on its own it does not describe a complete musical tradition.',
          ru: 'Звукоряд — это ряд звуков, расположенных по высоте; сам по себе он не описывает музыкальную традицию целиком.',
          de: 'Eine Tonleiter ist eine geordnete Auswahl von Tonhöhen; allein beschreibt sie keine vollständige musikalische Tradition.',
        },
        {
          en: 'The major scale follows the steps 2 – 2 – 1 – 2 – 2 – 2 – 1 in semitones; from C that gives C D E F G A B C.',
          ru: 'Шаги мажорной гаммы в полутонах: 2 – 2 – 1 – 2 – 2 – 2 – 1; от до получается до, ре, ми, фа, соль, ля, си, до.',
          de: 'Die Durtonleiter folgt in Halbtönen den Schritten 2 – 2 – 1 – 2 – 2 – 2 – 1; von C aus ergibt das C D E F G A H C.',
          ruMarkup:
            'Шаги мажорной гаммы в полутонах: 2 – 2 – 1 – 2 – 2 – 2 – 1; от [[до]] получается [[до]], [[ре]], [[ми]], [[фа]], [[соль]], [[ля]], [[си]], [[до]].',
        },
        {
          en: 'A mode is more than a familiar scale started on another note: it also concerns the tonal centre and characteristic notes.',
          ru: 'Лад — это больше, чем знакомая гамма, начатая с другой ноты: он связан также с ощущением опоры и характерных ступеней.',
          de: 'Ein Modus ist mehr als eine bekannte Tonleiter mit einem anderen Anfangston: Er betrifft auch das tonale Zentrum und charakteristische Töne.',
        },
        {
          en: 'In the examples, C major and C Dorian share the tonic C and differ in the third and seventh degrees.',
          ru: 'В примерах до мажор и дорийский лад от до имеют общую тонику и различаются третьей и седьмой ступенями.',
          de: 'In den Beispielen haben C-Dur und Dorisch auf C denselben Grundton und unterscheiden sich in der dritten und siebten Stufe.',
          ruMarkup:
            'В примерах [[до]] мажор и дорийский лад от [[до]] имеют общую тонику и различаются третьей и седьмой ступенями.',
        },
      ],
    },
    sourceId: 'source-046',
    experimentId: 'scales',
  },
  experiment: {
    id: 'scales',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'scales',
    instructions: {
      en: 'Use the same tonic for major and Dorian. Listen especially to the third and seventh scale degrees.',
      ru: 'Сравните мажор и дорийский лад от одной тоники. Обратите внимание на третью и седьмую ступени.',
      de: 'Wähle für Dur und Dorisch denselben Grundton. Achte besonders auf die dritte und siebte Stufe.',
    },
    engine: 'sound-lab',
    preset: {
      hz: 261.625565,
      wave: 'triangle',
    },
  },
  exercises: [],
  concepts: [
    {
      id: 'Scale',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'scales',
      order: 53,
      reference: false,
      title: {
        en: 'Scale',
        ru: 'Звукоряд',
        de: 'Tonleiter',
      },
      body: {
        en: 'An ordered collection of pitches. A scale alone does not describe a complete musical tradition.',
        ru: 'Ряд звуков, расположенных по высоте. Сам по себе звукоряд не описывает музыкальную традицию целиком.',
        de: 'Eine geordnete Auswahl von Tonhöhen. Eine Tonleiter allein beschreibt keine vollständige musikalische Tradition.',
      },
    },
  ],
};
export default content;
