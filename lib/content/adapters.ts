import { contentCatalog } from './catalog';
import { NOTATION_TOPIC_IDS, type NotationTopic, type TopicId } from './ids';
import type { LocalText } from '../i18n';
import type { ExerciseKind, Rule } from '../exercises';
import type { Concept, Lesson } from './schema';
import type { NotesLabState } from '../notation-experiments';

const sources = Object.fromEntries(
  contentCatalog.sources.map((source) => [source.id, source]),
);
const experiments = Object.fromEntries(
  contentCatalog.experiments.map((experiment) => [experiment.id, experiment]),
);
const topicRecords = Object.fromEntries(
  contentCatalog.topics.map((topic) => [topic.id, topic]),
);
const lessonRecords = Object.fromEntries(
  contentCatalog.lessons.map((lesson) => [lesson.id, lesson]),
);
const assets = Object.fromEntries(
  contentCatalog.assets.map((asset) => [asset.id, asset]),
);
const citation = (id: string) => ({
  title: sources[id].title,
  url: sources[id].url,
});

/** Existing public view models keep their routes, property presence and text. */
export const lessons = contentCatalog.lessons.map((lesson) => ({
  id: lesson.id,
  title: lesson.title,
  category: lesson.category,
  summary: lesson.summary,
  formula: lesson.formula,
  paragraphs: lesson.paragraphs,
  experiment: experiments[lesson.experimentId].instructions,
  ...experiments[lesson.experimentId].preset,
  source: sources[lesson.sourceId].url,
}));

export function termView(concept: Concept) {
  return {
    id: concept.id,
    title: concept.title,
    body: concept.body,
    lesson: concept.topicId,
    ...(concept.aliases === undefined ? {} : { aliases: concept.aliases }),
    ...(concept.sourceId === undefined
      ? {}
      : { source: citation(concept.sourceId) }),
    ...(concept.furtherSourceIds === undefined
      ? {}
      : { furtherSources: concept.furtherSourceIds.map(citation) }),
    ...(concept.relatedTopics === undefined
      ? {}
      : { relatedTopics: concept.relatedTopics }),
    ...(concept.forwardModules === undefined
      ? {}
      : { forwardModules: concept.forwardModules }),
  };
}
export const terms = contentCatalog.concepts.map(termView);
export const notationReferences = contentCatalog.concepts
  .filter((concept) => concept.reference)
  .map(termView);

// Membership and required reading/presets are checked before either build.
export const notationProgramme = Object.fromEntries(
  NOTATION_TOPIC_IDS.map((id) => {
    const reading = lessonRecords[id].reading as NonNullable<Lesson['reading']>;
    const topic = topicRecords[id];
    return [
      id,
      {
        tasks: topic.roadmapIds,
        module: topic.module as string,
        pages: reading.pages,
        source: citation(reading.sourceId),
        text: reading.text,
        figures: reading.assetIds.map(
          (assetId) => assets[assetId].entry as string,
        ),
      },
    ];
  }),
) as Record<
  NotationTopic,
  {
    tasks: string[];
    module: string;
    pages: string;
    source: { title: string; url: string };
    text: LocalText;
    figures: string[];
  }
>;

export const notationFigureDescriptions: Record<string, LocalText> =
  Object.fromEntries(
    contentCatalog.assets
      .filter((asset) => asset.description !== undefined)
      .map((asset) => [asset.entry, asset.description as LocalText]),
  );
export const notationLessonPresets = Object.fromEntries(
  contentCatalog.experiments
    .filter((experiment) => experiment.notation !== undefined)
    .map((experiment) => [experiment.topicId, experiment.notation]),
) as Record<string, Pick<NotesLabState, 'note' | 'group'> | undefined>;

const generatedExercises = contentCatalog.exercises.filter(
  (exercise) => exercise.kind === 'generated',
);
export const ruleTopic = Object.fromEntries(
  generatedExercises.map((exercise) => [exercise.id, exercise.topicId]),
) as Record<Rule, TopicId>;
export const ruleLabels = Object.fromEntries(
  generatedExercises.map((exercise) => [exercise.id, exercise.label]),
) as Record<Rule, LocalText>;
export const ruleKind = Object.fromEntries(
  generatedExercises.map((exercise) => [exercise.id, exercise.generator]),
) as Record<Rule, ExerciseKind>;
export const diagnosticQuestions = contentCatalog.exercises
  .filter((exercise) => exercise.kind === 'diagnostic')
  .sort((a, b) => a.order - b.order)
  .map((exercise) => ({
    topic: exercise.topicId as TopicId,
    prompt: exercise.label,
    answer: exercise.answer,
    options: exercise.options,
    source: citation(exercise.sourceIds[0]),
  }));
