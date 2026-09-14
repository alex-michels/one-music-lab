import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'tuning',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: ['sound', 'enharmonics', 'tempo'],
    locales: ['en', 'ru', 'de'],
    kind: 'tone',
    module: null,
    roadmapIds: [],
    lessonIds: ['tuning'],
    experimentIds: ['tuning'],
    exerciseIds: [],
    conceptIds: ['Reference pitch', 'Equal temperament', 'Just intonation'],
  },
  lesson: {
    id: 'tuning',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'tuning',
    title: {
      en: 'A reference, a whole system',
      ru: 'Опора для целой системы',
      de: 'Ein Bezugston für ein ganzes System',
    },
    category: {
      en: 'Tuning',
      ru: 'Строй',
      de: 'Stimmung',
    },
    summary: {
      en: 'Set a reference pitch and distinguish it from a tuning system.',
      ru: 'Задайте опорную частоту и отличайте её от музыкального строя.',
      de: 'Lege einen Bezugston fest und unterscheide ihn vom Stimmungssystem.',
    },
    formula: {
      en: 'f(n) = A4 × 2^((n − 69) / 12)',
      ru: 'f(n) = f(ля первой октавы) × 2^((n − 69) / 12)',
      de: 'f(n) = f(a′) × 2^((n − 69) / 12)',
      ruMarkup: 'f(n) = f([[ля]] первой октавы) × 2^((n − 69) / 12)',
    },
    paragraphs: [
      {
        en: 'A reference pitch assigns a frequency to a named note. In this lab, that note is A4. If you change A4 from 440 to 432 Hz, the other frequencies shift by the same factor. The interval relationships stay the same.',
        ru: 'Опорная частота связывает название ноты с частотой её звучания. Здесь это ля первой октавы. При изменении её частоты с 440 до 432 Гц остальные частоты меняются в той же пропорции. Интервальные отношения сохраняются.',
        de: 'Ein Bezugston verbindet einen Tonnamen mit einer Frequenz. Hier ist es das eingestrichene a (a′). Änderst du es von 440 auf 432 Hz, ändern sich alle anderen Frequenzen im selben Verhältnis. Die Intervallverhältnisse bleiben erhalten.',
        ruMarkup:
          'Опорная частота связывает название ноты с частотой её звучания. Здесь это [[ля]] первой октавы. При изменении её частоты с 440 до 432 Гц остальные частоты меняются в той же пропорции. Интервальные отношения сохраняются.',
      },
      {
        en: 'A tuning system is a separate choice. Twelve-tone equal temperament divides an octave into twelve equal steps, each with the same frequency ratio. In the formula, n is the MIDI note number; A4 is 69. The formula applies to this temperament. The lab also offers fixed, A-based ratio maps for just and Pythagorean tuning. Those maps do not reproduce every historical practice or every musical key.',
        ru: 'Музыкальный строй выбирают отдельно. Двенадцатиступенная равномерная темперация делит октаву на 12 шагов с одинаковым отношением частот. В формуле n — номер ноты MIDI; для ля первой октавы он равен 69. Формула относится именно к этому строю. В лаборатории есть также фиксированные таблицы отношений чистого и пифагорейского строя с опорой на ля. Они не воспроизводят все исторические практики и тональности.',
        de: 'Das Stimmungssystem wählst du unabhängig vom Bezugston. Die zwölfstufige gleichstufige Stimmung teilt die Oktave in zwölf Schritte mit jeweils gleichem Frequenzverhältnis. In der Formel ist n die MIDI-Notennummer; a′ hat die Nummer 69. Die Formel gilt für diese Stimmung. Das Labor bietet außerdem feste, auf A bezogene Verhältnistabellen für reine und pythagoreische Stimmung. Diese Modelle bilden nicht jede historische Praxis oder Tonart ab.',
        ruMarkup:
          'Музыкальный строй выбирают отдельно. Двенадцатиступенная равномерная темперация делит октаву на 12 шагов с одинаковым отношением частот. В формуле n — номер ноты MIDI; для [[ля]] первой октавы он равен 69. Формула относится именно к этому строю. В лаборатории есть также фиксированные таблицы отношений чистого и пифагорейского строя с опорой на [[ля]]. Они не воспроизводят все исторические практики и тональности.',
      },
    ],
    sourceId: 'source-044',
    experimentId: 'tuning',
  },
  experiment: {
    id: 'tuning',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'tuning',
    instructions: {
      en: 'Select A4 = 432 Hz and play the keyboard. Switch tuning systems and listen to C♯5 against A4.',
      ru: 'Задайте для ля первой октавы 432 Гц и сыграйте на клавиатуре. Сравните до-диез второй октавы с ля первой в разных строях.',
      de: 'Wähle a′ = 432 Hz und spiele auf der Klaviatur. Wechsle die Stimmungssysteme und vergleiche cis″ mit a′.',
      ruMarkup:
        'Задайте для [[ля]] первой октавы 432 Гц и сыграйте на клавиатуре. Сравните [[до-диез]] второй октавы с [[ля]] первой в разных строях.',
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
      id: 'Reference pitch',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'tuning',
      order: 46,
      reference: false,
      title: {
        en: 'Reference pitch',
        ru: 'Опорная частота',
        de: 'Kammerton',
      },
      body: {
        en: 'A chosen frequency for a named note, used as an anchor for tuning other notes.',
        ru: 'Выбранная частота именованной ноты, относительно которой настраивают остальные.',
        de: 'Eine festgelegte Frequenz für einen benannten Ton, an der sich die Stimmung anderer Töne orientiert.',
      },
    },
    {
      id: 'Equal temperament',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'tuning',
      order: 49,
      reference: false,
      title: {
        en: 'Equal temperament',
        ru: 'Равномерный строй',
        de: 'Gleichstufige Stimmung',
      },
      body: {
        en: 'A system with equal frequency ratios between adjacent steps. Here, twelve steps divide the octave.',
        ru: 'Система с одинаковыми отношениями частот соседних ступеней. Здесь октава делится на 12 шагов.',
        de: 'Ein Stimmungssystem mit gleichen Frequenzverhältnissen zwischen benachbarten Stufen. Hier unterteilen zwölf Stufen die Oktave.',
      },
    },
    {
      id: 'Just intonation',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'tuning',
      order: 50,
      reference: false,
      title: {
        en: 'Just intonation',
        ru: 'Чистый строй',
        de: 'Reine Stimmung',
      },
      body: {
        en: 'Tuning based on selected simple whole-number ratios. A fixed ratio map depends on its tonal reference.',
        ru: 'Настройка на основе выбранных простых отношений целых чисел. Фиксированная таблица зависит от тональной опоры.',
        de: 'Eine Stimmung auf Grundlage ausgewählter einfacher ganzzahliger Frequenzverhältnisse. Eine feste Zuordnung solcher Verhältnisse hängt vom tonalen Bezugspunkt ab.',
      },
    },
  ],
};
export default content;
