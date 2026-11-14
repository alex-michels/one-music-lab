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
    version: 2,
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
        de: 'Eine Sinusschwingung enthält eine einzige Frequenz. Komplexere periodische Schwingungen enthalten harmonische Teiltöne bei ganzzahligen Vielfachen der Grundfrequenz. In fₖ = k × f₁ bezeichnet f₁ die Grundfrequenz und k = 1, 2, 3, … die Nummer des Teiltons. Bei einer Grundfrequenz von 220 Hz liegen die Teiltöne bei 220, 440, 660 Hz und so weiter. Ihr Stärkeverhältnis prägt die Klangfarbe mit.',
      },
      {
        en: 'Ideal square and triangle waves both contain only odd harmonics (k = 1, 3, 5, …), yet they sound different: in a square wave the amplitude of harmonic k falls as 1/k, in a triangle wave as 1/k², so its third harmonic has one ninth of the fundamental’s amplitude instead of one third. An ideal sawtooth contains every harmonic, even and odd, with amplitudes falling as 1/k. Real instrument timbres also depend on attack, decay, noise and sometimes non-harmonic partials. A waveform alone is not an instrument model.',
        ru: 'Идеальные прямоугольная и треугольная волны содержат только нечётные гармоники (k = 1, 3, 5, …), но звучат по-разному: у прямоугольной амплитуда k-й гармоники убывает как 1/k, у треугольной — как 1/k², так что её третья гармоника имеет одну девятую амплитуды основного тона, а не одну треть. Идеальная пилообразная волна содержит все гармоники, и чётные, и нечётные, с амплитудами, убывающими как 1/k. Тембр реальных инструментов также зависит от атаки, затухания, шумов и иногда негармонических обертонов. Одна форма волны не моделирует инструмент полностью.',
        de: 'Ideale Rechteck- und Dreieckschwingungen enthalten beide nur ungeradzahlige Harmonische (k = 1, 3, 5, …) und klingen dennoch verschieden: Beim Rechteck nimmt die Amplitude der k-ten Harmonischen mit 1/k ab, beim Dreieck mit 1/k² – seine dritte Harmonische hat also ein Neuntel statt ein Drittel der Grundtonamplitude. Eine ideale Sägezahnschwingung enthält alle Harmonischen, gerade wie ungerade, mit Amplituden proportional zu 1/k. Die Klangfarbe realer Instrumente hängt auch von Einschwingvorgang, Abklingen, Geräuschanteilen und mitunter nicht harmonischen Teiltönen ab. Eine Wellenform allein ist noch kein Instrumentenmodell.',
      },
    ],
    guide: {
      question: {
        en: 'Why does the same note sound different when only the waveform changes?',
        ru: 'Почему одна и та же нота звучит по-разному, если меняется только форма волны?',
        de: 'Warum klingt derselbe Ton anders, wenn sich nur die Wellenform ändert?',
      },
      example: [
        {
          en: 'Take a fundamental of 220 Hz, so f₁ = 220 Hz. The formula fₖ = k × f₁ gives the harmonics one by one: 1 × 220 = 220 Hz, the fundamental itself; 2 × 220 = 440 Hz; 3 × 220 = 660 Hz.',
          ru: 'Возьмём основную частоту 220 Гц, то есть f₁ = 220 Гц. По формуле fₖ = k × f₁ находим гармоники одну за другой: 1 × 220 = 220 Гц — сама основная частота; 2 × 220 = 440 Гц; 3 × 220 = 660 Гц.',
          de: 'Nimm eine Grundfrequenz von 220 Hz, also f₁ = 220 Hz. Die Formel fₖ = k × f₁ liefert die Harmonischen der Reihe nach: 1 × 220 = 220 Hz, die Grundfrequenz selbst; 2 × 220 = 440 Hz; 3 × 220 = 660 Hz.',
        },
        {
          en: 'A sine wave contains a single frequency. At 220 Hz that is the fundamental and nothing else.',
          ru: 'Синусоида содержит одну частоту. При 220 Гц это основная частота и больше ничего.',
          de: 'Eine Sinusschwingung enthält eine einzige Frequenz. Bei 220 Hz ist das die Grundfrequenz und sonst nichts.',
        },
        {
          en: 'An ideal sawtooth contains every harmonic: 220, 440, 660 Hz and so on. The amplitudes fall as 1/k, so the second harmonic has one half and the third one third of the fundamental’s amplitude.',
          ru: 'Идеальная пилообразная волна содержит все гармоники: 220, 440, 660 Гц и так далее. Амплитуды убывают как 1/k: у второй гармоники — половина, у третьей — треть амплитуды основного тона.',
          de: 'Eine ideale Sägezahnschwingung enthält alle Harmonischen: 220, 440, 660 Hz und so weiter. Die Amplituden nehmen mit 1/k ab: Die zweite Harmonische hat die Hälfte, die dritte ein Drittel der Grundtonamplitude.',
        },
        {
          en: 'Ideal square and triangle waves contain only the odd harmonics: 220 Hz (k = 1), 660 Hz (k = 3) and so on. The second harmonic, 440 Hz, is missing from both.',
          ru: 'Идеальные прямоугольная и треугольная волны содержат только нечётные гармоники: 220 Гц (k = 1), 660 Гц (k = 3) и так далее. Второй гармоники, 440 Гц, нет ни в одной из них.',
          de: 'Ideale Rechteck- und Dreieckschwingungen enthalten nur die ungeradzahligen Harmonischen: 220 Hz (k = 1), 660 Hz (k = 3) und so weiter. Die zweite Harmonische, 440 Hz, fehlt in beiden.',
        },
        {
          en: 'The two still differ in how strong those harmonics are. In the square wave the 660 Hz harmonic has one third of the fundamental’s amplitude; in the triangle wave it has only one ninth. That is why they sound different.',
          ru: 'Различаются они силой этих гармоник. В прямоугольной волне гармоника 660 Гц имеет одну треть амплитуды основного тона, в треугольной — только одну девятую. Поэтому они звучат по-разному.',
          de: 'Trotzdem unterscheiden sich die beiden darin, wie stark diese Harmonischen sind. Beim Rechteck hat die Harmonische bei 660 Hz ein Drittel der Grundtonamplitude, beim Dreieck nur ein Neuntel. Deshalb klingen sie verschieden.',
        },
      ],
      listen: {
        en: 'Play Sine, Triangle, Square and Sawtooth one after another. All four are the same note, A4; only the waveform changes. Listen for how the timbre differs from one to the next, and keep the volume low while comparing.',
        ru: 'Послушайте по очереди примеры «Синусоидальная», «Треугольная», «Прямоугольная» и «Пилообразная». Во всех четырёх звучит одна и та же нота, ля первой октавы; меняется только форма волны. Вслушайтесь, чем тембр одного примера отличается от тембра следующего, и сохраняйте небольшую громкость.',
        de: 'Spiele nacheinander „Sinus“, „Dreieck“, „Rechteck“ und „Sägezahn“. In allen vier erklingt derselbe Ton, a′; nur die Wellenform wechselt. Achte darauf, wie sich die Klangfarbe von einem Beispiel zum nächsten ändert, und vergleiche bei niedriger Lautstärke.',
        ruMarkup:
          'Послушайте по очереди примеры «Синусоидальная», «Треугольная», «Прямоугольная» и «Пилообразная». Во всех четырёх звучит одна и та же нота, [[ля]] первой октавы; меняется только форма волны. Вслушайтесь, чем тембр одного примера отличается от тембра следующего, и сохраняйте небольшую громкость.',
      },
      mistake: {
        en: 'It is tempting to treat a waveform as an instrument, as if the harmonics alone decided the timbre. Their relative strengths only help shape it. Real instrument timbres also depend on attack, decay, noise and sometimes non-harmonic partials.',
        ru: 'Легко принять форму волны за готовый инструмент, как будто тембр определяют одни гармоники. Соотношение их силы лишь влияет на него. Тембр реальных инструментов зависит также от атаки, затухания, шумов и иногда негармонических обертонов.',
        de: 'Es liegt nahe, eine Wellenform schon für ein Instrument zu halten, als würden allein die Harmonischen die Klangfarbe bestimmen. Deren Stärkeverhältnis prägt sie aber nur mit. Die Klangfarbe realer Instrumente hängt auch von Einschwingvorgang, Abklingen, Geräuschanteilen und mitunter nicht harmonischen Teiltönen ab.',
      },
      takeaways: [
        {
          en: 'A sine wave contains a single frequency; more complex periodic waves contain harmonics at whole-number multiples of the fundamental.',
          ru: 'Синусоида содержит одну частоту; более сложные периодические колебания содержат гармоники с частотами, кратными основной.',
          de: 'Eine Sinusschwingung enthält eine einzige Frequenz; komplexere periodische Schwingungen enthalten Harmonische bei ganzzahligen Vielfachen der Grundfrequenz.',
        },
        {
          en: 'The harmonic numbered k lies at k times the fundamental frequency, fₖ = k × f₁: a 220 Hz fundamental gives 220, 440, 660 Hz and so on.',
          ru: 'Частота гармоники с номером k равна основной частоте, умноженной на k (fₖ = k × f₁): при основной частоте 220 Гц это 220, 440, 660 Гц и так далее.',
          de: 'Die Harmonische mit der Nummer k liegt beim k-Fachen der Grundfrequenz, fₖ = k × f₁: Bei einer Grundfrequenz von 220 Hz sind das 220, 440, 660 Hz und so weiter.',
        },
        {
          en: 'Two sounds with the same fundamental frequency can differ in timbre when the relative strengths of their harmonics differ.',
          ru: 'Два звука с одинаковой основной частотой могут различаться тембром, если у них разное соотношение силы гармоник.',
          de: 'Zwei Klänge mit derselben Grundfrequenz können sich in der Klangfarbe unterscheiden, wenn das Stärkeverhältnis ihrer Harmonischen verschieden ist.',
        },
        {
          en: 'A waveform alone is not an instrument model: attack, decay and noise also shape the timbre of real instruments.',
          ru: 'Одна форма волны не моделирует инструмент полностью: на тембр реальных инструментов влияют также атака, затухание и шумы.',
          de: 'Eine Wellenform allein ist noch kein Instrumentenmodell: Auch Einschwingvorgang, Abklingen und Geräuschanteile prägen die Klangfarbe realer Instrumente.',
        },
      ],
    },
    sourceId: 'source-043',
    experimentId: 'timbre',
  },
  experiment: {
    id: 'timbre',
    version: 2,
    scopeId: 'acoustics',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'timbre',
    instructions: {
      en: 'Start A4 and, while it sounds, switch between sine, triangle, square and sawtooth. Keep the volume low while comparing.',
      ru: 'Включите ля первой октавы и сравните синусоидальную, треугольную, прямоугольную и пилообразную формы волны. Сохраняйте небольшую громкость.',
      de: 'Lass a′ erklingen und wechsle währenddessen zwischen Sinus, Dreieck, Rechteck und Sägezahn. Vergleiche bei niedriger Lautstärke.',
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
      version: 2,
      scopeId: 'acoustics',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'timbre',
      kind: 'diagnostic',
      order: 4,
      label: {
        en: 'Two periodic sounds have the same fundamental frequency but different relative harmonic strengths. Which property can this help explain?',
        ru: 'У двух периодических звуков одинаковая основная частота, но разное соотношение силы гармоник. Какое различие между ними это помогает объяснить?',
        de: 'Zwei periodische Klänge haben dieselbe Grundfrequenz, aber unterschiedliche relative Stärken der Teiltöne. Welche Eigenschaft lässt sich damit erklären?',
      },
      answer: 'timbre',
      options: [
        {
          id: 'duration',
          label: {
            en: 'Their written note duration',
            ru: 'Различие в записанной длительности нот',
            de: 'Ihr notierter Notenwert',
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
            ru: 'Различие в нотном ключе',
            de: 'Ihr Notenschlüssel',
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
            ru: 'Различие в тембре',
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
