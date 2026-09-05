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
