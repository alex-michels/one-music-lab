import type { TopicBundle } from '../schema';

const content: TopicBundle = {
  topic: {
    id: 'note-names',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    kind: 'sign',
    module: 'F01',
    roadmapIds: ['003'],
    lessonIds: ['note-names'],
    experimentIds: ['note-names'],
    exerciseIds: ['register-1', 'register-2', 'register-3', 'natural-name'],
    conceptIds: [
      'Pitch-name systems',
      'Natural note',
      'Note name',
      'Octave register',
      'Octave notation',
      'Middle C',
    ],
  },
  lesson: {
    id: 'note-names',
    version: 2,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'note-names',
    title: {
      en: 'Note names and octaves',
      ru: 'Названия нот и октавы',
      de: 'Tonnamen und Oktavlagen',
    },
    category: {
      en: 'Notation',
      ru: 'Нотация',
      de: 'Notenschrift',
    },
    summary: {
      en: 'Name any natural note and say which octave it sits in.',
      ru: 'Называйте любую основную ступень и определяйте её октаву.',
      de: 'Benenne jeden Stammton und bestimme seine Oktavlage.',
    },
    formula: {
      en: 'C D E F G A B · C4 … B4 · C5',
      ru: 'до ре ми фа соль ля си · первая октава: до … си · далее вторая',
      de: 'C D E F G A H · c′ … h′ · c″',
      ruMarkup:
        '[[до]] [[ре]] [[ми]] [[фа]] [[соль]] [[ля]] [[си]] · первая октава: [[до]] … [[си]] · далее вторая',
    },
    paragraphs: [
      {
        en: 'The natural notes have seven letter names: C, D, E, F, G, A and B. After B the series starts again at C, and the frequency of that C is twice the frequency of the C below it. That repeating distance is the octave.',
        ru: 'Основных ступеней семь: до, ре, ми, фа, соль, ля, си. После си ряд начинается заново с до, и частота этого до вдвое больше, чем у предыдущего. Расстояние между двумя ближайшими одноимёнными звуками называется октавой.',
        de: 'Sieben Namen tragen die Stammtöne: C, D, E, F, G, A und H. Nach dem H beginnt die Reihe wieder bei C, und dieses C schwingt doppelt so schnell wie das C darunter. Dieser wiederkehrende Abstand heißt Oktave.',
        ruMarkup:
          'Основных ступеней семь: [[до]], [[ре]], [[ми]], [[фа]], [[соль]], [[ля]], [[си]]. После [[си]] ряд начинается заново с [[до]], и частота этого [[до]] вдвое больше, чем у предыдущего. Расстояние между двумя ближайшими одноимёнными звуками называется октавой.',
      },
      {
        en: 'A name alone does not fix a pitch, because every octave repeats it. Scientific pitch notation adds a number: middle C is C4, and the number rises at each C, so B4 lies just below C5. By default, this lab tunes A4 to 440 Hz.',
        ru: 'Одно название не задаёт высоту: оно повторяется в каждой октаве, поэтому называют и октаву. Русские названия идут снизу вверх: субконтроктава, контроктава, большая, малая, первая, вторая, третья, четвёртая, пятая. Каждая октава начинается с до, и си первой октавы лежит непосредственно под до второй. По умолчанию опорный тон лаборатории — ля первой октавы, 440 Гц.',
        de: 'Ein Name allein legt noch keine Tonhöhe fest, denn jede Oktave wiederholt ihn. Die Helmholtz-Bezeichnung ergänzt deshalb die Lage, von unten nach oben: Subkontraoktave (C₂ bis H₂), Kontraoktave (C₁ bis H₁), große Oktave (C bis H), kleine Oktave (c bis h), eingestrichene Oktave (c′ bis h′), zweigestrichene Oktave (c″ bis h″), danach die drei-, vier- und fünfgestrichene Oktave. Jede Oktave beginnt bei ihrem C, das h′ liegt also unmittelbar unter dem c″. In der Grundeinstellung ist der Kammerton dieses Labors a′ = 440 Hz.',
        ruMarkup:
          'Одно название не задаёт высоту: оно повторяется в каждой октаве, поэтому называют и октаву. Русские названия идут снизу вверх: субконтроктава, контроктава, большая, малая, первая, вторая, третья, четвёртая, пятая. Каждая октава начинается с [[до]], и [[си]] первой октавы лежит непосредственно под [[до]] второй. По умолчанию опорный тон лаборатории — [[ля]] первой октавы, 440 Гц.',
      },
    ],
    guide: {
      question: {
        en: 'How can just seven names cover the natural notes of every octave, and how do you say exactly which C you mean?',
        ru: 'Как семи названий хватает на основные ступени всех октав и как сказать, какое именно до вы имеете в виду?',
        de: 'Wie können sieben Namen für die Stammtöne aller Oktaven reichen, und wie sagst du genau, welches C du meinst?',
        ruMarkup:
          'Как семи названий хватает на основные ступени всех октав и как сказать, какое именно [[до]] вы имеете в виду?',
      },
      example: [
        {
          en: 'Start on middle C, written C4. Say the natural notes upward in order: C4, D4, E4, F4, G4, A4, B4.',
          ru: 'Начните с до первой октавы. Назовите основные ступени вверх по порядку: до, ре, ми, фа, соль, ля, си — все в первой октаве.',
          de: 'Beginne beim c′, dem eingestrichenen c. Nenne die Stammtöne der Reihe nach aufwärts: c′, d′, e′, f′, g′, a′, h′.',
          ruMarkup:
            'Начните с [[до]] первой октавы. Назовите основные ступени вверх по порядку: [[до]], [[ре]], [[ми]], [[фа]], [[соль]], [[ля]], [[си]] — все в первой октаве.',
        },
        {
          en: 'After B4 the seven names are used up, so the series starts again: the next note is called C once more.',
          ru: 'После си семь названий закончились, и ряд начинается заново: следующая нота снова называется до.',
          de: 'Nach dem h′ sind die sieben Namen aufgebraucht, also beginnt die Reihe von vorn: Der nächste Ton heißt wieder C.',
          ruMarkup:
            'После [[си]] семь названий закончились, и ряд начинается заново: следующая нота снова называется [[до]].',
        },
        {
          en: 'But this is not the C you started on. Its frequency is twice as high, and the distance between the two Cs is one octave.',
          ru: 'Но это не то до, с которого вы начали. Его частота вдвое больше, а расстояние между этими двумя до — октава.',
          de: 'Es ist aber nicht das C vom Anfang. Dieses C schwingt doppelt so schnell, und der Abstand zwischen den beiden C ist eine Oktave.',
          ruMarkup:
            'Но это не то [[до]], с которого вы начали. Его частота вдвое больше, а расстояние между этими двумя [[до]] — октава.',
        },
        {
          en: 'To tell the two apart, add the octave number to the name. Here “octave” means the stretch from one C up to the B above it, such as C4 to B4.',
          ru: 'Чтобы их различать, называют и октаву. Здесь «октава» — это часть звукоряда от до до ближайшего си над ним, например первая октава.',
          de: 'Um die beiden zu unterscheiden, nennst du auch die Oktave. Hier meint „Oktave“ den Abschnitt von einem C bis zum nächsten H darüber, etwa c′ bis h′, die eingestrichene Oktave.',
          ruMarkup:
            'Чтобы их различать, называют и октаву. Здесь «октава» — это часть звукоряда от [[до]] до ближайшего [[си]] над ним, например первая октава.',
        },
        {
          en: 'The number rises at each C, so the new note is C5, and B4 lies just below it.',
          ru: 'Каждая октава начинается с до, поэтому новая нота — до второй октавы, а си первой октавы лежит непосредственно под ней.',
          de: 'Jede Oktave beginnt bei ihrem C, also ist der neue Ton das c″, und das h′ liegt unmittelbar darunter.',
          ruMarkup:
            'Каждая октава начинается с [[до]], поэтому новая нота — [[до]] второй октавы, а [[си]] первой октавы лежит непосредственно под ней.',
        },
      ],
      listen: {
        en: 'Play C4 up to C5, note by note, and name each note as it sounds. Notice the last one: it has the same name as the first, C, but it lies one octave higher.',
        ru: 'Послушайте ноты от до первой октавы до до второй, по одной ноте, и называйте каждую. Обратите внимание на последнюю: она называется так же, как первая, — до, но звучит на октаву выше.',
        de: 'Höre dir die Töne von c′ bis c″ an, Ton für Ton, und benenne jeden. Achte auf den letzten: Er heißt wie der erste, C, liegt aber eine Oktave höher.',
        ruMarkup:
          'Послушайте ноты от [[до]] первой октавы до [[до]] второй, по одной ноте, и называйте каждую. Обратите внимание на последнюю: она называется так же, как первая, — [[до]], но звучит на октаву выше.',
      },
      mistake: {
        en: 'A note name is not yet one single pitch: C names a note in every octave at once. Moving a note by an octave keeps its name and changes only the octave. So keep name and octave apart, and count the octaves in the direction asked.',
        ru: 'Название ноты ещё не определяет одну высоту: до относится к ноте сразу во всех октавах. При переносе на октаву название сохраняется, меняется только октава. Поэтому отделяйте название от октавы и отсчитывайте октавы в указанном направлении.',
        de: 'Ein Tonname ist noch keine einzelne Tonhöhe: C bezeichnet einen Ton in allen Oktaven zugleich. Bei einer Oktavversetzung bleibt der Tonname erhalten, nur die Oktavlage ändert sich. Halte also Name und Oktavlage auseinander und zähle Oktave für Oktave in der angegebenen Richtung.',
        ruMarkup:
          'Название ноты ещё не определяет одну высоту: [[до]] относится к ноте сразу во всех октавах. При переносе на октаву название сохраняется, меняется только октава. Поэтому отделяйте название от октавы и отсчитывайте октавы в указанном направлении.',
      },
      takeaways: [
        {
          en: 'The natural notes have seven letter names, C, D, E, F, G, A and B; after B the series starts again at C.',
          ru: 'Основных ступеней семь: до, ре, ми, фа, соль, ля, си; после си ряд начинается заново с до.',
          de: 'Die Stammtöne haben sieben Namen: C, D, E, F, G, A und H; nach dem H beginnt die Reihe wieder bei C.',
          ruMarkup:
            'Основных ступеней семь: [[до]], [[ре]], [[ми]], [[фа]], [[соль]], [[ля]], [[си]]; после [[си]] ряд начинается заново с [[до]].',
        },
        {
          en: 'From one C to the next C is an octave, and the upper C has twice the frequency of the lower one.',
          ru: 'Между двумя ближайшими до — октава, и частота верхнего вдвое больше, чем у нижнего.',
          de: 'Von einem C zum nächsten C ist es eine Oktave, und das obere schwingt doppelt so schnell wie das untere.',
          ruMarkup:
            'Между двумя ближайшими [[до]] — октава, и частота верхнего вдвое больше, чем у нижнего.',
        },
        {
          en: 'A name alone does not fix a pitch, so say the octave too, as in C4, middle C.',
          ru: 'Одно название не задаёт высоту, поэтому называйте и октаву: например, до первой октавы.',
          de: 'Ein Name allein legt keine Tonhöhe fest, nenne also auch die Oktave: zum Beispiel c′, das eingestrichene c.',
          ruMarkup:
            'Одно название не задаёт высоту, поэтому называйте и октаву: например, [[до]] первой октавы.',
        },
        {
          en: 'Each octave starts at its C: the number rises there, so B4 lies just below C5.',
          ru: 'Каждая октава начинается с до: си первой октавы лежит непосредственно под до второй.',
          de: 'Jede Oktave beginnt bei ihrem C: Das h′ liegt unmittelbar unter dem c″.',
          ruMarkup:
            'Каждая октава начинается с [[до]]: [[си]] первой октавы лежит непосредственно под [[до]] второй.',
        },
      ],
    },
    sourceId: 'source-039',
    experimentId: 'note-names',
    reading: {
      pages: '2–3',
      sourceId: 'source-001',
      text: {
        en: 'The octave number changes at the written C. In 12-TET, B♯3 and C4 sound the same, yet they keep different octave numbers, because the number follows the written letter. The standard 88-key piano extends from A0 to C8; an instrument’s compass is not a universal limit of music.',
        ru: 'Новая октава начинается с записанной ноты до. В двенадцатиступенной равномерной темперации си-диез малой октавы и до первой октавы звучат одинаково, но относятся к разным октавам: октаву определяет записанная ступень. Диапазон обычного 88-клавишного фортепиано: от ля субконтроктавы до до пятой октавы; это не универсальные границы музыки.',
        de: 'Die geschriebene Oktave beginnt jeweils bei c. In gleichstufiger Stimmung klingen his und c′ gleich, behalten aber verschiedene Oktavbezeichnungen, weil sich die Oktave nach dem geschriebenen Stammton richtet. H bezeichnet den Stammton, B dessen Erniedrigung. Das übliche Klavier mit 88 Tasten reicht von A₂ (Subkontra-A) bis c⁵ (fünfgestrichenes c); sein Tonumfang ist keine allgemeine Grenze der Musik.',
        ruMarkup:
          'Новая октава начинается с записанной ноты [[до]]. В двенадцатиступенной равномерной темперации [[си-диез]] малой октавы и [[до]] первой октавы звучат одинаково, но относятся к разным октавам: октаву определяет записанная ступень. Диапазон обычного 88-клавишного фортепиано: от [[ля]] субконтроктавы до [[до]] пятой октавы; это не универсальные границы музыки.',
      },
      assetIds: [],
    },
  },
  experiment: {
    id: 'note-names',
    version: 1,
    scopeId: 'western-notation',
    prerequisites: [],
    locales: ['en', 'ru', 'de'],
    topicId: 'note-names',
    instructions: {
      en: 'In Notes, select C in octave 4. Use the note buttons up to B, then select C in octave 5. Play and name each note.',
      ru: 'Во вкладке «Ноты» выберите до первой октавы. Пройдите кнопками ступеней до си, затем выберите до второй октавы. Проигрывайте и называйте каждую ноту.',
      de: 'Wähle unter Noten das c′. Gehe mit den Tonknöpfen bis h′ und wähle dann c″. Spiele und benenne jeden Ton.',
      ruMarkup:
        'Во вкладке «Ноты» выберите [[до]] первой октавы. Пройдите кнопками ступеней до [[си]], затем выберите [[до]] второй октавы. Проигрывайте и называйте каждую ноту.',
    },
    engine: 'sound-lab',
    preset: {
      hz: 261.625565,
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
      id: 'register-1',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'note-names',
      label: {
        en: 'Move by one octave',
        ru: 'Перенос на одну октаву',
        de: 'Um eine Oktave versetzen',
      },
      generator: 'octave-region',
      sourceIds: ['source-001'],
      kind: 'generated',
    },
    {
      id: 'register-2',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'note-names',
      label: {
        en: 'Move by two octaves',
        ru: 'Перенос на две октавы',
        de: 'Um zwei Oktaven versetzen',
      },
      generator: 'octave-region',
      sourceIds: ['source-001'],
      kind: 'generated',
    },
    {
      id: 'register-3',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'note-names',
      label: {
        en: 'Move by three octaves',
        ru: 'Перенос на три октавы',
        de: 'Um drei Oktaven versetzen',
      },
      generator: 'octave-region',
      sourceIds: ['source-001'],
      kind: 'generated',
    },
    {
      id: 'natural-name',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'note-names',
      label: {
        en: 'Name a natural note',
        ru: 'Название основной ступени',
        de: 'Einen Stammton benennen',
      },
      generator: 'accidental-name',
      sourceIds: ['source-001'],
      kind: 'generated',
    },
  ],
  concepts: [
    {
      id: 'Pitch-name systems',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'note-names',
      order: 43,
      reference: true,
      title: {
        en: 'Pitch-name systems',
        ru: 'Системы названий нот',
        de: 'Systeme der Tonbenennung',
      },
      aliases: {
        en: 'German H; German B; scientific pitch notation; Helmholtz',
        ru: 'немецкая H; немецкая B; система Гельмгольца; научная нотация',
        de: 'H und B; wissenschaftliche Tonhöhenbezeichnung; Helmholtz',
      },
      body: {
        en: 'Optional reference for reading another naming tradition: German H is English B natural, while German B is English B-flat. Scientific C4 and Helmholtz c′ both identify middle C; the Russian tradition calls its register the first octave. These correspondences compare written systems, not different sounds. Ordinary lessons teach the system of the selected language.',
        ru: 'Необязательная справка для чтения другой традиции: немецкая H — си, немецкая B — си-бемоль; в английской системе B — си, B-flat — си-бемоль. До первой октавы соответствует научному C4 и обозначению Гельмгольца c′. Сопоставляются системы записи, а не разные звуки. Обычные уроки используют систему выбранного языка.',
        de: 'Optionale Hilfe zum Lesen einer anderen Tradition: Deutsches H entspricht englischem B natural, deutsches B dem englischen B-flat. Das wissenschaftliche C4 und Helmholtz’ c′ bezeichnen dasselbe mittlere C; die russische Tradition nennt diesen Bereich erste Oktave. Verglichen werden Schreibsysteme, nicht verschiedene Klänge. Die regulären Lektionen unterrichten das System der gewählten Sprache.',
        ruMarkup:
          'Необязательная справка для чтения другой традиции: немецкая H — [[си]], немецкая B — [[си-бемоль]]; в английской системе B — [[си]], B-flat — [[си-бемоль]]. [[До]] первой октавы соответствует научному C4 и обозначению Гельмгольца c′. Сопоставляются системы записи, а не разные звуки. Обычные уроки используют систему выбранного языка.',
      },
      sourceId: 'source-040',
      furtherSourceIds: ['source-039'],
    },
    {
      id: 'Natural note',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'note-names',
      order: 56,
      reference: false,
      title: {
        en: 'Natural note',
        ru: 'Основная ступень',
        de: 'Stammton',
      },
      body: {
        en: 'A note named by a letter alone, with no sharp or flat: C, D, E, F, G, A or B. On the piano these are the white keys; a natural sign may explicitly restore one after an alteration.',
        ru: 'Звук одной из семи основных ступеней: до, ре, ми, фа, соль, ля или си, без повышения или понижения. Им соответствуют белые клавиши фортепиано. После альтерации основную ступень может восстанавливать знак бекара.',
        de: 'Ein Ton der unveränderten Stammtonreihe C, D, E, F, G, A, H. Diesen Tönen entsprechen die weißen Klaviertasten; ein Auflösungszeichen kann nach einer Veränderung den Stammton wiederherstellen.',
        ruMarkup:
          'Звук одной из семи основных ступеней: [[до]], [[ре]], [[ми]], [[фа]], [[соль]], [[ля]] или [[си]], без повышения или понижения. Им соответствуют белые клавиши фортепиано. После альтерации основную ступень может восстанавливать знак бекара.',
      },
      sourceId: 'source-039',
    },
    {
      id: 'Note name',
      version: 1,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'note-names',
      order: 57,
      reference: false,
      title: {
        en: 'Note name',
        ru: 'Название ноты',
        de: 'Tonname',
      },
      body: {
        en: 'A name that identifies a note in every octave at once, not one single pitch.',
        ru: 'Название, которое относится к ноте во всех октавах сразу, а не к одной высоте.',
        de: 'Ein Name, der einen Ton in allen Oktaven zugleich bezeichnet und nicht eine einzelne Tonhöhe.',
      },
      sourceId: 'source-039',
    },
    {
      id: 'Octave register',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'note-names',
      order: 58,
      reference: false,
      title: {
        en: 'Octave register',
        ru: 'Октава (часть звукоряда)',
        de: 'Oktavlage',
      },
      body: {
        en: 'An octave-based naming range from C to the B above it, for example C4–B4. Register in a broader musical sense means a region of pitch and need not span exactly one octave.',
        ru: 'Часть звукоряда от до до ближайшего си над ним. У каждой такой части своё название, например первая октава. Более общее понятие регистра обозначает область высот и не обязано совпадать с одной октавой.',
        de: 'Die Oktave, in der ein Ton liegt: der Abschnitt der Tonreihe von einem C bis zum nächsten H darüber (Oktavraum), etwa c′–h′, die eingestrichene Oktave. Ein Register im weiteren musikalischen Sinn ist ein Tonhöhenbereich und muss nicht genau eine Oktave umfassen.',
        ruMarkup:
          'Часть звукоряда от [[до]] до ближайшего [[си]] над ним. У каждой такой части своё название, например первая октава. Более общее понятие регистра обозначает область высот и не обязано совпадать с одной октавой.',
      },
      sourceId: 'source-039',
    },
    {
      id: 'Octave notation',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'note-names',
      order: 59,
      reference: false,
      title: {
        en: 'Octave notation',
        ru: 'Обозначения октав',
        de: 'Oktavbezeichnungen',
      },
      body: {
        en: 'Octave notation distinguishes registers. Scientific pitch notation uses numbers (C4), Helmholtz notation uses letter case and marks (c′), and Russian tradition uses names such as the first octave. These are different systems for identifying the same pitch.',
        ru: 'Обозначение октавы уточняет высоту ноты. В русской традиции говорят «до первой октавы»; ту же высоту научная система обозначает C4, а система Гельмгольца — c′. Это разные системы обозначений, а не разные ноты.',
        de: 'Oktavbezeichnungen unterscheiden die Tonlagen. Die wissenschaftliche Schreibweise verwendet Zahlen (C4), die Helmholtz-Bezeichnung Groß- und Kleinbuchstaben mit Strichen (c′); die russische Tradition verwendet Oktavnamen. Diese verschiedenen Systeme bezeichnen dieselbe Tonhöhe.',
        ruMarkup:
          'Обозначение октавы уточняет высоту ноты. В русской традиции говорят «[[до]] первой октавы»; ту же высоту научная система обозначает C4, а система Гельмгольца — c′. Это разные системы обозначений, а не разные ноты.',
      },
      sourceId: 'source-001',
    },
    {
      id: 'Middle C',
      version: 2,
      scopeId: 'western-notation',
      prerequisites: [],
      locales: ['en', 'ru', 'de'],
      topicId: 'note-names',
      order: 60,
      reference: false,
      title: {
        en: 'Middle C',
        ru: 'До первой октавы',
        de: 'Eingestrichenes c',
        ruMarkup: '[[До]] первой октавы',
      },
      body: {
        en: 'The C near the middle of a piano keyboard, written C4. At A4 = 440 Hz in twelve-tone equal temperament, its frequency is about 261.6 Hz; another reference pitch or tuning changes that frequency.',
        ru: 'До в средней части фортепианной клавиатуры, начало первой октавы. При ля первой октавы = 440 Гц в двенадцатиступенной равномерной темперации его частота примерно 261,6 Гц; при другой опорной частоте или строе она меняется.',
        de: 'Das c nahe der Klaviaturmitte, geschrieben c′. Bei a′ = 440 Hz in zwölfstufiger gleichstufiger Stimmung liegt es bei etwa 261,6 Hz; ein anderer Bezugston oder eine andere Stimmung verändert diese Frequenz.',
        ruMarkup:
          '[[До]] в средней части фортепианной клавиатуры, начало первой октавы. При [[ля]] первой октавы = 440 Гц в двенадцатиступенной равномерной темперации его частота примерно 261,6 Гц; при другой опорной частоте или строе она меняется.',
      },
      sourceId: 'source-040',
    },
  ],
};
export default content;
