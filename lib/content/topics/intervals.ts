import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'intervals',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: ['sound', 'enharmonics', 'tempo'],
    locales: ['en', 'ru', 'de'],
    kind: 'concept',
    module: null,
    roadmapIds: [],
    lessonIds: ['intervals'],
    experimentIds: ['intervals'],
    exerciseIds: [],
    conceptIds: ['Cent', 'Octave'],
  },
  lesson: {
    id: 'intervals',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'intervals',
    title: {
      en: 'The distance between notes',
      ru: 'Расстояние между нотами',
      de: 'Der Abstand zwischen Tönen',
    },
    category: {
      en: 'Intervals',
      ru: 'Интервалы',
      de: 'Intervalle',
    },
    summary: {
      en: 'Hear the building blocks of melody and harmony.',
      ru: 'Услышьте основу мелодии и гармонии.',
      de: 'Höre die Bausteine von Melodie und Harmonie.',
    },
    formula: {
      en: 'cents = 1200 × log₂(f₂ / f₁)',
      ru: 'Центы = 1200 × log₂(f₂ / f₁)',
      de: 'Cent = 1200 × log₂(f₂ / f₁)',
    },
    paragraphs: [
      {
        en: 'An interval describes the relationship between two pitches. Play them one after another to hear a melodic interval, or together to hear a harmonic interval. In equal temperament, an octave spans twelve semitones, or 1,200 cents.',
        ru: 'Интервал описывает отношение двух высот. Последовательное звучание образует мелодический интервал, одновременное — гармонический. В равномерном строе октава содержит 12 полутонов, или 1200 центов.',
        de: 'Ein Intervall beschreibt das Verhältnis zweier Tonhöhen. Nacheinander gespielt bilden sie ein melodisches, gleichzeitig ein harmonisches Intervall. In gleichstufiger Stimmung umfasst eine Oktave zwölf Halbtöne beziehungsweise 1.200 Cent.',
      },
      {
        en: 'To name an interval, count its letter names, including both ends, then identify its quality. C–E spans C, D, E: a third. C–F spans four names: a fourth. C–D♯ and C–E♭ share the same keyboard distance in twelve-tone equal temperament, but are an augmented second and a minor third. In the formula, f₁ and f₂ are the two positive frequencies; use f₂ ≥ f₁ for an upward interval.',
        ru: 'Чтобы назвать интервал, сосчитайте ступени, включая оба конца, затем определите его качество. До — ми охватывает до, ре, ми: это терция. До — фа охватывает четыре ступени: это кварта. В двенадцатиступенном равномерном строе до — ре-диез и до — ми-бемоль звучат одинаково, но записаны как увеличенная секунда и малая терция. В формуле f₁ и f₂ — две положительные частоты; для восходящего интервала f₂ ≥ f₁.',
        de: 'Zähle für den Intervallnamen die Stammtonstufen einschließlich beider Endpunkte und bestimme dann die Intervallqualität. C–E umfasst C, D, E: eine Terz. C–F umfasst vier Stufen: eine Quarte. C–Dis und C–Es haben in zwölfstufiger gleichstufiger Stimmung denselben Tastenabstand, sind aber eine übermäßige Sekunde und eine kleine Terz. In der Formel sind f₁ und f₂ positive Frequenzen; für ein aufsteigendes Intervall gilt f₂ ≥ f₁.',
        ruMarkup:
          'Чтобы назвать интервал, сосчитайте ступени, включая оба конца, затем определите его качество. [[До]] — [[ми]] охватывает [[до]], [[ре]], [[ми]]: это терция. [[До]] — [[фа]] охватывает четыре ступени: это кварта. В двенадцатиступенном равномерном строе [[до]] — [[ре-диез]] и [[до]] — [[ми-бемоль]] звучат одинаково, но записаны как увеличенная секунда и малая терция. В формуле f₁ и f₂ — две положительные частоты; для восходящего интервала f₂ ≥ f₁.',
      },
    ],
    sourceId: 'source-045',
    experimentId: 'intervals',
  },
  experiment: {
    id: 'intervals',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'intervals',
    instructions: {
      en: 'Compare a minor third (3 semitones), a major third (4) and a perfect fifth (7). Sing the second note before playing it.',
      ru: 'Сравните малую терцию (3 полутона), большую терцию (4) и чистую квинту (7). Спойте второй звук до воспроизведения.',
      de: 'Vergleiche eine kleine Terz (3 Halbtöne), eine große Terz (4) und eine reine Quinte (7). Singe den zweiten Ton, bevor du ihn abspielst.',
    },
    engine: 'sound-lab',
    preset: {
      hz: 440,
      wave: 'sine',
    },
  },
  exercises: [],
  concepts: [
    {
      id: 'Cent',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'intervals',
      order: 47,
      reference: false,
      title: {
        en: 'Cent',
        ru: 'Цент',
        de: 'Cent',
      },
      body: {
        en: 'One hundredth of an equal-tempered semitone. There are 1,200 cents in an octave.',
        ru: 'Одна сотая равномерно темперированного полутона. Октава содержит 1200 центов.',
        de: 'Ein Hundertstel eines gleichstufigen Halbtons. Eine Oktave umfasst 1.200 Cent.',
      },
    },
    {
      id: 'Octave',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'intervals',
      order: 48,
      reference: false,
      title: {
        en: 'Octave',
        ru: 'Октава',
        de: 'Oktave',
      },
      body: {
        en: 'An interval with a 2:1 frequency ratio in the tuning systems used here.',
        ru: 'Интервал с отношением частот 2:1 в используемых здесь системах настройки.',
        de: 'Ein Intervall mit dem Frequenzverhältnis 2:1 in den hier verwendeten Stimmungssystemen.',
      },
    },
  ],
};
export default content;
