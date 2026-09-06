import type { SpelledScale } from './notation';

// Degree positions, not chromatic aliases, determine each note's letter.
// The descending melodic form uses natural minor in classical scale practice.
// Formulas and source sections: docs/music-notation.md.
export const scales: SpelledScale[] = [
  {
    en: 'Major',
    ru: 'Мажор',
    title: { en: '{tonic} major', ru: '{tonic} мажор' },
    steps: [0, 2, 4, 5, 7, 9, 11, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    en: 'Natural minor',
    ru: 'Натуральный минор',
    title: { en: '{tonic} minor — natural', ru: '{tonic} минор — натуральный' },
    steps: [0, 2, 3, 5, 7, 8, 10, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    en: 'Harmonic minor',
    ru: 'Гармонический минор',
    title: {
      en: '{tonic} minor — harmonic',
      ru: '{tonic} минор — гармонический',
    },
    steps: [0, 2, 3, 5, 7, 8, 11, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    en: 'Melodic minor (ascending)',
    ru: 'Мелодический минор (вверх)',
    title: {
      en: '{tonic} minor — melodic (ascending)',
      ru: '{tonic} минор — мелодический (вверх)',
    },
    steps: [0, 2, 3, 5, 7, 9, 11, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    en: 'Melodic minor (descending)',
    ru: 'Мелодический минор (вниз)',
    title: {
      en: '{tonic} minor — melodic (descending)',
      ru: '{tonic} минор — мелодический (вниз)',
    },
    steps: [12, 10, 8, 7, 5, 3, 2, 0],
    degrees: [7, 6, 5, 4, 3, 2, 1, 0],
  },
  {
    en: 'Dorian',
    ru: 'Дорийский лад',
    title: { en: '{tonic} Dorian', ru: 'Дорийский лад от {tonic}' },
    steps: [0, 2, 3, 5, 7, 9, 10, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    en: 'Mixolydian',
    ru: 'Миксолидийский лад',
    title: { en: '{tonic} Mixolydian', ru: 'Миксолидийский лад от {tonic}' },
    steps: [0, 2, 4, 5, 7, 9, 10, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    en: 'Major pentatonic',
    ru: 'Мажорная пентатоника',
    title: {
      en: '{tonic} major pentatonic',
      ru: 'Мажорная пентатоника от {tonic}',
    },
    steps: [0, 2, 4, 7, 9, 12],
    degrees: [0, 1, 2, 4, 5, 7],
  },
  {
    en: 'Minor pentatonic',
    ru: 'Минорная пентатоника',
    title: {
      en: '{tonic} minor pentatonic',
      ru: 'Минорная пентатоника от {tonic}',
    },
    steps: [0, 3, 5, 7, 10, 12],
    degrees: [0, 2, 3, 4, 6, 7],
  },
  {
    en: 'Blues (12-TET)',
    ru: 'Блюзовая гамма (12-TET)',
    title: {
      en: '{tonic} blues (12-TET)',
      ru: 'Блюзовая гамма от {tonic} (12-TET)',
    },
    // This exercise chooses the lowered fifth (other blues spellings exist).
    steps: [0, 3, 5, 6, 7, 10, 12],
    degrees: [0, 2, 3, 4, 4, 6, 7],
  },
];
