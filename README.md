# OML — Open Music Lab

A bilingual English/Russian first release of a music and sound learning workspace.

Original code is **Apache-2.0**; original educational content is **CC BY 4.0**.
See [LICENSE](LICENSE), [CONTENT-LICENSE.md](CONTENT-LICENSE.md) and
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md). Paid hosted services or optional
features may be offered without withdrawing the rights granted by these licenses.

## Included

- Continuous 20–20,000 Hz oscillator, four waveforms, logarithmic frequency control, cents readout and live analyser waveform.
- Editable A4 reference from 20–2,000 Hz, presets, and 12-TET plus specific A-anchored just and Pythagorean chromatic ratio maps.
- Two-octave keyboard with register controls; computer keys A W S E D F T G Y H U J K play a chromatic octave. Space toggles continuous sound, Escape stops all audio, and arrows adjust frequency.
- Intervals, seven scale collections and seven chord types with sequential/simultaneous playback. All notes are calculated from the selected tuning.
- Band-limited Web Audio rendering of five-second mono PCM WAV files with attack/release ramps.
- Six bilingual introductory lessons with sources and linked experiments, a searchable bilingual glossary, and interval ear training with feedback and session scoring.
- An explicitly marked curriculum roadmap covering early music, European traditions 1600–1900, blues/jazz/pop, world traditions and contemporary musical languages.

This is the first product slice, not an exhaustive encyclopedia or a universal instrument synthesizer. Real instrument synthesis, additive synthesis, noise, arbitrary temperament imports, detailed rhythmic training, notation, historical courses and culturally contextualized world-music modules are future work. No medical or special-health claims are made for alternate concert pitches.

## Development

Use Node 24 and npm. Run `npm install`, `npm run dev`, and `npm run build`. The application uses the generated Vinext/Sites stack, React, the bundled accessible Base UI/Shadcn controls, and browser Web Audio. No account, external database or audio upload is required for the application itself. The hosting service controls private site access.

`node --experimental-strip-types --test tests/*.test.mjs` exercises tuning identities and inverse note mapping, cents, WAV encoding, and audio scheduling/cancellation with a mocked AudioContext. `npx tsc --noEmit` checks application types.

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
