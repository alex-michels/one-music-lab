# EU/Germany prelaunch review

Reviewed 2026-09-06 for **a German operator**, as confirmed by the owner. Current
scope: private prototype, browser synthesis, EN/RU lessons, no application
accounts, payments, uploads or user publication. This is a preliminary source
and implementation review, not legal clearance. **Public launch remains blocked.**
Completion is tracked only in ROADMAP P10; this file records evidence and decisions.
Operator identity, contracts, provider records and server inventories stay local.

## What the code currently does

| Surface | Evidence | Consequence before public launch |
|---|---|---|
| Language | `app/page.tsx` reads/writes `oml-language` in localStorage, including default English on mount; no expiry | Decide whether persistence is necessary, document it and offer clearing; avoid unconditional storage that has no user-requested purpose. |
| Sidebar | `components/ui/sidebar.tsx` writes `sidebar_state` on desktop state changes, with a seven-day max-age | Include in storage inventory; verify reachability and need. It is not correct to call this app cookie-free. |
| Exercises and audio | App state, Web Audio and generated WAV download; no first-party upload endpoint found | Verify these remain local in a real browser, including cancellation, download and error paths. |
| Fonts | Old `next/font/google` could emit Google CDN URLs when build fetch failed; this PR uses device fonts | HTML and static asset checks reject the known CDN fallback. A full browser network trace is still required. No font binary is redistributed by this change. |
| Other network activity | No analytics, payment SDK, iframe embed or first-party API fetch found in app/lib/learning components; source links navigate externally | This is source inspection, not proof of zero network traffic. Inspect bundled code and all interaction paths before release. |
| WebMCP | `lib/webmcp.ts` exposes optional browser integration | Document user-visible capabilities and inspect the supported browser path; do not infer a remote data flow without evidence. |
| Server traffic | HTTP necessarily reaches a host; private Caddy has no access-log directive | Hosting/SSH/system/provider logs are distinct from app analytics. Determine actual processing and retention privately; do not promise “no personal data”. |

## Applicable review areas

**Provider identity.** Check [DDG §5](https://www.gesetze-im-internet.de/ddg/__5.html)
against the actual legal operator and offering. Prepare correct name, service
address, electronic contact and any applicable company/tax/professional details.
Also assess [MStV §18](https://www.die-medienanstalten.de/fileadmin/user_upload/Rechtsgrundlagen/Gesetze_Staatsvertraege/Medienstaatsvertrag_MStV.pdf):
its provider-identification rule for non-personal/non-family telemedia is not
limited to a paid checkout; editorial offerings can require a named responsible
person. Do not assume “free/open source” removes these obligations. Final
Impressum details need owner confirmation and a delivery method that does not
put personal records in the public repository.

**Data protection.** Prepare a real processing map and an understandable privacy
notice: controller/contact, purposes and legal bases, recipients, retention,
rights, complaint route and any international transfers. Review the host's
processor role/contract and subprocessors, minimal logs and deletion, access
controls, incident handling and requests. Do not claim the VPS's location alone
settles transfers or compliance. Basis: [GDPR](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng),
Articles 5–6, 12–13, 25, 28, 32–34 and Chapter V. Future child accounts require
an age/consent assessment; Article 8 is conditional, not a blanket age ban on
learning music. No universal mandatory retention period is asserted here.

**Cookies and device storage.** [TDDDG §25](https://www.gesetze-im-internet.de/ttdsg/__25.html)
covers storage/access on terminal equipment, not only tracking cookies. Consent
is the starting rule, with narrow exceptions including what is strictly needed
for an explicitly requested service. Assess each current item; calling it
“functional” is not enough. A banner is not automatically necessary for this
scope: first remove unnecessary storage and document any exception. If optional
tracking/embeds are introduced, require an appropriate consent flow before use.

**Accessibility.** Assess the concrete offering under [BFSG §1](https://www.gesetze-im-internet.de/bfsg/__1.html)
(including future e-commerce/e-books), rather than treating every educational
website as automatically in scope. [BFSG §3(3)](https://www.gesetze-im-internet.de/bfsg/__3.html)
exempts qualifying microenterprises providing services; eligibility must be
documented, not presumed. Keyboard control, focus, screen-reader labels, 200%
zoom, contrast and accessible alternatives to hearing tests remain product
release criteria regardless of exemptions. The 24 lint errors found by the
audit, including accessibility rules, are fixed; a passing linter is not a
passed accessibility audit.

**Future commercial and platform features.** Before checkout/subscriptions,
review consumer information, withdrawal/cancellation, pricing, digital-service
terms, VAT and dispute-resolution duties against the chosen business model.
Do not copy an obsolete ODR link: the Commission confirms the platform
[closed on 20 July 2025](https://consumer-redress.ec.europa.eu/site-relocation_en).
Before accounts, community uploads, recordings or AI services, reassess the
new data flows, age groups, rights and applicable platform/AI obligations.
These are change triggers, not findings that every such law already applies.

## Rights review of the current material

Source accuracy and permission to reuse are separate decisions. A citation,
an AI-generated draft or a license header does not establish provenance.
The declared Apache-2.0/CC BY 4.0 split remains; clearance for individual items
is pending. Keep asset-level author/title/source/version, exact passage,
creation or permission evidence, license, attribution, modifications, reviewer
and decision. A missing record blocks that item's public inclusion.

| Material | Current inventory | Evidence still needed |
|---|---|---|
| First-party code | `app`, authored `lib`, learning UI and tests; Apache-2.0 | Verify contribution provenance and distinguish copied scaffold from authored code. |
| Six lesson pairs | `lib/learning.ts`: pitch, tuning, intervals, timbre, scales, chords; links to UNSW, Puget Sound and Open Music Theory | Exact source passages, independent wording or explicit adaptation, factual and EN/RU review for each lesson. A URL alone is insufficient. |
| Glossary/exercises | Same learning module and `components/learning.tsx` | Item-level provenance, independent examples, accurate feedback and translation review. |
| Oscillator/WAV examples | Browser-generated tones, intervals/scales/chords; no bundled third-party recordings found | Preserve this distinction; reassess any future melody, score, sample or performance. |
| UI/icons/favicon | MIT scaffold notice is present; Lucide dependency and `public/favicon.svg` | Verify source/version for copied code and favicon; include applicable license text in the distributed site. |
| Dependencies | Lockfile-based CycloneDX inventory can be generated with `npm sbom --package-lock-only --sbom-format=cyclonedx` | Review actual shipped browser bundle separately from build tools and optional platform packages; inspect license expressions, copyleft and missing notices. An SBOM is not approval. |
| Fonts | System fonts selected by CSS; no shipped font files | Any future bundled font needs a verified license and retained notices. |
| Original topic inventory | User's book/Claude-derived topic list informs ROADMAP | It does not license book chapters, illustrations, recordings or extracted musical examples. |

The complete lockfile inventory includes MPL/LGPL metadata as well as permissive
licenses. This does not show those packages are shipped to browsers. Do not
declare either incompatibility or clearance from package names/license labels
alone; record distribution boundaries and actual license obligations.

[CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) allows commercial reuse
subject to its terms, including attribution and change notices. An adaptation
of [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/) retains applicable
ShareAlike conditions; it must not be labelled as original CC BY. Material marked
noncommercial, no-derivatives or all-rights-reserved needs its own decision before
inclusion. Put attribution where recipients can find it in the deployed site,
not only in GitHub.

[UrhG §51](https://www.gesetze-im-internet.de/urhg/__51.html) requires a justified
quotation purpose and extent, not a universal word/seconds allowance.
[UrhG §60a and §§70–85](https://www.gesetze-im-internet.de/urhg/BJNR012730965.html)
separately address bounded educational uses and edition/performance/recording
rights. An open public website cannot simply apply classroom exceptions to all
visitors. An old composition does not clear a modern edition or recording.
The [general 70-year term after the author's death](https://www.gesetze-im-internet.de/urhg/__64.html)
is only one part of an item-specific rights analysis. Musical quotations and
uncertain adaptations should receive qualified review before publication.

**Brand.** A purchased domain does not clear One Music Lab as a trade name or
mark. Search relevant registered and unregistered rights, including similar
names for music education/software services, before promotion. The
[DPMA's own research guidance](https://www.dpma.de/marken/markenrecherche/index.html)
explains why identity searches alone are insufficient and why EU/international
rights also matter. This review has not completed a trademark clearance search.

## Release decision

Next work is concrete: resolve storage and browser-network findings; prepare
accurate legal information from privately confirmed operator/provider facts;
complete item-level rights and bundled notices; resolve P00 and assess BFSG;
review the intended first release and only then request public-launch approval.
Uncertain legal classification or disputed rights should go to a qualified
German adviser with the prepared evidence, not be silently marked complete.
