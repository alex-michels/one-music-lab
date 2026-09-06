import { german } from './german';
import type { SpelledScale } from './notation';

// Degree positions, not chromatic aliases, determine each note's letter.
// The descending melodic form uses natural minor in classical scale practice.
// Formulas and source sections: docs/music-notation.md.
export const scales: SpelledScale[] = [
  {
    de: german['Major'],
    en: 'Major',
    ru: 'Мажор',
    title: {
      de: german['{tonic} major'],
      en: '{tonic} major',
      ru: '{tonic} мажор',
    },
    steps: [0, 2, 4, 5, 7, 9, 11, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    de: german['Natural minor'],
    en: 'Natural minor',
    ru: 'Натуральный минор',
    title: {
      de: german['{tonic} minor — natural'],
      en: '{tonic} minor — natural',
      ru: '{tonic} минор — натуральный',
    },
    steps: [0, 2, 3, 5, 7, 8, 10, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    de: german['Harmonic minor'],
    en: 'Harmonic minor',
    ru: 'Гармонический минор',
    title: {
      de: german['{tonic} minor — harmonic'],
      en: '{tonic} minor — harmonic',
      ru: '{tonic} минор — гармонический',
    },
    steps: [0, 2, 3, 5, 7, 8, 11, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    de: german['Melodic minor (ascending)'],
    en: 'Melodic minor (ascending)',
    ru: 'Мелодический минор (вверх)',
    title: {
      de: german['{tonic} minor — melodic (ascending)'],
      en: '{tonic} minor — melodic (ascending)',
      ru: '{tonic} минор — мелодический (вверх)',
    },
    steps: [0, 2, 3, 5, 7, 9, 11, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    de: german['Melodic minor (descending)'],
    en: 'Melodic minor (descending)',
    ru: 'Мелодический минор (вниз)',
    title: {
      de: german['{tonic} minor — melodic (descending)'],
      en: '{tonic} minor — melodic (descending)',
      ru: '{tonic} минор — мелодический (вниз)',
    },
    steps: [12, 10, 8, 7, 5, 3, 2, 0],
    degrees: [7, 6, 5, 4, 3, 2, 1, 0],
  },
  {
    de: german['Dorian'],
    en: 'Dorian',
    ru: 'Дорийский лад',
    title: {
      de: german['{tonic} Dorian'],
      en: '{tonic} Dorian',
      ru: 'Дорийский лад от {tonic}',
    },
    steps: [0, 2, 3, 5, 7, 9, 10, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    de: german['Mixolydian'],
    en: 'Mixolydian',
    ru: 'Миксолидийский лад',
    title: {
      de: german['{tonic} Mixolydian'],
      en: '{tonic} Mixolydian',
      ru: 'Миксолидийский лад от {tonic}',
    },
    steps: [0, 2, 4, 5, 7, 9, 10, 12],
    degrees: [0, 1, 2, 3, 4, 5, 6, 7],
  },
  {
    de: german['Major pentatonic'],
    en: 'Major pentatonic',
    ru: 'Мажорная пентатоника',
    title: {
      de: german['{tonic} major pentatonic'],
      en: '{tonic} major pentatonic',
      ru: 'Мажорная пентатоника от {tonic}',
    },
    steps: [0, 2, 4, 7, 9, 12],
    degrees: [0, 1, 2, 4, 5, 7],
  },
  {
    de: german['Minor pentatonic'],
    en: 'Minor pentatonic',
    ru: 'Минорная пентатоника',
    title: {
      de: german['{tonic} minor pentatonic'],
      en: '{tonic} minor pentatonic',
      ru: 'Минорная пентатоника от {tonic}',
    },
    steps: [0, 3, 5, 7, 10, 12],
    degrees: [0, 2, 3, 4, 6, 7],
  },
  {
    de: german['Blues (12-TET)'],
    en: 'Blues (12-TET)',
    ru: 'Блюзовая гамма (12-TET)',
    title: {
      de: german['{tonic} blues (12-TET)'],
      en: '{tonic} blues (12-TET)',
      ru: 'Блюзовая гамма от {tonic} (12-TET)',
    },
    // This exercise chooses the lowered fifth (other blues spellings exist).
    steps: [0, 3, 5, 6, 7, 10, 12],
    degrees: [0, 2, 3, 4, 4, 6, 7],
  },
];
