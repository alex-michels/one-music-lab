import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'clefs',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: ['note-names'],
    locales: ['en', 'ru', 'de'],
    kind: 'sign',
    module: 'F03',
    roadmapIds: ['013'],
    lessonIds: ['clefs'],
    experimentIds: ['clefs'],
    exerciseIds: ['same-place-other-clef', 'entry-clefs'],
    conceptIds: [
      'Ottava',
      'Instruments and clefs',
      'Keyboard and organ staves',
      'Clef',
      'Treble clef',
      'Bass clef',
      'C clef',
      'System',
      'Brace',
    ],
  },
  lesson: {
    id: 'clefs',
    version: 2,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'clefs',
    title: {
      en: 'One clef, one fixed pitch',
      ru: 'Ключ задаёт одну высоту',
      de: 'Ein Schlüssel, ein fester Ton',
    },
    category: {
      en: 'Notation',
      ru: 'Нотация',
      de: 'Notenschrift',
    },
    summary: {
      en: 'Read the reference notes of treble, bass, alto and tenor clefs.',
      ru: 'Определяйте опорные ноты скрипичного, басового, альтового и тенорового ключей.',
      de: 'Lies die Bezugstöne von Violin-, Bass-, Alt- und Tenorschlüssel.',
    },
    formula: {
      en: 'G clef, line 2 = G4 · F clef, line 4 = F3 · C clef = C4',
      ru: 'Ключ соль, 2-я линейка = соль первой октавы · Ключ фа, 4-я линейка = фа малой октавы · Ключ до = до первой октавы',
      de: 'G-Schlüssel 2. Linie = g′ · F-Schlüssel 4. Linie = f · C-Schlüssel = c′',
      ruMarkup:
        'Ключ [[соль]], 2-я линейка = [[соль]] первой октавы · Ключ [[фа]], 4-я линейка = [[фа]] малой октавы · Ключ [[до]] = [[до]] первой октавы',
    },
    paragraphs: [
      {
        en: 'A note’s position needs a clef to tell us its pitch. The treble clef is a G clef that places G4 on the second line; the bass clef is an F clef that places F3 on the fourth. Count neighbouring note names up or down from that reference. Different clefs place different registers conveniently on the same five lines and reduce the need for ledger lines.',
        ru: 'Чтобы определить высоту по положению ноты, нужен ключ. Скрипичный ключ — ключ соль: он указывает соль первой октавы на второй линейке. Басовый — ключ фа: он указывает фа малой октавы на четвёртой. От этой опорной ноты отсчитывают соседние ступени вверх или вниз. Разные ключи позволяют удобно записывать разные регистры на тех же пяти линейках и реже использовать добавочные.',
        de: 'Erst der Schlüssel ordnet einer Notenposition eine Tonhöhe zu. Der Violinschlüssel ist ein G-Schlüssel mit g′ auf der zweiten Linie; der Bassschlüssel ein F-Schlüssel mit f auf der vierten. Zähle von diesem Bezugston aus die benachbarten Stammtöne aufwärts oder abwärts. Verschiedene Schlüssel bringen unterschiedliche Tonlagen günstig auf denselben fünf Linien unter und sparen Hilfslinien.',
        ruMarkup:
          'Чтобы определить высоту по положению ноты, нужен ключ. Скрипичный ключ — ключ [[соль]]: он указывает [[соль]] первой октавы на второй линейке. Басовый — ключ [[фа]]: он указывает [[фа]] малой октавы на четвёртой. От этой опорной ноты отсчитывают соседние ступени вверх или вниз. Разные ключи позволяют удобно записывать разные регистры на тех же пяти линейках и реже использовать добавочные.',
      },
      {
        en: 'Middle C (C4) sits on the first ledger line below a treble staff or above a bass staff. C clefs mark C4 with their centre: the alto clef on the third line, the tenor clef on the fourth. Piano music usually joins two staves with a brace; read the clef printed on each staff.',
        ru: 'До первой октавы находится на первой добавочной линейке под скрипичным станом или над басовым. Ключи до указывают эту ноту своей серединой: альтовый — на третьей линейке, теноровый — на четвёртой. В фортепианной записи два стана обычно соединены акколадой; на каждом читайте его собственный ключ.',
        de: 'Das eingestrichene c (c′) steht auf der ersten Hilfslinie unter dem Violinsystem oder über dem Basssystem. C-Schlüssel markieren c′ mit ihrer Mitte: der Altschlüssel auf der dritten, der Tenorschlüssel auf der vierten Linie. Klaviermusik verbindet gewöhnlich zwei Notensysteme mit einer geschweiften Klammer; lies den Schlüssel jedes Systems.',
        ruMarkup:
          '[[До]] первой октавы находится на первой добавочной линейке под скрипичным станом или над басовым. Ключи [[до]] указывают эту ноту своей серединой: альтовый — на третьей линейке, теноровый — на четвёртой. В фортепианной записи два стана обычно соединены акколадой; на каждом читайте его собственный ключ.',
      },
    ],
    guide: {
      question: {
        en: 'How do you know which note a line or space on the staff stands for?',
        ru: 'Как узнать, какую ноту обозначает линейка или промежуток на стане?',
        de: 'Woher weißt du, für welchen Ton eine Linie oder ein Zwischenraum im Notensystem steht?',
      },
      example: [
        {
          en: 'Start with the treble clef. It places G4 on the second line, and that note is your reference.',
          ru: 'Начните со скрипичного ключа. Он указывает соль первой октавы на второй линейке — это ваша опорная нота.',
          de: 'Beginne mit dem Violinschlüssel. Er legt g′ auf die zweite Linie; dieser Ton ist dein Bezugston.',
          ruMarkup:
            'Начните со скрипичного ключа. Он указывает [[соль]] первой октавы на второй линейке — это ваша опорная нота.',
        },
        {
          en: 'Count down one place at a time, one note name per place: F4 in the space below, E4 on the first line, D4 just below the staff.',
          ru: 'Отсчитывайте вниз шаг за шагом, каждый раз называя соседнюю ноту: фа первой октавы — в промежутке ниже, ми — на первой линейке, ре — сразу под станом.',
          de: 'Zähle abwärts, Platz für Platz und Stammton für Stammton: f′ im Zwischenraum darunter, e′ auf der ersten Linie, d′ direkt unter dem System.',
          ruMarkup:
            'Отсчитывайте вниз шаг за шагом, каждый раз называя соседнюю ноту: [[фа]] первой октавы — в промежутке ниже, [[ми]] — на первой линейке, [[ре]] — сразу под станом.',
        },
        {
          en: 'One more step down is middle C (C4), on the first ledger line below the staff.',
          ru: 'Ещё один шаг вниз — нота до первой октавы: она стоит на первой добавочной линейке под станом.',
          de: 'Noch einen Schritt tiefer steht das eingestrichene c (c′) auf der ersten Hilfslinie unter dem System.',
          ruMarkup:
            'Ещё один шаг вниз — нота [[до]] первой октавы: она стоит на первой добавочной линейке под станом.',
        },
        {
          en: 'Now take the bass clef. It places F3 on the fourth line. Count up: G3 in the space above, A3 on the fifth line, B3 just above the staff.',
          ru: 'Теперь басовый ключ. Он указывает фа малой октавы на четвёртой линейке. Отсчитывайте вверх: соль малой октавы — в промежутке выше, ля — на пятой линейке, си — сразу над станом.',
          de: 'Nun der Bassschlüssel. Er legt das kleine f auf die vierte Linie. Zähle aufwärts in der kleinen Oktave: g im Zwischenraum darüber, a auf der fünften Linie, h direkt über dem System.',
          ruMarkup:
            'Теперь басовый ключ. Он указывает [[фа]] малой октавы на четвёртой линейке. Отсчитывайте вверх: [[соль]] малой октавы — в промежутке выше, [[ля]] — на пятой линейке, [[си]] — сразу над станом.',
        },
        {
          en: 'One more step up is C4 again, on the first ledger line above the staff. The same note is written in two different places because the clef is different.',
          ru: 'Ещё один шаг вверх — снова нота до первой октавы, теперь на первой добавочной линейке над станом. Одна и та же нота записана в двух разных местах, потому что ключи разные.',
          de: 'Noch einen Schritt höher steht wieder c′, diesmal auf der ersten Hilfslinie über dem System. Derselbe Ton steht an zwei verschiedenen Stellen, weil der Schlüssel ein anderer ist.',
          ruMarkup:
            'Ещё один шаг вверх — снова нота [[до]] первой октавы, теперь на первой добавочной линейке над станом. Одна и та же нота записана в двух разных местах, потому что ключи разные.',
        },
      ],
      listen: {
        en: 'The “G4” button plays the note the treble clef fixes, “F3” the note the bass clef fixes. Play “G4, then F3” and notice how far the second tone drops below the first: the reference notes of the two clefs lie in different registers.',
        ru: 'Кнопка «соль первой октавы» играет ноту, которую закрепляет скрипичный ключ, «фа малой октавы» — ноту басового ключа. Нажмите «соль первой октавы, затем фа малой» и услышьте, как далеко вниз уходит второй звук: опорные ноты двух ключей лежат в разных регистрах.',
        de: 'Die Schaltfläche „g′“ spielt den Ton, den der Violinschlüssel festlegt, „kleines f“ den Ton des Bassschlüssels. Spiele „g′, dann kleines f“ und achte darauf, wie weit der zweite Ton unter dem ersten liegt: Die Bezugstöne der beiden Schlüssel liegen in verschiedenen Tonlagen.',
        ruMarkup:
          'Кнопка «[[соль]] первой октавы» играет ноту, которую закрепляет скрипичный ключ, «[[фа]] малой октавы» — ноту басового ключа. Нажмите «[[соль]] первой октавы, затем [[фа]] малой» и услышьте, как далеко вниз уходит второй звук: опорные ноты двух ключей лежат в разных регистрах.',
      },
      mistake: {
        en: 'On its own, a line does not tell you the note. The fourth line is F3 in the bass clef but C4 in the tenor clef, so reading a place as you would in another clef gives the wrong note. First look at the clef at the start of the staff, then count from its reference note.',
        ru: 'Сама по себе линейка ещё не называет ноту. На четвёртой линейке в басовом ключе стоит фа малой октавы, а в теноровом — до первой, поэтому, прочитав место как в другом ключе, вы получите неверную ноту. Сначала посмотрите на ключ в начале стана, затем отсчитывайте от его опорной ноты.',
        de: 'Eine Linie allein verrät den Ton noch nicht. Auf der vierten Linie steht im Bassschlüssel das kleine f, im Tenorschlüssel aber c′; liest du eine Stelle wie in einem anderen Schlüssel, erhältst du deshalb den falschen Ton. Sieh zuerst auf den Schlüssel am Anfang des Systems und zähle dann von seinem Bezugston aus.',
        ruMarkup:
          'Сама по себе линейка ещё не называет ноту. На четвёртой линейке в басовом ключе стоит [[фа]] малой октавы, а в теноровом — [[до]] первой, поэтому, прочитав место как в другом ключе, вы получите неверную ноту. Сначала посмотрите на ключ в начале стана, затем отсчитывайте от его опорной ноты.',
      },
      takeaways: [
        {
          en: 'A clef fixes one note on one line, and every other note is counted from it.',
          ru: 'Ключ закрепляет за одной линейкой определённую ноту, и от неё отсчитывают все остальные.',
          de: 'Ein Schlüssel legt einen Ton auf einer Linie fest; alle anderen zählst du von ihm aus.',
        },
        {
          en: 'The treble clef places G4 on the second line, the bass clef F3 on the fourth.',
          ru: 'Скрипичный ключ указывает соль первой октавы на второй линейке, басовый — фа малой октавы на четвёртой.',
          de: 'Der Violinschlüssel legt g′ auf die zweite Linie, der Bassschlüssel das kleine f auf die vierte.',
          ruMarkup:
            'Скрипичный ключ указывает [[соль]] первой октавы на второй линейке, басовый — [[фа]] малой октавы на четвёртой.',
        },
        {
          en: 'C clefs mark C4 with their centre: the alto clef on the third line, the tenor clef on the fourth.',
          ru: 'Ключи до своей серединой указывают ноту до первой октавы: альтовый — на третьей линейке, теноровый — на четвёртой.',
          de: 'C-Schlüssel markieren c′ mit ihrer Mitte: der Altschlüssel auf der dritten Linie, der Tenorschlüssel auf der vierten.',
          ruMarkup:
            'Ключи [[до]] своей серединой указывают ноту [[до]] первой октавы: альтовый — на третьей линейке, теноровый — на четвёртой.',
        },
        {
          en: 'Middle C (C4) sits on the first ledger line below a treble staff or above a bass staff.',
          ru: 'Нота до первой октавы стоит на первой добавочной линейке под скрипичным станом или над басовым.',
          de: 'Das eingestrichene c (c′) steht auf der ersten Hilfslinie unter dem Violinsystem oder über dem Basssystem.',
          ruMarkup:
            'Нота [[до]] первой октавы стоит на первой добавочной линейке под скрипичным станом или над басовым.',
        },
      ],
    },
    sourceId: 'source-029',
    experimentId: 'clefs',
    reading: {
      pages: '3–6',
      sourceId: 'source-002',
      text: {
        en: 'Treble: G4 on line 2; bass: F3 on line 4; alto: C4 on line 3; tenor: C4 on line 4. Viola commonly uses alto clef; cello, bassoon and trombone can use tenor clef for higher passages. A small 8 below a clef means everything on that staff sounds an octave lower than the plain clef would show. An 8va line moves the notes within its span by one octave, a 15ma line by two: upwards when it stands above the staff, downwards when it stands below. The shift ends where the line ends.',
        ru: 'Скрипичный ключ указывает соль первой октавы на второй линейке; басовый — фа малой на четвёртой; альтовый — до первой на третьей; теноровый — до первой на четвёртой. Партию альта обычно пишут в альтовом ключе; в партиях виолончели, фагота и тромбона высокие места записывают также в теноровом. Маленькая восьмёрка под ключом означает, что всё на этом стане звучит октавой ниже, чем в обычном ключе. Пунктир 8va переносит охваченные им ноты на октаву, 15ma — на две: вверх, если он стоит над станом, вниз — если под станом. Перенос действует только до конца пунктира.',
        de: 'Violinschlüssel: g′ auf Linie 2; Bassschlüssel: f auf Linie 4; Altschlüssel: c′ auf Linie 3; Tenorschlüssel: c′ auf Linie 4. Die Bratsche verwendet meist den Altschlüssel; Violoncello, Fagott und Posaune verwenden in höherer Lage auch den Tenorschlüssel. Eine kleine 8 unter dem Schlüssel bedeutet: Alles in diesem System klingt eine Oktave tiefer als mit dem gewöhnlichen Schlüssel. Eine 8va-Linie versetzt die Noten in ihrem Bereich um eine Oktave, 15ma um zwei – nach oben, wenn sie über dem System steht, nach unten, wenn sie darunter steht. Die Versetzung endet mit der Linie.',
        ruMarkup:
          'Скрипичный ключ указывает [[соль]] первой октавы на второй линейке; басовый — [[фа]] малой на четвёртой; альтовый — [[до]] первой на третьей; теноровый — [[до]] первой на четвёртой. Партию альта обычно пишут в альтовом ключе; в партиях виолончели, фагота и тромбона высокие места записывают также в теноровом. Маленькая восьмёрка под ключом означает, что всё на этом стане звучит октавой ниже, чем в обычном ключе. Пунктир 8va переносит охваченные им ноты на октаву, 15ma — на две: вверх, если он стоит над станом, вниз — если под станом. Перенос действует только до конца пунктира.',
      },
      assetIds: ['figure-grand-staff', 'figure-organ-staves'],
    },
  },
  experiment: {
    id: 'clefs',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'clefs',
    instructions: {
      en: 'Play G4, then F3, and hear how far apart the reference pitches of these two clefs actually sound.',
      ru: 'Сыграйте соль первой октавы, затем фа малой октавы и услышьте, как далеко расходятся опорные ноты двух ключей.',
      de: 'Spiele g′ und danach das kleine f und höre, wie weit die Bezugstöne dieser beiden Schlüssel auseinanderliegen.',
      ruMarkup:
        'Сыграйте [[соль]] первой октавы, затем [[фа]] малой октавы и услышьте, как далеко расходятся опорные ноты двух ключей.',
    },
    engine: 'sound-lab',
    preset: {
      hz: 391.995436,
      wave: 'triangle',
    },
    notation: {
      note: {
        letter: 0,
        accidental: 0,
        octave: 4,
      },
      group: 'pitch',
    },
  },
  exercises: [
    {
      id: 'same-place-other-clef',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      label: {
        en: 'Read the same position in another clef',
        ru: 'Та же позиция в другом ключе',
        de: 'Dieselbe Position in einem anderen Schlüssel lesen',
      },
      generator: 'clef-transform',
      sourceIds: ['source-002'],
      kind: 'generated',
    },
    {
      id: 'entry-clefs',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      kind: 'diagnostic',
      order: 1,
      label: {
        en: 'What does a clef establish on a staff?',
        ru: 'Что определяет ключ на нотном стане?',
        de: 'Was legt ein Schlüssel im Notensystem fest?',
      },
      answer: 'pitch',
      options: [
        {
          id: 'pitch',
          label: {
            en: 'A reference for reading pitch positions',
            ru: 'Опору для чтения высоты нот',
            de: 'Einen Bezugspunkt zum Lesen der Tonhöhen',
          },
          feedback: {
            en: 'The clef anchors a pitch to a staff position, allowing the other positions to be read.',
            ru: 'Ключ закрепляет высоту за позицией на стане, позволяя читать остальные позиции.',
            de: 'Der Schlüssel ordnet einer Position eine Tonhöhe zu. Damit lassen sich die übrigen Positionen lesen.',
          },
        },
        {
          id: 'duration',
          label: {
            en: 'The duration of each note',
            ru: 'Длительность каждой ноты',
            de: 'Die Dauer jeder Note',
          },
          feedback: {
            en: 'Note values show duration. The clef instead supplies a reference for pitch positions.',
            ru: 'Длительность обозначается видом самой ноты, а не ключом. Ключ задаёт опору для чтения высоты.',
            de: 'Notenwerte zeigen die Dauer. Der Schlüssel liefert dagegen einen Bezugspunkt für die Tonhöhen.',
          },
        },
        {
          id: 'loudness',
          label: {
            en: 'The loudness of each note',
            ru: 'Громкость каждой ноты',
            de: 'Die Lautstärke jeder Note',
          },
          feedback: {
            en: 'Dynamics concern loudness. A clef anchors pitch positions, not loudness.',
            ru: 'К громкости относятся динамические обозначения. Ключ задаёт высоту позиций, а не громкость.',
            de: 'Dynamische Angaben betreffen die Lautstärke. Ein Schlüssel legt Tonhöhenbezüge fest, keine Lautstärke.',
          },
        },
      ],
      sourceIds: ['source-059'],
    },
  ],
  concepts: [
    {
      id: 'Ottava',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      order: 4,
      reference: true,
      title: {
        en: 'Ottava',
        ru: 'Октавный перенос',
        de: 'Oktavierung',
      },
      body: {
        en: '8 shifts one octave; 15 shifts two. Placement above or below indicates direction, and the line gives the scope.',
        ru: '8 переносит на октаву, 15 — на две. Положение сверху или снизу задаёт направление, пунктир — область действия.',
        de: '8 versetzt um eine Oktave, 15 um zwei. Die Stellung oben oder unten gibt die Richtung an, die Linie den Geltungsbereich.',
      },
      sourceId: 'source-002',
    },
    {
      id: 'Instruments and clefs',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      order: 23,
      reference: true,
      title: {
        en: 'Instruments and clefs',
        ru: 'Инструменты и ключи',
        de: 'Instrumente und Schlüssel',
      },
      aliases: {
        en: 'viola; cello; bassoon; trombone; flute',
        ru: 'альт; виолончель; фагот; тромбон; флейта',
        de: 'Bratsche; Violoncello; Fagott; Posaune; Flöte',
      },
      body: {
        en: 'Read the printed clef, not an assumed instrument rule. Flute parts commonly use treble; viola parts alto and sometimes treble; cello parts bass, tenor or treble according to register. Tenor clef also occurs in bassoon and trombone parts. A clef change changes the pitch anchor, not the instrument.',
        ru: 'Читайте выставленный ключ, не подменяя его правилом об инструменте. Флейта обычно использует скрипичный; альт — альтовый, иногда скрипичный; виолончель — басовый, теноровый или скрипичный в зависимости от регистра. Теноровый встречается также у фагота и тромбона. Смена ключа меняет высотный ориентир, а не инструмент.',
        de: 'Lies den gedruckten Schlüssel statt einer vermeintlichen Instrumentenregel. Die Flöte verwendet meist den Violin-, die Bratsche den Alt- und gelegentlich den Violinschlüssel; das Violoncello je nach Lage Bass-, Tenor- oder Violinschlüssel. Der Tenorschlüssel kommt auch bei Fagott und Posaune vor. Ein Schlüsselwechsel ändert den Tonhöhenbezug, nicht das Instrument.',
      },
      forwardModules: ['N03'],
      sourceId: 'source-029',
      furtherSourceIds: ['source-030', 'source-031'],
    },
    {
      id: 'Keyboard and organ staves',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      order: 24,
      reference: true,
      title: {
        en: 'Keyboard and organ staves',
        ru: 'Станы фортепиано и органа',
        de: 'Klavier- und Orgelsysteme',
      },
      aliases: {
        en: 'grand staff; organ pedals; brace',
        ru: 'фортепианная система; педаль органа; скобка',
        de: 'Klavierakkolade; Orgelpedal; Klammer',
      },
      body: {
        en: 'A piano part commonly combines two staves with a brace. Organ notation commonly adds a third staff for the pedals below the two manual staves. This is a layout convention: a hand or voice can cross between staves, and no staff is permanently restricted to one clef.',
        ru: 'Фортепианная партия обычно объединяет два стана акколадой. В органной записи ниже двух мануальных станов часто расположен третий — для педали. Это способ размещения записи: рука или голос могут переходить между станами, и за станом не закреплён навсегда один ключ.',
        de: 'Eine Klavierstimme verbindet meist zwei Notensysteme mit einer geschweiften Klammer. Bei der Orgel steht unter den beiden Manualsystemen häufig ein drittes System für das Pedal. Das ist eine Anordnungskonvention: Hand oder Stimme können das System wechseln; kein System ist auf einen einzigen Schlüssel festgelegt.',
      },
      forwardModules: ['N03'],
      sourceId: 'source-022',
    },
    {
      id: 'Clef',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      order: 67,
      reference: false,
      title: {
        en: 'Clef',
        ru: 'Ключ',
        de: 'Notenschlüssel',
      },
      body: {
        en: 'A clef fixes one named pitch on one staff line, and every other pitch is counted from it.',
        ru: 'Ключ закрепляет за одной линейкой определённую ноту, и от неё отсчитывают все остальные.',
        de: 'Ein Notenschlüssel legt einen benannten Ton auf einer Linie fest, von dem aus alle anderen gezählt werden.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Treble clef',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      order: 68,
      reference: false,
      title: {
        en: 'Treble clef',
        ru: 'Скрипичный ключ',
        de: 'Violinschlüssel',
      },
      body: {
        en: 'The treble clef is the G clef whose curl encircles the second line and fixes G4 there.',
        ru: 'Скрипичный ключ — ключ соль: его завиток охватывает вторую линейку и закрепляет на ней соль первой октавы.',
        de: 'Der Violinschlüssel ist der G-Schlüssel, dessen Schleife die zweite Linie umschließt und dort g′ festlegt.',
        ruMarkup:
          'Скрипичный ключ — ключ [[соль]]: его завиток охватывает вторую линейку и закрепляет на ней [[соль]] первой октавы.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'Bass clef',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      order: 69,
      reference: false,
      title: {
        en: 'Bass clef',
        ru: 'Басовый ключ',
        de: 'Bassschlüssel',
      },
      body: {
        en: 'The bass clef is the F clef whose two dots surround the fourth line and fix F3 there.',
        ru: 'Басовый ключ — ключ фа: две его точки стоят по сторонам четвёртой линейки и закрепляют на ней фа малой октавы.',
        de: 'Der Bassschlüssel ist der F-Schlüssel, dessen zwei Punkte die vierte Linie einschließen und dort das kleine f festlegen.',
        ruMarkup:
          'Басовый ключ — ключ [[фа]]: две его точки стоят по сторонам четвёртой линейки и закрепляют на ней [[фа]] малой октавы.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'C clef',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      order: 70,
      reference: false,
      title: {
        en: 'C clef',
        ru: 'Ключ до',
        de: 'C-Schlüssel',
        ruMarkup: 'Ключ [[до]]',
      },
      body: {
        en: 'A C clef names C4 on the line its centre marks: the third line for the alto clef, the fourth for the tenor clef.',
        ru: 'Ключ до указывает до первой октавы на той линейке, где сходятся его половины: третья — альтовый ключ, четвёртая — теноровый.',
        de: 'Ein C-Schlüssel benennt c′ auf der Linie, die seine Mitte bezeichnet: die dritte beim Altschlüssel, die vierte beim Tenorschlüssel.',
        ruMarkup:
          'Ключ [[до]] указывает [[до]] первой октавы на той линейке, где сходятся его половины: третья — альтовый ключ, четвёртая — теноровый.',
      },
      sourceId: 'source-023',
    },
    {
      id: 'System',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      order: 71,
      reference: false,
      title: {
        en: 'System',
        ru: 'Система',
        de: 'Akkolade',
      },
      body: {
        en: 'A system is the set of staves that are read together because they sound at the same time.',
        ru: 'Система — группа нотных станов, которые читают вместе, потому что они звучат одновременно.',
        de: 'Eine Akkolade ist die Gruppe von Notensystemen, die zusammen gelesen werden, weil sie gleichzeitig erklingen.',
      },
      sourceId: 'source-022',
    },
    {
      id: 'Brace',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'clefs',
      order: 72,
      reference: false,
      title: {
        en: 'Brace',
        ru: 'Фигурная акколада',
        de: 'Geschweifte Klammer',
      },
      body: {
        en: 'A brace is the curved sign that joins two staves into a single keyboard system.',
        ru: 'Фигурная акколада — фигурная скобка слева, которая соединяет два нотных стана в одну систему, как в фортепианных нотах.',
        de: 'Die geschweifte Klammer ist das Zeichen, das zwei Notensysteme – etwa die beiden Systeme einer Klavierstimme – zu einer Akkolade verbindet.',
      },
      sourceId: 'source-022',
    },
  ],
};
export default content;
