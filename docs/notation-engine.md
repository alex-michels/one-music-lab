# Notation prototype — task 553

This is the evidence and reproduction guide for the **engineering selection** in
[task 553](engineering.md#task-553). Completion is recorded only in ROADMAP.md.
It does not accept the thirteen lessons under gate G, finish tasks 554/555/558/559,
or authorize publication. Those tasks keep their own scope and acceptance.

## Selected design and the five criteria

The browser draws small examples with `lib/staff.ts`, `components/staff.tsx` and
committed Leipzig outlines. **Verovio 6.3.0** is pinned for build-time engraving
and format probes only. Existing notation and localization remain the input model.
This extends the September 7 prototype without replacing the site's design.

| Criterion | Reproducible evidence | Supported boundary |
| --- | --- | --- |
| License | Upstream Verovio GPL/LGPL and Leipzig OFL texts are retained in `LICENSES/`; provenance is in `THIRD-PARTY-NOTICES.md`. `glyphs:check` compares the committed paths with a fresh Verovio rendering. | Original code remains Apache-2.0; the extracted glyph data retains OFL 1.1. Verovio is a dev dependency and the portable asset test rejects its runtime symbols and font/WASM binaries. The separate site-wide license audit remains open. |
| Layout | Independent treble/bass/alto/tenor landmarks, ledger lines, stems, whole/half/quarter heads, all five explicit accidentals and extreme positions are tested. `layout.mei` is an original 24-measure, 96-note example; narrow pages force multiple systems/pages without losing notes. Its SVG pages are CI artifacts for inspection. | Custom spacing is even and bounded to 128 notes; it is for teaching examples. No automatic beaming, polyphonic collision layout or general score editing is claimed. Longer engraving uses Verovio. |
| Accessibility | Localized SVG title linked by `aria-labelledby`, following W3C's SVG pattern. The read-note exercise gives clef, position and sign as its alternative text, without revealing the answer. Native fields/buttons support choices, typed names and pointer/keyboard staff placement; browser tests use real keyboard events in Chromium, Firefox and WebKit. | This proves the small prototype's controls. It is not a site-wide accessibility audit or a screen-reader/device certification. |
| Microtonal symbols | `quarter-tones.mei` renders four distinct E280–E283 outlines and retains `1qf`, `1qs`, `3qf`, `3qs` through a second MEI load/export. | Symbol rendering is demonstrated in the build-time path. The interactive pitch model explicitly rejects fractional or greater-than-double accidentals; this task does not define cultural intonation, a microtonal naming system or playback tuning. |
| MusicXML/MEI limits | `spelling.musicxml` imports C-sharp, E-flat, B-double-flat and a rest with their durations; MEI re-import retains that supported musical content. The MEI probe also covers natural and double-sharp signs. Invalid input is rejected. An unsupported `ossia` container is demonstrably lost on export. | **No general lossless round-trip claim.** MusicXML is converted into MEI, not exported back to MusicXML. Originals must be retained. Compressed MXL, arbitrary files, preservation of unsupported elements and a user-facing import flow belong to 559. |

The choice keeps the existing `SpelledPitch` semantics and gives the browser
localized, testable controls without a multi-megabyte engraving runtime. Verovio
supplies engraving and format conversion where those are useful. The earlier
candidate comparison in [notation-chapter §4](notation-chapter.md)
was exploratory; this implemented contract and its fixtures define task 553.

## Try the prototype

After `npm ci`, run `npm run dev` and open the printed local URL.

| Language | Lab | Practice |
| --- | --- | --- |
| EN | Sound lab → Notes; change note, accidental, octave and clef. | Practice → Reading notation → Read a note. Choose Choices, Type a name, or Place on the staff. |
| RU | Лаборатория звука → Ноты; выберите ноту, знак, октаву и ключ. | Практика → Чтение нотной записи → Чтение ноты. Выберите варианты, ввод названия или постановку на стане. |
| DE | Klanglabor → Noten; Ton, Alteration, Oktavlage und Schlüssel ändern. | Übungen → Notentext lesen → Einen Ton lesen. Auswahl, Namen eingeben oder Im Notensystem setzen wählen. |

Typed answers require a **note name**, not an octave: `Eb`/`E♭`, `ми-бемоль`,
`Es`. Capitalization, whitespace and hyphen variants are accepted; enharmonic
substitution is not. German `H` and `B` are distinct; English `B` is natural.
For placement, the prompt includes the register. Click the required line/space,
or focus the staff and use arrows (Home/End for the endpoints), then check.
A valid wrong answer gets feedback and the correct spelling; an invalid name
does not count as an answer. An answer can be scored only once. Next question
resets the response and makes a new deterministic variation.

The existing sign-scope exercise now distinguishes sounding pitch from sign
visibility: a repeated in-bar sharp remains sharp without a second printed sign;
a barline ends the sign's scope. The intervening note uses another letter so it
cannot accidentally become a cancellation. Explicit naturals are supported.

## Reproduce the checks (Windows, macOS, Linux)

Use Node 24 with the checked-in lockfile. No API key is needed.

```sh
npm ci
npx playwright install
npm run glyphs:check
npm test
npm run test:browser
npm run test:coverage
npm run typecheck
npm run lint
npm run format:check
npm run build
npm run build:static
npm run test:static
```

`npm run glyphs:generate` intentionally rewrites `lib/glyphs.json`; review its
diff after any dependency or fixture change. `glyphs:check` is read-only and
fails on missing glyphs or drift. The executable extractor and adapter are in
the coverage denominator and tested, including write/check and failure paths.

The engine suite writes `outputs/notation-553/layout-*.svg`. These are generated,
ignored review artifacts; CI uploads them beside the coverage report. All fixtures
are original mechanical probes, not copied musical works or textbook images.

`test:static` serves the portable artifact on an ephemeral **loopback** port,
blocks every external request and opens the Notes lab in Chromium. It checks that
the staff still renders and no external request was attempted. The asset scan
also rejects font/WASM binaries and Verovio runtime entry points. This tests an
actual browser flow instead of rejecting harmless source hyperlinks in text.

On this Windows host, Firefox's `newPage` fails with `_page` inside the restricted
sandbox and succeeds with the identical Playwright installation outside it.
Run the full matrix in an ordinary authorized development shell or use Linux CI;
do not filter out Firefox to claim a complete matrix. Windows static prerender may
finish writing files but fail at shutdown (`UV_HANDLE_CLOSING`): that process is
still a failed build. Use the successful Linux CI artifact for acceptance.

## Verified references and scope

Checked 2026-09-08; these identify exact documentation sections, not search snippets.

- Verovio reference, [Input formats → MEI and MusicXML](https://book.verovio.org/toolkit-reference/input-formats.html): unsupported MEI elements and descendants are discarded; input conversion has limits. Tests here pin 6.3.0 rather than assuming all later releases behave identically.
- Verovio reference, [Toolkit methods → loadData, getMEI, getPageCount, renderToSVG, destroy](https://book.verovio.org/toolkit-reference/toolkit-methods.html); [Toolkit options → inputFrom, font, xmlIdSeed, pageWidth, pageHeight, svgViewBox](https://book.verovio.org/toolkit-reference/toolkit-options.html). These are the actual methods/options in the build adapter.
- Verovio [version-6.3.0 fonts/README.md](https://github.com/rism-digital/verovio/blob/version-6.3.0/fonts/README.md), [COPYING](https://github.com/rism-digital/verovio/blob/version-6.3.0/COPYING), [COPYING.LESSER](https://github.com/rism-digital/verovio/blob/version-6.3.0/COPYING.LESSER); Leipzig [LICENSE.txt](https://github.com/rism-digital/leipzig/blob/main/LICENSE.txt), Git blob `9cb387723ea5009cf9793f5cf5ad2edebb0b939e`. Copies and redistribution boundaries are in the third-party notice.
- W3C WAI, [Images tutorial → Tips and Tricks → SVG graphics](https://www.w3.org/WAI/tutorials/images/tips/), updated 2024-07-16: inline SVG text alternatives via `title` and `aria-labelledby`. The position picker uses a native fieldset and buttons outside the SVG.
- Pitch/clef terminology and cultural scope follow the existing verified [notation sources](music-notation.md) and [German localization sources](german-localization.md). The prototype uses Western staff spelling; it makes no universal tuning claim.

## Acceptance record

The PR contains the implementation, localized controls, regression tests,
reproduction instructions, rights notices and CI artifacts. The exact PR, commit,
validation results and any remaining platform limitations are recorded in that
PR's description and linked CI run. This engineering acceptance does not substitute
for source and language checking of curriculum topics. The owner's current
personal-learning scope does not require external subject/language sign-off;
public publication remains a separate decision under [gate G](release-criteria.md).
