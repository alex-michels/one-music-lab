# Localized pitch and scale notation

The **A little experiment** lab treats a scale as both a sounding pattern and a
written pattern. Its pitch cards use the selected tonic and the scale degree's
diatonic letter, then apply the accidental needed to reach the requested
semitone offset. The written pitch does not change with the selected tuning
map. Enharmonic spellings are therefore preserved:
C natural minor is `C D E♭ F G A♭ B♭ C`, while F♯ major contains E♯.

In this experiment, English uses scientific-pitch labels such as `C4` and `E♭4`.
Russian uses professional note names with hyphens for accidentals, as prescribed by the
Russian orthography reference: `до`, `ми-бемоль`, `си-диез`. Russian octave
names are shown in words (for example, `первая октава`) because Russian
professional pitch notation does not use the English scientific octave suffix
as its default display. German uses H/B, Cis/Des/Es/As, `C-Dur`/`c-Moll`, and
classical octave labels such as `c′`. The keyboard, interval training and chord
symbols also follow German notation when DE is active. Exact sources and
examples are recorded in [german-localization.md](german-localization.md).

The octave number and the Russian octave word follow the **written** letter,
not the sounding pitch: in G♭ major the fourth degree is shown as `C♭5` and
`до-бемоль, вторая октава`, although it sounds the same as `B4`. Degree-
preserving spelling also produces double accidentals in the enharmonic keys the
tonic menu offers, such as F𝄪 in G♯ major.

The lab currently offers these written forms:

- major, natural minor, Dorian, Mixolydian, major pentatonic, minor pentatonic,
  and the 12-TET blues scale;
- harmonic minor, with raised scale degree 7;
- melodic minor ascending, with raised scale degrees 6 and 7;
- melodic minor descending, which returns to natural minor.

The melodic pair follows the classical scale convention. The lab labels the
blues collection as a 12-TET model and writes its added blue note as lowered
scale degree 5 (for C: `G♭`), while recognizing that blues performance can use
expressive intonation and multiple analytical spellings.

## Scope of future localization work

The owner accepts the current Russian Sound lab: “A little experiment” uses
Russian note names, while the other existing panels, keyboard and ear trainer
may use international letter names and scientific octaves. This combination is
intentional and is not an outstanding localization defect. Preserve these
displays; tasks 556/557 do not require rewriting existing features.

For newly created Russian material, use professional terminology and the following
notation policy by section:

| Section | Note and octave notation |
|---|---|
| Theory and pedagogical material | Traditional Russian names and octave designations. |
| Trainers | Traditional Russian notation in prompts, answer labels and feedback. |
| Ordinary encyclopedia articles | Traditional Russian notation. |
| Encyclopedia articles explaining different international systems | The notation of the systems being discussed, clearly identified in context. |
| Laboratory material | Traditional Russian notation has priority; international notation such as `C4`, `E♭4` and `A4` remains valid and is not a localization error in itself. |

The laboratory allowance does not replace the notation policy for theory,
trainers or ordinary encyclopedia articles. In a laboratory, make the convention
clear in context or a short label without forcing Russian duplicates for every
pitch. Correct scale-degree spelling remains required in either convention.
The existing displays accepted above remain unchanged; this scope decision
changes no current pitch labels, audio, exercises or assessment answers.

## Sources

The formulas and terminology were checked against:

- Robert Hutchinson, *Music Theory for the 21st-Century Classroom*, §3.1
  “Minor Scales” (University of Puget Sound, open text),
  https://musictheory.pugetsound.edu/mt21c/MinorScales.html — three minor
  forms, the raised degrees in harmonic and melodic minor, and the statement
  that the descending melodic form “is the same as the natural minor scale”;
- Robert Hutchinson, ibid., §31.9 “Scales”,
  https://musictheory.pugetsound.edu/mt21c/JazzScales.html — the blues model
  `1–♭3–4–♭5–5–♭7`, described there as the minor pentatonic with an added
  lowered fifth (spelled as a raised fourth in some analyses);
- *Open Music Theory*, edited by Mark Gotham, Kyle Gullings, Chelsey Hamm,
  Bryn Hughes, Brian Jarvis, Megan Lavengood and John Peterson, chapters
  “Minor Scales, Scale Degrees, and Key Signatures” and “Diatonic Modes”,
  https://viva.pressbooks.pub/openmusictheory/chapter/minor-scales/,
  https://viva.pressbooks.pub/openmusictheory/chapter/diatonic-modes/ —
  degree formulas and the modal collections;
- Большая российская энциклопедия, статья “Минор”,
  http://bre.ruwiki.ru/wiki/Минор (the bigenc.ru address now redirects there),
  paragraph beginning “В классической тональной системе минор имеет
  3 основные разновидности: натуральный, гармонический и мелодический” —
  Russian terminology and the three classical minor forms;
- Грамота.ру, справочная служба, ответ №230691 (8 October 2007),
  https://gramota.ru/spravka/vopros/230691 — hyphenated Russian spellings such
  as `до-диез`, `си-бемоль`, and the form `до-диез минор`. The double-accidental
  forms this lab writes (`фа-дубль-диез`, `си-дубль-бемоль`) follow the same
  hyphenated pattern but are an editorial extension of that answer, not a
  quotation from it.
- The C-minor examples were also cross-checked against the user-supplied
  reference pages, [C minor](https://en.wikipedia.org/wiki/C_minor) and
  [До минор](https://ru.wikipedia.org/wiki/%D0%94%D0%BE_%D0%BC%D0%B8%D0%BD%D0%BE%D1%80).

These are editorial sources for the educational content, not copied text or
notation assets. The implementation is original Apache-2.0 code. This file is
developer documentation under Apache-2.0; only the explanation of pitch and
scale spelling above, which is teaching material, falls under the project's
CC BY 4.0 educational-content scope.
