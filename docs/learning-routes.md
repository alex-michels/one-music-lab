# Connected chapters and learning routes — №537/542

This is the implementation and evidence record for the shared learning structure.
[ROADMAP](../ROADMAP.md) is the only completion register. The structure covers all
19 existing lessons in EN/RU/DE and is the authoring contract for future lessons.
It does not claim that the full F01–F11 curriculum has been written or close any
of its separate educational topic IDs. Public launch remains a separate decision.

## Reading and exploring

Open **Read** to see the section and chapter contents. Each chapter explains its
goal, links to prerequisite lessons and lists its lessons in teaching order.
The optional **Find a starting point** check can suggest an explanation to revisit;
the contents and all lessons remain available without taking it.

| Section | Chapter | Existing lesson slugs, in reading order |
| --- | --- | --- |
| Foundations | First sounds and note names | sound → note-names |
| Foundations | Reading pitch | staff → clefs → accidental-signs → accidental-scope → enharmonics |
| Foundations | Rhythm and musical time | durations → dots-ties → beat-division → tempo |
| Foundations | Tuning, intervals, scales and chords | tuning → intervals → scales → chords |
| Expression and performance | Sound colour and performance marks | timbre → dynamics → articulation → repeats |

This order is an editorial choice for the available introductory material: sound
and note names precede staff reading, spelling precedes interval/scale/chord
explanations, and basic durations precede their combinations and performance
marks. It preserves the relative order of the 13 notation lessons while connecting
the other six lessons to the same route. It is not a universal learning sequence
for all musical traditions. F09–F11 and other unwritten material retain their
original curriculum requirements and task IDs.

Each lesson introduces its connection to earlier material and links to its
prerequisites and reference terms. Its existing explanation, worked example,
inline practice and lab instructions remain. The footer links backward and
forward, names a new chapter at a boundary and previews the next lesson's purpose.
The first lesson has no previous link. The last offers chapter review and passage
practice without wrapping to an unrelated lesson or claiming mastery.

The same hierarchy appears in **Play**, **Drill** and **Define** through **All
chapters**. A chapter index opens the selected view of a lesson; a lesson's chapter
contents marks its current position. Six introductory lessons have no scored
generator. Their Drill chapter entries explain this and link to their explanation
and lab. Direct Drill links to those lessons also explain the gap instead of
silently substituting unrelated notation questions. Mixed practice and the
unfiltered encyclopedia remain available at their main indexes.

Opening a topic's laboratory directly loads its authored tone/notation preset.
Returning from another view to the same laboratory topic preserves the current
tone, interval/scale experiment choices and Notes-lab settings during that mounted
session. The scale lesson opens the scale experiment directly. Chords-lab edits, undo/redo
history and playback preferences also survive a trip to the lesson or definitions;
playback itself stops on leaving the lab. Opening a different
topic loads that topic's preset; **Open this experiment** explicitly reapplies
the lesson's example. This is session context, not saved progress or a versioned
shareable preset (№529/538). Audio still requires a gesture; navigation stops
ongoing Sound-lab audio, and chapter indexes do not respond to oscillator keys.

## Addresses and accessibility

These fragments work on the existing local, Sites and portable static document:

```text
#/en/read                              all theory chapters
#/ru/s/foundations/play                laboratory section index
#/de/c/rhythm/drill                    practice chapter index
#/en/t/dots-ties/read~dot-adds-half     existing lesson/rule address
#/ru/t/staff/define~Staff              existing reference address
```

The language and view travel with a chapter/section address. Existing topic IDs,
legacy page fragments, reference anchors and source links are preserved. Unknown
collections recover to the reading index. The four-view rail keeps the selected
collection; chapter breadcrumbs return to its parent and area index. Hash links
support native history, direct arrival and reload. Links remain usable without
an account. This extends the existing fragment routing; server-rendered topic
paths, content splitting and the rest of №533 remain separate requirements.

Contents use native details/summary, ordered lists and links. Current lessons use
`aria-current`; navigation focuses and scrolls the topic heading into view. Text
wraps, including long RU/DE chapter names. Mobile lesson navigation uses one
column. Diagnostic feedback uses an output status and never advances on a timer.
No audio, microphone, uploads, network requests, analytics or persistent storage
are added by the diagnostic. These checks are not a complete WCAG/device audit
for №521/522.

## Diagnostic scope and source checks

The five questions check frequency units, a clef's role, a dotted duration, the
root of a triad arranged in thirds and one contributor to timbre. Options have
specific explanatory feedback. A wrong answer or explicit “I'm not sure” response
recommends the earliest tested explanation needing review. An incomplete or
invalid answer set produces no result; five correct responses invite free chapter
selection and explicitly do not certify untested material. Restart clears this
temporary check. Language changes preserve answer IDs and translate the feedback.

This is a small navigation aid for the available foundations and expression
chapters, not a validated placement instrument or an assessment of hearing,
performance or all F01–F11 outcomes. Extend its sampling with sourced checks as
new chapters are authored. It does not record progress or label a chapter passed.

Sources below were opened and their substantive sections read on 2026-09-13 by
Codex (AI-assisted review for personal learning; no external approval claimed).
The questions, translations, feedback and chapter transitions are original text
under CC BY 4.0. No source prose, scores, recordings or images were copied. Original
implementation remains Apache-2.0; third-party notices are unchanged.

| Author, edition/institution, exact location | Verified use |
| --- | --- |
| Joe Wolfe, UNSW Music Acoustics, [Musical sounds, musical instruments and musical signals](https://newt.phys.unsw.edu.au/jw/musical-sounds-musical-instruments.html), online multimedia appendix to Wolfe (2012), in A. Brown (ed.), *Sound Musicianship: Understanding the Crafts of Music*, ISBN 978-1-4438-3912-9; sections “Rhythm, time and frequency; muscles, nerves and hearing” and “Pure tones, harmonics, periodic and non-periodic sounds; Timbre, spectrum, envelope and transients” | Frequency measured as vibrations per second; harmonic proportions contribute to timbre, which also depends on time evolution. The original examples use these facts without adopting health claims or universal perceptual equivalences. |
| Robert Hutchinson, University of Puget Sound, *Music Theory for the 21st-Century Classroom*, current online edition, [§1.2 Notation](https://musictheory.pugetsound.edu/mt21c/Notation.html), first paragraph | A clef gives a reference for reading staff positions. Scope: Western staff notation. |
| Hutchinson, same edition, [§4.3 Dots and Ties](https://musictheory.pugetsound.edu/mt21c/DotsAndTies.html), dot explanation | A dot adds half the original value. The question compares written values in quarter-note units, avoiding the source's introductory assumption that a quarter always means a beat. |
| Hutchinson, same edition, [§6.1 Introduction to Triads](https://musictheory.pugetsound.edu/mt21c/TriadsIntroduction.html), definition and root/third/fifth paragraph | Root as the lowest tone when the triad is arranged in consecutive thirds, rather than any lowest sounding note. Scope: tertian triads. |

Open Music Theory pages for clefs, rhythm and other notation returned retrieval
errors during this check. They were not used as newly verified evidence; the
accessible readings above support the new diagnostic. Existing lesson sources
and their limitations remain in [learning-editorial-review.md](learning-editorial-review.md),
[notation-programme.md](notation-programme.md) and the subject records.

## Extending the book

`lib/course.ts` owns section and chapter IDs, ordered lesson membership,
prerequisites, goals and individual lesson bridges. `lib/topics.ts` keeps the
existing topic identities, classifications and exercise mappings. Never infer
teaching order from a roadmap number or the legacy inventory position.

Add a chapter when its lessons serve a distinct learning goal with explicit
prerequisites and a coherent internal sequence. Add a section when multiple
chapters need a distinct subject/context and introduction; a separately named
subject can begin with one substantial chapter. Do not create empty placeholders
or duplicate a lesson in several chapter paths. Cross-link shared prerequisites
instead. Future traditions may have their own ordering and diagnostic model.

Adding a lesson requires EN/RU/DE bridges, chapter membership and the existing
topic/source/exercise contracts. The course validation rejects omitted or unknown
lessons, duplicate IDs/memberships, empty collections and prerequisites appearing
after their chapter (including self-dependencies). All views derive their order
from the same data. Tests include the entire authored lesson inventory, so a new
lesson cannot be silently omitted from chapter navigation.

## Verification

Reproduce with the README's Node/npm setup on Windows, macOS or Linux:

```sh
npm test -- --maxWorkers=1
npm run test:browser -- --maxWorkers=1
npm run test:coverage -- --maxWorkers=1
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run build:static
npm run test:static
```

`tests/course.test.mjs` verifies ordering/dependencies, inventory completeness,
malformed collection routes, old addresses and diagnostic outcomes/errors.
`tests/course-components.test.mjs` exercises all language/view combinations,
current positions, definitions, unavailable practice, feedback, restart and
language changes. Browser suites traverse all 19 lessons and test mobile wrapping,
keyboard contents, chapter/section links, history, hydration, language switching,
experiment return context and non-playing chapter pages.

### Local verification, 2026-09-13

Windows, Node 24.18.0, npm 11.16.0, repository-pinned Playwright 1.63.0.

| Check | Result |
| --- | --- |
| Unit tests, one worker | 39 files, 272 tests passed |
| Full unit + Chromium coverage run, one worker | 58 files, 434 tests passed |
| Full Chromium / Firefox / WebKit matrix, one worker | 55 files passed, 2 skipped; 468 tests passed, 18 skipped |
| Typecheck, lint, formatting | Passed |
| Workers build | Passed |
| Portable static build | Passed; five routes prerendered |
| Portable smoke checks | Five tests passed, including all 12 language/view chapter combinations, reloads and blocked external requests |

The browser matrix verifies all 19 lesson transitions, chapter boundaries, native
history, direct arrivals, focus, mobile wrapping and language parity. Native
chapter links stop active Sound-lab playback; returning does not restart it.
Notes, interval/scale selections, the edited chord phrase and its undo/redo
history survive the relevant view changes. Existing real browser audio rendering
tests cover the audio engine. The 18 reported skips reflect the existing WebKit
Web Audio and offline-suspend limitations; real Safari/iOS and Android devices
remain separate checks under №521.

The portable test writes screenshots to
`outputs/learning-routes/chapters-desktop.png` (1440 px) and
`outputs/learning-routes/chapter-mobile.png` (360 px). Both were visually checked:
chapter goals, prerequisites, lesson titles and RU wrapping remain readable, with
no horizontal page overflow. A local allowlisted package,
`outputs/537-542-static.tgz`, contains the build and license files; it was not
deployed. The existing CI workflow also produces its portable review artifact.

Initial test runs exposed obsolete assumptions that lesson entries were buttons,
that the index was flat, and that an unscored topic opened mixed practice. The
updated tests verify chapter links and the explicit unscored state. The chord
return check restores the original phrase through undo and replays the edit with
redo, without assuming that typing and blur create only one history entry.
Playwright needed an unsandboxed local launch; a unit worker startup timeout was
resolved by the documented single-worker run. No test or production files were
excluded to obtain a pass.

ROADMAP №537/542 remain pending acceptance of this PR, following
[the roadmap status rule](roadmap-guide.md). This record covers the shared
structure for existing lessons and future authoring. It does not close separate
unwritten curriculum topics or authorize public publication.

### Coverage boundary and remaining limits

The final V8 report contains 65 production files under the existing authored-code
and modified-vendor inventory. No exclusions were added. Overall results are
85.94% statements (2612/3039), 85.83% branches (1976/2302), 81.74% functions
(703/860) and 86.91% lines (2319/2668). This is not full project coverage; the
existing UI, server, export and adapter gaps remain under №518, with the
configuration instrumentation limit documented under №517.

`lib/course.ts`, `lib/entry-diagnostic.ts`,
`components/course-navigation.tsx` and `components/entry-diagnostic.tsx` each
measure **100% statements, branches, functions and lines**. Comparing added
production lines with LCOV finds one zero-count mapping: line 400 of
`app/(root)/page.tsx`, the first half of a wrapped state declaration. Its
initializer on line 401 and `Home` both have 403 hits, and the return-context
browser test verifies its resulting state. There is no independently executable
path for the first half of the declaration. The discrepancy is retained in the
report and tracked in [issue #39](https://github.com/alex-michels/one-music-lab/issues/39),
owner: repository maintainer. No ignore, denominator change or formatting
workaround was used to hide it.
