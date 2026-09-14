import type { ContentCatalog } from './schema';
import sources from './sources';
import assets from './assets';
import topic0 from './topics/sound';
import topic1 from './topics/tuning';
import topic2 from './topics/intervals';
import topic3 from './topics/timbre';
import topic4 from './topics/scales';
import topic5 from './topics/chords';
import topic6 from './topics/note-names';
import topic7 from './topics/staff';
import topic8 from './topics/clefs';
import topic9 from './topics/accidental-signs';
import topic10 from './topics/accidental-scope';
import topic11 from './topics/enharmonics';
import topic12 from './topics/durations';
import topic13 from './topics/dots-ties';
import topic14 from './topics/beat-division';
import topic15 from './topics/tempo';
import topic16 from './topics/dynamics';
import topic17 from './topics/articulation';
import topic18 from './topics/repeats';

export const bundles = [
  topic0,
  topic1,
  topic2,
  topic3,
  topic4,
  topic5,
  topic6,
  topic7,
  topic8,
  topic9,
  topic10,
  topic11,
  topic12,
  topic13,
  topic14,
  topic15,
  topic16,
  topic17,
  topic18,
];
export const contentCatalog: ContentCatalog = {
  schemaVersion: 1,
  scopes: [
    {
      id: 'acoustics',
      tradition: 'Physical acoustics',
      style: 'Periodic tones and introductory instrument timbre',
      period: 'Contemporary pedagogical examples',
      limits:
        'Physical descriptions do not define universal musical value or tuning.',
    },
    {
      id: 'western-notation',
      tradition: 'Western staff notation and the named EN/RU/DE pitch systems',
      style:
        'Introductory tonal examples; tuning assumptions are stated in the lesson or experiment',
      period: 'Modern teaching of common-practice notation',
      limits:
        '12-TET playback and common-practice examples are scoped models, not universal musical correctness. Historical, graphic and other systems retain their stated context.',
    },
    {
      id: 'reference-context',
      tradition: 'As identified by the cited work',
      style: 'Source-specific; no universal authority implied',
      period:
        'Edition and locator recorded when inherited from the existing citation',
      limits:
        'Migration preserves references, including incomplete legacy citations. Claim-level verification and release readiness require separate review.',
    },
  ],
  topics: bundles.map((b) => b.topic),
  lessons: bundles.map((b) => b.lesson),
  experiments: bundles.map((b) => b.experiment),
  exercises: bundles.flatMap((b) => b.exercises),
  concepts: bundles
    .flatMap((b) => b.concepts)
    .sort((a, b) => a.order - b.order),
  sources,
  assets,
};
