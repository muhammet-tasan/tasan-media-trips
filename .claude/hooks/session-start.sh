#!/usr/bin/env bash
# TASAN Trips — SessionStart hook: every new, resumed or cleared session starts
# with notifications OFF (deletes this session's state file). A session that is
# only compacted keeps its state. Also purges state files older than 1 day
# (leftovers from sessions that never ended cleanly). Never blocks; exit 0.
set -u

STATE_DIR=".claude/notify-state"
mkdir -p "$STATE_DIR" 2>/dev/null

PY=python3
command -v "$PY" >/dev/null 2>&1 || PY=python

input="$(cat)"
eval "$(printf '%s' "$input" | "$PY" -c "
import sys, json, shlex
try:
    d = json.load(sys.stdin)
except Exception:
    d = {}
print('session_id=' + shlex.quote(str(d.get('session_id', ''))))
print('source=' + shlex.quote(str(d.get('source', ''))))
" 2>/dev/null)"

if [ -n "${session_id:-}" ] && [ "${source:-}" != "compact" ]; then
    rm -f "$STATE_DIR/$session_id" 2>/dev/null
fi

find "$STATE_DIR" -type f -mtime +0 -delete 2>/dev/null
exit 0
