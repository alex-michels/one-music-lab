import { localizedText as text, type LocalText } from './i18n';
import { TOPIC_IDS, paragraphAnchors, type TopicId } from './topics';
import type { Lens, Route } from './client-store';

export type Chapter = {
  id: string;
  title: LocalText;
  goal: LocalText;
  prerequisites: readonly TopicId[];
  lessons: readonly TopicId[];
};

export type CourseSection = {
  id: string;
  title: LocalText;
  introduction: LocalText;
  chapters: readonly Chapter[];
};

/** Authored teaching order, independent of permanent topic/roadmap identities. */
export const course: readonly CourseSection[] = [
  {
    id: 'foundations',
    title: text('Foundations', 'Основы', 'Grundlagen'),
    introduction: text(
      'Begin with a sound, learn to read its pitch and duration, then connect notes into scales and chords.',
      'Начните со звука, научитесь читать его высоту и длительность, затем соедините ноты в гаммы и аккорды.',
      'Beginne mit einem Klang, lerne Tonhöhe und Dauer zu lesen und verbinde dann Töne zu Tonleitern und Akkorden.',
    ),
    chapters: [
      {
        id: 'first-sounds',
        title: text(
          'First sounds and note names',
          'Первые звуки и названия нот',
          'Erste Klänge und Tonnamen',
        ),
        goal: text(
          'Relate a periodic sound to its frequency, then locate named notes in their octaves. These names prepare you to read a staff.',
          'Свяжите периодический звук с его частотой, затем найдите названные ноты в разных октавах. Эти названия подготовят вас к чтению нотного стана.',
          'Verbinde einen periodischen Klang mit seiner Frequenz und finde benannte Töne in ihren Oktaven. Diese Namen bereiten dich auf das Notenlesen vor.',
        ),
        prerequisites: [],
        lessons: ['sound', 'note-names'],
      },
      {
        id: 'reading-pitch',
        title: text('Reading pitch', 'Чтение высоты звука', 'Tonhöhen lesen'),
        goal: text(
          'Use note names to read staff positions, clefs and accidentals. Once pitch is clear, the next chapter adds duration.',
          'Используйте названия нот, чтобы читать позиции на стане, ключи и знаки альтерации. После высоты звука следующая глава вводит длительность.',
          'Nutze Tonnamen, um Positionen im Notensystem, Schlüssel und Versetzungszeichen zu lesen. Nach der Tonhöhe kommt im nächsten Kapitel die Dauer hinzu.',
        ),
        prerequisites: ['note-names'],
        lessons: [
          'staff',
          'clefs',
          'accidental-signs',
          'accidental-scope',
          'enharmonics',
        ],
      },
      {
        id: 'rhythm',
        title: text(
          'Rhythm and musical time',
          'Ритм и музыкальное время',
          'Rhythmus und musikalische Zeit',
        ),
        goal: text(
          'Read note and rest values, combine durations, and interpret beat divisions and tempo. Bring this timing to the pitch relationships that follow.',
          'Читайте длительности нот и пауз, складывайте их, разбирайте деление доли и темп. Используйте это чувство времени при изучении отношений между звуками.',
          'Lies Noten- und Pausenwerte, verbinde Dauern und deute Schlagteilungen und Tempo. Nutze dieses Zeitverständnis für die folgenden Tonbeziehungen.',
        ),
        prerequisites: ['staff'],
        lessons: ['durations', 'dots-ties', 'beat-division', 'tempo'],
      },
      {
        id: 'pitch-relationships',
        title: text(
          'Tuning, intervals, scales and chords',
          'Строй, интервалы, гаммы и аккорды',
          'Stimmung, Intervalle, Tonleitern und Akkorde',
        ),
        goal: text(
          'Build on pitch spelling and measured time to compare tuning, describe intervals, and explore scales and chords. Then turn to sound colour and performance.',
          'Опираясь на нотное написание и музыкальное время, сравните строи, опишите интервалы и исследуйте гаммы и аккорды. Затем переходите к тембру и исполнению.',
          'Vergleiche auf Grundlage von Tonschreibung und musikalischer Zeit Stimmungen, beschreibe Intervalle und erkunde Tonleitern und Akkorde. Danach folgen Klangfarbe und Vortrag.',
        ),
        prerequisites: ['sound', 'enharmonics', 'tempo'],
        lessons: ['tuning', 'intervals', 'scales', 'chords'],
      },
    ],
  },
  {
    id: 'expression',
    title: text(
      'Expression and performance',
      'Выразительность и исполнение',
      'Ausdruck und Vortrag',
    ),
    introduction: text(
      'Use the pitch and rhythm foundations to explore how a passage sounds and how its performance is marked on the page.',
      'Используйте основы высоты и ритма, чтобы исследовать звучание фрагмента и указания к его исполнению в нотах.',
      'Erkunde mit den Grundlagen von Tonhöhe und Rhythmus den Klang eines Abschnitts und die Vortragsangaben im Notentext.',
    ),
    chapters: [
      {
        id: 'sound-and-performance',
        title: text(
          'Sound colour and performance marks',
          'Тембр и исполнительские обозначения',
          'Klangfarbe und Vortragszeichen',
        ),
        goal: text(
          'Compare timbres, interpret dynamics and articulation, and follow a written repeat route. Finish by revisiting a short passage in the lab and practice.',
          'Сравните тембры, прочитайте динамику и артикуляцию, проследите порядок повторов. В конце вернитесь к короткому фрагменту в лаборатории и практике.',
          'Vergleiche Klangfarben, deute Dynamik und Artikulation und verfolge notierte Wiederholungen. Kehre zum Abschluss im Labor und beim Üben zu einem kurzen Ausschnitt zurück.',
        ),
        prerequisites: ['sound', 'tempo', 'chords'],
        lessons: ['timbre', 'dynamics', 'articulation', 'repeats'],
      },
    ],
  },
];

export const chapters = course.flatMap((section) => section.chapters);
export const readingOrder = chapters.flatMap((chapter) => chapter.lessons);
export const courseAddresses = {
  sections: course.map((section) => section.id),
  chapters: chapters.map((chapter) => chapter.id),
};

/** Every lesson gets an explicit transition; new topics cannot silently fall outside the book. */
export const lessonBridges: Record<TopicId, LocalText> = {
  sound: text(
    'Start by connecting what you hear to a repeating vibration.',
    'Начните со связи слышимого звука с повторяющимися колебаниями.',
    'Verbinde zuerst das Gehörte mit einer periodischen Schwingung.',
  ),
  'note-names': text(
    'You have explored frequency. Now give pitches names and locate their octaves.',
    'Вы исследовали частоту. Теперь назовите звуки и определите их октавы.',
    'Du hast Frequenzen erkundet. Benenne jetzt die Töne und ordne sie ihren Oktaven zu.',
  ),
  staff: text(
    'Bring the note names from the first chapter onto the staff.',
    'Перенесите названия нот из первой главы на нотный стан.',
    'Übertrage die Tonnamen aus dem ersten Kapitel ins Notensystem.',
  ),
  clefs: text(
    'You can follow staff positions. Now use the clef to identify the pitches they represent.',
    'Вы умеете следить за позициями на стане. Теперь определите их высоту с помощью ключа.',
    'Du kannst Positionen im Notensystem verfolgen. Bestimme nun mithilfe des Schlüssels ihre Tonhöhen.',
  ),
  'accidental-signs': text(
    'After clefs and natural notes, learn how accidentals change the named pitch.',
    'После ключей и основных ступеней изучите, как знаки альтерации изменяют высоту названной ноты.',
    'Lerne nach Schlüsseln und Stammtönen, wie Versetzungszeichen die benannte Tonhöhe verändern.',
  ),
  'accidental-scope': text(
    'You know what each accidental means. Now decide where its effect continues and ends.',
    'Вы знаете значение знаков альтерации. Теперь определите, где их действие продолжается и заканчивается.',
    'Du kennst die Bedeutung der Versetzungszeichen. Bestimme jetzt, wie weit sie gelten.',
  ),
  enharmonics: text(
    'Keep the spelling and accidental rules in view while comparing different names for a pitch.',
    'Сохраняйте в уме нотное написание и действие знаков, сравнивая разные названия одной высоты.',
    'Behalte Tonschreibung und Vorzeichenregeln im Blick, wenn du verschiedene Namen einer Tonhöhe vergleichst.',
  ),
  durations: text(
    'You have read pitch. Begin this chapter by reading how long notes and rests last.',
    'Вы читали высоту звука. Начните эту главу с длительностей нот и пауз.',
    'Du hast Tonhöhen gelesen. Beginne dieses Kapitel mit der Dauer von Noten und Pausen.',
  ),
  'dots-ties': text(
    'Use the basic values you just learned to work out dotted and tied durations.',
    'Используйте изученные основные длительности для расчёта нот с точками и связующими лигами.',
    'Berechne mit den gerade gelernten Grundwerten punktierte und übergebundene Dauern.',
  ),
  'beat-division': text(
    'After adding durations, examine how a beat is divided and how groups are written.',
    'После сложения длительностей рассмотрите деление доли и запись ритмических групп.',
    'Untersuche nach dem Addieren von Dauern die Teilung eines Schlags und die Notation der Gruppen.',
  ),
  tempo: text(
    'You can read the divisions. Now connect a written beat unit to the pace of performance.',
    'Вы умеете читать деление долей. Теперь свяжите указанную единицу счёта со скоростью исполнения.',
    'Du kannst die Teilungen lesen. Verbinde jetzt die notierte Zähleinheit mit dem Ausführungstempo.',
  ),
  tuning: text(
    'Return to frequency with your new understanding of note names and spelling. Separate the reference pitch from the tuning system.',
    'Вернитесь к частоте с новым пониманием названий и написания нот. Различайте опорную высоту и музыкальный строй.',
    'Kehre mit deinem Wissen über Tonnamen und Tonschreibung zur Frequenz zurück. Unterscheide Bezugston und Stimmungssystem.',
  ),
  intervals: text(
    'With a reference and tuning chosen, compare two pitches and describe their written interval.',
    'Выбрав опору и строй, сравните два звука и опишите записанный интервал.',
    'Vergleiche nach der Wahl von Bezugston und Stimmung zwei Töne und beschreibe ihr notiertes Intervall.',
  ),
  scales: text(
    'Use interval distances and degree spelling to follow the steps of a scale.',
    'Используйте величину интервалов и написание ступеней, чтобы проследить строение гаммы.',
    'Verfolge mit Intervallabständen und korrekter Stufenschreibung den Aufbau einer Tonleiter.',
  ),
  chords: text(
    'From ordered scale steps, turn to notes combined into chords. Distinguish the chord type from its musical role.',
    'От последовательности ступеней перейдите к звукам, соединённым в аккорды. Различайте вид аккорда и его музыкальную роль.',
    'Gehe von geordneten Tonleiterstufen zu Akkorden über. Unterscheide Akkordtyp und musikalische Rolle.',
  ),
  timbre: text(
    'You have explored pitch combinations. Begin the next section by comparing the character of their sound.',
    'Вы исследовали сочетания высот. Начните следующий раздел со сравнения характера их звучания.',
    'Du hast Tonkombinationen erkundet. Vergleiche zu Beginn des nächsten Abschnitts ihren Klangcharakter.',
  ),
  dynamics: text(
    'After sound colour, focus on relative loudness and its written changes.',
    'После тембра сосредоточьтесь на относительной громкости и её записанных изменениях.',
    'Betrachte nach der Klangfarbe die relative Lautstärke und ihre notierten Veränderungen.',
  ),
  articulation: text(
    'Bring dynamics and duration together while reading how notes should be connected or separated.',
    'Соедините знания о динамике и длительности, читая указания о связном и раздельном исполнении нот.',
    'Verbinde Dynamik und Dauer, während du Angaben zum Verbinden oder Trennen von Tönen liest.',
  ),
  repeats: text(
    'You can read pitch, rhythm and performance marks. Now trace the order in which the written passage is played.',
    'Вы читаете высоту, ритм и исполнительские обозначения. Теперь проследите порядок исполнения записанного фрагмента.',
    'Du kannst Tonhöhe, Rhythmus und Vortragszeichen lesen. Verfolge jetzt die Abspielreihenfolge des notierten Ausschnitts.',
  ),
};

export function lessonPosition(topic: string | null) {
  const index = readingOrder.findIndex((id) => id === topic);
  if (index < 0) return null;
  const section = course.find((part) =>
    part.chapters.some((chapter) => chapter.lessons.includes(topic as TopicId)),
  )!;
  const chapter = section.chapters.find((part) =>
    part.lessons.includes(topic as TopicId),
  )!;
  return {
    section,
    chapter,
    index,
    inChapter: chapter.lessons.indexOf(topic as TopicId),
    previous: readingOrder[index - 1] ?? null,
    next: readingOrder[index + 1] ?? null,
  };
}

export function collectionTitle(
  collection: Route['collection'],
): LocalText | null {
  if (!collection) return null;
  return (
    (collection.kind === 'section' ? course : chapters).find(
      (entry) => entry.id === collection.id,
    )?.title ?? null
  );
}

export function chaptersFor(
  collection: Route['collection'],
): readonly Chapter[] {
  if (!collection) return chapters;
  if (collection.kind === 'chapter')
    return chapters.filter((chapter) => chapter.id === collection.id);
  return course.find((section) => section.id === collection.id)?.chapters ?? [];
}

export function lessonAvailable(topic: TopicId, lens: Lens): boolean {
  return lens !== 'drill' || paragraphAnchors[topic].length > 0;
}

/** Used by authoring validation as well as unit tests, including unimported new lessons. */
export function courseProblems(
  sections: readonly CourseSection[],
  topicIds: readonly string[] = TOPIC_IDS,
): string[] {
  const problems: string[] = [];
  const sectionIds = new Set<string>();
  const chapterIds = new Set<string>();
  const seen = new Set<string>();
  for (const section of sections) {
    if (sectionIds.has(section.id))
      problems.push(`Duplicate section: ${section.id}`);
    sectionIds.add(section.id);
    if (!section.chapters.length) problems.push(`Empty section: ${section.id}`);
    for (const chapter of section.chapters) {
      if (chapterIds.has(chapter.id))
        problems.push(`Duplicate chapter: ${chapter.id}`);
      chapterIds.add(chapter.id);
      if (!chapter.lessons.length)
        problems.push(`Empty chapter: ${chapter.id}`);
      for (const id of chapter.prerequisites) {
        if (!seen.has(id))
          problems.push(`Prerequisite must precede ${chapter.id}: ${id}`);
      }
      for (const id of chapter.lessons) {
        if (!topicIds.includes(id)) problems.push(`Unknown lesson: ${id}`);
        if (seen.has(id)) problems.push(`Repeated lesson: ${id}`);
        seen.add(id);
      }
    }
  }
  for (const id of topicIds)
    if (!seen.has(id)) problems.push(`Missing lesson: ${id}`);
  return problems;
}
