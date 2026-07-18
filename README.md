# bogtsi-site

Serves the legal and support pages for bogtsi.xyz apps via GitHub Pages.

## How it works

This repo **pulls**; app repos never push here. The "Sync legal pages" workflow
fetches an allowlist of HTML files from each app repo listed in `apps.json`,
assembles `_site`, verifies it, and deploys to Pages.

App repos hold no workflow and no secret.

## Adding an app

Two steps, and **both** are required:

1. Add an entry to `apps.json`: `{ "slug": "<slug>", "name": "<Name>", "repo": "owner/repo" }`.
   The app repo must publish the pages listed in `pages.json` at those exact paths.
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

## Publishing

Actions → **Sync legal pages** → Run workflow. Also runs daily.

## Security

This repo is **public** and its workflow holds a token that can read **private**
app repos. Three rules keep that safe. Do not relax them:

1. **Triggers are `workflow_dispatch` + `schedule` only.** Never add
   `pull_request_target`, or a fork PR can exfiltrate the token.
2. **`scripts/build-site.mjs` copies an explicit allowlist** (`pages.json`).
   Never replace it with a glob — app repos' `docs/legal/` also holds internal
   engineering notes that must not ship.
3. **`scripts/verify-site.mjs` must run before deploy.** It fails if `_site`
   contains anything unexpected. It is the backstop for mistakes in rule 2.

The token is `APP_REPOS_READ_TOKEN`: fine-grained, **Contents: Read** only,
scoped to the app repos. It cannot write anything. If it expires the live site
keeps serving; only updates stop.

## Local development

```bash
npm test          # node --test
```

To build locally you need staged sources in `_src/<slug>/<route>.html`.
