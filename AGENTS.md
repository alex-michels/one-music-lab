# One Music Lab development rules

These rules apply to this repository. Read `ROADMAP.md`, `CONTRIBUTING.md`, and
the relevant code before changing a feature. The roadmap is the only completion
register; do not create a competing roadmap or silently drop original topic IDs.
Use permanent task numbers from ROADMAP.md; preserve old IDs through
docs/roadmap-guide.md. Requirements and evidence belong in the linked subject
documents, with gate G in docs/release-criteria.md. Do not renumber existing tasks.
Notation scope: preserve the existing Russian Sound lab displays, including
international labels outside the localized experiment. Tasks 556/557 concern
educational material and new labs/sections. Traditional Russian notation has
priority in new Russian laboratory content; international notation is also valid
and is not a localization error. Locale parity does not require retrofitting existing
displays or adding Russian duplicates for every pitch label (see CONTRIBUTING.md).

- Work in a branch and open a pull request. Do not push feature changes directly
  to `main`, merge, or deploy without the owner's authorization for that action.
- Every code change must include meaningful automated tests for its behavior,
  errors, boundaries, and regressions, and the corresponding documentation.
  This applies to application code, audio, assessment logic, utilities, scripts,
  migrations, and infrastructure. Do not add tests that only mirror implementation.
- Aim for 100% meaningful statement, branch, function, and line coverage across
  all first-party production code, including files not imported by existing tests.
  Do not exclude difficult files or suppress checks to inflate coverage. Record
  a technically unavoidable gap with its reason, owner, and issue in the PR.
  A passing partial report is not full coverage. Tests must verify musical and
  user-visible outcomes; use real browser audio tests where mocks are insufficient.
- Run `npm test`, `npm run test:coverage`, `npm run typecheck`, `npm run lint`,
  and `npm run build` as applicable. Report failures honestly. The documented
  baseline coverage debt is not a waiver for new code or a release gate; lint
  must pass.
- Keep setup instructions reproducible on Windows, macOS, and Linux. Update the
  README and relevant developer/user documentation in the same PR as changes.
- A topic is complete only after gate G (docs/release-criteria.md): sourced
  EN/RU/DE theory, working laboratory, meaningful practice with feedback, encyclopedia, tests, rights,
  accessibility, review, documentation, and a publishable artifact.
- Educational statements need verified sources with exact edition/page/section
  or timecode. AI output, search snippets, and book contents are not evidence.
  Identify cultural, historical, and theoretical scope; do not impose 12-TET or
  common-practice harmony as universal musical correctness.
- Preserve Apache-2.0 for original code and CC BY 4.0 for original educational
  text. Preserve third-party licenses; do not relicense copied CC BY-SA text or
  copyrighted recordings as original CC BY material. Record asset provenance.
- Keep sound generation gesture-initiated, bounded, cancellable, and testable.
  Browser gain is not calibrated sound pressure. Keep microphone/file processing
  local by default and document any explicit upload flow.
- `npm run build` targets Sites/Workers; `npm start` is a local Wrangler emulator,
  not a production VPS process. `npm run build:static` is the separate portable
  target. Follow `docs/private-staging.md`; only the allowlisted artifact is served.
- The owner has authorized private VPS staging only. Keep it bound to loopback
  behind SSH. Do not add public listeners, DNS/proxy routes, public Sites access,
  or automatic public deployment before P10 and explicit public-launch approval.
  A merge or a successful build is not permission to publish the website.
- Keep VPS audits, actual host/IP/user details, keys, contracts and personal data
  in ignored local storage, never in Git, PR text or uploaded CI reports. Generic
  deployment examples may be committed; preserve existing VPS services and bots.
