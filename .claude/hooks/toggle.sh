#!/usr/bin/env bash
# TASAN Trips — notification toggle (UserPromptSubmit event).
#
# Default is OFF. The ONLY things that change state, based on the raw prompt
# the USER submitted (this hook never sees model output or tool calls):
#   - prompt whose first word is exactly  /my-notification-on   -> ON  (this session)
#   - prompt whose first word is exactly  /my-notification-off  -> OFF (this session)
# Nothing else — not /goal, /my-goal, quoted text, "notify:on" inside a prompt,
# background tasks or tests — can switch it on.
#
# State: .claude/notify-state/<session_id> (per session, so parallel sessions
# never share state). session-start.sh resets it on every new/resumed session.
# Never blocks and never alters the prompt; always exits 0.
set -u

STATE_DIR=".claude/notify-state"
mkdir -p "$STATE_DIR" 2>/dev/null

PY=python3
command -v "$PY" >/dev/null 2>&1 || PY=python

input="$(cat)"

read_field() {
    printf '%s' "$input" | "$PY" -c "
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    d = {}
print(d.get('$1', ''))
" 2>/dev/null
}

session_id="$(read_field session_id)"
[ -z "$session_id" ] && exit 0

prompt="$(read_field prompt)"
# first word of the prompt, leading whitespace stripped, lowercased
first="${prompt#"${prompt%%[![:space:]]*}"}"
first="${first%%[[:space:]]*}"
first="$(printf '%s' "$first" | tr '[:upper:]' '[:lower:]')"

state_file="$STATE_DIR/$session_id"

case "$first" in
    /my-notification-on)
        touch "$state_file" 2>/dev/null
        echo '{"systemMessage": "TASAN Trips: Benachrichtigungen AN (nur diese Sitzung)."}'
        ;;
    /my-notification-off)
        rm -f "$state_file" 2>/dev/null
        echo '{"systemMessage": "TASAN Trips: Benachrichtigungen AUS."}'
        ;;
esac

exit 0
