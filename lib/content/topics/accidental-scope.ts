import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'accidental-scope',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: ['note-names'],
    locales: ['en', 'ru', 'de'],
    kind: 'sign',
    module: 'F03',
    roadmapIds: ['014'],
    lessonIds: ['accidental-scope'],
    experimentIds: ['accidental-scope'],
    exerciseIds: ['sign-stops-at-the-barline', 'sign-holds-to-the-barline'],
    conceptIds: [
      'Key signature',
      'Bar',
      'Barline',
      'Tie',
      'Courtesy accidental',
      'Staff system',
    ],
  },
  lesson: {
    id: 'accidental-scope',
    version: 2,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'accidental-scope',
    title: {
      en: 'How far a sign reaches',
      ru: 'До каких пор действует знак',
      de: 'Wie weit ein Zeichen gilt',
    },
    category: {
      en: 'Notation',
      ru: 'Нотация',
      de: 'Notenschrift',
    },
    summary: {
      en: 'Know where each accidental starts and where it stops.',
      ru: 'Поймите, где знак начинает и где перестаёт действовать.',
      de: 'Erkennen, wo die Wirkung eines Zeichens beginnt und wo sie endet.',
    },
    formula: {
      en: 'Signature: until a new signature, every octave · Sign in the bar: to the barline, its own octave only',
      ru: 'Ключевые знаки: до смены ключевых знаков, все октавы · Случайные: до тактовой черты, только своя октава',
      de: 'Vorzeichnung: bis zur nächsten Vorzeichnung, alle Oktaven · Versetzungszeichen: bis zum Taktstrich, nur die eigene Oktavlage',
    },
    paragraphs: [
      {
        en: 'A key signature stands at the start of every system, after the clef. Each of its signs applies to its letter for the whole piece and in every octave, until a new signature replaces it. Signs do not add up: a flat in the signature and a flat in the bar are still one flat.',
        ru: 'Ключевые знаки выставляются при ключе в начале каждой нотной строки. Каждый из них действует на свою ступень во всём произведении и во всех октавах, пока его не заменят новые ключевые знаки. Знаки не складываются: бемоль при ключе и бемоль внутри такта дают один бемоль, а не двойное понижение.',
        de: 'Die Vorzeichnung steht am Anfang jeder Notenzeile hinter dem Schlüssel. Jedes ihrer Zeichen gilt für seinen Stammton im ganzen Stück und in allen Oktaven, bis eine neue Vorzeichnung sie ersetzt. Zeichen addieren sich nicht: Ein Be in der Vorzeichnung und ein Be im Takt ergeben zusammen ein Be, keine doppelte Erniedrigung.',
      },
      {
        en: 'In modern standard notation, a sign within a bar applies to that note in that octave — the same line or space — until the barline. If the note is tied across the barline, the tied note keeps the sign. Courtesy signs can clarify the reading; an edition may explicitly declare other conventions.',
        ru: 'В современной нотации случайный знак действует на ту же ноту в той же октаве до тактовой черты. Если нота продлена лигой через тактовую черту, знак сохраняется и для её продолжения. Предупредительные знаки облегчают чтение; издание может прямо оговаривать другие правила.',
        de: 'In heute üblicher Notation gilt ein Versetzungszeichen für denselben Ton in derselben Oktavlage – also auf derselben Linie oder im selben Zwischenraum – bis zum Taktstrich. Wird die Note über den Taktstrich hinweg übergebunden, gilt das Zeichen für die angebundene Note weiter. Erinnerungsvorzeichen (Warnakzidenzien) erleichtern das Lesen; eine Ausgabe kann ausdrücklich andere Regeln festlegen.',
      },
    ],
    guide: {
      question: {
        en: 'If a note has a sign in front of it, which later notes does the sign still change, and where does it stop?',
        ru: 'Если перед нотой стоит знак, на какие следующие ноты он ещё действует и где его действие заканчивается?',
        de: 'Wenn vor einer Note ein Zeichen steht, für welche späteren Noten gilt es dann noch, und wo endet seine Wirkung?',
      },
      example: [
        {
          en: 'The key signature has no sharps or flats. In one bar a flat is written before B4, so that note is B♭4.',
          ru: 'При ключе знаков нет. В одном из тактов перед си первой октавы стоит бемоль, значит, эта нота — си-бемоль.',
          de: 'In der Vorzeichnung stehen keine Zeichen. In einem Takt steht ein Be vor h′, also ist dieser Ton b′.',
          ruMarkup:
            'При ключе знаков нет. В одном из тактов перед [[си]] первой октавы стоит бемоль, значит, эта нота — [[си-бемоль]].',
        },
        {
          en: 'Later in the same bar a note stands at the same place on the staff, this time with no sign of its own. The flat still applies: it is the same note in the same octave, and the barline has not come yet. This note is B♭4 too.',
          ru: 'Дальше в том же такте на том же месте нотоносца снова стоит нота, уже без знака. Бемоль продолжает действовать: это та же нота в той же октаве, а тактовой черты ещё не было. Это тоже си-бемоль.',
          de: 'Später im selben Takt steht an derselben Stelle wieder eine Note, diesmal ohne eigenes Zeichen. Das Be gilt weiter: Es ist derselbe Ton in derselben Oktavlage, und der Taktstrich ist noch nicht erreicht. Auch diese Note ist b′.',
          ruMarkup:
            'Дальше в том же такте на том же месте нотоносца снова стоит нота, уже без знака. Бемоль продолжает действовать: это та же нота в той же октаве, а тактовой черты ещё не было. Это тоже [[си-бемоль]].',
        },
        {
          en: 'A B3 in that bar is in another octave. The flat written before B4 does not reach it, so it stays B3.',
          ru: 'Си малой октавы в том же такте — нота другой октавы. Бемоль, поставленный перед си первой октавы, на неё не действует: она остаётся си.',
          de: 'Ein kleines h im selben Takt liegt in einer anderen Oktavlage. Das Be vor h′ reicht nicht bis dorthin: Der Ton bleibt ein kleines h.',
          ruMarkup:
            '[[Си]] малой октавы в том же такте — нота другой октавы. Бемоль, поставленный перед [[си]] первой октавы, на неё не действует: она остаётся [[си]].',
        },
        {
          en: 'After the barline the flat no longer applies: the next note at that place on the staff is a plain B4 again. Only a B♭4 tied across the barline keeps the sign.',
          ru: 'После тактовой черты бемоль больше не действует: следующая нота на этом месте нотоносца — снова си. Знак сохраняется, только если си-бемоль продлён лигой через тактовую черту.',
          de: 'Nach dem Taktstrich gilt das Be nicht mehr: Die nächste Note an dieser Stelle ist wieder h′. Nur ein b′, das über den Taktstrich hinweg übergebunden ist, behält das Zeichen.',
          ruMarkup:
            'После тактовой черты бемоль больше не действует: следующая нота на этом месте нотоносца — снова [[си]]. Знак сохраняется, только если [[си-бемоль]] продлён лигой через тактовую черту.',
        },
        {
          en: 'Now write the flat for B in the key signature instead. It applies to every B, B4 and B3 alike, in every bar until a new signature replaces it.',
          ru: 'Теперь вместо случайного знака поставьте си-бемоль при ключе. Этот знак действует на каждое си, и в первой, и в малой октаве, в каждом такте, пока его не заменят новые ключевые знаки.',
          de: 'Setze nun stattdessen ein Be für das H in die Vorzeichnung. Es gilt für jedes H, für h′ ebenso wie für das kleine h, in jedem Takt, bis eine neue Vorzeichnung die alte ersetzt.',
          ruMarkup:
            'Теперь вместо случайного знака поставьте [[си-бемоль]] при ключе. Этот знак действует на каждое [[си]], и в первой, и в малой октаве, в каждом такте, пока его не заменят новые ключевые знаки.',
        },
      ],
      listen: {
        en: 'Play “B4, then B♭4” and then “B3, then B♭3”: it is the same step down in two octaves. One flat in the key signature would cover both octaves. A flat written in a bar would lower only the B in its own octave.',
        ru: 'Послушайте «си первой октавы, затем си-бемоль», потом «си малой октавы, затем си-бемоль»: это один и тот же шаг вниз в двух октавах. Один ключевой бемоль действовал бы в обеих октавах. Случайный бемоль в такте понизил бы си только в своей октаве.',
        de: 'Spiele „h′, dann b′“ und danach „kleines h, dann kleines b“: Es ist derselbe Schritt nach unten in zwei Oktaven. Ein einziges Be in der Vorzeichnung würde für beide Oktaven gelten. Ein Be im Takt würde nur das H in seiner eigenen Oktavlage erniedrigen.',
        ruMarkup:
          'Послушайте «[[си]] первой октавы, затем [[си-бемоль]]», потом «[[си]] малой октавы, затем [[си-бемоль]]»: это один и тот же шаг вниз в двух октавах. Один ключевой бемоль действовал бы в обеих октавах. Случайный бемоль в такте понизил бы [[си]] только в своей октаве.',
      },
      mistake: {
        en: 'A sign written in a bar does not carry on after the barline. For a new note in the next bar, read the key signature again unless a new sign is written. A note tied across the barline keeps the earlier pitch, but it does not pass the sign on to the notes after it.',
        ru: 'Случайный знак не действует за тактовой чертой. Для новой ноты в следующем такте снова смотрите на ключевые знаки, если перед ней нет нового случайного знака. Нота, продлённая лигой через тактовую черту, сохраняет прежнюю высоту, но не передаёт знак следующим нотам.',
        de: 'Ein Versetzungszeichen im Takt gilt nicht über den Taktstrich hinaus. Für eine neu angeschlagene Note im nächsten Takt gilt wieder die Vorzeichnung, sofern kein neues Versetzungszeichen davorsteht. Eine übergebundene Note behält die vorherige Tonhöhe, gibt das Zeichen aber nicht an spätere Noten weiter.',
      },
      takeaways: [
        {
          en: 'A sign in the key signature applies to its letter in every octave, until a new signature replaces it.',
          ru: 'Ключевой знак действует на свою ступень во всех октавах, пока его не заменят новые ключевые знаки.',
          de: 'Ein Zeichen der Vorzeichnung gilt für seinen Stammton in allen Oktaven, bis eine neue Vorzeichnung die alte ersetzt.',
        },
        {
          en: 'In modern standard notation, a sign written in a bar applies to that note in that octave only, and only until the barline.',
          ru: 'В современной нотации случайный знак действует только на ту же ноту в той же октаве и только до тактовой черты.',
          de: 'In heute üblicher Notation gilt ein Versetzungszeichen im Takt nur für denselben Ton in derselben Oktavlage und nur bis zum Taktstrich.',
        },
        {
          en: 'A note tied across the barline keeps the sign; the next note struck after it follows the key signature again.',
          ru: 'Нота, продлённая лигой через тактовую черту, сохраняет знак; следующая нота, взятая заново, снова подчиняется ключевым знакам.',
          de: 'Eine über den Taktstrich hinweg übergebundene Note behält das Zeichen; die nächste neu angeschlagene Note folgt wieder der Vorzeichnung.',
        },
        {
          en: 'Signs do not add up: a flat in the signature and a flat in the bar are still one flat.',
          ru: 'Знаки не складываются: бемоль при ключе и бемоль внутри такта дают один бемоль, а не двойное понижение.',
          de: 'Zeichen addieren sich nicht: Ein Be in der Vorzeichnung und ein Be im Takt ergeben zusammen ein Be, keine doppelte Erniedrigung.',
        },
      ],
    },
    sourceId: 'source-048',
    experimentId: 'accidental-scope',
    reading: {
      pages: '6–9',
      sourceId: 'source-002',
      text: {
        en: 'Common-practice signature order is F C G D A E B for sharps and B E A D G C F for flats. Standard signatures use single signs. A local sign replaces the signature for that written pitch within the bar; a tied continuation preserves it across the barline. A later untied note again follows the signature. Editions may print reminders or declare different conventions.',
        ru: 'Обычный порядок ключевых диезов: фа, до, соль, ре, ля, ми, си; бемолей: си, ми, ля, ре, соль, до, фа. Дубль-диезов и дубль-бемолей среди обычных ключевых знаков нет. Случайный знак заменяет ключевой для данной ноты в данной октаве до конца такта; если нота продлена лигой через тактовую черту, знак сохраняется и для её продолжения. Следующая нота, взятая заново, снова подчиняется ключевым знакам. Издания могут ставить предупредительные знаки или оговаривать другие правила.',
        de: 'Übliche Reihenfolge der Kreuze: Fis – Cis – Gis – Dis – Ais – Eis – His; der Be: B – Es – As – Des – Ges – Ces – Fes. Reguläre Vorzeichnungen enthalten keine Doppelzeichen. Ein Versetzungszeichen ersetzt das Vorzeichen für diese Tonhöhe bis zum Taktende; eine übergebundene Fortsetzung behält es über den Taktstrich hinaus. Eine spätere, neu angeschlagene Note folgt wieder der Vorzeichnung. Ausgaben können Erinnerungsvorzeichen setzen oder ausdrücklich andere Regeln festlegen.',
        ruMarkup:
          'Обычный порядок ключевых диезов: [[фа]], [[до]], [[соль]], [[ре]], [[ля]], [[ми]], [[си]]; бемолей: [[си]], [[ми]], [[ля]], [[ре]], [[соль]], [[до]], [[фа]]. Дубль-диезов и дубль-бемолей среди обычных ключевых знаков нет. Случайный знак заменяет ключевой для данной ноты в данной октаве до конца такта; если нота продлена лигой через тактовую черту, знак сохраняется и для её продолжения. Следующая нота, взятая заново, снова подчиняется ключевым знакам. Издания могут ставить предупредительные знаки или оговаривать другие правила.',
      },
      assetIds: [
        'figure-signature-bass',
        'figure-accidental-tie-scope',
        'figure-accidental-octave-scope',
      ],
    },
  },
  experiment: {
    id: 'accidental-scope',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'accidental-scope',
    instructions: {
      en: 'Play B4, then B♭4, then the same pair an octave lower: one signature sign would cover both octaves.',
      ru: 'Сыграйте си первой октавы, затем си-бемоль, потом ту же пару октавой ниже: один ключевой знак действовал бы в обеих октавах.',
      de: 'Spiele h′, dann b′ und danach dasselbe Paar eine Oktave tiefer: Ein einziges Vorzeichen würde für beide Oktaven gelten.',
      ruMarkup:
        'Сыграйте [[си]] первой октавы, затем [[си-бемоль]], потом ту же пару октавой ниже: один ключевой знак действовал бы в обеих октавах.',
    },
    engine: 'sound-lab',
    preset: {
      hz: 493.883301,
      wave: 'sine',
    },
    notation: {
      note: {
        letter: 6,
        accidental: 0,
        octave: 4,
      },
      group: 'pitch',
    },
  },
  exercises: [
    {
      id: 'sign-stops-at-the-barline',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-scope',
      label: {
        en: 'Read an accidental across a barline',
        ru: 'Действие знака за тактовой чертой',
        de: 'Versetzungszeichen über den Taktstrich hinaus lesen',
      },
      generator: 'accidental-scope',
      sourceIds: ['source-002'],
      kind: 'generated',
    },
    {
      id: 'sign-holds-to-the-barline',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-scope',
      label: {
        en: 'Read an accidental within a bar',
        ru: 'Действие знака внутри такта',
        de: 'Versetzungszeichen innerhalb eines Taktes lesen',
      },
      generator: 'accidental-scope',
      sourceIds: ['source-002'],
      kind: 'generated',
    },
  ],
  concepts: [
    {
      id: 'Key signature',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-scope',
      order: 81,
      reference: false,
      title: {
        en: 'Key signature',
        ru: 'Ключевые знаки',
        de: 'Vorzeichnung',
      },
      body: {
        en: 'The group of sharps or flats printed after the clef.',
        ru: 'Группа диезов или бемолей, выставленная при ключе.',
        de: 'Die Gruppe von Kreuzen oder Be-Zeichen hinter dem Schlüssel.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Bar',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-scope',
      order: 82,
      reference: false,
      title: {
        en: 'Bar',
        ru: 'Такт',
        de: 'Takt',
      },
      body: {
        en: 'The span of music between two barlines.',
        ru: 'Отрезок музыки между двумя тактовыми чертами.',
        de: 'Der Abschnitt zwischen zwei Taktstrichen.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Barline',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-scope',
      order: 83,
      reference: false,
      title: {
        en: 'Barline',
        ru: 'Тактовая черта',
        de: 'Taktstrich',
      },
      body: {
        en: 'The vertical line that separates one bar from the next.',
        ru: 'Вертикальная черта, отделяющая один такт от следующего.',
        de: 'Der senkrechte Strich, der einen Takt vom nächsten trennt.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Tie',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-scope',
      order: 84,
      reference: false,
      title: {
        en: 'Tie',
        ru: 'Связующая лига',
        de: 'Haltebogen',
      },
      body: {
        en: 'A curved line joining two note heads of the same pitch into one sound.',
        ru: 'Дуга, соединяющая две ноты одной высоты в один звук.',
        de: 'Ein Bogen, der zwei Notenköpfe derselben Tonhöhe zu einem Klang verbindet.',
      },
      aliases: {
        en: 'tied note; tied notes',
        ru: 'лига продления',
        de: 'Überbindung; übergebunden',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Courtesy accidental',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-scope',
      order: 85,
      reference: false,
      title: {
        en: 'Courtesy accidental',
        ru: 'Предупредительный знак',
        de: 'Erinnerungsvorzeichen',
      },
      body: {
        en: 'A sign printed where the rule does not require it, to remove doubt.',
        ru: 'Знак, выписанный там, где правило его не требует, чтобы снять сомнение.',
        de: 'Ein Zeichen, das über die Regel hinaus gesetzt wird, um Zweifel auszuschließen.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Staff system',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'accidental-scope',
      order: 86,
      reference: false,
      title: {
        en: 'Staff system',
        ru: 'Нотная строка',
        de: 'Notenzeile',
      },
      body: {
        en: 'One line of music running across the page.',
        ru: 'Одна строка нотной записи, идущая через страницу.',
        de: 'Eine Zeile der Notenschrift, die über die Seite läuft.',
      },
      sourceId: 'source-023',
    },
  ],
};
export default content;
