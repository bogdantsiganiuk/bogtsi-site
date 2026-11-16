# Approved iPhone Marketing Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans. Execute all reachable work continuously. Parent owns tests/build/smoke/deployment; children skip build/lint/tests/formatters mid-flight.

**Goal:** Publish the approved complete-screen iPhone presentation and retained original artwork for all11 released apps, then publish the Dahlia/Shiver/Brightwater campaigns and practical resources.

**Architecture:** Existing dependency-free static generator remains the publication owner. Replace overloaded `screenshots` records with three explicit `visuals` roles, reuse the exact approved CSS/HTML iPhone component for visible app screens, and publish approved standalone PNG renders for social metadata/full-render links. Original SVGs support how-it-works/resource sections. Two separately verified deployments preserve the requested visual-first order.

**Tech Stack:** Node ES modules, static HTML/CSS, PNG/SVG assets, node:test, GitHub Pages.

## Global Constraints

- Genuine approval: `Downloads/bogtsi-iphone-marketing-2026-11-16.json`, saved2026-11-16T15:53:16.304Z; `iphone-marketing-layout=approve`, note/global_note empty.
- COMPLETE genuine source screenshots inside the approved original illustrative iPhone hardware. No UI crops, cover fitting, splicing, painted OS/data or finished App Store poster reuse.
- All11 original SVG illustrations remain unchanged and secondary; no art replacing app screens or unused art stash.
- Preserve approved editorial layout/copy/typography/palette, all product identities, aliases, store IDs, free/paid/privacy/medical/legal limits, 19-app support directory, 60 staged legal files, Wageproof Spanish routes and Noctura bare redirects.
- All11 visuals MUST be confirmed live BEFORE PhaseB implementation/publication.
- No browser/page opening, including QA, under the owner's explicit preference in `C:/Users/bogda/.claude/memory/decision-pages.md`. Verify with existing approved visual evidence, direct image inspection, static artifact checks and actual build/output/live HTTP probes; report this visual-verification limit.
- No native app builds/releases/capture/EAS jobs, App Store edits, ad spend or outreach.
- Hidden website analytics was additionally requested. Cloudflare is selected as the conservative free/privacy-first option, but activation requires its real public site snippet/token; no credentials or existing beacon were found. Do not ship placeholder tracking or change privacy to claim active analytics before a real token is supplied. Continue both approved rollouts while this external prerequisite is pending.
- Maintain explicit publication allowlists, actual image validation, credential guards, source realpath boundaries, canonical URLs/SEO/JSON-LD and no private artifact publication.
- Public exported helper signatures stay `marketingFiles({apps,marketing})`, `buildMarketing({rootDir,outDir,apps,marketing})`, `expectedFiles(apps,pages,marketing)`, `verify({outDir,apps,pages,marketing})`; no compatibility aliases.
- No permanent wiring/source-text/wording/copy/default tests. Update real contract tests; new SVG security boundary coverage is justified. Delete incidental wording tests rather than re-pin them.
- Every child has exclusive file ownership. Shared contract below is fixed before dispatch. Stage/commit only owned paths; never `git add .` across concurrent work.

## Fixed production visual contract

Replace `screenshots` entirely in every `marketing/apps/<registry-slug>.json`:

```json
{"visuals":{
  "device":{"src":"marketing/assets/voxwarm-device.png","width":1120,"height":1822,"alt":"Complete Voxwarm app screen in an illustrative iPhone mockup"},
  "capture":{"src":"marketing/assets/voxwarm-capture.png","width":828,"height":1792,"alt":"Complete actual app screenshot","caption":"Actual app UI — demonstration pitch, not a measured user result.","frameProfile":"notch"},
  "illustration":{"src":"marketing/assets/voxwarm-art.svg","width":1000,"height":640,"alt":"Original conceptual supporting illustration for Voxwarm, not an app screen"}
}}
```

Use actual per-app dimensions/alts/captions from approved input manifest, not example wording above. Ascend capture1290×2796 and device1120×1824; other captures828×1792 and device1120×1822. `frameProfile` is `island` for Ascend and `notch` for other approved captures, explicitly stored in content, not inferred as capture-device proof.

- `capture`: the original PNG displayed by the exact approved device component and linked at full size; used for `SoftwareApplication.screenshot`.
- `device`: byte-identical approved transparent standalone phone PNG, used for product OG/social image and optional full-render link. It is not wrapped in another phone, stretched, or naively scaled into a smaller primary representation.
- `illustration`: byte-identical original static SVG, used beside how-it-works and in relevant resource headers/cards.
- Exactly flat role filenames `<registry>-device.png`, `<registry>-capture.png`, `<registry>-art.svg`; source identities use registry slugs (`umbra`, `noctura`, `reverie`), while public aliases remain unchanged.
- Three roles are required, positive native integer dimensions and nonempty alt; capture caption/profile required. Reject legacy `screenshots` rather than keep a shim.
- Manifest assets become CSS plus33 role assets; obsolete13 numbered poster copies and references disappear. Media entries must belong to the declared product/role and be actually referenced.

## Task 1: Asset and product-data migration

**Owner files:** `marketing.json`, all11 `marketing/apps/*.json`, exactly33 new role images in `marketing/assets/`, and removal of13 obsolete numbered PNGs. Do NOT edit `site.css`, scripts, tests, templates or README.

**Consumes:** approved immutable input manifest copied into this plan's workspace (`asset-inputs.json`) containing exact source paths, destination metadata and SHA-256 for each role. Originals are the approved iPhone revision PNGs/full captures and original art; no new capture or image processing.

**Produces:** the fixed production contract above, exact registered role images and no old poster fields/files. No PhaseB campaign/resource changes yet.

- [ ] Copy only the33 individually enumerated image files; verify each source/destination hash against the input record. Preserve native app repositories.
- [ ] Replace only the old `screenshots` block in each product JSON with `visuals`. Leave all other copy/version/review/resource fields unchanged.
- [ ] Replace the numbered PNG list in `marketing.json.assets` with CSS and the33 exact new paths; preserve featured/products/resources.
- [ ] Delete only the13 now-obsolete website poster PNGs. Do not delete source app store assets.
- [ ] Self-review metadata/identity/hash completeness without running checks. Commit only the exact owned JSON/image paths and write the task report with commit/base and concerns.

## Task 2: Renderer, strict asset admission, contract tests and documentation

**Owner files:** `scripts/marketing-site.mjs`, new `scripts/marketing-assets.mjs`, `marketing/assets/site.css`, `templates/page.html`, relevant tests under `test/`, and `README.md`. Do NOT edit product data, manifest or image files owned by Task1.

**Consumes:** fixed visual contract, approved `device()` markup and CSS from the iPhone design reference, Task1 role assets. Source reference paths are in the task brief.

**Produces:** clean visual cutover, complete-screen original iPhone rendering, strict PNG/static-SVG validation and preserved metadata/publication boundaries. New asset helper interface:

```js
export const VISUAL_FILES = { device: 'device.png', capture: 'capture.png', illustration: 'art.svg' };
export function validateVisualAsset(bytes, visual, role) { /* return void; throw on invalid/unsafe bytes */ }
```

Use only this small image-validation boundary; no framework, plugin architecture or XML dependency.

- [ ] First update affected visual-boundary tests and add one focused SVG publication-security case: a valid static SVG build must succeed; registered active/event/external/entity SVG variants must be rejected without publishing the unsafe SVG. Keep fixture complete by copying marketing/templates/pages.json. Reuse real-build fixtures, not source-text assertions. Return TESTS READY and pause before production code so parent can observe the intended red failure.
- [ ] Parent runs `node --test --test-name-pattern="SVG" test/marketing-site.test.mjs` after Task1 is ready. Expected initial failure is existing rejection of a safe registered SVG path; this proves missing SVG admission, not a typo/module-import failure. Parent then resumes this owner.
- [ ] Migrate `marketingFiles`/`validateContent` and all callers to the three required roles, exact registered identity filenames, no leftover screenshot alias. Admit only intended PNG/SVG/CSS publication paths; no unused old poster assets.
- [ ] In `marketing-assets.mjs`, retain actual PNG signature/IHDR dimension checks. Admit the approved closed static SVG vocabulary (`svg,title,desc,g,path,circle,ellipse,defs,linearGradient,stop,mask`) and its static geometry/color/ARIA attributes. Require proper SVG namespace/root dimensions/viewBox matching metadata. Reject active/unknown tags/attributes, event handlers, style/script/foreign content, href/external resources, DTD/entities/processing instructions and URL references other than local `url(#id)`. Do not claim general-purpose SVG sanitization; unsupported features fail closed.
- [ ] Reuse the exact approved original device markup and phone-specific CSS, driven by `visuals.capture` dimensions/profile/source and the registry name. Remove private prototype data paths/QA-only attributes. Keep no screenshot transform/filter/negative offset/cover fitting. Preserve main phone visibility and source/caption/frame qualification. Full-source/full-render links resolve to capture/device assets.
- [ ] Replace all homepage/product hero poster positions with the approved iPhone component, lazy-loading only lower-priority images. Remove lower repeated image and reflow useful free/paid text exactly as approved. Add original art to product how-it-works and existing resource card/header placements. Do not add PhaseB row before rollout1.
- [ ] Update product JSON-LD screenshot to canonical raw capture, image to approved device PNG. Supply product OG image metadata through the shared page template; handle the support renderer/other pages with empty optional metadata so no unresolved template token appears. Preserve all existing canonical/store/legal links.
- [ ] Remove obsolete poster styles/references; copy only approved public phone/art/responsive styles, no review banners/export/gallery-only/private-provenance UI or external fonts/scripts.
- [ ] Update existing behavioral tests for new model and retain real Spanish/legal/route/credential guards. Do not re-pin incidental wording. Parent owns integrated tests/build/smoke after all mutations are complete.
- [ ] Update README's architecture, role assets, SVG safety, native-data/frame limitations and update/deployment process. Document the no-browser verification constraint and analytics token prerequisite. No native/app claims changed.
- [ ] Return implementation report; parent verifies, then instructs owner-scoped commit. Parent creates a committed review package; reviewers do not rerun tests.

## Task 3: Campaign and resource packages after rollout1 is live

**Owner files:** `marketing.json`, `marketing/apps/{dahlia,shiver,brightwater}.json`, three new resource fragments, `scripts/marketing-site.mjs`, `templates/index.html`, relevant CSS/tests/README. A fresh integration owner performs this sequentially after rollout1 live proof.

**Interfaces:** use existing resource entry `{app,route,content,title,description,publishedAt}`, product `resourceRoute`, existing resource renderer/print styles and the new visual roles. Existing helper signatures remain unchanged.

- [ ] Add `resources/choose-tonight-date-planner`, `resources/shower-habit-log`, `resources/aquarium-test-maintenance-record`, each with actual publication date and corresponding `marketing/resources/<basename>.html` body fragment.
- [ ] Dahlia: original usable choose-tonight planner, with available time, comfortable budget, place/preferences, one selected activity and invitation. Include a printable blank planning card; no signup, therapy, pairing, booking or relationship guarantee. Use original activity ideas or verified shipped examples only.
- [ ] Shiver: blank record of the user's existing shower choices, completion/skip/rest and notes; no prescribed cold duration/escalation/breath holding, competitive exposure or health protocol. Clear option not to do a cold session; retain suitability/stop boundaries without turning it into clinical advice.
- [ ] Brightwater: blank aquarium water-test/maintenance record with tank/date, parameter, measured value, unit/test kit, task and notes. No universal target ranges, chemical dosing, stocking/animal-health advice, sensors or promised water quality.
- [ ] Use accessible headings, responsive `.writing-space`/tables consistent with existing resources, printable layouts and no h1/script/iframe/form/input/textarea/link in body fragments. Resource utility must be complete without app/install/account/download.
- [ ] Add each product's resource crosslink and a compact three-card homepage campaign row after the primary pair, using the approved full-screen iPhone treatment and real resource links. Do not create duplicate product URLs or three giant feature panels. Include the corresponding original art in resource headers/cards, not replacing app screens.
- [ ] Update resource-directory/homepage count-specific copy to five, sitemap/allowlist/semantic dates and README. Preserve Voxwarm/Penumbra resources and every legal route. Update only meaningful broken contract tests; do not add wording/copy tests.
- [ ] Parent runs integrated tests/build/verify and direct artifact/HTTP smoke; inspect content boundaries and print styles statically, no browser launch. Obtain task/final review, fix only evidence-backed findings, then commit owned changes for rollout2.

## Parent execution and release gates

- [ ] Preserve genuine approval/empty notes in the plan ledger. Baseline `npm test` already observed25 passed; no dependency install required.
- [ ] Run Task1 and Task2's test-first preparation concurrently with disjoint ownership. Parent alone executes tests; Task2 pauses until observed red. Parent is integration owner.
- [ ] After integration, run `npm test`, `npm run build`, `npm run verify`. Exercise the actual builder with the existing real60-page `_src`, not test fixture pages. Check legal bytes, all links, canonical store identities, complete raw image dimensions, approved image hashes, static SVG safety, expected outputs and absence of old poster/private paths. Inspect selected published image bytes directly. No browser.
- [ ] Review committed change packages for spec and code/security quality. Respect scoped fix/re-review; do not merge with unresolved load-bearing findings.
- [ ] Merge verified reviewed branch to main and push (standing owner preference; no PR/menu). Dispatch `.github/workflows/sync-legal.yml` manually using `gh workflow run sync-legal.yml --repo bogdantsiganiuk/bogtsi-site --ref main`, watch that exact finite run once, then probe actual live pages/images and compare hashes/schema/links. Push alone does not publish.
- [ ] Record rollout1 first-confirmed-live timestamp, commit/run URL and acquired asset proof in the existing experiment's marketing-interventions record before beginning Task3.
- [ ] Execute Task3, verify/review/merge/push/deploy the same way, confirm live resources/crosslinks and record rollout2 separately. Analytics activation, if a real snippet arrives, gets its own truthful privacy/verification record; never invent traffic or simulate unsupported ingestion.
- [ ] Update durable repository memory/index together after verified rollouts. Final reply links real live pages, reports exercised checks and explicitly states browser/native QA limits and any remaining analytics-account prerequisite.
