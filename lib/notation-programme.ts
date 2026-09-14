export {
  notationContentSources,
  notationTopicSources,
  notationTermSources,
} from './content/references';
export {
  notationProgramme,
  notationFigureDescriptions,
  notationReferences,
} from './content/adapters';
export type { NotationTopic } from './content/ids';

export const notationForwardLinks: Record<string, string> = {
  N03: 'https://github.com/alex-michels/one-music-lab/blob/main/docs/curriculum/notation.md#n03',
  N04: 'https://github.com/alex-michels/one-music-lab/blob/main/docs/curriculum/notation.md#n04',
  N05: 'https://github.com/alex-michels/one-music-lab/blob/main/docs/curriculum/notation.md#n05',
  H04: 'https://github.com/alex-michels/one-music-lab/blob/main/docs/curriculum/harmony.md#h04',
};
