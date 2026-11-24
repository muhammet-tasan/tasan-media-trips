#!/usr/bin/env bash
# TASAN Trips — notification on/off toggle (UserPromptSubmit event).
#
# Detects, in the raw submitted prompt text:
#   - a prompt starting with "/my-notification-on" -> turn notifications ON
#   - "notify:on"  anywhere in prompt  -> turn notifications ON
#   - "notify:off" anywhere in prompt  -> turn notifications OFF
#
# State is per-session (.claude/notify-state/<session_id>), so parallel
# sessions in this same project never share on/off state. Never blocks
# and never alters the prompt itself — always exits 0.
set -u

STATE_DIR=".claude/notify-state"
mkdir -p "$STATE_DIR" 2>/dev/null

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

prompt="$(printf '%s' "$input" | "$PY" -c "
import sys, json
try:
    d = json.load(sys.stdin)
except Exception:
    d = {}
print(d.get('prompt', ''))
" 2>/dev/null)"

state_file="$STATE_DIR/$session_id"

shopt -s nocasematch 2>/dev/null

if [[ "$prompt" == /my-notification-on* ]] || [[ "$prompt" == *"notify:on"* ]]; then
    touch "$state_file" 2>/dev/null
    echo '{"systemMessage": "TASAN Trips: Benachrichtigungen AN (nur diese Sitzung)."}'
elif [[ "$prompt" == *"notify:off"* ]]; then
    rm -f "$state_file" 2>/dev/null
    echo '{"systemMessage": "TASAN Trips: Benachrichtigungen AUS."}'
fi

exit 0
