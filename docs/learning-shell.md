# Learning shell: finding your place, hearing the lesson

This is the user guide, implementation record and evidence for the navigation
and lesson-page changes made after a fresh review of the running application on
2026-11-14. It extends the shared structure of
[connected chapters №537/542](learning-routes.md) and the
[design system](design-system.md); [ROADMAP](../ROADMAP.md) remains the only
completion register and no roadmap item is closed by this record.

## What the review found

The application was opened in a browser at desktop and phone widths, in both
themes and in Russian, and every view was walked through as a learner would.
The problems below were observed there, not inferred from the code.

| Observation | Effect on a learner |
| --- | --- |
| Title, four-view rail, breadcrumbs, chapter contents, **Learning data** and a back link all preceded the first sentence of a lesson | The explanation began below the first screen; the backup panel stood between every page's title and its content |
| The navigation panel showed a promotional card; the book's contents existed only on the Read index | No way to see the chapter list, the current lesson or what was already worked through from inside a lesson |
| The top bar scrolled away, and a move scrolled the title to the very top | On a phone the menu and language buttons were off-screen after every navigation |
| A lesson could not make a sound; **Open this experiment** left the page | "Read a little, hear it" needed a page change and a way back for every example |
| A lesson's laboratory opened the whole instrument without the sentence that says what to try | The task stayed behind in the text |
| Light, dark and device themes existed but no control offered them | The theme could only follow the device |
| The focused title drew a focus ring after each move | Read as a rendering fault around the heading |
| The text column was centred while the title above it was left-aligned; the experiment card broke out to twice the column | Misaligned page, with the card far from the sentence it belongs to |
| The index was a column of underlined links | No chapter numbers, no markers, no "continue" |

A read-only audit of the code by area, run alongside that walk-through, added
defects that cannot be seen in a quick tour. Those that were fixed here:

| Defect | What happened | Now |
| --- | --- | --- |
| Skip link | `#main-content` was read as an unknown address, so **Skip to content** opened the Sound lab | Focus moves to the main region; the page and address stay |
| Brand link | One click added two history entries and left the phone menu open | One entry; the menu closes |
| Link to a rule | The page scrolled back to the title after arriving at the passage | The passage stays in view, below the bar |
| Drill at 900–1200 px | Question and ledger did not fit beside the docked navigation; the page scrolled sideways | The columns follow the room the page has |
| Focus ring in the lab | The dark bed's pale ring was drawn on white panels and piano keys at about 1.5:1 | Panels and keys restate the ring measured against them |
| Reference pitch | Typing 432 passed through 43 and left a low tone clamped at the wrong note | The note is kept as a ratio to the reference while it is edited |
| Shortcuts | A–K and the arrow keys stopped working after any click, because a clicked button keeps focus; Space did nothing while a slider had focus | A focused control keeps only the keys it needs: Space stays with a button, link, tab or disclosure, the arrows with a slider or a tab, and every other shortcut reaches the lab |
| Chords: ninth in the bass | Saving that choice threw inside autosave and stopped all saving | The saved-data limit follows the chord's own size |
| Chords: tempo field | Leaving the field unchanged stopped playback, cleared Redo and added an empty Undo step | Only a changed tempo is an edit |
| Interrupted notes | A preview note was cut mid-cycle, which is heard as a click | Each voice is released over a few milliseconds |
| Staff placement | On a narrow page the click rows drifted off the lines they stand for | The box keeps its aspect ratio, so rows scale with the drawing |
| Answer mode | The three answer modes looked alike; the chosen one was only announced | The chosen mode is drawn as chosen |
| Lesson question | A wrong answer showed that it was wrong, never what was right; the buttons were one word wide | The right option is marked, the verdict is said in words, the answers fill the column |
| Starting check | It explained each answer without saying whether it was right | Verdict in words; right and wrong options marked |
| Glossary entry | Permalink, source and lesson links ran together as one line | One link per line; on a narrow page the entry scrolls into view when chosen |
| No scored exercise | Its two links were unstyled and read as one phrase | A button and a link |
| Frequency field | Six characters wide for values of eight or nine | Wide enough; smaller type on a phone |
| Slider marks | "100" and "1k" stood where the logarithmic slider reads about 200 Hz and 2 kHz | Each mark is at its own position |
| Oscilloscope | At a device ratio of 1.25 or 1.5 the canvas was reallocated every frame | Sizes are compared in whole pixels |
| First paint | A returning reader saw the English light Sound lab before their own page | Theme resolved before paint; the shell is shown when it is the reader's |
| Printing | A lesson printed with the navigation, and pale ink from the dark theme | A print style: text, steps and figures in dark ink |
| German address | A few controls said *Sie* in a *du* interface | *du* throughout |

Not changed here, and still open from that audit: the two vocabularies for the
four views (sidebar nouns and rail verbs); confirmation and feedback wording of
import and reset; the glossary's kind labels, topic chips and keyboard path;
the drill's lost question on a language change, its repeated seeds and the
correction shown after a wrong staff placement; touch-target sizes and phone
padding in the Sound lab; the oscilloscope's time scale; nested figures and
empty captions in notation readings; forced-colors support; the breakpoint set
of the two laboratories; and the order and length of the tuning, intervals,
scales and chords chapter.

## Using it

**Course map.** The navigation panel lists the sections, chapters and lessons of
the book in reading order. The open lesson is highlighted in whichever of its
four views you are in, and its chapter is expanded. With no lesson open, the map
opens at the lesson you last read, or at the first lesson you have not marked.
A filled check beside a title is your own **I have worked through this lesson**
marker; the line under **Course** counts those markers. Choosing a lesson opens
its text. On a phone the map is in the navigation sheet and closes when you
choose.

**Continue.** The Read index starts with one card: the first lesson for a new
reader, the lesson you last opened for reading while it is unmarked, otherwise
the first unmarked lesson in reading order. A lesson you skipped is therefore
offered again rather than treated as read. When every lesson is marked the card
says so and offers nothing. Opening the Chords lab or a drill on its own does
not count as starting a lesson.

**Chapter cards.** Each chapter shows its number in the book, how many of its
lessons you have marked, its goal, its prerequisites and its lessons as numbered
rows.

**Try it in the lab.** Every lesson has a card with that title: the task, a line
saying what to listen for, and one to four buttons that play the sounds the
instruction names: 220 Hz and 440 Hz
for the first lesson, the three thirds for tuning, the two triads for chords,
the same four beats at ♩ = 60 and ♩ = 120 for tempo. Press a button to hear the
example; press it again, choose another example or press Escape to stop it. The
line below the buttons names what is sounding. On a wide page the card stays
beside the text while you read; on a narrow one it follows the rule at a
glance, or the figures where the lesson has them, and precedes the common
mix-up. **Open this experiment** still opens the full instrument with the
lesson's preset.

**Experiment brief.** When you open a lesson's Play view, the instruction is
repeated above the instrument with **Back to the lesson** and, where the topic
has questions, **Practise this topic**. The Sound lab opened on its own has no
brief. The Chords lab is the chords lesson's instrument, so it always has one.

**Theme.** The three buttons at the end of the top bar choose the light theme,
the dark theme or the device setting. The choice is saved with the other local
settings.

**Learning data** now closes every page instead of preceding its content. Its
contents, export, import and reset are unchanged; see
[local learning data](local-learning-data.md).

**Order of a lesson.** Where the lesson stands and what it builds on; its goal
and the question it answers; the explanation; one example worked step by step;
the rule at a glance; figures to read, in the thirteen notation lessons; the
card to try and hear it; a common mix-up; one question with the right answer
shown, in those same thirteen lessons (the six from sound to chords have no
generated question, so the mix-up is followed by what to keep); what to keep;
the source; your marker; then previous and next. The next lesson is a card with the
sentence that connects it; the first lesson's card spans the row. The question,
example, mix-up and list to keep are the lesson's guided walk-through, described
in the [content schema](content-schema.md#the-guided-walk-through).

## Sound: what the examples are and are not

Lesson examples always sound in twelve-tone equal temperament at A4 = 440 Hz, at
the laboratory's current volume, whatever reference pitch and tuning the
laboratory itself is set to. That keeps «220 Hz» at 220 Hz for every reader and
is stated under the buttons. The tuning lesson is the only one whose examples
name another tuning, because comparing them is its subject: its three buttons
keep A4 and change the third above it to the equal-tempered, just (5:4) and
Pythagorean (81:64) sizes from `lib/music.ts`. This is a property of the
examples, not a claim that equal temperament is the correct tuning of music.

Every example starts from a click or key press, lasts at most ten seconds
(`MAX_LISTEN_SECONDS`, enforced by a test; the longest today is an eight-note
scale at 5.15 s) and ends by itself.
Navigation, a hidden page, page exit and Escape silence it, like every other
sound on the site. Browser gain is not calibrated sound pressure; keep the
volume comfortable. An example that cannot start says so in its card, beside the
button that was pressed, and is not shown as sounding.

The examples introduce no new statement about music. Each list in
`lib/lesson-listening.ts` is the lesson's existing experiment instruction cut
into the sounds it names, using the existing Notes-lab examples for rhythm,
dynamics, articulation and repeats. A label names what sounds; explanations and
their sources stay in the lesson. The Russian labels use traditional note names
with the project's italic markup, the German labels H/B and octave marks.

## Implementation

| Part | Where |
| --- | --- |
| Marker counts, the lesson a saved address was reading, the lesson to offer next | `lib/course-progress.ts` |
| Listening examples per topic and the pure plan handed to the audio engine | `lib/lesson-listening.ts` |
| Listening buttons, live caption, bounded clock | `components/lesson-listen.tsx` |
| Course map | `components/course-map.tsx` |
| Continue card, chapter numbers and markers, breadcrumbs, lesson cards | `components/course-navigation.tsx` |
| Experiment brief | `components/experiment-brief.tsx` |
| Theme buttons | `components/theme-switch.tsx` |
| The mark on an answered option | `components/answer-mark.tsx` |
| Wiring, the remembered lesson, lesson audio | `app/(root)/page.tsx` |
| Lesson order and the optional `listen` capability | `components/learning.tsx` (`Theory`) |
| The walk-through's shape and its text per lesson | `lib/content/schema.ts` (`guideSchema`), `lib/content/topics/*.ts` |
| Theme before first paint, and the pending shell | `lib/theme-boot.ts`, both `layout.tsx` files |
| Release of interrupted voices | `lib/audio.ts` |
| Layout and tokens (`--topbar-h`, `--m-lesson`, `--m-aside`, `--t-nav`, `--focus-chrome`, `--focus-halo-chrome`) | `app/globals.css` |

The lesson page is one grid. Its second column appears through a container
query on the main area (60 rem), not a viewport query, because the room a lesson
has depends on the reader's own navigation width as well as the window. The
listening card spans every row and is sticky below the top bar; spacing between
blocks is margins rather than a row gap so the span adds no empty gaps.

The top bar is sticky and declares its height as `--topbar-h`. The page sets
`scroll-padding-block-start` from it, so a title, a linked passage or a control
reached with the keyboard is never brought to rest under the bar; the drill
ledger and the listening card stick below it.

The title still takes focus on every move, so the arrival is announced and the
next Tab starts at the top of the page; it no longer draws a ring, because it is
not a control and is never in the Tab order. Every control keeps the one
site-wide focus ring.

Nothing new is stored. The remembered lesson is derived from the saved
`lastRoute` at start and from the lessons read during the visit. The backup
format and its version 2 are unchanged. Two accepted sets are wider in this
branch: a saved chord's inversion may be 0–4 instead of 0–3, so a ninth chord
with its ninth in the bass can be saved, and an answer row's last-mistake tag
may also be `carried-the-sign-to-another-octave`, the feedback added by the
[accuracy review](content-review-2026-11.md). Backups written earlier load as
before; a backup written by this build that carries either value is refused by
an earlier build.

Two colour tokens were added, in both themes: `--focus-chrome` and
`--focus-halo-chrome`, the ordinary focus ring under a name of its own, which
the panels and note cards standing on the laboratory's dark bed take back from
the bed's pale ring. The piano keys there restate the existing paper ring
(`--focus-paper`, `--focus-halo-paper`).

Removed: the promotional card in the navigation panel, the **All foundations**
back button (the breadcrumbs already lead there) and their five German catalogue
entries.

## Accessibility

- The course map is a `nav` named *Course contents*; chapters are native
  `details`, the open lesson carries `aria-current="page"`, and a marker is a
  check plus the words *worked through* for assistive technology.
- Listening buttons are real buttons with `aria-pressed`, which tells a screen
  reader what is sounding. The caption shows the same in text for a reader who
  cannot hear the tone; it is not a live region, because speech over a
  two-second example would cover it. A sound that could not start is announced
  in a status region in the card. Sounding is shown by icon, caption, border and
  wash, never by colour alone. Targets are at least 44 px high.
- Theme buttons are named in EN/RU/DE and expose their state with
  `aria-pressed`; the icons are decorative.
- The experiment brief is a region labelled by its heading.
- **Skip to content** moves focus to the main region without leaving it in the
  Tab order afterwards. Shortcuts are not taken from a typing field, from
  anything inside the navigation sheet, or from a control that needs the key
  itself: Space from a button, link, tab or disclosure, the arrows from a
  slider or a tab.
- In the lesson question and the starting check, the right option and a wrong
  choice carry an icon and words as well as colour (`components/answer-mark.tsx`),
  so the answer is identified without colour, also after *I'm not sure*.
- No colour literal stands outside the token blocks; the two focus tokens above
  are the only additions. Text sits on surfaces already measured there.
- No content is dropped at a narrow width, and at 360 px no lesson, index or
  card scrolls sideways (checked for every lesson in three languages). Print
  leaves out navigation, sound buttons and saved-data controls on purpose.

Not covered here: a full WCAG audit and real-device checks, which remain under
№521/522.

## Verification

```sh
npm test
npm run test:browser
npm run typecheck
npm run lint
npm run format:check
npm run build
```

`tests/course-progress.test.mjs` covers marker counts, unknown and repeated
markers, which saved addresses count as a lesson being read, and the start,
resume, next and finished states. `tests/lesson-listening.test.mjs` checks that
every lesson has one to four bounded examples with labels in three languages,
and that each example sounds what its lesson names: exact frequencies, the three
sizes of third, interval, scale and chord patterns against the laboratory's own
tables, one waveform change for timbre, equal time spans for the rhythm
comparisons, and independence from the laboratory's tuning.
`tests/learning-shell.test.mjs` renders the map, the continue card, the chapter
cards, the theme buttons, the brief and the listening buttons, including the
bounded clock, replacing and stopping an example, a failed start, a slow start
overtaken by a newer choice, a start that never answers, a hidden page, Escape
and unmount; the order of a lesson; and the lesson question's marks and verdict.
`tests/lesson-guides.test.mjs` checks that every lesson has a walk-through of
the required shape in three languages. `tests/theme-boot.test.mjs` runs the
first-paint script against saved, legacy, damaged and missing settings.
`tests/audio.test.mjs` and `tests/browser/audio.browser.test.mjs` check the
release of a voice interrupted before it starts, during its attack and while it
sounds; the browser file renders the result and measures the step at the cut.
`tests/browser/learning-shell.browser.test.mjs` runs the assembled page in real
browsers: the sticky bar and keyboard focus below it, the map, the continue
card, the two-column lesson and its 360 px form in three languages, the skip and
brand links, a link to a passage, the drill beside the docked navigation, the
reference pitch, slider marks, shortcuts, a failed example, the glossary entry,
the chords tempo field, staff placement on a narrow column, answer modes, the
phone navigation sheet, the pending shell and the oscilloscope canvas.

What these do not show: print output and the oscilloscope's cost per frame were
checked by reading the rules and the canvas size, not by a printed page or a
performance trace; no screen reader or physical phone was used.

Results of the local run are recorded in the pull request.
