import { localizedText as text, type LocalText } from './i18n';
import type { TopicId } from './topics';

type DiagnosticQuestion = {
  topic: TopicId;
  prompt: LocalText;
  answer: string;
  options: readonly { id: string; label: LocalText; feedback: LocalText }[];
  source: { title: string; url: string };
};

const soundSource = {
  title:
    'Joe Wolfe · UNSW · Musical sounds, musical instruments and musical signals · Frequency and pitch / Pure tones and harmonics',
  url: 'https://newt.phys.unsw.edu.au/jw/musical-sounds-musical-instruments.html',
};

/** Five bounded checks of existing explanations, not a mastery assessment of F01–F11. */
export const diagnosticQuestions: readonly DiagnosticQuestion[] = [
  {
    topic: 'sound',
    prompt: text(
      'A periodic sound completes 440 cycles in one second. What is its frequency?',
      'Периодический звук совершает 440 колебаний за одну секунду. Какова его частота?',
      'Ein periodischer Klang durchläuft 440 Schwingungen in einer Sekunde. Wie groß ist seine Frequenz?',
    ),
    answer: 'hz',
    options: [
      {
        id: 'seconds',
        label: text('440 seconds', '440 секунд', '440 Sekunden'),
        feedback: text(
          'Seconds measure time. Frequency counts cycles per second, so the frequency here is 440 Hz.',
          'Секунды измеряют время. Частота — число колебаний за секунду, поэтому здесь она равна 440 Гц.',
          'Sekunden messen Zeit. Die Frequenz zählt Schwingungen pro Sekunde und beträgt hier 440 Hz.',
        ),
      },
      {
        id: 'hz',
        label: text('440 Hz', '440 Гц', '440 Hz'),
        feedback: text(
          'One hertz means one cycle per second: 440 cycles per second is 440 Hz.',
          'Один герц — одно колебание в секунду: 440 колебаний в секунду — это 440 Гц.',
          'Ein Hertz entspricht einer Schwingung pro Sekunde: 440 Schwingungen pro Sekunde sind 440 Hz.',
        ),
      },
      {
        id: 'inverse',
        label: text('1/440 Hz', '1/440 Гц', '1/440 Hz'),
        feedback: text(
          'The reciprocal gives the period in seconds. The frequency is 440 Hz; one cycle takes 1/440 second.',
          'Обратная величина даёт период в секундах. Частота равна 440 Гц, одно колебание занимает 1/440 секунды.',
          'Der Kehrwert ergibt die Periodendauer in Sekunden. Die Frequenz beträgt 440 Hz; eine Schwingung dauert 1/440 Sekunde.',
        ),
      },
    ],
    source: soundSource,
  },
  {
    topic: 'clefs',
    prompt: text(
      'What does a clef establish on a staff?',
      'Что определяет ключ на нотном стане?',
      'Was legt ein Schlüssel im Notensystem fest?',
    ),
    answer: 'pitch',
    options: [
      {
        id: 'pitch',
        label: text(
          'A reference for reading pitch positions',
          'Опору для чтения высоты нот',
          'Einen Bezugspunkt zum Lesen der Tonhöhen',
        ),
        feedback: text(
          'The clef anchors a pitch to a staff position, allowing the other positions to be read.',
          'Ключ закрепляет высоту за позицией на стане, позволяя читать остальные позиции.',
          'Der Schlüssel ordnet einer Position eine Tonhöhe zu. Damit lassen sich die übrigen Positionen lesen.',
        ),
      },
      {
        id: 'duration',
        label: text(
          'The duration of each note',
          'Длительность каждой ноты',
          'Die Dauer jeder Note',
        ),
        feedback: text(
          'Note values show duration. The clef instead supplies a reference for pitch positions.',
          'Длительность показывают нотные знаки соответствующих длительностей. Ключ задаёт опору для чтения высоты.',
          'Notenwerte zeigen die Dauer. Der Schlüssel liefert dagegen einen Bezugspunkt für die Tonhöhen.',
        ),
      },
      {
        id: 'loudness',
        label: text(
          'The loudness of each note',
          'Громкость каждой ноты',
          'Die Lautstärke jeder Note',
        ),
        feedback: text(
          'Dynamics concern loudness. A clef anchors pitch positions, not loudness.',
          'К громкости относятся динамические обозначения. Ключ задаёт высоту позиций, а не громкость.',
          'Dynamische Angaben betreffen die Lautstärke. Ein Schlüssel legt Tonhöhenbezüge fest, keine Lautstärke.',
        ),
      },
    ],
    source: {
      title:
        'Robert Hutchinson · Music Theory for the 21st-Century Classroom · §1.2 Notation',
      url: 'https://musictheory.pugetsound.edu/mt21c/Notation.html',
    },
  },
  {
    topic: 'dots-ties',
    prompt: text(
      'How many quarter-note durations equal one dotted half note?',
      'Скольким четвертям равна половинная нота с точкой?',
      'Wie vielen Viertelnoten entspricht eine punktierte halbe Note?',
    ),
    answer: 'three',
    options: [
      {
        id: 'two',
        label: text('Two', 'Двум', 'Zwei'),
        feedback: text(
          'Two quarters make the undotted half note. Its dot adds one more quarter: three in total.',
          'Две четверти составляют половинную без точки. Точка добавляет ещё четверть: всего три.',
          'Zwei Viertel ergeben die unpunktierte halbe Note. Der Punkt fügt ein Viertel hinzu: insgesamt drei.',
        ),
      },
      {
        id: 'four',
        label: text('Four', 'Четырём', 'Vier'),
        feedback: text(
          'The dot adds half of the original value, rather than doubling it: two quarters plus one is three.',
          'Точка добавляет половину исходной длительности, а не удваивает её: две четверти плюс одна — три.',
          'Der Punkt fügt die Hälfte des ursprünglichen Werts hinzu, statt ihn zu verdoppeln: zwei Viertel plus eines sind drei.',
        ),
      },
      {
        id: 'three',
        label: text('Three', 'Трём', 'Drei'),
        feedback: text(
          'A half note is two quarters. The dot adds half that value, one quarter, giving three quarters.',
          'Половинная равна двум четвертям. Точка добавляет половину этой длительности — одну четверть; получается три четверти.',
          'Eine halbe Note entspricht zwei Vierteln. Der Punkt fügt die Hälfte dieses Werts hinzu, also ein Viertel: insgesamt drei Viertel.',
        ),
      },
    ],
    source: {
      title:
        'Robert Hutchinson · Music Theory for the 21st-Century Classroom · §4.3 Dots and Ties',
      url: 'https://musictheory.pugetsound.edu/mt21c/DotsAndTies.html',
    },
  },
  {
    topic: 'chords',
    prompt: text(
      'When the three tones of a triad are arranged in consecutive thirds, what is the lowest one called?',
      'Как называется нижний звук трезвучия, если его три звука расположены по терциям?',
      'Wie heißt der unterste Ton eines Dreiklangs, wenn seine drei Töne in aufeinanderfolgenden Terzen angeordnet sind?',
    ),
    answer: 'root',
    options: [
      {
        id: 'third',
        label: text('The third', 'Терцовый тон', 'Terzton'),
        feedback: text(
          'The third is the middle chord tone in this arrangement. The lowest is the root.',
          'Терцовый тон здесь находится посередине. Нижний звук — основной тон.',
          'Der Terzton ist in dieser Anordnung der mittlere Akkordton. Der unterste ist der Grundton.',
        ),
      },
      {
        id: 'root',
        label: text('The root', 'Основной тон', 'Grundton'),
        feedback: text(
          'In this arrangement the tones are root, third and fifth from bottom to top. An inversion can put a different chord tone in the bass.',
          'В таком расположении снизу вверх идут основной, терцовый и квинтовый тоны. В обращении в басу может оказаться другой аккордовый звук.',
          'In dieser Anordnung folgen von unten Grundton, Terzton und Quintton. Bei einer Umkehrung kann ein anderer Akkordton im Bass stehen.',
        ),
      },
      {
        id: 'fifth',
        label: text('The fifth', 'Квинтовый тон', 'Quintton'),
        feedback: text(
          'The fifth is the highest chord tone in this arrangement. The lowest is the root.',
          'Квинтовый тон здесь находится сверху. Нижний звук — основной тон.',
          'Der Quintton ist in dieser Anordnung der oberste Akkordton. Der unterste ist der Grundton.',
        ),
      },
    ],
    source: {
      title:
        'Robert Hutchinson · Music Theory for the 21st-Century Classroom · §6.1 Introduction to Triads',
      url: 'https://musictheory.pugetsound.edu/mt21c/TriadsIntroduction.html',
    },
  },
  {
    topic: 'timbre',
    prompt: text(
      'Two periodic sounds have the same fundamental frequency but different relative harmonic strengths. Which property can this help explain?',
      'У двух периодических звуков одинаковая основная частота, но разное соотношение силы гармоник. Различие какого свойства это помогает объяснить?',
      'Zwei periodische Klänge haben dieselbe Grundfrequenz, aber unterschiedliche relative Stärken der Teiltöne. Welche Eigenschaft lässt sich damit erklären?',
    ),
    answer: 'timbre',
    options: [
      {
        id: 'duration',
        label: text(
          'Their written note duration',
          'Их записанную нотную длительность',
          'Ihren notierten Notenwert',
        ),
        feedback: text(
          'Harmonic strengths do not specify a written duration. Their relative balance contributes to timbre.',
          'Сила гармоник не задаёт записанную длительность. Их соотношение влияет на тембр.',
          'Teiltonstärken legen keinen notierten Notenwert fest. Ihr Verhältnis trägt zur Klangfarbe bei.',
        ),
      },
      {
        id: 'clef',
        label: text('Their clef', 'Их нотный ключ', 'Ihren Notenschlüssel'),
        feedback: text(
          'A clef is a notation reference. The balance of harmonic strengths contributes to the sound’s timbre.',
          'Ключ задаёт опору в нотной записи. Соотношение силы гармоник влияет на тембр звука.',
          'Ein Schlüssel ist ein Bezugspunkt der Notation. Das Verhältnis der Teiltonstärken trägt zur Klangfarbe bei.',
        ),
      },
      {
        id: 'timbre',
        label: text('Their timbre', 'Их тембр', 'Ihre Klangfarbe'),
        feedback: text(
          'The relative strengths of harmonics contribute to timbre. Attack, decay and other features can matter too.',
          'Соотношение силы гармоник влияет на тембр. Атака, затухание и другие свойства тоже могут играть роль.',
          'Die relativen Teiltonstärken tragen zur Klangfarbe bei. Auch Einschwingvorgang, Abklingen und weitere Eigenschaften können eine Rolle spielen.',
        ),
      },
    ],
    source: soundSource,
  },
];

/** Unknown/missing answers cannot be mistaken for success; null means an explicit skip. */
export function diagnosticResult(answers: readonly (string | null)[]) {
  if (
    answers.length !== diagnosticQuestions.length ||
    diagnosticQuestions.some(
      (question, i) =>
        answers[i] !== null &&
        !question.options.some((option) => option.id === answers[i]),
    )
  )
    return null;
  const review = diagnosticQuestions
    .filter((question, i) => answers[i] !== question.answer)
    .map((question) => question.topic);
  return { review, recommended: review[0] ?? null };
}
