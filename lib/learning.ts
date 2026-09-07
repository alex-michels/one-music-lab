import { german } from './german';
import { scales } from './scales';
import type { SpelledPattern } from './notation';
import { localText as b } from './i18n';
export type { LocalText } from './i18n';
export const lessons = [
  {
    id: 'sound',
    title: b('Sound & frequency', 'Звук и частота'),
    category: b('Acoustics', 'Акустика'),
    summary: b(
      'Why some sounds feel higher than others.',
      'Почему одни звуки выше других.',
    ),
    formula: b('T = 1 / f', 'T = 1 / f'),
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
    formula: b(
      'f(n) = A4 × 2^((n − 69) / 12)',
      'f(n) = A4 × 2^((n − 69) / 12)',
    ),
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
    formula: b('cents = 1200 × log₂(f₂ / f₁)', 'Центы = 1200 × log₂(f₂ / f₁)'),
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
    formula: b('fₖ = k × f₁', 'fₖ = k × f₁'),
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
    formula: b(
      'Major: 2 – 2 – 1 – 2 – 2 – 2 – 1',
      'Мажор: 2 – 2 – 1 – 2 – 2 – 2 – 1',
    ),
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
    formula: b(
      'Major: 0 · 4 · 7   /   Minor: 0 · 3 · 7',
      'Мажор: 0 · 4 · 7   /   Минор: 0 · 3 · 7',
    ),
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
  // Notation programme (roadmap №558): 13 lessons for 003, 012–014, 017,
  // 019, 022–024, 124, 125 and 127. Each language teaches its own naming
  // system; the comparison lives in the encyclopedia, never in a lesson.
  {
    id: 'note-names',
    title: b('Note names and octaves', 'Названия нот и октавы'),
    category: b('Notation', 'Нотация'),
    summary: b(
      'Name any natural note and say which octave it sits in.',
      'Называйте любую основную ступень и определяйте её октаву.',
    ),
    formula: b(
      'C D E F G A B · C4 … B4 · C5',
      'до ре ми фа соль ля си · первая октава: до … си · далее вторая',
    ),
    paragraphs: [
      b(
        'Seven names carry the natural notes: C, D, E, F, G, A and B. After B the series starts again at C, and the frequency of that C is twice the frequency of the C below it. That repeating distance is the octave.',
        'Основных ступеней семь: до, ре, ми, фа, соль, ля, си. После си ряд начинается заново с до, и частота этого до вдвое больше, чем у предыдущего. Расстояние до повторения названия называется октавой.',
      ),
      b(
        'A name alone does not fix a pitch, because every octave repeats it. Scientific pitch notation adds a number: middle C is C4, and the number rises at each C, so B4 lies just below C5. The reference pitch of this lab is A4 at 440 Hz.',
        'Одно название не задаёт высоту: оно повторяется в каждой октаве, поэтому называют и октаву. Русские названия идут снизу вверх: субконтроктава, контроктава, большая, малая, первая, вторая, третья, четвёртая, пятая. Каждая октава начинается с до, и си первой октавы лежит непосредственно под до второй. Опорный тон лаборатории — ля первой октавы, 440 Гц.',
      ),
    ],
    experiment: b(
      'Play C4, then every white key up to C5, saying each name with its octave number aloud.',
      'Сыграйте до первой октавы, затем каждую белую клавишу вверх до до второй, называя вслух ступень и октаву.',
    ),
    hz: 261.625565,
    wave: 'triangle',
    source: 'https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php',
  },
  {
    id: 'staff',
    title: b('Five lines, four spaces', 'Пять линеек, четыре промежутка'),
    category: b('Notation', 'Нотация'),
    summary: b(
      'Read where a note sits on the staff.',
      'Определять место ноты на нотном стане.',
    ),
    formula: b(
      '5 lines + 4 spaces = 9 places · one place above and one below = 11 · counted from the bottom',
      '5 линеек + 4 промежутка = 9 мест · плюс место над станом и под ним = 11 · счёт снизу вверх',
    ),
    paragraphs: [
      b(
        'A staff is five parallel lines with four spaces between them, nine places in all. Lines and spaces are both counted from the bottom: the lowest line is the first line, the lowest space the first space. A note head sits on a line, crossed by it, or inside a space.',
        'Нотный стан — пять параллельных линеек и четыре промежутка между ними, всего девять мест. И линейки, и промежутки считают снизу вверх: нижняя линия — первая линейка, нижний промежуток — первый промежуток. Головка ноты стоит либо на линейке, которая её пересекает, либо внутри промежутка.',
      ),
      b(
        'The place just above the top line and the place just below the bottom line also belong to the staff, which makes eleven in all. Past them, short ledger lines extend it one step at a time. Notes are read left to right, and heads aligned vertically sound together.',
        'Место сразу над пятой линейкой и место сразу под первой тоже принадлежат стану — так получается одиннадцать. Дальше стан продолжают короткие добавочные линейки, по одной на каждую следующую ступень. Ноты читают слева направо; головки, выстроенные по вертикали, звучат одновременно.',
      ),
    ],
    experiment: b(
      'Play C4 and G4 one after the other, then together, and compare reading across with reading down.',
      'Сыграйте до первой октавы и соль первой октавы сначала подряд, затем вместе, и сравните чтение слева направо с чтением по вертикали.',
    ),
    hz: 261.625565,
    wave: 'triangle',
    source: 'https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php',
  },
  {
    id: 'clefs',
    title: b('One clef, one fixed pitch', 'Ключ задаёт одну высоту'),
    category: b('Notation', 'Нотация'),
    summary: b(
      'Read the treble and bass clefs with confidence.',
      'Уверенно читать скрипичный и басовый ключи.',
    ),
    formula: b(
      'G-clef line 2 = G4 · F-clef line 4 = F3 · C-clef = C4',
      'Соль-ключ, 2-я линейка = соль первой октавы · Фа-ключ, 4-я линейка = фа малой октавы · До-ключ = до первой октавы',
    ),
    paragraphs: [
      b(
        'A staff on its own carries eleven places, far fewer than the instruments in use need. A clef solves this by naming one of them. The G-clef fixes G4 on the second line, the F-clef fixes F3 on the fourth, and every other pitch is counted from that single named one.',
        'Сам по себе нотный стан даёт лишь одиннадцать мест, а инструментам нужно гораздо больше звуков. Ключ решает это: он называет одно из этих мест. Скрипичный ключ закрепляет соль первой октавы на второй линейке, басовый — фа малой октавы на четвёртой, и все остальные ноты отсчитываются от этой одной.',
      ),
      b(
        'Treble and bass are the two to read without hesitation; middle C sits on one ledger line below the first and above the second. The C clefs mark C4 with their centre: the alto clef on the third line, the tenor clef on the fourth. A brace joins two staves into one keyboard system.',
        'Скрипичный и басовый — те два ключа, которые читают без запинки; до первой октавы лежит на добавочной линейке под первым станом и над вторым. До-ключи указывают до первой октавы на той линейке, которую охватывают: альтовый — на третьей, теноровый — на четвёртой. Два нотоносца, соединённые акколадой, образуют одну систему для фортепиано.',
      ),
    ],
    experiment: b(
      'Play G4, then F3, and hear how far apart the reference pitches of these two clefs actually sound.',
      'Сыграйте соль первой октавы, затем фа малой октавы и услышьте, как далеко расходятся опорные ноты двух ключей.',
    ),
    hz: 391.995436,
    wave: 'triangle',
    source: 'https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php',
  },
  {
    id: 'accidental-signs',
    title: b('The five signs', 'Пять знаков альтерации'),
    category: b('Notation', 'Нотация'),
    summary: b(
      'Read the five accidentals and know how far each moves.',
      'Читайте пять знаков альтерации и знайте, насколько каждый сдвигает высоту.',
    ),
    formula: b(
      '♯ +1 · ♭ −1 · × +2 · ♭♭ −2 · ♮ 0 (semitones)',
      '♯ +1 · ♭ −1 · × +2 · ♭♭ −2 · ♮ 0 (в полутонах)',
    ),
    paragraphs: [
      b(
        'An accidental changes the pitch of the written note it stands before. A sharp raises it by a semitone, a flat lowers it by a semitone; the double sharp raises by a whole tone, the double flat lowers by a whole tone. A natural cancels any of them.',
        'Знак альтерации меняет высоту ноты, перед которой он стоит. Диез повышает её на полутон, бемоль понижает на полутон. Дубль-диез повышает на целый тон, дубль-бемоль понижает на целый тон. Бекар отменяет действие любого из них и возвращает основную ступень.',
      ),
      b(
        'The sign stands to the left of the note head, on the same line or space, and is spoken after the letter: C sharp, B flat. The letter itself does not change. To replace a double sharp with a single sharp, the single sign is written alone.',
        'Знак пишется слева от нотной головки, на той же линейке или в том же промежутке, а в названии идёт после ступени: до-диез, си-бемоль. Сама ступень при этом не меняется: нота остаётся на своём месте на нотоносце. Чтобы заменить дубль-диез простым диезом, пишут один диез.',
      ),
    ],
    experiment: b(
      'Play C4 and C♯4 one after the other, then C4 and D4, and compare the two distances.',
      'Сыграйте до первой октавы и до-диез, затем до и ре, и сравните два расстояния.',
    ),
    hz: 261.625565,
    wave: 'triangle',
    source: 'https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php',
  },
  {
    id: 'accidental-scope',
    title: b('How far a sign reaches', 'Докуда действует знак'),
    category: b('Notation', 'Нотация'),
    summary: b(
      'Know where each accidental starts and where it stops.',
      'Поймите, где знак начинает и где перестаёт действовать.',
    ),
    formula: b(
      'Signature: whole piece, every octave · In the bar: to the barline, one octave',
      'Ключевые знаки: всё произведение, все октавы · Случайные: до тактовой черты, одна октава',
    ),
    paragraphs: [
      b(
        'A key signature stands at the start of every system, after the clef. Each of its signs applies to its letter for the whole piece and in every octave, until a new signature replaces it. Signs do not add up: a flat in the signature and a flat in the bar are still one flat.',
        'Ключевые знаки выставляются при ключе в начале каждой нотной строки. Каждый из них действует на свою ступень во всём произведении и во всех октавах, пока его не заменят новые ключевые знаки. Знаки не складываются: бемоль при ключе и бемоль внутри такта дают один бемоль, а не двойное понижение.',
      ),
      b(
        'A sign written inside a bar holds only to the next barline and only in the octave where it stands; a tie carries it past the barline for the tied note alone. Modern engraving rarely relies on that rule: it rewrites the sign in the other octave and prints courtesy accidentals.',
        'Случайный знак действует только до следующей тактовой черты и только в той октаве, где он записан; за черту он переходит лишь через лигу и только для связанной ноты. Современная нотная графика почти не полагается на это правило: знак повторяют в другой октаве и выписывают предупредительные знаки.',
      ),
    ],
    experiment: b(
      'Play B4, then B♭4, then the same pair an octave lower: one signature sign would cover both octaves.',
      'Сыграйте си первой октавы, затем си-бемоль, потом ту же пару октавой ниже: один ключевой знак действовал бы в обеих октавах.',
    ),
    hz: 493.883301,
    wave: 'sine',
    source: 'https://viva.pressbooks.pub/openmusictheory/table-of-contents/',
  },
  {
    id: 'enharmonics',
    title: b('Two spellings, one sound', 'Две записи, один звук'),
    category: b('Notation', 'Нотация'),
    summary: b(
      'Tell enharmonic spellings apart and know why the spelling matters.',
      'Различайте энгармонические записи и понимайте, зачем нужна каждая.',
    ),
    formula: b(
      'C♯ = D♭ · F♯ = G♭ · E = F♭ · in equal temperament',
      'до-диез = ре-бемоль · фа-диез = соль-бемоль · ми = фа-бемоль · в равномерном строе',
    ),
    paragraphs: [
      b(
        'In twelve-tone equal temperament one pitch can be written in more than one way. C sharp and D flat sound the same; so do F sharp and G flat, and E and F flat. Each spelling names a different letter, and the letter decides which scale degree the note occupies.',
        'В двенадцатиступенном равномерном строе один и тот же звук можно записать по-разному. До-диез и ре-бемоль звучат одинаково; так же соотносятся фа-диез и соль-бемоль, ми и фа-бемоль. Каждая запись называет свою ступень, и именно ступень определяет место ноты в звукоряде.',
      ),
      b(
        'The spelling carries an expectation. A raised degree written with a sharp tends to continue upward; a lowered degree written with a flat tends to continue downward. Interval names follow the letters too, so C–D sharp is a second and C–E flat is a third, whatever the keyboard shows.',
        'Запись несёт ожидание. Повышенная ступень с диезом обычно продолжает движение вверх, пониженная ступень с бемолем — вниз. Названия интервалов тоже считаются по ступеням: до — ре-диез это секунда, а до — ми-бемоль это терция, хотя на клавиатуре расстояние одно и то же.',
      ),
    ],
    experiment: b(
      'Set the lab to F♯4, then look for G♭4, and notice that both names point at one frequency.',
      'Установите фа-диез первой октавы, затем найдите соль-бемоль и убедитесь, что оба названия указывают на одну частоту.',
    ),
    hz: 369.994423,
    wave: 'triangle',
    source: 'https://newt.phys.unsw.edu.au/jw/notes.html',
  },
  {
    id: 'durations',
    title: b('Note values and rests', 'Длительности и паузы'),
    category: b('Notation', 'Нотация'),
    summary: b(
      'Read how long each written note lasts.',
      'Читайте, как долго звучит каждая записанная нота.',
    ),
    formula: b(
      'whole = 2 halves = 4 quarters = 8 eighths = 16 sixteenths',
      'целая = 2 половинные = 4 четверти = 8 восьмых = 16 шестнадцатых',
    ),
    paragraphs: [
      b(
        'A note value says how long a note lasts in relation to the others, not in seconds. Each value is two of the next smaller one. The chain runs whole, half, quarter, eighth, sixteenth, and continues by halving. Only a tempo turns these relations into clock time.',
        'Длительность показывает, как долго звучит нота по отношению к другим, а не в секундах. Каждая длительность вмещает две следующие меньшие: целая, половинная, четверть, восьмая, шестнадцатая — и дальше делением пополам. Только темп превращает эти отношения в реальное время.',
      ),
      b(
        'The shape of a note carries its value. An open head without a stem is a whole note; with a stem it is a half; a filled head a quarter, and each added flag halves the value again. Every value has its own rest, and the whole rest also stands for a silent bar.',
        'Форма ноты задаёт её длительность. Пустая головка без штиля — целая, со штилем — половинная, закрашенная головка — четверть, и каждый следующий флажок снова делит длительность пополам. У каждой длительности есть своя пауза, а целая пауза обозначает и молчание всего такта любого размера.',
      ),
    ],
    experiment: b(
      'Hold a steady pulse in the lab and count one whole, two halves, then four quarters across the same span.',
      'Задайте ровный пульс в лаборатории и отсчитайте на одном отрезке целую, две половинные, затем четыре четверти.',
    ),
    hz: 261.625565,
    wave: 'square',
    source: 'https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php',
  },
  {
    id: 'dots-ties',
    title: b('Dots and ties', 'Точки и лиги'),
    category: b('Notation', 'Нотация'),
    summary: b(
      'Write lengths the plain halving series cannot reach.',
      'Записывайте длительности, которых нет в делении пополам.',
    ),
    formula: b(
      'dotted note = 3 × next smaller  ·  tie: value + value',
      'нота с точкой = 3 × следующая меньшая  ·  лига: длительность + длительность',
    ),
    paragraphs: [
      b(
        "A dot after a note head adds half of that note's value. A dotted note therefore lasts as long as three of the next smaller unit: a dotted half equals three quarters. A second dot adds half of what the first dot added, and the same rule applies to rests.",
        'Точка справа от головки прибавляет половину длительности этой ноты. Поэтому нота с точкой равна трём следующим меньшим: половинная с точкой — трём четвертям. Вторая точка прибавляет половину того, что прибавила первая. То же правило действует и для пауз.',
      ),
      b(
        'A tie joins two notes of the same pitch into one sound, and their values add. Because the tie carries a value across a barline, a note can last longer than the bar allows. The slur is a different sign: it joins notes of different pitch and asks for legato.',
        'Лига продления соединяет две ноты одной высоты в один звук, и их длительности складываются. Именно она переносит звук через тактовую черту, поэтому нота может длиться дольше такта. Фразировочная лига — другой знак: она соединяет ноты разной высоты и требует легато.',
      ),
    ],
    experiment: b(
      'Play a note, then the same pitch twice under a tie, and hear one long sound instead of two attacks.',
      'Сыграйте ноту, затем ту же высоту дважды под лигой продления, и услышьте один долгий звук вместо двух.',
    ),
    hz: 293.664768,
    wave: 'triangle',
    source: 'https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php',
  },
  {
    id: 'beat-division',
    title: b('Dividing the beat', 'Деление доли'),
    category: b('Rhythm', 'Ритм'),
    summary: b(
      'Mark a division into three, and read beamed groups.',
      'Обозначайте деление на три и читайте группы под ребром.',
    ),
    formula: b(
      'triplet = 3 in the time of 2  ·  ratio 7:4',
      'триоль = 3 вместо 2  ·  отношение 7:4',
    ),
    paragraphs: [
      b(
        'Note values divide by two, so a beat split into three, five or seven parts needs a mark. A triplet writes three notes where two of that value belong. Irregular groups take the value of the next larger regular division, and a ratio such as 7:4 is printed when that value could be misread.',
        'Длительности делятся пополам, поэтому деление доли на три, пять или семь частей нужно обозначить. Триоль записывает три ноты там, где помещаются две того же вида. Нерегулярные группы записываются длительностью следующего большего регулярного деления, а отношение вроде 7:4 печатают, когда запись можно прочесть неверно.',
      ),
      b(
        'A beam replaces the flags on notes shorter than a quarter: one beam for each flag the note would carry. Beams group notes so that the beat can be seen at a glance, which is why grouping follows the metre rather than the melody. Modern vocal music is beamed by beat, like instrumental music.',
        'Ребро заменяет флажки у нот короче четверти: одно ребро на каждый флажок. Группировка под ребром показывает доли, поэтому она следует метру, а не рисунку мелодии. Современная вокальная музыка группируется по долям так же, как инструментальная; группировка по слогам — более старая практика.',
      ),
    ],
    experiment: b(
      'Play two eighths on one beat, then three triplet eighths, and hear the beat keep its length.',
      'Сыграйте на одну долю две восьмые, затем три восьмые триолью, и услышьте, что доля не изменилась.',
    ),
    hz: 329.627557,
    wave: 'square',
    source: 'https://viva.pressbooks.pub/openmusictheory/table-of-contents/',
  },
  {
    id: 'tempo',
    title: b('Tempo and its marks', 'Темп и его обозначения'),
    category: b('Performance', 'Исполнение'),
    summary: b(
      'Read how fast a piece goes, and when that changes.',
      'Читайте, как быстро идёт музыка и когда это меняется.',
    ),
    formula: b(
      '♩ = 120  ·  Adagio → Andante → Moderato → Allegro → Presto',
      '♩ = 120  ·  Adagio → Andante → Moderato → Allegro → Presto',
    ),
    paragraphs: [
      b(
        'A tempo word at the head of a piece sets its speed, and it holds until another word replaces it. Largo and Adagio are slow, Andante is walking, Moderato is moderate, Allegro is fast, Presto faster still. The words also carry character, so their ranges overlap rather than forming a scale.',
        'Темповое слово в начале пьесы задаёт скорость и действует до тех пор, пока его не сменит другое. Largo и Adagio — медленно, Andante — шагом, Moderato — умеренно, Allegro — быстро, Presto — ещё быстрее. Эти слова говорят и о характере, поэтому их границы перекрываются и не образуют шкалы.',
      ),
      b(
        'A metronome mark fixes the speed in beats per minute against a named note value, as in ♩ = 120. Gradual change has its own vocabulary — accelerando faster, ritardando slower — and the return to the main speed is marked a tempo. A fermata holds a note or rest as long as the performer takes.',
        'Метрономическое обозначение закрепляет скорость в ударах в минуту при названной длительности: ♩ = 120. У постепенного изменения свой словарь — accelerando ускоряя, ritardando замедляя, — а возвращение к основному темпу отмечают словами a tempo. Фермата продлевает ноту или паузу настолько, насколько решит исполнитель.',
      ),
    ],
    experiment: b(
      'Set the pulse to 60 beats per minute, then to 120, and count four beats at each speed.',
      'Задайте пульс 60 ударов в минуту, затем 120, и отсчитайте по четыре доли в каждом темпе.',
    ),
    hz: 440,
    wave: 'sine',
    source: 'https://viva.pressbooks.pub/openmusictheory/table-of-contents/',
  },
  {
    id: 'dynamics',
    title: b('Loudness without a number', 'Громкость без числа'),
    category: b('Performance', 'Исполнение'),
    summary: b(
      'Read dynamic marks as relative levels, not measured ones.',
      'Читайте динамические знаки как относительные, а не измеренные.',
    ),
    formula: b('pp < p < mp < mf < f < ff', 'pp < p < mp < mf < f < ff'),
    paragraphs: [
      b(
        'The letters name relative loudness: p for piano, f for forte, m for mezzo. A mark says only that this passage is louder or softer than what surrounds it. None names a measured level, so the same f differs between a hall and a small room, and between a trumpet and a flute.',
        'Буквы обозначают относительную громкость: p — piano, f — forte, m — mezzo. Знак говорит лишь о том, что этот участок громче или тише соседних. Ни один из них не называет измеренного уровня: одно и то же f звучит по-разному в зале и в небольшой комнате, у трубы и у флейты.',
      ),
      b(
        'Gradual change is written either as a word, crescendo or decrescendo, or as a hairpin opening or closing over the passage it governs. Both hold until something replaces them. Accent signs and sforzato act on a single note instead of a stretch, and they too are read against the level already in force.',
        'Постепенное изменение записывают словом — крещендо или диминуэндо — либо вилкой, которая раскрывается или сходится над нужным отрезком. Указание действует до тех пор, пока его не сменит новое. Акцент и сфорцато относятся к одному звуку, а не к отрезку, и тоже читаются относительно уже установленного уровня.',
      ),
    ],
    experiment: b(
      'Play one tone at a comfortable volume, then louder and softer, naming each level only by comparison with the one before.',
      'Сыграйте один тон на удобной громкости, затем громче и тише, называя каждый уровень только по сравнению с предыдущим.',
    ),
    hz: 440,
    wave: 'sine',
    source: 'https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php',
  },
  {
    id: 'articulation',
    title: b('Joined or separated', 'Слитно или раздельно'),
    category: b('Performance', 'Исполнение'),
    summary: b(
      'Tell legato from staccato and read the middle cases.',
      'Различайте легато и стаккато и читайте промежуточные случаи.',
    ),
    formula: b(
      'legato ⌢ → tenuto → portato → staccato · → staccatissimo ▾',
      'легато ⌢ → тенуто → портато → стаккато · → стаккатиссимо ▾',
    ),
    paragraphs: [
      b(
        'Articulation describes how one note joins or separates from the next. A slur over a group asks for legato: the notes follow without a break between them. A dot asks for staccato, each note shortened and detached, with the silence taken from its own written value rather than from the next note.',
        'Артикуляция описывает, как один звук соединяется со следующим или отделяется от него. Лига над группой требует легато: звуки идут без разрыва. Точка требует стаккато: звук укорачивается и отделяется, а тишина берётся из его собственной записанной длительности, а не из следующей ноты.',
      ),
      b(
        'Between the poles lie tenuto, portato and non legato. In modern engraving a dot means staccato and a wedge the shorter staccatissimo, but scores written before about 1850 do not separate the two reliably. Older parts carry few marks of any kind, so an unmarked line is not an unarticulated one.',
        'Между полюсами лежат тенуто, портато и нон легато. В современной нотной графике точка означает стаккато, а клин — более короткое стаккатиссимо, но в нотах, написанных примерно до 1850 года, это различие непоследовательно. В старых партиях знаков вообще немного, и их отсутствие не означает отсутствия артикуляции.',
      ),
    ],
    experiment: b(
      'Hold one tone for its full length, then play the same figure with each tone cut short and listen to the silence you create.',
      'Продержите тон всю его длительность, затем сыграйте ту же фигуру короткими тонами и вслушайтесь в возникающие паузы.',
    ),
    hz: 261.625565,
    wave: 'triangle',
    source: 'https://viva.pressbooks.pub/openmusictheory/table-of-contents/',
  },
  {
    id: 'repeats',
    title: b('Printed order, played order', 'Порядок записи и порядок игры'),
    category: b('Performance', 'Исполнение'),
    summary: b(
      'Follow a score whose printed order is not the played one.',
      'Следуйте по нотам, где порядок записи не равен порядку игры.',
    ),
    formula: b(
      '‖: … :‖ · [1.] [2.] · D.C. al fine · D.S. al fine',
      '‖: … :‖ · [1.] [2.] · D.C. al fine · D.S. al fine',
    ),
    paragraphs: [
      b(
        'A double bar divides one section from the next; a thin line followed by a thick one ends the piece. A repeat sign is a double bar with two dots, and the dots face the music to be played again. When two repeated sections meet, the two signs share a single bar line.',
        'Двойная тактовая черта отделяет один раздел от другого; тонкая черта с последующей жирной завершает пьесу. Знак репризы — двойная черта с двумя точками, обращёнными к тому, что играется повторно. Когда два повторяемых раздела соседствуют, оба знака делят одну черту.',
      ),
      b(
        'First and second endings choose a different continuation: play the bracketed first ending, take the repeat, then skip to the second. Da capo sends the reader back to the beginning and dal segno to the marked place, each playing on to the word fine. The printed order and the played order differ.',
        'Первая и вторая вольты выбирают разное продолжение: играют первую вольту, возвращаются по репризе, затем пропускают её и идут во вторую. Da capo отсылает к началу, dal segno — к знаку сеньо, и в обоих случаях играют до слова fine. Порядок записи и порядок игры расходятся.',
      ),
    ],
    experiment: b(
      'Play a four-tone figure, repeat it, then play it again with a different last tone and count how many tones sounded in all.',
      'Сыграйте фигуру из четырёх тонов, повторите её, затем сыграйте её же с другим последним тоном и сосчитайте, сколько тонов прозвучало.',
    ),
    hz: 391.995436,
    wave: 'triangle',
    source: 'https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php',
  },
];
export const curriculum = [
  {
    title: b('Sound & musical foundations', 'Звук и музыкальные основы'),
    topics: b(
      'Acoustics · pitch · intervals · rhythm · notation',
      'Акустика · высота · интервалы · ритм · нотация',
    ),
    state: b('Introductory lessons available', 'Вводные уроки доступны'),
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
  {
    title: b('Natural note', 'Основная ступень'),
    body: b(
      'A note carrying one of the seven plain letter names, with no sharp or flat attached.',
      'Ступень, обозначаемая только слоговым названием, без диеза и бемоля.',
    ),
    lesson: 'note-names',
  },
  {
    title: b('Note name', 'Название ноты'),
    body: b(
      'A name that identifies a note in every octave at once, not one single pitch.',
      'Название, которое относится к ноте во всех октавах сразу, а не к одной высоте.',
    ),
    lesson: 'note-names',
  },
  {
    title: b('Octave register', 'Регистр'),
    body: b(
      'The stretch of pitches from one C up to the B above it, for example C4 to B4.',
      'Участок звукоряда в пределах одной октавы, от до до ближайшего си над ним.',
    ),
    lesson: 'note-names',
  },
  {
    title: b('Scientific pitch notation', 'Названия октав'),
    body: b(
      'The convention that appends an octave number to each letter name, counting a new number from every C.',
      'Система, в которой октава названа словом: большая, малая, первая, вторая, третья.',
    ),
    lesson: 'note-names',
  },
  {
    title: b('Middle C', 'До первой октавы'),
    body: b(
      'The C nearest the middle of a piano keyboard, written C4 and sounding at about 261.6 Hz.',
      'До в середине фортепианной клавиатуры, начало первой октавы, около 261,6 Гц.',
    ),
    lesson: 'note-names',
  },
  {
    title: b('Staff', 'Нотный стан'),
    body: b(
      'The staff is the set of five lines and four spaces on which pitches are written.',
      'Нотный стан, или нотоносец, — пять линеек и четыре промежутка, на которых записываются высоты.',
    ),
    lesson: 'staff',
  },
  {
    title: b('Staff line', 'Линейка'),
    body: b(
      'A staff line is one of the five lines, numbered from the bottom upwards.',
      'Линейка — одна из пяти линий стана; их нумеруют снизу вверх.',
    ),
    lesson: 'staff',
  },
  {
    title: b('Space', 'Промежуток'),
    body: b(
      'A space is the gap between two neighbouring lines, and it carries a note head just as a line does.',
      'Промежуток — расстояние между соседними линейками, и нота размещается на нём так же, как на линейке.',
    ),
    lesson: 'staff',
  },
  {
    title: b('Note head', 'Головка ноты'),
    body: b(
      'The note head is the oval whose centre marks the line or space that gives the pitch.',
      'Головка ноты — овал, центр которого указывает линейку или промежуток и тем самым высоту.',
    ),
    lesson: 'staff',
  },
  {
    title: b('Stem', 'Штиль'),
    body: b(
      'The stem is the vertical line attached to the head; it belongs to duration, not to pitch.',
      'Штиль — вертикальная черта у головки; он относится к длительности, а не к высоте.',
    ),
    lesson: 'staff',
  },
  {
    title: b('Ledger line', 'Добавочная линейка'),
    body: b(
      'A ledger line is a short line added above or below the staff to carry pitches beyond its eleven places.',
      'Добавочная линейка — короткая линия над станом или под ним, продолжающая его за пределы одиннадцати мест.',
    ),
    lesson: 'staff',
  },
  {
    title: b('Clef', 'Ключ'),
    body: b(
      'A clef fixes one named pitch on one staff line, and every other pitch is counted from it.',
      'Ключ закрепляет одну названную ноту на определённой линейке, и от неё отсчитываются все остальные.',
    ),
    lesson: 'clefs',
  },
  {
    title: b('Treble clef', 'Скрипичный ключ'),
    body: b(
      'The treble clef is the G-clef whose curl encircles the second line and fixes G4 there.',
      'Скрипичный ключ — соль-ключ, завиток которого обвивает вторую линейку и закрепляет на ней соль первой октавы.',
    ),
    lesson: 'clefs',
  },
  {
    title: b('Bass clef', 'Басовый ключ'),
    body: b(
      'The bass clef is the F-clef whose two dots surround the fourth line and fix F3 there.',
      'Басовый ключ — фа-ключ, две точки которого стоят по сторонам четвёртой линейки и закрепляют на ней фа малой октавы.',
    ),
    lesson: 'clefs',
  },
  {
    title: b('C clef', 'До-ключ'),
    body: b(
      'A C clef names C4 on the line its centre marks: the third line for the alto clef, the fourth for the tenor clef.',
      'До-ключ указывает до первой октавы на той линейке, где сходятся его половины: третья — альтовый ключ, четвёртая — теноровый.',
    ),
    lesson: 'clefs',
  },
  {
    title: b('System', 'Система'),
    body: b(
      'A system is the set of staves that are read together because they sound at the same time.',
      'Система — группа нотоносцев, которые читают вместе, потому что они звучат одновременно.',
    ),
    lesson: 'clefs',
  },
  {
    title: b('Brace', 'Акколада'),
    body: b(
      'A brace is the curved sign that joins two staves into a single keyboard system.',
      'Акколада — фигурная скобка, которая соединяет нотоносцы в одну систему.',
    ),
    lesson: 'clefs',
  },
  {
    title: b('Accidental', 'Знак альтерации'),
    body: b(
      'A sign placed before a note head that raises or lowers the written pitch.',
      'Знак перед нотной головкой, повышающий или понижающий записанную высоту.',
    ),
    lesson: 'accidental-signs',
  },
  {
    title: b('Sharp', 'Диез'),
    body: b(
      'A sign that raises the written note by one semitone.',
      'Знак, повышающий записанную ноту на полутон.',
    ),
    lesson: 'accidental-signs',
  },
  {
    title: b('Flat', 'Бемоль'),
    body: b(
      'A sign that lowers the written note by one semitone.',
      'Знак, понижающий записанную ноту на полутон.',
    ),
    lesson: 'accidental-signs',
  },
  {
    title: b('Double sharp', 'Дубль-диез'),
    body: b(
      'A sign that raises the written note by two semitones.',
      'Знак, повышающий записанную ноту на два полутона.',
    ),
    lesson: 'accidental-signs',
  },
  {
    title: b('Double flat', 'Дубль-бемоль'),
    body: b(
      'A sign that lowers the written note by two semitones.',
      'Знак, понижающий записанную ноту на два полутона.',
    ),
    lesson: 'accidental-signs',
  },
  {
    title: b('Natural', 'Бекар'),
    body: b(
      'A sign that removes an earlier raising or lowering of a note.',
      'Знак, снимающий сделанное ранее повышение или понижение ноты.',
    ),
    lesson: 'accidental-signs',
  },
  {
    title: b('Semitone', 'Полутон'),
    body: b(
      'The smallest step between adjacent keys in twelve-tone equal temperament.',
      'Наименьший шаг между соседними клавишами в двенадцатиступенном равномерном строе.',
    ),
    lesson: 'accidental-signs',
  },
  {
    title: b('Whole tone', 'Целый тон'),
    body: b(
      'An interval that spans two semitones.',
      'Интервал, охватывающий два полутона.',
    ),
    lesson: 'accidental-signs',
  },
  {
    title: b('Key signature', 'Ключевые знаки'),
    body: b(
      'The group of sharps or flats printed after the clef.',
      'Группа диезов или бемолей, выставленная при ключе.',
    ),
    lesson: 'accidental-scope',
  },
  {
    title: b('Bar', 'Такт'),
    body: b(
      'The span of music between two barlines.',
      'Отрезок музыки между двумя тактовыми чертами.',
    ),
    lesson: 'accidental-scope',
  },
  {
    title: b('Barline', 'Тактовая черта'),
    body: b(
      'The vertical line that separates one bar from the next.',
      'Вертикальная черта, отделяющая один такт от следующего.',
    ),
    lesson: 'accidental-scope',
  },
  {
    title: b('Tie', 'Лига'),
    body: b(
      'A curved line joining two note heads of the same pitch into one sound.',
      'Дуга, соединяющая две ноты одной высоты в один звук.',
    ),
    lesson: 'accidental-scope',
  },
  {
    title: b('Courtesy accidental', 'Предупредительный знак'),
    body: b(
      'A sign printed where the rule does not require it, to remove doubt.',
      'Знак, выписанный там, где правило его не требует, чтобы снять сомнение.',
    ),
    lesson: 'accidental-scope',
  },
  {
    title: b('Staff system', 'Нотная строка'),
    body: b(
      'One line of music running across the page.',
      'Одна строка нотной записи, идущая через страницу.',
    ),
    lesson: 'accidental-scope',
  },
  {
    title: b('Enharmonic spelling', 'Энгармоническая запись'),
    body: b(
      'Two different written notes that sound as one pitch in equal temperament.',
      'Две разные записи, дающие в равномерном строе одну и ту же высоту.',
    ),
    lesson: 'enharmonics',
  },
  {
    title: b('Letter name', 'Основная ступень'),
    body: b(
      'The plain name of a note before any accidental is added.',
      'Основное название ноты до прибавления знака альтерации.',
    ),
    lesson: 'enharmonics',
  },
  {
    title: b('Scale degree', 'Ступень звукоряда'),
    body: b(
      'The numbered position a note occupies in its scale.',
      'Порядковое место, которое нота занимает в своём звукоряде.',
    ),
    lesson: 'enharmonics',
  },
  {
    title: b('Raised degree', 'Повышенная ступень'),
    body: b(
      'A scale degree written a semitone higher than its plain form.',
      'Ступень, записанная на полутон выше своего основного вида.',
    ),
    lesson: 'enharmonics',
  },
  {
    title: b('Lowered degree', 'Пониженная ступень'),
    body: b(
      'A scale degree written a semitone lower than its plain form.',
      'Ступень, записанная на полутон ниже своего основного вида.',
    ),
    lesson: 'enharmonics',
  },
  {
    title: b('Chromatic semitone', 'Хроматический полутон'),
    body: b(
      'A semitone between two notes that share a letter, such as C and C sharp.',
      'Полутон между двумя нотами одной ступени, например до и до-диез.',
    ),
    lesson: 'enharmonics',
  },
  {
    title: b('Diatonic semitone', 'Диатонический полутон'),
    body: b(
      'A semitone between two neighbouring letters, such as C sharp and D.',
      'Полутон между двумя соседними ступенями, например до-диез и ре.',
    ),
    lesson: 'enharmonics',
  },
  {
    title: b('Note value', 'Длительность'),
    body: b(
      'The written length of a note, given in relation to the other values rather than in seconds.',
      'Записанная протяжённость ноты, заданная по отношению к другим длительностям, а не в секундах.',
    ),
    lesson: 'durations',
  },
  {
    title: b('Whole note', 'Целая нота'),
    body: b(
      'The longest value of the common series; two half notes fill it exactly.',
      'Самая долгая длительность обычного ряда: её точно заполняют две половинные.',
    ),
    lesson: 'durations',
  },
  {
    title: b('Rest', 'Пауза'),
    body: b(
      'A sign for silence that lasts a stated note value.',
      'Знак молчания, длящегося указанную длительность.',
    ),
    lesson: 'durations',
  },
  {
    title: b('Whole-bar rest', 'Тактовая пауза'),
    body: b(
      'The whole rest used for a silent bar, whatever the length of that bar.',
      'Целая пауза, обозначающая молчание всего такта независимо от его размера.',
    ),
    lesson: 'durations',
  },
  {
    title: b('Flag', 'Флажок'),
    body: b(
      'A hook on the stem; each flag halves the note value again.',
      'Крючок у штиля; каждый флажок снова делит длительность пополам.',
    ),
    lesson: 'durations',
  },
  {
    title: b('Dotted note', 'Нота с точкой'),
    body: b(
      'A note followed by a dot, lasting three of the next smaller unit.',
      'Нота с точкой справа, равная трём следующим меньшим длительностям.',
    ),
    lesson: 'dots-ties',
  },
  {
    title: b('Double dot', 'Двойная точка'),
    body: b(
      'A second dot that adds half of what the first dot added.',
      'Вторая точка, прибавляющая половину того, что прибавила первая.',
    ),
    lesson: 'dots-ties',
  },
  {
    title: b('Dotted rest', 'Пауза с точкой'),
    body: b(
      'A rest lengthened by a dot in exactly the way a note is.',
      'Пауза, удлинённая точкой точно так же, как нота.',
    ),
    lesson: 'dots-ties',
  },
  {
    title: b('Slur', 'Фразировочная лига'),
    body: b(
      'A curved line over notes of different pitch that asks for legato.',
      'Дуга над нотами разной высоты, требующая легато.',
    ),
    lesson: 'dots-ties',
  },
  {
    title: b('Legato', 'Легато'),
    body: b(
      'Playing or singing without a break between consecutive notes.',
      'Исполнение без разрыва между соседними нотами.',
    ),
    lesson: 'dots-ties',
  },
  {
    title: b('Beat', 'Доля'),
    body: b(
      'The unit of pulse that the written note values are counted against.',
      'Единица пульса, по которой отсчитываются записанные длительности.',
    ),
    lesson: 'beat-division',
  },
  {
    title: b('Triplet', 'Триоль'),
    body: b(
      'Three notes written in the time normally taken by two of that value.',
      'Три ноты, записанные во времени, которое обычно занимают две такие же.',
    ),
    lesson: 'beat-division',
  },
  {
    title: b('Duplet', 'Дуоль'),
    body: b(
      'Two notes written in the time normally taken by three of that value.',
      'Две ноты, записанные во времени, которое обычно занимают три такие же.',
    ),
    lesson: 'beat-division',
  },
  {
    title: b('Irregular group', 'Нерегулярная группа'),
    body: b(
      'Any division of a value that halving alone cannot produce.',
      'Любое деление длительности, которого нельзя получить одним делением пополам.',
    ),
    lesson: 'beat-division',
  },
  {
    title: b('Ratio mark', 'Цифровое отношение'),
    body: b(
      'Two numbers such as 7:4, printed when the written value could be misread.',
      'Два числа, например 7:4, которые печатают, когда запись можно прочесть неверно.',
    ),
    lesson: 'beat-division',
  },
  {
    title: b('Beam', 'Ребро'),
    body: b(
      'A thick line replacing flags; one beam stands for one flag.',
      'Толстая линия вместо флажков: одно ребро соответствует одному флажку.',
    ),
    lesson: 'beat-division',
  },
  {
    title: b('Grouping', 'Группировка'),
    body: b(
      'The choice of which notes share a beam, so that the beat stays visible.',
      'Выбор нот под общим ребром, при котором доля остаётся видимой.',
    ),
    lesson: 'beat-division',
  },
  {
    title: b('Tempo', 'Темп'),
    body: b(
      'The speed at which the beats of a piece follow one another.',
      'Скорость, с которой следуют друг за другом доли пьесы.',
    ),
    lesson: 'tempo',
  },
  {
    title: b('Metronome mark', 'Метрономическое обозначение'),
    body: b(
      'A note value with a number, fixing how many such beats fill one minute.',
      'Длительность с числом, указывающая, сколько таких долей укладывается в минуту.',
    ),
    lesson: 'tempo',
  },
  {
    title: b('Beats per minute', 'Ударов в минуту'),
    body: b(
      'The unit of a metronome mark: the count of beats in sixty seconds.',
      'Единица метрономического обозначения: число долей за шестьдесят секунд.',
    ),
    lesson: 'tempo',
  },
  {
    title: b('Accelerando', 'Accelerando'),
    body: b(
      'A direction to become gradually faster.',
      'Указание постепенно ускорять движение.',
    ),
    lesson: 'tempo',
  },
  {
    title: b('Ritardando', 'Ritardando'),
    body: b(
      'A direction to become gradually slower.',
      'Указание постепенно замедлять движение.',
    ),
    lesson: 'tempo',
  },
  {
    title: b('A tempo', 'A tempo'),
    body: b(
      'A direction to return to the speed that was in force before the change.',
      'Указание вернуться к темпу, действовавшему до изменения.',
    ),
    lesson: 'tempo',
  },
  {
    title: b('Fermata', 'Фермата'),
    body: b(
      'A sign that holds a note or rest for as long as the performer takes.',
      'Знак, продлевающий ноту или паузу настолько, насколько решит исполнитель.',
    ),
    lesson: 'tempo',
  },
  {
    title: b('Agogics', 'Агогика'),
    body: b(
      'The small changes of speed that shape a performance.',
      'Небольшие изменения темпа, формирующие исполнение.',
    ),
    lesson: 'tempo',
  },
  {
    title: b('piano (p)', 'пиано (p)'),
    body: b(
      'The mark p asks for a soft level relative to the passages around it.',
      'Знак p требует тихого звучания относительно соседних участков.',
    ),
    lesson: 'dynamics',
  },
  {
    title: b('forte (f)', 'форте (f)'),
    body: b(
      'The mark f asks for a loud level relative to the passages around it.',
      'Знак f требует громкого звучания относительно соседних участков.',
    ),
    lesson: 'dynamics',
  },
  {
    title: b('mezzo (mp, mf)', 'меццо (mp, mf)'),
    body: b(
      'Mezzo means half, so mp and mf sit between piano and forte.',
      'Mezzo значит «наполовину»: mp и mf занимают место между piano и forte.',
    ),
    lesson: 'dynamics',
  },
  {
    title: b('crescendo', 'крещендо'),
    body: b(
      'A crescendo asks for a gradual increase in loudness across the passage it covers.',
      'Крещендо — постепенное усиление звучности на протяжении отмеченного отрезка.',
    ),
    lesson: 'dynamics',
  },
  {
    title: b('decrescendo', 'диминуэндо'),
    body: b(
      'A decrescendo, also written diminuendo, asks for a gradual decrease in loudness.',
      'Диминуэндо, оно же декрещендо, — постепенное ослабление звучности.',
    ),
    lesson: 'dynamics',
  },
  {
    title: b('hairpin', 'вилка'),
    body: b(
      'A hairpin is the pair of converging lines that draws a crescendo or decrescendo over the staff.',
      'Вилка — пара сходящихся линий, обозначающая крещендо или диминуэндо у нотоносца.',
    ),
    lesson: 'dynamics',
  },
  {
    title: b('sforzato (sf, sfz)', 'сфорцато (sf, sfz)'),
    body: b(
      'Sforzato marks a single note as suddenly stronger than the level in force.',
      'Сфорцато отмечает отдельный звук как внезапно более сильный, чем установленный уровень.',
    ),
    lesson: 'dynamics',
  },
  {
    title: b('accent', 'акцент'),
    body: b(
      'An accent sign asks for a single note to be given more weight than its neighbours.',
      'Знак акцента требует выделить один звук сильнее соседних.',
    ),
    lesson: 'dynamics',
  },
  {
    title: b('articulation', 'артикуляция'),
    body: b(
      'Articulation is how one note joins or separates from the note after it.',
      'Артикуляция — способ соединения или разделения соседних звуков.',
    ),
    lesson: 'articulation',
  },
  {
    title: b('staccato', 'стаккато'),
    body: b(
      'A dot over a note asks for staccato: the note is shortened and detached, the silence coming out of its own value.',
      'Точка над нотой означает стаккато: звук укорачивается и отделяется, а тишина берётся из его собственной длительности.',
    ),
    lesson: 'articulation',
  },
  {
    title: b('staccatissimo', 'стаккатиссимо'),
    body: b(
      'In modern engraving a wedge asks for staccatissimo, shorter than staccato.',
      'В современной нотной графике клин означает стаккатиссимо — короче, чем стаккато.',
    ),
    lesson: 'articulation',
  },
  {
    title: b('tenuto', 'тенуто'),
    body: b(
      'A short horizontal line over a note asks for its full written length, and often for a slight weight.',
      'Короткая горизонтальная черта над нотой требует выдержать её полную длительность, часто с небольшим нажимом.',
    ),
    lesson: 'articulation',
  },
  {
    title: b('portato', 'портато'),
    body: b(
      'Portato writes dots under a slur and asks for notes that are separated but not sharply detached.',
      'Портато записывают точками под лигой: звуки отделяются, но не резко.',
    ),
    lesson: 'articulation',
  },
  {
    title: b('phrasing', 'фразировка'),
    body: b(
      'Phrasing groups notes into units of musical sense and is not the same thing as articulation.',
      'Фразировка объединяет звуки в смысловые построения и не тождественна артикуляции.',
    ),
    lesson: 'articulation',
  },
  {
    title: b('double bar', 'двойная тактовая черта'),
    body: b(
      'A double bar is two thin lines marking the end of a section rather than the end of the piece.',
      'Двойная тактовая черта — две тонкие линии, отмечающие конец раздела, а не конец пьесы.',
    ),
    lesson: 'repeats',
  },
  {
    title: b('final bar line', 'заключительная черта'),
    body: b(
      'A thin line followed by a thick one marks the end of the piece or movement.',
      'Тонкая линия с последующей жирной отмечает конец пьесы или части.',
    ),
    lesson: 'repeats',
  },
  {
    title: b('repeat sign', 'знак репризы'),
    body: b(
      'A repeat sign is a double bar with two dots, and the dots face the music to be played again.',
      'Знак репризы — двойная черта с двумя точками, обращёнными к музыке, которую играют повторно.',
    ),
    lesson: 'repeats',
  },
  {
    title: b('first and second endings', 'вольты'),
    body: b(
      'First and second endings are bracketed bars that give the repeat a different continuation.',
      'Вольты — отмеченные скобками такты, дающие повторению другое продолжение.',
    ),
    lesson: 'repeats',
  },
  {
    title: b('da capo', 'da capo'),
    body: b(
      'Da capo sends the reader back to the beginning of the piece.',
      'Da capo отсылает исполнителя к началу пьесы.',
    ),
    lesson: 'repeats',
  },
  {
    title: b('segno', 'сеньо'),
    body: b(
      'The segno is the sign that marks the place a dal segno returns to.',
      'Сеньо — знак, отмечающий место, к которому возвращает указание dal segno.',
    ),
    lesson: 'repeats',
  },
  {
    title: b('dal segno', 'dal segno'),
    body: b(
      'Dal segno sends the reader back to the segno rather than to the beginning.',
      'Dal segno отсылает не к началу, а к знаку сеньо.',
    ),
    lesson: 'repeats',
  },
  {
    title: b('fine', 'fine'),
    body: b(
      'Fine marks where the piece stops after a da capo or dal segno return.',
      'Fine отмечает место остановки после возврата по da capo или dal segno.',
    ),
    lesson: 'repeats',
  },
];
export const patterns: Record<
  'intervals' | 'scales' | 'chords',
  SpelledPattern[]
> = {
  intervals: [
    {
      de: german['Minor second'],
      en: 'Minor second',
      ru: 'Малая секунда',
      steps: [0, 1],
      degrees: [0, 1],
    },
    {
      de: german['Major second'],
      en: 'Major second',
      ru: 'Большая секунда',
      steps: [0, 2],
      degrees: [0, 1],
    },
    {
      de: german['Minor third'],
      en: 'Minor third',
      ru: 'Малая терция',
      steps: [0, 3],
      degrees: [0, 2],
    },
    {
      de: german['Major third'],
      en: 'Major third',
      ru: 'Большая терция',
      steps: [0, 4],
      degrees: [0, 2],
    },
    {
      de: german['Perfect fourth'],
      en: 'Perfect fourth',
      ru: 'Чистая кварта',
      steps: [0, 5],
      degrees: [0, 3],
    },
    {
      de: german['Tritone (augmented fourth)'],
      en: 'Tritone (augmented fourth)',
      ru: 'Тритон (увеличенная кварта)',
      steps: [0, 6],
      degrees: [0, 3],
    },
    {
      de: german['Perfect fifth'],
      en: 'Perfect fifth',
      ru: 'Чистая квинта',
      steps: [0, 7],
      degrees: [0, 4],
    },
    {
      de: german['Octave'],
      en: 'Octave',
      ru: 'Октава',
      steps: [0, 12],
      degrees: [0, 7],
    },
  ],
  scales,
  chords: [
    {
      de: german['Major triad'],
      en: 'Major triad',
      ru: 'Мажорное трезвучие',
      steps: [0, 4, 7],
      degrees: [0, 2, 4],
    },
    {
      de: german['Minor triad'],
      en: 'Minor triad',
      ru: 'Минорное трезвучие',
      steps: [0, 3, 7],
      degrees: [0, 2, 4],
    },
    {
      de: german['Diminished'],
      en: 'Diminished',
      ru: 'Уменьшённое',
      steps: [0, 3, 6],
      degrees: [0, 2, 4],
    },
    {
      de: german['Augmented'],
      en: 'Augmented',
      ru: 'Увеличенное',
      steps: [0, 4, 8],
      degrees: [0, 2, 4],
    },
    {
      de: german['Dominant seventh'],
      en: 'Dominant seventh',
      ru: 'Малый мажорный септаккорд',
      steps: [0, 4, 7, 10],
      degrees: [0, 2, 4, 6],
    },
    {
      de: german['Major seventh'],
      en: 'Major seventh',
      ru: 'Большой мажорный септаккорд',
      steps: [0, 4, 7, 11],
      degrees: [0, 2, 4, 6],
    },
    {
      de: german['Minor seventh'],
      en: 'Minor seventh',
      ru: 'Малый минорный септаккорд',
      steps: [0, 3, 7, 10],
      degrees: [0, 2, 4, 6],
    },
  ],
};
