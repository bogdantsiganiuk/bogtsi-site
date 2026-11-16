# All-live-app marketing parity and private analytics Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox syntax for tracking.

**Goal:** Install the owner's real Cloudflare beacon and complete screenshot-led homepage introductions for the six remaining released apps, linking their existing full marketing pages without creating or revising companion resources.

**Architecture:** Keep the dependency-free static builder and approved editorial/iPhone treatment. Add one literal provider snippet to the shared marketing/support page template; the existing legal-page copy boundary stays byte-preserving. Render all six existing catalog products with the existing complete-screenshot scene component, product headline/description and direct product CTA; no new data model, routes or assets.

**Tech Stack:** Node ES modules, HTML/CSS, node:test, GitHub Pages.

## Global Constraints

- Work only in C:/Users/bogda/.bogtsi-marketing/site-20261115 on feat/all-live-marketing-analytics-2026-11-16, BASE ff83da43ab52eb12777480e4ce500b9dfb030b69. Root Repos/bogtsi-site is unrelated Wageproof WIP.
- User supplied the real Cloudflare site snippet and requested all other live apps. Existing visual direction is approved; reuse it, no new visual approval loop.
- Eleven registered IDs returned public US Apple listings on2026-11-16. Authenticated ASC inventory has18apps; the seven additional IDs have only PREPARE_FOR_SUBMISSION versions except Chervil WAITING_FOR_REVIEW. Quietkeep has no ASC record. Thus no newly live app is missing a product route.
- Existing full pages for all11 stay canonical. Remaining six: noctura -> /halcyon/; posture-coach -> /posture-coach/; ascend -> /ascend/; wageproof -> /wageproof/; reverie -> /duskmere/; maelzel -> /maelzel/.
- Companion resources were explicitly called bad and deferred. Do not add, revise or delete the five existing resource bodies, their metadata or links; do not create resourceRoute requirements for the six catalog apps.
- Preserve featured Voxwarm/Penumbra and the existing three campaign cards, all11 original SVG bytes, all22 approved PNG bytes, full native screenshot pixels/aspect/frame component, native app/listing source files and every existing free/paid/privacy/safety boundary.
- Preserve60app-scoped legal pages byte-for-byte,19support identities/WageproofSpanish, legacy Noctura redirects, identity/store IDs, aliases, allowlist119files, strict asset/credential/realpath guards. No new exported API.
- Owner explicitly prohibits all browser launching/page opening, including headless QA. Use approved visual evidence/static checks/direct images, actual build and local/live HTTP; disclose no fresh visual/browser/print or dashboard-ingestion proof.
- No native builds/captures/EAS/AppStore writes, DNS changes, service-account creation, paid marketing or outreach.
- Agents skip tests/builds/linters/formatters midflight. Parent runs integrated checks once. No permanent wiring/source-text/copy tests; use private failing-before/passing-after output smoke for template changes. Keep all existing behavioral/security tests unless an obsolete incidental assertion needs deletion.

## Task 1: Implement analytics and six-app visual catalog parity

**Files:**
- Modify templates/page.html (before closing body)
- Modify templates/site-privacy.html
- Modify scripts/marketing-site.mjs (homepage catalog and website policy description only)
- Modify marketing/assets/site.css (catalog layout/card scopes and responsive rules only)
- Modify templates/index.html (catalog intro only if needed for truthful navigation)
- Modify README.md (actual analytics scope and screenshot-led catalog documentation)
- Test test/marketing-site.test.mjs and test/site.test.mjs using the existing npm test command; do not invent a test path if the second differs, inspect known test directory first.

**Interfaces:** existing buildMarketing({rootDir,outDir,apps,marketing}) and marketingFiles({apps,marketing}) remain unchanged. Reuse private scene(product,true) with no phone geometry changes. Catalog selection remains the complement of featured and campaigns; no list duplication or new promotion configuration.

- [ ] Parent captures hashes of all approved assets, five resource source bodies and product JSONs before implementation, and runs a private output smoke against current built _site showing two specific missing behaviors: no beacon, and no screenshot-backed catalog cards. Existing npm test baseline passed27/27.
- [ ] Add exactly this literal before </body> in templates/page.html, once:

```html
<!-- Cloudflare Web Analytics --><script type='module' src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "b315f78a92b84683a6fe606a1ef1a05a"}'></script><!-- End Cloudflare Web Analytics -->
```

- [ ] Keep the beacon out of fetched legal HTML and legacy redirects. The shared page template covers homepage,11products,5resources,resource directory,support and website privacy (20pages). No custom events, visible counter, tracking pixels, cookies, fingerprinting, extra JS settings, token environment abstraction or fabricated requests to /cdn-cgi/rum. type=module is the provider's current documented embed; no SRI pin because vendor does not support safe version-pinning.
- [ ] Replace website privacy's no-analytics statement and metadata with a truthful description of aggregate Cloudflare page views/visits/performance/referrers and device/browser/country summaries, no cookies/browser storage/fingerprinting or exact unique-person claim, manual embed scope, GitHub hosting, provider privacy/docs links, and app policies remaining separate. No medical/recording/reflection/upload fields or session replay/account/ads are introduced. Resource answers stay on paper/own notes; ordinary hosting and analytics network requests do occur. Updated date November16,2026. Retain support email and legacy policy explanation.
- [ ] Replace the existing homepage catalog renderer's text-only app-card markup with screenshot-first visual cards that consume existing product data: name/category, cardHeadline, description, scene(product,true), Meet <app> link to entry.route, optional existing tagline. Keep grouping/unique headings and existing partition:2featured+3campaign+6catalog=11, each shown exactly once. No companion CTA for these six. No new product claims, card copy schema or page routes. Preserve the existing complete-image/source-detail accessibility information.
- [ ] Use the existing editorial and campaign-card scale as the visual baseline. Catalog group sections need full-width semantic headings with responsive card grids; three desktop columns/two intermediate/one narrow is sufficient. Scope new styles to catalog cards/groups so product hero/featured/campaign/resource/phone geometry stays unchanged. min-width:0, minmax(0,1fr), max-width image constraints, wrap text; no screenshot crops/negative image offsets, alternative mockup style or six repeated giant feature panels. All six scene images lazy-load with native dimensions.
- [ ] Update README: analytics now installed, public token intentionally public, exact20 generated-page scope/excluded60legal+redirects, provider setup/dashboard delay/adblock and approximate counts/no custom events or query-string campaign attribution. Remove obsolete no-analytics/precondition prose without changing app privacy claims. Explain all11 screenshot-led homepage coverage and existing full product URLs, no new/revised resources. Do not claim real visitor ingestion verified.
- [ ] Self-review only owned edits, write private Task1 report including changed paths, actual implementation, constraints, unperformed browser/ingestion checks and concerns. Do not commit until parent integrated verification; parent then authorizes a scoped commit of these six public files. Parent owns plan/ledger/evidence.

## Task 2: Verify, review and release

**Files:** private workspace smoke/evidence; existing acquisition ledger outside site repository. No app content/assets/resource edits.

- [ ] Parent runs npm test && npm run build && npm run verify, then a throwaway Node HTTP smoke over actual _site. Assert exact20beacons with supplied token/module/src, none in60legal+2redirects;11unique complete screenshot scenes on home, six catalog product links/headlines, all11single-h1productpages/store/schema/source screenshot/OG/secondary-art;5resources and33asset/productdata hashes unchanged;60legal byte copies and19support identities unchanged. Validate canonical links, sitemap/allowlist and no private/unresolved placeholders. Do not POST synthetic analytics or launch browsers.
- [ ] Commit exactownedfiles after green output; generate committed scoped review package and dispatch fresh reviewer for Task1 spec/quality and final whole-branch readiness. Fix substantive findings through implementer with covering checks/scoped re-review.
- [ ] Merge reviewed branch to current origin/main without force, push, dispatch sync-legal.yml manually (push alone does not deploy), watch that exact run once and confirm success.
- [ ] Exercise actual live homepage/all11productpages/5resources/directory/support/siteprivacy over HTTP, verify one correct beacon per generated page,11home screenshot scenes, all33asset hashes and direct links/schema; GET provider script200 without executing it or sending fake analytics. Save real CI timestamps/commit and first complete live proof time. Dashboard ingestion remains unverified because no owner-dashboard access/browser permission.
- [ ] Record separate website marketing-plus-analytics acquisition intervention; installation is not native keyword activation and does not start/restart the56-day ASO clock. Archive build/live/review/roster evidence. Update site/portfolio memory topic+index together. Follow default reviewed main merge/push without another finishing menu.
