# Carousel app-name row correction Implementation Plan

> **For agentic workers:** Use subagent-driven-development for the scoped fix and requesting-code-review before release.

**Goal:** Align carousel app names independently of category wrapping; preserve all existing phone, caption, action and interaction behavior.

**Root cause:** The previous four-track grid shares one combined category+name header. Inside carousel-copy, category p and name h3 still use independent normal flow. Thus a two-line category moves only its own name downward even though the following phone row aligns. User's repeated report is ground truth; do not rerun checks to confirm the observed defect.

**Architecture:** Five shared tracks: category, app name, phone, value caption, action. Make carousel-copy a two-row subgrid spanning the first two tracks. No JavaScript or per-app offsets/text changes.

## Constraints

- Only owned C:/Users/bogda/.bogtsi-marketing/site-20261115, branchfix/carousel-name-rows-2026-11-17, BASE681da0fb79ea0ac67e1365bf2a0c61b4c46fc643. Other Repos/bogtsi-site is unrelated WIP.
- Owner bans browser launching/page opening/headlessQA (C:/Users/bogda/.claude/memory/decision-pages.md). Source review/build/actuallocal+liveHTTP only; no rendered-pixel alignment claim.
- Modify only marketing/assets/site.css and its README layout description. Images, product copy, DOM, runtimecontroller, apporder, metadata/legal/resources/CFbeacon remain unchanged. No new provenance labels.
- No permanent source-text/wording/wiring tests. This declarative CSS correction uses a private structural/output smoke and existing behavioral suite. Do not mock CSS layout or claim a mathematical toy model is browser proof.
- Agent skips build/tests/linters/formatters; parent integrated checks, scoped review and Pages release. No destructive/unrelated changes or nativejobs.

## Task 1: Share category and name tracks separately

- Change carousel-track grid-template-rows from repeat(4,auto) to repeat(5,auto); carousel-item span from4to5. Keep carousel-card grid-row1/-1 and inherited subgrid.
- carousel-copy: display:grid;grid-row:1/span2;grid-template-rows:subgrid. Preserve padding. Category .eyebrow explicitly grid-row1 and start alignment. h3 explicitly grid-row2 and align-self:start while preserving typography/margin. Category content may wrap freely; all names start on shared second track.
- Move carousel figure from grid-row2/span2 to3/span2. Its own stage/caption rows1/2 remain relative to its two inherited tracks. Move carousel-explore row4to5. Update comment to describe category/name/phone/caption/action.
- Check responsive selectors for other row overrides; no fixed header heights, clamping, name/category reorder, special Ascend/Maelzel selectors, image aspect or hardware geometry edits.
- Update README lines describing four wrapped-header tracks to five tracks with shared category and name rows. Preserve the explicit no-browser-proof caveat.
- Report exact changed paths/why wrapping can no longer independently shift names. Do not commit until parent approves checks.

## Task 2: Verify and release

- Parent captures immutable source hashes and existing44image+runtime/template/manifest/product state. Run npm test && npm run build && npm run verify;131outputs expected.
- Private actualNodeHTTP smoke checks servedCSS five-track mapping and nested two-track copy, all11unchangednames/categories/anchors/order/22screens, unchanged44imagebytes/controller module/20beacons and legal/resource boundaries. This is structural delivery proof, not a browser measurement.
- Commit scoped CSS/README after green; fresh reviewer checks row inheritance including nested figure's relative rows and responsive cascade. Fix any genuine findings through implementer with covering verification.
- Fastforward reviewedbranch to currentorigin/main, push, dispatchsync-legal.yml, watchexactrunonce, require success. Verify liveHTML/CSS/image/module/statuses and CSS normalized line endings.
- Record actualmain/run/firstfullconfirmation and seventh website intervention without nativeASOclock changes; update paired memories to distinguish shared name rows from previous combined header fix. Archive evidence; delete only owned private scratch after proof.
