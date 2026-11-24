---
name: my-notification-on
description: Mark a task so that ntfy.sh push notifications are sent for this task only; combinable with other commands, e.g. "/goal /my-notification-on <condition>"
disable-model-invocation: true
---
# /my-notification-on

A **per-task option**, not a session setting. The token `/my-notification-on`
anywhere in a prompt (standalone, e.g. `/goal /my-notification-on <Bedingung>`
or `/my-notification-on <Auftrag>`) makes the hooks send ntfy.sh pushes
(topic `tasan-trips`) for **that task only**. When the task finishes or the next
prompt is submitted, it is switched off again. Next task = off by default.

Enforcement is done by hooks (`.claude/hooks/notify.py`), not by this text.
See `docs/NOTIFICATIONS.md`.

## Process
1. If this skill was invoked at the start of a prompt with arguments, treat the
   arguments as the actual task and carry it out.
2. If there are no arguments, reply with exactly one line and do nothing else.
3. Never send notifications yourself and never touch the hook state directory.

## Output (no arguments)
```
🔔 Notifications are on for this task only.
```
