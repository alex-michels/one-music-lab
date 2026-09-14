/** Permanent route identities; append new IDs, never derive them from titles. */
export const TOPIC_IDS = [
  'sound',
  'tuning',
  'intervals',
  'timbre',
  'scales',
  'chords',
  'note-names',
  'staff',
  'clefs',
  'accidental-signs',
  'accidental-scope',
  'enharmonics',
  'durations',
  'dots-ties',
  'beat-division',
  'tempo',
  'dynamics',
  'articulation',
  'repeats',
] as const;
export type TopicId = (typeof TOPIC_IDS)[number];
export const NOTATION_TOPIC_IDS = [
  'note-names',
  'staff',
  'clefs',
  'accidental-signs',
  'accidental-scope',
  'enharmonics',
  'durations',
  'dots-ties',
  'beat-division',
  'tempo',
  'dynamics',
  'articulation',
  'repeats',
] as const;
export type NotationTopic = (typeof NOTATION_TOPIC_IDS)[number];
