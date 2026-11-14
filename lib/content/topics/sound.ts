import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'sound',
    version: 1,
    scopeId: 'acoustics',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    kind: 'tone',
    module: null,
    roadmapIds: [],
    lessonIds: ['sound'],
    experimentIds: ['sound'],
    exerciseIds: ['entry-sound'],
    conceptIds: ['Frequency', 'Pitch'],
  },
  lesson: {
    id: 'sound',
    version: 2,
    scopeId: 'acoustics',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'sound',
    title: {
      en: 'Sound & frequency',
      ru: 'Звук и частота',
      de: 'Schall & Frequenz',
    },
    category: {
      en: 'Acoustics',
      ru: 'Акустика',
      de: 'Akustik',
    },
    summary: {
      en: 'Relate frequency, period and the pitch you hear.',
      ru: 'Свяжите частоту и период колебаний с воспринимаемой высотой звука.',
      de: 'Setze Frequenz und Periodendauer mit der gehörten Tonhöhe in Beziehung.',
    },
    formula: {
      en: 'T = 1 / f',
      ru: 'T = 1 / f',
      de: 'T = 1 / f',
    },
    paragraphs: [
      {
        en: 'Sound is a mechanical vibration that travels through a medium; in air, it produces changing pressure. For a periodic tone, frequency f counts the cycles per second, in hertz (Hz). The period T is the time for one cycle, in seconds: T = 1 / f. At 440 Hz, one cycle lasts about 0.00227 s.',
        ru: 'Звук — механические колебания, распространяющиеся в среде; в воздухе они создают изменения давления. Частота f периодического тона показывает число колебаний за секунду и измеряется в герцах (Гц). Период T — время одного колебания в секундах: T = 1 / f. При частоте 440 Гц одно колебание длится примерно 0,00227 с.',
        de: 'Schall ist eine mechanische Schwingung, die sich in einem Medium ausbreitet; in Luft entstehen dabei Druckänderungen. Bei einem periodischen Ton zählt die Frequenz f die Schwingungen pro Sekunde, gemessen in Hertz (Hz). Die Periodendauer T gibt die Zeit einer Schwingung in Sekunden an: T = 1 / f. Bei 440 Hz dauert eine Schwingung etwa 0,00227 s.',
      },
      {
        en: 'Pitch is our perception of how high or low a sound is. Frequency strongly influences pitch, but a complex sound can contain many frequencies. Timbre depends on their relative strength and on how the sound develops over time.',
        ru: 'Высота — ощущение того, насколько звук высокий или низкий. Частота сильно влияет на высоту, но сложный звук может содержать много частот. Тембр зависит от соотношения их силы и от того, как звук развивается во времени.',
        de: 'Tonhöhe bezeichnet, wie hoch oder tief wir einen Klang wahrnehmen. Die Frequenz beeinflusst sie stark, doch ein komplexer Klang enthält viele Frequenzen. Die Klangfarbe hängt von deren Stärkeverhältnis und vom zeitlichen Verlauf ab.',
      },
    ],
    guide: {
      question: {
        en: 'How is the pitch you hear connected to the number of vibrations per second?',
        ru: 'Как высота звука, которую вы слышите, связана с числом колебаний в секунду?',
        de: 'Wie hängt die Tonhöhe, die du hörst, mit der Zahl der Schwingungen pro Sekunde zusammen?',
      },
      example: [
        {
          en: 'A periodic tone completes 440 cycles of vibration in one second. That count is its frequency: f = 440 Hz.',
          ru: 'Периодический тон совершает 440 колебаний за одну секунду. Это число — его частота: f = 440 Гц.',
          de: 'Ein periodischer Ton führt in einer Sekunde 440 Schwingungen aus. Diese Zahl ist seine Frequenz: f = 440 Hz.',
        },
        {
          en: 'One cycle therefore takes 1/440 of a second. That time is the period: T = 1 / 440 ≈ 0.00227 s.',
          ru: 'Значит, одно колебание занимает 1/440 секунды. Это время — период: T = 1 / 440 ≈ 0,00227 с.',
          de: 'Eine Schwingung dauert also 1/440 Sekunde. Diese Zeit ist die Periodendauer: T = 1 / 440 ≈ 0,00227 s.',
        },
        {
          en: 'Now take 220 Hz. Half as many cycles fit into one second, so each one lasts twice as long: T = 1 / 220 ≈ 0.00455 s.',
          ru: 'Теперь возьмём 220 Гц. В одну секунду умещается вдвое меньше колебаний, поэтому каждое длится вдвое дольше: T = 1 / 220 ≈ 0,00455 с.',
          de: 'Nimm nun 220 Hz. In eine Sekunde passen halb so viele Schwingungen, also dauert jede doppelt so lang: T = 1 / 220 ≈ 0,00455 s.',
        },
        {
          en: 'Frequency and period always move in opposite directions: double one and the other is halved.',
          ru: 'Частота и период всегда меняются в противоположных направлениях: если одну величину удвоить, другая уменьшится вдвое.',
          de: 'Frequenz und Periodendauer verändern sich immer gegenläufig: Verdoppelst du die eine, halbiert sich die andere.',
        },
      ],
      listen: {
        en: 'Play 220 Hz and 440 Hz one after the other and listen to how much higher the second tone sounds. It is one octave higher, and its frequency is twice that of the first.',
        ru: 'Послушайте 220 Гц и 440 Гц друг за другом и обратите внимание, насколько выше звучит второй тон. Он выше на октаву, а его частота вдвое больше, чем у первого.',
        de: 'Höre dir 220 Hz und 440 Hz nacheinander an und achte darauf, wie viel höher der zweite Ton klingt. Er liegt eine Oktave höher, und seine Frequenz ist doppelt so groß wie die des ersten.',
      },
      mistake: {
        en: 'Hertz and seconds measure different things. When a tone completes 440 cycles in one second, 440 counts the cycles, and 1/440 s is the time one cycle takes. Its frequency is 440 Hz, not “440 seconds” and not “1/440 Hz”.',
        ru: 'Герцы и секунды измеряют разное. Если тон совершает 440 колебаний за одну секунду, то 440 — это число колебаний, а 1/440 с — время одного колебания. Его частота — 440 Гц, а не «440 секунд» и не «1/440 Гц».',
        de: 'Hertz und Sekunden messen Verschiedenes. Führt ein Ton in einer Sekunde 440 Schwingungen aus, dann zählt 440 die Schwingungen, und 1/440 s ist die Dauer einer Schwingung. Seine Frequenz beträgt 440 Hz, nicht „440 Sekunden“ und nicht „1/440 Hz“.',
      },
      takeaways: [
        {
          en: 'For a periodic tone, frequency counts the cycles per second, in hertz; the period is the time of one cycle, in seconds.',
          ru: 'Частота периодического тона — число колебаний за секунду, в герцах; период — время одного колебания, в секундах.',
          de: 'Bei einem periodischen Ton zählt die Frequenz die Schwingungen pro Sekunde, in Hertz; die Periodendauer ist die Zeit einer Schwingung, in Sekunden.',
        },
        {
          en: 'T = 1 / f: the higher the frequency, the shorter the period.',
          ru: 'T = 1 / f: чем выше частота, тем короче период.',
          de: 'T = 1 / f: Je höher die Frequenz, desto kürzer die Periodendauer.',
        },
        {
          en: 'Pitch is what you hear: frequency strongly influences it, but the two are not the same thing.',
          ru: 'Высота звука — это то, что вы слышите: частота сильно на неё влияет, но это не одно и то же.',
          de: 'Tonhöhe ist das, was du hörst: Die Frequenz beeinflusst sie stark, ist aber nicht dasselbe.',
        },
        {
          en: 'Doubling the frequency, as from 220 Hz to 440 Hz, raises a tone by one octave.',
          ru: 'Удвоение частоты, например с 220 до 440 Гц, повышает тон на октаву.',
          de: 'Eine Verdopplung der Frequenz, etwa von 220 Hz auf 440 Hz, hebt einen Ton um eine Oktave an.',
        },
      ],
    },
    sourceId: 'source-043',
    experimentId: 'sound',
  },
  experiment: {
    id: 'sound',
    version: 1,
    scopeId: 'acoustics',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'sound',
    instructions: {
      en: 'Play 220 Hz, then double it to 440 Hz. The second tone is one octave higher.',
      ru: 'Послушайте 220 Гц, затем удвойте частоту до 440 Гц. Второй тон выше на октаву.',
      de: 'Spiele 220 Hz und verdopple anschließend auf 440 Hz. Der zweite Ton liegt eine Oktave höher.',
    },
    engine: 'sound-lab',
    preset: {
      hz: 220,
      wave: 'sine',
    },
  },
  exercises: [
    {
      id: 'entry-sound',
      version: 1,
      scopeId: 'acoustics',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'sound',
      kind: 'diagnostic',
      order: 0,
      label: {
        en: 'A periodic sound completes 440 cycles in one second. What is its frequency?',
        ru: 'Периодический звук совершает 440 колебаний за одну секунду. Какова его частота?',
        de: 'Ein periodischer Klang durchläuft 440 Schwingungen in einer Sekunde. Wie groß ist seine Frequenz?',
      },
      answer: 'hz',
      options: [
        {
          id: 'seconds',
          label: {
            en: '440 seconds',
            ru: '440 секунд',
            de: '440 Sekunden',
          },
          feedback: {
            en: 'Seconds measure time. Frequency counts cycles per second, so the frequency here is 440 Hz.',
            ru: 'Секунды измеряют время. Частота — число колебаний за секунду, поэтому здесь она равна 440 Гц.',
            de: 'Sekunden messen Zeit. Die Frequenz zählt Schwingungen pro Sekunde und beträgt hier 440 Hz.',
          },
        },
        {
          id: 'hz',
          label: {
            en: '440 Hz',
            ru: '440 Гц',
            de: '440 Hz',
          },
          feedback: {
            en: 'One hertz means one cycle per second: 440 cycles per second is 440 Hz.',
            ru: 'Один герц — одно колебание в секунду: 440 колебаний в секунду — это 440 Гц.',
            de: 'Ein Hertz entspricht einer Schwingung pro Sekunde: 440 Schwingungen pro Sekunde sind 440 Hz.',
          },
        },
        {
          id: 'inverse',
          label: {
            en: '1/440 Hz',
            ru: '1/440 Гц',
            de: '1/440 Hz',
          },
          feedback: {
            en: 'The reciprocal gives the period in seconds. The frequency is 440 Hz; one cycle takes 1/440 second.',
            ru: 'Обратная величина даёт период в секундах. Частота равна 440 Гц, одно колебание занимает 1/440 секунды.',
            de: 'Der Kehrwert ergibt die Periodendauer in Sekunden. Die Frequenz beträgt 440 Hz; eine Schwingung dauert 1/440 Sekunde.',
          },
        },
      ],
      sourceIds: ['source-057'],
    },
  ],
  concepts: [
    {
      id: 'Frequency',
      version: 1,
      scopeId: 'acoustics',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'sound',
      order: 44,
      reference: false,
      title: {
        en: 'Frequency',
        ru: 'Частота',
        de: 'Frequenz',
      },
      body: {
        en: 'The number of cycles per second of a periodic signal, measured in hertz.',
        ru: 'Количество колебаний периодического сигнала за секунду, измеряемое в герцах.',
        de: 'Anzahl der Schwingungen eines periodischen Signals pro Sekunde, gemessen in Hertz.',
      },
    },
    {
      id: 'Pitch',
      version: 1,
      scopeId: 'acoustics',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'sound',
      order: 45,
      reference: false,
      title: {
        en: 'Pitch',
        ru: 'Высота звука',
        de: 'Tonhöhe',
      },
      body: {
        en: 'The perceived highness or lowness of a sound; related to, but distinct from, frequency.',
        ru: 'Ощущение того, насколько звук высокий или низкий; связано с частотой, но не тождественно ей.',
        de: 'Die wahrgenommene Höhe oder Tiefe eines Klangs; eng mit der Frequenz verbunden, aber nicht mit ihr identisch.',
      },
    },
  ],
};
export default content;
