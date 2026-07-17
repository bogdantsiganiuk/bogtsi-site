#!/usr/bin/env bash
# Assert every published URL is live and holds the expected content.
#
# A silently-broken privacy URL means a rejected submission, so this fails the
# workflow rather than letting a 404 sit there unnoticed.
set -euo pipefail

BASE="${1:-https://bogtsi.xyz}"
fail=0

check() {
  local url="$1" marker="$2"
  local body code
  # -sS keeps curl quiet but still prints errors. Never use -v here.
  code=$(curl -sS -o /tmp/body -w '%{http_code}' -L "$url" || echo "000")
  body=$(cat /tmp/body 2>/dev/null || echo "")
  if [ "$code" != "200" ]; then
    echo "FAIL $url -> HTTP $code"
    fail=1
  elif ! grep -qF "$marker" <<< "$body"; then
    echo "FAIL $url -> 200 but missing marker: $marker"
    fail=1
  else
    echo "ok   $url"
  fi
}

apps=$(node -p 'JSON.parse(require("fs").readFileSync("apps.json","utf8")).apps.map(a=>a.slug).join("\n")')
pages=$(node -p 'JSON.parse(require("fs").readFileSync("pages.json","utf8")).map(p=>p.route+"\t"+p.marker).join("\n")')

while read -r slug; do
  [ -n "$slug" ] || continue
  while IFS=$'\t' read -r route marker; do
    [ -n "$route" ] || continue
    check "$BASE/$slug/$route" "$marker"
  done <<< "$pages"
done <<< "$apps"

# Root redirects: curl -L follows the meta refresh? It does not — meta refresh is
# a client-side hop, so assert the redirect stub itself names the target.
check "$BASE/privacy" "/noctura/privacy"
check "$BASE/terms" "/noctura/terms"
check "$BASE/" "Noctura"

exit "$fail"
