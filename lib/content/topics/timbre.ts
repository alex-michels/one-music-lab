import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'timbre',
    version: 1,
    scopeId: 'acoustics',
    prerequisites: ['sound', 'tempo', 'chords'],
    locales: ['en', 'ru', 'de'],
    kind: 'tone',
    module: null,
    roadmapIds: [],
    lessonIds: ['timbre'],
    experimentIds: ['timbre'],
    exerciseIds: ['entry-timbre'],
    conceptIds: ['Harmonic', 'Timbre'],
  },
  lesson: {
    id: 'timbre',
    version: 1,
    scopeId: 'acoustics',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'timbre',
    title: {
      en: 'One pitch, many colours',
      ru: 'Одна высота — много тембров',
      de: 'Eine Tonhöhe, viele Klangfarben',
    },
    category: {
      en: 'Timbre',
      ru: 'Тембр',
      de: 'Klangfarbe',
    },
    summary: {
      en: 'Explore the partials inside a sound.',
      ru: 'Исследуйте составляющие звука.',
      de: 'Entdecke die Teiltöne eines Klangs.',
    },
    formula: {
      en: 'fₖ = k × f₁',
      ru: 'fₖ = k × f₁',
      de: 'fₖ = k × f₁',
    },
    paragraphs: [
      {
        en: 'A sine wave contains a single frequency. More complex periodic waves contain harmonics at whole-number multiples of the fundamental. In fₖ = k × f₁, f₁ is the fundamental frequency and k = 1, 2, 3, … is the harmonic number. A 220 Hz fundamental gives harmonics at 220, 440, 660 Hz and so on. Their relative strengths help shape the timbre.',
        ru: 'Синусоида содержит одну частоту. Более сложные периодические колебания содержат гармоники с частотами, кратными основной. В формуле fₖ = k × f₁ символ f₁ обозначает основную частоту, а k = 1, 2, 3, … — номер гармоники. При основной частоте 220 Гц гармоники имеют частоты 220, 440, 660 Гц и так далее. Соотношение их силы влияет на тембр.',
        de: 'Eine Sinusschwingung enthält eine einzige Frequenz. Komplexere periodische Schwingungen enthalten harmonische Teiltöne bei ganzzahligen Vielfachen der Grundfrequenz. In fₖ = k × f₁ bezeichnet f₁ die Grundfrequenz und k = 1, 2, 3, … die Nummer des Teiltons. Bei 220 Hz liegen diese Teiltöne bei 220, 440, 660 Hz und so weiter. Ihre Stärkeverhältnisse prägen die Klangfarbe.',
      },
      {
        en: 'Ideal square and triangle waves contain odd harmonics; an ideal sawtooth contains both even and odd harmonics. Real instrument timbres also depend on attack, decay, noise and sometimes non-harmonic partials. A waveform alone is not an instrument model.',
        ru: 'Идеальные прямоугольная и треугольная волны содержат нечётные гармоники, пилообразная — и чётные, и нечётные. Тембр реальных инструментов также зависит от атаки, затухания, шумов и иногда негармонических обертонов. Одна форма волны не моделирует инструмент полностью.',
        de: 'Ideale Rechteck- und Dreieckschwingungen enthalten nur ungeradzahlige Harmonische; eine ideale Sägezahnschwingung enthält gerade und ungerade. Die Klangfarbe realer Instrumente hängt auch von Einschwingvorgang, Abklingen, Geräuschanteilen und mitunter nicht harmonischen Teiltönen ab. Eine Wellenform allein ist noch kein Instrumentenmodell.',
      },
    ],
    sourceId: 'source-043',
    experimentId: 'timbre',
  },
  experiment: {
    id: 'timbre',
    version: 1,
    scopeId: 'acoustics',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'timbre',
    instructions: {
      en: 'Hold A4 and switch between sine, triangle, square and sawtooth. Keep the volume low while comparing.',
      ru: 'Включите ля первой октавы и сравните синусоидальную, треугольную, прямоугольную и пилообразную формы волны. Сохраняйте небольшую громкость.',
      de: 'Halte a′ und wechsle zwischen Sinus, Dreieck, Rechteck und Sägezahn. Vergleiche bei niedriger Lautstärke.',
      ruMarkup:
        'Включите [[ля]] первой октавы и сравните синусоидальную, треугольную, прямоугольную и пилообразную формы волны. Сохраняйте небольшую громкость.',
    },
    engine: 'sound-lab',
    preset: {
      hz: 440,
      wave: 'triangle',
    },
  },
  exercises: [
    {
      id: 'entry-timbre',
      version: 1,
      scopeId: 'acoustics',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'timbre',
      kind: 'diagnostic',
      order: 4,
      label: {
        en: 'Two periodic sounds have the same fundamental frequency but different relative harmonic strengths. Which property can this help explain?',
        ru: 'У двух периодических звуков одинаковая основная частота, но разное соотношение силы гармоник. Различие какого свойства это помогает объяснить?',
        de: 'Zwei periodische Klänge haben dieselbe Grundfrequenz, aber unterschiedliche relative Stärken der Teiltöne. Welche Eigenschaft lässt sich damit erklären?',
      },
      answer: 'timbre',
      options: [
        {
          id: 'duration',
          label: {
            en: 'Their written note duration',
            ru: 'Их записанную нотную длительность',
            de: 'Ihren notierten Notenwert',
          },
          feedback: {
            en: 'Harmonic strengths do not specify a written duration. Their relative balance contributes to timbre.',
            ru: 'Сила гармоник не задаёт записанную длительность. Их соотношение влияет на тембр.',
            de: 'Teiltonstärken legen keinen notierten Notenwert fest. Ihr Verhältnis trägt zur Klangfarbe bei.',
          },
        },
        {
          id: 'clef',
          label: {
            en: 'Their clef',
            ru: 'Их нотный ключ',
            de: 'Ihren Notenschlüssel',
          },
          feedback: {
            en: 'A clef is a notation reference. The balance of harmonic strengths contributes to the sound’s timbre.',
            ru: 'Ключ задаёт опору в нотной записи. Соотношение силы гармоник влияет на тембр звука.',
            de: 'Ein Schlüssel ist ein Bezugspunkt der Notation. Das Verhältnis der Teiltonstärken trägt zur Klangfarbe bei.',
          },
        },
        {
          id: 'timbre',
          label: {
            en: 'Their timbre',
            ru: 'Их тембр',
            de: 'Ihre Klangfarbe',
          },
          feedback: {
            en: 'The relative strengths of harmonics contribute to timbre. Attack, decay and other features can matter too.',
            ru: 'Соотношение силы гармоник влияет на тембр. Атака, затухание и другие свойства тоже могут играть роль.',
            de: 'Die relativen Teiltonstärken tragen zur Klangfarbe bei. Auch Einschwingvorgang, Abklingen und weitere Eigenschaften können eine Rolle spielen.',
          },
        },
      ],
      sourceIds: ['source-057'],
    },
  ],
  concepts: [
    {
      id: 'Harmonic',
      version: 1,
      scopeId: 'acoustics',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'timbre',
      order: 51,
      reference: false,
      title: {
        en: 'Harmonic',
        ru: 'Гармоника',
        de: 'Harmonischer Teilton',
      },
      body: {
        en: 'A sinusoidal component at a whole-number multiple of a fundamental frequency.',
        ru: 'Синусоидальная составляющая с частотой, кратной основной частоте.',
        de: 'Ein sinusförmiger Anteil mit einer Frequenz, die ein ganzzahliges Vielfaches der Grundfrequenz ist.',
      },
    },
    {
      id: 'Timbre',
      version: 1,
      scopeId: 'acoustics',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'timbre',
      order: 52,
      reference: false,
      title: {
        en: 'Timbre',
        ru: 'Тембр',
        de: 'Klangfarbe',
      },
      body: {
        en: 'The qualities that distinguish sounds beyond pitch and loudness, including spectrum and temporal envelope.',
        ru: 'Качества, отличающие звуки помимо высоты и громкости, включая спектр и развитие во времени.',
        de: 'Eigenschaften, die Klänge unabhängig von Tonhöhe und Lautstärke unterscheiden, darunter Spektrum und zeitliche Hüllkurve.',
      },
    },
  ],
};
export default content;
