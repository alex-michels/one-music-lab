# Local learning data — task 538

## Using it

Open **Learning data / Учебные данные / Lerndaten** under the chapter navigation.
The browser saves changes automatically. A checkbox in each lesson marks it as
personally worked through; you can uncheck it. The panel links to marked lessons
and shows answered/incorrect counts by the stable practice rule, in EN/RU/DE.
Opening the site without a hash resumes the last position. An explicit link
takes priority; a locale path such as `/de/` keeps its language when resuming.

Export downloads `one-music-lab-backup.json`. Import accepts a local JSON file
up to 1,000,000 bytes, checks its format and musical limits, and previews the
number of lesson markers before asking to replace existing data. Cancel leaves
everything intact. Reset also asks for confirmation and restores defaults,
clearing the saved learning history and current practice session. Export first
if you want a copy: there is no undo after a confirmed replacement. A failed
storage write does not apply an import/reset to the live app.

## Scope and meaning

- Preferences: language, light/dark/system theme, sidebar width.
- Position: topic, chapter/section, view and paragraph/reference anchor.
- Learning: the owner's lesson markers; counts of graded answers and last error
  tags from Drill and inline theory exercises. A written multipart exercise
  contributes one answer per graded part. Self-reviewed tasks with no grading
  contribute no count. These are records of attempts, not mastery, topic
  completion under gate G, or a language/subject review.
- Sound lab: frequency, reference pitch, tuning, waveform, volume, keyboard
  octave, selected tone/notes tab and topic context; notation pitch spelling,
  clef, ledger-line range, example choice/group/tempo; interval/scale/chord
  experiment selection and tonic.
- Chords lab: edited progression, bounded undo/redo, key, tempo, texture,
  selection and playback preferences. Playback itself is never stored.

The session ledger still controls adaptive question selection; **Start a new
session** clears that ledger, not the saved history. A restored/imported practice
view starts with an unanswered question. Entry-diagnostic answers, listening
experiments, chord-root self-checks, search filters, the notation workbench's
temporary manipulations and in-flight exercises remain local to their current
view. No microphone input, audio files, playback position, random seed, timestamps,
identity, account or analytics are recorded by this feature.

Changing to another topic still loads that topic's authored lab preset. Returning
to the same topic or reopening the browser restores its current saved context;
this is a current workspace, not a library of per-topic experiment presets.
All restored labs are silent until a fresh playback gesture.

## Storage, recovery and privacy

The authoritative record is `localStorage['oml-profile']`, separate for each
browser profile and origin (scheme, host and port). This works in the portable
static build and the Workers build. Nothing is uploaded. Private browsing,
browser eviction or clearing site data can remove the record. Export before
switching a staging port, browser or machine. Treat a backup as your personal
learning history when choosing where to keep or share it.

Read/write denial or quota exhaustion shows a visible warning; learning remains
usable in memory and export remains available. A malformed or future-version
record is preserved byte-for-byte and automatic writes are blocked until an
explicit compatible import/reset. Before each changed autosave, the app checks
whether another tab changed the saved record. On conflict it preserves that
record and warns you to export current work and reload. This check is best-effort,
not cross-tab synchronization or an atomic compare-and-swap; use one editing tab.
A single `setItem` replaces the complete validated document rather than leaving
partially written fields.

## Version contract and migrations

Version **1**, format **one-music-lab**, is the first portable backup format.
Its strict schema rejects unknown keys, topics/rules, noncanonical addresses,
duplicate markers, impossible counters, invalid notes/chords, and out-of-range
audio settings. Counters are safe integers; a saturated counter stays saturated.
Both chord history stacks have at most 60 drafts, each with at most 16 chords.
No imported `playing` flag, executable URL or arbitrary HTML is accepted.
Zod is a runtime dependency for this untrusted local-file boundary; the educational
content schema remains an authoring/build check as documented in task 530.

The pre-538 separate language/theme/sidebar keys and current session ledger are
the **version-0 storage layout**. On first access without an `oml-profile`,
`migrateLegacy` reads their existing validated values and constructs version 1.
The first successful autosave commits it. Later starts read version 1 directly,
so session answers are not repeatedly imported. Legacy preference keys continue
to be mirrored for compatibility and are overwritten with defaults on reset;
the practice session is cleared. Other applications' storage is never cleared.

For a future incompatible change: preserve the version-1 schema and fixtures,
add an explicit old-to-new migration, increment `version`, validate the migrated
document before writing, and add round-trip/error tests. Do not interpret unknown
future versions as defaults and silently overwrite them. Content IDs remain the
permanent catalog IDs; removing an ID requires a data migration as well.

## Verification

`tests/local-profile.test.mjs` covers portable round trips, the actual legacy
migration, musical boundaries, malformed/future/oversized files, storage denial
and quota errors, conflicts, counters and URL precedence. Browser tests cover
EN/RU/DE controls, mobile layout, reading markers, export/import cancellation and
confirmation, storage errors, preserved practice history, and silent restoration
of the main lab. Existing navigation, notation, practice and audio suites remain
in the browser matrix. Run the repository's unit tests, three-engine browser
matrix, full-denominator coverage, typecheck, lint, formatting, Workers and static
builds before accepting this change. Task acceptance remains solely in ROADMAP.

The already accepted chapter/navigation work (PR 40, tasks 537/542) and content
schema (PR 41, task 530) are reflected in ROADMAP alongside this work. No new
educational claims, media licenses or public deployment are introduced here.
