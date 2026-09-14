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
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'scales',
    title: {
      en: 'Scales & modes',
      ru: 'Звукоряды и лады',
      de: 'Tonleitern & Modi',
    },
    category: {
      en: 'Melody',
      ru: 'Мелодия',
      de: 'Melodie',
    },
    summary: {
      en: 'Recognize the step pattern and listen for a tonal centre.',
      ru: 'Распознавайте последовательность ступеней и слушайте ладовую опору.',
      de: 'Erkenne das Schrittmuster und höre auf das tonale Zentrum.',
    },
    formula: {
      en: 'Major scale steps, in semitones: 2 – 2 – 1 – 2 – 2 – 2 – 1',
      ru: 'Шаги мажорной гаммы в полутонах: 2 – 2 – 1 – 2 – 2 – 2 – 1',
      de: 'Schritte der Durtonleiter in Halbtönen: 2 – 2 – 1 – 2 – 2 – 2 – 1',
    },
    paragraphs: [
      {
        en: 'A scale orders a collection of pitches. A major scale follows a repeating pattern of whole tones and semitones. A mode also concerns how a tonal centre and characteristic notes are heard; it is more than starting a familiar scale on another key.',
        ru: 'Звукоряд упорядочивает набор высот. Мажорная гамма следует определённой последовательности тонов и полутонов. Лад связан также с ощущением опоры и характерных ступеней: это больше, чем начало знакомой гаммы с другой клавиши.',
        de: 'Eine Tonleiter ordnet eine Auswahl von Tonhöhen. Die Durtonleiter folgt einer wiederkehrenden Folge von Ganz- und Halbtonschritten. Ein Modus betrifft auch die Wahrnehmung eines tonalen Zentrums und charakteristischer Töne; er ist mehr als eine bekannte Tonleiter mit einem anderen Anfangston.',
      },
      {
        en: 'Try major, natural minor, Dorian and pentatonic collections in the lab. The blues example is a six-note equal-tempered simplification. Expressive blue notes are not restricted to fixed piano-key pitches.',
        ru: 'Сравните мажор, натуральный минор, дорийский лад и пентатонику. Блюзовый пример — упрощённый шестиступенный звукоряд в равномерном строе. Выразительные блюзовые ноты не ограничены фиксированными высотами клавиш.',
        de: 'Probiere Dur, natürliches Moll, Dorisch und pentatonische Tonleitern im Labor aus. Das Bluesbeispiel ist eine gleichstufige Vereinfachung mit sechs Tönen. Ausdrucksvolle Blue Notes sind nicht auf feste Klaviertonhöhen beschränkt.',
      },
    ],
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
      version: 1,
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
        ru: 'Упорядоченный набор высот. Сам по себе звукоряд не описывает музыкальную традицию целиком.',
        de: 'Eine geordnete Auswahl von Tonhöhen. Eine Tonleiter allein beschreibt keine vollständige musikalische Tradition.',
      },
    },
  ],
};
export default content;
