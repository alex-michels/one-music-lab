# Practice feedback — task 539

## Use and interpretation

In **Read** and **Drill**, **Show a hint** reveals a procedural prompt; a second
request gives a more specific step. Neither button submits an answer. The
existing musical error explanation and worked answer appear after submission,
with a direct link back to the relevant lesson in Drill. Written excerpts keep
their per-part feedback. Reading an open rubric does not create a graded result.

After an incorrect or hinted answer, a changed example is queued. Complete three
further scored questions in the same channel, then choose **Next question**.
The next eligible task is labelled **Later check · changed example**. A scoped
lesson only offers checks for its own rules; mixed Drill can offer all rules.
Returning to a lesson or starting a new session also offers due work. The queue
survives navigation, reload and backup transfer. There is no timer or forced
advance. Wrong or hinted checks are queued again; a correct check without hints
clears that pending task. An ordinary correct answer does not clear it.

The three-question gap is a transparent product choice, not a validated optimal
spacing interval. This is **near transfer** within the existing generators:
changed notes, positions, values, signs or context. Locale changes, shuffled
options and a new random seed alone do not qualify. Canonical problem signatures
exclude those differences and the four most recently completed examples of that
rule. Search is bounded; if there is no changed problem,
ordinary practice remains available and no transfer success is invented.
This is not a certification of retention across days or general musicianship.

**Play → Intervals** has a separate hearing history and queue. Later checks
transpose the two-note example while preserving the interval. They use the
existing four ascending interval categories in 12-TET, a sine tone and the
reference captured at the start of the question. Replaying is allowed and does
not count as a hint. Pitch names and the numerical answer appear only after
answering. Failed or superseded playback requests cannot unlock a new
question. A successful request permits answering; the audio engine resolves once
tones are scheduled, not once listening is complete. Muted hardware, later manual
stops and attention are not measured. Existing bounded audio generation and stop
controls remain in force. Existing Sound lab Russian
international displays are preserved under the notation policy.

**Play → Chords → Try a challenge** adds creative reflection. Choose an intention,
edit the progression, compare an alternative, then assess intention, comparison
and explanation/next experiment. All three criteria require an explicit response
before saving. The response suggests either a focused revision or another
intention. This is the owner's self-assessment, not an automatic artistic grade
or a universal harmony rule. The most recent reflection is stored separately;
editing the progression later does not reinterpret it. The existing chord editor
is the working artifact; no recording or microphone is introduced.

**Learning data** shows knowledge, hearing and creative reflection separately,
in EN/RU/DE. Knowledge and hearing show correct/attempted counts with and without
hints, plus correct-without-hints/attempted later checks. A multipart written
exercise is one attempt: all its scored parts must be correct. Legacy per-answer
totals remain visible below and still count parts separately. There is no combined
mastery score. The optional entry diagnostic and chord-root exploration retain
their existing immediate feedback; they do not feed these counters.

## Local data contract

The profile is version **2**. The strict version-1 schema is retained: valid old
backups and stored records gain empty coaching history while preserving every
old setting, lesson marker, answer count and lab edit. Earlier hint use and hearing
outcomes are unknown and are never reconstructed. Pre-538 preferences migrate
directly into the current schema. Only the next successful write replaces the
stored bytes; malformed or future records remain protected.

The bounded `coaching` record contains at most one row for each permanent rule
and each of four hearing categories, plus one three-criterion reflection. A row
stores independent/assisted/check counters, up to four recent example seeds and at most one pending example
seed with a remaining-question count (0–3). Hearing stores the previous MIDI
root (57–68) in that slot. Seeds represent generated questions, not playback
state. No timestamps, identity, uploads, account or database are added. Counters
saturate at the safe-integer limit. Export/import/reset includes all three
channels; reset clears the queue too. Storage failures and conflicts use the
existing visible warning and exportable in-memory recovery path.

## Source and editorial review

Author/editor and source checker: Codex, 2026-09-16, for the owner's personal
learning. EN/RU/DE prompts were compared for equivalent actions and scope.
Sources below were read in the actual sections, not inferred from search snippets.
All new prompts and reflection wording are original; no score images, recordings
or copied textbook prose are bundled. Original code stays Apache-2.0 and original
educational text CC BY 4.0; third-party source licenses are unchanged.

| Material checked | Exact source location | Scope and use |
| --- | --- | --- |
| Clef/position hints | Chelsey Hamm, *Open Music Theory*, version 2, “Reading Clefs”, “Clefs and Ranges” and “Reading Treble Clef”, [chapter](https://viva.pressbooks.pub/openmusictheory/chapter/clefs/) | Western staff notation; identify the clef before reading the position. No claim that one notation is universal. |
| Accidentals and enharmonic hints | Chelsey Hamm, *Open Music Theory*, version 2, “Half Steps, Whole Steps, and Accidentals”, “Sharps, Flats, and Naturals” and “Enharmonic equivalence”, [chapter](https://viva.pressbooks.pub/openmusictheory/chapter/half-and-whole-steps/) | Written spelling and alteration; keyboard equivalence is explicitly limited to the app's 12-TET model. |
| Dot/tie and unit hints | Robert Hutchinson, *Music Theory for the 21st-Century Classroom*, online edition, University of Puget Sound, §4.3, paragraphs on ties and double dots, [Dots and Ties](https://musictheory.pugetsound.edu/mt21c/DotsAndTies.html) | Relative written duration; no universal quarter-note beat assumption. The OMT v2 rhythm page returned HTTP 403 on this check, so this accessible primary textbook section was used instead. |
| Hearing comparisons | Hutchinson, same online edition, §5.2, second method and half-step table, [interval identification](https://musictheory.pugetsound.edu/mt21c/HowToIdentifyIntervals.html) | Minor/major thirds, perfect fifth and octave: 3/4/7/12 semitones. New feedback compares the chosen category with the actual played category. Humming/replay suggestions are optional practice prompts, not a diagnostic claim. |
| Existing rule feedback, notation conventions and rubric limits | [Notation programme source record](notation-programme.md#source-evidence-and-verification-limits), [editorial review](learning-editorial-review.md), and sources attached to each generated exercise | The existing verified curriculum remains the content authority. The other hints ask learners to inspect units, signs, grouping, route and context without adding a new theory of ornaments or style. |
| Delayed-check design limits | Carter & Grahn (2016), “Optimizing Music Learning: Exploring How Blocked and Interleaved Practice Schedules Affect Advanced Performance”, *Frontiers in Psychology* 7:1251, Abstract, Introduction, Materials and Methods / Participants and Procedure, [DOI 10.3389/fpsyg.2016.01251](https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2016.01251/full) | Ten advanced clarinetists and same-day/next-day performance comparisons do not validate this app's three-question gap, novice interval recognition or a mastery threshold. Scheduling is a testable design choice, as required by G/S16. |

## Verification and release boundary

Pure tests check scheduling boundaries, immutable updates, assistance, failed
checks, scope, counter saturation, bounded generation failure, changed examples
for every scored rule, locale/order invariance, transposed hearing and strict
backup migration/round trips. Browser tests exercise real rendered exercises,
delayed checks after leaving a page, multipart errors, hint reset, duplicate
submissions, failed/stale playback, all three reflection criteria and narrow
EN/RU/DE history layouts. The existing audio engine, notation, keyboard and
accessibility suites remain part of the three-engine matrix. The static artifact
tests export version 2 and restoration; the fixed version-1 fixture is retained.

Use the repository's unit, browser, coverage, type, lint, format, Workers build,
static build and HTTP/artifact checks. Full-denominator results and any remaining
coverage gaps are recorded in the PR; no files or branches are excluded to obtain
a percentage. This product task extends feedback around existing lessons and
labs, not completion of additional curriculum topics. Reviewable build artifacts
are for private use; merge does not authorize public deployment. Acceptance of
539 remains in ROADMAP after owner review. Accepted task 538 is recorded there
following merged PR 42.
