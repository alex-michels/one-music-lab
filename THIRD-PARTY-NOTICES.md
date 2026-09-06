# Third-party notices

The project was initially scaffolded using `@openai/create-sites@0.3.0` with
the bundled Shadcn/Base UI catalog. Original project licensing does not replace
the licenses of the scaffold, copied components or installed dependencies.

## Copied components

The initial `components/ui/**`, `hooks/use-mobile.ts`, and `lib/utils.ts`
originate from the Sites Shadcn scaffold and the Shadcn UI ecosystem.
Preserve their upstream MIT notices. See
[Shadcn UI license](https://github.com/shadcn-ui/ui/blob/main/LICENSE.md).
The canonical upstream MIT text is included in `LICENSES/shadcn-MIT.txt`.

### Local modifications to copied components

Copied files are linted with the same required rules as first-party code. The
list-role compatibility setting documented below is shared by both; no file
or rule is disabled to hide an error. The changes listed here are measured
against the initial repository import, not an independently verified current
upstream registry. Preserve each change's behavior, public exports, attributes
and applicable license when updating a copy; do not blindly overwrite files.

[UI provenance boundary](docs/ui-provenance.md) records the decision to retain
the current catalog, the coverage policy for modified copies, and the import
evidence. [The machine-readable inventory](docs/ui-provenance.json) classifies
all 62 imported UI/helper files: 12 modified, 50 unchanged relative to the
initial import. Tests detect an unregistered file or an edited copy incorrectly
labelled unchanged. This is provenance bookkeeping, not full license clearance.

- `hooks/use-mobile.ts`: `useSyncExternalStore` instead of setting state
  inside an effect; exports the viewport store for tests.
- `components/ui/breadcrumb.tsx`: `BreadcrumbPage` keeps `aria-current="page"`
  without `role="link"` and `aria-disabled`.
- `components/ui/button-group.tsx`, `components/ui/field.tsx`,
  `components/ui/input-group.tsx`: `<fieldset>` (implicit group role) instead
  of `<div role="group">`; `min-w-0` is added to button-group and field
  (input-group already had it); the input-group addon is `role="presentation"`
  because its click-to-focus handler is not allowed on a non-interactive group
  element, so the addon is no longer announced as a group (its buttons stay
  interactive).
- `components/ui/carousel.tsx`: `useSyncExternalStore` for the scroll state;
  a `<section aria-roledescription="carousel">` root whose props require an
  accessible name; `<fieldset aria-roledescription="slide">` items.
- `components/ui/chart.tsx`: accessor-function `dataKey` values are excluded
  from config-key lookups (`toConfigKey`).
- `components/ui/input-otp.tsx`: a native `<hr>` separator
  (`mx-[3px] h-px w-2.5 shrink-0 border-0 bg-current`) replaces the `MinusIcon`
  glyph with a 10×1px bar of the same footprint.
- `components/ui/item.tsx`: `ItemGroup` renders `<ul role="list">`; `Item` still
  defaults to a `<div>`, so render items inside a group as `<li>`
  (`render={<li />}`) for a valid list. The explicit list role is retained for
  WebKit when CSS hides list markers. Oxlint permits only the additional
  `ul`/`ol` + `list` pairs; redundant button/article/listitem roles remain errors.
- `components/ui/label.tsx`: `htmlFor` is passed explicitly.
- `components/ui/pagination.tsx`: `PaginationLink` renders its children inside
  the anchor explicitly.
- `components/ui/spinner.tsx`: an `<output>` wrapper
  (`inline-flex size-4 shrink-0 align-middle animate-spin`; props are now
  `ComponentProps<'output'>`) carries the status role and the `data-slot`; the
  icon inside is `aria-hidden`.

## Runtime and development dependencies

`package-lock.json` records the exact dependency versions. Each package retains
its own license; its distributed LICENSE/NOTICE files govern its use. The
present dependency set includes React, Base UI, Lucide, Vinext, Vite, Cloudflare
tools, and the Sites Vite plugin. This list is descriptive, not a complete
software bill of materials. A machine-generated license inventory and bundled
notice audit are required before the first independent public release.

The preliminary findings and per-material evidence still needed are in
[prelaunch review](docs/prelaunch-review.md). The portable archive carries the
existing license/notice files, but a complete audit of shipped dependency notices
is still pending. System font selection does not bundle font binaries.

## Research and learning sources

Current lessons link to UNSW, Open Music Theory and the University of Puget
Sound. External recordings, book scans, or extracted score images are not
bundled in this first version. Availability online does not imply reuse rights.

Open Music Theory content commonly carries CC BY-SA 4.0, with possible item
exceptions. MaqamWorld and Smithsonian Folkways audio must not be copied on
the assumption that they are freely licensed. Every future imported or adapted
item needs its own source, author, version, and rights record.
