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
    version: 1,
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
        en: 'A triad has three different chord tones that can be arranged in thirds. A major triad has a major third and a perfect fifth above its root: C–E–G, for example. Lower the third by a semitone and C–E♭–G becomes a minor triad. Doubling a tone in another octave adds a voice, but no new chord member.',
        ru: 'В трезвучии три разных звука, которые можно расположить по терциям. В мажорном трезвучии от основного тона строятся большая терция и чистая квинта: например, до — ми — соль. Понизьте терцовый тон на полутон — получится минорное трезвучие до — ми-бемоль — соль. Удвоение звука в другой октаве добавляет голос, но не новый звук в состав аккорда.',
        de: 'Ein Dreiklang enthält drei verschiedene Akkordtöne, die sich in Terzen anordnen lassen. Beim Durdreiklang liegen eine große Terz und eine reine Quinte über dem Grundton, etwa C–E–G. Erniedrige den Terzton um einen Halbton: C–Es–G ist ein Molldreiklang. Eine Oktavverdopplung fügt eine Stimme hinzu, aber keinen neuen Akkordton.',
        ruMarkup:
          'В трезвучии три разных звука, которые можно расположить по терциям. В мажорном трезвучии от основного тона строятся большая терция и чистая квинта: например, [[до]] — [[ми]] — [[соль]]. Понизьте терцовый тон на полутон — получится минорное трезвучие [[до]] — [[ми-бемоль]] — [[соль]]. Удвоение звука в другой октаве добавляет голос, но не новый звук в состав аккорда.',
      },
      {
        en: 'Add a seventh for a four-note chord. A dominant seventh uses offsets 0, 4, 7 and 10 semitones in equal temperament. Chord meaning also depends on context, voicing, rhythm and voice leading. An isolated chord cannot explain a whole harmonic style.',
        ru: 'Добавление септимы образует четырёхзвучный аккорд. Малый мажорный септаккорд использует смещения 0, 4, 7 и 10 полутонов в равномерном строе. Значение аккорда зависит и от контекста, расположения голосов, ритма и голосоведения. Отдельный аккорд не объясняет гармонический стиль целиком.',
        de: 'Mit einer zusätzlichen Septime entsteht ein Vierklang. Ein Dominantseptakkord hat in gleichstufiger Stimmung die Halbtonabstände 0, 4, 7 und 10 vom Grundton. Die Bedeutung eines Akkords hängt auch von Kontext, Lage, Rhythmus und Stimmführung ab. Ein einzelner Akkord erklärt noch keinen harmonischen Stil.',
      },
    ],
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
      version: 1,
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
        en: 'A three-pitch-class chord that can be arranged as two stacked thirds.',
        ru: 'Аккорд из трёх классов высот, которые можно расположить по терциям.',
        de: 'Ein Akkord aus drei Tonklassen, die sich als zwei übereinandergeschichtete Terzen anordnen lassen.',
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
