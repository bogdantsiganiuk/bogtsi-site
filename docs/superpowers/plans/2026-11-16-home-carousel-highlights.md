# All-app carousel and full highlights Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development. Steps use checkbox syntax for tracking.

**Goal:** Replace the homepage's two-app bias with one importance-ordered all-app carousel followed by equally complete highlights for all11apps, showing two distinct genuine screenshots per app and the requested two-step navigation.

**Architecture:** Native CSS horizontal scrolling/scroll-snap and real fragment anchors; no new client JavaScript, autoplay or widget dependency. One manifest appOrder controls both sections. Extend the closed visual contract with secondaryCapture for the carousel; existing capture remains the full highlight/product screenshot. Reuse approved iPhone hardware geometry and existing full feature typography/layout, generalized to all product themes.

**Tech Stack:** Dependency-free NodeESmodules, staticHTML/CSS, node:test, GitHubPages. ImageMagick only for private image inspection, not a build dependency.

## Global Constraints

- Ownedrepo C:/Users/bogda/.bogtsi-marketing/site-20261115, branch feat/home-carousel-highlights-2026-11-16, BASE321b228bfd8da08e95eda57b07672e7790c6abb5. Never touch unrelated Repos/bogtsi-site Wageproof WIP.
- Owner explicitly requested this layout and existing iPhone/art direction is approved. No extra design-approval loop or new visual alternatives. Designer PortfolioCarouselDesigner supplied the recipe used below.
- Keep browsers closed, including headlessQA, per C:/Users/bogda/.claude/memory/decision-pages.md. Actualbuild/localHTTP/liveHTTP/static/directimage inspection only; do not claim newly observed visual scrolling or browser execution.
- No native builds/captures/EAS/AppStorewrites/DNS/outreach/spend. Use only existing complete native screenshots; never AppStoreposters, fabricated UI, crops or newnames for the same pixels. Native app/store source files stay untouched.
- All11originalSVG,11devicePNG and11primarycapturePNG bytes remain unchanged. Add11secondaryfullPNG exact copies. Current pair source map and decoded8bitRGBA signatures are in .superpowers/sdd/2026-11-16-home-carousel-highlights/source-pairs.json and screenshot-pair-facts.json; parent inspected the contact sheet. Everypair's decoded pixels differ. Ascend is1290x2796; others828x1792. No exact-current-binary claims beyond evidence; demo captions explicit.
- Keep original art secondary in existing product how-it-works/resource areas. Five companion resources and their registry metadata/links/content are deferred, not reworked, added or deleted. Removing old homepage campaign-specific extra CTAs is part of removing that tier; the existing resources section and product resource links stay.
- Preserve canonical product URLs, StoreIDs,19support identities,60rawlegalbytecopies/WageproofSpanish, legacy Noctura redirects, SVG/PNG/realpath/credential guards and existing exported function signatures. LSPstatus/references reported no configured server; controller bounded fallback found VISUAL_FILES consumers in marketing-site.mjs and no other production module.
- Preserve exact existing Cloudflare module snippet on20generatedpages. No extra JS required; website privacy remains accurate. No synthetic analytics or dashboard-ingestion claim.
- One integration owner for marketing.json/scripts/CSS/templates/tests/README. Asset worker owns only11productJSON and11newPNG paths. Parent owns plan/ledger/proof. Agents never run tests/build/lint/formatters mid-flight; parent runs the combined verification.
- Clean cutover: remove featured/campaigns/catalog hierarchy and dead CSS, GROUPS/home group field. Do not retain aliases/shims/obsolete campaign tests. New appOrder is required and must contain the entire marketed app set once. Resources remain independent.

## Task 1: Add the second real screenshot for each app

**Files:** modify marketing/apps/{voxwarm,umbra,dahlia,shiver,ascend,reverie,noctura,brightwater,posture-coach,wageproof,maelzel}.json; create matching marketing/assets/<slug>-secondary-capture.png. Source maps are private and not published.

**Produces:** each product gains visuals.secondaryCapture with src,width,height,alt,caption,frameProfile from screenshot-pair-facts.json. Existing visual roles/copy/features/sourceVersion/reviewedAt remain unchanged. Remove obsolete top-level group field only; no other product text edits. Source root paths/provenance never go into public product JSON.

- [ ] Read screenshot-pair-facts.json first; exactly copy every source PNG to target, no image processing/re-encoding. New role metadata uses actual observed native dimensions, descriptive alt, factual demo caption and existing illustrative frameProfile.
- [ ] Parent independently verifies all11new copy SHA256 values/dimensions and11decoded pixel signatures versus primary; all33oldimage bytes and5resourcebody/registry records remain unchanged.
- [ ] Write private Task1report; commit only22owned files when parent approves exactcopy evidence. Do not edit marketing.json or run builders; integration owner registers assets and consumes the data.
- [ ] Independent data/spec/quality review of the committed Task1package before final release; source caveats and demo captions must remain truthful.

## Task 2: Replace tiers with the ordered carousel and full highlights

**Files:** marketing.json; scripts/marketing-assets.mjs; scripts/marketing-site.mjs; templates/index.html; marketing/assets/site.css; README.md; test/marketing-site.test.mjs, test/build-site.test.mjs and test/marketing-boundary.test.mjs where their manifest fixtures change.

**Consumes:** Task1 four-role product data and private pair facts. Existing public buildMarketing({rootDir,outDir,apps,marketing}), marketingFiles({apps,marketing}), verifier APIs unchanged. Existing product page source screenshot/OG/device semantics remain unchanged.

### Exact authoring contract

Replace featured and campaigns with this single list; retain products/resources and alloldassets, append11newcapturepaths:

```json
"appOrder": ["voxwarm", "umbra", "dahlia", "shiver", "ascend", "reverie", "noctura", "brightwater", "posture-coach", "wageproof", "maelzel"]
```

Order uses savedNov15Apple acquisition evidence (current28downloads34,19,5,4,3,3,2,1,1,0,0) and Voxwarm paid signal; ties preserve stable priority. Do not infer retention or failure from new-app small samples. Priority changes position only, never feature/card size. Evidence: C:/Users/bogda/Repos/docs/research/released-app-growth-2026-11-15/performance.md.

```js
export const VISUAL_FILES = Object.freeze({
  device: 'device.png',
  capture: 'capture.png',
  secondaryCapture: 'secondary-capture.png',
  illustration: 'art.svg',
});
```

- [ ] StageA ONLY: replace the obsolete campaign input test with an appOrder authoring-boundary test. Control: manifest clone with appOrder=products.map(p=>p.app) while retaining old fields solely for correct preimplementation RED. For invalid-order cases use undefined/string/duplicate/missing/unknown/unmarketed identities and valid underlying product/resource/asset fixtures. Call marketingFiles and expect order rejection. Parent runs the targeted test before production changes; old code ignores appOrder and must fail Missing expected exception, not unrelated fixture errors. Then stop for parent's continue message. Do not alter shared production manifest yet. Asset worker can run in parallel because its productJSONs are not read by marketingFiles.
- [ ] StageB after correctRED: marketingFiles validates explicitappOrder is an exact unique permutation of marketed products; reject missing/wrongtype/unknown/unmarketed/duplicate/omitted products. Remove old promotion validation entirely. Reject legacy featured/campaigns if supplied rather than silently accept obsolete configuration. Update minimal fixtures to the new required list; valid empty products/list allowed. No aliases.
- [ ] Register11secondaryPNG; preserve exact identity filename allowlist and every old asset. Validate exactly4visualroles and caption/frameProfile for bothcapture roles. Reuse existing PNG signature/IHDR/dims admission and unchanged strictSVG admission. Reject identical primary/secondary bytes (Buffer.equals) before publication; parent separately proved decoded pixels differ. Add a real-consumer negative test for identical screenshot data, with valid baseline metadata/dimensions/assets, and extend existing visual role corruption/absence/profile/caption coverage to the new role. No permanent template/copy/forwarding tests.
- [ ] Remove unused GROUPS and product group requirement. Keep theme/category and all other product constraints. Asset worker removes obsolete group from11JSONs.
- [ ] Refactor private device/scene helpers with explicit placement/visual/link options: product default keeps current source-image links/details, carousel uses secondaryCapture and noninteractive span hardware inside one card anchor, highlight uses capture and a canonical product link on the phone. IDs include carousel/highlight; no nested anchors or details inside card links. Preserve hardware CSS/native aspect/contain fit and alt/dims/source-disclosure semantics.
- [ ] Replace index placeholders __FEATURED__/__CAMPAIGNS__/__CATALOG__ with __CAROUSEL__/__HIGHLIGHTS__. Keep intro but tighten padding32pxdesktop/24pxmobile so carousel is at top before any app highlight. Resources section remains unchanged.
- [ ] Carousel section idapps; heading Find your next useful thing, support Explore all11iPhoneapps, persistent instruction Swipe or scroll sideways · Select an app to explore below. Focusable labelled scroll region, ordered list11equalwidth cards. Each card is exactly one enclosing anchor href#highlight-<slug>, appname/category, complete secondary phone and short factual/demo caption, Explore below text. No childinteractive elements. Region tabindex0, visiblefocus, no scrollbar hiding, no wheel/drag interception or fake controls. Native swipe/trackpad/scrollbar/keyboard/tab behavior. Add Skip to all app highlights link #all-apps.
- [ ] CSS: overflow-x:auto, scroll-snap-type:x proximity, scroll-padding-inline8px, naturalcontentheight. Desktopcard280px/gap20; phoneouter200px. Mobile card width calc(100vw - 80px) and gap16; phone180px, full screenshot. Avoid percentage flex basis against max-content track (circular sizing); use viewport-based fixed card basis. Track list flex row/reset with8px breathing room so focus ring is not clipped. No page-wide horizontal overflow.
- [ ] Highlights section idall-apps, one article idhighlight-<slug> for eachapp in appOrder, same full2column .feature treatment forALL11. Appname+existingcardHeadline in heading link, fullintro, primaryMeetappbutton, tagline, primarycompletephone. Heading/phone/CTA all link/${entry.route}/, NOT rawPNG orStore. Articles tabindex-1 andscroll-margin24px, subtle:target allowed. No fullarticle overlay link. DOMordercopythenphone; alternate desktop sides viaCSSgrid only, allmobilecopyfirstphoneafter.
- [ ] Generalize existing theme colors via .feature.theme-* and .carousel-card.theme-* variables; preserve Vox coral/Penearth style but remove hardcoded two-app specialcases and all obsolete catalog/campaign CSS. Include actual themevaluesfromdata (including slate ifpresent), not an app-to-theme mapping. Keepfull-sized headlines/spacing/phone scale on everyapp. Existing approved phone geometry block is untouched. Under prefers-reduced-motion:reduce set html and carousel scrollingauto. No autoplay, entrances, hovertransforms or animations.
- [ ] Update README foroneorder/22homepageimages/4roles/CSS-onlynavigation/new130-fileallowlist, real20-pageanalytics retained and resources deferred. Deleteobsoletepromotion/3role/119filecurrent descriptions (historicalplan documents need not be rewritten). No unsupported metrics/features/currentbinary claims.
- [ ] Write Task2report, do not commit until parent full integrated checks pass. Parent authorizes scoped code/docs/testcommit; no privatefacts/maps/review/workspace published.

## Task 3: Integrated verification and release

- [ ] Parent baseline27tests passed before changes. Run correct targetedRED fromTask2StageA. After bothdata/code complete run npm test && npm run build && npm run verify. Expected exact publication130files (119+11PNGs; no JSasset), same20generatedHTMLpages/5resources/60app legal pages/19supportidentities.
- [ ] Actual localNodeHTTP smoke: home contains11carousel cards+11fullhighlights in the exactsameorder; eachcarouselhref resolves toits ownuniquehighlight; eachhighlightheading/phone/CTA canonicalproductURL; eachpairdifferent src+decodedRGBAsignature;22uniquehomephone/sceneIDs, no nestedanchors, correctnativePNGdims and fullsource. All11existingproduct/store/schema/OG/art/legal semantics, all44imagehashes,5resourcebodies/metadata and60buildlegalbytecopies preserved,20Cloudflareembeds exact. StaticCSSnativeoverflow/focus/reducedmotion checked; no browser/visualscrollclaim.
- [ ] Fresh data Task1 and Task2 spec/quality + finalwholebranch review of committed diff and parent evidence. Fix substantive findings through implementer, covering checks and scoped rereview.
- [ ] Fastforward reviewedbranch to currentorigin/main safely, push, manuallydispatchsync-legal.yml (pushalone doesnotdeploy), watchexactrunonce, require success.
- [ ] Full liveHTTP exercise all20generatedpages/60legalroutes/2redirects/44images/CSS/robots/sitemap. Confirm22homeimages/navigation/order and oneunchangedbeacon20pages; CSSlineendingsnormalizedonly,44PNGs/SVGs strictbytehashes. No syntheticCFPOST, browserlaunch or dashboard-ingestionclaim.
- [ ] Save actualcommit/run/timestamps/firstcompleteliveproof and separate website acquisition intervention; no nativeASOclockactivation. Archiveproofs/sourceprovenance/decodedpairfacts/reviews, updatepairedmemorytopic/index, removeonlyownedthrowawayscaffolds afterevidence preserved. Followstandingreviewedmainmerge/push preference, no finishingmenu.
