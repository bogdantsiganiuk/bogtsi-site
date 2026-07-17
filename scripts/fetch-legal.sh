#!/usr/bin/env bash
# Stage each app's legal pages into _src/<slug>/<route>.html.
#
# Fetches the allowlisted files ONE BY ONE via the contents API rather than
# cloning: the runner never gets a .git directory, never gets a credential on
# disk, and never sees any file outside pages.json.
#
# Requires GH_TOKEN in the environment. Never echo it: this repo is public and
# so are its Actions logs.
set -euo pipefail

: "${GH_TOKEN:?GH_TOKEN is required}"

apps=$(node -p 'JSON.parse(require("fs").readFileSync("apps.json","utf8")).apps.map(a=>a.slug+" "+a.repo).join("\n")')
pages=$(node -p 'JSON.parse(require("fs").readFileSync("pages.json","utf8")).map(p=>p.route+" "+p.source).join("\n")')

rm -rf _src
while read -r slug repo; do
  [ -n "$slug" ] || continue
  mkdir -p "_src/$slug"
  while read -r route source; do
    [ -n "$route" ] || continue
    echo "fetching $repo:$source -> _src/$slug/$route.html"
    gh api "repos/$repo/contents/$source" \
      --header "Accept: application/vnd.github.raw" \
      > "_src/$slug/$route.html"
    if [ ! -s "_src/$slug/$route.html" ]; then
      echo "ERROR: $repo:$source came back empty" >&2
      exit 1
    fi
  done <<< "$pages"
done <<< "$apps"

echo "staged $(find _src -type f | wc -l) files"
