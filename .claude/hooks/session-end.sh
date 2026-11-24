#!/usr/bin/env bash
# TASAN Trips — SessionEnd hook: remove this session's notification state so
# nothing is left behind. Never blocks; exit 0.
set -u
STATE_DIR=".claude/notify-state"
PY=python3
command -v "$PY" >/dev/null 2>&1 || PY=python
sid="$(cat | "$PY" -c "
import sys, json
try:
    print(json.load(sys.stdin).get('session_id', ''))
except Exception:
    print('')
" 2>/dev/null)"
[ -n "$sid" ] && rm -f "$STATE_DIR/$sid" 2>/dev/null
exit 0
