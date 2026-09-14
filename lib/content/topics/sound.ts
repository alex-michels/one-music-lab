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
    version: 1,
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
        ru: 'Высота — ощущение того, насколько звук высокий или низкий. Частота сильно влияет на высоту, но сложный звук может содержать много частот. Тембр зависит от их соотношения и от того, как звук развивается во времени.',
        de: 'Tonhöhe bezeichnet, wie hoch oder tief wir einen Klang wahrnehmen. Die Frequenz beeinflusst sie stark, doch ein komplexer Klang enthält viele Frequenzen. Die Klangfarbe hängt von deren Stärkeverhältnis und vom zeitlichen Verlauf ab.',
      },
    ],
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
