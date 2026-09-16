import { afterAll, beforeEach } from 'vitest';
// Origins outlive Vitest's file iframes. A saved route/settings from one suite
// must not become the starting state of an unrelated suite.
localStorage.removeItem('oml-profile');
let first = true;
beforeEach(async () => {
  // First tests may seed legacy preferences before the store's first read.
  // Later tests get a fresh workspace; remounts within one test still exercise
  // persistence. The old labs implicitly got defaults from useState on mount.
  if (first) first = false;
  else if (localStorage.getItem('oml-profile') !== null) {
    const { emptyProfile, profileStore } =
      await import('../../lib/local-profile.ts');
    profileStore.replace(emptyProfile());
  }
});
afterAll(() => localStorage.removeItem('oml-profile'));
