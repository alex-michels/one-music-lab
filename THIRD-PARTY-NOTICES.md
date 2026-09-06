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

Copied files are linted with the same rules as first-party code; suppressing a
rule is not accepted as a fix (ROADMAP P00). The copies below therefore diverge
from the Shadcn registry by the smallest change that satisfies the rule while
keeping every `data-slot` attribute and exported name; any change to a class
list or props type is listed below. Re-adding a
component from the registry (`shadcn add --overwrite`) restores the original
error; re-apply the change and update this list. Unused copies are kept so the
catalog can still be used; removing them is a separate boundary decision.

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
- `components/ui/item.tsx`: `ItemGroup` renders a plain `<ul>`; `Item` still
  defaults to a `<div>`, so render items inside a group as `<li>`
  (`render={<li />}`) for a valid list. The explicit `role="list"` WebKit
  workaround for `list-style: none` is rejected by `no-redundant-roles`, so
  Safari may announce the list as a generic container.
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
