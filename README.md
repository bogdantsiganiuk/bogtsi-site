# bogtsi-site

Serves bogtsi.xyz: eleven released iPhone apps, two practical resources, and the complete app legal/support directory via GitHub Pages.

## How it works

This repo **pulls** legal pages; app repos never push here. The “Sync legal pages”
workflow fetches only `pages.json` from the 19 repositories in `apps.json`.
`scripts/build-site.mjs` preserves those 60 HTML pages byte-for-byte and the
legacy root redirects, then renders checked-in marketing content.

`apps.json` is the only product-name/App Store identity registry.
`marketing.json` explicitly lists the eleven marketed products, two resources,
featured order, and every public PNG/CSS asset. Product copy lives in
`marketing/apps/<registry-slug>.json`; resources are trusted HTML body fragments
in `marketing/resources/`. Content files themselves are not published.
Source-version/review timestamps are internal provenance, not public freshness claims.

App repos hold no workflow and no secret. Marketing never enters the PAT-backed
fetch. There is no framework, external font, analytics, pixel, cookie, form,
recording, or reflection upload.

## Adding an app

Two steps, and **both** are required:

1. Add an entry to `apps.json`: `{ "slug": "<slug>", "name": "<Name>", "repo": "owner/repo" }`.
   The app repo must publish the unscoped pages listed in `pages.json` and any
   entries whose optional `app` field matches its slug, at those exact paths.
   Once the app is released and its identity is verified, add
   `"appStoreId": "<numeric ASC app id>"`. Leave it off while unreleased.
   An ID alone does not market an app: add a product to `marketing.json` with
   complete released-version copy and registered real screenshots. The renderer
   rejects unknown/unreleased identities, identity overrides, foreign routes,
   unsafe source paths, duplicate outputs, unregistered screenshots, and PNG
   dimensions that disagree with the content.
2. **Grant the `APP_REPOS_READ_TOKEN` PAT read access to the new repo.** It is scoped to
   named repositories only — it does *not* cover repos added later.

Miss step 2 and the sync fails closed: `gh api` 404s, `set -e` aborts, nothing is
published. Safe, but the error won't mention the token, so check the scope first.

The PAT is deliberately **not** scoped to "All repositories". This repo is public, so a
leaked token that could read every private repo you own would be a very different
incident from one that can read the app repos it already serves. One minute per app is
the price of that.

## URLs

| URL | Source |
|---|---|
| `/noctura/privacy` | `noctura:docs/legal/privacy-policy.html` |
| `/noctura/terms` | `noctura:docs/legal/terms-of-service.html` |
| `/noctura/support` | `noctura:docs/legal/support.html` |
| `/posture-coach/privacy` | `posture-coach:docs/legal/privacy-policy.html` |
| `/posture-coach/terms` | `posture-coach:docs/legal/terms-of-service.html` |
| `/posture-coach/support` | `posture-coach:docs/legal/support.html` |
| `/ascend/privacy` | `ascend:docs/legal/privacy-policy.html` |
| `/ascend/terms` | `ascend:docs/legal/terms-of-service.html` |
| `/ascend/support` | `ascend:docs/legal/support.html` |
| `/privacy`, `/terms` | redirect to the Noctura pages (the first app onboarded; see `ROOT_APP` in `scripts/build-site.mjs`) |
| `/wageproof/es/privacy` | `wageproof:docs/legal/privacy-policy.es.html` |
| `/wageproof/es/terms` | `wageproof:docs/legal/terms-of-service.es.html` |
| `/wageproof/es/support` | `wageproof:docs/legal/support.es.html` |

An optional `"app": "wageproof"` on a `pages.json` entry limits that route to
Wageproof; entries without `app` remain shared by every listed app. Nested routes
such as `es/privacy` use the same explicit allowlist and are not fetched or
published for other apps. Only HTML is published, never a recursive legal-docs copy.

## Marketing routes and content

The homepage features Voxwarm and Penumbra first, followed by the other nine
released products. `/support/` lists all 19 legal registry entries and their
scoped routes, including Wageproof’s six English/Spanish links.
`/site-privacy/` describes this website, not any app. Root `/privacy` and `/terms`
remain legacy Halcyon redirects.

Product routes are `/voxwarm/`, `/penumbra/`, `/shiver/`, `/dahlia/`,
`/brightwater/`, `/halcyon/`, `/posture-coach/`, `/ascend/`, `/wageproof/`,
`/duskmere/`, and `/maelzel/`. Legal namespaces stay unchanged: Penumbra uses
`/umbra/privacy`, Halcyon uses `/noctura/privacy`, and Duskmere uses
`/reverie/privacy`. No duplicate `/umbra/` marketing page is generated.

The resource directory at `/resources/` contains two printable, app-independent guides:
`/resources/five-minute-vocal-warm-up/` and
`/resources/private-reflection-worksheet/`.
New pages have trailing-slash canonicals, unique metadata, and a crawlable
`sitemap.xml` / `robots.txt`. Product structured data takes its identity and
install URL from the registry; it contains no invented prices, offers, ratings,
or reviews. The original 64 outputs remain; the manifest adds exactly 32 files
(11 products, 2 guides, resource index, support, site privacy, sitemap, robots,
13 PNGs and CSS), for 96 explicitly allowed output paths.

To change an image, copy only the named real PNG into `marketing/assets/`,
register that exact path, and record its real width/height and descriptive alt
text in product content. Do not copy app screenshot directories or private docs
trees. Do not promote draft app features or infer translated UIs from metadata
locales.

## Measurement and launch record

Search Console verification is a separate owner-authorized action. No verification
file or tag is currently registered. If a file is chosen later, review and add
its exact public path to the publication contract; never relax the guard.

Until Apple issues real provider/campaign tokens, App Store links are ordinary
`https://apps.apple.com/app/id<verified-id>` links. Do not invent campaign IDs,
add sensitive data to URLs, or install a tracker workaround.
Apple campaign and custom-product-page reporting suppresses data below five
first-time downloads; campaign attribution uses a 24-hour window. Blank data
is not zero, and sub-five-install tests cannot establish precise attribution.

This implementation is not a production-launch record. The publisher must record
the actual website launch timestamp and live URL in the separate ASO keyword
experiment confounder record when deployed, and record teacher/creator outreach
dates/links if it occurs. Do not ascribe subsequent changes to keywords alone.
No app code, SDK, release, or App Store marketing URL change is needed for this site.


## Publishing

Actions → **Sync legal pages** → Run workflow. Also runs daily.

The fetcher uses each app repository's default branch, not an unreleased app
branch or local checkout. Prepare a legal-only source change and approve the
combined app/legal and publisher diffs before merging or publishing new routes.
New language links must not go live before their target pages are available.
The daily workflow can publish merged changes without a manual dispatch: hold
publication while reviewing staged output, then coordinate the approved release.

## Security

This repo is **public** and its workflow holds a token that can read **private**
app repos. Three rules keep that safe. Do not relax them:

1. **Triggers are `workflow_dispatch` + `schedule` only.** Never add
   `pull_request_target`, or a fork PR can exfiltrate the token.
2. **Build copies explicit allowlists only:** `pages.json` for fetched legal HTML
   and `marketing.json` for local marketing publication. Never substitute a glob
   or copy an entire checkout. Private content/metadata never becomes an output.
3. **`scripts/verify-site.mjs` must run before deploy.** Build and verifier share
   `marketingFiles({ apps, marketing })`. Both `expectedFiles(apps, pages, marketing)`
   and `verify({ outDir, apps, pages, marketing })` require the marketing manifest;
   missing or extra files and credential-shaped content fail closed.

The token is `APP_REPOS_READ_TOKEN`: fine-grained, **Contents: Read** only,
scoped to the app repos. It cannot write anything. If it expires the live site
keeps serving; only updates stop.

## Local development

```bash
npm test          # node --test
```

To build locally you need staged sources in `_src/<slug>/<route>.html`, plus the
checked-in marketing content and explicitly registered assets:

```bash
node scripts/build-site.mjs
node scripts/verify-site.mjs
```

The build signature remains `build({ srcDir, outDir, rootDir })`.
`buildMarketing({ rootDir, outDir, apps, marketing })` renders real pages without
fetching app repositories. `scripts/check-live.sh https://bogtsi.xyz` probes
every legal route, legacy redirects, marketing pages and each product’s own App
Store ID, preserving bounded connection/request timeouts and CDN retries.
