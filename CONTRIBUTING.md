# Contributing to One Music Lab

One Music Lab connects theory, experimentation, practice, and an encyclopedia
in English, Russian and German. Start with [ROADMAP.md](ROADMAP.md), choose one small
unfinished outcome, and explain its scope in a pull request. Large regional or
historical topics must first be split into named, reviewable releases.

## Local workflow

Follow the [README](README.md) to install Node 24 and run `npm ci`. Create a branch
from current `main`, make a bounded change, and open a PR back to `main`. The owner
reviews/merges and controls deployment. Do not commit generated build output,
recordings containing private data, credentials, `node_modules`, or `.env` files.

Every code change includes automated tests and documentation in the same PR.
For a bug fix, demonstrate the regression with a test that fails before the fix.
Tests should assert meaningful behavior: valid/invalid musical inputs, boundary
conditions, cancellation, state transitions, and outcomes users can observe.
Infrastructure and migration changes also need automated validation and, where
appropriate, a tested dry run or rollback. Documentation-only changes need link,
structure, and factual review; avoid artificial tests for prose wording.

### Localized music notation

User-visible pitch and scale names must follow the active locale's professional
standard. English uses letter names with accidentals and scientific octaves;
Russian uses note names such as `до`, `ми-бемоль`, and `си-диез`, with Russian
octave names; German uses `C-Dur`/`c-Moll`, H for English B, B for English
B-flat, and classical octave labels such as `a′`. Scale cards must preserve
diatonic degree
letters (for example, C minor is C–D–E♭–F–G–A♭–B♭) instead of choosing a
chromatic alias from the keyboard. In Russian, the rule currently binds the
“A little
experiment” lab; the keyboard and the ear-training panels still show English
scientific pitch in the Russian interface, which ROADMAP P05 records as open. Keep the scope and sources in
[music-notation.md](docs/music-notation.md), and add regression tests when a
scale, locale, or notation rule changes.

The Chords lab also follows this rule. Its letter chord symbols use explicitly
identified international lead-sheet notation beside localized pitch names and
chord-type explanations. Preserve degree spelling when transposing and distinguish
chord quality from harmonic function. Its sources, audio bounds and supported
model are recorded in [chords-lab.md](docs/chords-lab.md).

German applies across all shipped website content, including the keyboard,
practice feedback and chord-symbol roots/basses (`Hm7`, `B7`). Use
`translator`/`localText` from `lib/i18n.ts` and add the German source-key entry
in `lib/german.ts`; missing translations must fail typecheck. Localize formulas,
errors and accessible labels too. Original foreign bibliographic titles and
deliberately shown term equivalents may retain their language. Verify primary
sources and record exact sections in
[german-localization.md](docs/german-localization.md). English *parallel minor*
is not German *Mollparallele*. New content requires EN/RU/DE parity; historical
EN/RU roadmap wording is a minimum, not an exemption.

Counted nouns go through `lib/plural.ts` rather than a literal string. Russian
chooses one of three forms from the last digits of the number, so `2 полутонов`
and `4 долей` are both wrong where the helper writes `2 полутона` and `4 доли`.
Add a new counter to that file's `nouns` table with a test rather than
inlining a genitive plural.

An analytical label must state what proves it. The Chords lab marks a chord
`V/x` only when its quality differs from the scale's own triad on that degree
**and** the next chord's root is a fifth below, and it shows nothing where it
cannot demonstrate both. Prefer a description the model can defend over a
classification it cannot, and record the cases a rule deliberately declines.

Run:

```sh
npm test
npm run test:browser
npm run test:coverage
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Tests run on Vitest, which loads TSX and the `@/` alias the same way the
application build does. Node-environment suites cover libraries, configuration
and policy; a file starting with `/** @vitest-environment jsdom */` gets a real
DOM for component tests, so a component can be driven through focus, typing,
keyboard and rerenders instead of being snapshotted.

`test:coverage` measures the denominator recorded in `vitest.config.ts`: all
authored production code, including files no test imports yet, plus the
imported copies changed locally. Untouched imported copies are reported
separately, as [ui-provenance](docs/ui-provenance.md) describes. Nothing is
excluded to improve a number, and `tests/coverage-boundary.test.mjs` fails if a
new authored file is left out of the denominator. Instrumentation is not
coverage: every authored file is now measured, but most are still at 0%.

On Windows the very first `npm test` after `npm ci` can fail with
"Timeout waiting for worker to respond" while the DOM suite starts: the
runner allows sixty seconds for a worker, which a cold cache on a freshly
installed tree can exceed. The limit is fixed in the runner, so run the
command again; a warm run takes about twenty seconds.

`npm run test:browser` runs the suites under `tests/browser/` in real
Chromium, Firefox and WebKit through Playwright; install the engines once with
`npx playwright install`. Audio is verified by rendering the real graph with
`OfflineAudioContext` and measuring the samples, never by asserting that a
mocked context was called. If one engine cannot start on your machine, narrow
the run with `OML_BROWSERS=chromium,webkit`; CI runs all three and is the
result that counts. Playwright's WebKit has no Web Audio at all, so the audio
suite reports as skipped there rather than pretending to pass, and real Safari
and mobile checks remain open device work in P00.

Three measurement limits are known. The v8 coverage provider supports a single
Chromium instance, so `test:coverage` measures Chromium and the matrix run
covers the other engines; both run in CI. `vite.config.ts` cannot be instrumented,
because Vitest loads the project's own Vite configuration outside the
instrumented module graph; its behaviour is asserted directly in
`tests/vite-config.test.mjs` instead. The artifact and HTTP suites
(`test:site`, `test:private`, `test:static`) check a built artifact rather than
source, so they stay on Node's runner and outside the source denominator.

The 24 lint errors found by the audit are fixed; uncovered UI, audio and
browser paths are still tracked in P00. Do not describe this as
release-certified.

The target is **100% meaningful statements, branches, functions, and lines** for
all first-party production code, including initially unimported files. Add a
proper include-all instrumenter and component/browser suites under P00. Do not
lower thresholds, exclude changed files, or suppress lint to obtain a green badge.
If a path genuinely cannot be tested, explain the technical reason, mitigation,
owner, and follow-up issue; the reviewer decides whether it blocks publication.
Coverage numbers do not replace input diversity, assertions, mutation testing of
critical algorithms, actual listening, or subject-matter review.

The Baseline checks workflow runs lint and the formatting check as required
steps; run `npm run format` before review. It is sufficient to
reproduce the audit baseline, not to approve production code or close G. Make
the complete coverage/browser checks mandatory once P00 is resolved. New changes
must not add lint errors, untested behavior, or unexplained failures.

## Educational contributions

Use the permanent task number from [ROADMAP.md](ROADMAP.md) in assignments and
PRs. Keep its checkbox as the only completion status; store requirements and
evidence in the linked subject document. The [roadmap guide](docs/roadmap-guide.md)
preserves all original topic and module IDs, including P00–P10. Never renumber
existing tasks when regrouping them or reuse a number; append the next unused
number for new work. Documentation checks protect the topic inventory, links,
dependencies and separation of readiness from publication.

Each topic needs all four layers and the complete [G criteria](docs/release-criteria.md).
Attach evidence for learning objectives, sources, exercise feedback, EN/RU/DE parity,
lab presets, encyclopedia cross-links, accessibility, tests, and rights. A shared
experiment or concept may support multiple topics, but each topic must demonstrate
its own learning outcome. Do not close an ID merely because a page exists.

Source records must include author, title, edition/year, publisher/institution,
DOI/ISBN/URL, exact page/section/timecode, access date, context, and reviewer. Read
the material itself. Distinguish physical models, perception, stylistic rules,
historical evidence, and contested interpretations. Unavailable sources stay
pending. Cultural or clinical claims require appropriate expert review. Record
corrections transparently and reopen a completed topic if evidence changes.

For practical composition, analysis, history, and cultural discussion, support
multiple justified answers with transparent rubrics. Automated checks should
explain the selected model's constraints; they must not label a tradition or
creative choice universally wrong. Do not claim special health effects of tuning.

## Licensing and provenance

By submitting a contribution, you confirm you have the right to contribute it
under the applicable repository license: Apache-2.0 for original code and CC BY
4.0 for original teaching content. Copyright remains with contributors. Identify
any exceptions explicitly before inclusion; no blanket transfer of ownership is
required. See [CONTENT-LICENSE.md](CONTENT-LICENSE.md) and
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

Track rights separately for composition, score edition, recording, performance,
images, fonts, text, and datasets. An old composition or an educational purpose
does not grant recording rights. Preserve MIT notices on scaffold UI. CC BY-SA
adaptations require their applicable license and attribution, not relabeling as
our original CC BY text. Do not copy chapters, unlicensed scores, or audio files.

Follow the [UI provenance boundary](docs/ui-provenance.md) when changing a copied
component. Update its inventory classification and modification notice in the
same PR. The entire modified copy belongs in the future full maintained-code
coverage report, even when currently unused. The catalog is retained; the
documented `ul`/`ol` list-role allowance preserves WebKit list semantics while
keeping the lint rule required. It is not permission to disable other rules.

Paid hosting, synchronization, support, or optional future services can coexist
with the open licenses; existing recipients retain their licensed rights. Pricing,
payments, and any separately licensed future components require an explicit
product decision before implementation.

## Pull request evidence

Use the PR template. State the observable outcome, roadmap IDs, scope, tests run,
coverage denominator/gaps, documentation, source/rights changes, and remaining
risks. Only tick checkboxes that are true. Link the accepted PR/commit in the
roadmap when closing a topic. Public deployment is separately recorded by the
owner with the version, URL, date, and rollback evidence.

Private VPS staging is authorized separately from public launch. Follow
[private staging](docs/private-staging.md); keep it reachable only through SSH.
ROADMAP P10 records the Germany/EU compliance and rights gate. Never include
server inventories, personal operator/provider data or credentials in commits,
PR bodies, or CI artifacts. Public launch needs the owner's explicit approval
after the applicable release gates are closed.
