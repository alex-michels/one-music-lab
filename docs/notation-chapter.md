# Notation chapter — content plan

**Roadmap navigation (2026-09-07):** the analysis below is preserved from the
notation work; no lesson analysis was repeated during the documentation split.
Line numbers and descriptions of the old Roadmap layout refer to the
[pre-split revision](https://github.com/alex-michels/one-music-lab/blob/a05a640/ROADMAP.md).
Use the [ID index](roadmap-guide.md) for current task numbers, [module requirements](roadmap-guide.md#учебные-модули)
for F01/F03/F04/F05/N02, [gate G](release-criteria.md) for acceptance and
[sources S33/S34](sources.md) for the already recorded bibliography. Old proposals
and diagnostic observations below are historical context, not a second status
register. The current roadmap tests protect the 511-topic mapping, module
dependencies and links across these documents.

**Status:** planning. Nothing here ships and no roadmap checkbox is closed by it. Repository facts were checked against the working tree on 2026-09-07; unverifiable claims are marked **[unverified]**. The source book is recorded as S33 in the ROADMAP register.

**One-paragraph summary.** The chapter decomposes into **79 atoms**, which become **13 small theory lessons**, **~95 encyclopedia entries**, **14 generated exercise types** and **one new tab in the Sound lab**. It lands across **five** roadmap modules — F01, F03, F04, F05, N02 — and touches five more only as cross-links. It closes **no** checkbox on its own, and it cannot be cited at all until the scanned book has a bibliographic identity. The two engineering prerequisites are (a) a notation renderer, for which I recommend **hand-rolled interactive SVG over the existing `SpelledPitch` model, plus Verovio 6.3.0 run in Node at build time** for engraved examples, and (b) a rational-duration model, which does not exist anywhere in `lib/`. The two content prerequisites are a source record and a named German-language reviewer.

---

## 0. What is already true in the repo (verified, and it changes the plan)

| Fact | Where | Consequence |
|---|---|---|
| `SpelledPitch = {letter 0–6, accidental −2..+2, octave, midi}` | `lib/notation.ts:2-7` | This *is* a staff-position-plus-accidental model. Staff position = `letter + 7·octave` minus a clef offset. Hand-rolling the exercise staff is far cheaper here than greenfield. |
| All 35 German names incl. `['Heses','B','H','His','Hisis']`, `Es`, `As`, `Ases` | `lib/notation.ts:25-33`, cited to Beck pp. 8–10 at `:23-24` | §6 naming is shipped data. Lessons add the rule and the reason, never a second table. |
| Nine German + nine Russian octave regions, indexed by scientific octave | `lib/notation.ts:34-63` | §1 register ladder is shipped data. |
| `octaveName(p,'en')` returns `` `octave ${p.octave}` `` ; `pitchLabel(p,'en')` returns `C4` | `lib/notation.ts:136-140, 152-155` | **English has no register vocabulary.** This is the single largest gap the chapter exposes, and it is a *content* requirement of topic 2.3, not a display-contract change. |
| `spellPattern` throws on `writtenOctave > 8 \|\| Math.abs(accidental) > 2` | `lib/notation.ts:119-124` | Hard generator invariant. |
| `pitchName` / `octaveName` / `pitchLabel` do **not** validate | verified by probe | `pitchName({acc:3},'en')` → `"Cundefined"`; `octaveName({octave:9},'de')` → `undefined`; `pitchLabel({octave:-1},'de')` → a plausible-looking `"C₁"`. A "does it throw?" property test is worthless. See §5. |
| `keyboardPitch` accepts MIDI 12–119; `localizedNoteName` degrades to `MIDI n` outside | `lib/notation.ts:173-183, 190-194` | Naming range. |
| `MIN_MIDI = 24`, `MAX_MIDI = 108` in the chord player | `lib/chords.ts:177-178`, enforced `lib/chord-audio.ts` | **Sounded** range floor is C1, not A0. Subkontra A/H (MIDI 21–23) cannot be sounded through it. |
| **The Sound lab already has a real interactive piano** | `app/page.tsx:1090-1200`; `whiteKeys` at `:670`; 15 white keys, real `<button>`s with `aria-label`, `playNote(midi)`, octave control 0–6 | Earlier research claimed the only keyboard is the `aria-hidden` figure in the Chords lab (`components/chords-lab.tsx:952-973`). That is wrong. A pitch-entry device exists and is reusable. |
| The ear trainer calls `frequencyForMidi(q.root, q.reference)` — no `tuning` | `components/learning.tsx:301-302` | The interval quiz is 12-TET regardless of the lab's tuning map. A tuning-aware notes lab would make two exercises in one product disagree about what the tuning control means. Must be decided and documented, not inherited. |
| `.section-tabs` is one static `<span class="active">` | `app/page.tsx:811`; CSS `app/globals.css:1038-1061` | "Add a tab to the Sound lab" means introducing a tab control where a heading sits. |
| `components/ui/tabs.tsx` is provenance `unchanged`; `components/ui/sidebar.tsx` is `modified` | `docs/ui-provenance.json` | Using both is free; **editing `tabs.tsx` is not** (sha256 checked by `tests/ui-provenance.test.mjs`). Controlled precedent: `components/experiments.tsx:67-74`. |
| `PAGES` is a flat five-member union; `pageFromHash` accepts only exact members | `lib/client-store.ts:10-16, 100-103` | Asserted by `tests/client-store.test.mjs:16-24`, which pins `pageFromHash('#lab/extra') === 'lab'` **and** `pageFromHash('theory ') === 'lab'`. A sub-path parser must not break either. |
| `authoredProductionCode` globs `lib/**` but lists `components/*` **by filename** | `vitest.config.ts:34-44` | A new `components/notes-lab.tsx` fails `tests/coverage-boundary.test.mjs:26-48` with *"add new authored files to authoredProductionCode"* until registered by hand. |
| `tests/roadmap.test.mjs:23-40` asserts exactly **511** ids, each matching `^- \[[ x]\] (\d+\.\d+\|[A-D]\d+) — ` exactly once; `:66-75` validates every module's `Источники для разработки:` S-codes against the section-7 table | — | Inventing, moving or duplicating a topic id is a red test. |
| `tests/static-export.mjs` asserts root-relative asset refs, no `fonts.googleapis/gstatic`, no `sourceMappingURL=`, no `.map`/`.pem` | `:15-58` | It does **not** assert "no external fetches". A renderer that fetches its glyph font at runtime would pass this suite and still break offline. |
| Playwright WebKit has no Web Audio at all; the audio suite skips there | `tests/browser/audio.browser.test.mjs:15-16, 23`; `CONTRIBUTING.md:106` | House rule is honest engine-specific skip, not exclusion. |
| DE nav label: `Practice: 'Gehörbildung'` | `lib/german.ts:14` | A visual notation trainer under a page literally named *ear training* is wrong. Rename in the first notation PR. |
| No notation/engraving dependency; no rational-duration model | `package.json`; only `beats` 1–8 + `rate` in `lib/chords.ts` | Both prerequisites are real. |
| `translator`/`localText` accept only `GermanKey` | `lib/i18n.ts:5-14` | An untranslated string is a typecheck failure, not a fallback. |
| `nouns` holds only `beats`, `chords`, `octaves`, `semitones` | `lib/plural.ts:46-73` | New counters needed: bars, beams, ledger lines, rests, dots, notes. |
| The book already drives shipped code: `lib/notation.ts:23-24` cites Beck D2/D3 pp. 8–10; `tests/german-localization.test.mjs:77` repeats it | — | Beck is **not** in the section-7 register (S01–S32, `ROADMAP.md:2277-2309`). That is a present inconsistency, not a future task. |
| A blank line sits between the S29 and S30 rows | `ROADMAP.md` §7 | S30–S32 already render as a header-less table fragment. Any new row must fix this in the same PR. |

---

## 0a. The learner learns one naming system — their own

**Owner's scope clarification:** the language-specific teaching choices below
apply to educational material and new laboratories/sections, not to a rewrite
of the existing Sound lab. Russian theory, teaching material, trainers and
ordinary encyclopedia articles use traditional Russian note and octave names.
Encyclopedia articles explaining different international systems use those
systems' notation. Traditional Russian notation has priority when
creating Russian laboratory material. International letter names and scientific
octaves remain valid alternatives, not localization errors, with the convention
clear in context or a short label. Russian duplicates for every label are not
required. Preserve the existing Russian experiment labels and international
labels in the other panels. See [tasks 556/557](engineering.md#task-556) and the
[notation scope](music-notation.md#scope-of-future-localization-work).

A reader of the English interface learns C D E F G A B, sharps and flats, and
scientific octaves. A reader of the German interface learns C D E F G A **H**,
`-is`/`-es` and the classical octave names. A reader of the Russian interface
learns до ре ми фа соль ля си, диез and бемоль, and первая октава. Each of
those is complete and self-consistent on its own.

**Nobody learns the mapping between them.** That German H is English B is a
localization invariant of this product, not a learning objective: it is the
reason `lib/notation.ts` exists, it is asserted in
`tests/german-localization.test.mjs`, and it is recorded in
`docs/german-localization.md`. A learner who never opens a German score has no
use for it, and teaching it spends their attention on our implementation
problem.

Three consequences run through everything below.

1. **No lesson and no exercise compares naming systems.** The only place the
   correspondence may appear at all is a single optional encyclopedia entry for
   a reader who has picked up a German score and wants to know why it shows H —
   reference material, never a lesson and never scored.
2. **No generated item may have an answer that depends on the interface
   language.** This was already required for a different reason (§5.3a: "B" is
   the correct English answer for letter 6 natural and names a different pitch
   in German), and it is the same rule seen from the other side.
3. **The three language versions of a lesson are not translations of each other
   where the notation systems genuinely differ.** German has a real
   morphological system to learn — `-is`, `-isis`, `-es`, `-eses` and the
   irregular *Es*, *As*, *B*, *Heses*. English has "sharp" and "flat". Russian
   has "диез" and "бемоль". The German lesson is therefore longer than the
   English one at that point, and the English lesson must **not** be padded with
   *Heses* to match it. That is correct localization, not a parity failure.

The same argument applies to octave registers: an English reader is not taught
*eingestrichene Oktave*, and a German reader is not taught `C4`.

## 0b. What the chapter gets wrong, or dates

The chapter is a sound **skeleton**: its section order — Tonbenennung →
Schlüssel → Vorzeichen → Längenwerte → Pausen → Verzierungen → Tempo/Dynamik →
Artikulation — is still how German *Allgemeine Musiklehre* is organised today
(Ziegenrücker, *ABC Musik*; Michels, *dtv-Atlas Musik*, 7th ed. 2023). That is
what it is used for.

Twelve of its individual statements must not be taught as it has them. Ordered
by how badly each would mis-teach.

| # | The chapter says | Status | What we teach instead |
|---|---|---|---|
| 1 | Vocal music is beamed per syllable (§8a footnote, Bach example) | **reversed since 1967** | Modern vocal engraving beams by beat, like instrumental music, and carries syllables through text underlay and melisma slurs. Syllable beaming is the *historical* practice a reader meets in older editions. |
| 2 | To reduce a double accidental, write ♮♯ or ♮♭ | **outdated** | The single accidental alone. Show ♮♯ only as a variant found in pre-1950 editions. The renderer must still *read* it. |
| 3 | "In einem Prozeß wurde die Erfindung dem … Winkel zugesprochen" | **contested — drop the sentence** | Winkel built the double-weighted pendulum and deposited it with the Amsterdam institute on 27 Nov 1814; Maelzel saw it in 1815, was refused the rights, and patented his own with a scale; a commission of the Netherlands institute recognised Winkel's priority. No "trial" wording. |
| 4 | Dot = normal staccato, Keil = especially sharp | **conflates two claims** | As a *modern engraving* distinction it is current (Gould: dot = staccato, wedge = staccatissimo). As a claim about the repertoire it illustrates it is unsafe — before c. 1850 dot, dash and wedge are not reliably distinguishable in sources. Teach the first, drop or caveat the second. |
| 5 | §14 "Neue Notationsmethoden" | **a 1967 snapshot** | Keep for structure and history, labelled as such. What actually happened is partial absorption: proportional notation, feathered beams and boxed repetition survived; most graphic systems did not. Route any current treatment through Kurt Stone, *Music Notation in the Twentieth Century* (1980) and Gould (2011). |
| 6 | Dreihalbe-, Dreiviertel-, Dreiachtel-, Dreisechzehntelnote | **archaic** | `punktierte Halbe`, `punktierte Viertel`. The Drei-forms are a historical synonym note, never a glossary headword. |
| 7 | "Notationsorthographie" | **Wolf's own coinage** | Not in the literature. The canonical term is *enharmonische Verwechslung* / enharmonic spelling. Usable only as an attributed metaphor. |
| 8 | Pralltriller = upper auxiliary, Mordent = lower | **correct for German, and a translation trap** | The definitions stand. But unqualified Russian *мордент* is the German *Pralltriller*, and German *Mordent* is Russian *перечёркнутый мордент*. Never translate by the cognate; the internal id is upper-auxiliary / lower-auxiliary. |
| 9 | Irregular groups are written in the next larger regular division | **still mainstream, incomplete** | Correct and it is Gould's first option, but 7:8 is a recognised alternative; print the ratio whenever the written value could be misread. Cite Gould, not the chapter. |
| 10 | Accidentals do not add up; in-bar scope is one bar, one octave | **rule correct, practice omitted** | Keep both rules. Add what the chapter omits: modern practice re-notates the accidental in the other octave rather than relying on the scope rule, and uses courtesy accidentals. The grand-staff shared-c claim needs its own check. |
| 11 | Akzidentien / Vorzeichen / Versetzungszeichen | **still the careful split** | Adopt it, but head the topic *Akzidentien* — that is now the lemma — with Vorzeichen and Versetzungszeichen as its two cases, and note that colloquial German collapses them. |
| 12 | German H comes from b quadratum / b rotundum | **correct, badly told** | A gradual scribal-then-typographic development, not the "a printer mistook b for h" anecdote. And keep the pitch-name convention separate from the chord-symbol convention, which is international B/B♭. |

Two mechanical passes follow from this: every German term taken from the book
goes through the 1996 orthography reform (`Baßschlüssel` → `Bassschlüssel`,
`Generalbaß` → `Generalbass`), and the octave regions ship with a
Helmholtz ↔ scientific ↔ MIDI mapping rather than Helmholtz alone.

The chapter's own bibliographic identity is settled and recorded as S33; the
1967 table of contents confirms Kapitel I as pp. 1–32 with the sixteen sections
in the order used here. All editions after the first are posthumous — the
author died in 1971 — so the 1985 "korrigierte" edition is the only revision,
and it is a light one.

## 0c. Octave designation — settled

**German teaches Helmholtz with the German register names. English teaches
scientific pitch. Russian teaches the Russian register names.** Not a close
call, and the reasoning is worth keeping because the obvious counter-argument
is wrong.

German pedagogy uses `c′` / *eingestrichene Oktave* and nothing else. The
strongest evidence is negative: scientific pitch notation has **no German
lemma** — German Wikipedia carries no article for it under any title and the
English article has no German interwiki link. Where `de:Oktave` mentions C4 it
frames it as a convention of *«Computerprogrammen … und zunehmend in der
englischsprachigen Musiktheorie»*. Musikhochschule course material, the D1/D2/D3
theory syllabi and the German teaching sites present the register ladder alone.

The reference pitch is written **`a′ = 440 Hz`** and called the *Kammerton*,
never `A4`. ISO 16 / DIN 1317 fix a1 = 440 Hz. German and Austrian orchestras
tune in practice to 443 Hz, Switzerland to 442 — relevant because the Sound lab
lets the reference be edited.

**The "but the software shows C4" argument is empirically false here.** MIDI
fixes the note *number*, not the octave *name*; the MMA states outright that it
has issued no recommendation on octave numbering. And the two DAWs a German
learner is most likely to be using are both German-origin and both disagree
with scientific pitch:

| Application | MIDI 60 shows as | Configurable |
|---|---|---|
| Cubase / Nuendo (Steinberg, Hamburg) | `C3` | no |
| Ableton Live (Berlin) | `C3` | no |
| Logic Pro | `C3` by default | yes |
| Dorico (also Steinberg) | `C4` | yes |
| REAPER, MuseScore | `C4` | yes |
| FL Studio | `C5` | no |

Steinberg ships two products that contradict each other. Teaching `C4` in
German would be unfamiliar at the Musikschule *and* still off by one against the
learner's own DAW.

So the German lesson teaches the ladder and `a′ = 440 Hz`, and adds one honest
sentence: a DAW may label the same key `C3`, `C4` or `C5`, because MIDI
standardises the number and not the name. That belongs in the notes lab as a
fact about software — **never in a scored item**, since it has no single correct
answer.

Three implementation consequences:

- In any cross-reference the collision is **German C₂ (Subkontra) = SPN C0**.
  German C₁ (Kontra) and SPN C1 are the same pitch, so that pair is not the trap.
- **Both `c′` and `c1` are standard German.** The repo prints the stroke form;
  Beck — the source `lib/notation.ts` cites — prints subscript digits. Exercises
  accept either.
- The repo's nine registers are a defensible subset. German references run from
  Subsubkontra to siebengestrichene, but the MIDI 12–119 naming range makes the
  extremes unreachable anyway.

This also settles the English question the plan left open: English keeps
scientific pitch as its taught system, and the Helmholtz register names become
encyclopedia material (§2.4a) rather than an English learning objective.
`docs/music-notation.md` and `docs/german-localization.md` already match; no
display contract changes.

## 1. The atomic topic list, and the lesson grouping

### 1.1 Inventory ids

The inventory uses ids `NA01`–`NA79`. **These are internal content-inventory ids for a new `docs/notation-chapter.md`. They are never roadmap ids and never appear in `ROADMAP.md`** — `tests/roadmap.test.mjs` would fail on the 512th checkbox line. Earlier research proposed `NS01`–`NS04` as *new roadmap topics*; that proposal is dropped (see §7.2).

Columns: **§** = chapter section · **ID** = roadmap topic · **Dest** = T*n* theory lesson, **N** notes lab, **P** practice type, **E** encyclopedia, **—** not shipped.

#### Cluster A — the page, the staff, the clef (11 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 01 | Five lines, four spaces, counted bottom-up; the space above line 5 and below line 1 belong to the system | Allg. | 2.1 | T1 N P E |
| 02 | Note head; notes read left→right; vertical alignment means simultaneity | Allg. | 2.1 | T1 N E |
| 03 | Hilfslinien: spacing, slightly wider than a head, five to six above/below | 3 | 2.1 | T1 N P E |
| 04 | Why a clef is needed: eleven staff positions cannot address 52 Stammtöne | 2 | 2.2 | T1 E |
| 05 | Every clef names one pitch — G-clef line 2 = g′, F-clef line 4 = F, C-clef = c′ | 2 | 2.2 | T1 N P E |
| 06 | Reading the Violinschlüssel | 2 | 2.2 | T2 N P |
| 07 | Reading the Bassschlüssel | 2 | 2.2 | T2 N P |
| 08 | Altschlüssel (line 3) and Tenorschlüssel (line 4): recognition, locate c′ | 2 | 2.2 | T2 E (recognition only — see §1.4) |
| 09 | Instrument → clef; viola alto+violin; cello bass+tenor+violin; bassoon/trombone bass+tenor | 2 | 2.2 | T2 E |
| 10 | Number of staves: keyboard 2, organ 3; Akkolade + Klammer; the grand staff's shared c′ | 2, 5 | 2.2 | T2 N E |
| 11 | Oktavierungszeichen: 8 with bracket above/below, 8 under the clef for a whole system, 15 = two octaves | 4 | 2.1 | T2 N P E |

#### Cluster B — names and registers (6 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 12 | The seven Stammtöne C D E F G A H | 1 | 2.3 | T3 E |
| 13 | The correspondence German **H** = English **B**, German **B** = English **B♭** | 1 | 2.3 | **— not taught** (§0a); product invariant, plus one optional encyclopedia entry |
| 14 | The octave as the recurrence of the name eight steps up; why seven names suffice for 52 Stammtöne | 1 | 2.3 | T3 E |
| 15 | The nine octave regions Subkontra…fünfgestrichen, **each beginning at C** | 1 | 2.3 | T3 N P E |
| 16 | The written octave follows the written letter: `his′` ≠ `c″` | 1, 6 | 2.3 | T3 P E |
| 17 | Register set vs instrument compass: the book's 52 Stammtöne span the piano A₂–c⁵; the register *set* is wider | 1 | 2.3 | T3 N E |

#### Cluster C — accidentals (10 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 18 | **Akzidentien**: the five signs and how far each moves (♭ ♯ semitone, ♭♭ x whole tone, ♮ cancels) | 5 | 2.4 | T4 N P E |
| 19 | **Vorzeichnung** (the key signature) vs **Versetzungszeichen** (in the bar) — the two-term split, attributed | 5 | 2.4 | T5 N P E |
| 20 | In-bar scope: to the next Taktstrich, **only in that Oktavlage**, carried past the barline only by a Haltebogen | 5 | 2.4 | T5 N P E |
| 21 | Signature scope: whole piece/section, **all octaves** of that letter; a ♮ may open a formal section | 5 | 2.4 | T5 P E |
| 22 | Accidentals do not add up; there is no double natural | 6 | 2.4 | T4 P E |
| 23 | Naming upward: `-is`, `-isis` (Gis, Cisis, Fisis) — fully productive | 6 | 2.4 | T4 P E |
| 24 | Naming downward: `-es`, `-eses`, plus the **sourced exception list** Es, As, B, Heses (and the Ases/Asas variance) | 6 | 2.4 | T4 P E |
| 25 | Placement: immediately before the head, on its own line or space; a note on ledger lines takes the sign without them | 6 | 2.4 | N P E |
| 26 | Signature order by fifths (b es as des ges ces fes / fis cis gis dis ais eis his), fixed places per clef | 6 | 3.21 | T4 P E |
| 27 | Double accidentals never appear in a Vorzeichnung | 6 | 2.4 | T4 P E |

#### Cluster D — enharmonics (2 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 28 | Enharmonic respelling: Fis/Ges, c–his–deses, g–ases–fisis, gis–as, e–fes–disis | 7 | 2.4 | T6 N P E |
| 29 | Why the spelling means something (tonal relation, playability, readability) — **attributed as one school's position**, not stated as fact | 7 | 2.4 | T6 E |

#### Cluster E — note values (5 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 30 | Values are relative, not absolute; exact only while the Metrum holds | 8 | 2.5 | T7 E |
| 31 | The halving series, ganze → 128stel, each two of the next | 8a | 2.5 | T7 N P E |
| 32 | Notenkopf, Notenhals, Fähnchen; stem up from the right / down from the left; middle-line note usually stems down | 8a | 2.5 | T7 N P E |
| 33 | Balken: one beam per Fähnchen; groups show the beat | 8a | 2.9 | T9 N P E |
| 34 | Variable beaming practice: inner breaks after three or four, unlike values beamed together, vocal beaming per syllable | 8a | 2.9 | T9 E — **unscored** |

#### Cluster F — dots, tuplets, ties (10 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 35 | The dot adds half: a dotted value = three of the next smaller unit | 8b | 2.6 | T8 N P E |
| 36 | The second dot adds half the first | 8b | 2.6 | T8 P E |
| 37 | Whether a dotted value *fits the remainder of the bar* (arithmetic only — see §5.4) | 8b | 2.6 | T8 P |
| 38 | Triole: the system divides by 2/4/8/16, so a three-division must be marked | 8c | 2.7 | T9 N P E |
| 39 | Subdividing tuplet members; tying two of three | 8c | 2.7 | T9 P |
| 40 | Other tuplets (5, 6, 7, 9, 11, 13, 15, 17) and the **convention** for their written value | 8d | 2.7 | T9 P E |
| 41 | Ratio notation, e.g. 13:12 | 8d | 2.7 | E |
| 42 | Duole / Quartole / Oktole over dotted values | 8e | 2.7 | T9 E — **unscored** |
| 43 | Haltebogen: coupled values add; a value crossing a Taktstrich is split per bar; any value couples with any other | 8f | 2.6 | T8 N P E |
| 44 | **Haltebogen vs Bindebogen** — same pitch, one sound / different pitches, legato | 8f, 16 | 2.6 | T8 N P E |

#### Cluster G — rests (4 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 45 | A rest for every value | 9 | 2.5 | T7 N P E |
| 46 | The ganze Pause is really four quarters but serves as the Taktpause whatever the bar length | 9 | 2.5 | T7 P E |
| 47 | Dotted and added rests | 9 | 2.5 | T7 P |
| 48 | Mehrtaktige Pausen: the 2/3/4-bar symbols and the barred symbol with a numeral | 9 | 2.5 | E |

#### Cluster H — formal navigation and shorthand (7 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 49 | The plain Taktstrich divides metrically (support only — **the chapter does not teach metre**) | 10 | 2.8 partial | T8 T9 (support) E |
| 50 | Doppelstrich = formal section; thin+thick Schlussstrich = end of a movement | 10 | 2.19 | T13 N P E |
| 51 | Wiederholungszeichen: colon facing the repeated part, omitted opening sign, shared signs between adjacent sections | 10 | 2.19 | T13 N P E |
| 52 | prima / seconda volta | 10 | 2.19 | T13 N P E |
| 53 | d.c. al fine, dal segno, segno, fine, fermata as the end mark | 10 | 2.19 | T13 N P E |
| 54 | Repetition stroke, repeated-note abbreviation, simile / **segue** | 12 | 2.19 | T13 N P E |
| 55 | Tremolo: fast alternation of two pitches/intervals/chords, or fast repetition of one | 12 | 2.19 | T13 N P E |

#### Cluster I — ornaments (2 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 56 | The sign inventory: Triller, Pralltriller, Mordent, Vorschlag, Schleifer, Doppelschlag, Nachschlag, Arpeggio, Acciaccatura | 11 | 2.18 | E + **rubric only** — see §6.2 |
| 57 | Realisation of an ornament | 11 | 2.18 | **— not taught** |

#### Cluster J — other notations (5 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 58 | Tabulaturen as grip notation; surviving folk grip charts | 13 | 2.24 | E stub → N05 |
| 59 | Generalbass: bass in notes, harmony in figures | 13 | 4.18 | E stub → H04 |
| 60 | Chord letter symbols as a distant relative of figured bass | 13 | 4.22 | E (Chords lab cross-link) |
| 61 | Why New Music needed new signs — the seven reasons | 14 | 2.26 | E → N05 |
| 62 | Space-Notation, Aktionsschrift, graphic notation | 14 | 2.26 | **— deferred (rights)** |

#### Cluster K — tempo and agogics (6 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 63 | The tempo-word vocabulary (Italian/French/German; English in dance and jazz) | 15a | 2.15 | E — reference list |
| 64 | A tempo mark holds until replaced | 15a | 2.15 | T10 P E |
| 65 | **Agogik** (Riemann) and its vocabulary | 15a | 2.15 | T10 E |
| 66 | Where a change starts and stops; hyphenated `strin–gen–do`; *a tempo* / *in tempo* / *Tempo I*; the Schumann-to-next-barline reading | 15a | 2.15 | T10 P E |
| 67 | The Fermate over a note, rest or barline | 15a | 2.15 | T10 N P E |
| 68 | Metronomzahlen tied to a note value; the Mälzel/Winkel history | 15a | 2.15 | T10 N P E — history needs its own source (§9.3) |

#### Cluster L — dynamics (5 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 69 | The degrees ffff…pppp are relative; none names a measured level | 15b | 2.16 | T11 N P E |
| 70 | Accent, fp, sf/sfz/fz | 15b | 2.16 | T11 N P E |
| 71 | Gradual change: cresc./decresc./dim., rfz, hairpins, poco a poco, spread-out `cre–scen–do` | 15b | 2.16 | T11 N P E |
| 72 | Character words affettuoso…tumultuoso | 15b | 2.16 | E — reference list |
| 73 | Words acting on tempo **and** loudness: calando, mancando, morendo, perdendosi, smorzando | 15b | 2.16 | T11 P E |

#### Cluster M — articulation and phrasing (6 atoms)

| NA | Atom | § | ID | Dest |
|---|---|---|---|---|
| 74 | legato and staccato as the two poles; Punkt vs Keil (**contested** — §6.2) | 16 | 2.17 | T12 N P E |
| 75 | portato, non legato, tenuto, leggiero and their signs | 16 | 2.17 | T12 N P E |
| 76 | Composers rarely marked articulation, dynamics or tempo before the 18th century | 16 | 2.17 | T12 E |
| 77 | Phrasierung ≠ Artikulation; no sign system comparable to punctuation | 16 | 2.17 | T12 E |
| 78 | Couperin's Zäsurzeichen surviving as the breath mark; the unsystematic stroke | 16 | 2.17 | T12 N E |
| 79 | Chant divisio maior / minor / minima | 16 | 2.22 | E stub → N04 |

**Total: 79.** The delta from the 69 in earlier research is: +3 splits forced by the corrected roadmap mapping (NA13, NA49/NA50, NA23/NA24), +3 scope splits inside §5 (NA19/NA20/NA21), +2 from the repo's own commitments (NA16 written-octave rule, NA17 register-vs-compass), +2 unscored-practice atoms (NA34, NA42).

### 1.2 Why 13 lessons

Measured, an existing lesson body is **two paragraphs of ~38–55 English words** (`lib/learning.ts:18, :22, :52`) plus one formula, one experiment, one source. That is the house size, and it is small.

Three constraints fix the number:

1. **One measurable outcome per lesson.** Gate G's Тренажёр line (`ROADMAP.md:47`) requires exercises for understanding *and* transfer with an explanation, a hint, a new variation and repetition. A lesson carrying seven outcomes has nothing single to measure.
2. **A lesson must not straddle two roadmap modules.** Gate G is evaluated per module and modules have different dependency chains (F01 → F03 → …; F04 → F05; N02 depends on F03+F05). A lesson spanning two modules cannot ship with either.
3. **The house paragraph size.** Six lessons would mean 7–11 atoms each and roughly triple the body length — visibly a different product from the six already published.

| # | Lesson (EN working title) | Atoms | Module / topic |
|---|---|---|---|
| **T1** | Five lines, and the clef that fixes them | 01–05 | F03 / 2.1, 2.2 |
| **T2** | Four clefs, one sounding pitch | 06–11 | F03 / 2.2 |
| **T3** | Note names and registers, in the reader’s own system | 12, 14–17 | **F01 / 2.3** |
| **T4** | Raising and lowering a written note | 18, 22–27 | F03 / 2.4 |
| **T5** | How far a sign reaches | 19–21 | F03 / 2.4 |
| **T6** | Two spellings, one key | 28, 29 | F03 / 2.4 |
| **T7** | Length is a ratio — and so is silence | 30–32, 45–47 | F04 / 2.5 |
| **T8** | Dots and ties | 35–37, 43, 44, (49) | F05 / 2.6 |
| **T9** | Dividing the beat | 33, 34, 38–42, (49) | F05 / 2.7, 2.9 |
| **T10** | Tempo, and where a tempo mark stops | 63–68 | **F04 / 2.15** |
| **T11** | Loudness is relative | 69–73 | N02 / 2.16 |
| **T12** | Articulation, and how little of it is written | 74–78 | N02 / 2.17 |
| **T13** | The order the page is played in | 50–55 | N02 / 2.19 |

Earlier research argued 11. Two of those eleven were mapped to the wrong module: octave registers are **2.3 in F01** (`ROADMAP.md:204`), not F03, and tempo is **2.15 in F04** (`:256`), not N02. Re-homing them forced T3 and T10 out of their proposed hosts, giving 13. This is a *better* outcome: T3 advances F01, the roadmap's designated first public release (`ROADMAP.md:59`), and it is the only lesson in the set that needs **no renderer at all**.

**Cut order** if the owner wants fewer: T13 first (repeat/D.C. reading is lookup-and-do — it works as lab walkthrough + practice + glossary with no exposition) → then merge T11 and T12 into *"Loud, short, joined: what the composer wrote down"*. Do **not** merge T4 with T5 (naming and reach are different skills, and reach is the highest-failure item in the chapter), and do not merge T8 with T9.

Notation would then be 13 of 19 theory lessons (68%). That is defensible only because they ship in **five separate tranches** tied to five modules (§8), never as one block, and because the roadmap itself weights notation this way — topic ids 2.1–2.28 span nine modules.

**Housekeeping this forces:** the string *"6 introductory lessons"* is hard-coded in **five** places — `components/learning.tsx:107` (a literal `6 {t('short lessons'…)}`), `lib/learning.ts:188`, `lib/german.ts:341` (where the English sentence is itself the catalog key, so a count change is a key rename), `docs/german-localization.md:5`, and `ROADMAP.md:122`. Ordinals are built as `0{i+1}` at `components/learning.tsx:118, 153`, which renders `010` for the tenth lesson. `tests/browser/german.browser.test.mjs:167` asserts `.lesson-tile` length 6, `:178` asserts `.term-card` length 12, and `:171` asserts exactly one term card matches the search *"Stimmführung"* — that last one breaks if any new term's EN, RU or DE **title** contains the word, because the filter joins all three (`components/learning.tsx:174-182`).

---

## 2. Where each piece of material goes

### 2.1 Theory lessons — 13 lessons, ~1 100 words of EN body total

Each lesson keeps the existing shape (`id`, `title`, `category`, `summary`, `formula`, two `paragraphs`, `experiment`, `source`) with **one addition**: `source` becomes a `SourceRef` id resolved from a new `lib/content/sources.ts`, not a bare URL. A bare href cannot carry author, edition, publisher, ISBN, exact page or reviewer, which `CONTRIBUTING.md:146-151` requires per claim.

Theory carries the **reasons**, not the tables: why eleven staff positions need a clef, why seven names suffice, why a written accidental replaces rather than adds to the signature, why Fis is not Ges. The tables themselves (35 names, nine registers) are shipped data already — do not restate them in prose.

### 2.2 Notes lab — a real tab inside the Sound lab at `#labs/sound/notes`

The `docs/chords-lab.md:24-33` objection does **not** transfer, and this is the case where the doc's own named alternative applies. That doc rejects a Sound-lab tab for chords because the Chords lab deliberately fixes 12-TET and A4 = 440 and ignores the Sound lab's three controls, so co-locating them *"would invite a reasonable reader to change the tuning and wait for a chord to follow it."* A notes lab is the inverse: written pitch → `letter + accidental + octave` → MIDI is exactly what `lib/notation.ts` computes, and MIDI → Hz is `frequencyForMidi(midi, reference, tuning)`. Reading a written pitch and hearing it under the reader's own A4 and tuning map is one honest chain, and it satisfies by construction the condition the doc named at `:36-41`.

**What the tab contains, in order of landing:**

1. A staff with a clef selector (violin, bass, alto, tenor) and a ledger-line budget slider (0 → 6).
2. Two-way linkage to the existing Sound-lab piano (`app/page.tsx:1127-1183`): click a staff position → the key lights and sounds; click a key → the head appears at the position `keyboardPitch` spells. This is exactly F03's lab line, *"двусторонняя связь нота—клавиша—звук; переключение ключей"* (`ROADMAP.md:244`).
3. An accidental palette (♭♭ ♭ ♮ ♯ 𝄪) and a key-signature builder that demonstrates NA19–NA22 live: toggle a signature flat, then add an in-bar flat, and watch that the result is **not** a double flat.
4. An octave-sign toggle (8 / 15, above and below) showing the same sounding pitch written two ways.
5. A duration strip (values, dots, ties, tuplets) — **blocked on the duration model**, tranche 3.
6. A performance-marking overlay (dynamics, hairpins, articulation, repeats) — tranche 4, satisfying N02's lab line.

**Explicit decision required before (2):** does the notes lab honour the Sound lab's tuning map? I recommend **yes**, and that the same PR fixes `components/learning.tsx:301-302` to pass `tuning`, so the product does not contain two exercises that disagree about what the tuning control means. Record the decision in `docs/notes-lab.md` the way `docs/chords-lab.md` recorded the opposite one.

**Concrete cost of the tab shell** (do this as its own behaviour-free PR):

- Extract the tone generator from `app/page.tsx` (1 281 lines; the lab branch is `:804-1247`) into `components/sound-lab.tsx`.
- Wrap in `<Tabs value={route.item ?? 'tone'} onValueChange={…}>` following `components/experiments.tsx:67-74`. **Never edit `components/ui/tabs.tsx`.**
- New `.lab-tabs` CSS block beside `.section-tabs`; do not mutate the existing `.active` selector (it would have to become `[data-selected]`).
- Register `components/sound-lab.tsx` and `components/notes-lab.tsx` in `authoredProductionCode` (`vitest.config.ts:34-44`) or `tests/coverage-boundary.test.mjs` fails.
- Decide and document what `read_sound_lab` / `configure_sound_lab` (`lib/webmcp.ts`) report when the Notes tab is active.
- The space-bar shortcut guard at `app/page.tsx:592` already includes `[role="tab"]`, so a TabsTrigger will not steal it.

### 2.3 Practice trainer — 14 generated types

Full design in §5. Placement: the Practice area gets a **mode registry**; the current `quizIntervals` four-item array (`components/learning.tsx:253-276`) becomes the first entry of it rather than the only exercise. Note the repo's *de facto* pattern is already exercise-inside-the-lab: the Chords lab ships a root-identification challenge at `components/chords-lab.tsx:1083` with its own `answer` state. The registry has to reconcile two existing homes, not invent the first one.

### 2.4 Encyclopedia — ~95 entries

Reference material that is a lookup, not a lesson: NA34, NA41, NA48, NA56, NA58, NA59, NA61, NA63, NA65, NA72, NA79, plus the clef-per-instrument table from NA09, plus one headword per term in §6. Roughly 95 entries × 2 fields × 3 languages.

**This layer is blocked by two schema gaps, and they are harder than the volume.** A `terms` entry today is `{title, body, lesson}` (`lib/learning.ts:234ff`) — no id, no slug, no synonyms, no transliteration, no era/school field, no homonym marker, and no `source`. Gate G's Энциклопедия line (`ROADMAP.md:48`) demands *"синонимы и транслитерации, школа/эпоха … Устойчивые URL, поиск и явное различение омонимов."* This chapter's entire value is homonyms — Takt = bar *and* metre; реприза = repeat sign *and* recapitulation; репетиция = rehearsal, note repetition *and* the piano action; Satz = movement, texture *and* phrase; DE Pause = rest while UK *pause* = fermata. And there is an immediate collision: the glossary already ships **Octave** as the 2:1 interval; NA15's octave-as-register would shadow it on day one.

So the encyclopedia layer needs a **P02 schema PR before content**, and stable per-term URLs (§3). It cannot be closed by volume.

### 2.4a The one article where the traditions meet

The single place the naming systems appear side by side is an encyclopedia
article — reference material a reader opens on purpose, never a lesson and
never scored. The owner's scope for it is wider than EN/DE/RU: it may collect
**other** writing traditions too.

Contents, in one article:

- The letter systems: English/international **A B C D E F G**, German with
  **H** for English B and **B** for English B♭, and the Scandinavian, Polish,
  Czech and Hungarian usage that follows German.
- The syllable systems: Romance and Russian **до ре ми фа соль ля си**, and
  solmization proper — fixed *do* against movable *do*, and the `si`/`ti`
  split.
- Octave conventions: Helmholtz (`c′`), scientific (`C4`), the Russian
  register names, and MIDI numbers, as one mapping.
- Beyond the European systems, as the article grows: Indian **sargam**,
  Byzantine `parallage`, Arabic `dūkāh/sīkāh` naming, Japanese `iroha` and
  numbered systems, and Chinese `gongche`. Each needs its own source before it
  is written; none is required for the article's first version.
- Why German has H, told as the gradual scribal development it was.

Cross-linked from the accidentals and register lessons in every language, so a
curious reader can reach it — and so no lesson has to carry the comparison.

### 2.5 What we do not ship

| Atom | Reason |
|---|---|
| NA13 cross-language naming | §0a. A localization invariant, not a learning objective. One optional encyclopedia entry for a reader holding a German score; never a lesson, never scored. |
| NA57 ornament realisation | Period-, national- and edition-dependent. A single realisation with automated right/wrong feedback breaches `AGENTS.md:28-31` and `CONTRIBUTING.md:154-156`. |
| NA62 Space-Notation / Aktionsschrift | Needs licensed facsimiles; the chapter's own example is a Universal Edition score reproduced under a permission granted to that publisher **[unverified — I cannot read the scan]**. The chapter itself states no unified method emerged, so there is no assessable correct answer. → N05. |
| NA58, NA59, NA79 | Facsimile problem plus their own roadmap homes (N05, H04, N04). Encyclopedia stubs with forward links only. |
| NA08 as *fluency* | Recognise alto and tenor clefs now; fluent C-clef sight-reading is orchestral-score work belonging to N03. |
| NA34, NA42 | Ship as unscored "both are used" reveals. |

---

## 3. Information architecture and navigation

### 3.1 Address scheme — extend the hash, do not add routes

`app/` contains exactly three files: one route. `build:static` returns only `vinext({nextConfig:{…output:'export'}})` (`vite.config.ts`, `mode === 'static'`). Real nested routes mean new prerendered directories, new refresh/deep-link behaviour and Caddy work — i.e. spending P04's open checkbox *"устойчивые URL уроков, refresh deep links"* (`ROADMAP.md:113`). Extending the hash grammar changes zero build and zero server surface.

**Do not change `pageFromHash`.** `tests/client-store.test.mjs:16-24` pins `pageFromHash('#lab/extra') === 'lab'` and `pageFromHash('theory ') === 'lab'` (note the un-trimmed trailing space). Keep it as the legacy-alias resolver and **add** beside it:

```ts
export type Area = 'labs' | 'theory' | 'practice' | 'glossary';
export type Route = { area: Area; section?: string; item?: string };
export function routeFromHash(hash: string): Route  // degrades left-to-right
```

`#labs/sound/notes`, `#theory/notation/clefs`, `#glossary/versetzungszeichen`, `#practice/read-a-pitch`. Unknown segments degrade to the area index; unknown area → `#labs/sound`. Keep `#lab`, `#chords`, `#theory`, `#practice`, `#encyclopedia` as permanent aliases. `navigate` (`app/page.tsx:364`) writes the full path with `pushState` for area/section changes so Back works, `replaceState` for transient tab changes.

**This is a gate-G blocker, not polish.** Gate G's Энциклопедия line requires stable URLs; ~95 glossary entries cannot close the encyclopedia layer of *any* topic without them. It is earlier and harder than P03's deferred area-index bullet.

### 3.2 Navigation

Sidebar stays five entries, but **Labs** becomes a `SidebarGroup` whose `SidebarMenuSub` lists Sound / Chords. `components/ui/sidebar.tsx` already exports `SidebarGroup`, `SidebarGroupLabel`, `SidebarGroupContent`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, and is provenance `modified`, so using more of it adds **no** new provenance obligation. This is the "single Labs section with its own index" `docs/chords-lab.md:36` predicted for the third lab — reached one lab earlier, via a tab rather than a third entry.

Theory / Practice / Glossary each get an area index. Promotion rule: **a topic group becomes its own section when it has 4+ lessons or its own lab.** Notation qualifies immediately.

Replace the three nested page-title / H1 / subtitle ternary chains (`app/page.tsx:701-713, 762-793`) with a lookup keyed by area. Delete the hard-coded `6`, `0{i+1}` and `01`; derive counts through `lib/plural.ts`.

**Rename the German Practice label.** `lib/german.ts:14` has `Practice: 'Gehörbildung'`. Thirteen notation lessons whose exercises are visual would sit under a page called *ear training*. Proposal: `Übungen` (with `Gehörbildung` remaining the name of the ear-training *mode* inside it). This is a catalog-key value change plus a `docs/german-localization.md:5` update, and it belongs in the first notation PR.

### 3.3 Content layout — TypeScript modules, and why not JSON or MDX

Create `lib/content/`:

```
lib/content/types.ts          Lesson, Term, SourceRef, ExerciseRef, LessonId, TermId
lib/content/sources.ts        structured SourceRef records
lib/content/notation/staff-and-clefs.ts
lib/content/notation/accidentals.ts
lib/content/notation/note-values.ts
lib/content/notation/performance-marks.ts
lib/content/index.ts          frozen registry + byId maps; re-exports legacy `lessons`/`terms`/`curriculum`
```

Each topic-group file exports its lessons **and** its terms together, so a reviewer sees a topic in one diff. `Term.lessonId` is typed as the registry's `LessonId` union, so a dangling cross-link fails typecheck (today `lesson: 'sound'` is a plain string and a typo compiles).

**Decision: content stays in `.ts`.** Four reasons, in order of force:

1. `GermanKey = keyof typeof german` is a **type-level** guarantee. A `.json` file cannot participate; German text would move from a compile error to a runtime lookup or a schema test — exactly the fallback `CONTRIBUTING.md:47-48` forbids.
2. `authoredProductionCode` globs `lib/**/*.{ts,tsx}`, so a `.ts` content module enters the coverage denominator automatically while a `.json` file silently leaves it.
3. MDX or any untrusted-content pipeline collides with P07's *"untrusted notation/MDX не исполняется как код"* (`ROADMAP.md:140`).
4. Lessons must reference typed things — `SourceRef` ids, `LessonId` cross-links, `Wave`, exercise ids.

Fix the ergonomics instead of the format: **retire the duplicated `{de: german['X'], en: 'X', ru}` literal shape** (used by scales, chord qualities, progression templates, `quizIntervals`) in favour of `localText()` everywhere. Revisit only if a non-developer editor is actually onboarded — then generate the modules from data at build time, keeping the type-level guarantee.

**Do not split `lib/german.ts` into merged part-files.** It is one `as const` object literal (337 quoted keys, verified). A duplicate key inside one literal is TS1117; the same duplicate across spread-merged part-files is silently last-wins, `GermanKey` stays a valid union, and the parity test — which only walks `Object.entries(german)` — does not catch it. Earlier research recommended the split; it would destroy the guarantee it elsewhere calls decisive. If the file must be split later, the PR needs an explicit test comparing the sum of each part's key count against `Object.keys(german).length`.

**Point the parity walk at the registry root.** `tests/german-localization.test.mjs:45-55` inspects a hand-maintained literal array of content exports; a new module not added there is silently unchecked, and the `> 180` floor is no backstop because adding content only raises the count.

---

## 4. Notation technology — rendering and learner input

### 4.1 Candidates (licences verified 2026-09-07 against the npm registry; sizes measured from the official tarballs and reproduced independently)

| Package | Version | Licence | Payload (raw / gzip / brotli) | Self-contained SVG? | Offline / no-CDN | ARIA | Input |
|---|---|---|---|---|---|---|---|
| **Verovio** | 6.3.0 | **LGPL-3.0-or-later** | 7 126 / 2 290 / **1 759 KB** (wasm base64-embedded in one `.mjs`) | **Yes** — glyph outlines inlined in `<defs>`, `<use>` refs; `data-pname` / `data-oct` / `data-accid` per note | Yes (no second fetch) | none | none |
| **abcjs** | 6.7.0 | MIT | 499 / 144 / **123 KB**, no font, zero prod deps | **Yes** — glyphs as `<path>`; only `font-family` is `Times` | Yes | **8 `tabindex` + role/aria in emitted SVG** | `dragging:true`, `clickListener` gives a `step` delta |
| **OpenSheetMusicDisplay** | 2.1.2 | **BSD-3-Clause** (best licence in set) | 1 290 / 327 / **262 KB**, + VexFlow's fonts | No | needs fonts | 1 `aria-label` in the whole bundle | viewer only |
| **VexFlow** | 5.0.0 | MIT, no prod deps | core 328 / 90 / 73 KB; `./bravura` entry 711 / 378 / **360 KB** | No — `<text>` with `font-family="Bravura,Academico"` | `vexflow-core.js` contains `HOST_URL="https://cdn.jsdelivr.net/npm/@vexflow-fonts/"` — **only the bundled `./bravura` entry is no-CDN safe** | **zero** `aria-`/`role` matches | drawing API only; root emitted `pointer-events="none"` |
| **alphaTab** | 1.8.4 | MPL-2.0 | 1 092 / 273 / 219 KB + required 306 KB Bravura.woff2 + optional 954 KB soundfont | — | needs assets | — | guitar tab domain |

Two size facts worth stating: **woff2 does not compress** (Bravura measured 313 348 B raw → 313 353 B brotli), so any font-based engine's real floor is ~300 KB unless the font is subset; and Verovio's inline glyph outlines cost **~377 bytes raw per glyph** (measured: E050 G-clef 1 361 B, E0A4 black head 148 B, E263 𝄪 187 B, E264 𝄫 517 B, E261 ♮ 128 B, E262 ♯ 222 B, E260 ♭ 298 B), so the ~40 glyphs Kapitel I needs are **≈15 KB raw / ≈5 KB gzip** of `<path>` data — and unlike woff2 they compress.

### 4.2 First choice — a two-layer split

**(a) Exercises: hand-roll `lib/staff.ts`, drawn as inline SVG over `SpelledPitch`.**
Staff position = `letter + 7·octave` − clef offset; accidental index = `accidental + 2`. Encode every clef as one pair `{anchorDiatonic, anchorLine}` — the chapter's own claim that each clef names one pitch means there is **one formula and no per-clef table to get wrong**. Glyphs are inline `<path>` outlines extracted from Verovio at build time; **no webfont ships**. This buys total control of hit targets, `role` / `aria-label` / `tabindex` / arrow-key navigation and focus order — the things gate G's accessibility line requires and that no library gives correctly (VexFlow: zero ARIA; OSMD: one `aria-label`).

**(b) Engraved reading examples: Verovio 6.3.0 in Node at build time.** Verified working: self-contained SVG, `svgAdditionalAttribute: ['note@pname','note@oct','accid@accid']` puts pitch data on every notehead, double accidentals render (`data-accid` = `x` / `ff`), quarter tones render (`1qs`/`3qf`/`1qf`/`3qs`, E280–E283), MEI + MusicXML + compressed MXL input, `getMEI()` round-trips. **Zero runtime bytes, no CDN, and the interactivity is handlers on markup we own.**

**Do not ship Verovio to the browser.** The disqualifier is size — **1 759 KB brotli** — not the licence. (LGPLv3 §4(d)(0) is satisfied by shipping the library as a separately-replaceable file, and `verovio-module.mjs` already is exactly that; overstating the licence risk invites relitigation on weak ground.) Two licence obligations do survive and must be recorded:

- Verovio bundles **six** fonts — Leipzig, Bravura, Gootville, Petaluma, Leland **and Liberation** (the text face) — *all* under SIL OFL, per the upstream `fonts/README.md`. Any build-time SVG carrying text inlines Liberation outlines too.
- **Embedding glyph outlines in a document is what OFL permits without the document inheriting the licence. Shipping a subset `.woff2` as an asset IS font redistribution** and does carry the OFL notice/RFN obligations. Choosing outlines over a woff2 subset therefore avoids a `THIRD-PARTY-NOTICES.md` font entry as well as ~300 KB.
- Verovio's npm tarball ships **no licence text** (7 files: README, package.json, dist/×5). If it is added even as a devDependency, the LGPL-3.0-or-later text must be sourced from upstream `COPYING`/`COPYING.LESSER`, not copied out of `node_modules`. Record this in P08's SBOM item.

### 4.3 Fallback — abcjs 6.7.0

If hand-rolling is judged too costly, abcjs is the best ready-made choice for *practice*, and it is not close: MIT, zero dependencies, font-free self-contained SVG, notes already `tabindex`-focusable, `dragging: true` with a `step` delta. Accept its costs knowingly:

- **CommonJS-only** (`main: index.js`, no `module`, no `exports`, no `sideEffects`) — it will not tree-shake; you pay the whole 123 KB brotli including the synth and MIDI writer.
- **Its per-note class stack does not encode the accidental.** Re-running the render, `^^C` and `__B` both emit `abcjs-note abcjs-d0-125 abcjs-pN …` — duration and staff position only. `abcjs-pN` is a visual position, not a spelled pitch. For Cisis/Heses exercises the class stack **cannot score the answer**; a checker must read the parse tree (which does give `{pitch, acc:"dblsharp"}`).
- No three-quarter-tone or Arabic/Turkish accidentals.
- ABC as source format pulls against N06's committed MusicXML/MEI direction (`ROADMAP.md:768-769`, sources S14/S15).

### 4.4 Rejected

- **VexFlow as primary.** MIT and excellent glyph coverage, but: no release since 5.0.0, `vexflow/vexflow` has 234 stars against the dormant `0xfe/vexflow`'s 4 367; `vexflow-core` defaults to a jsDelivr CDN for fonts; output is not self-contained; **zero** ARIA; root emitted `pointer-events="none"`. It is a drawing API with no importer — it gives less than hand-rolling while costing 360 KB brotli (bundled `./bravura` entry, the only no-CDN-safe one).
- **OSMD** — best licence, but one `aria-label` in the bundle, VexFlow's webfont dependency, and no input story. Reconsider only if a MusicXML *viewer* becomes the priority and both LGPL and a build step are refused.
- **alphaTab** — wrong domain; only if N05 tablature ships.

### 4.5 What P05's engine bullet actually asks, answered

`ROADMAP.md:124` names five criteria plus a prototype: *licence, layout quality, accessibility, microtonal symbols, MusicXML/MEI limits*. Against them: licence — Verovio LGPL confined to build time, no runtime dependency at all; layout — Verovio's, for engraved examples; accessibility — ours, because we own the exercise markup; **microtonal symbols** — Verovio renders E280–E283 quarter tones today, and the hand-rolled path needs its own answer for anything beyond ±2 (see §5.3, and note this is load-bearing for 3.23 ajnas and 9.9 perde); MusicXML/MEI — Verovio reads both and round-trips MEI, so N06's subset work starts from a working importer.

### 4.6 The static-export test needs one new assertion

`tests/static-export.mjs` currently forbids `fonts.googleapis/gstatic` and sourcemaps. It does **not** forbid an arbitrary runtime fetch, so a renderer that pulls its glyph font from a CDN would pass today. If any engine lands, add an assertion that no emitted `.js` contains an `https://` origin outside an allowlist.

### 4.7 Learner input, ranked by value per unit of build-and-test cost

| Rank | Mechanism | Cost | Notes |
|---|---|---|---|
| 1 | **Multiple choice / typed note name** | ≈free | Tests as plain DOM in all three engines. DE/RU/EN labels come free from `pitchName` / `pitchLabel`. |
| 2 | **Click a staff position** | 1–2 days | An invisible `<rect>` per staff step keyed by `letter + 7·octave`. Real clicks test identically in chromium/firefox/webkit. **Only valid for name→staff**; wired to a *sounded* pitch it is unanswerable (Cis and Des are one key). |
| 3 | **Keyboard: tab + arrow keys** | ~1 day | Required by gate G's accessibility line anyway; same interaction as (2), so it tests through the same assertions. |
| 4 | **The existing Sound-lab piano** | already built | `app/page.tsx:1127-1183` — real buttons, aria-labels, `playNote`, octave 0–6, 15 white keys. Reuse it as the pitch-entry device. Caveat: it is a *keyboard*, so it can only express sounding pitch, never spelling — see §5.3(b). |
| 5 | **Drag a note** | moderate, flakiest | Reuse the pointer handling from commits `e1b3ee3` ("Keep the drag working without pointer capture") and `d08a11a` rather than re-deriving it. |
| 6 | **Web MIDI** | progressive enhancement only | Absent from WebKit and **every iOS browser** (caniuse `midi.json`: safari 18.0–26.6 and TP = `n`, ios_saf 18.0–26.6 = `n`; `usage_perc_y` 79.75). `ROADMAP.md:139` already mandates gesture-gated request with a simulator on refusal. The house rule for an engine-specific gap is an honest skip (as the audio suite does on WebKit), so untestability alone is not the disqualifier — the iOS learner is. |
| 7 | **Singing / microphone** | defer | Playwright can inject fake media in Chromium and Firefox but not WebKit, and pitch-detection accuracy is its own research problem. |

---

## 5. The exercise generator

### 5.1 Shape

The current `Practice` holds `{index, root, reference}` and grades with `i === question.index` against a module-scope array. Three properties do not survive generalisation: the answer identity is an array index (so nothing can express "right pitch, wrong spelling"); option labels are literal per-language strings on the option object (so a *generated* option has nowhere to put its label); and feedback is one ternary with no hint, no per-option explanation and no variation — three of the four things gate G's Тренажёр line requires.

Keep from it: gesture-gated answering (`hasHeard`), session-local score with reset, `count(...)` in every counted phrase, DE through catalog keys.

New, all pure and DOM-free so the unit project can test it:

```
lib/exercises/model.ts     Item, AnswerKey, Option, ErrorTag, RuleTag
lib/exercises/generate.ts  generate(kind, level, seed) -> Item     (pure)
lib/exercises/grade.ts     grade(item, answer) -> {bucket, tag, explanationKey, vars}
lib/exercises/rules.ts     clef anchors, accidental scope, tuplet written value
lib/staff.ts               geometry only; no engine
```

```ts
type Item = {
  kind: ExerciseKind; level: 1|2|3|4; seed: number;
  prompt: TemplateRef;   // catalog key + interpolation vars
  staff?: StaffSpec;     // declarative: {x, staffPosition, glyph, accidental, dots, beamGroup}[]
  answer: AnswerKey;     // structured, never a string
  options?: Option[];    // each with a diagnosis tag
  rule: RuleTag;         // the single rule that decides this item
};
```

`generate` is a **pure function of the seed** — reuse the deterministic 32-bit generator already in `tests/music-properties.test.mjs:18-27` rather than `Math.random`. That makes a failing item reproducible, lets a property test enumerate thousands, and lets the hash carry a shareable item on a static site with no runtime service.

Keeping `StaffSpec` declarative means the eventual engine replaces `lib/staff.ts` alone.

### 5.2 The 14 types

**Pitch (F03 + F01).** T1 name the notated pitch · T2 place a named pitch · T3 octave-region naming · T4 clef transformation · T5 enharmonic respelling · T6 accidental scope.
**Rhythm (F04 + F05).** T7 value identification · T8 dot arithmetic · T9 tuplet arithmetic · T10 tie/coupling sums · T11 beaming correctness (**ship last, unscored**).
**Hybrid (N02).** T12 ornament recognition (rubric, see §6.2) · T13 tempo/dynamics vocabulary · T14 short-excerpt reading.

T12 and T13 are **hybrid generators**: a curated table of rows (sign or term, stated practice/period, gloss per language, source with exact page) crossed with a *generated context* (which note, which clef, which key). The variation the learner sees is real; the claim is fixed and cited. Within T13, two sub-shapes are fully safe: ordering on the dynamic ladder (ordinal by definition) and metronome arithmetic. **Never ask for a total order of tempo words** — Adagio/Largo/Lento glosses overlap and ranking them is not defensible.

Every duration is `{num, den}` integers. No floats anywhere; that is itself an assertable property.

### 5.3 Ambiguity guards — items the generator must refuse to emit

These are the failure modes, each stated as a construction-time invariant:

**(a) The B/H cross-language collision.** `germanNotes[6] = ['Heses','B','H','His','Hisis']`. "B" is the correct **English** answer for letter 6 natural and, in German, names a *different* pitch. Distractors must be generated within **one** language's `pitchName` output and never mixed. This is the repo's own flagged central German risk (`docs/german-localization.md:14-16`, `tests/german-localization.test.mjs:76-98`) and it is exactly what F03's trainer line asks for: *"объяснять B/H и контекст написания"*.

**(b) Direction matters.** Written-note → name is unique; sounding-pitch → staff position is not. `keyboardPitch`'s own comment says so: *"Chromatic keyboard labels have no key context; prefer sharps… Degree-aware scale/chord spellings must continue to use `spellPattern` instead"* (`lib/notation.ts:169-172`). So a "name this key" item has two defensible answers for five of twelve keys unless the item supplies a key or degree.

**(c) T5 needs a range guard.** "Respell this on letter X" is unique only when the required alteration lands within ±2. Sounding C on letter G would need G♯♯♯ and `spellPattern` throws. Sample the target letter from the set within two diatonic steps of the natural spelling. Also state the closure rule (`gis–as` is a two-member item next to three-member ones) or the answer set is ambiguous.

**(d) Enharmonic items are 12-TET-only.** Every worked set from §7 is true only in equal temperament, and this product makes A4 and the tuning map user-variable (audit item 3, `ROADMAP.md:14`; the preset contract at `:55` requires the tuning/key map to travel). State the temperament in the stem. And `his′` and `c″` carry **different octave labels** (`docs/german-localization.md:20-24`) — a generator pairing them must not treat their octave names as interchangeable.

**(e) Never a bare whole rest.** The whole rest is also the whole-bar rest whatever the bar length, so without a shown time signature the item has no unique answer. Whole and half rests differ only by which side of the line they sit on, so the line must always be drawn.

**(f) T8 always names the unit.** A dotted quarter is 3 eighths *and* 6 sixteenths. Require that the unit's denominator divides the value.

**(g) T8's "may this be dotted here?" is arithmetic only.** "Dotting is only possible within a bar" is a pedagogical simplification: a dotted quarter on beat 2 of 4/4 fits perfectly and is discouraged engraving. Restate the item narrowly as *"does this dotted value fit the remainder of the bar"*, or drop it. Do not let a bar-total computation issue an engraving verdict.

**(h) T10's inverse is a rubric, not a key.** "Write this total inside this bar" deliberately has many answers. Accept any set of tied values summing exactly to the target without crossing a beat group untied, and show the preferred spelling with its reason. **Argue** the rubric clause rather than citing it: gate G scopes *"несколько допустимых решений с прозрачной рубрикой"* to `Для музыкального сочинения/анализа`, and writing a rhythm is a notation task. The PR must make the case, not take it by paraphrase.

**(i) T11 beaming: only generate pairs differing in a property we can state and cite** — one beam per flag (arithmetic), a group covering a beat, stem direction against the middle line. Everything the chapter itself calls variable (inner breaks, unlike values, vocal syllable beaming) is an unscored "both are used" reveal.

**(j) Range.** `spellPattern` accepts octave 0–8 and `keyboardPitch` MIDI 12–119, so an unconstrained generator emits Subkontra C₂ or h⁵ — eight-plus ledger lines, unreadable rather than hard. Clamp to a **rendered staff range**, not the model's validation range. And clamp anything *sounded* to MIN_MIDI 24 / MAX_MIDI 108, which means **Subkontra A/H items cannot be sounded** through the chord player.

**(k) T14 excerpts: generate → validate → reject and resample, never repair.** A repaired item silently drifts out of its difficulty band. Validity: bars sum exactly, accidentals obey §5 scope, beams group by beat, range fits the clef and ledger budget, every pitch is renderable and nameable in all three languages. Grade per note so one misread does not zero the excerpt.

### 5.4 Grading: three buckets, and the error tag does real work

Grade a structured answer component-wise, not as a boolean.

Pitch answer `{letter, accidental, octave}`:

| Diff | Bucket | Explanation |
|---|---|---|
| all three equal | correct | — |
| letter + accidental equal, octave differs | **near miss** | *right note, wrong register* — restate the clef's anchor |
| sounding MIDI equal, spelling differs | **near miss** | *right key, wrong spelling* — show the enharmonic pair and why a composer chooses one |
| letter equal, accidental differs | **near miss** | *you read the note but not the sign* — quote the one scope rule that decides it |
| letter off by two diatonic steps | wrong | the ledger/third misread |
| letter = what the *other* clef reads at that position | wrong | clef confusion |

Duration answer `{rational, dots, tuplet}`: rational equal but written form differs (dotted quarter vs quarter tied to an eighth) → **correct**, with a note, because the chapter's own §8f says any value couples with any other. Base right / dots wrong → the `×(2 − 2^−dots)` arithmetic. Off by a factor of two → one level of the halving chain. Tuplet total right, written value wrong → the §8d convention.

Three buckets are **reported separately**; the current single `Progress` percentage would hide the distinction. The tag then selects the next item — hold the clef and register fixed when the error was register, hold the same scope rule when it was scope. That mechanically delivers gate G's *"подсказка, новая вариация и повторение"* instead of hand-written remediation. Keep tag counters in session state; do not invent a persistence format — **P03** owns local progress with export/import/reset and versioned migrations.

### 5.5 Tests

Follow `tests/music-properties.test.mjs` — seeded generator, hundreds of runs, exact reproduction. Assert invariants, not fixtures.

**Universal (every type × level × N seeds):**

- **Determinism** — same seed deep-equals. This is what makes a failure reportable and a URL shareable.
- **Renderability — but not the naive version.** "Call the labelling functions and assert they don't throw" is unsound: `pitchName({acc:3},'en')` returns `"Cundefined"`, `octaveName({octave:9},'de')` returns `undefined`, and `pitchLabel({octave:-1},'de')` returns a plausible-looking `"C₁"`. Only `spellPattern` and `keyboardPitch` validate. So: **(i)** every pitch in an item is constructed through `spellPattern` or `keyboardPitch`, or the PR adds an explicit `assertSpelled(pitch)` guard to `lib/notation.ts`; **(ii)** the property compares the rendered label against an independently computed expected value, not against "something non-empty".
- **Answer uniqueness, per language** — exactly one option equals the key, and no distractor collides with it in **any** of en/ru/de.
- **Round-trip** — render a pitch as a name in each language, parse it back with a new `parsePitchName`, get the same triple. The single strongest invariant available: it catches the H/B collision and the enharmonic octave-boundary bug at once.
- **Grading totality** — grading every offered option returns a known tag and a non-empty explanation; nothing falls through to a generic "wrong".
- **Near-miss classifier by construction** — inject a synthetic wrong answer of each named class, assert the classifier returns that class.
- **Non-degeneracy and monotonicity** — ≥ K distinct items over N seeds; no consecutive repeat; a difficulty proxy (ledger count, accidental magnitude, rational denominator, number of rules) non-decreasing in level, asserted statistically.
- **Localization hygiene** — no rendered string contains an unreplaced `{`, the text `undefined`, or a fragment from another language's catalog; every referenced template exists in `german`.

**Type-specific oracles, written independently of the generator:**

- Clef→pitch: the diatonic formula against a hand-written table of the four anchors (G/2 = g′, F/4 = F, C/3 = c′, C/4 = c′). Two implementations, one assertion. **Add the treble-8vb row** or explicitly scope it out — it is standard for tenor voice and guitar, and a four-row table mis-teaches exactly those readers.
- Accidental scope: a brute-force evaluator walking the bar keeping a map keyed by `(letter, octave)`, resetting at the barline and honouring tie carry-over, written separately, agreeing with the generator on every seed; exactly one rule tag decides each item. Generator invariant: **single voice, single clef inside the item** — German practice repeats the sign for a second voice in a divided system and after a mid-bar clef change, and the second bears directly on T4.
- Accidentals do not add: for every signature × every written accidental on the same letter, the result is the written one and `|result| ≤ 2`.
- Durations: no floats; tuplet members sum exactly; bars sum exactly; nothing crosses a barline except as a tied pair.
- **Tuplet written value: the oracle must be a hand-entered table transcribed from a citable source, not the formula.** `written = base / 2^floor(log₂ n)` reproduces the chapter's enumerated cases and matches the mainstream rule, but it is a **publisher convention with live alternatives** (7:8 is supported and used). Testing the implementation against its own formula proves nothing.
- Enharmonics: the four worked sets as a fixture **plus** the property that the full ±2 spelling set of any pitch class is exactly what the generator offers.

**Browser layer** (`tests/browser/*.test.mjs`, `.mjs` only, top-level only — the project globs `tests/browser/*.test.mjs`): render N seeded items and assert SVG geometry — head `y` equals the computed staff position; ledger lines appear exactly for positions outside the staff; the accidental sits on the same line or space as its head (§6's placement rule is testable geometry) — plus keyboard operation. **Sounded assertions run on Chromium and Firefox only**; WebKit skips (no Web Audio), and Firefox lacks `OfflineAudioContext.suspend`, so mid-render stops are Chromium-only.

---

## 6. Trilingual terminology

The English column **is the `lib/german.ts` key set** — `Translate = (en: GermanKey, ru: string) => string`. So English terms must be settled *before* any German or Russian string is written; a later change is a repo-wide rename. **Use US spellings for keys** (the catalog is already US-flavoured) and teach the UK doublets (semibreve/minim/crotchet, bar/measure, leger, "pause") as *content* in T7 and T13 — the UK/US duality is itself part of what this chapter should teach.

### 6.1 Settled rows (verified this session)

| Concept | DE | EN key | RU |
|---|---|---|---|
| staff | das Notensystem / Liniensystem | staff | нотный стан (нотоносец) |
| staff line / space | die Notenlinie / der Zwischenraum | staff line / space | линейка / промежуток |
| ledger line | die Hilfslinie | ledger line | добавочная линейка |
| note head / stem / flag / beam | Notenkopf / Notenhals / Fähnchen / Balken | note head / stem / flag / beam | головка / **штиль** / флажок / **ребро** |
| clef | der Notenschlüssel | clef | ключ |
| treble / bass / alto / tenor clef | Violinschlüssel / **Bassschlüssel** / Altschlüssel / Tenorschlüssel | treble / bass / alto / tenor clef | скрипичный / басовый / альтовый / теноровый ключ |
| **accidentals (cover term)** | **die Akzidentien** | accidental | знаки альтерации |
| **key signature** | **die Vorzeichnung** (one sign: *das Vorzeichen*) | key signature | ключевые знаки |
| **in-bar accidental** | **das Versetzungszeichen** | accidental (in the bar) | случайный знак |
| natural | das Auflösungszeichen | natural | бекар |
| octave sign | das Oktavierungszeichen | octave sign | знак октавного переноса |
| tie / slur | **Haltebogen / Bindebogen** | **tie / slur** | **лига продления / фразировочная лига** |
| rest / whole-bar rest | Pause / Taktpause | rest / whole-bar rest | пауза / тактовая пауза |
| barline / double bar / final bar | Taktstrich / Doppelstrich / **Schlussstrich** | barline / double barline / final barline | тактовая черта / двойная черта / заключительная черта |
| repeat sign / volta | Wiederholungszeichen / Klammer (1., 2.) | repeat sign / first-and-second ending | знак репризы / вольта |
| ornaments | die Verzierungen | ornaments | мелизмы |
| turn | der Doppelschlag | turn | **группетто** (not a calque) |
| agogics / fermata / metronome mark | Agogik / Fermate / Metronomzahl | agogics / fermata / metronome mark | агогика / фермата / метрономическое обозначение |
| dynamics / hairpin | Dynamik / **Gabel** | dynamics / **hairpin** | динамика / **вилочка** |
| articulation types | Artikulationsarten / Spielarten | articulations | **штрихи** (a Russian category German and English lack) |
| figured bass | der **Generalbass** | figured bass (thoroughbass) | генерал-бас / цифрованный бас |
| equal temperament | **gleichstufige Stimmung** | 12-tone equal temperament | равномерный строй |

Note the last row: **reuse the shipped keys.** `lib/german.ts` already has `'12-tone equal temperament': 'Zwölfstufige gleichstufige Stimmung'` and `lib/learning.ts` already ships `Equal temperament` / `Равномерный строй`. Introducing "die temperierte Stimmung" / "равномерная темперация" would be a literal mapping *and* a competing key.

**German orthography:** the book predates the 1996 reform (`Baßschlüssel`, `Generalbaß`). The repo's German is post-reform throughout (`außerhalb`, `Größe`). Normalise: `Bassschlüssel`, `Generalbass`, `Schlussstrich`.

### 6.2 The five traps — get these wrong and the product mis-teaches

**Trap 1 — Vorzeichen / Versetzungszeichen / Vorzeichnung.** Verified against `de.wikipedia.org/wiki/Versetzungszeichen`: *Akzidentien* is the cover term; *Versetzungszeichen* apply to exactly the designated pitch and only within the bar; *Vorzeichen* stand at the head of the system and affect all octaves for the whole section. **Russian matches German 1:1** (ключевые / случайные знаки). **English does not**: EN *accidental* is used loosely for both, and EN *key signature* names the whole set — so the true equivalent of "key signature" is *Vorzeichnung*, not *Vorzeichen*. `docs/german-localization.md:58` already writes "Vorzeichnungen". Ship separate keys; never reuse one "accidental" key for both.
Earlier research claimed these have "no one-word English equivalents" — that is backwards. English is precise here (*key signature* / *accidental*). The ambiguity to design against is EN→RU for tie/slur, not DE→EN.
Also: do **not** title a lesson "die fünf Versetzungszeichen" while another lesson teaches the Vorzeichen/Versetzungszeichen split. The five signs are *Akzidentien*.
Also: the in-bar scope binds the **Oktavlage**, not the *Tonstufe* — in German theory *Tonstufe* means scale degree.

**Trap 2 — Mordent / Pralltriller reverse between German and Russian.** Verified in both encyclopedias. German: *"Pralltriller: einmaliger, kurzer Wechsel mit der nächsthöheren leitereigenen Note … Mordent: … mit der nächst unteren."* Russian: unqualified **мордент** = auxiliary a second **above**; **перечёркнутый мордент** = a second **below**. So **German Mordent = Russian перечёркнутый мордент**, and **German Pralltriller = Russian (простой) мордент**.
Consequences: (i) never print a bare "mordent" or a bare "мордент" anywhere in the product — always qualify *upper/lower* and *перечёркнутый/неперечёркнутый*; (ii) **drop "inverted mordent" entirely** — 19th-century English used it for the *lower* sign while modern software often uses it for the *upper*, so it is ambiguous in precisely the way this table exists to remove; (iii) **ornament recognition (NA56) is not safe as a scored item either** — the same printed sign has a different correct answer per interface language, which `CONTRIBUTING.md:154-156` forbids. Teach sign-first with all three traditions' names side by side, under a rubric.
Do **not** ship `Pralltriller = Schneller` as a synonym: `de.wikipedia.org/wiki/Pralltriller` does not equate them and records a period split (before 1800 from the upper auxiliary, after 1800 from the main note); Grove and C. P. E. Bach distinguish the prepared Pralltriller from the free Schneller. **[needs a page-exact source before it ships in any form]**

**Trap 3 — Akkolade / system / brace: three languages, three different cuts.** German *Akkolade* = the group of joined staves (*Klammer* = the sign). Russian **акколада** = *the sign* — "скобка, посредством которой соединяются две или несколько систем" — and the group is *система*. English splits cleanly: *system* = the group, *brace/bracket* = the sign. So two separate glossary entries are mandatory, and the English text must say **staves**, not "systems": "two staves joined by a brace form one system", "the organ uses three staves". Writing "read two bracketed systems as one instrument" is right in German and wrong in English.

**Trap 4 — `лига` covers both tie and slur in Russian.** German and English are precise (Haltebogen/Bindebogen, tie/slur). Every Russian occurrence must carry its qualifier — *лига продления* / *фразировочная лига*, *залигованные ноты*. A generated item asking "Haltebogen or Bindebogen?" rendered in Russian with a bare *лига* has **no correct answer**. (It is also genuinely ambiguous in any language for a unison between two voices, and for a repeated note under a phrase slur — exclude both from scored items.)

**Trap 5 — `das B`.** In German the flat *sign* is called "das B" while the *note* B is English B♭. A German lesson on §5 followed by §6 is genuinely ambiguous. Fix in prose by writing **b-Vorzeichen** for the sign in those two lessons; do not rename the sign.

Two smaller ones worth a glossary note each: **UK "pause" = fermata but German "Pause" = rest** (never render *Fermate* as "Pause"); and **реприза** = repeat sign *and* the recapitulation in sonata form.

### 6.3 Rows I am **not** confident in — mark for the reviewer

| Term | Status |
|---|---|
| *Stammton* → EN "natural note" | Attested in current usage, but needs a page-exact reference work. |
| *Notationsorthographie* → "notational orthography" / "орфография нотной записи" | The book appears to coin it by analogy with spelling. Ship as **the book's metaphor, attributed**, not as standard vocabulary. |
| Space-Notation, Aktionsschrift, Griffschrift → Russian | No settled Russian equivalent found. Prefer the verified umbrella **графическая нотация / graphic notation**, or describe rather than name. |
| *Schleifer* → RU **шлейфер** | Better attested than earlier research suggested (headword in `ru.wikipedia/Мелизмы`). Keep it; do **not** substitute "двойной форшлаг" (a different ornament) or "слайд" (collides with the guitar technique). |
| Dreihalbe-/Dreiviertel-/Dreiachtelnote | **Archaic German.** Current pedagogy says *punktierte Ganze / Halbe / Viertel*. Ship only as historical vocabulary — and note that *Dreiviertelnote* is one letter from *Dreivierteltakt*. |
| Rest names below the quarter in Russian | Regular derivations of verified duration names; standard usage, but unverified against a reference work. |
| The Punkt-vs-Keil claim (NA74) | **Contested, not settled.** Before ~1850 dots, dashes and wedges were largely interchangeable in autographs; Henle and Bärenreiter practice still differs. Rating 2.17 "complete" from one German pedagogic chapter would install a school position as fact. Present as one tradition's reading, dated. |

### 6.4 Plural nouns

`lib/plural.ts` `nouns` holds only `beats`, `chords`, `octaves`, `semitones`. New counters with tests: **bars, beams, ledger lines, rests, dots, notes** (Russian needs three forms each: такт/такта/тактов, ребро/ребра/рёбер, линейка/линейки/линеек, пауза/паузы/пауз, точка/точки/точек, нота/ноты/нот).

### 6.5 A placeholder helper

`lib/i18n.ts` has no placeholder function; `scaleName` open-codes `title.replace('{tonic}', …)` against `german.ts`'s existing `{tonic}` convention. Generalise into `format(key, ru, vars)` rather than repeating the replace. This is what keeps typecheck safety intact for generated items: the *text* is always a fixed template plus interpolated values from `pitchName`/`octaveName`/`count`, never concatenated translated fragments.

---

## 7. ROADMAP mapping, proposed new items, and gate G

### 7.1 Exact ids

**Primary — full theory/encyclopedia substance:**

| Module | Topic | Line | Coverage from this chapter |
|---|---|---|---|
| **F03** | 2.1 Нотный стан, добавочные линии | 237 | full (Allg. + §3) |
| **F03** | 2.2 Ключи: скрипичный, басовый, до-ключи | 238 | full (§2) |
| **F03** | 2.4 Знаки альтерации, ключевые знаки, энгармоника | 239 | full and unusually detailed (§5, §6, §7) |
| **N02** | 2.16 Динамика | 699 | full (§15b) |
| **N02** | 2.17 Артикуляция и фразировка | 700 | full, **but the dot/wedge claim is contested** (§16) |
| **N02** | 2.18 Украшения | 701 | **recognition only, under a rubric** — not "full" (§6.2) |
| **N02** | 2.19 Аббревиатуры, знаки повторения, формальная разметка | 702 | full (§10 + §12) |

**Secondary — durational and tempo substance:**

| Module | Topic | Line | Coverage |
|---|---|---|---|
| **F04** | 2.5 Длительности и паузы | 254 | full (§8a, §9) |
| **F04** | 2.15 Темповые обозначения, метроном | 256 | full, **history needs its own source** (§15a) |
| **F05** | 2.6 Точки, лиги, сложные длительности | 271 | full (§8b, §8f) |
| **F05** | 2.7 Триоли и другие деления | 272 | full and beyond the usual (§8c–e) — **written-value rule is a convention** |
| **F05** | 2.9 Группировка длительностей | 273 | partial — grouping *by metre type* is not teachable here |
| **F04** | 2.8 Такт, размер, простые и сложные метры | 255 | **partial and support-only** — the chapter uses the bar but never introduces metre |

**Half-topics:**

| Module | Topic | Line | Coverage |
|---|---|---|---|
| **F01** | 2.3 Названия нот … октавные обозначения | 204 | The chapter supplies the German system (Stammtöne, the nine registers). Its English and Russian counterparts come from elsewhere; solmization is absent from the chapter entirely. |
| **F07** | 3.21 Порядок ключевых знаков | 309 | **placement half only** — the fifths order and fixed positions; *why* a key has those signs belongs to F07's own topics. |

> **On 2.3 and audit item 10.** Both name the English, German and solmization
> systems, and audit item 10 adds B/H and scientific/Helmholtz/Russian octave
> conventions. Those are instructions to whoever **builds and translates** the
> site — they tell us which tradition each language version must use — not a
> syllabus for the reader. Settled by the owner. §0a stands: each language
> version teaches its own system, and the comparison lives in one encyclopedia
> article (§2.4a). Solmization is absent from this chapter in any case.

**Adjacent — cross-links only, do not claim coverage:** N01 2.14 (accent *sign* only; 2.10–2.13 absent) · N03 2.21 (clef-per-instrument + Akkolade) · N04 2.22/2.23 (three footnote-level facts: chant's four lines, relative vs mensural values, mensural-derived multi-bar rests) · N05 2.24/2.26 (overview depth; 2.27 absent) · N06 13.11 (real engraving conventions, but stated for the hand-writing student) and 2.28 (absent) · F08 4.21 / H03 4.22 / H04 4.18 (one comparative sentence each) · F07 3.20 (accidental order is a fifths order, but quintal kinship is never taught).

**Explicitly NOT covered — do not let anyone claim these:** 2.10–2.13, 2.20, 2.25, 2.27, 2.28, 3.5, 3.9, B6, B7, and all of A*, C*, D*.

**Two ceilings to state in every PR:**

- F03 can never be closed from this chapter however complete 2.1/2.2/2.4 look, because **B6** (sight-reading methodology) and **B7** (fixed/movable do) get nothing from it — and F03's lab line at `:244` explicitly requires *"переключение ключей, fixed/movable do"*. Same for F04, whose A4 and B12 are untouched, and F05, whose A5 and A16 are untouched.
- Citing this chapter from F03 also requires editing F03's own `Источники для разработки: S03,S05.` line (`:235`); `tests/roadmap.test.mjs:66-75` validates each S-code against the section-7 table.

### 7.2 New items — editorial/engineering only, no new topic ids

Earlier research proposed four new *learning* topics (octave signs, Akkolade/clef assignment, writing conventions, tempo-and-loudness words). **That proposal is dropped.** `ROADMAP.md:7` authorises separate codes for *"новые инженерные и редакционные задачи"* — engineering and editorial tasks — while asserting the fixed invariants "511 уникальных исходных ID" and "128 модулей". `tests/roadmap.test.mjs:23-40` enforces both. And three of the four duplicate existing ids anyway: the Akkolade/clef-assignment content **is** 2.21's scope; the beaming half of "writing conventions" is 2.9 and its stem/placement half is 13.11; calando/morendo sits between 2.15 and 2.16 as a scope note.

Instead, the chapter's four genuine gaps land as **scope notes recorded in `docs/notation-chapter.md`** and attached to the owning ids:

| Gap | Home | Form |
|---|---|---|
| Oktavierungszeichen (8 / 15, whole-system octaving) | **2.1** (the chapter presents it as the alternative to Hilfslinien) | scope note |
| Akkolade, staff count, clef-per-instrument | **2.21** (N03) with a forward cross-link from 2.2 | scope note |
| Stem direction, beam grouping, accidental placement | **2.9** (student writing) with the engraving half deferred to **13.11** | scope note, with the boundary stated |
| calando / mancando / morendo / perdendosi / smorzando | **2.16**, cross-linked from 2.15 | scope note |

Genuinely new items, in the P-series where the roadmap allows them:

```
### P06
- [ ] Внести немецкое учебное пособие по нотации в реестр источников отдельным S-ID:
      автор, заглавие, издание/год, издатель, ISBN, точные печатные страницы главы I,
      дата доступа, reviewer. Отдельно зафиксировать, что разрешение издателя на
      факсимиле и нотные примеры не переходит вместе с фактами.
- [ ] Внести Beck/Bauser, Theorie D2/D3 в реестр источников отдельным S-ID:
      источник уже используется в lib/notation.ts и tests/german-localization.test.mjs,
      но отсутствует в таблице §7. Починить разрыв таблицы перед строкой S30.

### P02
- [ ] Расширить схему термина энциклопедии: id/slug, синонимы, транслитерация,
      школа/эпоха, перекрёстные ссылки, пометка омонима, SourceRef. Текущая запись
      {title, body, lesson} не удовлетворяет строке «Энциклопедия» в G.

### P05
- [ ] Именованные английские октавные регистры (Helmholtz) рядом с scientific pitch:
      octaveName(p,'en') сейчас возвращает только `octave N`. Изменение контракта
      отображения требует правки docs/music-notation.md в том же PR.
- [ ] Исправить components/learning.tsx:301-302: слуховой тренажёр вызывает
      frequencyForMidi без карты строя и потому всегда звучит в 12-TET.
```

### 7.3 What gate G demands before any `[x]`

Applied to this chapter, layer by layer (`ROADMAP.md:44-53`):

- **Объём и результат (:44)** — the hard part is the **school frame**. This is one German pedagogic tradition. Its Vorzeichen/Versetzungszeichen split, its "Notationsorthographie" stance (right and wrong spellings), its middle-line stem rule, its tuplet written-value rule and its register names must be **attributed**, not presented as universal. Audit items 4 (`:16`) and 10 (`:22`) already demand this.
- **Теория (:45)** — the gate text says **EN/RU**; the EN/RU/DE requirement for new content comes from `CONTRIBUTING.md:52-54` and `ROADMAP.md:122` (which downgrades the older EN/RU wording to "минимальная база"). Cite those, not the gate line, or a reviewer will read `:45`/`:51` as the operative requirement. "Каждое проверяемое существенное утверждение связано с источником и конкретным местом" means page-level citation into a book whose author, edition, publisher and ISBN are currently unknown from the scans.
- **Лаборатория (:46, :55)** — the notes lab; the preset must carry `topicId`, language, schema version, reference pitch, tuning/key map, material and tempo.
- **Тренажёр (:47)** — the chapter's 39 questions and 4 tasks **[unverified counts]** are raw material, not a trainer: no feedback, no hint, no variation, and they would have to be re-expressed rather than transcribed.
- **Энциклопедия (:48)** — blocked twice: on the term schema (§2.4) and on stable URLs (§3.1).
- **Редакционная проверка (:49)** — *"Если reviewer пока отсутствует, статус остаётся draft."* `docs/german-localization.md` records that independent German music-theory and language review is still outstanding; the same gap blocks everything sourced here, and the Russian column needs its own reviewer, who is named nowhere in the repo.
- **Права (:50)** — separate bases for text, score edition, composition, performance, phonogram, image, **font** and data. See §9.
- **Качество (:51)** — vitest unit + the chromium/firefox/webkit browser project for every changed module.
- **Приёмка (:53)** — merged PR, commit hash, green CI, in the pattern P00 already uses. Plus the section-6 preamble at `:194`: *"пригодность конкретной главы и права ещё проверяются по G"* — **one chapter of one textbook cannot close a topic, however complete its coverage looks.**

---

## 8. Delivery order

Each stage is a separate PR set with its own evidence. **No stage before S5 touches a `[ ]`.**

| Stage | Contents | Depends on | Touches roadmap? |
|---|---|---|---|
| **S0 — Source record** | Beck/Bauser gets an S-ID in §7 (it already drives shipped code); the §7 table break before S30 is fixed; the P06 and P02 items above are added. `docs/notation-chapter.md` created with the 79-atom inventory and the terminology table. | — | Adds P-items only |
| **S1 — Routing and IA** | `routeFromHash` beside the untouched `pageFromHash`; Labs sidebar group; per-area indexes; the three ternary chains replaced by a lookup; hard-coded `6` / `0{i+1}` / `01` removed and routed through `plural.ts`; DE `Practice` label renamed. **German-minimal**, not German-free: every new structural label needs a `german.ts` value or typecheck fails — list them in the PR body for the pending reviewer. | S0 | No |
| **S2 — Content registry** | `lib/content/` with `types.ts`, `sources.ts`, `SourceRef`, typed `LessonId` cross-links; the existing six lessons and twelve terms moved, **none added**; the German parity walk repointed at the registry root; term schema extended per P02. | S1 | No |
| **S3 — Sound lab extraction + tab shell** | `components/sound-lab.tsx` extracted (a pure move, ~440 lines, no behaviour change); `<Tabs>` shell; `.lab-tabs` CSS; both new components registered in `authoredProductionCode`; `read_sound_lab` semantics documented. Ships with the tone generator only. | S1 | No |
| **S4 — Engine spike (P05)** | `lib/staff.ts` geometry + a build-time Verovio glyph-outline extractor; one exercise ("name this note", violin and bass clef, ledger lines, all five accidentals, DE/RU/EN labels from `pitchName`) answered by MC, typed name, and click-on-staff; tested in all three engines with real clicks and keyboard events; the new static-export assertion. **This is the artifact `ROADMAP.md:124` asks for.** | S2, S3 | Closes P05's engine bullet only |
| **S5 — F01 tranche** | **T3** (note names and registers, per language) + the T3 practice types + ~20 glossary entries. **Needs no renderer.** Advances 2.3, which sits in the roadmap's designated first public release. Also lands the EN Helmholtz register work. | S4 (or independently — T3 is renderer-free) | 2.3 evidence |
| **S6 — Duration model** | `lib/exercises/` rationals, tuplets, ties, meter/grouping — P05 bullet 2. **Must state what happens to the existing `figures[].rate` subdivision layer** in `lib/chords.ts:526-549`, which is a partial rhythmic model already sourced to Hutchinson. | S4 | Closes P05 bullet 2 |
| **S7 — F03 tranche** | **T1, T2, T4, T5, T6** + exercise types T1–T6 + the notes-lab clef/accidental/enharmonic surfaces + ~35 glossary entries. | S5, S6 | 2.1, 2.2, 2.4 evidence |
| **S8 — F04 tranche** | **T7, T10** + rest and metronome exercises + the tempo/agogics glossary. | S6, S7 | 2.5, 2.15 evidence |
| **S9 — F05 tranche** | **T8, T9** + dot/tuplet/tie exercises; T11 beaming unscored. | S8 | 2.6, 2.7, partial 2.9 |
| **S10 — N02 tranche** | **T11, T12, T13** + the performance-marking overlay + the ornament rubric. N02 depends on F03 and F05, so it cannot jump the queue — note this refutes the intuition that the renderer-free dynamics lesson should ship early. | S7, S9 | 2.16, 2.17, 2.19; 2.18 partial |

**Critical path:** S0 → S1 → S2 → S3 → S4 → (S5 ∥ S6) → S7 → S8 → S9 → S10.
**Fastest visible value:** S5 (T3) needs no renderer and no duration model, and it is the only tranche that advances the roadmap's first release.

---

## 9. Copyright and sources

### 9.1 What we may take

Facts. That a treble clef fixes g′ on the second line; that a dot adds half the value; that a key-signature flat plus a written flat is not a double flat; that the seven flats go b es as des ges ces fes. These are re-expressible in our own words and enter the CC BY 4.0 corpus.

The repo already has the model to copy, at `lib/chords.ts:560-565`: *"Section text is not reproduced; only the harmonic pattern, which is a fact rather than prose."*

### 9.2 What we may not take

- **The wording.** Every definition independently written. `CONTRIBUTING.md:171`: *"Do not copy chapters, unlicensed scores, or audio files."*
- **The music examples.** The Bach *Matthäuspassion* beaming example lives in a specific edition's engraving; the Kupkovic *Das Fleisch des Kreuzes* facsimile is reproduced under a permission granted to that publisher **[unverified — I cannot read the scan; the general rule applies regardless]**. Neither permission travels. `ROADMAP.md:190` states plainly that citing a textbook does not license copying its chapters, musical examples or recordings.
- **The exercise apparatus.** The 39 questions and the four *Aufgaben* are the book's expression, and their selection and arrangement are protected too. Do not translate the question list, do not port its ordering, do not reproduce the printed staves. Deriving an internal **concept inventory** as a coverage map for the generator is fine and is what §1 does; publishing anything that reads as a rendering of the question list is not.
- **The compiled word lists.** The tempo-word, Agogik, character-word and ornament tables are the chapter's own *selection and ordering*. Re-expressing individual glosses is fine; reproducing the list's membership and sequence reproduces the compilation. Build each list from an independently sourced inventory and cite the chapter only for claims it uniquely supports.

### 9.3 What must be recorded

Per `CONTRIBUTING.md:146-151` and `ROADMAP.md:2313-2316`, each source record carries **author, title, edition/year, publisher/institution, DOI/ISBN/URL, exact page/section, access date, language, scope, reviewer**.

Three specific records:

1. **The scanned book.** Cannot be cited at all yet — a running head is not an author. The scans give only *Musiklehre* and printed pages 1–32. Until author, exact title, edition, year, publisher and ISBN are established, it is a **structural guide only**, and no evidence line may name it.
2. **Beck/Bauser, *Theorie D2/D3*, Demoausgabe 2012, Musikverlag Wolfram Heinlein für BBMV/VBSM.** Already recorded in `docs/german-localization.md:54-60` with printed pp. 6 (Oktavlagen), 8–10 (alterations and exceptions), 12–17 (keys and the three minor forms), 83–85 (seventh chords). **It covers NA12–NA17 and NA18/NA23/NA24 and nothing else.** Rests, dots, tuplets, ties, beaming, repeats, ornaments, tempo, dynamics and articulation each need a new verified source. It is a demo PDF with no ISBN (URL only), and the doc warns the PDF viewer's paging differs from the printed numbers — every per-claim record must carry both.
3. **Claims that need their own reference work before they ship** — none of these can rest on the chapter:
   - The clef anchors (NA05) — the *first* type we plan to ship has no source in the repo today.
   - The tuplet written-value convention (NA40) — cite Gould, *Behind Bars*, or Read, *Music Notation*, with edition and page, and name it as a convention.
   - The b quadratum / b rotundum history (NA13) — two competing readings exist in the literature (a scribal misreading of the round b; a deliberate German adoption of H). Teaching either as *the* reason breaches `AGENTS.md:28-31`.
   - The Mälzel/Winkel history (NA68). I verified that Winkel's double-weighted pendulum is dated **27 November 1814** and that Mälzel added a scale and patented it; sources also give a **French patent in 1815**. I found **no documented lawsuit** assigning the invention to Winkel — only contemporary dispute in German musical letters. The chapter's account is therefore at least incomplete and possibly wrong; it needs an independent reference work.
   - The ♮♯ / ♮♭ cancellation rule. German references describe these as **veraltet** — including `lehrklaenge.de`, which is already **source #2 in `docs/german-localization.md`**. A scored item keyed to the book's rule would mark the modern spelling wrong while contradicting the project's own recorded source.
   - The Punkt-vs-Keil distinction (NA74) — a live editorial dispute; date it.

`AGENTS.md:28-29` is the governing sentence: *"Educational statements need verified sources with exact edition/page/section or timecode. AI output, search snippets, and book contents are not evidence."*

### 9.4 Font and asset rights

Under the recommended design **no font ships**: glyph outlines are extracted at build time and inlined as `<path>`, which is what SIL OFL permits without the document inheriting the licence. If the fallback path is taken and a subset `.woff2` is shipped, that **is** font redistribution and needs an OFL entry in `THIRD-PARTY-NOTICES.md` with the reserved-font-name constraint honoured. Gate G names **шрифт** as its own rights basis (`:50`), so record the decision either way. Verovio-as-a-devDependency needs its LGPL text sourced from upstream, since its tarball ships none.

One rights item the plan does **not** solve: N04's lab line requires *"сопоставить лицензированный факсимильный фрагмент"* (`:738`). Verovio renders the transcription half only; the licensed facsimile is a separate acquisition and is the harder half.

---

## 10. Open questions, and what I need from you to close them

1. **What is the book?** Author, exact title, edition, year, publisher, ISBN, and the printed page range of Kapitel I. Without it nothing here can be cited and no gate-G evidence line can be written. → *Needed before S0.*
2. **Where does it go — a new `S33` row in ROADMAP §7, or an entry in `docs/german-localization.md`?** The precedent is mixed: the German sources actually in use (Beck/Bauser, Gorski, Helke, Feilen et al.) live in the doc, not the register — but Beck now drives shipped code and shipped tests, which argues for the register. My recommendation: **both get S-rows**, because `tests/roadmap.test.mjs` validates module source-lead lines against that table and F03 will need to name one. → *S0.*
3. **Does the Notes lab honour the Sound lab's tuning map?** I recommend **yes**, and that the same PR fixes the ear trainer's 12-TET call at `components/learning.tsx:301-302`. Saying no is also coherent, but then it must be documented the way `docs/chords-lab.md` documented the opposite decision — what is not acceptable is two exercises in one product disagreeing about what the tuning control means. → *Before S3.*
4. **English octave naming.** Two options: (a) the EN interface keeps scientific pitch as the graded answer and teaches Helmholtz register names as vocabulary — different learning objective, honestly labelled; or (b) EN gains named registers as an explicitly labelled second display mode. Audit item 10 already commits the *content* to covering both, but `docs/music-notation.md:10` and `CONTRIBUTING.md:26` fix the *display* contract to scientific pitch, so (b) means editing a documented contract. I recommend **(a) with the names taught in T3**. → *Blocks S5.*
5. **Is the hash scheme (`#theory/notation/clefs`, `#glossary/versetzungszeichen`) acceptable as the "устойчивые URL" gate G and P04 require, or must these be real paths?** The answer decides whether P04's static-export/deep-link checkbox is spent now, and whether Astro islands (S23) re-enters scope for a large lecture corpus. → *Blocks S1.*
6. **13 lessons, or the cut to 11?** And do you accept the design rule "a lesson may not straddle two roadmap modules", which is what forces 13 rather than 11? → *Blocks S2.*
7. **US or UK English for the key set?** I recommend US keys with UK doublets taught as content. Expensive to reverse, because the English string *is* the catalog key. → *Blocks S2.*
8. **Duplets/quartoles over dotted values (§8e), and the tuplet ratio form (7:4 vs 7:8).** Which convention does the project adopt, with a source, or do those items stay unscored? → *Blocks S9.*
9. **Reviewers.** Who signs off German-language music theory (already outstanding per `docs/german-localization.md`), and who signs off the Russian column? Gate G keeps every topic at `draft` until both exist, and no Russian reviewer is named anywhere in the repo. → *Blocks every `[x]`.*
10. **Alto and tenor clefs: reading skill in F03, or recognition-only until N03?** The chapter teaches all four equally; the roadmap puts score reading much later. I recommend **recognition-only**. → *Affects T2's outcome statement.*
11. **Should the item seed appear in the URL hash** for shareable, reproducible exercise items? It costs nothing on a static export and helps bug reports, but it is a small public URL surface to agree on. → *S4.*
12. **A non-developer content editor within the next few releases?** That is the only fact that would overturn the "content stays in TypeScript" decision, and it should be settled before `lib/content/` is laid out rather than after. → *Blocks S2.*

---

## Appendix — earlier claims dropped or corrected

Recorded so you can see what changed rather than re-deriving it.

| Dropped / corrected claim | Correction |
|---|---|
| New roadmap topics NS01–NS04 (octave signs, Akkolade, writing rules, tempo-and-loudness words) | Dropped. `ROADMAP.md:7` allows separate codes only for engineering/editorial tasks; `tests/roadmap.test.mjs` enforces 511 ids. Three of the four duplicate 2.21, 2.9/13.11 and 2.15/2.16. → scope notes + P-series items. |
| Octave registers → F03 | **2.3 is in F01** (`:204`). This moves the renderer-free lesson into the roadmap's first release. |
| Tempo → N02 | **2.15 is in F04** (`:256`). The dynamics lesson (2.16, N02) is behind F03+F05; tempo is not. |
| "There is no on-screen piano to reuse" | **Wrong.** `app/page.tsx:1090-1200` is a real interactive piano with buttons, aria-labels and `playNote`. |
| "Sounded range is MIDI 21–108, the piano compass" | `MIN_MIDI = 24` (`lib/chords.ts:177`). Subkontra A/H cannot be sounded through the chord player. |
| "Subkontraoktave = only A and H" | Register boundaries always begin at C; Subkontra is C₂–H₂. The {A, H} restriction is the piano compass, not the region. |
| "Assert the labelling functions don't throw" | Unsound: `pitchName`/`octaveName`/`pitchLabel` do not validate and return `"Cundefined"`, `undefined`, and a plausible-but-wrong `"C₁"`. |
| "Vorzeichen/Versetzungszeichen and Haltebogen/Bindebogen have no one-word English equivalents" | Backwards — English is precise (*key signature/accidental*, *tie/slur*). Russian merges tie and slur as *лига*. |
| "2.18 Украшения is fully covered" | German *Mordent* = lower auxiliary; unqualified Russian *мордент* = upper. Recognition, not only realisation, needs a rubric. |
| "Inverted mordent" as a synonym for the upper mordent | Ambiguous in both directions across two centuries of English usage. Dropped entirely. |
| VexFlow as a live default | 360 KB brotli for the only no-CDN-safe entry, zero ARIA, `pointer-events="none"` at the root, `HOST_URL` pointing at jsDelivr in `vexflow-core`. |
| "LGPL makes Verovio unusable" | Overstated. §4(d)(0) is satisfied by a separately-replaceable file. The disqualifier for runtime use is **1 759 KB brotli**. |
| "Verovio bundles five fonts" | **Six**, including the Liberation text face; all SIL OFL. |
| "Split `lib/german.ts` into part-files" | Would convert a TS1117 duplicate-key error into silent last-wins. |
| "abcjs class stacks encode the answer" | They encode duration and visual staff position only — **not the accidental**, which is precisely what German double alterations need. |
| "Mälzel 1816, lawsuit assigned the invention to Winkel" | Winkel 1814; Maelzel patented (French patent 1815 / scale added and patented by 1816, depending on source); **no documented lawsuit** found. Needs a reference work. |
| "The ♮♯ route from double-sharp to sharp" | Described as *veraltet* by German sources including `lehrklaenge.de`, already source #2 in the repo's own German doc. |
| Gate G requires EN/RU/DE | Gate G's text says **EN/RU**. The EN/RU/DE rule comes from `CONTRIBUTING.md:52-54` and `ROADMAP.md:122`. |
