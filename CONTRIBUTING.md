# Contributing to One Music Lab

One Music Lab connects theory, experimentation, practice, and an encyclopedia
in English and Russian. Start with [ROADMAP.md](ROADMAP.md), choose one small
unfinished outcome, and explain its scope in a pull request. Large regional or
historical topics must first be split into named, reviewable releases.

## Local workflow

Follow the [README](README.md) to install Node 24 and run `npm ci`. Create a branch
from current `main`, make a bounded change, and open a PR back to `main`. The owner
reviews/merges and controls deployment. Do not commit generated build output,
recordings containing private data, credentials, `node_modules`, or `.env` files.

Every code change includes automated tests and documentation in the same PR.
For a bug fix, demonstrate the regression with a test that fails before the fix.
Tests should assert meaningful behavior: valid/invalid musical inputs, boundary
conditions, cancellation, state transitions, and outcomes users can observe.
Infrastructure and migration changes also need automated validation and, where
appropriate, a tested dry run or rollback. Documentation-only changes need link,
structure, and factual review; avoid artificial tests for prose wording.

Run:

```sh
npm test
npm run test:coverage
npm run typecheck
npm run lint
npm run build
```

The current tests use Node's test runner. Await top-level `test()` calls so their
returned promises are handled explicitly; keep the existing sequential tests
within each file. The TSX rendering test loads the real component with Vite,
which also exposes Node test types to whole-repository type-aware lint.
`test:coverage` measures **loaded**
`lib/*.ts` and `hooks/*.ts` modules and is a temporary partial report, not
repository-wide coverage.
The baseline has nine audio/math/WAV tests, roadmap integrity tests, and tests
for the client-state and viewport stores. The 24 lint errors found by the audit
are fixed; uncovered UI/integration paths and unverified browser behavior are
still tracked in P00. Do not describe this as release-certified.

The target is **100% meaningful statements, branches, functions, and lines** for
all first-party production code, including initially unimported files. Add a
proper include-all instrumenter and component/browser suites under P00. Do not
lower thresholds, exclude changed files, or suppress lint to obtain a green badge.
If a path genuinely cannot be tested, explain the technical reason, mitigation,
owner, and follow-up issue; the reviewer decides whether it blocks publication.
Coverage numbers do not replace input diversity, assertions, mutation testing of
critical algorithms, actual listening, or subject-matter review.

The Baseline checks workflow runs lint as a required step. It is sufficient to
reproduce the audit baseline, not to approve production code or close G. Make
the complete coverage/browser checks mandatory once P00 is resolved. New changes
must not add lint errors, untested behavior, or unexplained failures.

## Educational contributions

Each topic needs all four layers and the complete G checklist from ROADMAP.md.
Attach evidence for learning objectives, sources, exercise feedback, EN/RU parity,
lab presets, encyclopedia cross-links, accessibility, tests, and rights. A shared
experiment or concept may support multiple topics, but each topic must demonstrate
its own learning outcome. Do not close an ID merely because a page exists.

Source records must include author, title, edition/year, publisher/institution,
DOI/ISBN/URL, exact page/section/timecode, access date, context, and reviewer. Read
the material itself. Distinguish physical models, perception, stylistic rules,
historical evidence, and contested interpretations. Unavailable sources stay
pending. Cultural or clinical claims require appropriate expert review. Record
corrections transparently and reopen a completed topic if evidence changes.

For practical composition, analysis, history, and cultural discussion, support
multiple justified answers with transparent rubrics. Automated checks should
explain the selected model's constraints; they must not label a tradition or
creative choice universally wrong. Do not claim special health effects of tuning.

## Licensing and provenance

By submitting a contribution, you confirm you have the right to contribute it
under the applicable repository license: Apache-2.0 for original code and CC BY
4.0 for original teaching content. Copyright remains with contributors. Identify
any exceptions explicitly before inclusion; no blanket transfer of ownership is
required. See [CONTENT-LICENSE.md](CONTENT-LICENSE.md) and
[THIRD-PARTY-NOTICES.md](THIRD-PARTY-NOTICES.md).

Track rights separately for composition, score edition, recording, performance,
images, fonts, text, and datasets. An old composition or an educational purpose
does not grant recording rights. Preserve MIT notices on scaffold UI. CC BY-SA
adaptations require their applicable license and attribution, not relabeling as
our original CC BY text. Do not copy chapters, unlicensed scores, or audio files.

Follow the [UI provenance boundary](docs/ui-provenance.md) when changing a copied
component. Update its inventory classification and modification notice in the
same PR. The entire modified copy belongs in the future full maintained-code
coverage report, even when currently unused. The catalog is retained; the
documented `ul`/`ol` list-role allowance preserves WebKit list semantics while
keeping the lint rule required. It is not permission to disable other rules.

Paid hosting, synchronization, support, or optional future services can coexist
with the open licenses; existing recipients retain their licensed rights. Pricing,
payments, and any separately licensed future components require an explicit
product decision before implementation.

## Pull request evidence

Use the PR template. State the observable outcome, roadmap IDs, scope, tests run,
coverage denominator/gaps, documentation, source/rights changes, and remaining
risks. Only tick checkboxes that are true. Link the accepted PR/commit in the
roadmap when closing a topic. Public deployment is separately recorded by the
owner with the version, URL, date, and rollback evidence.

Private VPS staging is authorized separately from public launch. Follow
[private staging](docs/private-staging.md); keep it reachable only through SSH.
ROADMAP P10 records the Germany/EU compliance and rights gate. Never include
server inventories, personal operator/provider data or credentials in commits,
PR bodies, or CI artifacts. Public launch needs the owner's explicit approval
after the applicable release gates are closed.
