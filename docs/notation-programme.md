# №558 — Notation programme evidence

[ROADMAP](../ROADMAP.md) is the completion register. This document records
scope and evidence for the bounded programme. The owner clarified on
2026-09-09 that this portal is for **personal learning**. A separate external
subject/language sign-off is not required. [Gate G](release-criteria.md) is
applied to accurate sourced teaching, connected navigation, working experiments
and meaningful tested practice. Programme completion does not close other
curriculum tasks or authorize public publication.

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

The notation reading route follows all 13 lessons in their teaching order.
Previous/next links preserve the language, show the current lesson number and
stop at the programme boundaries. Focus and the viewport move to the new
lesson heading so a bottom-of-article link resumes reading at the beginning.
The grouped catalogue remains available;
lesson, lab, practice and reference views retain their shared topic context.

- The 13 lesson IDs are unchanged. Permanent task 022 (`dots-ties`) belongs
  to **F05**, not F04. The other assignments remain in F01/F03/F04/F05/N02.
- `lib/learning.ts` contains the core lessons; `lib/notation-programme.ts`
  supplies supplemental reading, original reference material, source
  resolution and localized figure descriptions. Existing English reference
  titles are retained so existing term slugs do not change.
- The pre-expansion audit counted **118 reference rows: 12 legacy
  non-notation rows plus 106 notation rows** (85 in `learning.ts`, 21 in
  `notationReferences`). The expanded content has **141 rows: the same 12
  legacy rows, the same 85 notation rows and 44 programme references**.
  One programme reference, “Chord symbols”, belongs to the existing
  `chords` topic. Counts are rows, not distinct concepts or evidence of
  readiness; “Natural note” and “Letter name”, for example, overlap.
- All 85 previously source-less notation rows now receive a subject source;
  headword overrides distinguish rests, stems, beams, curves, keyboard
  systems and the conditional middle-C frequency. A source link is a
  starting point for checking the claim, not a claim of infallibility or external expert endorsement.
- Optional `aliases: LocalText` provides semicolon-separated search terms.
  `relatedTopics` contains existing lesson IDs. `forwardModules` resolves
  through `notationForwardLinks` to real curriculum documents, not invented
  playable topics. `furtherSources` retains additional source distinctions.
  The reference UI renders these links and searches aliases.
  `tests/browser/notation-context.browser.test.mjs` checks them in EN/RU/DE.
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
| NA09 | 4 | Covered | P “Instruments and clefs”; OMT “Clefs and Ranges” and VSL Academy “Notation” sections independently confirm bassoon/trombone tenor-clef practice. Both VSL sources are available from the reference entry; N03 retains the fluency course. |
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
| NA20 | 7–8 | Covered | T contextual scope items and W sequence resolver; `tests/notation-contexts.test.mjs` and `tests/notation-workbench.test.mjs` verify ties, re-attacks, same-octave limits, signatures and replacement of double signs. Feedback distinguishes a new attack from a tied continuation. |
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
| NA37 | 13–14 | Covered | Exact fraction oracle in `tests/notation-contexts.test.mjs` covers notes and rests that fit, exactly fill or overflow a stated remaining bar duration. Fit is explicitly distinct from preferred engraving. |
| NA38 | 14 | Covered | L/P explicit 3:2 definition, triplet example, E `tuplet`. |
| NA39 | 14 | Covered | `tuplet-mixed`: the tests independently read MEI durations for subdivisions, rests, ties and the complete scaled span. |
| NA40 | 14–15 | Covered, explicit ratios | T asks 3:2, 5:4, 6:4, 7:4, 7:8 and 9:8–12:8. The independent duration oracle checks the stated ratio; the numeral alone does not determine duration. |
| NA41 | 15 | Covered | P n:m explanation and `tuplet-13-12` caption/figure. No longer represented solely by the words “13:12”. |
| NA42 | 15 | Covered, unscored | P duplet/quartole/octole references and figures; compare the stated span/ratio without imposing one convention. |
| NA43 | 16 | Covered | Cross-bar tie items ask each allocated portion and the total duration; tests compare MEI per-bar sums and the sounding total. |
| NA44 | 16, 28–29 | Covered | L/P tie versus articulation slur versus phrase grouping; no rule that every repeated pitch under any curve is a tie. |
| NA45 | 16–17 | Covered | P rest figures and T `value-identification`; corresponding silent durations. |
| NA46 | 17 | Covered, scoped | Explicit whole-bar-rest examples in 3/4 and 6/8; consult meter rather than assuming four quarter beats. Large-meter engraving may use a breve-rest form. |
| NA47 | 17 | Covered | Extended dotted-value items include rests, single/double dots and fit/overflow; independent fraction tests verify all three boundaries. |
| NA48 | 17 | Covered in reference | P “Historical multi-measure rests” / “Multi-measure rest”; `historical-multirests`; modern number versus older combined signs. |
| NA49 | 7, 16, 18 | Covered, support only | Barline and bar references; no claim to teach the whole theory of meter. |
| NA50 | 18 | Covered | L `repeats`, double/final bar references and original navigation figures. |
| NA51 | 18 | Covered | `repeat-implicit` and explicit-repeat route items are checked against actual engraved signs and expected traversal. Shared-boundary meaning is explained in P. |
| NA52 | 18 | Covered | P `repeat-volta` caption, L first/second endings; T route practice. |
| NA53 | 19 | Covered, scoped | D.C./D.S. al Fine/al Coda routes are tested against actual figure signs and explicit traversal conventions. Historical fermata-as-end-marker usage is not imposed on modern scores. |
| NA54 | 20 | Covered | P Simile/Segue and `repeat-abbreviation`; distinguish continued manner from an instruction to repeat an exact measure. |
| NA55 | 20 | Covered in reference | P tremolo, `tremolo-two`; measured/unmeasured distinction without a universal speed. |
| NA56 | 19 | Covered, recognition only | Trill, upper/lower mordent, turn, slashed/unslashed grace, after-grace, slide and arpeggio; acciaccatura modern/historical meanings distinguished. Qualified localized names, no universal realization. |
| NA57 | 19 | Deferred | Period-/instrument-/edition-specific realization is not automatically graded. No textbook realizations or score extracts copied. |
| NA58 | 20–21 | Covered as stub | P Tablature plus N05 forward link; no claim to teach all historical tablatures. |
| NA59 | 21 | Covered as stub | P Figured bass plus H04 forward link and Chords relation; no complete realization course. |
| NA60 | 21 | Covered as reference | P “Chord symbols” belongs to existing `chords`; distinguishes root/type/bass symbols from figured-bass intervals. |
| NA61 | 21–22 | Covered, bounded | P “Why extend notation?” supplies original motivations and links the OMT chapter “Graphic Notation and Scores”, specifically its history and hybrid/timeline sections. These support extensions for timing, technique and performer choice; this is an introduction, not Wolf’s seven-item taxonomy or a comprehensive history. |
| NA62 | 22–23 | Deferred beyond stub | P Graphic notation / N05 link only. No Universal Edition facsimile; no complete graphic/action-notation course. |
| NA63 | 23–24 | Covered, contextual | Slow/moderate and lively/fast groups link Lehrklänge and Blood’s tempo table, including Adagietto. Their contrasting Andantino usages are a reason to avoid a fixed BPM ranking. |
| NA64 | 24 | Covered | L tempo scope, P `tempo-return`; read until replacement rather than a single-note event. |
| NA65 | 24–25 | Covered, bounded | P “Tempo changes and agogics”; expressive timing vocabulary. Riemann attribution is not asserted without a dedicated historical source. |
| NA66 | 24–25 | Covered, scoped | A tempo/Tempo I/in tempo, gradual span and return; no universal Schumann-to-next-barline reset rule. |
| NA67 | 25 | Covered, scoped | Fermata suspends regular timing over its event or boundary; no fixed multiplier. `tests/notation-contexts.test.mjs` validates contextual discussions and figure families. |
| NA68 | 25–26 | Covered, bounded | Metronome arithmetic is checked in every locale for all four printed note units and positive, distinct options. P “Metronome history” cites Blood’s “Metronome Marks” distinction between development, commercialization and disputed priority; the unverified litigation story is not taught. |
| NA69 | 26 | Covered | Relative pppp–ffff ladder, bounded soft/strong examples; no calibrated sound-pressure claim. |
| NA70 | 26 | Covered | fp/sfz/rfz distinctions and `dynamic-fp`; tested unscored interpretation asks about onset, level and context without imposing a unique gain curve. |
| NA71 | 27–28 | Covered | Hairpin span, cresc./decresc./dim. and gradual qualifiers; tests verify the actual hairpin and the unscored comparison rubric. |
| NA72 | 27–28 | Covered, contextual | Original character groups link the read Lehrklänge and Dolmetsch entries, including con passione, dolente, secco and tumultuoso. These are contextual descriptions, not numerical tempo/dynamic settings. |
| NA73 | 28 | Covered, contextual | Current Dolmetsch dictionary and tempo/general-marking tables support mancando and the other subsiding directions. The reference distinguishes lexical fading from possible tempo relaxation and preserves the historical Wolf source as an additional link. |
| NA74 | 28–29 | Covered, scoped | Modern dot/wedge distinction without numeric durations; unsupported universal “before 1850” statement removed from lessons. |
| NA75 | 29 | Covered | P Non legato/leggiero plus tenuto/portato; lightness is not automatically shortened duration. |
| NA76 | 29 | Covered, bounded | P “Unmarked articulation” compares Türk 1789 and Clementi 1801 via Blood’s “Slur & Phrase”. It is expressly a comparison of keyboard advice, not a universal chronology of composers’ markings. Historical instrument-specific realization stays contextual. |
| NA77 | 29 | Covered | L/P phrasing versus articulation, `articulation-phrase`; grouping is not duration addition. |
| NA78 | 29–30 | Covered, bounded | Breath/caesura reference and caption. Couperin attribution and historical sign genealogy are not asserted without dedicated evidence. |
| NA79 | 30 | Covered as stub | P Chant divisions, LilyPond divisio source and N04 forward link. The dated book taxonomy is not presented as the universal modern one. |

Printed pp.30–32 also provide cumulative practice prompts. Their skill transfer
is represented by original pitch placement/respelling and the short-excerpt
generator. `tests/notation-contexts.test.mjs` independently checks pitches
and durations against the engraved MEI; the browser context suite advances
the actual trainer into mixed pitch/rhythm excerpts and verifies that both
answer types appear. Level 1 retains simple four-note reading; levels 2–3
include rests, accidentals, ties and barline context. The questions or examples themselves must
never be ported.

## Source evidence and verification limits

Access date for the web reading below: **2026-09-09**. Authored text:
OML contributors, including AI-assisted drafting. Follow-up source/code/EN/RU/DE checking: **Codex, 2026-09-09**, after the
Claude Code implementation and review. This records the actual assisted
checking, not an external expert endorsement.

| Source and author/institution | Edition / exact section read | Claims supported and limits |
| --- | --- | --- |
| Chelsey Hamm and Bryn Hughes / Open Music Theory, VIVA | Version 2 web text, [American Standard Pitch Notation](https://viva.pressbooks.pub/openmusictheory/chapter/aspn/), “ASPN and Octave Designations”, including the B♯3/C4 example | Written C boundary, register numbers and enharmonic spellings retaining their octave. Replaces the mismatched “Pitch and Pitch Class” source for this claim. |
| Chelsey Hamm / Open Music Theory, VIVA | Version 2 web text, [Reading Clefs](https://viva.pressbooks.pub/openmusictheory/chapter/clefs/), “Clefs and Ranges” and the four “Reading … Clef” sections; [Half Steps, Whole Steps, and Accidentals](https://viva.pressbooks.pub/openmusictheory/chapter/half-and-whole-steps/), “Sharps, Flats, and Naturals”, “The Black Keys…” and “Enharmonic equivalence” | Clef anchors, instrument examples and piano enharmonics. The piano/12-TET model does not establish a universal minimum interval. |
| Mark Gotham, Chelsey Hamm and Bryn Hughes / Open Music Theory, VIVA | Version 2 web text, [Notating Rhythm](https://viva.pressbooks.pub/openmusictheory/chapter/notating-rhythm/), “Note Values”, “Rest Values”, “Dots and ties”; also read the Nebraska Fall 2023 edition's “Rhythmic and Rest Values” | Value hierarchy, note/rest shapes, augmentation dots and additive ties. Preserve the distinction between ties and phrasing; not every curve between repeated pitches is automatically a tie. |
| Mark Gotham and Chelsey Hamm / Open Music Theory, VIVA | Version 2 web text, [Other Aspects of Notation](https://viva.pressbooks.pub/openmusictheory/chapter/other-aspects-of-notation/), “Dynamics”, “Articulations”, “Tempo”, “Structural Features”; anchors `chapter-4083-section-1` through `-4` | Readable chapter body and verified anchors. It supports notation and broad performance meanings. Its pedagogical tempo ordering is not imposed as an absolute BPM table; use Blood's contextual tempo distinctions for return instructions. |
| Vienna Symphonic Library Academy; institutional instrument articles, no individual byline | Undated web edition, [Bassoon](https://www.vsl.co.at/academy/woodwinds/bassoon), “Notation”; [Tenor trombone](https://www.vsl.co.at/academy/brass/tenor-trombone), “Notation” | Non-transposing notation and use of bass/tenor clefs according to register. These are specialist orchestral examples, not a claim about every trombone tradition. |
| Brian Blood / Dolmetsch Online | Undated maintained web text, [Music Theory lesson 5](https://www.dolmetsch.com/musictheory5.htm), “Table of Tempo Markings” (including Adagietto and mancando) and “Metronome Marks”; [lesson 21](https://www.dolmetsch.com/musictheory21.htm), “Slur & Phrase”, “Table of Dynamic Markings”, “Table of General Musical Markings” (including con passione, dolente and secco) | Current readable lexical support and a secondary historical comparison of Türk 1789/Clementi 1801. “Metronome Marks” distinguishes technical development, Mälzel's commercialization and disputed priority. No direct reading of the historical treatises or a court ruling is claimed. Compare period and instrument before adopting performance advice. |
| Dolmetsch Online / Music Dictionary; entry authors not individually credited | Undated web edition, [M–Ma](https://www.dolmetsch.com/defsm.htm), `mancando`; [Ts–Tz](https://www.dolmetsch.com/defst5.htm), `tumultuoso` | Mancando's weakening/fading sense and tumultuoso's agitated character. The lesson-5 tempo table additionally associates mancando with slowing; the OML reference records the distinction without mandating a fixed curve. |
| Zach Gist and Chelsey Hamm / Open Music Theory, VIVA | Version 2 web text, [Graphic Notation and Scores](https://viva.pressbooks.pub/openmusictheory/chapter/graphic-notation-and-scores/), “A Brief History of Graphic Notation”, “Interpreting Graphic Scores with Instructions”, “Measuring Time and Hybrid Scores” | Extended notation for rhythmic/technical ideas, instructions and performer choice; hybrid scores and timeline notation. The source labels this chapter **in development**. It supports the introductory comparison, not a finished comprehensive history. No embedded score, recording or permissions are imported. |
| LilyPond development team / LilyPond, [Notation Reference](https://lilypond.org/doc/v2.24/Documentation/notation/index) | 2.24 web manual; §1.1.3 Displaying pitches: Clef, Key signature, Ottava brackets; §1.2.1 Writing rhythms: Durations, Tuplets, Ties | Modern notation/encoding examples. Cite the relevant subsection, not “Beams” for a tuplet claim. Nontraditional key signatures are explicitly possible. |
| Same, [Writing rests](https://lilypond.org/doc/v2.24/Documentation/notation/writing-rests) | §1.2.2 Rests, Full measure rests | Note/rest values, complete-measure duration and engraving exceptions. |
| Same, [Special rhythmic concerns](https://lilypond.org/doc/v2.24/Documentation/notation/special-rhythmic-concerns#grace-notes) | §1.2.6 Grace notes, including `afterGrace` | Small-note forms and after-grace placement. Its playback/encoding convention is not made a rule for every historical performance. |
| Same, [Expressive marks attached to notes](https://lilypond.org/doc/v2.24/Documentation/notation/expressive-marks-attached-to-notes) | §1.3.1 Articulations and ornamentations; Dynamics | Modern glyph inventory and hairpin endpoints; not an instrument-independent realization or calibrated loudness. |
| Same, [Expressive marks as curves](https://lilypond.org/doc/v2.24/Documentation/notation/expressive-marks-as-curves) and [as lines](https://lilypond.org/doc/v2.24/Documentation/notation/expressive-marks-as-lines#arpeggio) | §1.3.2 Slurs/Phrasing slurs/Breath marks; §1.3.3 Arpeggio | Distinct curve purposes and arpeggio direction variants. |
| Same, [Inside the staff](https://lilypond.org/doc/v2.24/Documentation/notation/inside-the-staff#stems) | §1.7.1 Stems, default center-line direction and melodic override examples | Stem conventions have overrides; multiple voices are not one monophonic rule. Attachment/direction examples are checked against the stated monophonic convention; they do not establish a polyphonic default. |
| Same, [Common notation for keyboards](https://lilypond.org/doc/v2.24/Documentation/notation/common-notation-for-keyboards) | §2.2.1 References for keyboards, Changing staff manually/automatically | Piano grouping, organ manual/pedal layout, cross-staff exceptions. |
| Same, [Displaying chords](https://lilypond.org/doc/v2.24/Documentation/notation/displaying-chords) | §2.7.2 Printing chord names, Customizing chord names, slash bass | Root/type/bass and naming-system differences; no one voicing imposed. |
| Same, Music Glossary | [§2 Duration names](https://lilypond.org/doc/v2.24/Documentation/music-glossary/duration-names-notes-and-rests), [multi-measure rest](https://lilypond.org/doc/v2.24/Documentation/music-glossary/multi_002dmeasure-rest), [acciaccatura](https://lilypond.org/doc/v2.24/Documentation/music-glossary/acciaccatura), [divisio](https://lilypond.org/doc/v2.24/Documentation/music-glossary/divisio) | US/UK/DE value aliases, historical combined multi-rest shapes, modern acciaccatura terminology and chant divisions. The glossary has no Russian column for all these terms; the Russian renderings use the project’s traditional terminology policy, not a claimed Russian column in this source. |
| Lehrklänge; author not identified on consulted entry pages | Undated web pages: [Notensystem](https://www.lehrklaenge.de/PHP/Grundlagen/Notensystem.php), [Noten lesen](https://www.lehrklaenge.de/PHP/Grundlagen/Noten_lesen.php), [Notenschlüssel](https://www.lehrklaenge.de/PHP/Grundlagen/Notenschluessel.php), [Vorzeichen](https://www.lehrklaenge.de/PHP/Grundlagen/Vorzeichen.php), [Triole](https://www.lehrklaenge.de/PHP/Grundlagen/Triole.php) | Staff, German naming, selected instrument/clef examples and basic signs/triplets. Not a source for all possible higher-tuplet conventions or all orchestral instruments. |
| Lehrklänge; uncredited lexicon entries | [Vortragsbezeichnungen](https://www.lehrklaenge.de/PHP/Lexikon/Vortragsbezeichnungen.php), individual alphabetical entries; [Verzierungen](https://www.lehrklaenge.de/PHP/Lexikon/Verzierungen.php), Praller/Mordent/Doppelschlag/Schleifer/Arpeggio/Acciaccatura; [Artikulation](https://www.lehrklaenge.de/PHP/Lexikon/Artikulation.php) | Terminology comparison, not sole authority for historical chronology or fixed ornament execution. Original group explanations are not copies of its compiled list. |
| Joe Wolfe / UNSW School of Physics | [Note names, MIDI numbers and frequencies](https://newt.phys.unsw.edu.au/jw/notes.html), opening octave/12-TET/A4 paragraphs, MIDI equations and German H/B note | Scientific names and conditional frequencies; does not establish Russian register vocabulary. |
| Saffron Hall; no individual byline verified | [Graphic scores explained](https://www.saffronhall.com/articles/graphic-scores-explained), opening description of shapes, timing and open interpretation | Introductory graphic-score scope only. Not a historical account of twentieth-century notation or proof of every technical motivation. |
| Erich Wolf / Breitkopf & Härtel, S33 | 1985 text, 2016 reprint, chapter I printed pp.1–32 read from scan | Scope audit and explicitly attributed historical mancando entry (p.28), not blanket modern claim validation. Physical-copy bibliography verified by owner. |
| Monika Beck, Thomas Bauser / Musikverlag Wolfram Heinlein for BBMV/VBSM, S34 | *Theorie D2/D3*, Demoausgabe 2012, pp.6 and 8–10 | Existing repository verification of German registers/accidental morphology retained; not newly claimed as reread during this content pass. |

The initial web reader returned HTTP 403 for several OMT chapters. On the
follow-up pass, ordinary public HTTP requests returned the complete HTML
for Notating Rhythm, Other Aspects of Notation, Half Steps/Whole Steps,
and Graphic Notation and Scores. The chapter bodies and actual heading IDs
were read; no authentication or restricted access was used. The local HTML
is ignored evidence, not distributed material. ASPN and Reading Clefs were
also read at their current canonical URLs. Four obsolete descriptive anchors
in the performance lessons now use the verified chapter-4083 section IDs.
The unrelated legacy OMT sources outside №558 are outside this recheck.

Verification limits: the historical comparisons cite Blood’s account; no
direct rereading of Türk, Clementi or a metronome priority ruling is claimed.
The full coverage denominator and remaining gaps are recorded below. An
external review can be sought later but is not a personal-use acceptance gate.
Accepted scope deferrals remain NA57, the
full NA62 treatment, C-clef fluency, and full N04/N05/H04 courses.

## Reproduction and validation evidence

Content-specific tests: `npm test -- tests/notation-content.test.mjs`.
The review runs the full unit suite, the three-engine browser matrix,
coverage, typecheck, lint, formatting, both notation reproducibility checks
and the Workers/static builds. The results and measurement limits follow.

`tests/notation-feedback.test.mjs` protects the in-bar replacement regression,
key-signature/tie feedback, nearby duration distractors, positive metronome
options and answer-order independence. The in-bar test failed before the fix
with `carried-the-sign-too-far` on a same-bar double-sharp replacement.

Review the reading/reference lenses in EN/RU/DE, search aliases, follow
existing subject links and future-module document links, and inspect every
figure with its localized explanation. Verify audible comparisons only
through gesture-initiated, finite, cancellable playback. PR/commit and build evidence are recorded for reproducibility. Owner-controlled
publication and deployment remain separate from personal-use readiness.

### Final validation, 2026-09-09

Reviewed implementation: [`fe4ef68`](https://github.com/alex-michels/one-music-lab/commit/fe4ef689a4eb77a3738821ed7b4a652c04a3b91c),
[PR #35](https://github.com/alex-michels/one-music-lab/pull/35). It follows the
programme and assessment work in `0a8aa98`, `ac619b4` and `5ffaf88`.
The Roadmap closure records the personal-learning scope clarified by the
owner, with the bounded content and checks below. To undo this release,
revert its PR commits on a separate branch and re-run the same checks;
building an artifact does not publish it.

Local environment: Windows, Node 24.18.0. Heavy suites ran sequentially with
two workers; no test, engine or production file was filtered out to make the
full runs pass. The final source-wording change was also checked by the full
unit suite and rebuilt in both targets.

| Check | Result |
| --- | --- |
| `npm test -- --maxWorkers=2` | 35 files, 247 tests passed. |
| `npm run test:coverage -- --maxWorkers=2` | 51 files, 372 tests passed: unit plus real Chromium. |
| `npm run test:browser -- --maxWorkers=2` | 46 files passed, 2 skipped; 354 tests passed, 18 skipped across Chromium, Firefox and WebKit. |
| Final affected browser suite after the contrast fix | `npm run test:browser -- tests/browser/notation-context.browser.test.mjs --maxWorkers=2`: 51/51 passed across all three engines, including the added contrast check. |
| Types, lint and formatting | `npm run typecheck`, `npm run lint`, `npm run format:check` passed. |
| Glyph and figure reproduction | `npm run glyphs:check`, `npm run notation:check` passed against the pinned renderer. |
| Local artifacts | `npm run build` and `npm run build:static` passed; `npm run test:static` passed 5/5, including Notes lab with all external requests blocked. |
| Built UI inspection | Russian lesson and next-lesson navigation, visible destination heading and transition to the Notes lab passed at 390px in light/dark mode without browser errors. Local screenshots were inspected. |

The browser skips are capability limits: this Playwright WebKit lacks Web Audio,
and Firefox lacks the offline suspend operation used by one audio test. Real
Safari/mobile listening remains device work; neither skips nor sample-level
audio assertions are described as a human listening session.

Coverage includes **58 reported production files**:

| Metric | Covered / total | Percentage |
| --- | --- | --- |
| Statements | 2398 / 2828 | 84.79% |
| Branches | 1745 / 2080 | 83.89% |
| Functions | 630 / 789 | 79.84% |
| Lines | 2133 / 2485 | 85.83% |

`lib/notation-tasks.ts`, `lib/notation-workbench.ts` and the notation
response/workbench components have 100% statements, branches, functions and
lines. This does not make the whole project fully covered. Remaining shell,
UI, export/WebMCP and unused modified-component paths are owned by the project
maintainer under [№518](engineering.md#task-518). No coverage include/exclude
setting or threshold changed. The Vite configuration instrumentation limit
and artifact-test boundary remain documented in [CONTRIBUTING](../CONTRIBUTING.md).

Failed attempts were investigated: cold unrestricted worker concurrency hit
Windows startup/child-process timeouts; bounded sequential runs passed. The
new lesson-route tests initially exposed their shared module-store setup,
then a real WebKit scroll regression. Test setup now uses the running app's
hash navigation; the app explicitly scrolls to its focused heading, with
space above it. Both first/last lesson boundaries and EN/RU/DE routes pass.
The lesson experiment card also no longer inherits pale instrument text
on a light card; its heading is tested at contrast ≥4.5:1 in both themes.
The old claim that this lab only uses note names was removed from its EN/RU/DE
instructions now that the score is visible and interactive.

The earlier Firefox `chords-lab` flake did not recur in the final full matrix;
this review does not claim to have diagnosed or fixed that separate flake.
Local `debug.log` is preserved and ignored, as are PDF renderings, reports and
screenshots. No public deployment was performed.
