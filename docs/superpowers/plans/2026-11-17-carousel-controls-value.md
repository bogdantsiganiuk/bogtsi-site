# Carousel controls, value-focused screenshots and alignment Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox syntax for tracking.

**Goal:** Make the carousel obviously movable with working arrows and slow controllable motion, align every app's phone despite wrapped copy, use stronger value-selling images including Dahlia garden progress, and remove unsolicited illustration-provenance labels.

**Architecture:** Keep native scrolling and real carousel->highlight->product anchors. Add one small homepage-only ES module for controls/motion, a shared CSS subgrid for cross-card alignment, and exact-copy replacements for four secondary screenshots. Preserve the existing eleven-app ordering, four image roles, full iPhone framing and all highlight/product screenshots.

**Tech Stack:** Existing dependency-free NodeESmodules/HTML/CSS/node:test/GitHubPages; no framework or package dependency. Test real controller with deterministic environment fixtures, not a duplicate implementation.

## Global Constraints

- Only C:/Users/bogda/.bogtsi-marketing/site-20261115, feat/carousel-controls-value-2026-11-17, BASEba9d984521da2fd408c71333ecac2ddb7c5549b5. Root Repos/bogtsi-site is unrelated user WIP.
- User explicitly requests arrows/slow automatic scrolling; this supersedes the previous CSS-only/no-autoplay choice. Keep app order/all11fullhighlights/two different genuine captures perapp. No extra approval loop for these explicit changes.
- User-reported Ascend/Maelzel misalignment is ground truth. Source root cause: carousel-track is flex and each card is an independent flex column; its figure follows its own variable-height carousel-copy. Equal overall card heights do not share header tracks. Fix shared cross-card rows, not per-app margins, truncation or shorter category copy. Do not rerun a browser to confirm.
- No browser opening/headlessQA per C:/Users/bogda/.claude/memory/decision-pages.md. Node runtime, actual build/HTTP, direct image inspection and static layout review only. No fresh rendered-pixel alignment claim. No nativecapture/build/EAS/AppStorewrites/DNS/outreach/spend.
- New owner interjection: remove “Original conceptual illustration · not app UI” everywhere; avoid unsolicited visible provenance/editorial caveats and check first if proposing similar labels. Remove that figcaption plus the analogous generic phone-frame provenance note; leave app-specific legal/medical/privacy limitations intact. Provenance/version/demo-source records stay private. Do not add new generic disclaimers.
- Five companion resources and registry metadata/links/bodies are deferred and unchanged. Original11SVG/11devicePNG/11primarycapturePNG unchanged. Only four specified secondary PNGs change; all44publicimages still comprise genuine full UI/approved art, no crops/posters/fabrication. Highlights/product/OG remain unchanged.
- Keep exact20Cloudflarebeacons,60app-scopedlegalbytecopies,19support/WageproofSpanish,Nocturaredirects,canonicalaliases/StoreIDs/order/security/strictSVGPNG/realpath/credential guards. No analytics events/storage/extra collection. UI controller is not analytics.
- New exact public asset marketing/assets/carousel.mjs only. Register it explicitly outside VISUAL_FILES (which remains four image roles). New output131files, not a wildcard JS allowance. Load module only on homepage, not sharedpage template or other19generatedpages. Module must be required for a successful real marketing build.
- Asset worker owns eleven productJSONs and four secondary PNG replacements. Integration owner owns manifest/scripts/CSS/template/tests/README and label removal. No overlap. Agents skip checks/tests/build/lint/formatters; parent runs once after integration. No unscoped staging/commits.

## Task 1: Value-led screenshot refinement

**Files:** four marketing/assets/{dahlia,voxwarm,ascend,brightwater}-secondary-capture.png; all11marketing/apps/*.json secondaryCapture caption fields, plus alt/dims for four replacements only.

**Input:** .superpowers/sdd/2026-11-17-carousel-controls-value/image-selections.json, replacement-facts.json and baseline.json. Parent directly inspected four candidate screens and audited all11 choices. Sources and private provenance do not enter public metadata.

- [ ] Copy specified full PNG source bytes exactly: Dahlia3-garden, Voxwarmsummary, Ascend1Character, Brightwater8maintenance. No image processing. Same public filenames, native dimensions828x1792 exceptAscend1290x2796; frame profiles unchanged.
- [ ] Update only affected secondaryCapture alt/dimensions and all11 provided natural value captions. Keep every other product field/role/feature/purchase/privacy/sourceVersion/reviewedAt unchanged. Do not add “not app UI”, “not a testimonial”, “not a device photograph” or other unsolicited provenance labels to marketing copy.
- [ ] Parent proves exact source hashes, dimensions, decoded RGBA differences against each unchanged primary,40unchangedotherimagehashes and scoped metadata edits. Write Task1report, then commit only15ownedfiles when parent authorizes. Fresh data/spec/quality review before release.

## Task 2: Working controls, slow motion, shared alignment and label removal

**Files:** create marketing/assets/carousel.mjs and test/carousel.test.mjs (plus minimal test helper if genuinely useful); modify marketing.json, scripts/marketing-site.mjs, templates/index.html, marketing/assets/site.css, README.md. Existing behavioral/security tests only if contract fixtures need the new registered module. Do not change templates/page.html/siteprivacy/resource bodies.

**Runtime interface:** export initCarousel(root) from the actual client module. Use root.ownerDocument/defaultView for platform APIs so Node fixtures can provide native-like events/layout/RAF. Keep browser auto-binding small and safe when imported in Node; no test-only production branches, framework or unrelated abstraction. Return cleanup if listeners/observers need lifecycle disposal. No runtime dependency on tests/private workspace.

### Test-first

- [ ] Stage A: author deterministic tests before production. Use a minimal EventTarget-based DOM/layout fixture and fake RAF clock; execute actual controller, not expected-value echoes. Tests cover: automatic scroll increases scrollLeft at slow speed over simulated time; explicit Pause/Play; previous/next real card destinations and bounds; hover stop/resume; focus/manual/touch persistent pause until explicit Play; reduced-motion and page visibility/offscreen suppression; no accumulated jump after pause; end-of-track stops; cleanup cancels work; resize uses current geometry. Include pointerdown->focusin->click on Pause so focus handling cannot accidentally turn a Pause click into Play.
- [ ] Parent runs targeted RED while new module is absent. Prefer an explicit assertion of missing initCarousel after controlled failed import, not an unhandled module-import crash. Stop after test authoring and wait for parent's Stage B message. No production placeholder module.

### Runtime and controls

- [ ] Stage B after parent RED: implement actual initCarousel with native previous/next buttons, rotation button first in tab order, ARIA labels/controls target viewport, no focus moves on arrowclick, no card cloning/ID duplication, no interception of card anchors or normal wheel/touch scrolling. Buttons start hidden and are revealed only once initialized; [hidden] must not be overridden by author display rules. Without JS the native carousel/anchors still work.
- [ ] Obvious side arrows on desktop,44pxtargets, outside screenshot area. On narrow screens controls may sit in a clear row below the full-width viewport so sidebuttons do not reduce the viewport below a whole card. Keep visible swipe/scroll instructions and scrollbar. Bounds disable the unavailable arrow but retain visibility.
- [ ] Default automatic movement18CSSpx/second using RAF timestamps, not a card jump every few seconds. Disable scroll-snap and smooth-scroll behavior while controller mode is active so snap cannot fight continuous small movements. Restore native snap for permanent manual mode; temporary hover/visibility pauses need not snap/jump. Never continuously schedule RAF while paused/hidden/offscreen.
- [ ] Pause on hover; focus entering carousel stops and requires explicit Play to restart; native pointer/touch/wheel/manual arrow action also stops until Play. Explicit Play must work while its button retains focus. Correctly handle pointer focus ordering on the rotation button. Page hidden or carousel offscreen cancels movement; reset timestamps so returning cannot jump by elapsed background time. Honor prefers-reduced-motion at startup and changes: no autoplay/smooth movement while requested. No event telemetry.
- [ ] Stop at track end, no abrupt automatic wrap/cloned slides. Explicit Play at end may reset to the beginning and start a fresh pass. Clamp every position, derive arrow positions from current card geometry relative to the first card (avoid moving only8px to initial track padding), update bounds on scroll/resize. No new validation/retry/telemetry features beyond this contract.
- [ ] Follow WAI APG carousel principles https://www.w3.org/WAI/ARIA/apg/patterns/carousel/: nativebuttons, action-name Pause/Play (no conflicting aria-pressed), pause accessible before content, hover/focus control, no compulsory announcements while auto-moving.

### Layout, markup and publication

- [ ] Fix headers and phones through shared CSS grid/subgrid rows across all cards: header, phone-stage, caption, action. Nested item/card/figure may inherit shared row tracks; no fixed header pixel height or title clamping. Wrapping Ascend/Maelzel text enlarges the common row instead of pushing only its own phone down. Preserve native image aspect and approved phone geometry; no screenshot cropping or per-app CSS patches. Static source review must verify the shared-row structure and mobile sizing; real browser geometry remains unverified under owner ban.
- [ ] Add hooks/controls/homepage module script to index.html while preserving all11card anchors/11highlight links/uniqueIDs/order. Add exact carousel.mjs to allowedAssets/manifest, require it in buildMarketing, copy through existing explicit asset builder. Do not add JS as an image role. Reject arbitrary JS asset paths, preserve image validators.
- [ ] Remove art helper's generic figcaption everywhere. Remove scene helper's generic frame-note prose everywhere and dead style rules for those labels. Keep the illustrations, useful image captions, source image links/default product semantics, app-specific limitations and proper alt text. No broad legal-copy rewrite or new explanatory labels.
- [ ] Update README: new homepage-only control module,18px/s/pause/reduced-motion/manual policy, shared-row alignment,131fileallowlist, value-shot changes, no new analytics/20beacon scope. Do not claim browser-tested alignment or provider ingestion.
- [ ] Report changed paths/actual behavior/static limits. Parent full combined tests/build/output smoke then authorizes scoped commit. No checks or commits mid-flight.

## Task 3: Verification, review and publish

- [ ] Parent baseline29tests passed before edits. After proper controller RED and both slices ready run npm test && npm run build && npm run verify. Expected131outputs. Execute actual controller via Node event/clock fixtures; keep tests about movement/transitions/errors, not wiring/copy text. Private real NodeHTTP smoke verifies arrows/Pause/module path on home only,22screens11distinctpairs,all11anchors/products/store/schema/OG,44imagehashes,20beacons,5unchangedresources,60legalbytecopies/19support/redirects. Label removal checked privately, not a permanent wording test.
- [ ] Fresh data Task1review and Task2spec/quality+finalwholebranch review against committed packages/evidence. Address substantive findings through implementer, covering checks and scoped rereview.
- [ ] Safely fastforward/push reviewedbranch to origin/main, manual sync-legal.yml dispatch (pushalone doesnotpublish), watch exact run once, require success.
- [ ] LiveHTTP confirms all generated routes/module/image bytes/nav/beacons,131filepublication/20beacon scope. No browser launch or synthetic analytics. Save exact commit/run/timestamps/first full live proof, separate acquisition intervention, paired memory updates (including no unsolicited visible labels), archive evidence and remove owned scratch after proof.
