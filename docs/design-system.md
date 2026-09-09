# Design system — one substrate, four lenses

This is the reference for how the site looks and how a reader moves through it. It
replaces nothing in `ROADMAP.md`; it is the shape the roadmap's items get built into.

Every measurement here was taken from this repository, not assumed. Where a number
disagrees with your memory of the code, the code was measured.

---

## 1 · The thesis

The theory text is the site, and **a topic id is its primary key**. Lab, theory,
trainer and encyclopedia are four *lenses* onto that one key — **read, play, drill,
define**.

What carries a reader across the site is therefore the *subject travelling with
them*: one topic id in the URL, one subject line, one four-slot lens rail. That
leaves the layout underneath completely free to be a 520 px serif column, a dark
instrument bed, a question with a rule ledger, or a hairline index.

Continuity is a shared **primary key** plus a shared **substrate** — one 4 px
rhythm, one hairline, one numeric voice, two colour namespaces. It is *not* a
shared frame, and the four lenses are deliberately not four tabs.

The existing shadcn sidebar shell is **kept**. Deleting it would cost three browser
tests, a reader-facing persisted feature, a `docs/ui-provenance.json` edit and a
vendored file dropping to 0 % coverage — and buys this thesis nothing.

---

## 2 · The address

```
#/<lang>/t/<topicId>/<lens>
#/<lang>/t/<topicId>/<lens>~<anchor>     paragraph anchor (see below)
#/<lang>/<lens>                          the four lensless indexes
#/                                       resolves to #/<storedLang>/read
```

Language first, topic second, lens third. That ordering *is* the thesis.

Today the language lives only in `localStorage` under `oml-language` — there is no
`/ru/` path, no `?lang=`, not even a hash — and `alternates: { canonical: '/' }`
makes all three languages one document to a crawler. This puts the language in a
link for the first time.

**Hash routing survives deliberately.** There is no router dependency, `app/` is
three files, `tests/static-export.mjs:6-14` hardcodes a single `index.html` and
`tests/site-http.mjs:32-42` asserts exactly one canonical. Real route segments would
rewrite the build contract; the hash costs one file.

**The paragraph anchor uses `~`, not a second `#`.** `#/en/t/dots-ties/read#dot-adds-half`
is not a legal URL — only the first `#` starts the fragment, so `location.hash` is
the whole string, no element has that id, no scroll happens, and `routeFromHash`
reads the lens as `read#dot-adds-half`. Use `~` (which cannot appear in a slug),
parse it into `Route.anchor`, and after the route commits call
`getElementById(anchor)?.scrollIntoView({ block: 'start' })` and `.focus()` on that
paragraph with `tabIndex={-1}`. Native fragment scrolling is unavailable to any
hash-routed site and must be done by the app.

**Legacy aliases**, resolved inbound: `#lab → #/<lang>/play`, `#theory → #/<lang>/read`,
`#practice → #/<lang>/drill`, `#encyclopedia → #/<lang>/define`,
`#chords → #/<lang>/t/chords/play`. The brand anchor keeps
`class="brand" href="#lab" aria-label="One Music Lab"` verbatim — `tests/site-http.mjs`
asserts it in the server-rendered HTML.

**Reading a route.** Unknown topic → `{ topic: null, lens: 'read' }`. Known topic whose
requested lens is absent → that topic's read lens, with the rail showing the absence.
Never a 404, never an empty state.

**Code changes, exactly four:**

1. `lib/client-store.ts` gains `type Route = { lang, lens, topic, anchor }`,
   `routeFromHash()` and `hashOf()`, beside the existing `pageFromHash` which stays
   as the alias resolver.
2. `navigate()` (`app/page.tsx:373`) switches `replaceState` → `pushState` for topic
   and lens changes; `replaceState` stays for in-lens state such as the search query.
   **Back and Forward start working across the site for the first time** — there is no
   `hashchange` or `popstate` listener anywhere in the repo today, so Back currently
   leaves the site.
3. One `hashchange` listener inside `pageStore`'s subscribe.
4. `lib/webmcp`'s `configureLab` (`app/page.tsx:684-706`) is a second, non-UI writer of
   the page state and must route through the same `navigate()`.

**Server snapshot:** `{ lang: 'en', lens: 'read', topic: null }` — the read index,
matching the stated home. `getServerSnapshot` returns `'lab'`/`'en'` today. The
prerendered HTML is the English read index; hydration may replace it, and no lens may
render a spinner or blank frame while resolving a hash. Assert the read-index heading
in `tests/static-export.mjs` so the export cannot drift back to the lab.

**`document.title`** is never assigned anywhere in the repo today — every page in every
language shows `OML — One Music Lab`. Format:
`"<topic title> · <lens name> — One Music Lab"` for a topic route,
`"<lens index name> — One Music Lab"` for a lensless one, in the reader's language.
The server-rendered `<title>` stays exactly `OML — One Music Lab` so the export
assertion is untouched. The description meta updates on the same effect that already
patches it per language (`app/page.tsx:516-518`).

---

## 3 · Tokens

Two namespaces, per Soundslice: `--c-*` is **chrome** and flips with the theme;
`--s-*` is **score and instrument** and never flips. Notation is black ink on white
paper in both themes *by construction*, not by hardcoding — today it survives a theme
flip only by accident (`.staff { color: #1a201c }` at `globals.css:2842` over
`.panel`'s literal `white`).

Every ink token carries its measured ratio. Floor: 4.5:1 for text under 18 px, 3:1 for
borders and focus rings.

```css
/* Replaces :root (634-637), :root (672-682) and .dark (683-692).
   DO NOT TOUCH @custom-variant dark (line 4) or @theme inline (638-671):
   ~610 semantic-colour utilities and 145 rounded-* utilities across the 60 files
   in components/ui resolve through them, and 23 of those files use dark:. */

:root {
  color-scheme: light;

  /* chrome — flips */
  --c-ground:       #f4f6f5;
  --c-surface:      #ffffff;
  --c-surface-sunk: #eceff0;
  --c-ink:          #1b2422;  /* 14.63:1 on ground · 15.88:1 on surface */
  --c-ink-2:        #4a5754;  /*  6.95:1 on ground */
  --c-ink-3:        #5f6d69;  /*  4.99:1 on ground — smallest text colour allowed */
  --c-rule:         #dbe2df;  /*  1.21:1 — decorative hairline, never meaning alone */
  --c-rule-strong:  #b9c4c0;
  --c-link:         #1f5a44;  /*  7.43:1 on ground */
  --c-alert:        #963e34;  /*  the one site-wide role="alert" */
  --c-alert-wash:   #fbeceb;

  /* score & instrument — never flips */
  --s-paper:        #ffffff;
  --s-ink:          #14181a;  /* 17.87:1 on paper */
  --s-ink-faint:    #5d6669;  /*  5.88:1 on paper */
  --s-rule:         #c8cecd;  /* staff lines, barlines */
  --s-ground:       #16241f;  /* the instrument bed, light theme AND dark */
  --s-ground-2:     #1e3129;
  --s-grid:         #28453f;  /* oscilloscope grid — was a literal at page.tsx:565 */
  --s-axis:         #3e6058;  /* was a literal at page.tsx:579 */
  --s-live:         #baf6ca;  /* 13.11:1 on bed — "this is sounding", nothing else */
  --s-on-ground:    #cfe2d6;  /* 11.87:1 on bed */
  --s-on-ground-2:  #9bb4a1;  /*  7.22:1 on bed */

  /* kind hues — four, carrying KIND, never the 15 areas */
  --k-tone:         #1f5a44;  /* 7.43:1 — sound, tuning, timbre       (7 terms)  */
  --k-sign:         #8a5a00;  /* 5.46:1 — notation signs, spelling   (38 terms)  */
  --k-concept:      #2f5aa8;  /* 6.14:1 — ideas, definitions         (27 terms)  */
  --k-measure:      #6a4a9c;  /* 6.30:1 — rhythm, metre, duration    (25 terms)  */
  --k-tone-wash:    #e8f1ec;
  --k-sign-wash:    #f6eede;
  --k-concept-wash: #e7edf9;
  --k-measure-wash: #efeaf7;

  /* trainer — exactly two state colours */
  --st-right:       #2f6b4a;  /* 5.82:1 on ground · 5.53:1 on its own wash */
  --st-wrong:       #a33f32;  /* 5.84:1 on ground · 5.44:1 on its own wash */
  --st-right-wash:  #e9f2ec;
  --st-wrong-wash:  #f8ebe8;

  /* focus — a token at last; #438d69 was a literal at globals.css:731 */
  --focus:            #0b6fd6;  /* 4.54:1 on ground · 4.93:1 on paper */
  --focus-halo:       #0b6fd633;
  --focus-paper:      #0b6fd6;
  --focus-halo-paper: #0b6fd633;
  --focus-bed:        #86e0ff;  /* 10.81:1 on the bed */
  --focus-halo-bed:   #86e0ff40;

  /* families — device fonts only. tests/static-export.mjs:38-58 and
     tests/site-http.mjs:55-60 both forbid fonts.googleapis / fonts.gstatic. */
  --type-sans: 'Segoe UI', system-ui, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
  --type-read: Georgia, 'Iowan Old Style', 'Noto Serif', 'Liberation Serif', 'DejaVu Serif', 'Times New Roman', serif;
  --type-mono: 'Cascadia Mono', 'SFMono-Regular', Consolas, 'DejaVu Sans Mono', 'Liberation Mono', monospace;

  /* ramp — rem against a 16px root, so the reader's font size is respected */
  --t-caption: 0.6875rem; --lh-caption: 1.45; --ls-caption: 0.06em;  /* 11px */
  --t-meta:    0.75rem;   --lh-meta:    1.5;                          /* 12px */
  --t-ui:      0.875rem;  --lh-ui:      1.5;                          /* 14px */
  --t-body:    1rem;      --lh-body:    1.6;                          /* 16px */
  --t-prose:   1.1875rem; --lh-prose:   1.68;                         /* 19px, serif, read only */
  --t-h3:      1.25rem;   --lh-h3:      1.3;                          /* 20px */
  --t-lead:    1.375rem;  --lh-lead:    1.45;                         /* 22px */
  --t-h2:      1.6875rem; --lh-h2:      1.25;  --ls-h2: -0.01em;      /* 27px */
  --t-h1:      2.125rem;  --lh-h1:      1.15;  --ls-h1: -0.02em;      /* 34px */
  --t-display: 2.875rem;  --lh-display: 1.05;  --ls-display: -0.03em; /* 46px, mono, play only */

  --w-regular: 400; --w-medium: 500; --w-bold: 700;
  /* 700 is the FIRST bold weight in the repo — the current maximum anywhere in
     2850 lines is 650 and h1 is 500. Free perceptual contrast, no colour, no space. */

  /* spacing — one 4px base. Per-lens density is a MULTIPLE, never a new value. */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px;
  --sp-5: 24px; --sp-6: 32px; --sp-7: 48px; --sp-8: 64px;

  --r-0: 0; --r-1: 3px; --r-2: 5px; --r-3: 7px; --r-4: 10px; --r-5: 14px;
  --bw: 1px; --bw-2: 2px;

  /* measures */
  --m-prose:     32.5rem;  /* 520px — ~66 characters at 19px Georgia */
  --m-break:     65rem;    /* 1040px — the Ableton 480/1025 ratio, as a grid column */
  --m-drill:     40rem;    /* 640px */
  --m-index:     73.75rem; /* 1180px */
  --subject-min: 2.75rem;  /* MINIMUM, not fixed: German and Russian titles wrap */

  --dur-1: 120ms; --ease-1: linear;

  /* Depth. A shadow is a whole value, not a colour, because it carries alpha;
     declaring them here is what keeps every colour in this one block. */
  --shadow-pressed: 0 1px 3px #102b1e1a;
  --shadow-card:    0 2px 3px #1f422803;
  --shadow-raised:  0 3px 5px #23452d13;
  --shadow-key:     0 2px 3px #15281128;
  --shadow-lift:    0 8px 20px #223d2710;
  --ring-live:      0 0 0 4px #82b98b26;

  /* LEGACY ALIASES — required. @theme inline maps these into the Tailwind names
     ~610 utilities resolve through. Aliases only: no authored rule may use them. */
  --background: var(--c-ground);       --foreground: var(--c-ink);
  --card: var(--c-surface);            --primary: var(--c-link);
  --muted: var(--c-surface-sunk);      --muted-foreground: var(--c-ink-3);
  --accent: var(--k-tone-wash);        --border: var(--c-rule);
  --radius: var(--r-4);
  --font-geist-sans: var(--type-sans); --font-geist-mono: var(--type-mono);
}

/* No --s-* token is redefined here, so notation stays #14181a on #ffffff. */
:root[data-theme='dark'] {
  color-scheme: dark;
  --c-ground: #101715; --c-surface: #17201d; --c-surface-sunk: #0c1211;
  --c-ink: #e8efeb;   /* 15.56:1 on ground */
  --c-ink-2: #b3c1bb; /*  9.75:1 */
  --c-ink-3: #84968f; /*  5.83:1 */
  --c-rule: #2a3733;  --c-rule-strong: #3d4c47;
  --c-link: #86ceab;  /* 9.89:1 */
  --c-alert: #e88a7a; --c-alert-wash: #2a1a17;
  --k-tone: #86ceab; --k-sign: #e0a94a; --k-concept: #8fb4f0; --k-measure: #b9a3e8;
  --k-tone-wash: #16241f; --k-sign-wash: #241d10;
  --k-concept-wash: #16203a; --k-measure-wash: #1f1830;
  --st-right: #7fce9f; --st-wrong: #e88a7a;
  --st-right-wash: #152420; --st-wrong-wash: #2a1a17;
  --focus: #6cc6ff; --focus-halo: #6cc6ff40;  /* 9.66:1 */
}

/* One ring, outline + halo, so it survives an unknown ground. Each ground
   overrides the TOKEN on itself, not through a descendant selector, so paper
   nested inside the dark bed still gets the paper ring. */
:focus-visible {
  outline: var(--bw-2) solid var(--focus);
  outline-offset: 3px;
  box-shadow: 0 0 0 4px var(--focus-halo);
}
.bed   { --focus: var(--focus-bed);   --focus-halo: var(--focus-halo-bed); }
.paper { --focus: var(--focus-paper); --focus-halo: var(--focus-halo-paper); }

/* Named .paper and NOT .score: `.score` is already the trainer's 60px counter
   (globals.css:2368), asserted in notation-practice.browser.test.mjs:63 and :106. */
.paper {
  background: var(--s-paper);
  color: var(--s-ink);
  border: var(--bw) solid var(--s-rule);
  border-radius: var(--r-0);
  padding: var(--sp-3) var(--sp-4);
}
.paper .staff { color: var(--s-ink); }  /* replaces the literal #1a201c at 2842 */

.bed {
  background: var(--s-ground);
  color: var(--s-on-ground);
  border-radius: var(--r-4);
  padding: var(--sp-5);
}

.num { font-family: var(--type-mono); font-variant-numeric: tabular-nums; letter-spacing: 0.01em; }
```

**Two things must happen in the same commit as the block above, or it is a no-op:**

- **Delete `globals.css:725-732`.** The existing `:focus-visible { outline: 2px solid #438d69 }`
  has identical specificity and comes *later* in source order, so it wins the `outline`
  declaration and the entire per-ground focus system silently never paints. Fold the old
  `outline-offset: 4px` intent into the new rule. Assert in `tests/tokens.test.mjs` that
  `:focus-visible` appears exactly once in the file.
- **Write both theme channels.** `data-theme` alone does not reach the 23 `components/ui`
  files that use `dark:` utilities, because those compile through
  `@custom-variant dark (&:is(.dark *))`. Resolve `system` to a concrete `light|dark` in JS
  and write both, beside the existing `document.documentElement.lang = lang` at
  `app/page.tsx:515`:

  ```ts
  root.dataset.theme = resolved;
  root.classList.toggle('dark', resolved === 'dark');
  ```

  Do **not** also ship a `@media (prefers-color-scheme: dark)` token block: with system
  resolved in JS it is redundant, and it makes the pre-hydration paint flip the tokens
  while the class-based utilities stay light.

**The tokens test's allowed region** is *the `:root` blocks, the `[data-theme]` blocks and
the `@theme inline` block* — `@theme inline` itself contains `#fff` twice and `#bb4141`
once and must not be touched.

**Adopting the aliases is not an inert change, and should not be described as one.** Eight
of the ten legacy names move to a new value the moment the block lands, and every Tailwind
utility across `components/ui` resolves through them. Measured across five pages at seven
widths, exactly these transitions occur, with no layout movement anywhere:

| alias | before | after | where it shows |
|---|---|---|---|
| `--border` | `#e2e8e5` | `#dbe2df` | every default border, via `* { border-color }` |
| `--foreground` | `#213631` | `#1b2422` | body text |
| `--muted-foreground` | `#72817d` | `#5f6d69` | secondary text |
| `--primary` | `#28664f` | `#1f5a44` | links, the progress fill, selected cards |
| `--background` | `#f6f8f9` | `#f4f6f5` | the page ground |
| `--accent` | `#e9f3ed` | `#e8f1ec` | selected chips |
| `--muted` | `#edf1f1` | `#eceff0` | switch and slider tracks |
| `--font-geist-sans` / `-mono` | 3 / 4 families | 6 / 6 | no rendered change on Windows or macOS; these are the Linux backstops |

`--card` (`#fff`) and `--radius` (`10px`) are unchanged. Nothing moves, resizes, or changes
`display`.

**The focus halo collides with any element that sets its own `box-shadow`.** The ring is an
`outline` plus a `box-shadow` halo, and an element with its own shadow — `.play-button`
today — keeps that shadow and loses the halo. This is acceptable rather than good: the
outline alone is 4.54:1 on the ground, well past the 3:1 floor, so the ring is still
visible everywhere. Adopting the rule also replaces shadcn's per-component
`focus-visible:ring-*` shadows with the one site-wide ring, which is the intent. The old
ring was `#438d69` at 3.68:1 on the ground, so this is a contrast improvement, not only a
consolidation.

---

## 4 · Hue

**Seven hue positions plus the bed's cyan focus**, inside the ~8 budget. The current file
has 222 distinct hex values collapsing to essentially one green (204 of 222 between H75
and H166), so this *spends* hue that is currently unspent rather than adding to a crowd.

Hue is bound to **topic, not to term, and never to area**, through a 19-entry
lesson → kind map:

| kind | topics | terms |
|---|---|---|
| `sign` | note-names, staff, clefs, accidental-signs, accidental-scope, enharmonics | 38 |
| `concept` | intervals, scales, chords, dynamics, articulation, repeats | 27 |
| `measure` | durations, dots-ties, beat-division, tempo | 25 |
| `tone` | sound, tuning, timbre | 7 |

38 + 27 + 25 + 7 = 97, exactly the number of glossary terms. A test asserts the sum.

The kind is named **`tone`, not `tuning`** — `tuning` is also one of the 19 topic ids, and
the encyclopedia renders both facets side by side, so two chips reading "Tuning" would
appear in one view meaning different things and announce identically to a screen reader.
A test asserts the four kind ids are disjoint from the 19 topic ids.

**Where hue may appear — an exhaustive list. Anywhere not here is achromatic:**

1. Encyclopedia index rows: a 2 × 14 px kind bar at the row's left edge, **plus** the kind
   word in text in the row. Hue is never the only channel.
2. Encyclopedia facet chips: `border-color: var(--k-*)` plus `background: var(--k-*-wash)`
   when pressed. (Pressed *index rows* take `--c-surface-sunk`; nothing else on the lens
   takes a fill.)
3. The lens rail's current lens: `border-bottom: var(--bw-2) solid var(--k-*)` in the
   current topic's kind hue, alongside `aria-current="page"`.
4. Theory prose: a term link is `color: inherit` with `border-bottom: 1px solid var(--k-concept)`,
   so black ink stays black ink. That underline never renders above 1 px and never takes a
   halo — the focus blue (H210) and the concept blue (H219) meet on this element and are
   separated by geometry, not hue.
5. Trainer: `--st-right` / `--st-wrong` as a border plus a wash fill, **on the option the
   reader actually chose and nowhere else**. Never on the ledger, never on the card.
6. Lab: `--s-live` and nothing else, meaning exactly "this is sounding right now" — the
   scope trace, the depressed key, the dot in the `<output>`.
7. `.error-message`, the one site-wide `role="alert"`: `--c-alert` on `--c-alert-wash`.

**Forbidden:** hue for the 15 ROADMAP areas; hue on the lesson `category` field (9 free-text
values that change per language and have no stable id); hue as the sole carrier of any
state; any hue in the read lens's chrome, which is achromatic except for links.

---

## 5 · Type

Three families, all device fonts. **The site loads no webfont and must not start** —
`tests/static-export.mjs:38-58` and `tests/site-http.mjs:55-60` both forbid
`fonts.googleapis` and `fonts.gstatic`, and `public/` holds exactly one file.

Cyrillic and Latin-1 are covered by every stack: Segoe UI (Win), Helvetica Neue /
system-ui (macOS), Noto Sans (Linux); Georgia ships with Cyrillic on Win and macOS, with
Noto/Liberation/DejaVu Serif as the Linux backstop. Mono carries only numbers, pitch names
and rule ids — never Russian prose — so SFMono-Regular's partial Cyrillic is acceptable.
The macOS mono face is named `SFMono-Regular`, not `SF Mono`: the latter is its display
name and does not resolve from CSS, and the repo already had the working spelling.
363 of the 735 German catalog entries contain umlauts or ß; every stack covers Latin-1.

**The one real font hole is not letters — fixed in step 7.** The English accidental buttons
were U+1D12B and U+1D12A, Supplementary-Plane characters absent from Segoe UI and Arial, so
two of the five rendered as empty boxes. All five are now drawn from `lib/glyphs.ts` in
every language, because a sign is the same mark everywhere: German names the alteration
inside the note name (`es`, `is`) and Russian names it in words, but nobody writes those on
a staff. The button shows the mark and says the word — `aria-label` carries the reader's own
term, so a screen reader still hears *eses*, *дубль-бемоль* or *double flat*.

**The structure/voice split.** Headings are always sans; prose on the read lens is always
serif. That single switch is what stops read and define converging, since define uses sans
at `--t-body` for its entry bodies.

**The numeric voice** is a rule about content, not about a region: every pitch name,
frequency, ratio, interval size, note value, MIDI number, cent value, rule id, module id
and tally on the entire site is `--type-mono` with `tabular-nums`. Inline in 19 px Georgia
it sets at `0.9375em`. This is the cheapest cross-surface signature available — `a′ · 440.00 Hz`
reads as the same species at 11 px in an index row and at 46 px on a dark bed.

**The subject line is not fixed-height.** `min-height: var(--subject-min)`, content-driven,
wrapping allowed: a 34 px line box is ~39 px on its own and German and Russian titles run
20–30 % longer than English.

---

## 6 · The shell

**Persistent on all four lenses** — and it is the existing shell, kept:

1. The shadcn `Sidebar` (provider, resizer, the persisted `oml-sidebar-width` between 190
   and 420 px, the mobile sheet).
2. The topbar, with the language switch **markup unchanged**: the `fieldset` with three
   `aria-pressed` buttons, each carrying its own `lang`, and `aria-hidden` slash separators.
   `tests/browser/navigation.browser.test.mjs`'s fourth test asserts exactly this.
3. `<main id="main-content">` and a new skip link to it — the anchor already exists at
   `app/page.tsx:811` with seven focusable things in front of it.
4. The subject line and lens rail, as the first children inside `main`.
5. The error alert, `role="alert"`, as the **first** child of `main`, above the subject
   line, so it is never below a 1040 px instrument.

**Deleted from the shell:** `.page-heading` (`app/page.tsx:812-858` — the eyebrow, the
five-way-ternary `h1`, the paragraph and the 69 px circle rendered on every page; it is
precisely why theory cannot open with a chapter and the trainer cannot open with a
question); the `01` nav badge (`279-283` — a numbering scheme with exactly one member over
a catalogue that is 0/511); `.breadcrumb` (`746-767` — two levels of hierarchy over a
one-level site); `.beta-label`.

**The rail contract**, fixed and testable: four items, fixed accessible names, fixed order
(read, play, drill, define), fixed DOM position immediately after the `h1`,
`aria-current="page"` on the active one, and **never collapsible or disclosed on any lens**.
A reader stranded on a question they cannot answer must see the way out without opening a
widget; hiding it would fail WCAG 3.2.3 Consistent Navigation.

**On a lensless route** the rail renders the same four labels in the same slot as an *index
switcher* — each links to `#/<lang>/<lens>`, and its `aria-label` becomes "Indexes" rather
than "Views of this topic". The module `<p>` is suppressed entirely when there is no topic
(render nothing, not an empty element).

**Focus on route change.** Move focus to the `<h1>` in the subject line (`tabIndex={-1}`,
focus without scroll) and render the new title into a persistent
`<output aria-live="polite" class="route-announcer">` — `<output>` and not `role="status"`,
which `jsx-a11y/prefer-tag-over-role` bans and the repo cannot suppress. `aria-current`
alone announces nothing at the moment of navigation.

**The skip link** is visually hidden until `:focus-visible`, then positioned top-left above
the topbar with the standard ring. Never `display: none`, which removes it from the tab order.

**The sidebar's contents change; its mechanics do not.** It renders the four lens indexes
always (with `aria-current` — the repo has none in authored code today, so the active
surface is currently sighted-only), then only the topics of the *current* kind, with a last
row "All topics". That bounds the list by the largest kind (6 today) rather than by the
catalogue. The topic list gets `overflow-y: auto` with the four lens rows pinned above it.
The mobile sheet takes the same shape and is a named deliverable, not an inheritance.

---

## 7 · The four lenses

Density is a multiple of the 4 px base and never a new number: define ×3, play ×4,
drill ×5, read ×6.

### READ · theory — `[data-lens="read"]`

The substance, and the site's home.

**Grid** — named lines, so a breakout is a grid column and never a negative margin:

```css
.lens-read {
  display: grid;
  grid-template-columns:
    [full-start] minmax(var(--sp-5), 1fr)
    [break-start] minmax(0, calc((var(--m-break) - var(--m-prose)) / 2))
    [prose-start] min(var(--m-prose), 100%) [prose-end]
    minmax(0, calc((var(--m-break) - var(--m-prose)) / 2)) [break-end]
    minmax(var(--sp-5), 1fr) [full-end];
  row-gap: var(--sp-5);
}
.lens-read > *         { grid-column: prose; }   /*  520px */
.lens-read > .breakout { grid-column: break; }   /* 1040px — instruments, engraved examples */
.lens-read > .bleed    { grid-column: full;  }   /* the escape that stops someone bolting
                                                    on negative margins later */
```

There is **no prose measure anywhere in the current 2850-line stylesheet**.
`.lesson-body p` is 17 px with no `max-width` and computes to ~990 px — about 115
characters. `.lesson-layout`'s `1fr / 280px` grid is deleted, not tuned.

**Type:** `--t-prose` 19 px serif for body — the only serif on the site; `--t-lead` 22 px
sans `--c-ink-2` for the lede; `--t-h2` 27 px sans 700 and `--t-h3` 20 px sans 500 for
structure.

**Cards: none.** `.lesson-grid` and `.curriculum-grid` are deleted. Exercises sit *inside*
the prose, not only at the end: a live item from `generateFrom(kind, level, lang)` at
`grid-column: prose`, bounded by `border-block: var(--bw) solid var(--c-rule)` with
`padding-block: var(--sp-5)` — no radius, no fill, no shadow — placed immediately after the
paragraph that states the rule. **That paragraph carries `id="<rule>"`**, which is what lets
the trainer link back to a sentence rather than the top of a lesson.

**The one thing no other lens does:** it is the only lens with a serif and the only lens
with a breakout column. A `.breakout` may carry a `.bed` — the only place a dark ground
appears inside a light document — with `--sp-7` of clear ground above and below and no
border, so it reads as a bench set into the page rather than a mismatched card.

**The read index** (`#/<lang>/read`) is the site's home: the 19 topics in `order`, grouped
by kind, with one "Start here" pointer on the first — the only sequence marker on the site.

### PLAY · lab — `[data-lens="play"]`

Component `components/play-lens.tsx`, extracted from the ~485 inline lines at
`app/page.tsx:859-1343`.

**Grid:** `minmax(0,1fr) 300px` above 1000 px — instrument left, controls right. No
max-width on the instrument: it is full-bleed to the workspace. Prose exists only as
`.inset` (surface, `--r-3`, max 420 px); at most two visible at once — a third means the
material belongs in read.

**Ground:** `.bed` is **a component inside the reader's chosen chrome, not a whole-canvas
override.** A light-mode setting is often a photophobia or astigmatism accommodation, and
the site does not overrule it across a quarter of its pages. This generalises the one dark
surface that already works, `.scope` at `globals.css:1267-1273`.

**Type:** `--t-display` 46 px mono for the frequency and the current note (replacing the
61 px and 57 px literals); `--t-caption` uppercase for control labels. `--t-prose` never
appears here.

**Colour:** one accent, `--s-live`, meaning exactly "this is sounding". Nothing else on
this lens may be chromatic.

**Paper:** the staff and both keyboards get `.paper` — a white rectangle on the dark bed,
the highest-contrast object on the page, which is correct because it is the notation.

**The one thing no other lens does:** it reads CSS custom properties into a canvas 2D
context. `app/page.tsx:565/579/589-591` hardcode the oscilloscope's three colours; a canvas
cannot inherit a custom property, so the draw loop reads
`getComputedStyle(canvas).getPropertyValue('--s-grid' | '--s-axis' | '--s-live')` once per
resize. That is the concrete mechanism by which the two namespaces reach the canvas.

**Audio equivalence** is a rule, not a colour permission: every audio affordance is
accompanied by an `<output aria-live="polite">` naming the sounding pitch and state in ink.

**`prefers-reduced-motion` must be read in JS.** The 60 fps `requestAnimationFrame`
oscilloscope is the site's only real animation and a CSS `animation: none` block cannot
touch it. When the query matches, draw exactly one static cycle at mount and on parameter
change and never schedule a frame. Also **exempt the `@media (prefers-reduced-motion)`
block from the `!important` cleanup** — two of the file's thirteen `!important`s are that
kill switch, and it is a deliberate last-wins override, not specificity debt.

**Also fixed here:** the inactive instrument **unmounts** instead of receiving `.is-hidden`,
ending the 60 fps loop currently drawing into a zero-sized `display:none` canvas. This is a
deliberate behaviour change — `tests/browser/notes-lab.browser.test.mjs:42-56` and `217-220`
assert the `is-hidden`/`display:none` pair on purpose and are rewritten in the same PR.

### DRILL · trainer — `[data-lens="drill"]`

**Grid:** `min(var(--m-drill), 100%) minmax(220px, 300px)` above 900 px — question left,
rule ledger right, ledger `position: sticky`. Below 900 px the ledger moves under the
question inside a `<details>`. (The ledger may be disclosed; the lens rail may never be.)

**Two question shapes, not one.** Six of the nine exercise kinds are text-only; three
engrave a staff (`read-pitch`, `clef-transform`, `accidental-scope` — the only `staff:`
sites in `lib/exercises.ts`, at 661, 721 and 756). Engraved kinds put a `.paper` block above
the prompt.

> **Correctness bug to fix with this lens.** `components/staff.tsx` builds its `<title>`
> from `plan.notes.map(pitchLabel).join(', ')`, which on all three engraved kinds
> **announces the answer** to a screen-reader user. The `label` prop at
> `components/staff.tsx:79` already exists and overrides it; the trainer must pass a neutral
> localized label ("A note on the treble staff") on every engraved item.

**The one thing no other lens does:** it accumulates state across items. The ledger is a
`<dl>` keyed on **`Item.rule`** — 14 distinct values, written on every item by the
generator and read today by exactly nothing. Not on `ErrorTag`: `halved-instead-of-dotted`
is declared and translated but emitted by no builder and would render a permanently zero
row. Each row carries the rule in mono, `exerciseExplanations[tag]` (already written in
three languages), a tally, and **two exits** — the paragraph that teaches it and the terms
that govern it. Rules not yet asked read "not yet asked".

**Ledger lifetime**, or the exits destroy the thing they exist for: a `drillLedger` store
beside `langStore` in `lib/client-store.ts`, `Map<Rule, {asked, missed}>`, backed by
**`sessionStorage`** under `oml-drill-session` — session and not local, because a permanent
record of a reader's mistakes is a mastery record by the back door. It lives *above* the
lens so a read or define round trip preserves it, is never keyed by language (the key is
`Item.rule`; only the explanation is localized), and is cleared by one explicit
"Start a new session" control.

**Item lifecycle:** answering locks the option row and reveals the verdict plus the
explanation; a single "Next question" button is the only way forward — never auto-advance,
which steals the explanation from a slow reader. The drill is endless: no set, no end
screen, no target. The next item is drawn uniformly from the eligible kinds, except that a
rule missed this session is weighted twice — stated in one sentence in the ledger and
nowhere else.

**Deleted, not restyled:** the `<Progress>`, `{score} / {total}` and
`{Math.round(score/total*100)}%` at `components/learning.tsx:405-430` and `631-658`, and the
`.score` 60 px counter at `globals.css:2368`. A count of rules missed is diagnostic; a
percentage is a mastery meter.

**Entering from the nav** lands on `#/<lang>/drill` — all nine kinds interleaved, ledger
spanning every drilled topic — because interleaving builds retrieval strength and blocking
does not. `#/<lang>/t/<topic>/drill` is the scoped variant, reached from a topic.

**Ear training moves out.** Its four hard-coded intervals carry no `ErrorTag` and no rule,
so they cannot feed the ledger, and `choose()` is gated on `hasHeard` — the one place on
the site a deaf reader cannot answer at all. It becomes an experiment on the play lens of
topic `intervals`. (See open question 4.)

### DEFINE · encyclopedia — `[data-lens="define"]`

This lens is `.panel` deleted. 46 of the repo's 51 border-width declarations are already
1 px: the hairline index is achieved by *removing* the card wrapper, not by adding anything.

**Grid:** `300px minmax(0,1fr)`, `max-width: var(--m-index)`, index left with a hairline
border-right, one expanded entry right capped at `--m-prose`. Not CSS multicol — it has the
worst reflow behaviour at 200 % zoom and buys nothing a single dense column does not.

**Density ×3**, the tightest on the site: row padding `var(--sp-2) var(--sp-3)` gives ~34 px
rows, so all 97 terms are one scrollable index. `.terms-grid` and `.term-card` are deleted.
Zero radius anywhere.

**Type:** `--t-ui` 14 px for index rows, the densest type on the site; `--t-body` 16 px
**sans** for the entry body — sans and not serif, because this lens is reference, not
document.

**Facets — two, both real, plus search.** Topic (19 values from `terms[].lesson`; all 19 are
hit, max 8, min 1, zero orphans) and Kind (4 values via the topic → kind map). The second
facet is *manufactured out of existing data*: a term today is `{title, body, lesson}` and
has no other field, so without it a reader arriving from a search engine cannot browse
sideways at all.

**Facet semantics**, because kind is a function of topic and the naive combination has
guaranteed-empty results: both facets are single-select; choosing a kind sets the topic
facet to "all" and re-renders the topic chips as only that kind's topics, so no empty
combination is reachable; search intersects with whatever facet is active. The whole
selection lives in the hash — `#/<lang>/t/<topic>/define?kind=<k>&q=<encoded>`, parsed by
`routeFromHash` since the query sits *inside* the fragment and `location.search` is empty.
`encodeURIComponent` on the query: term titles carry spaces, Cyrillic and umlauts. Facet
changes use `replaceState`; topic and lens changes use `pushState`.

**Zero results** get a hairline row in the index column's own idiom: one row reading
"No term matches" in `--t-ui --c-ink-3`, then a text button "Clear the search" and, when a
facet is active, "Clear the filters". No panel, no icon, no radius, no illustration. The
current hint string — `Try “pitch”, “interval”, “строй” or a shorter search.` — is an
English sentence containing a Russian word and must be rewritten so every example is in the
reader's own language.

**The one thing no other lens does:** hue appears per row — a 2 × 14 px kind bar at the
row's left edge **plus** the kind word in text, so the index survives deuteranopia and print.

**Forbidden here:** cards, radius, fill, shadow, counts of anything except the honest scope
line, and any second-language gloss on a term title or label.

**Also deleted:** the `curriculum` array (`lib/learning.ts:580`) and `.curriculum-grid` — six
numbered cards reading "Introductory lessons available" / "Curriculum planned". It is a
second taxonomy contradicting the 15-area ROADMAP and the only availability claim on the
site. `tests/browser/german.browser.test.mjs:171` asserts one of its strings.

---

## 8 · Cross-surface links

**The law: a link is either live or absent.** Never greyed, never disabled, never "coming
soon", never a badge, never a count with a denominator over topics that do not exist. Every
mapping is a table in code, asserted by a test, so no link can dangle.

1. **define → read.** All 97 terms carry `lesson`; all 19 lesson ids are pointed at. Zero
   orphans either way, so this link can never fail to exist. The expanded entry's footer
   prints that topic's full lens rail, not a single button.
2. **read → play, with two labels for two truths.** `notationLessonPresets`
   (`lib/notation-experiments.ts:161-198`) covers exactly 12 of 19 topics. For those the link
   reads *"Open in the notes lab"* and seeds the preset. For the other seven — sound, tuning,
   intervals, timbre, scales, chords, **dynamics** — it reads *"Hear this pitch"* and opens the
   tone bed at `lesson.hz` / `lesson.wave`, which all 19 lessons have. Changing the *words* is
   what stops the site promising engraving the lab cannot show. Assert
   `Object.keys(notationLessonPresets).length + toneBedTopics.length === 19` and that the two
   sets are disjoint.
3. **read → drill, inline.** The paragraph stating each rule carries `id="<rule>"` and is
   followed by a live generated item. Answering in place does not leave the page.
4. **drill → read** — the edge that does not exist today and is the whole payoff. `ruleTopic`
   maps all 14 generator-owned rules onto 8 topics, living in `lib/exercises.ts` beside a
   narrowed `type Rule` union so `tsc` exhaustiveness-checks it:

   | rules | topic |
   |---|---|
   | `register-1`, `register-2`, `register-3`, `natural-name` | note-names |
   | `alteration-name` | accidental-signs |
   | `enharmonic-respelling` | enharmonics |
   | `dot-adds-half`, `second-dot-adds-half-the-first`, `tied-values-add` | dots-ties |
   | `irregular-group-written-value` | beat-division |
   | `read-a-notated-pitch` | staff |
   | `same-place-other-clef` | clefs |
   | `sign-stops-at-the-barline`, `sign-holds-to-the-barline` | accidental-scope |

   Every ledger row links to the **paragraph anchor**, `#/<lang>/t/dots-ties/read~dot-adds-half`.
5. **drill → define**, alongside the above and not instead of it — same row, second exit.
   Two exits cover both "I did not understand the explanation" and "I did not know the word".
6. **read → define**, in the prose: a term's first occurrence links to
   `?q=<term id>` with `color: inherit` and a 1 px `--k-concept` underline, rendered only when
   the term exists. No hover cards, no popovers, no tooltips.
7. **play → read**, the return line, always: *"This is the experiment from: &lt;topic&gt;."*
   The lab's preset *is* a topic, so the link is never ambiguous.
8. **The return line on every lens** — last child, `--t-ui`, `--c-ink-2`, preceded by a
   hairline. On read that slot instead carries the forward move, *"Next — Clefs"*, the only
   sequence affordance on the site.

**Drill coverage is 8 of 19 and says so without numbers.** The 11 topics with no rule render
`<span class="lens-absent">Drill — not written</span>` in the rail: three words, inert, no
border, no icon, no pointer, no disabled button. No roadmap item numbers on the rail —
turning every topic page into a per-topic missing-content report that a screen reader
announces on every visit is the wrong trade.

**A language switch preserves the route and re-derives everything language-dependent.** The
drill regenerates the current item from the *same* seed, kind and level in the new language —
`generate()` is already pure in the seed, so the question is identical and only its words
change. Leaving the old question in place would put two languages on one screen. Define
carries the *term id* rather than its title in the query, so the same entry stays open.
Facet selections are ids and carry over unchanged.

---

## 9 · Honesty

1. **Nothing is presented as available that is not written.** The `curriculum` array and the
   `01` badge are deleted outright.
2. **Absence is inert text, never a disabled control.** A disabled button is a promise; a
   plain span is a fact. The rail still renders all four slots in fixed order.
3. **No ratio anywhere, even an honest one.** No "8 of 19 topics have a drill", no
   percentage, no progress bar, no streak, no denominator over 511 or 128 or 19.
4. **Exactly one place names scope**, and it is a count of what exists plus a link to the
   plan, never a fraction: one line in the read index footer — *"97 terms and 19 lessons are
   written. The plan for the rest is in ROADMAP.md."* The link points at the repository copy,
   not at a site path: `public/` holds one file and the export emits no `.md`. The
   encyclopedia's live result count is a count of *matches in the current view*, not of
   content, and is the one carve-out.
5. **No synthesised targets.** No drill for a topic with no rule; no encyclopedia topic with
   zero terms; no ledger row for `halved-instead-of-dotted`. Where a whole category has
   nothing behind it — the 7 `tone` terms have no exercise kind at all — the facet says so in
   words rather than rendering an empty bucket.
6. **No language mixing, enforced three ways.** The compiler enforces it for text:
   `GermanKey = keyof typeof german` makes an untranslated English string a `tsc` *and*
   `oxlint` failure, and the repo has zero suppressions. The design enforces it for layout: no
   card, label, heading, facet chip or index row shows a second language's term. The one
   carve-out is content, not chrome — cross-language material appears only in the running body
   text of entries whose subject *is* the difference between traditions.
7. **No claim the engraver cannot draw.** `lib/glyphs.ts` has 11 glyphs and `lib/staff.ts`
   three note values, four clefs and five accidentals. There are no rests, flags, beams, dots,
   ties, time signatures or key signatures. Stems, ledger lines and barlines are plain
   `<line>` elements and that is the whole vocabulary. No mockup, illustration or prose
   example may show otherwise.
8. **A topic row exists only when its read lens has at least one authored paragraph in all
   three languages.** A topic with no prose is not a row, not a sidebar entry, not a rail
   target and not a 404 — it does not exist, and its place is in `ROADMAP.md`. Asserted beside
   the 97-term census.
9. **The site never looks broken while being honest**, because absence never leaves a hole:
   read and define are live on 19 of 19 topics; play falls back from the notes bed to the tone
   bed; drill degrades to the topic's read lens.

---

## 10 · Edges

**Narrow viewports.** Every lens gets a rule at `max-width: 600px`, and **nothing is hidden
at any width** — content reflows or scrolls in its own container. (The current sheet's habit
is the opposite: `.note-card` disappears below 430 px, `.count-badge` below 960 px,
`.beta-label` below 1150 px, `.section-caption` below 960 px.)

- **play** — the instrument gets `min-width: 0` and its own `overflow-x: auto` wrapper; the
  control column stacks above the bed; the keyboard falls back to a one-octave range rather
  than shrinking keys below a 28 px touch target.
- **read** — `.breakout` and `.bleed` both resolve to the prose column, and any `.bed` inside
  them scrolls horizontally within it.
- **drill** — options go one-up at 48 px min-height; the ledger `<details>` is closed.
- **define** — the entry replaces the index and **must** render a persistent "Back to the
  index" link as its first child. Browser Back is not a visible affordance.

Below each lens's breakpoint the fixed side column loses its width entirely and stacks. No
lens may produce horizontal scrolling of the page body — only of an explicit
`overflow-x: auto` container around an instrument or an engraving.

**Staff scaling.** `components/staff.tsx` emits fixed `width`/`height` in px from a `space`
prop, so it shrinks below its natural size but never grows, and its `strokeWidth` is
`Math.max(1, space * 0.09)` in *user units* — so scaled down to a 520 px column or a 375 px
phone the five lines alias away. Fix: `space` per lens as a token multiple (read prose 13,
read breakout 16, drill 13, play 11, define 11); `vector-effect="non-scaling-stroke"` on
every `<line>`; drop the fixed `width`/`height` in favour of `width="100%"` plus the existing
`viewBox` with `preserveAspectRatio="xMinYMid meet"`; every `.paper` block wrapped in an
`overflow-x: auto` container so a wide engraving scrolls rather than shrinking.

**Print** — there is not one `@media print` rule in the 2850-line sheet, and the redesign
adds the first thing that prints catastrophically. A printed theory lesson is the most likely
offline use of a music-teaching site. Force the chrome tokens to their light values
regardless of `data-theme`; remap `.bed` onto the paper namespace so an instrument prints as
a diagram; `display: none` the sidebar, topbar, language switch, skip link and lens rail;
keep `.paper` byte-identical to screen; never expand hrefs with `content: " (" attr(href) ")"`
— every href here is a hash and would print as noise.

**Zoom.** The ramp and the measures are in `rem` so a reader who raises their default font
size is respected on the one lens whose purpose is reading. Spacing, borders and radii stay
in px.

---

## 11 · Build order

Every step below is shippable on its own.

| # | step | files | risk |
|---|---|---|---|
| 0 | **Make the stylesheet tell the truth.** Collapse the self-contradicting override block at `globals.css:2410-2483` into the rules it silently overrides (twelve selectors go 10 → 12 px, `.page-heading p` 14 → 16, `.note-card` `#ecf3e9` → `#e9f3ec`, `.reference-input` 47 → 48 px) and retire the 13 `!important`s by raising specificity — **except** the two in the reduced-motion block. | `app/globals.css` | None visually. Skipping it means every later sweep edits declared values that are not the rendered ones. |
| 1 | **Token layer, with aliases.** Replace `:root` 634-637, `:root` 672-682 and `.dark` 683-692. Leave `@custom-variant dark` and `@theme inline` untouched. Delete `globals.css:725-732` in the same commit. | `app/globals.css` | ~610 semantic-colour utilities across 60 vendored files resolve through `@theme inline`. Delete it and Select, Slider, Progress, Sidebar, Tabs and Dialog break site-wide. |
| 2 | **Theme plumbing.** A `themeStore` beside `langStore`; `data-theme` **and** the `dark` class both written on `documentElement`; `color-scheme` in `layout.tsx`. `DEFAULT_THEME` is `'light'`, **not** `'system'` — see below. | `lib/client-store.ts`, `app/page.tsx`, `app/layout.tsx`, two tests | Writing only one channel leaves 23 vendored files rendering light values on a dark ground. |
| 3 | **Literal sweep.** Retire every hardcoded colour onto the tokens, including `.panel`, which wrote literal `white` and `#e0e7e2` in place of the two tokens that exist for it. Point the oscilloscope's canvas at `--s-grid`/`--s-axis`/`--s-live`. Add `tests/tokens.test.mjs`. **Then flip `DEFAULT_THEME` to `'system'`** and `layout.tsx`'s meta to `light dark`, which is only honest once the sweep is done. | `app/globals.css`, `app/page.tsx`, `app/layout.tsx`, `lib/client-store.ts`, two tests | The sweep is a real palette change, not a rename — see below. |
| 4 | **The paper namespace, with a regression test** asserting the staff's computed ink, paper and border are byte-identical under both themes, and that the chrome around it is not. The surface goes on `.staff` itself rather than on a `.paper` wrapper at each call site — see below. | `app/globals.css`, `tests/browser/staff.browser.test.mjs` | This test is the only thing that turns "notation never flips" from a promise into a regression test. |
| 5 | **`lib/topics.ts`, the primary key.** 19 rows: id, order, kind, title, module, plus `termsByTopic`, `paragraphAnchors`, `drilledTopics` and `toneBedTopics`. `RULES` and the narrowed `Item.rule` go in `lib/exercises.ts`, which owns them; `ruleTopic` and `ruleKind` go in `lib/topics.ts`, which keeps the dependency one-way. | `lib/exercises.ts`, `lib/topics.ts`, `tests/topics.test.mjs` | No content is authored — every field derives from what exists. The id is the bare slug (decision 1). |
| 6 | **Routing.** `Route` / `routeFromHash` / `hashOf`; language in the hash; `pushState`; the `hashchange` listener the repo lacks; `configureLab` writing the same address the nav does; `document.title` per topic per language. `DEFAULT_LENS` stays `play` until step 8 builds the read index — see below. | `lib/client-store.ts`, `app/page.tsx`, two tests | Breaks `chords-lab.browser.test.mjs:424` and `:438`, which assert `location.hash === '#chords'` after a click. |
| 7 | **Shell.** Delete `.page-heading`, the `01` badge, `.breadcrumb` and `.beta-label`; add the skip link, `SubjectLine`, the lens rail with `aria-current`, the route announcer and focus-on-navigation. Bind the open lesson to `route.topic`, so a subject address opens that subject and the rail is real. **The nav rename moves to step 8** — see below. | `app/page.tsx`, `app/globals.css`, `lib/german.ts`, four browser tests | The chords lab is the play lens of one topic, so its heading becomes the topic's title: that is the `german.browser.test.mjs` breakage, and `notes-lab` loses its assumption that a lesson survives a page switch. All four of `navigation.browser.test.mjs`'s tests survive, because the nav labels do not change. |
| 8 | **The surface fork, then the lens layouts, one PR each, cheapest first:** delete `.panel` — all 26 of its sites are chrome cards, so which of `.paper`, `.bed`, `.inset` or `.index` each becomes is a question only the lens layouts can answer, and it moved here from step 3. Then DEFINE (pure subtraction, **done**), READ (named-line grid plus the serif, **done**), DRILL (the ledger; delete Progress and the percentages; neutral staff labels — **done**, and ear training left for the lab with it), PLAY (the bed, the insets, unmount instead of `.is-hidden` — **done**). Step 8 is complete. | `components/learning.tsx` (split), `components/play-lens.tsx` (new), `components/chords-lab.tsx`, `lib/learning.ts`, `app/globals.css` | `chords-lab.tsx` is the largest file in the repo at 1229 lines with a 686-line test that queries headings by accessible name. See open question 3. |
| 9 | **German and cleanup.** ~40 new keys: 4 lens names, 4 lens-absent sentences, the skip link, the rail's `aria-label`, the kind words, the facet names, the ledger labels, the two read → play labels, the neutral staff labels. Delete the 15 orphaned keys; add a usage assertion. | `lib/german.ts`, `tests/german-localization.test.mjs` | A **hard gate**, not cleanup: a missing entry is a `tsc` and `oxlint` failure. Author the German in each step above; this step only prunes. |
| 10 | **Deferred, blocked by nothing above:** per-language route roots `app/[lang]/page.tsx` with `generateStaticParams`, three canonicals plus `hreflang`, `<html lang>` from the segment. | `app/[lang]/page.tsx`, `app/layout.tsx`, two tests | The only real fix for crawlability and first-paint `lang`. `Route` reads the same shape, so no lens changes. |

---

### What the literal sweep actually changed

240 colour literals in 206 distinct values, retired onto 24 tokens. It is a palette
consolidation, not a rename: 72 near-identical mid greens used once each collapse onto three
ink steps, which is the whole point — the file had no theme, no focus token and no notation
ink precisely because every colour was a local decision.

The measured outcome, on the running site, all five pages:

| | light: surfaces still light / **AA text failures** | dark: surfaces still light / **AA text failures** |
|---|---|---|
| before | — / **108, 17, 114, 26, 115** | 32, 34, 25, 9, 103 / **117, 74, 112, 25, 210** |
| after | — / **0, 0, 0, 0, 0** | 23, 27, 2, 4, 2 / **0, 0, 0, 0, 0** |

Every WCAG AA text failure on the site is gone, in both themes, because nothing may now be
lighter than `--c-ink-3` and that token is 4.99:1 on the page ground. The light surfaces that
remain in the dark theme are the ones that must never flip: white piano keys and the sounding
key (`--s-paper`, `--s-live`) and the primary buttons, which in the dark theme are the light
green `--c-link` carrying `--c-surface` text at 9.07:1.

Three decisions worth recording:

- **`@theme inline` was edited, against step 1's "untouched".** Step 1 meant *do not delete
  it*. Two of its literals had to move: `--color-primary-foreground` and
  `--color-sidebar-primary-foreground` were `#fff`, and in the dark theme that is white text
  on the light-green `--c-link` at about 1.4:1 — every shadcn primary button, unreadable.
  Both are now `var(--c-surface)`, which flips with the button: 8.06:1 light, 9.07:1 dark.
  `--color-destructive` became `var(--c-alert)`. Nothing else in the block was touched.
- **`--k-tone-wash` doubles as the selected-state fill outside the encyclopedia.** The hue
  policy confines the four kind hues to the encyclopedia, but `--accent` has always aliased
  this wash and rule 3 of the sweep sends every near-white green "selected" tint to it. It is
  the same value either way; what is confined to the encyclopedia is hue as a *carrier of
  kind*, not this one wash as a selected fill.
- **Shadows became tokens too** — `--shadow-pressed`, `--shadow-card`, `--shadow-raised`,
  `--shadow-key`, `--shadow-lift`, `--ring-live` — so the "no colour outside the palette"
  rule has no carve-out. They do not flip; a shadow on a dark ground is simply faint.

Two latent bugs surfaced and were fixed on the way: `.chord-select-content`'s sticky label
read `var(--popover)`, which nothing declares, so it had no background and the list scrolled
under it; and three "gradients" on the piano keys had identical stops at every position, so
they were flat fills written the long way.

### What the shell became

`.page-heading` is gone — the eyebrow, the five-way-ternary `h1`, the marketing paragraph
and the 69 px circle that stood on top of every page — along with `.breadcrumb`, the `01`
badge and `.beta-label`. Fifteen rules left `app/globals.css` with them. In their place a
page opens with its subject: on `#/en/t/staff/read` the heading is *Five lines, four spaces*,
not a slogan about the page it happens to be on.

The rail sits directly under it, four slots in one order, `aria-current="page"` on the one
you are looking at. Two lenses can show a subject today, so the other two say
*Drill — not written* in inert text with `tabIndex -1` — not a disabled button, which would
be a promise that someone is working on it. On a lensless route the same four labels become
an index switcher and the rail's `aria-label` changes from *Views of this topic* to
*Indexes*.

Three things a single-document app has to do by hand, and now does: the first Tab reaches a
skip link (clipped, not `display: none`, so it stays in the tab order); focus moves to the
`h1` after a navigation; and an `<output aria-live="polite">` speaks the new subject.
`<output>` rather than `role="status"`, because `jsx-a11y/prefer-tag-over-role` bans the
redundant role and the repo allows no suppressions.

Two bugs the screenshots caught, both invisible to the test suite:

- **Focus was landing on the heading when a reader merely arrived.** The prerendered markup
  carries the default route and the address replaces it during hydration, which looks like a
  navigation and is not one. Focus now follows a move the reader made, not a state settling.
- **The language in the address was being overwritten by the saved one.** `#/de/t/staff/read`
  rendered in English. The language store now reads the address first and falls back to
  storage, so the two agree from the first snapshot rather than being reconciled afterwards.

**The nav is not renamed to the four verbs yet, and that is deliberate.** The plan had step 7
relabel the sidebar, but the lens indexes have no layouts until step 8: four lens rows would
drop *Chords lab* from the navigation and put it two clicks away, in exchange for an IA the
pages cannot yet honour. The rail is the lens switcher today; the sidebar keeps its five
entries and gets its topic list when the lenses have somewhere to send them.

### Two engraving fixes, from reading the screen rather than the tests

**A note no longer touches the clef.** The first head's centre sat at 4 staff spaces with its
left edge at 3.4, while the widest clef — the F clef, measured at 2.78 spaces from the
committed outlines — reaches 3.78. They overlapped by four tenths of a space and read as one
mark. The first note now starts a clear space after the clef, and `tests/staff.test.mjs`
asserts the gap for all four clefs.

**The accidental buttons draw their sign.** See §5: a sign is international, the word is not.

### What routing changed, and what it deliberately did not

The grammar is live and measured end to end. Back and Forward move through the site —
`define → read → play → read` — where before `navigate()` only ever replaced the same history
entry and Back left the site entirely. A shared address carries the language: `#/de/t/staff/read`
switches to German, sets `<html lang="de">` and titles the tab *Fünf Linien, vier Zwischenräume
— One Music Lab*, where every page in every language used to be titled `OML — One Music Lab`.
The `~` anchor round-trips. Every address the site ever minted still resolves — `#chords`
becomes `#/<lang>/t/chords/play`, `#theory` becomes `#/<lang>/read` — and an old link cannot
name a language, so the reader keeps their own. A topic nobody wrote lands on the document
rather than a 404.

Three deliberate omissions:

- **`DEFAULT_LENS` is `play`, not `read`.** The home *should* be the document rather than an
  oscillator, but the read index that argument is about — the nineteen topics in order,
  grouped by kind, with one "Start here" — is built in step 8. Until it exists, moving the
  home to today's lesson grid would be a product change justified by a page that isn't
  written. It is one constant, and the same shape as `DEFAULT_THEME` in step 2.
- **The lens is not in `document.title` yet.** The format is
  `"<topic> · <lens> — One Music Lab"`, and the lens half needs the four lens names in three
  languages, which step 9 budgets and step 7 renames the nav to. Step 6's row asks for the
  title "per topic per language", which is what it does; adding English-only lens names now
  would put two languages in one title.
- **The `hashchange` listener is a `useEffect` in the page, not inside `pageStore.subscribe`.**
  The store is a plain value holder with no lifecycle; hanging a window listener off it would
  leak on unmount and be untestable. The page is the only consumer, and the effect removes
  its listener.

`routeFromHash` takes the valid topic ids as an argument rather than importing them, the way
`langFromStorage` is handed its storage. `lib/i18n.ts` already imports `Lang` from
`lib/client-store.ts`, so importing the curriculum into the store would have closed a loop
around the whole data layer.

### What the primary key turned out to be

Every number this document asserted about the content held, checked against the modules
themselves: 19 lessons, 97 terms, no orphan in either direction, the term census
38 / 27 / 25 / 7, 12 notation presets leaving 7 tone-bench topics — `dynamics` among them, as
the review said — and exactly 14 rules, which is now a closed union rather than a `string`.

`Item.rule` is typed, so a fifteenth rule cannot be added without `ruleTopic` naming the topic
that teaches it. `ruleTopic` and `ruleKind` live in `lib/topics.ts` rather than in
`lib/exercises.ts` as originally planned: `lib/learning.ts` already imports types from
`lib/exercises.ts`, so putting a table that needs `TopicId` there would have made a cycle.
The dependency now runs one way — topics → exercises, topics → learning, learning → exercises.

**`module` is `null` on all 19 rows, deliberately.** The roadmap numbers its 511 topics and
links each to a module anchor in `docs/curriculum/`, but the 19 lessons written so far carry
no roadmap number, so there is nothing to derive an assignment from — and the F-modules that
would hold them are not the N-modules their `category` field names, so guessing would be
wrong more often than right. Assigning them is content work. Because the id is the slug, it
can happen at any time without invalidating a link anyone has saved, which is the whole point
of decision 1.

The nine tests in `tests/topics.test.mjs` are checks against other files, not restatements of
the table: the rule census is taken by regenerating the corpus and reading what the builders
actually emit. I mutation-tested them — a topic filed under the wrong kind, a rule pointed at
the wrong topic, a rule paired with the wrong generator, and a topic id with no lesson behind
it were all caught. `lib/topics.ts` measures 100% on statements, branches, functions and lines.

### Where the score surface actually lives

The staff paints every line and glyph with `currentColor` and had no background of its own,
so it took whichever surface its container happened to paint. Every one of those containers —
`.staff-frame`, `.exercise-staff`, `.staff-position`, all inside a `.panel` — is chrome, and
chrome now flips. Measured on the running site the moment the dark theme was switched on:
`--s-ink` **#14181a on #17201d, 1.07:1**. The notation was invisible, and no contrast audit
caught it because a staff is not text.

The surface therefore goes on `.staff` itself, not on a `.paper` wrapper added at each call
site. Six call sites exist today and more arrive with every lens; a rule that has to be
remembered is a rule that will be forgotten, and forgetting it is invisible in the light theme
where paper and card are the same white. `.staff` now carries `--s-paper`, `--s-ink` and an
`--s-rule` hairline, all from the namespace no theme redefines. Light and dark both measure
**17.87:1**.

`.paper` stays a container class for the lens layouts, where a bed needs a sheet of paper set
into it. It is deliberately not applied to `.keyboard-panel`: that card holds the keyboard's
chrome controls, whose colours must follow the theme. The keys themselves are already score
tokens — `--s-paper` and `--s-ink` with `--s-rule` edges — so the piano does not flip while
the card under it does, which is what the third test asserts.

### Why the theme started on `light` before the sweep

Because the dark theme does not work yet, and `system` would hand it to every dark-OS
visitor on their first load. The token layer flips, but `app/globals.css` still writes most
of its colours as literals, so the chrome goes dark underneath surfaces that stay white.
Measured on the running site with `data-theme="dark"` and the `dark` class applied:

| page | light surfaces still painted | AA text failures, light → dark |
|---|---|---|
| Sound lab | 32 | 108 → 117 |
| Chords lab | 34 | 17 → 74 |
| Music theory | 25 | 114 → 112 |
| Practice | 9 | 26 → 25 |
| Encyclopedia | 103 | 115 → **210** |

The worst single case is a heading at **1.10:1** — near-white text on a panel that stayed
near-white. The topbar, every `.panel`, the note pills and the brand mark are all still
literal white.

So step 2 ships the plumbing and leaves the door shut: `DEFAULT_THEME = 'light'`, a saved
`dark` or `system` is honoured for anyone who asks for it, and the default flips to
`'system'` in the same commit that retires the literals. Verified end to end across all six
paths — no saved value under a dark OS stays light; saved `dark` gives `data-theme="dark"`,
the `dark` class, `color-scheme: dark` and the dark ground; saved `system` follows the OS in
both directions and reacts to it changing; an unknown saved value falls back and is
rewritten.

(The light theme's own 108 AA failures on the sound lab are pre-existing and are step 8's
business, not step 2's.)

## 12 · Decisions and open questions

### Settled

1. **The primary key is the bare slug.** `#/en/t/staff/read`, off the 19 curated
   `lessons[].id` values. The slug is the identity forever; `module` and `roadmap` are
   metadata columns in `lib/topics.ts`, and a test asserts slug uniqueness across the whole
   511 as they land. Every URL bookmarked today survives. The rejected alternative —
   module-qualifying the id now (`#/en/t/n02-staff/read`) — was unambiguous forever but a
   content migration whose source of truth, the 128 module titles, exists only in Russian.
   This had to be decided before step 5: choosing it later would break every URL the system
   mints.
2. **The lens rail carries the four verbs: Read / Play / Drill / Define.** The thesis made
   visible, rather than the existing five nouns competing for four slots. This renames every
   nav label, so `german.browser.test.mjs:122` and four `click()` calls in
   `chords-lab.browser.test.mjs` change with it.
   Working translations, to be finalised when the keys are authored in step 9:
   RU `Читать / Играть / Упражнение / Определения`, DE `Lesen / Spielen / Üben / Nachschlagen`.
   **`Üben` is the one to check** — it is the natural German for practising, but "Drill" in a
   music-pedagogy register may want something narrower.

### Still open

These need the project owner, not a developer. Both are assumed **A** below unless changed.

3. **Chords lab's home.** `components/chords-lab.tsx` is 1229 lines with its own three-tab
   structure and a 686-line test.
   **A** (assumed) — it becomes the play lens of topic `chords` only; `intervals` and `scales`
   keep the existing Experiments component. Cheapest, keeps the test mostly intact.
   **B** — it becomes the play lens of all three, which is cleaner but means deciding what its
   workbench shows for a topic that is not chords. Roughly a week more.
4. ~~**Whether ear training leaves the trainer.**~~ **Settled as A, and built.** It is
   `components/ear-training.tsx`, rendered on the `intervals` tab of `Experiments` — the play
   surface of that topic today, and the play lens of it after the next step. Option B was not
   taken because the third option, leaving it in the trainer untagged, was the one thing ruled
   out: the ledger would have quietly ignored half of what the reader did. Its score panel went
   with it rather than moving, on the same rule as the drill's. The German nav label followed:
   `Practice` was `Gehörbildung`, which `docs/notation-chapter.md` had flagged as wrong since
   the notation trainer landed; it is `Übungen` now that nothing on the page is heard.

### What the drill lens actually became

**The ledger is keyed on `Rule`, and `Item.rule` is what writes it — not the rule that was
drawn.** The draw picks a rule; `itemForRule` then searches the three levels and a few seeds
for an item the generator will emit for it, because two kinds carry more than one rule
(`octave-region` puts the register in its rule, `dotted-value` asks about the first dot or the
second). When no combination produces the drawn rule the reader still gets a real question,
and the row that is credited is the one the item itself names. A ledger that recorded the
draw could claim a rule was practised when it was not.

**The row shape is `{asked, missed, tag}`, one field more than specified.** `exerciseExplanations`
is keyed on `ErrorTag` and the ledger is keyed on `Rule`, so `{asked, missed}` alone had no
explanation to show. The row therefore remembers the **last mistake made on that rule**, and a
right answer afterwards does not erase it — the reader still has the thing that went wrong in
front of them. A row that has been asked and never missed shows a tally and nothing else:
there is no mistake to explain, and printing one would be answering a question nobody got
wrong. Rows never asked read *not yet asked* rather than `0 · 0`, which reads as a score.

**Everything read back from `sessionStorage` is checked, not trusted.** It is an origin-wide
store any script can write, so `ledgerFromStorage` drops unknown rules, unknown tags,
fractions, negatives, and any row claiming more misses than questions. Thirteen shapes of
corruption are asserted to produce no row at all; a bad tag alone loses the explanation and
keeps the tally, because the counts are still true. The vocabulary is handed in rather than
imported, the same way `routeFromHash` is handed its topics — `lib/client-store.ts` imports
`Rule` and `ErrorTag` as **types only**, so the bundle carries no edge from browser state to
the generator while `tsc` still names the place a fifteenth rule has to be handled.

**Two exits per row, and both of them land.** The read exit needed two fixes that were not in
the spec. `InlineExercise` showed `rules[0]` of the topic, so three of `note-names`' four
ledger rows would have arrived at a question about something else; it now generates the rule
the anchor names. And nothing scrolled to it — the anchor is written after a `~` precisely so
the URL keeps one fragment, which means no native target matches — so the section scrolls
itself into view. The define exit needed the encyclopedia to accept the subject and preselect
its topic facet, keyed on the subject so a second row reselects rather than keeping the first.
Verified end to end on the running site: a missed `dot-adds-half` → the passage that states it,
scrolled to, with that rule's question → back to the scoped drill with the tally intact → the
five terms of `dots-ties`.

**The disclosure is one `<details>` at every width, not a panel that becomes one.** The spec
asked for a sticky column above 900 px and a `<details>` below it. Two different elements
would need a `matchMedia` subscription and would re-announce themselves on a resize; one
`<details open>` that stops being sticky below 900 px behaves the same at both widths, and a
reader who closes it has closed it. The rail may never be disclosed; this may — it is a record
of work, not a way to get anywhere.

**The kind and level rows went with the score.** The drill interleaves — that is the whole
argument for `#/<lang>/drill` — and scope now comes from the address, so buttons that pick a
kind contradicted the lens. `#/<lang>/t/<topic>/drill` is the scoped variant, reached from the
rail (now open on the eight topics that have a rule) and from *Practise this rule* in the
passage. A topic with no rule falls back to the interleaved drill rather than showing an empty
ledger.

**The staff no longer reads its own answer out.** `StaffAnswer` built its `<title>` as
`Clef: treble; Line 1; Accidental: none`, which is a complete spelling of the note a
screen-reader user was about to be asked to name — worse than the generated label the spec
named, and it was the case the existing test asserted, with a comment claiming it did not leak.
The staff is neutral until the answer is given and spells the notation afterwards, where it is
feedback. `NotationQuiz`'s single neutral label became three, one per engraved kind, and
`InlineExercise` got one too. A browser test walks all 14 rules and fails if any staff title
contains any option offered beside it.

**Deleted, not restyled:** `<Progress>` (the component is now unused anywhere), both
`{score}/{total}` blocks, both percentages, the `.score` 60 px counter, `.progress-caption`,
`.practice-progress`, `.practice-layout`, `.practice-card`, `.practice-tip`, `.practice-modes`,
`.exercise-kinds` and `.exercise-levels` — 12 rules and their four responsive counterparts. A
test asserts the drill renders no `[role="progressbar"]` and matches no `\d+%` anywhere.

### What the play lens actually became

**The extraction found a bug in `.panel` that had been invisible for as long as it existed.**
`.panel` painted a background and never painted an ink to go on it, so a panel took whatever
colour it inherited. That was harmless while everything a panel sat on was the same near-white
— and stopped being harmless the moment the play lens gave itself a dark bed, at which point
every panel on it inherited `--s-on-ground` and rendered pale green text on white. The fix is
one declaration, `color: var(--c-ink)` on `.panel`, and it belongs there rather than on the
lens: a surface that paints a ground owes an ink.

**The bed had to be told to contain what is on it.** `.lens-play` is a grid, and a grid item's
automatic minimum is its min-content width, so the single column sized itself to the widest
thing on it — the notes lab, four panels with a staff inside them — and ran 255 px off the
side of a 375 px phone. `grid-template-columns: minmax(0, 1fr)`, the same fix the read lens's
gutters needed for the same reason. Measured after: the bed's `scrollWidth` equals its
`clientWidth` on both tabs at 375 px, which is now a test.

**The inactive tab never had the active one's layout.** `.section-tabs .active` set
`display: flex` and a gap; the inactive button set nothing, so its icon sat above its label
rather than beside it. Two near-black labels on white hid it; the bed did not.

**`prefers-reduced-motion` is read in JS, and the scope still draws.** The site's
`@media (prefers-reduced-motion: reduce)` block turns off animations and transitions, and a
`requestAnimationFrame` loop is neither — a reader who asked for less motion was still shown a
waveform moving at 60 fps. The hook now draws one static cycle at mount, on every parameter
change and on resize, and schedules nothing. The test asserts the frame count **stops growing**
rather than that it is zero, because React and the sidebar schedule frames of their own.

**Unmounting, not hiding, and the canvas had to move for it to mean anything.** `.is-hidden`
took the generator out of the accessibility tree but left the loop drawing into a zero-sized
canvas for as long as the reader stayed on the notes tab. The scope is its own component now,
so removing the instrument removes the canvas and the effect cleanup cancels the frame. The
three assertions in `notes-lab.browser.test.mjs` that asserted the `is-hidden`/`display: none`
pair are rewritten to assert the absence, as the spec said they would be.

**Audio equivalence is a live region, not a colour.** The `Playing` badge was a decorated
`<span>`, so a reader who could not hear the tone was told nothing when it started. It is an
`<output aria-live="polite">` naming the state, the pitch and the frequency in ink.

**`.paper` on the keyboards was already settled the other way, and stays settled.** Step 4
decided the surface goes on `.staff` itself and deliberately not on `.keyboard-panel`, whose
card holds chrome controls while the keys themselves are already score tokens. That decision
survives the bed unchanged: the piano does not flip while the card under it does, which is what
makes the keys and the notation the brightest objects on a dark ground without a class being
remembered at each call site.

**The lens is 33 explicit props.** The state stays in `app/page.tsx` because the read lens
writes it — *Open this experiment* sets a frequency, a waveform, a tab and a notes-lab preset
from a lesson — and because the audio engine is silenced by `go()` on every navigation. The
analyser's buffer is handed over as a function rather than as data: it is written in place
sixty times a second, so passing the array itself would give the lens a value React sees as
unchanged. `app/page.tsx` loses 490 lines.
