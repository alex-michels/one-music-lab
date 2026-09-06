# UI provenance boundary (P00)

Decision recorded on 2026-09-06, following merged baseline `b3073b4`.
ROADMAP.md remains the only completion register.

## Imported code and local responsibility

The initial import, commit `7abe5bc14882917be864b8ead3483d3f1705eee6`, contains
60 files in `components/ui/`, plus `hooks/use-mobile.ts` and `lib/utils.ts`.
This is a reproducible **local import baseline**, not a verified upstream
Shadcn revision. The complete scaffold/bundle license review remains in P10.
Preserve the MIT notice in `LICENSES/shadcn-MIT.txt` and the descriptions in
[THIRD-PARTY-NOTICES.md](../THIRD-PARTY-NOTICES.md).

[ui-provenance.json](ui-provenance.json) records all 62 paths, their baseline
SHA-256 hashes, and their current classification: 12 modified and 50 unchanged.
Hashes were computed from the baseline Git blobs as UTF-8 after normalizing
CRLF to LF. Line-ending conversion on Windows must not count as a modification.
The automated checks use the committed hashes, so shallow CI checkouts need
neither historical Git objects nor network access.

| Code category | Responsibility and future full coverage denominator |
| --- | --- |
| Authored application, learning UI, number field, authored libraries, configuration, scripts and infrastructure | Include all executable production code, even files not imported by tests. Keep code and educational-content licenses distinct. |
| The 12 locally modified imported copies | Maintain and test the **entire files**, including inherited sections and currently unused copies. Include them in the maintained production-code coverage denominator; retaining upstream licensing does not exempt modifications from testing. |
| The 50 unchanged imported copies, including `lib/utils.ts` | May be reported separately as third-party code after provenance review. Continue lint/type checks and integration tests for application use. Editing a copy moves it to the modified category. |
| Installed dependencies | Track versions and licenses separately in the dependency/bundle audit; do not treat installed package internals as authored code. |
| Test fixtures and generated output | Do not count as production code. Test maintained generators and configurations themselves. |

This boundary is now implemented in `vitest.config.ts`, which reads
[ui-provenance.json](ui-provenance.json) directly: copies marked `modified` are
measured together with the authored code, and copies marked `unchanged` are
excluded from that denominator and reported separately. Editing a copy
therefore moves it into the measured set automatically, and
`tests/coverage-boundary.test.mjs` fails if the record and the denominator ever
disagree. Instrumentation is not coverage: the measured share is still low, and
no threshold is enforced yet.

## Retain the current catalog

Retain all 62 copies and the current dependencies for now. This is an explicit
boundary decision: the reusable catalog remains available, with local changes
owned and documented. Any later removal needs a separate bounded review of
imports, public component use, dependency impact and behavior. Deleting difficult
files merely to improve coverage is not an acceptable reason.

A static import/export traversal from `app/page.tsx` and `app/layout.tsx` at
`b3073b4` reached these 13 imported files:

- `components/ui/button.tsx`, `components/ui/input.tsx`, `components/ui/progress.tsx`
- `components/ui/select.tsx`, `components/ui/separator.tsx`, `components/ui/sheet.tsx`
- `components/ui/sidebar.tsx`, `components/ui/skeleton.tsx`, `components/ui/slider.tsx`
- `components/ui/tabs.tsx`, `components/ui/tooltip.tsx`
- `hooks/use-mobile.ts`, `lib/utils.ts`

The other 49 copies were not reached by that source graph. This is not a bundle
audit or proof about dynamic loading, and does not justify dependency removal.
`ItemGroup` is currently outside that application graph; its regression test
protects the retained component contract before future use.

## Explicit list roles and lint

Tailwind's installed preflight stylesheet resets list markers with
`list-style: none`. WebKit can then omit native list semantics. Its documented
override is an explicit `role="list"`; see the
[WebKit explanation, comment 1](https://bugs.webkit.org/show_bug.cgi?id=170179#c1)
and [MDN accessibility guidance](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/list-style#accessibility).
These sources were checked on 2026-09-06. This choice preserves list semantics
without requiring visible bullets in a styled item group.

`jsx-a11y/no-redundant-roles` remains an **error**. Its documented
[per-element configuration](https://oxc.rs/docs/guide/usage/linter/rules/jsx_a11y/no-redundant-roles)
allows the additional pairs `ul` + `list` and `ol` + `list`; the rule's existing
default `nav` + `navigation` exception is retained. No file is ignored, and
redundant button, article and listitem roles remain errors. This narrow
compatibility policy applies equally to authored and copied UI.

`ItemGroup` renders `<ul role="list">`. Its children still need valid list-item
markup because `Item` defaults to a `div`:

```tsx
<ItemGroup aria-label="Selected notes">
  <Item render={<li />}>A4</Item>
  <Item render={<li />}>C5</Item>
</ItemGroup>
```

`tests/ui-list.test.mjs` loads the real TSX with the installed Vite transformer
and renders real React/Base UI on the server. It checks empty/populated groups,
the explicit role, native items, the accessible label and forwarded properties.
`tests/lint-policy.test.mjs` runs the installed Oxlint against positive and
negative fixtures. Both tests demonstrated the regression before the role and
configuration fix. These are markup and lint checks, not a claim of tested
Safari/VoiceOver behavior; P00's browser and assistive-technology review remains
open.

## Formatting boundary

The formatter owns authored source and the authored stylesheet, and
`npm run format:check` is a required Baseline check. The imported copies in
`components/ui/` are excluded in `.oxfmtrc.json` so they stay comparable with
the registry: reformatting all 62 files would rewrite the 50 unchanged copies
and make a future re-import harder to read, without making any authored code
clearer. `hooks/use-mobile.ts` and `lib/utils.ts` are formatted with the
authored code, because their bodies are already maintained locally.

Prose, data and configuration files are also outside the formatter: the roadmap
and the review documents are parsed and read as text, and
[ui-provenance.json](ui-provenance.json) is a record whose shape is described
above. Excluding them is a formatting-scope decision only. It does not narrow
lint, typecheck, tests or the coverage denominator, and `.gitattributes` keeps
one line ending on every platform so the check behaves the same on Windows,
macOS and Linux.

## Maintaining the record

When editing an unchanged copy, change its classification to `modified`, add a
modification description to THIRD-PARTY-NOTICES.md, and add behavioral tests.
Keep its original baseline hash. Further edits to an already modified file
still require an updated description and tests; a passing classification check
does not review those changes for you.

For a new or replaced upstream copy, review and record its source/version,
license and import evidence before extending the inventory format or baseline.
Do not regenerate baseline hashes from the working tree simply to make tests
pass. Place newly authored components outside the copied catalog unless the
inventory is deliberately extended to distinguish that provenance.

Run the usual README checks; the new tests run under `npm test` on Windows,
macOS and Linux, using existing dependencies. The inventory tests reject missing
or extra code records, symlinks in the catalog, stale classifications and absent
modification notices. They establish consistency with the local import, not
authorship, full license clearance, accessibility certification or readiness to
publish.
