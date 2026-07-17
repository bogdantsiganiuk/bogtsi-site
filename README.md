# bogtsi-site

Serves the legal and support pages for bogtsi.xyz apps via GitHub Pages.

## How it works

This repo **pulls**; app repos never push here. The "Sync legal pages" workflow
fetches an allowlist of HTML files from each app repo listed in `apps.json`,
assembles `_site`, verifies it, and deploys to Pages.

App repos hold no workflow and no secret. Adding an app is one entry in `apps.json`.

## URLs

| URL | Source |
|---|---|
| `/noctura/privacy` | `noctura:docs/legal/privacy-policy.html` |
| `/noctura/terms` | `noctura:docs/legal/terms-of-service.html` |
| `/noctura/support` | `noctura:docs/legal/support.html` |
| `/privacy`, `/terms` | redirect to the Noctura pages |

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
