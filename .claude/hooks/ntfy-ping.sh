#!/usr/bin/env bash
# TASAN Trips — ntfy.sh push notification hook (Notification / Stop events).
#
# Only pings if notifications are ON for THIS session (see toggle.sh and
# .claude/notify-state/<session_id>). Never blocks Claude: short curl
# timeout, failures swallowed, always exits 0. Sends a short fixed message
# only — never forwards prompt/tool content, so nothing sensitive leaves
# this machine.
#
# Usage (wired via .claude/settings.json):
#   ntfy-ping.sh notify    # Notification event: Claude needs input/approval
#   ntfy-ping.sh complete  # Stop event: a turn ended (also fires on
#                          # /clear, /resume, /compact — not just "done",
#                          # see docs/NOTIFICATIONS.md)
set -u

KIND="${1:-notify}"
STATE_DIR=".claude/notify-state"
TOPIC="${TASAN_NTFY_TOPIC:-tasan-trips}"

PY=python3
command -v "$PY" >/dev/null 2>&1 || PY=python

input="$(cat)"

session_id="$(printf '%s' "$input" | "$PY" -c "
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    d = {}
print(d.get('session_id', ''))
" 2>/dev/null)"

[ -z "$session_id" ] && exit 0

state_file="$STATE_DIR/$session_id"
[ -f "$state_file" ] || exit 0   # notifications OFF for this session — stay silent

if [ "$KIND" = "complete" ]; then
    message="Auftrag beendet"
else
    message="Claude braucht deine Eingabe/Freigabe"
fi

curl -fsS --max-time 5 -d "$message" -H "Title: TASAN Trips" "https://ntfy.sh/$TOPIC" >/dev/null 2>&1 || true
exit 0
