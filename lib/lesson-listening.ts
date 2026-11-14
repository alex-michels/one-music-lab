import { localizedText as text, type LocalText } from './i18n';
import { frequencyForMidi, type Tuning, type Wave } from './music';
import {
  notationExamples,
  planNotationExample,
  type NotationExampleId,
} from './notation-experiments';
import type { TopicId } from './content/ids';

/**
 * What a lesson lets the reader hear without leaving the page.
 *
 * Each list is the lesson's own experiment, cut into the sounds its instruction
 * names: «Play 220 Hz, then double it to 440 Hz» becomes two buttons and the
 * pair. Nothing here states a new fact about music; a label names what sounds,
 * and the explanation stays in the lesson and its sources.
 *
 * Lesson examples always sound in twelve-tone equal temperament at A4 = 440 Hz,
 * whatever the laboratory is currently set to, so that «220 Hz» is 220 Hz for
 * every reader. The tuning lesson is the one place a step names another tuning,
 * because comparing them is its subject. The lab itself keeps the reader's own
 * reference pitch and tuning.
 */
export type ListenStep =
  | {
      label: LocalText;
      /** MIDI note numbers; 69 is A4. */
      midis: readonly number[];
      /** Sounded as one chord rather than one after another. */
      together?: boolean;
      wave?: Wave;
      tuning?: Tuning;
    }
  | {
      label: LocalText;
      /** One of the Notes lab's bounded rhythm and performance examples. */
      example: NotationExampleId;
      tempo: 60 | 120;
    };

/** Inputs for `AudioEngine.preview`, plus how long the whole example lasts. */
export type ListenPlan = {
  frequencies: number[];
  wave: Wave;
  /** Seconds each tone sounds. */
  duration: number;
  /** Seconds between attacks; 0 sounds every tone at once. */
  spacing: number;
  /** A factor on the reader's own volume, never above 1. */
  gain: number;
  /** Seconds from the first attack to the end of the last tone. */
  total: number;
};

export const LESSON_REFERENCE = 440;
/** The longest example a lesson may start; the engine stops each voice itself. */
export const MAX_LISTEN_SECONDS = 10;

const SEQUENCE = { duration: 0.6, spacing: 0.65 };
const HELD = 1.5;

/** No audio and no timers: only the numbers the engine and the caption need. */
export function planListenStep(step: ListenStep): ListenPlan {
  if ('example' in step) {
    const plan = planNotationExample(step.example, step.tempo);
    return {
      frequencies: plan.midis.map((midi) =>
        frequencyForMidi(midi, LESSON_REFERENCE, 'equal'),
      ),
      wave: 'triangle',
      duration: plan.duration,
      spacing: plan.spacing,
      gain: plan.gain,
      total: plan.spacing * (plan.midis.length - 1) + plan.duration,
    };
  }
  const frequencies = step.midis.map((midi) =>
    frequencyForMidi(midi, LESSON_REFERENCE, step.tuning ?? 'equal'),
  );
  const sequence = !step.together && frequencies.length > 1;
  const duration = sequence ? SEQUENCE.duration : HELD;
  const spacing = sequence ? SEQUENCE.spacing : 0;
  return {
    frequencies,
    wave: step.wave ?? 'triangle',
    duration,
    spacing,
    gain: 1,
    total: spacing * (frequencies.length - 1) + duration,
  };
}

const example = (
  id: NotationExampleId,
  tempo: 60 | 120,
  suffix = '',
): ListenStep => {
  const label = notationExamples[id].label;
  return {
    label: {
      en: label.en + suffix,
      ru: label.ru + suffix,
      de: label.de + suffix,
    },
    example: id,
    tempo,
  };
};

const C_MAJOR = [60, 62, 64, 65, 67, 69, 71, 72];
const C_DORIAN = [60, 62, 63, 65, 67, 69, 70, 72];

export const lessonListening: Record<TopicId, readonly ListenStep[]> = {
  sound: [
    { label: text('220 Hz', '220 Гц', '220 Hz'), midis: [57], wave: 'sine' },
    { label: text('440 Hz', '440 Гц', '440 Hz'), midis: [69], wave: 'sine' },
    {
      label: text(
        '220 Hz, then 440 Hz',
        '220 Гц, затем 440 Гц',
        '220 Hz, dann 440 Hz',
      ),
      midis: [57, 69],
      wave: 'sine',
    },
  ],
  tuning: [
    {
      label: text(
        'A4 with C♯5 · equal temperament',
        '[[ля]] первой и [[до-диез]] второй октавы · равномерная темперация',
        'a′ mit cis″ · gleichstufige Stimmung',
      ),
      midis: [69, 73],
      together: true,
    },
    {
      label: text(
        'A4 with C♯5 · just intonation',
        '[[ля]] первой и [[до-диез]] второй октавы · чистый строй',
        'a′ mit cis″ · reine Stimmung',
      ),
      midis: [69, 73],
      together: true,
      tuning: 'just',
    },
    {
      label: text(
        'A4 with C♯5 · Pythagorean tuning',
        '[[ля]] первой и [[до-диез]] второй октавы · пифагоров строй',
        'a′ mit cis″ · pythagoreische Stimmung',
      ),
      midis: [69, 73],
      together: true,
      tuning: 'pythagorean',
    },
  ],
  intervals: [
    {
      label: text(
        'Minor third · 3 semitones',
        'Малая терция · 3 полутона',
        'Kleine Terz · 3 Halbtöne',
      ),
      midis: [60, 63],
    },
    {
      label: text(
        'Major third · 4 semitones',
        'Большая терция · 4 полутона',
        'Große Terz · 4 Halbtöne',
      ),
      midis: [60, 64],
    },
    {
      label: text(
        'Perfect fifth · 7 semitones',
        'Чистая квинта · 7 полутонов',
        'Reine Quinte · 7 Halbtöne',
      ),
      midis: [60, 67],
    },
  ],
  timbre: [
    {
      label: text('Sine', 'Синусоидальная', 'Sinus'),
      midis: [69],
      wave: 'sine',
    },
    {
      label: text('Triangle', 'Треугольная', 'Dreieck'),
      midis: [69],
      wave: 'triangle',
    },
    {
      label: text('Square', 'Прямоугольная', 'Rechteck'),
      midis: [69],
      wave: 'square',
    },
    {
      label: text('Sawtooth', 'Пилообразная', 'Sägezahn'),
      midis: [69],
      wave: 'sawtooth',
    },
  ],
  scales: [
    { label: text('C major', '[[До]] мажор', 'C-Dur'), midis: C_MAJOR },
    {
      label: text('C Dorian', 'Дорийский лад от [[до]]', 'Dorisch auf C'),
      midis: C_DORIAN,
    },
  ],
  chords: [
    {
      label: text(
        'Major triad, note by note',
        'Мажорное трезвучие, по одному звуку',
        'Durdreiklang, Ton für Ton',
      ),
      midis: [60, 64, 67],
    },
    {
      label: text(
        'Major triad, together',
        'Мажорное трезвучие, одновременно',
        'Durdreiklang, zusammen',
      ),
      midis: [60, 64, 67],
      together: true,
    },
    {
      label: text(
        'Minor triad, note by note',
        'Минорное трезвучие, по одному звуку',
        'Molldreiklang, Ton für Ton',
      ),
      midis: [60, 63, 67],
    },
    {
      label: text(
        'Minor triad, together',
        'Минорное трезвучие, одновременно',
        'Molldreiklang, zusammen',
      ),
      midis: [60, 63, 67],
      together: true,
    },
  ],
  'note-names': [
    {
      label: text(
        'C4 up to C5, note by note',
        'От [[до]] первой октавы до [[до]] второй, по одной ноте',
        'Von c′ bis c″, Ton für Ton',
      ),
      midis: C_MAJOR,
    },
  ],
  staff: [example('successive', 60), example('together', 60)],
  clefs: [
    {
      label: text('G4', '[[соль]] первой октавы', 'g′'),
      midis: [67],
    },
    {
      label: text('F3', '[[фа]] малой октавы', 'kleines f'),
      midis: [53],
    },
    {
      label: text(
        'G4, then F3',
        '[[соль]] первой октавы, затем [[фа]] малой',
        'g′, dann kleines f',
      ),
      midis: [67, 53],
    },
  ],
  'accidental-signs': [
    {
      label: text(
        'C4, then C♯4',
        '[[до]] первой октавы, затем [[до-диез]]',
        'c′, dann cis′',
      ),
      midis: [60, 61],
    },
    {
      label: text(
        'C4, then D4',
        '[[до]] первой октавы, затем [[ре]]',
        'c′, dann d′',
      ),
      midis: [60, 62],
    },
  ],
  'accidental-scope': [
    {
      label: text(
        'B4, then B♭4',
        '[[си]] первой октавы, затем [[си-бемоль]]',
        'h′, dann b′',
      ),
      midis: [71, 70],
    },
    {
      label: text(
        'B3, then B♭3',
        '[[си]] малой октавы, затем [[си-бемоль]]',
        'kleines h, dann kleines b',
      ),
      midis: [59, 58],
    },
  ],
  enharmonics: [
    {
      label: text(
        'F♯4, the same key as G♭4',
        '[[фа-диез]] первой октавы — та же клавиша, что [[соль-бемоль]]',
        'fis′, dieselbe Taste wie ges′',
      ),
      midis: [66],
    },
  ],
  durations: [
    example('whole', 60),
    example('halves', 60),
    example('quarters', 60),
  ],
  'dots-ties': [example('untied', 60), example('tied', 60)],
  'beat-division': [example('eighths', 60), example('triplets', 60)],
  tempo: [
    example('pulse', 60, ' · ♩ = 60'),
    example('pulse', 120, ' · ♩ = 120'),
  ],
  dynamics: [example('soft', 60), example('strong', 60)],
  articulation: [example('sustained', 60), example('detached', 60)],
  repeats: [
    example('figure', 120),
    example('repeated', 120),
    example('ending', 120),
  ],
};

/**
 * Whether a lesson's own buttons name a tuning other than equal temperament.
 * The caption under the buttons says what the examples are tuned to, and it
 * must not say «equal temperament» under a button labelled «just intonation».
 * Read from the data, so it stays true if another lesson gains a tuned step.
 */
export function namesOwnTuning(topic: TopicId): boolean {
  return lessonListening[topic].some(
    (step) =>
      'tuning' in step && step.tuning !== undefined && step.tuning !== 'equal',
  );
}
