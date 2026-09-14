# Content schema — task 530

The personal learning site remains file-based. No database, account, upload
flow or deployment is introduced. Canonical learning records live in
`lib/content/topics/<permanent-topic-id>.ts`: 19 topics, 19 lessons, 19 experiment
presets, 22 generated exercise rules, five entry diagnostic questions and 141
encyclopedia concepts. `sources.ts` and `assets.ts` in the same directory hold
shared citations and asset provenance.

## Contract

`lib/content/schema.ts` defines strict Zod schemas and inferred TypeScript types.
`lib/content/catalog.ts` assembles the files. Authoring files contain typed data;
they are trusted repository code reviewed through PRs, not an import format for
executing files supplied by learners. There is no MDX or user-content evaluator.

| Record | Owns | Links |
| --- | --- | --- |
| Topic | Kind, permanent module/task assignments, prerequisites | Lessons, experiments, exercises, concepts |
| Lesson | Localized title, goal/summary, paragraphs, formula, optional notation reading | Topic, primary source, experiment, reading sources/assets |
| Experiment | Localized instructions and bounded sound/notation presets | Topic; existing laboratory engine |
| Exercise | Generated rule label/engine, or diagnostic prompt, choices, answer and feedback | Topic, sources |
| Concept | Stable identity, localized heading/definition/aliases, display order | Topic, optional primary/further sources, related topics, forward modules |
| Source | Original title/URL, inherited edition/locator, verification limitation, evidence paths | Source-specific context |
| Asset | Repository path/JSON entry, optional existing description, licenses by constituent part | Context, provenance documents |

Every record has an `id`, positive integer `version`, `scopeId` and topic-ID
`prerequisites`. Educational records declare locales in canonical order
`en`, `ru`, `de`; every LocalText has three nonblank translations. Sources
declare their language; language-independent notation assets use an empty locale
list. Optional `ruMarkup` must produce exactly the stored plain Russian text
when explicit note markers are removed. Existing international pitch labels
and Russian note-name markup are preserved.

Scopes specify tradition, style, period and limitations. The initial scopes
distinguish physical acoustics, modern teaching of Western notation with the
named EN/RU/DE systems, and source-specific contexts. They do not make 12-TET or
common-practice harmony universal. New material outside these contexts needs an
appropriate scope. Topic prerequisites follow existing chapter prerequisites
in `lib/course.ts`; tests detect drift. The course continues to own section and
chapter organization and connecting prose.

## Identities and revisions

IDs are unique within each collection. A topic and its first lesson/experiment
may intentionally share a slug; edges identify the target collection. Existing
topic slugs, exercise rule IDs, module assignments and roadmap task IDs remain
unchanged. Concept IDs store the previous explicit ID or English anchor identity,
including spaces, punctuation and case. Renaming or translating a heading now
leaves its URL intact. Source IDs (`source-001`, etc.) are allocated once, never
regenerated from array position or title. Asset IDs identify existing figures.

`schemaVersion: 1` identifies the format; `version: 1` is each migrated record's
initial revision. Increase a record's version when its content or meaning
changes, keeping its ID. A breaking format change needs a new supported schema
version, explicit migration and compatibility tests. Unknown schema versions
currently fail validation. These revisions are not learner progress or the
readiness states of task 531.

## Authoring and checks

1. Edit the topic file and shared citations/assets. For a new topic, append its
   permanent ID in `ids.ts`, import its file in the catalog and connect the course.
2. Maintain both sides of ownership links. Use existing generator IDs and real
   lab controls. New generators require implementation and meaningful musical
   tests; a record alone cannot create one.
3. Verify exact edition/page/section/timecode from source material and preserve
   third-party rights. A table of contents is not evidence. Add EN/RU/DE text
   and explicit scope before review.
4. Run `npm run content:check` and `npm run typecheck`, then the normal unit,
   browser, coverage, lint, formatting and build checks in CONTRIBUTING.

`content:check` runs `tests/content-catalog.test.mjs` with development-only
Vitest/Zod. It checks strict fields, versions, locales, Russian markup, duplicate
IDs/references, ownership, missing targets, prerequisite cycles, diagnostic
answers/choices, actual asset entries, rights/evidence paths and integration
with the course, rule registry and notation controls. Both build commands run
it through npm prebuild hooks; CI also runs it within the unit suite. Browser
modules import data, types and small view adapters, not Zod or the validator.
This does not implement the lazy content loading of task 533.

Existing modules (`learning`, `topics`, `notation-programme`, `notation-tasks`,
`notation-experiments`, `entry-diagnostic`) retain their public access patterns
through `lib/content/adapters.ts` and `references.ts`. Musical algorithms,
parameterized practice generation and UI translations remain in their existing
code modules; they are not duplicated as static lesson text.

## Migration evidence and limitations

The baseline is Git revision
`7048228e64a88a7eeedbc957b9fa5d9ac815adf8` (merged tasks 537/542).
`tests/fixtures/content-v1.json` stores SHA-256 fingerprints of resolved public
views at that revision, with object keys sorted and concept IDs made explicit.
The regression test compares all 19 lessons, 141 definitions, 44 standalone
references, notation readings/descriptions, source aliases, rules, presets,
diagnostics and course text. It catches text/markup loss, altered sources,
reordering and changed presets. For an intentional later educational edit,
review the textual diff and sources before updating its affected fingerprint;
never blindly rebaseline failures. Existing musical/browser tests remain the
behavioral evidence.

This migration does not reverify sources or complete gate G. All imported
Source records explicitly say `inherited-unverified`. Edition/locator values
come from existing citation titles, with null for missing information. A
locator inherited from a title still needs claim-level review, particularly
broad/alphabetical references. Twelve introductory definitions still lack
individual sources. Some lesson references contain only a URL; the scales
lesson still points to a table of contents. The schema preserves these visible
shortcomings without certifying them. Task 531 owns readiness states and
claim-level gate validation; subject work must resolve evidence gaps before
completion.

Original educational text retains CC BY 4.0 and original code Apache-2.0.
Notation SVGs combine original compositions with Leipzig font outlines: asset
records retain the font's OFL-1.1 separately. See `CONTENT-LICENSE.md`,
`THIRD-PARTY-NOTICES.md` and `docs/notation-engine.md`. Referencing an external
source does not relicense its text.

This document holds task 530 requirements/evidence. ROADMAP.md remains the only
completion register, following PR acceptance and `docs/roadmap-guide.md`.

## Validation evidence — 2026-09-14

On Windows / Node 24.18.0: 61 content checks, 333 unit tests and 495 tests in the
complete coverage run passed. The three-engine matrix passed 468 tests with 18
existing capability skips (Playwright WebKit Web Audio and Firefox offline
suspend); no test or engine was removed. Typecheck, lint, formatting, Worker
build, static build, five Worker HTTP checks and five portable-artifact checks
passed. Portable checks exercise lab/chapter routes with external requests
blocked. The generated client JavaScript contains no Zod validator code.

All 27 new `lib/content/` modules have 100% statement, branch, function and line
coverage. The full 92-file denominator remains included: 86.71% statements,
86.10% branches, 82.63% functions and 87.68% lines. Existing coverage debt stays
with task 518; no exclusions or suppression were added. The existing V8 mapping
limitation is tracked in [issue 39](https://github.com/alex-michels/one-music-lab/issues/39)
by the repository maintainer; it does not exempt new code from tests.

The first sandboxed matrix attempts failed before tests because Firefox could
not open a page, even in an isolated blank-page probe. All engines passed that
probe outside the restricted environment; the complete matrix then passed with
two workers. Wrangler likewise needed normal process/filesystem permissions
for its temporary loopback-only HTTP check. The temporary server was stopped.
Neither build nor these checks publish the site; acceptance and public release
remain separate owner-controlled actions.
