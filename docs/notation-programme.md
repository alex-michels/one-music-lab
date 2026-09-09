# №558 — Notation programme evidence

[ROADMAP](../ROADMAP.md) is the completion register. This document records
scope and evidence, not a second set of completion checkboxes. **№558 remains
draft until independent subject/language review and acceptance under
[gate G](release-criteria.md).** An implemented illustration, a source URL, or
a passing test does not constitute that acceptance or close the underlying
curriculum topics.

## Source identity, scan and rights

The owner identified S33 from the physical copy: Erich Wolf, *Die
Musikausbildung*, Band I, *Allgemeine Musiklehre*, Breitkopf & Härtel,
7., korrigierte Auflage 1985, Nachdruck 2016, ISBN 978-3-7651-0044-4.
This is a reprint, not a new 2016 revision.

All 17 image-only PDF pages were inspected on 2026-09-09. They contain the
whole chapter I, “Die Notenschrift”, printed pp.1–32: rendered sheet 01 is
p.32; sheets 02–16 are spreads pp.2–31; sheet 17 is p.1. The file has
10,904,520 bytes, PDF 1.3, a 17-page count and Adobe Scan for iOS metadata.
There is no title or imprint page in this excerpt: **the edition identity
comes from the owner's physical-copy check, not from the scan metadata.**
The end contains 39 questions and four assignments; their text and examples
are not project content.

Printed p.23 credits Universal Edition's permission for the Kupkovič
facsimile. That permission does not transfer to OML. The PDF and local
renderings stay outside the tracked/published artifact. No textbook prose,
question sequence, compiled glossary, score example or facsimile is copied.
The teaching explanations and small MEI examples are independently written;
reference words are grouped around new comparison questions rather than
reproducing the book's lists. Original text is CC BY 4.0; original code is
Apache-2.0. Font/renderer exceptions remain in
[THIRD-PARTY-NOTICES](../THIRD-PARTY-NOTICES.md).

## Delivered content contract

- The 13 lesson IDs are unchanged. Permanent task 022 (`dots-ties`) belongs
  to **F05**, not F04. The other assignments remain in F01/F03/F04/F05/N02.
- `lib/learning.ts` contains the core lessons; `lib/notation-programme.ts`
  supplies supplemental reading, original reference material, source
  resolution and localized figure descriptions. Existing English reference
  titles are retained so existing term slugs do not change.
- The pre-expansion audit counted **118 reference rows: 12 legacy
  non-notation rows plus 106 notation rows** (85 in `learning.ts`, 21 in
  `notationReferences`). The expanded content has **139 rows: the same 12
  legacy rows, the same 85 notation rows and 42 programme references**.
  One programme reference, “Chord symbols”, belongs to the existing
  `chords` topic. Counts are rows, not distinct concepts or evidence of
  readiness; “Natural note” and “Letter name”, for example, overlap.
- All 85 previously source-less notation rows now receive a subject source;
  headword overrides distinguish rests, stems, beams, curves, keyboard
  systems and the conditional middle-C frequency. A source link is a
  starting point for checking the claim, not proof that every historical or
  localized nuance is reviewed.
- Optional `aliases: LocalText` provides semicolon-separated search terms.
  `relatedTopics` contains existing lesson IDs. `forwardModules` resolves
  through `notationForwardLinks` to real curriculum documents, not invented
  playable topics. `furtherSources` retains additional source distinctions.
  The parent UI work owns rendering/search integration and its validation.
- `notationFigureDescriptions: Record<string, LocalText>` supplies meaningful
  EN/RU/DE captions and text alternatives for the 30 additional original
  figures. It describes notation, never a falsely universal performance.

## Atom-by-atom PDF evidence

“Covered” means that an explicit authored explanation/reference or supported
comparison exists for the bounded atom. It does **not** mean G acceptance.
“Partial” records a remaining source, depth or applied-evidence gap.
“Deferred” is an explicit agreed boundary, not a silently omitted topic.

File abbreviations: **L** = `lib/learning.ts`; **P** =
`lib/notation-programme.ts`; **E** = `lib/exercises.ts`; **T** =
`lib/notation-tasks.ts`; **F** = `scripts/notation-figures.mjs`; **W** =
`lib/notation-workbench.ts`; **N** = `lib/notation.ts`.
Figure identifiers below are the contracted original probes in F; final
generator/figure validation is recorded separately, not inferred from a name.

| Atom | Printed pages | Coverage | Actual content and applied evidence / boundary |
| --- | --- | --- | --- |
| NA01 | 1 | Covered | L/P `staff`: five lines, four spaces, outside spaces, bottom-up counting; E `read-pitch` and staff placement. |
| NA02 | 1 | Covered | L/P `staff`; successive/together examples in `lib/notation-experiments.ts` distinguish succession from simultaneous onset. |
| NA03 | 4–5 | Covered | L `staff`, ledger-line reference; E bounded staff reading. Ledger lines continue the same spacing; supported range is not a universal musical limit. |
| NA04 | 2–3 | Covered | L `clefs` explains the pitch anchor; clefs are not treated as a way to change the sound of the instrument itself. |
| NA05 | 3–4 | Covered | L/P `clefs`: treble G, bass F and C-clef anchors; E `read-pitch`. |
| NA06 | 3, 5–6 | Covered | Treble reading, ledger examples and E `read-pitch`. |
| NA07 | 3, 5–6 | Covered | Bass reading, ledger examples and E `read-pitch`. |
| NA08 | 3–4 | Covered, bounded | Alto/tenor identification and middle-C location; fluent orchestral C-clef reading is deferred to N03. |
| NA09 | 4 | Partial | P “Instruments and clefs”; independent consulted source covers flute/viola/cello. Bassoon/trombone associations retain a pending specialist-source check; N03 forward link. |
| NA10 | 4, 6 | Covered | P “Keyboard and organ staves”; `grand-staff`, `organ-staves`; explicit three-staff organ/pedal convention and cross-staff exceptions. |
| NA11 | 5–6 | Covered | P `clefs`/“Ottava”, W `ottava`; bracket span and octave-modifying clef figures described separately. |
| NA12 | 1–2 | Covered | L `note-names`, N localized names, E `accidental-name`. |
| NA13 | 2 | Deferred from lessons | Optional P “Pitch-name systems” / existing “Octave notation” reference only. No cross-language naming quiz. |
| NA14 | 2 | Covered | L `note-names`; octave repeats a name and, in the stated model, doubles frequency. |
| NA15 | 2, 6 | Covered, bounded | L `note-names`, N nine-register naming range, Notes octave selector and E `octave-region`. The piano's incomplete end registers do not define register boundaries. |
| NA16 | 2, 6 | Covered | P `note-names`: written C boundary, enharmonic boundary contrast; N preserves written octave. |
| NA17 | 2, 6 | Covered | P `note-names`: 88-key compass versus register; no claim that the piano bounds music. |
| NA18 | 6–9 | Covered | L/P `accidental-signs`: five signs relative to the natural; E naming and W signature replacement. |
| NA19 | 6–8 | Covered | L/P `accidental-scope`: signature versus local accidental, separate German/Russian terminology; W. |
| NA20 | 7–8 | Partial pending applied validation | L/P rule; `accidental-tie-scope`, `accidental-octave-scope`. Final E scope-generator evidence must demonstrate ties, re-attacks and octave limits, not just a barline reset. |
| NA21 | 7 | Covered | L/P signature scope, all octaves until replaced; W `underSignature`, signature examples. |
| NA22 | 8–9 | Covered | L/P replacement rather than addition; natural restores the natural form. Modern single-sign replacement is taught instead of requiring historical natural-plus-sign combinations. |
| NA23 | 8 | Covered | L German accidental lesson, `lib/german.ts`, N names: productive -is/-isis forms. |
| NA24 | 8–9 | Covered | German lesson/reference exceptions Es/As/B/Heses and Ases/Asas; existing S34 verification retained. |
| NA25 | 9 | Covered | P sign placement; staff exercise marks and original figures do not extend ledger lines through accidentals. |
| NA26 | 9 | Covered | P order, W signature model, `signature-bass`; tonal derivation is outside this reading atom and belongs to task 036. |
| NA27 | 9 | Covered, scoped | P explicitly says standard common-practice signatures use single signs; no prohibition on all nontraditional signatures. |
| NA28 | 10 | Covered | L/P `enharmonics`, E respelling with specified target letter and explicit 12-TET context. |
| NA29 | 10 | Covered | L/P written interval versus sounding equivalence; augmented-second/minor-third contrast, no automatic sharp-up/flat-down melodic rule. |
| NA30 | 10–11 | Covered | L `durations`: relative values versus tempo-dependent seconds; metronome arithmetic. |
| NA31 | 11–12 | Covered | P duration sequence, F note/rest 1–128 figures; T `value-identification`. |
| NA32 | 11 | Covered | P “Stem direction”, `stem-directions`; attachment, middle-line convention and polyphonic exceptions. |
| NA33 | 11–13 | Covered | L/P `beat-division`; beam/flag equivalence and beat visibility; F `beamed-mixed`. |
| NA34 | 12–13 | Covered, unscored | P captions for `beamed-mixed`/`beamed-syllables`; T `beaming-review`. Historical syllable grouping is contextual, not a modern universal rule. |
| NA35 | 13 | Covered | L `dots-ties`, dotted figure, E `dotted-value`; the unit is stated. |
| NA36 | 13 | Covered | Double-dot explanation/figure and E arithmetic. |
| NA37 | 13–14 | Partial pending applied validation | L/P distinguish bar fit from preferred engraving; E must actually ask fit/overflow with a stated remaining duration. An isolated dotted total is insufficient evidence. |
| NA38 | 14 | Covered | L/P explicit 3:2 definition, triplet example, E `tuplet`. |
| NA39 | 14 | Covered in reading | P `tuplet-mixed` caption: subdivisions, rests and ties remain inside the scaled span. Applied generator assertions are separately validated. |
| NA40 | 14–15 | Covered in reference | P “Tuplet families” and explicit-ratio convention, including higher group numerals; E must not imply the count alone fixes the written value. |
| NA41 | 15 | Covered | P n:m explanation and `tuplet-13-12` caption/figure. No longer represented solely by the words “13:12”. |
| NA42 | 15 | Covered, unscored | P duplet/quartole/octole references and figures; compare the stated span/ratio without imposing one convention. |
| NA43 | 16 | Covered in reading | L/P tie addition, `cross-bar-tie`; exact split across the barline. E `tie-sum` and related applied validation remain separate evidence. |
| NA44 | 16, 28–29 | Covered | L/P tie versus articulation slur versus phrase grouping; no rule that every repeated pitch under any curve is a tie. |
| NA45 | 16–17 | Covered | P rest figures and T `value-identification`; corresponding silent durations. |
| NA46 | 17 | Covered, scoped | Explicit whole-bar-rest examples in 3/4 and 6/8; consult meter rather than assuming four quarter beats. Large-meter engraving may use a breve-rest form. |
| NA47 | 17 | Covered in reading | L dot rule applies to rests; `dotted-rest` figure. Applied rest arithmetic belongs to the extended duration generator. |
| NA48 | 17 | Covered in reference | P “Historical multi-measure rests” / “Multi-measure rest”; `historical-multirests`; modern number versus older combined signs. |
| NA49 | 7, 16, 18 | Covered, support only | Barline and bar references; no claim to teach the whole theory of meter. |
| NA50 | 18 | Covered | L `repeats`, double/final bar references and original navigation figures. |
| NA51 | 18 | Covered in reading | L/P repeat signs, `repeat-implicit`, shared repeat boundary explanation; route-generator validation separately recorded. |
| NA52 | 18 | Covered | P `repeat-volta` caption, L first/second endings; T route practice. |
| NA53 | 19 | Covered in reading | D.C./D.S. qualified by al Fine/al Coda, `repeat-dc-fine`, `repeat-ds-coda`; historical fermata-as-end-marker convention is not imposed on modern scores. |
| NA54 | 20 | Covered | P Simile/Segue and `repeat-abbreviation`; distinguish continued manner from an instruction to repeat an exact measure. |
| NA55 | 20 | Covered in reference | P tremolo, `tremolo-two`; measured/unmeasured distinction without a universal speed. |
| NA56 | 19 | Covered, recognition only | Trill, upper/lower mordent, turn, slashed/unslashed grace, after-grace, slide and arpeggio; acciaccatura modern/historical meanings distinguished. Qualified localized names, no universal realization. |
| NA57 | 19 | Deferred | Period-/instrument-/edition-specific realization is not automatically graded. No textbook realizations or score extracts copied. |
| NA58 | 20–21 | Covered as stub | P Tablature plus N05 forward link; no claim to teach all historical tablatures. |
| NA59 | 21 | Covered as stub | P Figured bass plus H04 forward link and Chords relation; no complete realization course. |
| NA60 | 21 | Covered as reference | P “Chord symbols” belongs to existing `chords`; distinguishes root/type/bass symbols from figured-bass intervals. |
| NA61 | 21–22 | Partial | P “Why extend notation?” gives original modern motivations, not Wolf's seven-item list. Specialist historical/technical review of the broader motivations remains required. |
| NA62 | 22–23 | Deferred beyond stub | P Graphic notation / N05 link only. No Universal Edition facsimile; no complete graphic/action-notation course. |
| NA63 | 23–24 | Partial source verification | Searchable slow/moderate and lively/fast word groups; no fixed BPM ranking. Unconfirmed vocabulary nuances are listed below for independent review. |
| NA64 | 24 | Covered | L tempo scope, P `tempo-return`; read until replacement rather than a single-note event. |
| NA65 | 24–25 | Covered, bounded | P “Tempo changes and agogics”; expressive timing vocabulary. Riemann attribution is not asserted without a dedicated historical source. |
| NA66 | 24–25 | Covered, scoped | A tempo/Tempo I/in tempo, gradual span and return; no universal Schumann-to-next-barline reset rule. |
| NA67 | 25 | Covered, scoped | Fermata suspends regular timing over its event or boundary; no fixed multiplier. T practice and figure validation remain parent-owned. |
| NA68 | 25–26 | Partial | Metronome note-unit arithmetic is implemented/extended independently. Mälzel/Winkel history remains pending a dedicated source; no litigation story is taught. |
| NA69 | 26 | Covered | Relative pppp–ffff ladder, bounded soft/strong examples; no calibrated sound-pressure claim. |
| NA70 | 26 | Covered in reading | fp/sfz/rfz distinctions and `dynamic-fp`; applied mark interpretation validated separately. |
| NA71 | 27–28 | Covered in reading | Hairpin span, cresc./decresc./dim., gradual qualifiers and `dynamic-hairpin`; no endless crescendo inference. |
| NA72 | 27–28 | Partial source verification | Original searchable character groups explain line, motion and weight; complete lexical/EN/RU/DE review is pending. |
| NA73 | 28 | Partial | Calando/morendo/perdendosi/smorzando are contextual, not fixed curves. Mancando is explicitly attributed to Wolf 1985 p.28 with current-source verification pending. |
| NA74 | 28–29 | Covered, scoped | Modern dot/wedge distinction without numeric durations; unsupported universal “before 1850” statement removed from lessons. |
| NA75 | 29 | Covered | P Non legato/leggiero plus tenuto/portato; lightness is not automatically shortened duration. |
| NA76 | 29 | Deferred historical assertion | No unsourced universal timeline of composers' marking practices. Unmarked music still requires interpretation; historical chronology needs a specialist source. |
| NA77 | 29 | Covered | L/P phrasing versus articulation, `articulation-phrase`; grouping is not duration addition. |
| NA78 | 29–30 | Covered, bounded | Breath/caesura reference and caption. Couperin attribution and historical sign genealogy are not asserted without dedicated evidence. |
| NA79 | 30 | Covered as stub | P Chant divisions, LilyPond divisio source and N04 forward link. The dated book taxonomy is not presented as the universal modern one. |

Printed pp.30–32 also provide cumulative practice prompts. Their skill transfer
is represented by original pitch placement/respelling and the short-excerpt
generator. The first audit found four natural quarter notes only; final
expanded-excerpt evidence must show varied duration/rest/accidental contexts,
not merely a larger seed count. The questions or examples themselves must
never be ported.

## Source evidence and remaining editorial checks

Access date for the web reading below: **2026-09-09**. Authored text:
OML contributors, including AI-assisted drafting. **Independent named
EN/RU/DE and subject reviewer: pending.** No web manual is being represented
as independent review of this implementation.

| Source and author/institution | Edition / exact section read | Claims supported and limits |
| --- | --- | --- |
| LilyPond development team / LilyPond, [Notation Reference](https://lilypond.org/doc/v2.24/Documentation/notation/index) | 2.24 web manual; §1.1.3 Displaying pitches: Clef, Key signature, Ottava brackets; §1.2.1 Writing rhythms: Durations, Tuplets, Ties | Modern notation/encoding examples. Cite the relevant subsection, not “Beams” for a tuplet claim. Nontraditional key signatures are explicitly possible. |
| Same, [Writing rests](https://lilypond.org/doc/v2.24/Documentation/notation/writing-rests) | §1.2.2 Rests, Full measure rests | Note/rest values, complete-measure duration and engraving exceptions. |
| Same, [Special rhythmic concerns](https://lilypond.org/doc/v2.24/Documentation/notation/special-rhythmic-concerns#grace-notes) | §1.2.6 Grace notes, including `afterGrace` | Small-note forms and after-grace placement. Its playback/encoding convention is not made a rule for every historical performance. |
| Same, [Expressive marks attached to notes](https://lilypond.org/doc/v2.24/Documentation/notation/expressive-marks-attached-to-notes) | §1.3.1 Articulations and ornamentations; Dynamics | Modern glyph inventory and hairpin endpoints; not an instrument-independent realization or calibrated loudness. |
| Same, [Expressive marks as curves](https://lilypond.org/doc/v2.24/Documentation/notation/expressive-marks-as-curves) and [as lines](https://lilypond.org/doc/v2.24/Documentation/notation/expressive-marks-as-lines#arpeggio) | §1.3.2 Slurs/Phrasing slurs/Breath marks; §1.3.3 Arpeggio | Distinct curve purposes and arpeggio direction variants. |
| Same, [Inside the staff](https://lilypond.org/doc/v2.24/Documentation/notation/inside-the-staff#stems) | §1.7.1 Stems, default center-line direction and melodic override examples | Stem conventions have overrides; multiple voices are not one monophonic rule. Attachment/direction explanation and illustrations still require notation-editor review. |
| Same, [Common notation for keyboards](https://lilypond.org/doc/v2.24/Documentation/notation/common-notation-for-keyboards) | §2.2.1 References for keyboards, Changing staff manually/automatically | Piano grouping, organ manual/pedal layout, cross-staff exceptions. |
| Same, [Displaying chords](https://lilypond.org/doc/v2.24/Documentation/notation/displaying-chords) | §2.7.2 Printing chord names, Customizing chord names, slash bass | Root/type/bass and naming-system differences; no one voicing imposed. |
| Same, Music Glossary | [§2 Duration names](https://lilypond.org/doc/v2.24/Documentation/music-glossary/duration-names-notes-and-rests), [multi-measure rest](https://lilypond.org/doc/v2.24/Documentation/music-glossary/multi_002dmeasure-rest), [acciaccatura](https://lilypond.org/doc/v2.24/Documentation/music-glossary/acciaccatura), [divisio](https://lilypond.org/doc/v2.24/Documentation/music-glossary/divisio) | US/UK/DE value aliases, historical combined multi-rest shapes, modern acciaccatura terminology and chant divisions. The glossary has no Russian column for all these terms; RU terms need the pending language/subject review. |
| Lehrklänge; author not identified on consulted entry pages | Undated web pages: [Notensystem](https://www.lehrklaenge.de/PHP/Grundlagen/Notensystem.php), [Noten lesen](https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php), [Notenschlüssel](https://www.lehrklaenge.de/PHP/Grundlagen/Notenschluessel.php), [Vorzeichen](https://www.lehrklaenge.de/PHP/Grundlagen/Vorzeichen.php), [Triole](https://www.lehrklaenge.de/PHP/Grundlagen/Triole.php) | Staff, German naming, selected instrument/clef examples and basic signs/triplets. Not a source for all possible higher-tuplet conventions or all orchestral instruments. |
| Lehrklänge; uncredited lexicon entries | [Vortragsbezeichnungen](https://www.lehrklaenge.de/PHP/Lexikon/Vortragsbezeichnungen.php), individual alphabetical entries; [Verzierungen](https://www.lehrklaenge.de/PHP/Lexikon/Verzierungen.php), Praller/Mordent/Doppelschlag/Schleifer/Arpeggio/Acciaccatura; [Artikulation](https://www.lehrklaenge.de/PHP/Lexikon/Artikulation.php) | Terminology comparison, not sole authority for historical chronology or fixed ornament execution. Original group explanations are not copies of its compiled list. |
| Joe Wolfe / UNSW School of Physics | [Note names, MIDI numbers and frequencies](https://newt.phys.unsw.edu.au/jw/notes.html), opening octave/12-TET/A4 paragraphs, MIDI equations and German H/B note | Scientific names and conditional frequencies; does not establish Russian register vocabulary. |
| Saffron Hall; no individual byline verified | [Graphic scores explained](https://www.saffronhall.com/articles/graphic-scores-explained), opening description of shapes, timing and open interpretation | Introductory graphic-score scope only. Not a historical account of twentieth-century notation or proof of every technical motivation. |
| Erich Wolf / Breitkopf & Härtel, S33 | 1985 text, 2016 reprint, chapter I printed pp.1–32 read from scan | Scope audit and explicitly attributed historical mancando entry (p.28), not blanket modern claim validation. Physical-copy bibliography verified by owner. |
| Monika Beck, Thomas Bauser / Musikverlag Wolfram Heinlein for BBMV/VBSM, S34 | *Theorie D2/D3*, Demoausgabe 2012, pp.6 and 8–10 | Existing repository verification of German registers/accidental morphology retained; not newly claimed as reread during this content pass. |

The existing OMT links in lessons and `notationSources` are retained where
they name their genuine subject. During this audit OMT returned HTTP 403
through both read methods; their current bodies/anchors were **not**
independently reverified. This is not proof of a broken URL, and it is not
permission to claim they were read in this pass. Prior source records in
[sources](sources.md) remain distinct from the fresh reading above.

Still requiring explicit editorial evidence:

- named independent subject and EN/RU/DE reviewers and acceptance;
- exact modern support for all localized register/ornament vocabulary and
  nuanced character words (including Adagietto, con passione, dolente,
  secco and tumultuoso), not an assertion that one consulted lexicon covers
  every word in an original grouped explanation;
- an independent current source for mancando (dictionary requests did not
  yield a readable definition); it is intentionally historical/pending;
- dedicated evidence for bassoon/trombone clef practice, the history of
  notation extensions, historical marking practices and metronome priority;
- verification of existing OMT claims/anchors through lawful readable access
  or replacement with an actually read source.

These limitations are visible evidence gaps, not hidden exemptions or
invented peer-review approval. Accepted scope deferrals remain NA57, the
full NA62 treatment, C-clef fluency, and full N04/N05/H04 courses.

## Reproduction and validation evidence

Content-specific tests: `npm test -- tests/notation-content.test.mjs`.
Existing integration checks: `npm test -- tests/notation-programme.test.mjs`,
`npm run notation:check`, `npm run typecheck`. The parent records the final
unit/browser/coverage/lint/build/static-artifact results after integrating
the parallel generator and UI work. No passing result is inferred here.

Review the reading/reference lenses in EN/RU/DE, search aliases, follow
existing subject links and future-module document links, and inspect every
figure with its localized explanation. Verify audible comparisons only
through gesture-initiated, finite, cancellable playback. Final PR/commit,
publishable artifact, rollback and owner-controlled publication evidence
remain acceptance work under G; private staging is not public-launch approval.
