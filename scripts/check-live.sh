#!/usr/bin/env bash
# Assert every published URL is live and holds the expected content.
#
# A silently-broken privacy URL means a rejected submission, so this fails the
# workflow rather than letting a 404 sit there unnoticed.
set -euo pipefail

BASE="${1:-https://bogtsi.xyz}"
fail=0

# Bounded, or this step hangs the workflow. A curl with no --max-time waits
# indefinitely when the host accepts the connection but never answers — exactly
# what happens while a Pages certificate is still provisioning. That stalled a
# real run for 7 minutes until it was cancelled by hand.
CONNECT_TIMEOUT=10
MAX_TIME=20
# Pages serves from a CDN that lags the deploy by a few seconds, so the first
# probe right after deploy-pages can legitimately 404. Retry before believing it.
ATTEMPTS=5
BACKOFF=10

check() {
  local url="$1" marker="$2"
  local body code attempt=1
  while :; do
    # -sS keeps curl quiet but still prints errors. Never use -v here: this repo
    # is public and its Actions logs are world-readable.
    code=$(curl -sS -o /tmp/body -w '%{http_code}' -L \
      --connect-timeout "$CONNECT_TIMEOUT" --max-time "$MAX_TIME" "$url" || echo "000")
    body=$(cat /tmp/body 2>/dev/null || echo "")
    if [ "$code" = "200" ] && grep -qF "$marker" <<< "$body"; then
      echo "ok   $url"
      return
    fi
    if [ "$attempt" -ge "$ATTEMPTS" ]; then
      if [ "$code" != "200" ]; then
        echo "FAIL $url -> HTTP $code after $ATTEMPTS attempts"
      else
        echo "FAIL $url -> 200 but missing marker: $marker"
      fi
      fail=1
      return
    fi
    echo "     $url -> $code, retrying in ${BACKOFF}s ($attempt/$ATTEMPTS)"
    sleep "$BACKOFF"
    attempt=$((attempt + 1))
  done
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
