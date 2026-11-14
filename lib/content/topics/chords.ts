import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'chords',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: ['sound', 'enharmonics', 'tempo'],
    locales: ['en', 'ru', 'de'],
    kind: 'concept',
    module: null,
    roadmapIds: [],
    lessonIds: ['chords'],
    experimentIds: ['chords'],
    exerciseIds: ['entry-chords'],
    conceptIds: ['Chord symbols', 'Triad', 'Voice leading'],
  },
  lesson: {
    id: 'chords',
    version: 2,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'chords',
    title: {
      en: 'Building a chord',
      ru: 'Как построить аккорд',
      de: 'Einen Akkord aufbauen',
    },
    category: {
      en: 'Harmony',
      ru: 'Гармония',
      de: 'Harmonik',
    },
    summary: {
      en: 'Build major and minor triads and compare their thirds.',
      ru: 'Постройте мажорное и минорное трезвучия и сравните их терции.',
      de: 'Baue Dur- und Molldreiklänge und vergleiche ihre Terzen.',
    },
    formula: {
      en: 'Semitones above the root: major triad 0 · 4 · 7 / minor triad 0 · 3 · 7',
      ru: 'Полутоны от основного тона: мажорное трезвучие 0 · 4 · 7 / минорное 0 · 3 · 7',
      de: 'Halbtöne über dem Grundton: Durdreiklang 0 · 4 · 7 / Molldreiklang 0 · 3 · 7',
    },
    paragraphs: [
      {
        en: 'A triad has three different chord tones that can be arranged in thirds. A major triad has a major third and a perfect fifth above its root: C–E–G, for example. Lower the third by a semitone and you get C–E♭–G, a minor triad. Doubling a tone in another octave adds a voice, but no new chord member.',
        ru: 'В трезвучии три разных звука, которые можно расположить по терциям. В мажорном трезвучии от основного тона строятся большая терция и чистая квинта: например, до — ми — соль. Понизьте терцовый тон на полутон — получится минорное трезвучие до — ми-бемоль — соль. Удвоение звука в другой октаве добавляет голос, но не новый звук в состав аккорда.',
        de: 'Ein Dreiklang enthält drei verschiedene Akkordtöne, die sich in Terzen anordnen lassen. Beim Durdreiklang liegen eine große Terz und eine reine Quinte über dem Grundton, etwa C–E–G. Erniedrige den Terzton um einen Halbton: C–Es–G ist ein Molldreiklang. Eine Oktavverdopplung fügt eine Stimme hinzu, aber keinen neuen Akkordton.',
        ruMarkup:
          'В трезвучии три разных звука, которые можно расположить по терциям. В мажорном трезвучии от основного тона строятся большая терция и чистая квинта: например, [[до]] — [[ми]] — [[соль]]. Понизьте терцовый тон на полутон — получится минорное трезвучие [[до]] — [[ми-бемоль]] — [[соль]]. Удвоение звука в другой октаве добавляет голос, но не новый звук в состав аккорда.',
      },
      {
        en: 'Add one more third above the fifth and you get a four-note chord, a seventh chord. The dominant seventh type is a major triad plus a minor seventh: its tones lie 0, 4, 7 and 10 semitones above the root in twelve-tone equal temperament (C–E–G–B♭). Chord meaning also depends on context, voicing, rhythm and voice leading. An isolated chord cannot explain a whole harmonic style.',
        ru: 'Добавьте к трезвучию ещё одну терцию над квинтовым тоном — получится аккорд из четырёх звуков, септаккорд. Малый мажорный септаккорд (такое строение имеет доминантсептаккорд) — это мажорное трезвучие с малой септимой: его звуки отстоят от основного тона на 0, 4, 7 и 10 полутонов в двенадцатиступенной равномерной темперации (до — ми — соль — си-бемоль). Значение аккорда зависит и от контекста, расположения голосов, ритма и голосоведения. Отдельный аккорд не объясняет гармонический стиль целиком.',
        de: 'Schichtest du über der Quinte eine weitere Terz, entsteht ein Vierklang, der Septakkord. Der Dominantseptakkord ist ein Durdreiklang mit kleiner Septime: Seine Töne liegen in zwölfstufiger gleichstufiger Stimmung 0, 4, 7 und 10 Halbtöne über dem Grundton (C–E–G–B). Die Bedeutung eines Akkords hängt auch von Kontext, Lage, Rhythmus und Stimmführung ab. Ein einzelner Akkord erklärt noch keinen harmonischen Stil.',
        ruMarkup:
          'Добавьте к трезвучию ещё одну терцию над квинтовым тоном — получится аккорд из четырёх звуков, септаккорд. Малый мажорный септаккорд (такое строение имеет доминантсептаккорд) — это мажорное трезвучие с малой септимой: его звуки отстоят от основного тона на 0, 4, 7 и 10 полутонов в двенадцатиступенной равномерной темперации ([[до]] — [[ми]] — [[соль]] — [[си-бемоль]]). Значение аккорда зависит и от контекста, расположения голосов, ритма и голосоведения. Отдельный аккорд не объясняет гармонический стиль целиком.',
      },
    ],
    guide: {
      question: {
        en: 'Which one note has to change to turn the major triad C–E–G into a minor triad?',
        ru: 'Какой один звук нужно изменить, чтобы мажорное трезвучие до — ми — соль стало минорным?',
        de: 'Welchen einen Ton musst du ändern, damit aus dem Durdreiklang C–E–G ein Molldreiklang wird?',
        ruMarkup:
          'Какой один звук нужно изменить, чтобы мажорное трезвучие [[до]] — [[ми]] — [[соль]] стало минорным?',
      },
      example: [
        {
          en: 'Take C as the root. The formula for a major triad is 0 · 4 · 7: the root itself, a tone 4 semitones above it and a tone 7 semitones above it.',
          ru: 'Возьмите до как основной тон. Формула мажорного трезвучия — 0 · 4 · 7: сам основной тон, звук на 4 полутона выше него и звук на 7 полутонов выше него.',
          de: 'Nimm C als Grundton. Die Formel des Durdreiklangs lautet 0 · 4 · 7: der Grundton selbst, ein Ton 4 Halbtöne darüber und ein Ton 7 Halbtöne darüber.',
          ruMarkup:
            'Возьмите [[до]] как основной тон. Формула мажорного трезвучия — 0 · 4 · 7: сам основной тон, звук на 4 полутона выше него и звук на 7 полутонов выше него.',
        },
        {
          en: 'Four semitones above C is E, the third, and seven semitones above C is G, the fifth. The major triad is C–E–G.',
          ru: 'На 4 полутона выше до находится ми, терцовый тон, а на 7 полутонов выше до — соль, квинтовый тон. Получилось мажорное трезвучие до — ми — соль.',
          de: 'Vier Halbtöne über C liegt E, der Terzton, und sieben Halbtöne über C liegt G, der Quintton. Der Durdreiklang lautet C–E–G.',
          ruMarkup:
            'На 4 полутона выше [[до]] находится [[ми]], терцовый тон, а на 7 полутонов выше [[до]] — [[соль]], квинтовый тон. Получилось мажорное трезвучие [[до]] — [[ми]] — [[соль]].',
        },
        {
          en: 'The formula for a minor triad is 0 · 3 · 7. Only the middle number is different, so only the third moves: E is lowered by a semitone to E♭.',
          ru: 'Формула минорного трезвучия — 0 · 3 · 7. Отличается только среднее число, поэтому меняется только терцовый тон: вместо ми берётся ми-бемоль, на полутон ниже.',
          de: 'Die Formel des Molldreiklangs lautet 0 · 3 · 7. Nur die mittlere Zahl ist anders, also bewegt sich nur der Terzton: E wird um einen Halbton zu Es erniedrigt.',
          ruMarkup:
            'Формула минорного трезвучия — 0 · 3 · 7. Отличается только среднее число, поэтому меняется только терцовый тон: вместо [[ми]] берётся [[ми-бемоль]], на полутон ниже.',
        },
        {
          en: 'The minor triad is C–E♭–G. The root C and the fifth G are the same in both chords.',
          ru: 'Получилось минорное трезвучие до — ми-бемоль — соль. Основной тон до и квинтовый тон соль в обоих аккордах одни и те же.',
          de: 'Der Molldreiklang lautet C–Es–G. Grundton C und Quintton G sind in beiden Akkorden dieselben.',
          ruMarkup:
            'Получилось минорное трезвучие [[до]] — [[ми-бемоль]] — [[соль]]. Основной тон [[до]] и квинтовый тон [[соль]] в обоих аккордах одни и те же.',
        },
        {
          en: 'Go back to the major triad C–E–G. One more third above its fifth makes a four-note chord, a seventh chord. With B♭, 10 semitones above C in twelve-tone equal temperament, you get the dominant seventh type: C–E–G–B♭.',
          ru: 'Вернитесь к мажорному трезвучию до — ми — соль. Ещё одна терция над его квинтовым тоном даёт аккорд из четырёх звуков — септаккорд. Со звуком си-бемоль, на 10 полутонов выше до в двенадцатиступенной равномерной темперации, получается малый мажорный септаккорд до — ми — соль — си-бемоль.',
          de: 'Kehre zum Durdreiklang C–E–G zurück. Eine weitere Terz über seinem Quintton ergibt einen Vierklang, den Septakkord. Mit B, in zwölfstufiger gleichstufiger Stimmung 10 Halbtöne über C, erhältst du den Dominantseptakkord C–E–G–B.',
          ruMarkup:
            'Вернитесь к мажорному трезвучию [[до]] — [[ми]] — [[соль]]. Ещё одна терция над его квинтовым тоном даёт аккорд из четырёх звуков — септаккорд. Со звуком [[си-бемоль]], на 10 полутонов выше [[до]] в двенадцатиступенной равномерной темперации, получается малый мажорный септаккорд [[до]] — [[ми]] — [[соль]] — [[си-бемоль]].',
        },
      ],
      listen: {
        en: 'Play the major triad note by note, then the minor triad note by note: only the middle note changes, from E to E♭. Then play each triad with its three notes together and listen for the same difference inside the whole chord.',
        ru: 'Послушайте мажорное трезвучие по одному звуку, затем минорное по одному звуку: меняется только средний звук — вместо ми звучит ми-бемоль. Потом послушайте каждое трезвучие, когда три его звука берутся одновременно, и расслышьте то же различие внутри целого аккорда.',
        de: 'Spiele den Durdreiklang Ton für Ton und danach den Molldreiklang Ton für Ton: Nur der mittlere Ton ändert sich, von E zu Es. Spiele dann bei jedem Dreiklang alle drei Töne zusammen und höre denselben Unterschied im ganzen Akkord heraus.',
        ruMarkup:
          'Послушайте мажорное трезвучие по одному звуку, затем минорное по одному звуку: меняется только средний звук — вместо [[ми]] звучит [[ми-бемоль]]. Потом послушайте каждое трезвучие, когда три его звука берутся одновременно, и расслышьте то же различие внутри целого аккорда.',
      },
      mistake: {
        en: 'Do not assume the lowest note of a chord is always its root. That is true when the three tones of a triad are arranged in consecutive thirds: root, third and fifth from bottom to top. An inversion can put a different chord tone in the bass.',
        ru: 'Не считайте, что нижний звук аккорда — всегда основной тон. Это верно, когда три звука трезвучия расположены по терциям: снизу вверх идут основной, терцовый и квинтовый тоны. В обращении в басу может оказаться другой аккордовый звук.',
        de: 'Nimm nicht an, dass der unterste Ton eines Akkords immer der Grundton ist. Das stimmt, wenn die drei Töne eines Dreiklangs in aufeinanderfolgenden Terzen angeordnet sind: von unten Grundton, Terzton und Quintton. Bei einer Umkehrung kann ein anderer Akkordton im Bass stehen.',
      },
      takeaways: [
        {
          en: 'A triad has three different chord tones that can be arranged in thirds: root, third and fifth.',
          ru: 'В трезвучии три разных звука, которые можно расположить по терциям: основной, терцовый и квинтовый тоны.',
          de: 'Ein Dreiklang enthält drei verschiedene Akkordtöne, die sich in Terzen anordnen lassen: Grundton, Terzton und Quintton.',
        },
        {
          en: 'The tones of a major triad lie 0 · 4 · 7 semitones above the root and those of a minor triad 0 · 3 · 7, so only the third differs.',
          ru: 'Звуки мажорного трезвучия отстоят от основного тона на 0 · 4 · 7 полутонов, минорного — на 0 · 3 · 7: различается только терцовый тон.',
          de: 'Die Töne des Durdreiklangs liegen 0 · 4 · 7 Halbtöne über dem Grundton, die des Molldreiklangs 0 · 3 · 7: Nur der Terzton ist verschieden.',
        },
        {
          en: 'Doubling a tone in another octave adds a voice, but no new chord member.',
          ru: 'Удвоение звука в другой октаве добавляет голос, но не новый звук в состав аккорда.',
          de: 'Eine Oktavverdopplung fügt eine Stimme hinzu, aber keinen neuen Akkordton.',
        },
        {
          en: 'What a chord means also depends on context, voicing, rhythm and voice leading.',
          ru: 'Значение аккорда зависит также от контекста, расположения голосов, ритма и голосоведения.',
          de: 'Die Bedeutung eines Akkords hängt auch von Kontext, Lage, Rhythmus und Stimmführung ab.',
        },
      ],
    },
    sourceId: 'source-047',
    experimentId: 'chords',
  },
  experiment: {
    id: 'chords',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'chords',
    instructions: {
      en: 'Compare major and minor on the same root, first as an arpeggio and then together.',
      ru: 'Сравните мажор и минор от одного основного тона: сначала последовательно, затем одновременно.',
      de: 'Vergleiche Dur und Moll über demselben Grundton, zuerst als Arpeggio und dann gleichzeitig.',
    },
    engine: 'sound-lab',
    preset: {
      hz: 261.625565,
      wave: 'triangle',
    },
  },
  exercises: [
    {
      id: 'entry-chords',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'chords',
      kind: 'diagnostic',
      order: 3,
      label: {
        en: 'When the three tones of a triad are arranged in consecutive thirds, what is the lowest one called?',
        ru: 'Как называется нижний звук трезвучия, если его три звука расположены по терциям?',
        de: 'Wie heißt der unterste Ton eines Dreiklangs, wenn seine drei Töne in aufeinanderfolgenden Terzen angeordnet sind?',
      },
      answer: 'root',
      options: [
        {
          id: 'third',
          label: {
            en: 'The third',
            ru: 'Терцовый тон',
            de: 'Terzton',
          },
          feedback: {
            en: 'The third is the middle chord tone in this arrangement. The lowest is the root.',
            ru: 'Терцовый тон здесь находится посередине. Нижний звук — основной тон.',
            de: 'Der Terzton ist in dieser Anordnung der mittlere Akkordton. Der unterste ist der Grundton.',
          },
        },
        {
          id: 'root',
          label: {
            en: 'The root',
            ru: 'Основной тон',
            de: 'Grundton',
          },
          feedback: {
            en: 'In this arrangement the tones are root, third and fifth from bottom to top. An inversion can put a different chord tone in the bass.',
            ru: 'В таком расположении снизу вверх идут основной, терцовый и квинтовый тоны. В обращении в басу может оказаться другой аккордовый звук.',
            de: 'In dieser Anordnung folgen von unten Grundton, Terzton und Quintton. Bei einer Umkehrung kann ein anderer Akkordton im Bass stehen.',
          },
        },
        {
          id: 'fifth',
          label: {
            en: 'The fifth',
            ru: 'Квинтовый тон',
            de: 'Quintton',
          },
          feedback: {
            en: 'The fifth is the highest chord tone in this arrangement. The lowest is the root.',
            ru: 'Квинтовый тон здесь находится сверху. Нижний звук — основной тон.',
            de: 'Der Quintton ist in dieser Anordnung der oberste Akkordton. Der unterste ist der Grundton.',
          },
        },
      ],
      sourceIds: ['source-058'],
    },
  ],
  concepts: [
    {
      id: 'Chord symbols',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'chords',
      order: 41,
      reference: true,
      title: {
        en: 'Chord symbols',
        ru: 'Буквенные обозначения аккордов',
        de: 'Akkordsymbole',
      },
      body: {
        en: 'A chord symbol names a root and a chord type; a slash can specify a different bass. It does not prescribe one voicing or rhythm. In the Chords topic compare a symbol with its spelled chord tones and bass. Figured bass instead specifies intervals above a given bass; the two systems cannot simply exchange labels.',
        ru: 'Буквенное обозначение аккорда задаёт основной тон и тип; косая черта может уточнять другой бас. Оно не предписывает единственное расположение или ритм. В разделе «Аккорды» сопоставьте международное обозначение со звуками аккорда и басом. Цифрованный бас, напротив, задаёт интервалы над данным басом; обозначения этих систем нельзя просто заменять друг другом.',
        de: 'Ein Akkordsymbol nennt Grundton und Akkordtyp; ein Schrägstrich kann einen anderen Basston bestimmen. Es schreibt weder eine einzige Lage noch einen Rhythmus vor. Vergleiche im Thema Akkorde das Symbol mit Akkordtönen und Bass. Generalbass bezeichnet dagegen Intervalle über einem gegebenen Bass; die Systeme können ihre Bezeichnungen nicht einfach austauschen.',
      },
      relatedTopics: ['repeats'],
      sourceId: 'source-025',
    },
    {
      id: 'Triad',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'chords',
      order: 54,
      reference: false,
      title: {
        en: 'Triad',
        ru: 'Трезвучие',
        de: 'Dreiklang',
      },
      body: {
        en: 'A chord of three different notes that can be arranged as two stacked thirds. A note doubled in another octave does not count as a new one.',
        ru: 'Аккорд из трёх разных звуков, которые расположены или могут быть расположены по терциям. Октавное удвоение не считается новым звуком.',
        de: 'Ein Akkord aus drei verschiedenen Tönen, die sich als zwei übereinandergeschichtete Terzen anordnen lassen. Eine Oktavverdopplung zählt nicht als neuer Ton.',
      },
    },
    {
      id: 'Voice leading',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'chords',
      order: 55,
      reference: false,
      title: {
        en: 'Voice leading',
        ru: 'Голосоведение',
        de: 'Stimmführung',
      },
      body: {
        en: 'The way individual melodic lines move from one sonority to the next.',
        ru: 'Движение отдельных мелодических голосов от одного созвучия к следующему.',
        de: 'Die Bewegung einzelner melodischer Stimmen von einem Zusammenklang zum nächsten.',
      },
    },
  ],
};
export default content;
