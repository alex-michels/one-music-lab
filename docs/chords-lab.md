# Chords lab: research, scope and use

## What the reference contributed

The owner requested an original learning tool inspired by
[OneMotion Chord Player](https://www.onemotion.com/chord-player/).
Its public interface was inspected on 6 September 2026: chord/progression
editing, key and scale changes, chord voicing, bass, duration, tempo, instrument
and style controls are visible. It also exposes melody/recording, exploration
and community collections. This research establishes interface capabilities;
it is not a claim that every reference feature was exercised or benchmarked.

The implementation selects the progression editor and chord-construction loop
as the coherent first release. It uses One Music Lab's existing panels, colour
tokens, navigation, Base UI selects and tabs. Its design, implementation,
keyboard graphic, oscillator sounds, examples and explanations are original.
There is no iframe, third-party player runtime, copied code, downloaded sound
bank, recording, score, image, or community composition.

## Use / Использование

Open **Chords lab** in navigation, follow the button under **A little
experiment**, or open `/#chords`.

1. Choose a starting point: a classical return, a minor-key leading-tone
   comparison, twelve-bar blues, jazz ii–V–I, or a pop four-chord pattern.
2. Select a progression card. Change its root degree, chord type, bass or
   duration. The inspector shows the interval formula, spelled pitches,
   registers, bass and keyboard positions. Listen to the chord or one pitch.
3. Add from the diatonic triad/seventh palette; duplicate, remove and move
   cards with the labelled buttons. Reordering is keyboard accessible and
   does not require dragging. At least one and at most sixteen chords remain.
4. Transpose with the tonic control. Changing the palette scale also changes
   the progression's degree roots, retaining custom chord qualities. Edited
   chords can therefore lie outside the palette. The minor palette is natural
   minor; choose major V or V7 to compare the raised leading tone.
5. Choose tempo, one/two/four passes, and held chords, quarter-note pulses or
   eighth-note arpeggios. Timbres are synthesized sine and triangle waves.
6. Compare one change at a time in **Listen & explore**. **Try a challenge**
   gives feedback on root identification even when the bass changes.
   **Terms & sources** connects the notation and harmonic concepts to readings.

Откройте **Лабораторию аккордов** в меню или по кнопке под **Небольшим
экспериментом**. Выберите пример, затем карточку аккорда. В редакторе меняются
ступень основного тона, вид аккорда, бас и длительность. Палитра добавляет
трезвучия или септаккорды; кнопки позволяют переставлять, дублировать и удалять
карточки. Тоника транспонирует последовательность. Смена гаммы меняет высоты
ступеней, сохраняя выбранные виды аккордов. Для вводного тона в миноре сравните
мажорный V7 с минорным v7. Вкладка **Проверьте себя** объясняет отличие основного
тона от баса; **Термины и источники** содержит определения и ссылки.

Settings and the edited phrase live in the mounted lab session: navigating
away or reloading resets them. There is no account, upload, remote storage,
automatic save, or audio export in this release.

## Musical and audio contract

- Western tonal and international lead-sheet conventions are the named
  teaching scope. This is not a universal model of harmony or musical value.
- Sixteen chord types: four triads, sus2/sus4, six seventh types, add9, dominant
  ninth type, major ninth and minor ninth. Chord formulas are intervals from
  the chord root. Ninths preserve the ninth's letter and octave, and `add9`
  excludes the seventh. All displayed voices actually sound.
- English pitch names use scientific octave numbers. Russian uses note names,
  hyphenated accidentals and Russian octave names; symbolic `Cm7`, `C/E` etc.
  are explicitly identified as international lead-sheet notation. No German
  locale is added; the future DE requirement in [music-notation](music-notation.md)
  remains applicable.
- Each pitch class has a conventional tonic spelling in each palette. For
  example, major D-flat changes to minor C-sharp, while B-flat minor avoids
  the unnecessary double/triple accidentals of A-sharp minor. Spelling follows
  degree letters throughout, including diminished sevenths and double signs.
- Roman roots use the major scale as reference in both modes: minor's lowered
  III/VI/VII roots get flats. Lowercase indicates minor or diminished quality;
  symbols distinguish sevenths, suspensions and ninths. This convention is
  explained in the UI and is not presented as the only analysis convention.
- Bass choices rotate the written chord tones into ascending register; a
  compound ninth can span more than one octave. This is not automatic smooth
  voice leading, SATB assessment, an unrestricted slash-bass or a drop-voicing
  algorithm. Shared pitches are compared modulo the octave, not claimed to
  be retained voices in the same register.
- The style presets are independently assembled harmonic exercises, not
  transcriptions or full arrangements. Blues I7 is not labelled dominant
  *function*. The straight pulse is not swing, blues phrasing or microtonal
  blue-note intonation. A V–I chord pair alone does not certify a cadence.
- This lab has its own fixed 12-TET reference, A4 = 440 Hz, and straight 4/4.
  Sound-lab tuning/reference controls do not alter it. One beat is a quarter
  note; the twelve-bar example contains 48 beats.
- Tempo: 40–200 BPM, 1–8 beats per chord, 1–4 bounded passes, maximum three
  minutes. Audio phrases and note events are validated before scheduling.
  The UI explains an overlong phrase and disables playback until shortened.
- No audio context exists until a Play/Listen/pitch gesture. The audio clock
  schedules all note onsets; a UI timer only reads that clock for highlighting.
  Generation checks cancel pending resume operations. Escape, editing,
  hiding the page and unmounting cancel scheduled voices. Ended nodes are
  disconnected; the context is closed on unmount. Start failures are visible
  and retryable. Volume is deliberately modest, never calibrated SPL.

## Verified source record

Access date for all records: **2026-09-06**. Research/implementation checking:
Codex. Independent EN/RU subject-matter reviewer: **pending owner assignment**;
these sources are evidence, not a substitute for that review. Online texts
below have no numbered edition/year on the inspected section unless stated.
Explanations are original concise summaries of musical facts, not reproduced
source prose or adapted musical examples.

| Source | Exact section / use | Scope and rights |
| --- | --- | --- |
| OneMotion, *Chord Player*, current public web interface, [product page](https://www.onemotion.com/chord-player/) | Chord progression, voicing, bass note, duration, tempo/key/scale and style controls | Product research only; no code, layout, assets or recordings copied. |
| Robert Hutchinson, *Music Theory for the 21st-Century Classroom*, University of Puget Sound, online text | [§6.1 Introduction to Triads](https://musictheory.pugetsound.edu/mt21c/TriadsIntroduction.html); [§6.3 Inverted Triads, including §6.3.1 slash chords](https://musictheory.pugetsound.edu/mt21c/InvertedTriads.html) | Root/third/fifth, four qualities, root versus bass and inversion. Textbook's Western tonal scope; original summaries only. |
| Hutchinson, same text | [§6.5 Simple Sus Chords](https://musictheory.pugetsound.edu/mt21c/SimpleSusChords.html); [§8.1 Introduction to Seventh Chords](https://musictheory.pugetsound.edu/mt21c/SeventhChordsIntroduction.html); [§31.1 Jazz Chord Basics, points 1–4](https://musictheory.pugetsound.edu/mt21c/JazzChordBasics.html) | Chord construction, sus replacements, seventh qualities, ninth/add9 distinction and minor-major seventh. This lab permits bass rotations of sus chords as an experiment; §6.5 itself chooses not to invert them in its exercises. |
| Hutchinson, same text | [§3.1 Minor Scales](https://musictheory.pugetsound.edu/mt21c/MinorScales.html); [§9.4 Harmonic Function, especially §9.4.3](https://musictheory.pugetsound.edu/mt21c/HarmonicFunction.html) | Raised seventh in harmonic minor and the tonic/pre-dominant/dominant/tonic teaching pattern. Functions are contextual, not inferred solely from chord quality. |
| Hutchinson, same text | [§9.3.1 II–V–I](https://musictheory.pugetsound.edu/mt21c/ShorterProgressionsFromTheCircleOfFifths.html); [§9.7 The Best-Seller Progression](https://musictheory.pugetsound.edu/mt21c/BestsellerProgression.html); [§12.4, table 12.4.1](https://musictheory.pugetsound.edu/mt21c/TwelveBarBlues.html) | Common jazz/pop root patterns and twelve-bar harmonic form; no recorded or notated song examples copied. Table 12.4.1 supplies the roots, not a requirement to use sevenths. |
| Gilbert DeBenedetti, *Harmonic Expansions*, G Major Music Theory, LLC; site copyright 2011, online text | [§5.5 Inserting IV, twelve-bar pattern and final footnote](https://www.gmajormusictheory.org/HarmExpansions/Ch5/05_5.html) | Blues tonic expansion; I/IV dominant-seventh qualities and stylistic distinction from Baroque/Classical progression. Copyright retained; facts paraphrased, no media copied. |
| С. В. Фролов, *Формирование аккомпаниаторских навыков баяниста*, Сумы: ИПП «Мрія-1», 2012, ISBN 978-966-566-549-6 | [PDF, printed pp. 139–140, especially p. 140 classification list](https://www.institute-of-education.com/uploads/store/libfile/204615/attachment/d9935b0c83a2be104fb0adeeb6c375f2.pdf#page=141) | Russian seventh-chord terminology; list read in the PDF text. Bayan pedagogical context; neither its arranging prescriptions nor its scores are reproduced. PDF screenshot service was unavailable; the classification is readable as text. |

Russian `полууменьшённый` is the lead-sheet-oriented synonym used here for
the type Фролов calls `малый септаккорд`; it means a diminished triad plus
a minor seventh. Russian ninth labels are editorial extensions of the
verified triad/seventh terminology and interval formulas, pending native
editorial review. The professional notation source record is shared with
[music-notation.md](music-notation.md).

Open Music Theory's “Blues Harmony” was discovered, but its source page returned
403 on inspection. It is **not** evidence for this release; the verified
DeBenedetti section supports the blues distinction instead.

## Development and validation

`lib/chords.ts` is a pure musical model and bounded phrase planner;
`lib/chord-audio.ts` is the cancellable Web Audio player;
`components/chords-lab.tsx` is the bilingual editor. The navigation hash is
registered in `lib/client-store.ts`. Every new production file is included in
the existing coverage denominator.

Follow the cross-platform setup and check commands in [CONTRIBUTING](../CONTRIBUTING.md).
Install real browser engines once with `npx playwright install`. Unit tests
assert independently specified pitch spellings, transposition, all selectable
keys/degrees/qualities/basses, bass register, invalid inputs, progression
timing and bounded audio lifecycle. Browser tests exercise the editor, locale,
mobile layout, progression changes, transport, errors and feedback. Separate
tests render real Web Audio and measure frequency components, scheduled
onsets, silence, replacement and cancellation. A Hann analysis window avoids
mistaking spectral leakage from E-flat for an actually sounding E-natural.

Playwright WebKit has no Web Audio; those tests explicitly skip there, while
its UI tests run. Real Safari/iOS and Android listening, independent subject
review, comprehensive accessibility auditing and baseline whole-project
coverage debt remain in ROADMAP P00/G. No topic completion is claimed here.
No deployment or public launch is authorized by a build or this PR.
