import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/postcss';

const root = fileURLToPath(new URL('./', import.meta.url));

/**
 * The UI provenance record is the single source of truth for imported code.
 * Copies we changed locally are maintained here, so they belong in the
 * production denominator; untouched copies are reported separately after the
 * provenance review described in docs/ui-provenance.md. Reading the record
 * instead of repeating the file list keeps the two from drifting apart.
 */
const inventory: {
  files: Record<string, { status: 'modified' | 'unchanged' }>;
} = JSON.parse(readFileSync(root + 'docs/ui-provenance.json', 'utf8'));

const importedCopies = Object.entries(inventory.files);
export const modifiedCopies = importedCopies
  .filter(([, record]) => record.status === 'modified')
  .map(([path]) => path)
  .sort();
export const unchangedCopies = importedCopies
  .filter(([, record]) => record.status === 'unchanged')
  .map(([path]) => path)
  .sort();

/**
 * Every executable file we author, including files no test imports yet: an
 * unloaded module must appear in the report at 0%, never disappear from it.
 */
export const authoredProductionCode = [
  'app/**/*.{ts,tsx}',
  'components/learning.tsx',
  'components/experiments.tsx',
  'components/chords-lab.tsx',
  'components/notes-lab.tsx',
  'components/staff.tsx',
  'components/number-field.tsx',
  'hooks/**/*.{ts,tsx}',
  'lib/**/*.{ts,tsx}',
  'next.config.ts',
  'vite.config.ts',
];

/** The engines a release is checked against; real devices are recorded separately. */
export const browserEngines = ['chromium', 'firefox', 'webkit'] as const;
type BrowserEngine = (typeof browserEngines)[number];

/**
 * CI runs every engine and is the authoritative result. A developer machine
 * where one engine cannot launch may narrow the run with
 * `OML_BROWSERS=chromium,webkit`; an unknown name is a mistake, not a filter.
 *
 * The v8 coverage provider supports a single Chromium instance only, so a
 * coverage run measures Chromium and the matrix runs without coverage. Both
 * run in CI, so neither the numbers nor the engines are traded away.
 */
export function selectedEngines(
  value = process.env.OML_BROWSERS,
  measuringCoverage = process.argv.includes('--coverage'),
): BrowserEngine[] {
  const requested = (value ?? '')
    .split(',')
    .map((name) => name.trim())
    .filter(Boolean);
  const unknown = requested.filter(
    (name) => !browserEngines.includes(name as BrowserEngine),
  );
  if (unknown.length > 0)
    throw new Error(
      `OML_BROWSERS lists unknown engines: ${unknown.join(', ')}. Known: ${browserEngines.join(', ')}.`,
    );
  // Every remaining name was just checked against the list above.
  if (requested.length > 0) return requested as BrowserEngine[];
  return measuringCoverage ? ['chromium'] : [...browserEngines];
}

export default defineConfig({
  // Browser component tests use the same generated utilities as the app.
  css: { postcss: { plugins: [tailwindcss()] } },
  test: {
    globals: false,
    // Policy tests start the real linter in a child process; the default
    // five seconds is not enough for several fixtures on a cold cache.
    testTimeout: 60_000,
    projects: [
      {
        extends: true,
        test: {
          name: 'unit',
          // Component files opt into a DOM with a @vitest-environment docblock.
          environment: 'node',
          include: ['tests/*.test.{mjs,ts,tsx}'],
        },
      },
      {
        extends: true,
        // Pre-bundle what the component tests import, so the browser run is
        // not reloaded halfway through by a discovered dependency.
        optimizeDeps: {
          include: ['react', 'react-dom/client', 'react/jsx-dev-runtime'],
        },
        test: {
          name: 'browser',
          include: ['tests/browser/*.test.mjs'],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: selectedEngines().map((browser) => ({ browser })),
          },
        },
      },
    ],
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: 'v8',
      // Everything matched here is reported, loaded by a test or not.
      include: [...authoredProductionCode, ...modifiedCopies],
      // Untouched imported copies are a separate category, not an exemption
      // for anything we wrote or changed. Test files and the test
      // configuration are not production code.
      exclude: [...unchangedCopies, 'tests/**', 'vitest.config.ts'],
      reporter: ['text', 'json-summary', 'lcov'],
      reportsDirectory: 'outputs/coverage',
      reportOnFailure: true,
    },
  },
  resolve: { alias: { '@': root.replace(/\/$/, '') } },
});
