export type LocalText = { en: string; ru: string };
const b = (en: string, ru: string): LocalText => ({ en, ru });
export const lessons = [
  {
    id: 'sound',
    title: b('Sound & frequency', 'Звук и частота'),
    category: b('Acoustics', 'Акустика'),
    summary: b(
      'Why some sounds feel higher than others.',
      'Почему одни звуки выше других.',
    ),
    formula: 'T = 1 / f',
    paragraphs: [
      b(
        'Sound is a changing pressure that travels through a medium. For a periodic tone, frequency counts how many cycles repeat each second. The unit is the hertz (Hz). A 440 Hz tone repeats 440 times in one second.',
        'Звук — изменения давления, распространяющиеся в среде. Для периодического тона частота показывает, сколько колебаний повторяется за секунду. Единица измерения — герц (Гц). Тон 440 Гц совершает 440 колебаний за секунду.',
      ),
      b(
        'Pitch is our perception of how high or low a sound is. Frequency strongly influences pitch, but a complex sound can contain many frequencies. Timbre depends on their relative strength and on how the sound develops over time.',
        'Высота — ощущение того, насколько звук высокий или низкий. Частота сильно влияет на высоту, но сложный звук может содержать много частот. Тембр зависит от их соотношения и от того, как звук развивается во времени.',
      ),
    ],
    experiment: b(
      'Play 220 Hz, then double it to 440 Hz. The second tone is one octave higher.',
      'Послушайте 220 Гц, затем удвойте частоту до 440 Гц. Второй тон выше на октаву.',
    ),
    hz: 220,
    wave: 'sine',
    source: 'https://newt.phys.unsw.edu.au/jw/notes.html',
  },
  {
    id: 'tuning',
    title: b('A reference, a whole system', 'Опора для целой системы'),
    category: b('Tuning', 'Строй'),
    summary: b(
      'Change A4 without changing the names of the notes.',
      'Меняйте A4, сохраняя названия нот.',
    ),
    formula: 'f(n) = A4 × 2^((n − 69) / 12)',
    paragraphs: [
      b(
        'A reference pitch assigns a frequency to a named note. In this lab, that note is A4. If you change A4 from 440 to 432 Hz, the other frequencies shift by the same factor. The interval relationships stay the same.',
        'Опорная частота связывает высоту с названием ноты. Здесь это A4 — ля первой октавы в русской системе. При изменении A4 с 440 до 432 Гц остальные частоты меняются в той же пропорции. Интервальные отношения сохраняются.',
      ),
      b(
        'Temperament is a separate choice. Twelve-tone equal temperament divides an octave into twelve equal logarithmic steps. The formula uses the MIDI number n; A4 is 69. The lab also offers fixed, A-based ratio maps for just and Pythagorean tuning. These maps do not reproduce every historical practice or every musical key.',
        'Строй — отдельный выбор. Двенадцатиступенный равномерный строй делит октаву на 12 равных логарифмических шагов. В формуле n — номер MIDI; для A4 он равен 69. Лаборатория также предлагает фиксированные отношения чистого и пифагорейского строя от A. Они не воспроизводят все исторические практики и тональности.',
      ),
    ],
    experiment: b(
      'Select A4 = 432 Hz and play the keyboard. Switch tuning systems and listen to C♯5 against A4.',
      'Выберите A4 = 432 Гц и сыграйте на клавиатуре. Сравните C♯5 и A4 в разных строях.',
    ),
    hz: 440,
    wave: 'sine',
    source: 'https://newt.phys.unsw.edu.au/music/temperament/WhatFor.html',
  },
  {
    id: 'intervals',
    title: b('The distance between notes', 'Расстояние между нотами'),
    category: b('Intervals', 'Интервалы'),
    summary: b(
      'Hear the building blocks of melody and harmony.',
      'Услышьте основу мелодии и гармонии.',
    ),
    formula: 'cents = 1200 × log₂(f₂ / f₁)',
    paragraphs: [
      b(
        'An interval describes the relationship between two pitches. Play them one after another to hear a melodic interval, or together to hear a harmonic interval. In equal temperament, an octave spans twelve semitones, or 1,200 cents.',
        'Интервал описывает отношение двух высот. Последовательное звучание образует мелодический интервал, одновременное — гармонический. В равномерном строе октава содержит 12 полутонов, или 1200 центов.',
      ),
      b(
        'Interval names count letter names as well as distance in semitones. C–E is a third; C–F is a fourth. Enharmonic pitches can share a keyboard key while having different interval spellings. The lab uses simple names for its listening examples.',
        'Названия интервалов учитывают буквенные имена, а не только полутоны. C–E — терция, C–F — кварта. Энгармонические звуки могут соответствовать одной клавише, но образовывать по-разному записанные интервалы. В слуховых примерах лаборатория использует простые названия.',
      ),
    ],
    experiment: b(
      'Compare a minor third (3 semitones), a major third (4) and a perfect fifth (7). Sing the second note before playing it.',
      'Сравните малую терцию (3 полутона), большую терцию (4) и чистую квинту (7). Спойте второй звук до воспроизведения.',
    ),
    hz: 440,
    wave: 'sine',
    source:
      'https://musictheory.pugetsound.edu/mt21c/IntervalsIntroduction.html',
  },
  {
    id: 'timbre',
    title: b('One pitch, many colours', 'Одна высота — много тембров'),
    category: b('Timbre', 'Тембр'),
    summary: b(
      'Explore the partials inside a sound.',
      'Исследуйте составляющие звука.',
    ),
    formula: 'fₖ = k × f₁',
    paragraphs: [
      b(
        'A sine wave contains a single frequency. More complex periodic waves contain harmonics: frequencies at whole-number multiples of the fundamental. Their balance changes the waveform and the sound’s colour.',
        'Синусоида содержит одну частоту. Более сложные периодические волны содержат гармоники — частоты, кратные основной. Их соотношение меняет форму волны и окраску звука.',
      ),
      b(
        'Ideal square and triangle waves contain odd harmonics; an ideal sawtooth contains both even and odd harmonics. Real instrument timbres also depend on attack, decay, noise and sometimes non-harmonic partials. A waveform alone is not an instrument model.',
        'Идеальные прямоугольная и треугольная волны содержат нечётные гармоники, пилообразная — и чётные, и нечётные. Тембр реальных инструментов также зависит от атаки, затухания, шумов и иногда негармонических обертонов. Одна форма волны не моделирует инструмент полностью.',
      ),
    ],
    experiment: b(
      'Hold A4 and switch between sine, triangle, square and sawtooth. Keep the volume low while comparing.',
      'Включите A4 и переключайте синус, треугольник, меандр и пилу. Сравнивайте на небольшой громкости.',
    ),
    hz: 440,
    wave: 'triangle',
    source:
      'https://newt.phys.unsw.edu.au/jw/musical-sounds-musical-instruments.html',
  },
  {
    id: 'scales',
    title: b('Scales & modes', 'Звукоряды и лады'),
    category: b('Melody', 'Мелодия'),
    summary: b(
      'A collection of notes becomes a musical landscape.',
      'Как набор нот становится музыкальной средой.',
    ),
    formula: 'Major: 2 – 2 – 1 – 2 – 2 – 2 – 1',
    paragraphs: [
      b(
        'A scale orders a collection of pitches. A major scale follows a repeating pattern of whole tones and semitones. A mode also concerns how a tonal centre and characteristic notes are heard; it is more than starting a familiar scale on another key.',
        'Звукоряд упорядочивает набор высот. Мажорная гамма следует определённой последовательности тонов и полутонов. Лад связан также с ощущением опоры и характерных ступеней: это больше, чем начало знакомой гаммы с другой клавиши.',
      ),
      b(
        'Try major, natural minor, Dorian and pentatonic collections in the lab. The blues example is a six-note equal-tempered simplification. Expressive blue notes are not restricted to fixed piano-key pitches.',
        'Сравните мажор, натуральный минор, дорийский лад и пентатонику. Блюзовый пример — упрощённый шестиступенный звукоряд в равномерном строе. Выразительные блюзовые ноты не ограничены фиксированными высотами клавиш.',
      ),
    ],
    experiment: b(
      'Use the same tonic for major and Dorian. Listen especially to the third and seventh scale degrees.',
      'Сравните мажор и дорийский лад от одной тоники. Обратите внимание на третью и седьмую ступени.',
    ),
    hz: 261.625565,
    wave: 'triangle',
    source: 'https://viva.pressbooks.pub/openmusictheory/table-of-contents/',
  },
  {
    id: 'chords',
    title: b('Building a chord', 'Как построить аккорд'),
    category: b('Harmony', 'Гармония'),
    summary: b(
      'Stack intervals and hear a new identity.',
      'Соединяйте интервалы и слушайте результат.',
    ),
    formula: 'Major: 0 · 4 · 7   /   Minor: 0 · 3 · 7',
    paragraphs: [
      b(
        'A triad contains three pitch classes arranged in thirds. A major triad has a major third and a perfect fifth above its root. Lower its third by a semitone to make a minor triad. Doubling a note in another octave does not create a new chord member.',
        'Трезвучие состоит из трёх классов высот, расположенных по терциям. Мажорное трезвучие содержит большую терцию и чистую квинту от основного тона. Понизьте терцию на полутон — получится минорное трезвучие. Удвоение ноты в октаву не добавляет новой ступени аккорда.',
      ),
      b(
        'Add a seventh for a four-note chord. A dominant seventh uses offsets 0, 4, 7 and 10 semitones in equal temperament. Chord meaning also depends on context, voicing, rhythm and voice leading. An isolated chord cannot explain a whole harmonic style.',
        'Добавление септимы образует четырёхзвучный аккорд. Малый мажорный септаккорд использует смещения 0, 4, 7 и 10 полутонов в равномерном строе. Значение аккорда зависит и от контекста, расположения голосов, ритма и голосоведения. Отдельный аккорд не объясняет гармонический стиль целиком.',
      ),
    ],
    experiment: b(
      'Compare major and minor on the same root, first as an arpeggio and then together.',
      'Сравните мажор и минор от одного основного тона: сначала последовательно, затем одновременно.',
    ),
    hz: 261.625565,
    wave: 'triangle',
    source: 'https://viva.pressbooks.pub/openmusictheory/chapter/triads/',
  },
];
export const curriculum = [
  {
    title: b('Sound & musical foundations', 'Звук и музыкальные основы'),
    topics: b(
      'Acoustics · pitch · intervals · rhythm · notation',
      'Акустика · высота · интервалы · ритм · нотация',
    ),
    state: b('6 introductory lessons available', 'Доступны 6 вводных уроков'),
  },
  {
    title: b('Early music & polyphony', 'Ранняя музыка и полифония'),
    topics: b(
      'Modal practices · chant · counterpoint · mensural notation',
      'Модальные практики · монодия · контрапункт · мензуральная нотация',
    ),
    state: b('Curriculum planned', 'План развития'),
  },
  {
    title: b(
      'European traditions, 1600–1900',
      'Европейские традиции, 1600–1900',
    ),
    topics: b(
      'Tonal harmony · voice leading · form · orchestration',
      'Тональная гармония · голосоведение · форма · оркестровка',
    ),
    state: b('Curriculum planned', 'План развития'),
  },
  {
    title: b('Blues, jazz & popular music', 'Блюз, джаз и популярная музыка'),
    topics: b(
      'Groove · extended harmony · song form · improvisation',
      'Грув · расширенная гармония · форма песни · импровизация',
    ),
    state: b('Curriculum planned', 'План развития'),
  },
  {
    title: b('Musical worlds', 'Музыкальные культуры мира'),
    topics: b(
      'Maqam · raga · gamelan · oral traditions · rhythmic systems',
      'Макам · рага · гамелан · устные традиции · ритмические системы',
    ),
    state: b('Curriculum planned', 'План развития'),
  },
  {
    title: b('New musical languages', 'Новые музыкальные языки'),
    topics: b(
      'Post-tonality · microtonality · synthesis · experimental notation',
      'Посттональность · микротональность · синтез · экспериментальная нотация',
    ),
    state: b('Curriculum planned', 'План развития'),
  },
];
export const terms = [
  {
    title: b('Frequency', 'Частота'),
    body: b(
      'The number of cycles per second of a periodic signal, measured in hertz.',
      'Количество колебаний периодического сигнала за секунду, измеряемое в герцах.',
    ),
    lesson: 'sound',
  },
  {
    title: b('Pitch', 'Высота звука'),
    body: b(
      'The perceived highness or lowness of a sound; related to, but distinct from, frequency.',
      'Ощущение того, насколько звук высокий или низкий; связано с частотой, но не тождественно ей.',
    ),
    lesson: 'sound',
  },
  {
    title: b('Reference pitch', 'Опорная частота'),
    body: b(
      'A chosen frequency for a named note, used as an anchor for tuning other notes.',
      'Выбранная частота именованной ноты, относительно которой настраивают остальные.',
    ),
    lesson: 'tuning',
  },
  {
    title: b('Cent', 'Цент'),
    body: b(
      'One hundredth of an equal-tempered semitone. There are 1,200 cents in an octave.',
      'Одна сотая равномерно темперированного полутона. Октава содержит 1200 центов.',
    ),
    lesson: 'intervals',
  },
  {
    title: b('Octave', 'Октава'),
    body: b(
      'An interval with a 2:1 frequency ratio in the tuning systems used here.',
      'Интервал с отношением частот 2:1 в используемых здесь системах настройки.',
    ),
    lesson: 'intervals',
  },
  {
    title: b('Equal temperament', 'Равномерный строй'),
    body: b(
      'A system with equal frequency ratios between adjacent steps. Here, twelve steps divide the octave.',
      'Система с одинаковыми отношениями частот соседних ступеней. Здесь октава делится на 12 шагов.',
    ),
    lesson: 'tuning',
  },
  {
    title: b('Just intonation', 'Чистый строй'),
    body: b(
      'Tuning based on selected simple whole-number ratios. A fixed ratio map depends on its tonal reference.',
      'Настройка на основе выбранных простых отношений целых чисел. Фиксированная таблица зависит от тональной опоры.',
    ),
    lesson: 'tuning',
  },
  {
    title: b('Harmonic', 'Гармоника'),
    body: b(
      'A sinusoidal component at a whole-number multiple of a fundamental frequency.',
      'Синусоидальная составляющая с частотой, кратной основной частоте.',
    ),
    lesson: 'timbre',
  },
  {
    title: b('Timbre', 'Тембр'),
    body: b(
      'The qualities that distinguish sounds beyond pitch and loudness, including spectrum and temporal envelope.',
      'Качества, отличающие звуки помимо высоты и громкости, включая спектр и развитие во времени.',
    ),
    lesson: 'timbre',
  },
  {
    title: b('Scale', 'Звукоряд'),
    body: b(
      'An ordered collection of pitches. A scale alone does not describe a complete musical tradition.',
      'Упорядоченный набор высот. Сам по себе звукоряд не описывает музыкальную традицию целиком.',
    ),
    lesson: 'scales',
  },
  {
    title: b('Triad', 'Трезвучие'),
    body: b(
      'A three-pitch-class chord that can be arranged as two stacked thirds.',
      'Аккорд из трёх классов высот, которые можно расположить по терциям.',
    ),
    lesson: 'chords',
  },
  {
    title: b('Voice leading', 'Голосоведение'),
    body: b(
      'The way individual melodic lines move from one sonority to the next.',
      'Движение отдельных мелодических голосов от одного созвучия к следующему.',
    ),
    lesson: 'chords',
  },
];
export const patterns = {
  intervals: [
    { en: 'Minor second', ru: 'Малая секунда', steps: [0, 1] },
    { en: 'Major second', ru: 'Большая секунда', steps: [0, 2] },
    { en: 'Minor third', ru: 'Малая терция', steps: [0, 3] },
    { en: 'Major third', ru: 'Большая терция', steps: [0, 4] },
    { en: 'Perfect fourth', ru: 'Чистая кварта', steps: [0, 5] },
    { en: 'Tritone', ru: 'Тритон', steps: [0, 6] },
    { en: 'Perfect fifth', ru: 'Чистая квинта', steps: [0, 7] },
    { en: 'Octave', ru: 'Октава', steps: [0, 12] },
  ],
  scales: [
    { en: 'Major', ru: 'Мажор', steps: [0, 2, 4, 5, 7, 9, 11, 12] },
    {
      en: 'Natural minor',
      ru: 'Натуральный минор',
      steps: [0, 2, 3, 5, 7, 8, 10, 12],
    },
    { en: 'Dorian', ru: 'Дорийский', steps: [0, 2, 3, 5, 7, 9, 10, 12] },
    {
      en: 'Mixolydian',
      ru: 'Миксолидийский',
      steps: [0, 2, 4, 5, 7, 9, 10, 12],
    },
    {
      en: 'Major pentatonic',
      ru: 'Мажорная пентатоника',
      steps: [0, 2, 4, 7, 9, 12],
    },
    {
      en: 'Minor pentatonic',
      ru: 'Минорная пентатоника',
      steps: [0, 3, 5, 7, 10, 12],
    },
    {
      en: 'Blues (12-TET)',
      ru: 'Блюзовый (12-TET)',
      steps: [0, 3, 5, 6, 7, 10, 12],
    },
  ],
  chords: [
    { en: 'Major triad', ru: 'Мажорное трезвучие', steps: [0, 4, 7] },
    { en: 'Minor triad', ru: 'Минорное трезвучие', steps: [0, 3, 7] },
    { en: 'Diminished', ru: 'Уменьшённое', steps: [0, 3, 6] },
    { en: 'Augmented', ru: 'Увеличенное', steps: [0, 4, 8] },
    {
      en: 'Dominant seventh',
      ru: 'Малый мажорный септаккорд',
      steps: [0, 4, 7, 10],
    },
    {
      en: 'Major seventh',
      ru: 'Большой мажорный септаккорд',
      steps: [0, 4, 7, 11],
    },
    {
      en: 'Minor seventh',
      ru: 'Малый минорный септаккорд',
      steps: [0, 3, 7, 10],
    },
  ],
};
