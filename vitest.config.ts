import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

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
  'components/number-field.tsx',
  'hooks/**/*.{ts,tsx}',
  'lib/**/*.{ts,tsx}',
  'next.config.ts',
  'vite.config.ts',
];

export default defineConfig({
  test: {
    include: ['tests/**/*.test.{mjs,ts,tsx}'],
    environment: 'node',
    globals: false,
    // Policy tests start the real linter in a child process; the default
    // five seconds is not enough for several fixtures on a cold cache.
    testTimeout: 60_000,
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
