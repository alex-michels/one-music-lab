# OML — One Music Lab

A music and sound learning workspace prototype in English, Russian and German.

The project was renamed from Open Music Lab to **One Music Lab** in September
2026. The owner has registered **onemusiclab.org** as the future public address;
**Public launch is blocked** until the Germany/EU compliance and rights review
in ROADMAP P10 is complete and the owner explicitly authorizes publication.
Private VPS staging uses loopback and an SSH tunnel. DNS and public HTTPS remain
pending. The page metadata uses
`https://onemusiclab.org/` as its canonical URL. The GitHub repository is
`alex-michels/one-music-lab`.
The OML abbreviation, saved language preference, and WAV filename prefix remain
compatible with the existing prototype.

Original code is **Apache-2.0**; original educational content is **CC BY 4.0**.
See [LICENSE](LICENSE), [CONTENT-LICENSE.md](CONTENT-LICENSE.md) and
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Paid hosted services or optional
features may be offered without withdrawing the rights granted by these licenses.

The [roadmap](ROADMAP.md) is a checklist grouped by subject, with permanent task
numbers: ask for “task 003” to work on note and octave names. It is the only
completion register. The [roadmap guide](docs/roadmap-guide.md) maps the original
511 topic IDs and 128 modules to these numbers and links to the requirements,
sources, engineering evidence and historical audit. Each learning topic must
pass [gate G](docs/release-criteria.md); publication has a separate checklist item
and still requires the owner's authorization.

## Included

- **Notation prototype (№553):** the Notes lab draws four clefs, ledger lines and accidentals locally. Practice → Reading notation → Read a note supports choices, typed EN/RU/DE note names and pointer/keyboard placement. See the [user guide, engine evidence and limits](docs/notation-engine.md).

- **Notation programme (№558):** thirteen connected EN/RU/DE lessons, bounded Notes-lab experiments, per-note practice feedback and sourced reference entries. Start with **Read → Note names and octaves** and follow the previous/next lesson links; use the four views of each topic to read, experiment, practise and look up terms. In **Play → Notes**, choose a note, accidental, octave and clef; compare its written and sounding pitch, play short examples, place notes on the staff, and compare key signatures and octave shifts. Labelled menus support keyboard selection and readable light/dark themes; scores use light ink in dark mode, while piano keys retain their colours. The [PDF coverage and evidence record](docs/notation-programme.md) explains the programme's scope and checks for personal learning. Public release remains separate.

All teaching material follows the [connected chapter requirement](docs/engineering.md#task-537): progressive explanations and examples, chapter contents, previous/next lessons and links to related experiments, exercises and definitions. Extending this structure across all subjects remains tracked by №537/542.

Lessons present a learning goal, explanation and worked example before practice.
The practice ledger groups skills by topic with headings in the selected language;
glossary headings use consistent capitalization and retain existing article links.
The [EN/RU/DE editorial review](docs/learning-editorial-review.md) records the
terminology, explanation and example corrections across the shipped material.

- **Chords lab** (`/#chords`): editable and transposable progressions with full undo and redo, 16 chord types through ninths, inversions, EN/RU/DE pitch spelling, a visual keyboard, applied-dominant marking, and a sourced library of 22 starting points — cadences, classical schemas, pop and rock loops, jazz turnarounds, blues forms and mode mixture — with a per-chord register control, one-click fitting of a progression to its scale, eight accompaniment figures (block chords, arpeggios, Alberti bass, afterbeats, offbeats) and root-identification feedback. See the [user guide, research and limitations](docs/chords-lab.md).
- Continuous 20–20,000 Hz oscillator, four waveforms, logarithmic frequency control, cents readout and live analyser waveform.
- Editable A4 reference from 20–2,000 Hz, presets, and 12-TET plus specific A-anchored just and Pythagorean chromatic ratio maps.
- Two-octave keyboard with register controls; computer keys A W S E D F T G Y H U J K play a chromatic octave. Space toggles continuous sound, Escape stops all audio, and arrows adjust frequency.
- Intervals, ten scale collections and seven chord types with sequential/simultaneous playback. All notes are calculated from the selected tuning.
- Band-limited Web Audio rendering of five-second mono PCM WAV files with attack/release ramps.
- Nineteen introductory lessons, including thirteen notation lessons, in EN/RU/DE with sources and linked experiments, a glossary searchable in all three languages, and interval ear training with feedback and session scoring.
- The scale lab spells pitches by scale degree in the active locale (for example, C minor is C–D–E♭–F–G–A♭–B♭), and includes natural, harmonic, and ascending/descending melodic minor forms. See [localized notation](docs/music-notation.md).
- Russian Sound lab intentionally combines Russian names in “A little experiment” with international labels in its other existing panels. These displays are accepted. New Russian theory, teaching material, trainers and ordinary encyclopedia articles use traditional Russian notation; articles about international systems show those systems' notation. In new Russian laboratory material, traditional Russian notation has priority and international notation remains valid. See the [notation scope](docs/music-notation.md#scope-of-future-localization-work).
- An explicitly marked curriculum roadmap covering early music, European traditions 1600–1900, blues/jazz/pop, world traditions and contemporary musical languages.

This is the first product slice, not an exhaustive encyclopedia or a universal instrument synthesizer. Real instrument synthesis, additive synthesis, noise, arbitrary temperament imports, detailed rhythmic training, full score editing, historical courses and culturally contextualized world-music modules are future work. No medical or special-health claims are made for alternate concert pitches.

## Deutsch

Choose **DE** in the header. All five areas, lessons, chord examples and
feedback are translated. German notation uses H/B, C-Dur/c-Moll and classical
octave labels such as a′. The language preference stays in this browser. See the
[German guide and verified sources](docs/german-localization.md).

## Development

Install **Node.js 24** (including npm) and Git. These commands work in PowerShell,
macOS Terminal, and Linux shells:

```sh
git clone https://github.com/alex-michels/one-music-lab.git
cd one-music-lab
npm ci
npm run dev
```

If Windows PowerShell blocks `npm.ps1` under its execution policy, use
`npm.cmd` in place of `npm` in these commands; no policy change is needed.

Open the URL printed by the development server (normally `http://localhost:3000`).
Keep that terminal running; stop it with Ctrl+C. Changes to React/CSS reload in
development. Start audio with an explicit click/key gesture. The application
does not require an account, API key, database, or audio upload for local use.
Do not create or commit credentials. The existing Sites service controls access
to its hosted preview, independently of the application.

In a second terminal in the repository:

```sh
npm test
npm run test:browser
npm run test:coverage
npm run typecheck
npm run lint
npm run format:check
npm run notation:check
npm run glyphs:check
npm run build
```

`npm test` covers tuning identities, inverse note mapping, cents, WAV structure,
audio scheduling/cancellation with a mocked AudioContext, roadmap integrity, the
URL-hash/localStorage client store, and the viewport (`useIsMobile`) store.
It also checks copied UI provenance, rendered `ItemGroup` list semantics and
the narrow lint allowance for explicit native-list roles. See the
[UI provenance boundary](docs/ui-provenance.md) before editing catalog copies.
`test:coverage` reports **every authored file**, including files no test loads
yet, so an untested module appears at 0% instead of disappearing. The current
measurement is complete, the coverage itself is not. Task-specific results and
remaining gaps are recorded in the [notation programme evidence](docs/notation-programme.md).

The notation regression suites also check that feedback describes the selected
mistake, that all thirteen lessons are connected in reading order, that duration
options require reading similar symbols, and that metronome questions respect
the printed beat unit. Source links distinguish
current terminology from historically bounded performance conventions.

`npm run test:browser` runs the audio and component suites in real Chromium,
Firefox and WebKit, so run `npx playwright install` once first. The audio tests
render the oscillator graph through `OfflineAudioContext` and measure the
result — frequency, attack, fade-out, the Nyquist limit, sequence timing and a
decoded WAV export — because a mocked `AudioContext` cannot show what would be
heard. Playwright's WebKit ships without Web Audio, so those tests report as
skipped there and real Safari, iOS and Android checks on devices stay open in
ROADMAP P00. UI and actual browser audio tests are still needed.
The 24 lint errors found by the audit are fixed (ROADMAP P00); `npm run lint`
and `npm run format:check` must pass, and the Baseline checks GitHub workflow
fails on a lint or formatting error. `npm run format` rewrites the authored
source; the imported `components/ui` copies and prose, data and configuration
files are outside the formatter, as `.oxfmtrc.json` records.
The workflow reproduces tests/types/lint/build, the Worker HTTP check and the
static export check; it is not a publication gate until P00 is completed.

To check the rendered site identity, keep `npm run dev` (or `npm start` for the
built Worker) running and use its printed URL in a second terminal:

```powershell
# Windows PowerShell
$env:OML_TEST_BASE_URL = 'http://localhost:3000'
npm run test:site
```

```sh
# macOS / Linux
OML_TEST_BASE_URL=http://localhost:3000 npm run test:site
```

Replace the port with the one printed by your server. This read-only HTTP test
checks the rendered document title, canonical URL, and accessible lab home link.
It requires an explicit target so it does not accidentally test a public site;
it does not configure DNS, start playback, or replace browser interaction tests.

To try the built Worker locally after a successful build:

```sh
npm start
```

Open the URL Wrangler prints. **This runs a local Wrangler development emulator;
it is not a production command for a Linux VPS.** The generated stack uses
Vinext, React, Vite, Sites/Cloudflare plugins, Base UI/Shadcn, and Web Audio.
For the separate portable target, see [private staging](docs/private-staging.md):
`npm run build:static` and `npm run test:static`. GitHub Actions builds a static
artifact for private review; it does not deploy or receive VPS credentials.
The documented Windows static-build shutdown failure must not be treated as a
successful build. Use a successful Linux CI artifact for the private Caddy setup.
The shared public web server is not part of that setup.

The [prelaunch review](docs/prelaunch-review.md) records current findings on
storage, data protection, German provider information, accessibility, brand and
content/software rights. It is a preliminary audit, not legal clearance. Device
fonts replace external Google Fonts requests; app storage still needs review.

If installation fails, verify `node --version` reports v24, ensure registry access,
and rerun `npm ci`; do not delete or regenerate the lockfile to bypass errors.
If PowerShell blocks `npm.ps1`, use `npm.cmd` for these commands. If a port is
busy, stop your previous server or use the alternative URL/port printed by the
tool. If sound is suspended, use the explicit play control and check browser/OS
output settings. An out-of-range note may be unavailable at the current tuning.

Use a feature branch and PR for further changes. Every code change needs tests
and documentation, with a target of 100% meaningful coverage across all
first-party code. Read [CONTRIBUTING.md](CONTRIBUTING.md) and [AGENTS.md](AGENTS.md)
for the rule, current gaps, source checks, and the four-layer release criteria.

The persistent oscillator and previews stop on navigation, page hiding, page exit, or Escape. Playback requires an explicit gesture; the initial volume is 18% of a gain-limited output. Browser volume does not measure acoustic loudness. Waveforms above the device's Nyquist limit cannot be synthesized; notes outside the lab's frequency range are unavailable on its keyboard.

## Content model

`lib/music.ts` is the independent pitch/ratio model. `lib/audio.ts` owns browser audio. `lib/learning.ts` holds paired English/Russian educational content and scale/chord patterns. `components/learning.tsx` connects learning, listening and exercises. New languages can extend the paired content model and language selector. Tuning maps are specific A-based chromatic choices; just intonation does not have one universal chromatic scale. MIDI labels use scientific pitch notation; A4 corresponds to ля первой октавы in Russian notation. The keyboard intentionally displays pitch labels with sharps rather than full context-sensitive enharmonic spelling.

## Validation limits

Automated checks cover numerical calculations, WAV structure and scheduling logic. Actual browser audio output and interactive browser QA were not performed; the user did not request browser testing. Optional WebMCP tools (`read_sound_lab`, `configure_sound_lab`, `stop_lab_audio`) are feature-detected and use the same application state. No supported live WebMCP test context was available, so those integration contracts have not been verified in a live browser.

## References

- Starting reference: https://www.szynalski.com/tone-generator/
- UNSW musical acoustics: https://newt.phys.unsw.edu.au/jw/notes.html
- UNSW temperament: https://newt.phys.unsw.edu.au/music/temperament/WhatFor.html
- Open Music Theory: https://viva.pressbooks.pub/openmusictheory/
- University of Puget Sound: https://musictheory.pugetsound.edu/mt21c/IntervalsIntroduction.html
- Web Audio: https://developer.mozilla.org/en-US/docs/Web/API/OscillatorNode
