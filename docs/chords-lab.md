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

## Why it is a page of its own

The Chords lab is a separate destination rather than a second tab inside the
Sound lab, and the reason is not layout. The Sound lab's controls — reference
pitch, tuning map, waveform — are the subject of that page, and this lab
deliberately ignores all three: it fixes 12-TET, A4 = 440 Hz and 4/4 so that
a chord always sounds the way its symbol reads. Putting the two side by side
under one heading would invite a reasonable reader to change the tuning and
wait for a chord to follow it. A separate page also earns its own `/#chords`
address, which a lesson can link to.

The cost is a navigation list that grows by one entry per lab, and the roadmap
asks for a lab in almost every module. The structural answer, when the third
lab arrives, is a single **Labs** section with its own index — not fifteen
top-level entries. The alternative worth weighing before then is the opposite
one: making this lab read the Sound lab's tuning and reference, at which point
a tab inside the Sound lab becomes the honest home for it. That is an owner's
decision about what the labs are for, and it is recorded here rather than
settled by this release.

## Use / Использование

Open **Chords lab** in navigation, follow the button under **A little
experiment**, or open `/#chords`.

1. Choose a starting point. The picker is a library grouped by family:
   cadences, classical schemas, pop and rock loops, jazz turnarounds, blues
   forms, and colour (mode mixture and an applied dominant), plus a single
   tonic chord to build from nothing. Each entry names its Roman numerals, and
   the **Listen & explore** tab carries its explanation and the reading it
   comes from.
2. Select a progression card. Change its root degree, chord type, bass or
   duration. The inspector shows the interval formula, spelled pitches,
   registers, bass and keyboard positions. Listen to the chord or one pitch.
3. Add from the diatonic triad/seventh palette. A palette chord is appended;
   the copy button places a duplicate beside the selected card. Move and remove
   cards with the labelled buttons. Reordering is keyboard accessible and does
   not require dragging. At least one and at most sixteen chords remain.
4. **Undo and redo cover every change to the progression**, including loading a
   different starting point, transposing, changing the palette scale and
   deleting a card. Loading an example over work you had edited says so, and
   names Undo as the way back. Timbre, volume and repeat count are playback
   settings rather than part of the phrase, so undo leaves them alone.
5. Transpose with the tonic control. Transposing and changing the palette scale
   both change how much room each chord needs, so either can pull a card that
   was sitting at the top of its range down a register. That clamp is lossy:
   changing back does not restore the register the card had, only Undo does.
   Changing the palette scale also changes
   the progression's degree roots, retaining custom chord qualities. Edited
   chords can therefore lie outside the palette. Only three of the seven
   degrees differ between major and natural minor, so a progression built on
   the others — I–IV–V among them — sounds identical in both; the lab says so
   when that happens rather than leaving the reader to wonder whether the
   control worked. **Fit chords to the scale** is how a progression joins the
   new palette: it re-qualifies every chord to the type its own degree gives,
   keeping degree, bass, length and register. A chord's size is preserved, so a
   triad becomes the diatonic triad and a seventh the diatonic seventh; a ninth
   has no diatonic equivalent in this palette and becomes its degree's seventh.
   It is one undoable edit, and the control reads as unavailable while every
   chord already matches. The minor palette is natural
   minor; choose major V or V7 to compare the raised leading tone.
6. Move the selected chord up or down with the octave buttons on its card.
   They move that chord alone: a chord in a high bass position already sits
   well above its root position — a ninth chord's top note rises 21 semitones
   between root position and its highest bass — so bringing one card back down
   is how a phrase is evened out. The top stop is where the chord would leave
   the keyboard; the bottom one is as low as this lab goes, since the derived
   floor is the lowest offered register for every chord. A card that has been
   moved is marked in the timeline.
7. Choose tempo, one/two/four passes, and one of eight accompaniment figures:
   held chords, repeated quarters or eighths, arpeggios rising or falling, the
   Alberti low–high–middle–high pattern, a bass note answered by afterbeat
   chords, or chords on the upbeats alone. Timbres are synthesized sine and
   triangle waves; real instrument samples are not part of this release.
8. Compare one change at a time in **Listen & explore**. **Try a challenge**
   gives feedback on root identification even when the bass changes.
   **Terms & sources** connects the notation and harmonic concepts to readings.

Откройте **Лабораторию аккордов** в меню или по кнопке под **Небольшим
экспериментом**. Выберите пример из библиотеки: она сгруппирована по семействам
(каденции, классические схемы, поп- и рок-петли, джазовые обороты, блюзовые
формы, краски и хроматика). Затем выберите карточку аккорда. В редакторе
меняются ступень основного тона, вид аккорда, бас и длительность. Палитра
добавляет трезвучия или септаккорды; кнопки позволяют переставлять, дублировать
и удалять карточки. Кнопки октавы на карточке аккорда переносят **только
выбранный аккорд**: аккорд с басом в верхнем обращении звучит заметно выше
основного вида, и его можно вернуть вниз, не трогая соседние. Перенесённая
карточка помечается в дорожке, а кнопки останавливаются там, где аккорд вышел
бы за пределы клавиатуры. **Отменить и Вернуть охватывают любое изменение
последовательности**, включая загрузку другого примера. Тоника транспонирует
последовательность. Смена гаммы меняет высоты ступеней, сохраняя выбранные виды
аккордов: мажор и натуральный минор различаются лишь тремя ступенями из семи,
поэтому последовательность на I–IV–V звучит в обеих одинаково — лаборатория
сообщает об этом, а кнопка «Подогнать аккорды под гамму» приводит виды аккордов
к новой гамме одним отменяемым действием. Для вводного тона в миноре сравните
мажорный V7 с минорным v7.
Вкладка **Проверьте себя** объясняет отличие основного тона от баса;
**Термины и источники** содержит определения и ссылки.

Settings and the edited phrase live in the mounted lab session: navigating
away or reloading resets them, and the undo history goes with them. There is no
account, upload, remote storage, automatic save, or audio export in this
release. The one thing that is remembered per browser is the navigation panel's
width, which is an interface preference rather than musical work.

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
- Counted nouns go through `lib/plural.ts`, because Russian selects one of three
  forms by the last digits of the number: `1 доля`, `2 доли`, `5 долей`. A
  hard-coded genitive plural produced `2 полутонов` and `4 долей` before this
  rule existed. New counters belong in that file's `nouns` table, with a test.
- Each pitch class has a conventional tonic spelling in each palette. For
  example, major D-flat changes to minor C-sharp, while B-flat minor avoids
  the unnecessary double/triple accidentals of A-sharp minor. Spelling follows
  degree letters throughout, including diminished sevenths and double signs.
- Roman roots use the major scale as reference in both modes: minor's lowered
  III/VI/VII roots get flats. Lowercase indicates minor or diminished quality;
  symbols distinguish sevenths, suspensions and ninths. This convention is
  explained in the UI and is not presented as the only analysis convention.
- A card is additionally marked `V/x` when, and only when, its chord is
  major-quality on a degree whose own scale triad is not, **and** the following
  chord's root lies a perfect fifth below. Both halves are required, because an
  applied dominant is defined by its resolution. The consequences are
  deliberate: the key's own dominant is never marked; a blues I7 moving to IV7
  is never marked, because the tonic triad is already major; `♭VII` in minor is
  never marked, for the same reason. Cases the rule cannot prove keep their
  degree numeral alone, which is a description rather than an analysis.
- Bass choices rotate the written chord tones into ascending register; a
  compound ninth can span more than one octave. This is not automatic smooth
  voice leading, SATB assessment, an unrestricted slash-bass or a drop-voicing
  algorithm. Shared pitches are compared modulo the octave, not claimed to
  be retained voices in the same register.
- The templates are independently assembled harmonic exercises, not
  transcriptions or full arrangements, and no recorded or notated example from
  any source is reproduced. A chord succession is a frame, not a style: the
  lab does not claim that playing one of these patterns produces the genre it
  is named after, and it does not classify cadences automatically, because a
  V–I chord pair alone does not certify a cadence. Blues I7 is not labelled
  dominant *function*. The straight pulse is not swing, blues phrasing or
  microtonal blue-note intonation.
- This lab has its own fixed 12-TET reference, A4 = 440 Hz, and straight 4/4.
  Sound-lab tuning/reference controls do not alter it. One beat is a quarter
  note; the twelve-bar examples contain 48 beats each.
- Each chord carries its own register, offered between 1 and 6. The stored
  number is the octave the key's tonic is spelled in while that chord is built,
  which is what holds degree spelling steady across a transposition; it is not
  always the root's own written octave, because a root letter that wraps past B
  is written an octave higher. The control therefore shows the reader the
  octave the chord actually sounds in — the one the pitch chips beside it name,
  and in Russian an octave name rather than a number — while the buttons move
  the stored register. The two differ by a constant, so a step is still a step,
  and no end-of-range message names an octave.
- Which registers a chord can occupy depends on the chord, not on its
  neighbours: a ninth in its highest bass position reaches near the top of the
  keyboard and can be lowered much further than it can be raised. The buttons
  disable at that chord's own ends, and a test asserts the offered range is
  exactly the playable one for every key, degree, type and bass position.
- An edit that has nothing to do with the register can still leave one out of
  range — transposing, widening the chord type, or moving the bass up all
  change how much room a chord needs. Every such edit passes through one clamp,
  so a stored register is pulled back at the moment it stops fitting. Without
  it the phrase failed only at Play, with an error blaming the browser.
- Mixed registers are a real editing tool and a real risk: the arpeggio,
  Alberti and afterbeat figures walk each chord's own notes, so a chord dropped
  an octave turns a stepwise bass into a leap. Nothing breaks; the progression
  simply sounds different, which is the point of being able to hear it.
- Accompaniment figures follow Hutchinson §14.3–14.5 and are ways to hear the
  same harmony move, not claims about a style: none of them is swing, guitar
  strumming, a drum pattern or a real instrument. Voices sounding at the same
  moment share one level, so an arpeggio is not quieter than a block chord.
- Tempo: 40–200 BPM, 1–8 beats per chord, 1–4 bounded passes, maximum three
  minutes. Every template is tested to stay inside those bounds at four passes,
  so no starting point can load in an unplayable state. Audio phrases and note
  events are validated before scheduling. The UI explains an overlong phrase
  and disables playback until shortened.
- No audio context exists until a Play/Listen/pitch gesture. The audio clock
  schedules all note onsets; a UI timer only reads that clock for highlighting.
  Generation checks cancel pending resume operations. Escape, editing,
  hiding the page and unmounting cancel scheduled voices. Ended nodes are
  disconnected; the context is closed on unmount. Start failures are visible
  and retryable. The volume slider reads 0–100% of this lab's own ceiling
  rather than of full scale, so its right-hand end is a round 100% and still
  well below what the player would accept. It is never a calibrated SPL.

## The progression library

Each template names one section of one reading, and the chord pattern it
produces is asserted in `tests/chords.test.mjs` against symbols written out by
hand from that reading rather than recomputed from the code. Patterns are
facts, not prose: nothing is quoted, and the explanations are original.

| Family | Templates | Reading |
| --- | --- | --- |
| Cadences | authentic `I–IV–V7–I`, half `I–vi–ii–V`, deceptive `I–IV–V7–vi`, plagal `I–V–I · IV–I` | Hutchinson §7.4 for the four types; §9.4 for a IV that prolongs the tonic rather than preparing the dominant |
| Classical schemas | minor leading tone `i–iv–V7–i`, lament `i–♭VII–♭VI–V`, circle of fifths `iii–vi–ii–V–I` | Open Music Theory “Classical Schemas”; Hutchinson §9.3 |
| Pop and rock | singer/songwriter `I–V–vi–IV` and its `vi–IV–I–V` rotation, doo-wop `I–vi–IV–V`, doo-wop with ii `I–vi–ii–V`, hopscotch `IV–V–vi–I` | Open Music Theory “Four-Chord Schemas”; Hutchinson §9.7 |
| Jazz | `ii7–V7–Imaj7`, minor `iiø7–V7–i(maj7)`, turnaround `iii7–vi7–ii7–V7` | Hutchinson §31.8 and §9.3 |
| Blues | twelve bars, quick change, minor blues, jazz blues | Open Music Theory “Blues Harmony”; Hutchinson §12.4; DeBenedetti §5.5 |
| Colour | borrowed `I–IV–iv–I`, applied `I–V7/V–V–I` | Hutchinson §19.1 and §17.3 |

The rotations matter as much as the patterns. Open Music Theory groups the
four-chord pop cycles by which chord the major tonic is approached from —
authentic from V in doo-wop, plagal from IV in the singer/songwriter cycle, a
skip from vi in hopscotch — and the same four chords in a different order can
put the tonal centre somewhere else entirely. Three templates make that
audible with a single change of starting point.

## Verified source record

Access date for all records: **2026-09-06**. Research/implementation checking:
Codex (first release) and Claude (review, progression library). Independent
EN/RU subject-matter reviewer: **pending owner assignment**; these sources are
evidence, not a substitute for that review. Online texts below have no numbered
edition/year on the inspected section unless stated. Explanations are original
concise summaries of musical facts, not reproduced source prose or adapted
musical examples.

| Source | Exact section / use | Scope and rights |
| --- | --- | --- |
| OneMotion, *Chord Player*, current public web interface, [product page](https://www.onemotion.com/chord-player/) | Chord progression, voicing, bass note, duration, tempo/key/scale and style controls | Product research only; no code, layout, assets or recordings copied. |
| Robert Hutchinson, *Music Theory for the 21st-Century Classroom*, University of Puget Sound, online text | [§6.1 Introduction to Triads](https://musictheory.pugetsound.edu/mt21c/TriadsIntroduction.html); [§6.3 Inverted Triads, including §6.3.1 slash chords](https://musictheory.pugetsound.edu/mt21c/InvertedTriads.html) | Root/third/fifth, four qualities, root versus bass and inversion. Textbook's Western tonal scope; original summaries only. |
| Hutchinson, same text | [§6.5 Simple Sus Chords](https://musictheory.pugetsound.edu/mt21c/SimpleSusChords.html); [§8.1 Introduction to Seventh Chords](https://musictheory.pugetsound.edu/mt21c/SeventhChordsIntroduction.html); [§31.1 Jazz Chord Basics, points 1–4](https://musictheory.pugetsound.edu/mt21c/JazzChordBasics.html) | Chord construction, sus replacements, seventh qualities, ninth/add9 distinction and the minor-major seventh described there as characteristic of jazz. This lab permits bass rotations of sus chords as an experiment; §6.5 itself chooses not to invert them in its exercises. |
| Hutchinson, same text | [§3.1 Minor Scales](https://musictheory.pugetsound.edu/mt21c/MinorScales.html); [§7.4 Cadences](https://musictheory.pugetsound.edu/mt21c/cadences.html); [§9.4 Harmonic Function, especially §9.4.3](https://musictheory.pugetsound.edu/mt21c/HarmonicFunction.html) | Raised seventh in harmonic minor; authentic, plagal, half and deceptive cadence types, and the note that a deceptive cadence covers V resolving to anything but I; the tonic/pre-dominant/dominant pattern and the IV that prolongs the tonic. Functions are contextual, not inferred solely from chord quality. |
| Hutchinson, same text | [§9.3 Shorter progressions from the circle of fifths](https://musictheory.pugetsound.edu/mt21c/ShorterProgressionsFromTheCircleOfFifths.html); [§9.7 The Best-Seller Progression](https://musictheory.pugetsound.edu/mt21c/BestsellerProgression.html); [§12.4, table 12.4.1](https://musictheory.pugetsound.edu/mt21c/TwelveBarBlues.html); [§31.8 Standard Chord Progressions](https://musictheory.pugetsound.edu/mt21c/StandardChordProgressions.html) | ii–V–I, the vi–ii–V–I and iii–vi–ii–V circle segments and their rotations; I–V–vi–IV and the rotations §9.7 names; twelve-bar harmonic form; the jazz standard progressions. No recorded or notated song examples copied. Table 12.4.1 supplies the roots, not a requirement to use sevenths. |
| Hutchinson, same text | [§17.3 Secondary Dominants in Major and Minor](https://musictheory.pugetsound.edu/mt21c/SecondaryDominantsInMajorAndMinor.html); [§19.1 Mode Mixture](https://musictheory.pugetsound.edu/mt21c/ModeMixtureSection.html) | Applied dominants and the `V/x` notation; borrowing from the parallel minor, with the lowered sixth degree named as its commonest carrier. |
| Hutchinson, same text | [§14.3 Arpeggiated Accompaniments](https://musictheory.pugetsound.edu/mt21c/ArpeggiatedAccompaniments.html); [§14.4 Block Chord Accompaniments](https://musictheory.pugetsound.edu/mt21c/BlockChordAccompaniments.html); [§14.5 Afterbeats and Offbeats](https://musictheory.pugetsound.edu/mt21c/AfterbeatsOffbeats.html) | The eight accompaniment figures: arpeggios up and down, the Alberti “low–high–middle–high” pattern, chords repeated in quarters and in eighths, afterbeats that follow a bass note on the downbeat, and offbeats that avoid downbeats. Figures only; no notated example is reproduced. |
| Bryn Hughes and Megan Lavengood, *Open Music Theory*, 2nd edition, eds. Gotham, Gullings, Hamm, Hughes, Jarvis, Lavengood and Peterson | [“Four-Chord Schemas”](https://viva.pressbooks.pub/openmusictheory/chapter/4-chord-schemas/); [“Blues Harmony”](https://viva.pressbooks.pub/openmusictheory/chapter/blues-harmony/) | The doo-wop, singer/songwriter and hopscotch schemas with their substitutions and rotations, and the ear test of which chord the major tonic is approached from; the twelve-bar frame, the quick change, the minor blues and the jazz blues. CC BY-SA 4.0. Patterns and facts used; no text, notation or media reproduced, so this project's own licensing is unchanged. |
| Bryn Hughes and Kris Shaffer, *Open Music Theory*, same edition | [“Classical Schemas (in a Pop Context)”](https://viva.pressbooks.pub/openmusictheory/chapter/classical-schemas/) | The lament schema `I–♭VII–♭VI–V` over the descending minor tetrachord, and the circle-of-fifths schema. CC BY-SA 4.0, same handling as above. |
| Gilbert DeBenedetti, *Harmonic Expansions*, G Major Music Theory, LLC; site copyright 2011, online text | [§5.5 Inserting IV, twelve-bar pattern and final footnote](https://www.gmajormusictheory.org/HarmExpansions/Ch5/05_5.html) | Blues tonic expansion; I/IV dominant-seventh qualities and stylistic distinction from Baroque/Classical progression. Copyright retained; facts paraphrased, no media copied. |
| С. В. Фролов, *Формирование аккомпаниаторских навыков баяниста*, Сумы: ИПП «Мрія-1», 2012, ISBN 978-966-566-549-6 | [PDF, printed pp. 139–140, especially p. 140 classification list](https://www.institute-of-education.com/uploads/store/libfile/204615/attachment/d9935b0c83a2be104fb0adeeb6c375f2.pdf#page=141) | Russian seventh-chord terminology; list read in the PDF text. Bayan pedagogical context; neither its arranging prescriptions nor its scores are reproduced. PDF screenshot service was unavailable; the classification is readable as text. |

Russian `полууменьшённый` is the lead-sheet-oriented synonym used here for
the type Фролов calls `малый септаккорд`; it means a diminished triad plus
a minor seventh. Russian ninth labels, the family names in the picker and the
Russian explanations of the pop and blues schemas are editorial extensions of
the verified terminology, pending native editorial review. The professional
notation source record is shared with [music-notation.md](music-notation.md).

Open Music Theory's chapters returned 403 to the automated fetcher used during
the first release and were recorded then as unavailable. They were read
directly in a browser on 2026-09-06 and are cited above; the earlier note was
about one tool, not about the source.

## Development and validation

`lib/chords.ts` is a pure musical model, template library and bounded phrase
planner; `lib/chord-audio.ts` is the cancellable Web Audio player;
`lib/plural.ts` holds the counted-noun forms; `components/chords-lab.tsx` is
the bilingual editor and its undo history. The navigation hash is registered in
`lib/client-store.ts`, together with the remembered navigation-panel width.
Every new production file is included in the existing coverage denominator.

Follow the cross-platform setup and check commands in [CONTRIBUTING](../CONTRIBUTING.md).
Install real browser engines once with `npx playwright install`. Unit tests
assert independently specified pitch spellings, transposition, all selectable
keys/degrees/qualities/basses, bass register, invalid inputs, every template's
chord symbols and Roman numerals, the applied-dominant rule including the cases
it declines to label, that a register left on the key is refused rather than
ignored, that each chord's offered registers are exactly its playable ones and
do not depend on where it currently sits, that the clamp is idempotent and
keeps every chord on the keyboard, progression timing and bounded audio
lifecycle. Browser
tests exercise the editor, locale, mobile layout, undo and redo across every
kind of edit, progression changes, transport, errors and feedback. Separate
tests render real Web Audio and measure frequency components, scheduled
onsets, silence, replacement and cancellation. A Hann analysis window avoids
mistaking spectral leakage from E-flat for an actually sounding E-natural.

Playwright WebKit has no Web Audio; those tests explicitly skip there, while
its UI tests run. Real Safari/iOS and Android listening, independent subject
review, comprehensive accessibility auditing and baseline whole-project
coverage debt remain in ROADMAP P00/G. No topic completion is claimed here.
No deployment or public launch is authorized by a build or this PR.

## What the model cannot express yet

These are recorded so that the next change starts from a known boundary rather
than a discovery. Each names the roadmap module it would serve.

- **Chromatic roots.** A chord can only sit on one of the seven degrees of the
  selected major or natural-minor scale. That is enough for borrowed `iv` and
  for applied dominants whose roots are diatonic, but not for `♭VII` or `♭VI`
  in a major key, the Neapolitan `♭II`, an augmented sixth or a tritone
  substitution. A validated root alteration of ±1 semitone, spelled from the
  degree letter, would unlock H02 (4.12–4.15), H08 (5.29), H10 (6.12) and the
  Mixolydian and Aeolian rock loops in J07 (8.23).
- **Voice leading.** Bass rotation is register sorting, not part-writing, and
  the per-chord octave transposes a whole stack rather than respacing it.
  Neither is voicing: there is no SATB layout, no doubling rule, no
  parallel-fifth detection and no resolution of the leading tone or the
  seventh. That is the whole of H06.
- **Non-chord tones and rhythm.** Every voice starts and stops with its chord;
  there are no suspensions, passing tones or anticipations (H07), and the meter
  is fixed at 4/4 with a quarter-note beat.
- **Voicings.** Chord tones are stacked from the bass upward. Drop 2, drop 3,
  rootless and quartal voicings (J04 8.14–8.16) would need a voicing layer
  between the chord model and the planner.
- **Analysis beyond one adjacency.** The applied-dominant rule looks at exactly
  one following chord. Tonicization confirmed over several chords, modulation
  and enharmonic reinterpretation (H10, H11) need a phrase-level analyser, and
  should say what evidence they used rather than asserting a key.
- **Instruments.** Every timbre is a bare oscillator. Sampled or modelled
  instruments would need a licensed sound source, a loading strategy for the
  static export, and a decision about download size; the owner has asked for
  them later rather than now, so the figure set above is deliberately the part
  that can be done with oscillators alone. F15 covers timbre and envelope.
- **Playing a chord back.** The practice tab asks the reader to identify a root
  from a list. Asking them to *play* the chord shown, as F08 and H01 want of
  their exercises, needs an input surface — a clickable keyboard that collects
  a set of pitches and checks it against the chord — plus a rule for what
  counts as correct (pitch classes, or register and doubling too). That is a
  content decision as much as a technical one.
- **Keeping your work.** The phrase lives in the mounted session. Naming,
  saving, sharing or exporting a progression touches P07 (files and personal
  data) and is not a change to make casually.
