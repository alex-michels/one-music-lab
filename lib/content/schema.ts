import { z } from 'zod';
import { plainNoteText } from '../note-text';

// Authoring/build validation only. Application modules import these types with
// `import type`; neither Zod nor the validator belongs in the browser bundle.
const text = z
  .string()
  .refine((value) => value.trim().length > 0, 'Empty text');
const id = text.refine(
  (value) => value === value.trim(),
  'ID has surrounding whitespace',
);
const ids = z
  .array(id)
  .refine(
    (items) => new Set(items).size === items.length,
    'Duplicate reference',
  );
const locale = z.enum(['en', 'ru', 'de']);
export const localTextSchema = z
  .strictObject({
    en: text,
    ru: text,
    de: text,
    ruMarkup: text.optional(),
  })
  .refine(
    (value) =>
      value.ruMarkup === undefined ||
      plainNoteText(value.ruMarkup) === value.ru,
    'Russian markup and plain text disagree',
  );
const common = {
  id,
  version: z.number().int().positive(),
  scopeId: id,
  prerequisites: ids,
};
const localized = {
  ...common,
  locales: z.tuple([z.literal('en'), z.literal('ru'), z.literal('de')]),
};
export const scopeSchema = z.strictObject({
  id,
  tradition: text,
  style: text,
  period: text,
  limits: text,
});
export const topicSchema = z.strictObject({
  ...localized,
  kind: z.enum(['sign', 'concept', 'measure', 'tone']),
  module: text.nullable(),
  roadmapIds: ids,
  lessonIds: ids.min(1),
  experimentIds: ids,
  exerciseIds: ids,
  conceptIds: ids,
});
export const lessonSchema = z.strictObject({
  ...localized,
  topicId: id,
  title: localTextSchema,
  category: localTextSchema,
  summary: localTextSchema,
  formula: localTextSchema,
  paragraphs: z.array(localTextSchema).min(1),
  sourceId: id,
  experimentId: id,
  reading: z
    .strictObject({
      pages: text,
      sourceId: id,
      text: localTextSchema,
      assetIds: ids,
    })
    .optional(),
});
export const experimentSchema = z.strictObject({
  ...localized,
  topicId: id,
  instructions: localTextSchema,
  engine: z.literal('sound-lab'),
  preset: z.strictObject({
    hz: z.number().min(20).max(20000),
    wave: z.enum(['sine', 'triangle', 'square', 'sawtooth']),
  }),
  notation: z
    .strictObject({
      note: z.strictObject({
        letter: z.number().int().min(0).max(6),
        accidental: z.number().int().min(-2).max(2),
        octave: z.number().int().min(-1).max(9),
      }),
      group: z.enum([
        'pitch',
        'tempo',
        'durations',
        'ties',
        'division',
        'articulation',
        'repeats',
        'dynamics',
      ]),
    })
    .optional(),
});
const exerciseFields = {
  ...localized,
  topicId: id,
  label: localTextSchema,
  sourceIds: ids.min(1),
};
export const exerciseSchema = z.discriminatedUnion('kind', [
  z.strictObject({
    ...exerciseFields,
    kind: z.literal('generated'),
    generator: z.enum([
      'octave-region',
      'accidental-name',
      'enharmonic',
      'dotted-value',
      'tie-sum',
      'tuplet',
      'read-pitch',
      'clef-transform',
      'accidental-scope',
      'value-identification',
      'beaming-review',
      'ornament-review',
      'performance-marks',
      'short-excerpt',
    ]),
  }),
  z.strictObject({
    ...exerciseFields,
    kind: z.literal('diagnostic'),
    order: z.number().int().nonnegative(),
    answer: id,
    options: z
      .array(
        z.strictObject({
          id,
          label: localTextSchema,
          feedback: localTextSchema,
        }),
      )
      .min(2),
  }),
]);
export const conceptSchema = z.strictObject({
  ...localized,
  topicId: id,
  order: z.number().int().nonnegative(),
  reference: z.boolean(),
  title: localTextSchema,
  body: localTextSchema,
  aliases: localTextSchema.optional(),
  sourceId: id.optional(),
  furtherSourceIds: ids.optional(),
  relatedTopics: ids.optional(),
  forwardModules: ids.optional(),
});
const path = text.regex(
  /^(?![A-Za-z]:)(?!\/)(?!.*(?:^|\/)\.\.?(?:\/|$))[A-Za-z0-9_./-]+$/,
  'Repository-relative path required',
);
export const sourceSchema = z.strictObject({
  ...common,
  locales: z.array(locale).min(1),
  title: text,
  url: z.url({ protocol: /^https?$/ }),
  edition: text.nullable(),
  locator: text.nullable(),
  // This migration preserves citations; it does not certify the claims they support.
  verification: z.literal('inherited-unverified'),
  evidence: z.array(path).min(1),
});
export const assetSchema = z.strictObject({
  ...common,
  locales: z.array(locale),
  path,
  entry: text.optional(),
  kind: z.enum(['notation-figure', 'font-outlines']),
  description: localTextSchema.optional(),
  rights: z
    .array(z.strictObject({ part: text, license: text, evidence: path }))
    .min(1),
});
export const catalogSchema = z.strictObject({
  schemaVersion: z.literal(1),
  scopes: z.array(scopeSchema).min(1),
  topics: z.array(topicSchema).min(1),
  lessons: z.array(lessonSchema).min(1),
  experiments: z.array(experimentSchema),
  exercises: z.array(exerciseSchema),
  concepts: z.array(conceptSchema),
  sources: z.array(sourceSchema).min(1),
  assets: z.array(assetSchema),
});
export type Topic = z.infer<typeof topicSchema>;
export type Lesson = z.infer<typeof lessonSchema>;
export type Experiment = z.infer<typeof experimentSchema>;
export type Exercise = z.infer<typeof exerciseSchema>;
export type Concept = z.infer<typeof conceptSchema>;
export type Source = z.infer<typeof sourceSchema>;
export type Asset = z.infer<typeof assetSchema>;
export type ContentCatalog = z.infer<typeof catalogSchema>;
export type TopicBundle = {
  topic: Topic;
  lesson: Lesson;
  experiment: Experiment;
  exercises: Exercise[];
  concepts: Concept[];
};
