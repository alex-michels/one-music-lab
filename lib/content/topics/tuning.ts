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
    version: 2,
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
      en: 'f(n) = f(A4) × 2^((n − 69) / 12)',
      ru: 'f(n) = f(ля первой октавы) × 2^((n − 69) / 12)',
      de: 'f(n) = f(a′) × 2^((n − 69) / 12)',
      ruMarkup: 'f(n) = f([[ля]] первой октавы) × 2^((n − 69) / 12)',
    },
    paragraphs: [
      {
        en: 'A reference pitch assigns a frequency to a named note. In this lab, that note is A4. If you change A4 from 440 to 432 Hz, the other frequencies shift by the same factor. The interval relationships stay the same.',
        ru: 'Опорная частота — это частота, назначенная одной определённой ноте. Здесь эта нота — ля первой октавы. Если изменить её частоту с 440 на 432 Гц, частоты всех остальных нот изменятся в той же пропорции, а интервалы между нотами останутся прежними.',
        de: 'Ein Bezugston verbindet einen Tonnamen mit einer Frequenz. Hier ist es das eingestrichene a (a′). Änderst du es von 440 auf 432 Hz, ändern sich alle anderen Frequenzen im selben Verhältnis. Die Intervallverhältnisse bleiben erhalten.',
        ruMarkup:
          'Опорная частота — это частота, назначенная одной определённой ноте. Здесь эта нота — [[ля]] первой октавы. Если изменить её частоту с 440 на 432 Гц, частоты всех остальных нот изменятся в той же пропорции, а интервалы между нотами останутся прежними.',
      },
      {
        en: 'A tuning system is a separate choice. Twelve-tone equal temperament divides an octave into twelve equal steps, each with the same frequency ratio. In the formula, n is the MIDI note number; A4 is 69. The formula applies to this temperament. The lab also offers fixed, A-based ratio maps for just and Pythagorean tuning. Those maps do not reproduce every historical practice or every musical key.',
        ru: 'Музыкальный строй выбирают отдельно. Двенадцатиступенная равномерная темперация делит октаву на 12 шагов с одинаковым отношением частот. В формуле n — номер ноты MIDI; для ля первой октавы он равен 69. Формула относится именно к этому строю. В лаборатории есть также фиксированные таблицы отношений чистого и пифагорова строя с опорой на ля. Они не воспроизводят все исторические практики и тональности.',
        de: 'Das Stimmungssystem wählst du unabhängig vom Bezugston. Die zwölfstufige gleichstufige Stimmung teilt die Oktave in zwölf Schritte mit jeweils gleichem Frequenzverhältnis. In der Formel ist n die MIDI-Notennummer; a′ hat die Nummer 69. Die Formel gilt für diese Stimmung. Das Labor bietet außerdem feste, auf A bezogene Verhältnistabellen für reine und pythagoreische Stimmung. Diese Modelle bilden nicht jede historische Praxis oder Tonart ab.',
        ruMarkup:
          'Музыкальный строй выбирают отдельно. Двенадцатиступенная равномерная темперация делит октаву на 12 шагов с одинаковым отношением частот. В формуле n — номер ноты MIDI; для [[ля]] первой октавы он равен 69. Формула относится именно к этому строю. В лаборатории есть также фиксированные таблицы отношений чистого и пифагорова строя с опорой на [[ля]]. Они не воспроизводят все исторические практики и тональности.',
      },
    ],
    guide: {
      question: {
        en: 'If I tune A4 to 432 Hz instead of 440 Hz, have I changed the tuning system as well?',
        ru: 'Если настроить ля первой октавы на 432 Гц вместо 440 Гц, изменится ли вместе с этим и музыкальный строй?',
        de: 'Wenn ich a′ auf 432 Hz statt auf 440 Hz stimme, habe ich dann auch das Stimmungssystem gewechselt?',
        ruMarkup:
          'Если настроить [[ля]] первой октавы на 432 Гц вместо 440 Гц, изменится ли вместе с этим и музыкальный строй?',
      },
      example: [
        {
          en: 'Start with the reference: A4 = 440 Hz. A4 has the number n = 69, so the exponent (n − 69) / 12 in the formula is 0 and f = 440 × 2^0 = 440 Hz.',
          ru: 'Начните с опоры: ля первой октавы = 440 Гц. У этой ноты n = 69, поэтому показатель степени (n − 69) / 12 в формуле равен 0 и f = 440 × 2^0 = 440 Гц.',
          de: 'Beginne mit dem Bezugston: a′ = 440 Hz. Für a′ ist n = 69, der Exponent (n − 69) / 12 in der Formel ist also 0 und f = 440 × 2^0 = 440 Hz.',
          ruMarkup:
            'Начните с опоры: [[ля]] первой октавы = 440 Гц. У этой ноты n = 69, поэтому показатель степени (n − 69) / 12 в формуле равен 0 и f = 440 × 2^0 = 440 Гц.',
        },
        {
          en: 'Counting every key, white and black, C♯5 is the fourth key above A4, so n = 69 + 4 = 73. In twelve-tone equal temperament the formula gives f = 440 × 2^(4/12) ≈ 554.37 Hz.',
          ru: 'Если считать все клавиши подряд, белые и чёрные, до-диез второй октавы — четвёртая клавиша вверх от ля первой, поэтому n = 69 + 4 = 73. В двенадцатиступенной равномерной темперации формула даёт f = 440 × 2^(4/12) ≈ 554,37 Гц.',
          de: 'Zählst du alle Tasten, weiße wie schwarze, ist cis″ die vierte Taste über a′, also ist n = 69 + 4 = 73. In der zwölfstufigen gleichstufigen Stimmung ergibt die Formel f = 440 × 2^(4/12) ≈ 554,37 Hz.',
          ruMarkup:
            'Если считать все клавиши подряд, белые и чёрные, [[до-диез]] второй октавы — четвёртая клавиша вверх от [[ля]] первой, поэтому n = 69 + 4 = 73. В двенадцатиступенной равномерной темперации формула даёт f = 440 × 2^(4/12) ≈ 554,37 Гц.',
        },
        {
          en: 'Now set A4 to 432 Hz: the same formula gives C♯5 = 432 × 2^(4/12) ≈ 544.29 Hz. Both notes are lower than before.',
          ru: 'Теперь задайте для ля первой октавы 432 Гц: та же формула даёт для ноты до-диез второй октавы 432 × 2^(4/12) ≈ 544,29 Гц. Обе ноты стали ниже.',
          de: 'Stelle nun a′ auf 432 Hz: Dieselbe Formel ergibt für cis″ 432 × 2^(4/12) ≈ 544,29 Hz. Beide Töne liegen tiefer als vorher.',
          ruMarkup:
            'Теперь задайте для [[ля]] первой октавы 432 Гц: та же формула даёт для ноты [[до-диез]] второй октавы 432 × 2^(4/12) ≈ 544,29 Гц. Обе ноты стали ниже.',
        },
        {
          en: 'Divide the frequency of C♯5 by that of A4 in both cases: 554.37 / 440 and 544.29 / 432 each come to about 1.26. The reference moved; the interval between the two notes did not.',
          ru: 'В обоих случаях разделите частоту ноты до-диез на частоту ноты ля: 554,37 / 440 и 544,29 / 432 дают примерно 1,26. Опора сдвинулась, а интервал между нотами остался прежним.',
          de: 'Teile in beiden Fällen die Frequenz von cis″ durch die von a′: 554,37 / 440 und 544,29 / 432 ergeben jeweils etwa 1,26. Der Bezugston hat sich verschoben, das Intervall zwischen den beiden Tönen nicht.',
          ruMarkup:
            'В обоих случаях разделите частоту ноты [[до-диез]] на частоту ноты [[ля]]: 554,37 / 440 и 544,29 / 432 дают примерно 1,26. Опора сдвинулась, а интервал между нотами остался прежним.',
        },
        {
          en: 'The tuning system is a separate choice. This formula belongs to twelve-tone equal temperament; with the lab’s just and Pythagorean tables the frequency of the same key comes from a fixed ratio to A instead.',
          ru: 'Строй выбирают отдельно. Эта формула относится к двенадцатиступенной равномерной темперации; по таблицам чистого и пифагорова строя в лаборатории частота той же клавиши получается из фиксированного отношения к ля.',
          de: 'Das Stimmungssystem wählst du unabhängig davon. Diese Formel gilt für die zwölfstufige gleichstufige Stimmung; nach den Tabellen für reine und pythagoreische Stimmung im Labor ergibt sich die Frequenz derselben Taste stattdessen aus einem festen Verhältnis zu A.',
          ruMarkup:
            'Строй выбирают отдельно. Эта формула относится к двенадцатиступенной равномерной темперации; по таблицам чистого и пифагорова строя в лаборатории частота той же клавиши получается из фиксированного отношения к [[ля]].',
        },
      ],
      listen: {
        en: 'All three examples sound the same two keys together, A4 with C♯5, and A4 stays at 440 Hz. Only the tuning system changes: equal temperament, just intonation, Pythagorean tuning. Listen to C♯5 against A4 and notice whether the pair sounds exactly the same each time.',
        ru: 'Во всех трёх примерах одновременно берутся одни и те же две клавиши — ля первой и до-диез второй октавы, а частота ля остаётся равной 440 Гц. Меняется только строй: равномерная темперация, чистый строй, пифагоров строй. Вслушайтесь, как до-диез звучит вместе с ля, и заметьте, одинаково ли звучит эта пара каждый раз.',
        de: 'In allen drei Beispielen erklingen dieselben zwei Tasten zusammen, a′ mit cis″, und a′ bleibt bei 440 Hz. Nur das Stimmungssystem wechselt: gleichstufige Stimmung, reine Stimmung, pythagoreische Stimmung. Höre, wie cis″ zu a′ klingt, und achte darauf, ob das Paar jedes Mal genau gleich klingt.',
        ruMarkup:
          'Во всех трёх примерах одновременно берутся одни и те же две клавиши — [[ля]] первой и [[до-диез]] второй октавы, а частота [[ля]] остаётся равной 440 Гц. Меняется только строй: равномерная темперация, чистый строй, пифагоров строй. Вслушайтесь, как [[до-диез]] звучит вместе с [[ля]], и заметьте, одинаково ли звучит эта пара каждый раз.',
      },
      mistake: {
        en: 'It is easy to take A4 = 432 Hz for a different tuning system. It is only a different reference: all frequencies shift by the same factor and the interval relationships stay the same. The tuning system is a separate choice.',
        ru: 'Настройку ля первой октавы на 432 Гц легко принять за другой строй. Но это лишь другая опорная частота: все частоты меняются в одной и той же пропорции, а интервалы между нотами остаются прежними. Музыкальный строй выбирают отдельно.',
        de: 'Es liegt nahe, a′ = 432 Hz für ein anderes Stimmungssystem zu halten. Es ist aber nur ein anderer Bezugston: Alle Frequenzen ändern sich im selben Verhältnis, und die Intervallverhältnisse bleiben erhalten. Welches Stimmungssystem gilt, entscheidest du getrennt davon.',
        ruMarkup:
          'Настройку [[ля]] первой октавы на 432 Гц легко принять за другой строй. Но это лишь другая опорная частота: все частоты меняются в одной и той же пропорции, а интервалы между нотами остаются прежними. Музыкальный строй выбирают отдельно.',
      },
      takeaways: [
        {
          en: 'A reference pitch assigns a frequency to one named note; in this lab that note is A4.',
          ru: 'Опорная частота — это частота, назначенная одной определённой ноте; в этой лаборатории такая нота — ля первой октавы.',
          de: 'Ein Bezugston verbindet einen Tonnamen mit einer Frequenz; in diesem Labor ist es a′.',
          ruMarkup:
            'Опорная частота — это частота, назначенная одной определённой ноте; в этой лаборатории такая нота — [[ля]] первой октавы.',
        },
        {
          en: 'Changing the reference shifts every frequency by the same factor, so the intervals stay the same.',
          ru: 'Если изменить опорную частоту, все частоты изменятся в той же пропорции, а интервалы останутся прежними.',
          de: 'Änderst du den Bezugston, ändern sich alle Frequenzen im selben Verhältnis, und die Intervalle bleiben erhalten.',
        },
        {
          en: 'The tuning system is chosen separately from the reference pitch.',
          ru: 'Музыкальный строй выбирают отдельно от опорной частоты.',
          de: 'Das Stimmungssystem wählst du unabhängig vom Bezugston.',
        },
        {
          en: 'The formula applies to twelve-tone equal temperament; the lab’s just and Pythagorean tables are fixed and based on A.',
          ru: 'Формула относится к двенадцатиступенной равномерной темперации; таблицы чистого и пифагорова строя в лаборатории фиксированы и рассчитаны от ля.',
          de: 'Die Formel gilt für die zwölfstufige gleichstufige Stimmung; die Tabellen für reine und pythagoreische Stimmung im Labor sind fest und auf A bezogen.',
          ruMarkup:
            'Формула относится к двенадцатиступенной равномерной темперации; таблицы чистого и пифагорова строя в лаборатории фиксированы и рассчитаны от [[ля]].',
        },
      ],
    },
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
      version: 2,
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
        en: 'A chosen frequency for one named note, from which the other notes are tuned; in this lab that note is A4.',
        ru: 'Выбранная частота одной определённой ноты, от которой настраивают остальные; в этой лаборатории такая нота — ля первой октавы.',
        de: 'Ein benannter Ton mit festgelegter Frequenz, nach dem die übrigen Töne gestimmt werden; in diesem Labor a′.',
        ruMarkup:
          'Выбранная частота одной определённой ноты, от которой настраивают остальные; в этой лаборатории такая нота — [[ля]] первой октавы.',
      },
      aliases: {
        en: 'concert pitch; tuning reference',
        ru: 'опорный тон; опорная высота',
        de: 'Bezugston; Stimmton',
      },
    },
    {
      id: 'Equal temperament',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'tuning',
      order: 49,
      reference: false,
      title: {
        en: 'Equal temperament',
        ru: 'Равномерная темперация',
        de: 'Gleichstufige Stimmung',
      },
      body: {
        en: 'A system with equal frequency ratios between adjacent steps. Here, twelve steps divide the octave.',
        ru: 'Система с одинаковыми отношениями частот соседних ступеней. Здесь октава делится на 12 шагов.',
        de: 'Ein Stimmungssystem mit gleichen Frequenzverhältnissen zwischen benachbarten Stufen. Hier unterteilen zwölf Stufen die Oktave.',
      },
      aliases: {
        en: '12-TET; twelve-tone equal temperament',
        ru: 'равномерно темперированный строй; равномерный строй',
        de: 'gleichstufig temperierte Stimmung; 12-TET',
      },
    },
    {
      id: 'Just intonation',
      version: 2,
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
        en: 'Tuning in which intervals are set to small whole-number frequency ratios, such as 3:2 for a perfect fifth and 5:4 for a major third. A fixed table of such ratios depends on the note it is calculated from.',
        ru: 'Строй, в котором интервалы настроены по отношениям небольших целых чисел, например 3:2 для чистой квинты и 5:4 для большой терции. Фиксированная таблица таких отношений зависит от ноты, от которой она рассчитана.',
        de: 'Eine Stimmung, in der Intervalle auf Verhältnisse kleiner ganzer Zahlen gestimmt sind, etwa 3:2 für die reine Quinte und 5:4 für die große Terz. Eine feste Tabelle solcher Verhältnisse hängt von dem Ton ab, von dem aus sie berechnet ist.',
      },
    },
  ],
};
export default content;
