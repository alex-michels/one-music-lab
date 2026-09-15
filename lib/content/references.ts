import sources from './sources';

const byId = Object.fromEntries(sources.map((source) => [source.id, source]));
function resolve<const T extends Record<string, string>>(
  refs: T,
): { [K in keyof T]: { title: string; url: string } } {
  return Object.fromEntries(
    Object.entries(refs).map(([key, id]) => {
      const { title, url } = byId[id];
      return [key, { title, url }];
    }),
  ) as { [K in keyof T]: { title: string; url: string } };
}

export const notationSources = resolve({
  names: 'source-001',
  accidentals: 'source-002',
  terms: 'source-003',
  chant: 'source-004',
  graphic: 'source-005',
  figured: 'source-006',
  tablature: 'source-007',
  curves: 'source-008',
  rhythm: 'source-009',
  tuplets: 'source-010',
  ties: 'source-011',
  marks: 'source-012',
  tempo: 'source-013',
  beams: 'source-014',
  ornaments: 'source-015',
  repeats: 'source-016',
  pitch: 'source-017',
});
export const notationContentSources = resolve({
  rhythm: 'source-018',
  rests: 'source-019',
  durationNames: 'source-020',
  multirests: 'source-021',
  keyboards: 'source-022',
  pitches: 'source-023',
  stems: 'source-024',
  chords: 'source-025',
  grace: 'source-026',
  arpeggio: 'source-027',
  acciaccatura: 'source-028',
  instruments: 'source-029',
  bassoon: 'source-030',
  trombone: 'source-031',
  expression: 'source-032',
  mancando: 'source-033',
  tumultuoso: 'source-034',
  graphicHistory: 'source-035',
  ornamentNames: 'source-036',
  articulation: 'source-037',
  staff: 'source-038',
  names: 'source-039',
  frequencies: 'source-040',
});
export const notationTopicSources = resolve({
  'note-names': 'source-039',
  staff: 'source-038',
  clefs: 'source-023',
  'accidental-signs': 'source-023',
  'accidental-scope': 'source-023',
  enharmonics: 'source-001',
  durations: 'source-018',
  'dots-ties': 'source-018',
  'beat-division': 'source-018',
  tempo: 'source-003',
  dynamics: 'source-012',
  articulation: 'source-037',
  repeats: 'source-016',
});
export const notationTermSources = resolve({
  Stem: 'source-024',
  System: 'source-022',
  Brace: 'source-022',
  Rest: 'source-019',
  'Whole-bar rest': 'source-019',
  'Dotted rest': 'source-019',
  Slur: 'source-008',
  phrasing: 'source-008',
  Beam: 'source-014',
  Grouping: 'source-014',
  portato: 'source-015',
  tenuto: 'source-015',
  staccatissimo: 'source-015',
  'Octave notation': 'source-001',
  'Middle C': 'source-040',
  Semitone: 'source-040',
  'Whole tone': 'source-040',
});
