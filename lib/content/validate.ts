import { catalogSchema } from './schema';

/** Reject malformed authoring input and broken edges without executing it. */
export function contentProblems(input: unknown): string[] {
  const parsed = catalogSchema.safeParse(input);
  if (!parsed.success)
    return parsed.error.issues.map(
      (issue) => `${issue.path.join('.')}: ${issue.message}`,
    );
  const catalog = parsed.data;
  const problems: string[] = [];
  const collections = [
    'scopes',
    'topics',
    'lessons',
    'experiments',
    'exercises',
    'concepts',
    'sources',
    'assets',
  ] as const;
  const indexes = Object.fromEntries(
    collections.map((name) => [
      name,
      new Set(catalog[name].map((item) => item.id)),
    ]),
  ) as Record<(typeof collections)[number], Set<string>>;
  const ref = (
    collection: (typeof collections)[number],
    id: string,
    at: string,
  ) => {
    if (!indexes[collection].has(id))
      problems.push(`${at}: unknown ${collection} ID ${id}`);
  };
  for (const name of collections) {
    const seen = new Set<string>();
    for (const item of catalog[name]) {
      if (seen.has(item.id)) problems.push(`${name}: duplicate ID ${item.id}`);
      seen.add(item.id);
      if ('scopeId' in item) {
        ref('scopes', item.scopeId, `${name}.${item.id}.scopeId`);
        for (const prerequisite of item.prerequisites)
          ref('topics', prerequisite, `${name}.${item.id}.prerequisites`);
      }
    }
  }
  const owned = [
    ['lessons', 'lessonIds'],
    ['experiments', 'experimentIds'],
    ['exercises', 'exerciseIds'],
    ['concepts', 'conceptIds'],
  ] as const;
  for (const [collection, field] of owned) {
    for (const topic of catalog.topics) {
      for (const id of topic[field]) {
        ref(collection, id, `topics.${topic.id}.${field}`);
        const item = catalog[collection].find((entry) => entry.id === id);
        if (item && item.topicId !== topic.id)
          problems.push(
            `topics.${topic.id}.${field}: ${id} belongs to ${item.topicId}`,
          );
      }
    }
    for (const item of catalog[collection]) {
      ref('topics', item.topicId, `${collection}.${item.id}.topicId`);
      const owner = catalog.topics.find((topic) => topic.id === item.topicId);
      if (owner && !owner[field].includes(item.id))
        problems.push(
          `${collection}.${item.id}: absent from topic ${item.topicId}.${field}`,
        );
    }
  }
  for (const lesson of catalog.lessons) {
    ref('sources', lesson.sourceId, `lessons.${lesson.id}.sourceId`);
    ref(
      'experiments',
      lesson.experimentId,
      `lessons.${lesson.id}.experimentId`,
    );
    const experiment = catalog.experiments.find(
      (item) => item.id === lesson.experimentId,
    );
    if (experiment && experiment.topicId !== lesson.topicId)
      problems.push(
        `lessons.${lesson.id}: experiment belongs to another topic`,
      );
    if (lesson.reading) {
      ref(
        'sources',
        lesson.reading.sourceId,
        `lessons.${lesson.id}.reading.sourceId`,
      );
      for (const id of lesson.reading.assetIds)
        ref('assets', id, `lessons.${lesson.id}.reading.assetIds`);
    }
  }
  const diagnosticOrders = new Set<number>();
  for (const exercise of catalog.exercises) {
    for (const id of exercise.sourceIds)
      ref('sources', id, `exercises.${exercise.id}.sourceIds`);
    if (exercise.kind === 'diagnostic') {
      if (diagnosticOrders.has(exercise.order))
        problems.push(`exercises.${exercise.id}: duplicate diagnostic order`);
      diagnosticOrders.add(exercise.order);
      const options = exercise.options.map((option) => option.id);
      if (new Set(options).size !== options.length)
        problems.push(`exercises.${exercise.id}: duplicate option ID`);
      if (!options.includes(exercise.answer))
        problems.push(
          `exercises.${exercise.id}: answer is absent from options`,
        );
    }
  }
  const orders = new Set<number>();
  for (const concept of catalog.concepts) {
    if (orders.has(concept.order))
      problems.push(`concepts.${concept.id}: duplicate order ${concept.order}`);
    orders.add(concept.order);
    if (concept.sourceId !== undefined)
      ref('sources', concept.sourceId, `concepts.${concept.id}.sourceId`);
    for (const id of concept.furtherSourceIds ?? [])
      ref('sources', id, `concepts.${concept.id}.furtherSourceIds`);
    for (const id of concept.relatedTopics ?? [])
      ref('topics', id, `concepts.${concept.id}.relatedTopics`);
  }
  // A cycle makes the prerequisite path impossible even when every ID exists.
  const visited = new Set<string>();
  const active = new Set<string>();
  const visit = (id: string) => {
    if (active.has(id)) {
      problems.push(`topics.${id}.prerequisites: cycle`);
      return;
    }
    if (visited.has(id)) return;
    const topic = catalog.topics.find((item) => item.id === id);
    if (!topic) return; // Already reported as a dangling reference above.
    active.add(id);
    for (const prerequisite of topic.prerequisites) visit(prerequisite);
    active.delete(id);
    visited.add(id);
  };
  for (const topic of catalog.topics) visit(topic.id);
  return problems;
}
