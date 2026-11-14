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
    version: 2,
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
        en: 'An interval describes the relationship between two pitches. Play them one after another to hear a melodic interval, or together to hear a harmonic interval. An octave measures 1,200 cents. In twelve-tone equal temperament it is divided into twelve equal semitones of 100 cents each.',
        ru: 'Интервал — это соотношение двух звуков по высоте. Если звуки берутся один за другим, интервал называется мелодическим, если одновременно — гармоническим. Октава равна 1200 центам. В двенадцатиступенной равномерной темперации она делится на 12 одинаковых полутонов по 100 центов.',
        de: 'Ein Intervall beschreibt das Verhältnis zweier Tonhöhen. Erklingen die Töne nacheinander, bilden sie ein melodisches Intervall; erklingen sie gleichzeitig, ein harmonisches. Eine Oktave misst 1200 Cent. In der zwölfstufigen gleichstufigen Stimmung ist sie in zwölf gleiche Halbtöne zu je 100 Cent geteilt.',
      },
      {
        en: 'To name an interval, count its letter names, including both ends, then identify its quality. C–E spans C, D, E: a third. C–F spans four names: a fourth. C–D♯ and C–E♭ are played on the same two keys and sound identical in twelve-tone equal temperament, but are written as an augmented second and a minor third. In the formula, f₁ and f₂ are the two positive frequencies; use f₂ ≥ f₁ for an upward interval.',
        ru: 'Чтобы назвать интервал, сосчитайте ступени, которые он охватывает, включая обе крайние: это его ступеневая (количественная) величина. Затем определите тоновую (качественную) величину — число тонов и полутонов; от неё зависит, будет ли интервал чистым, большим, малым, увеличенным или уменьшённым. До — ми охватывает до, ре, ми: это терция. До — фа охватывает четыре ступени: это кварта. До — ре-диез и до — ми-бемоль берутся на одних и тех же двух клавишах и в двенадцатиступенной равномерной темперации звучат одинаково, но записываются как увеличенная секунда и малая терция. В формуле f₁ и f₂ — две положительные частоты; для восходящего интервала f₂ ≥ f₁.',
        de: 'Zähle für den Intervallnamen die Stammtonstufen einschließlich beider Endpunkte und bestimme dann die Intervallqualität. C–E umfasst C, D, E: eine Terz. C–F umfasst vier Stufen: eine Quarte. C–Dis und C–Es liegen auf denselben Tasten und klingen in zwölfstufiger gleichstufiger Stimmung gleich, werden aber als übermäßige Sekunde und kleine Terz notiert. In der Formel sind f₁ und f₂ positive Frequenzen; für ein aufsteigendes Intervall gilt f₂ ≥ f₁.',
        ruMarkup:
          'Чтобы назвать интервал, сосчитайте ступени, которые он охватывает, включая обе крайние: это его ступеневая (количественная) величина. Затем определите тоновую (качественную) величину — число тонов и полутонов; от неё зависит, будет ли интервал чистым, большим, малым, увеличенным или уменьшённым. [[До]] — [[ми]] охватывает [[до]], [[ре]], [[ми]]: это терция. [[До]] — [[фа]] охватывает четыре ступени: это кварта. [[До]] — [[ре-диез]] и [[до]] — [[ми-бемоль]] берутся на одних и тех же двух клавишах и в двенадцатиступенной равномерной темперации звучат одинаково, но записываются как увеличенная секунда и малая терция. В формуле f₁ и f₂ — две положительные частоты; для восходящего интервала f₂ ≥ f₁.',
      },
    ],
    guide: {
      question: {
        en: 'Why do C–D♯ and C–E♭ have different names when they are played on the same two keys?',
        ru: 'Почему у интервалов до — ре-диез и до — ми-бемоль разные названия, если они берутся на одних и тех же клавишах?',
        de: 'Warum heißen C–Dis und C–Es verschieden, obwohl sie auf denselben beiden Tasten liegen?',
        ruMarkup:
          'Почему у интервалов [[до]] — [[ре-диез]] и [[до]] — [[ми-бемоль]] разные названия, если они берутся на одних и тех же клавишах?',
      },
      example: [
        {
          en: 'Take C–E and count the letter names, including both ends: C, D, E. Three names make a third.',
          ru: 'Возьмите до — ми и сосчитайте ступени, включая обе крайние: до, ре, ми. Три ступени — это терция.',
          de: 'Nimm C–E und zähle die Stammtonstufen einschließlich beider Endpunkte: C, D, E. Drei Stufen ergeben eine Terz.',
          ruMarkup:
            'Возьмите [[до]] — [[ми]] и сосчитайте ступени, включая обе крайние: [[до]], [[ре]], [[ми]]. Три ступени — это терция.',
        },
        {
          en: 'Now count the semitones from C up to E: there are 4. A third of 4 semitones is a major third; a third of 3 semitones is a minor third.',
          ru: 'Теперь сосчитайте полутоны между до и ми: их 4. Терция из 4 полутонов — большая, терция из 3 полутонов — малая.',
          de: 'Zähle nun die Halbtöne von C hinauf zu E: Es sind 4. Eine Terz mit 4 Halbtönen ist eine große Terz, eine Terz mit 3 Halbtönen eine kleine.',
          ruMarkup:
            'Теперь сосчитайте полутоны между [[до]] и [[ми]]: их 4. Терция из 4 полутонов — большая, терция из 3 полутонов — малая.',
        },
        {
          en: 'C–E♭ still spans C, D, E, so it is still a third. It has only 3 semitones: a minor third.',
          ru: 'До — ми-бемоль по-прежнему охватывает до, ре, ми, значит, это тоже терция. Но полутонов в ней только 3: это малая терция.',
          de: 'C–Es umfasst weiterhin C, D, E und bleibt deshalb eine Terz. Es sind aber nur 3 Halbtöne: eine kleine Terz.',
          ruMarkup:
            '[[До]] — [[ми-бемоль]] по-прежнему охватывает [[до]], [[ре]], [[ми]], значит, это тоже терция. Но полутонов в ней только 3: это малая терция.',
        },
        {
          en: 'C–D♯ uses the same two keys as C–E♭, but it spans only two letter names, C and D. That makes it a second, here an augmented second.',
          ru: 'До — ре-диез берётся на тех же двух клавишах, что и до — ми-бемоль, но охватывает только две ступени: до и ре. Значит, это секунда, а именно увеличенная секунда.',
          de: 'C–Dis liegt auf denselben beiden Tasten wie C–Es, umfasst aber nur zwei Stufen, C und D. Es ist also eine Sekunde, hier eine übermäßige Sekunde.',
          ruMarkup:
            '[[До]] — [[ре-диез]] берётся на тех же двух клавишах, что и [[до]] — [[ми-бемоль]], но охватывает только две ступени: [[до]] и [[ре]]. Значит, это секунда, а именно увеличенная секунда.',
        },
        {
          en: 'Cents measure the size. In twelve-tone equal temperament every semitone is 100 cents, so the minor third is 300 cents, the major third 400 and the perfect fifth 700.',
          ru: 'Величину интервала измеряют в центах. В двенадцатиступенной равномерной темперации каждый полутон равен 100 центам, поэтому малая терция — это 300 центов, большая — 400, а чистая квинта — 700.',
          de: 'Die Größe misst du in Cent. In der zwölfstufigen gleichstufigen Stimmung hat jeder Halbton 100 Cent: Die kleine Terz misst also 300 Cent, die große 400 und die reine Quinte 700.',
        },
      ],
      listen: {
        en: 'Each example plays C4 and then a higher note. The minor third (3 semitones) and the major third (4) differ by one semitone; the perfect fifth (7) is clearly wider. After hearing an example, sing its second note yourself, then play it again to check.',
        ru: 'В каждом примере звучит до первой октавы, а затем более высокий звук. Малая терция (3 полутона) и большая терция (4) различаются на один полутон; чистая квинта (7) заметно шире. Прослушав пример, спойте его второй звук сами, а затем включите пример снова и проверьте себя.',
        de: 'In jedem Beispiel erklingt c′ und danach ein höherer Ton. Die kleine Terz (3 Halbtöne) und die große Terz (4) unterscheiden sich um einen Halbton; die reine Quinte (7) ist deutlich weiter. Singe nach dem Hören den zweiten Ton selbst und spiele das Beispiel zur Kontrolle erneut.',
        ruMarkup:
          'В каждом примере звучит [[до]] первой октавы, а затем более высокий звук. Малая терция (3 полутона) и большая терция (4) различаются на один полутон; чистая квинта (7) заметно шире. Прослушав пример, спойте его второй звук сами, а затем включите пример снова и проверьте себя.',
      },
      mistake: {
        en: 'Do not name an interval from the keys alone. C–D♯ and C–E♭ sound identical in twelve-tone equal temperament, yet one is an augmented second and the other a minor third. Count the letter names first, including both ends, and only then the semitones.',
        ru: 'Не называйте интервал только по клавишам. В двенадцатиступенной равномерной темперации до — ре-диез и до — ми-бемоль звучат одинаково, но первый интервал — увеличенная секунда, а второй — малая терция. Сначала сосчитайте ступени, включая обе крайние, и только потом полутоны.',
        de: 'Benenne ein Intervall nicht allein nach den Tasten. C–Dis und C–Es klingen in zwölfstufiger gleichstufiger Stimmung gleich, sind aber eine übermäßige Sekunde und eine kleine Terz. Zähle zuerst die Stammtonstufen einschließlich beider Endpunkte und erst danach die Halbtöne.',
        ruMarkup:
          'Не называйте интервал только по клавишам. В двенадцатиступенной равномерной темперации [[до]] — [[ре-диез]] и [[до]] — [[ми-бемоль]] звучат одинаково, но первый интервал — увеличенная секунда, а второй — малая терция. Сначала сосчитайте ступени, включая обе крайние, и только потом полутоны.',
      },
      takeaways: [
        {
          en: 'Two notes played one after another form a melodic interval; played together they form a harmonic interval.',
          ru: 'Два звука, взятые один за другим, образуют мелодический интервал, взятые одновременно — гармонический.',
          de: 'Zwei Töne nacheinander bilden ein melodisches Intervall, zwei Töne gleichzeitig ein harmonisches.',
        },
        {
          en: 'Count the letter names, both ends included, to name the interval: C–E is a third, C–F is a fourth.',
          ru: 'Чтобы назвать интервал, сосчитайте ступени, включая обе крайние: до — ми — это терция, до — фа — это кварта.',
          de: 'Zähle die Stammtonstufen einschließlich beider Endpunkte, um das Intervall zu benennen: C–E ist eine Terz, C–F eine Quarte.',
          ruMarkup:
            'Чтобы назвать интервал, сосчитайте ступени, включая обе крайние: [[до]] — [[ми]] — это терция, [[до]] — [[фа]] — это кварта.',
        },
        {
          en: 'A third of 3 semitones is minor and a third of 4 semitones is major; a perfect fifth has 7 semitones.',
          ru: 'Терция из 3 полутонов — малая, из 4 полутонов — большая; в чистой квинте 7 полутонов.',
          de: 'Eine Terz mit 3 Halbtönen ist klein, eine mit 4 Halbtönen groß; die reine Quinte hat 7 Halbtöne.',
        },
        {
          en: 'An octave measures 1,200 cents; in twelve-tone equal temperament each semitone is 100 cents.',
          ru: 'Октава равна 1200 центам; в двенадцатиступенной равномерной темперации каждый полутон равен 100 центам.',
          de: 'Eine Oktave misst 1200 Cent; in der zwölfstufigen gleichstufigen Stimmung hat jeder Halbton 100 Cent.',
        },
      ],
    },
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
      version: 2,
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
        de: 'Ein Hundertstel eines gleichstufigen Halbtons. Eine Oktave umfasst 1200 Cent.',
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
