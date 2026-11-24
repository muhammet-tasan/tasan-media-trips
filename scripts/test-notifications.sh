#!/usr/bin/env bash
export MSYS_NO_PATHCONV=1
# Tests the ntfy notification hooks (toggle, session reset, ping) in an isolated temp dir with a stubbed curl — sends NO real pushes. Usage: bash scripts/test-notifications.sh
REPO="${1:-$(cd "$(dirname "$0")/.." && pwd)}"
T="$(mktemp -d)"; cd "$T" || exit 1
mkdir -p stub; printf '#!/usr/bin/env bash\necho "$@" >> "%s/curl.log"\n' "$T" > stub/curl; chmod +x stub/curl
export PATH="$T/stub:$PATH"
H="$REPO/.claude/hooks"
fail=0
ok(){ if [ "$2" = "$3" ]; then echo "PASS  $1"; else echo "FAIL  $1 (got '$2', want '$3')"; fail=1; fi; }
st(){ [ -f ".claude/notify-state/$1" ] && echo on || echo off; }
tog(){ printf '{"session_id":"%s","prompt":%s}' "$1" "$(python3 -c 'import json,sys;print(json.dumps(sys.argv[1]))' "$2")" | bash "$H/toggle.sh" >/dev/null; }
ping(){ : > curl.log; printf '{"session_id":"%s"}' "$1" | bash "$H/ntfy-ping.sh" "$2"; [ -s curl.log ] && echo sent || echo silent; }
ss(){ printf '{"session_id":"%s","source":"%s"}' "$1" "$2" | bash "$H/session-start.sh"; }

echo "== default OFF"
ok "fresh session has no state" "$(st A)" off
ok "ping silent when off (complete)" "$(ping A complete)" silent
ok "ping silent when off (notify)" "$(ping A notify)" silent

echo "== only the exact commands switch on"
for p in "/goal fertig wenn X" "/my-goal" "hallo notify:on" "bitte /my-notification-on aktivieren" "notify:on" "/my-notification-onx" "/my-list-commands"; do
  tog A "$p"; ok "no activation by: $p" "$(st A)" off
done

echo "== ON state"
tog A "/my-notification-on"; ok "/my-notification-on activates" "$(st A)" on
ok "ping sent when on (complete)" "$(ping A complete)" sent
ok "ping sent when on (notify)" "$(ping A notify)" sent
tog A "irgendein normaler prompt"; ok "normal prompt keeps state" "$(st A)" on

echo "== parallel sessions"
ok "session B unaffected by A" "$(st B)" off
ok "session B silent while A on" "$(ping B complete)" silent
tog B "/my-notification-on"; tog A "/my-notification-off"
ok "A off after /my-notification-off" "$(st A)" off
ok "B still on" "$(st B)" on
ok "A silent" "$(ping A complete)" silent

echo "== session start resets"
ss B startup;  ok "startup resets" "$(st B)" off
tog B "/my-notification-on"; ss B resume; ok "resume resets" "$(st B)" off
tog B "/my-notification-on"; ss B clear;  ok "clear resets" "$(st B)" off
tog B "/my-notification-on"; ss B compact; ok "compact keeps" "$(st B)" on
tog C "/my-notification-on"; ss B startup; ok "other session C untouched by B start" "$(st C)" on

echo "== stale purge + session end"
touch -d '3 days ago' .claude/notify-state/OLD; ss Z startup; ok "old state purged" "$(st OLD)" off
printf '{"session_id":"C"}' | bash "$H/session-end.sh"; ok "session end removes state" "$(st C)" off

echo "== unreachable ntfy never blocks"
rm -f stub/curl; tog D "/my-notification-on"
PATH="/usr/bin:/bin" ping D complete >/dev/null; ok "ping exits 0 without curl" "$?" 0

rm -rf "$T"; [ $fail = 0 ] && echo "ALL PASSED" || echo "SOME FAILED"; exit $fail
