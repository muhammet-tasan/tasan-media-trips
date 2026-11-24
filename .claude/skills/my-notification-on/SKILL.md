---
name: my-notification-on
description: Turn on ntfy.sh mobile push notifications for this session (handled by toggle.sh hook)
disable-model-invocation: true
---
# /my-notification-on

Turns on mobile push notifications (ntfy.sh, topic `tasan-trips`) for **this
session only**, so you can step away from the terminal and still get pinged
when Claude needs input or finishes a turn.

## How it works (automatic)

Handled by the `UserPromptSubmit` hook (`.claude/hooks/toggle.sh`), which sees
`/my-notification-on` as the submitted prompt before this command's text is
processed. Off by default in every session; turn off again with `/my-notification-off`. See
`docs/NOTIFICATIONS.md`.

Goals are not handled here — use Claude Code's built-in `/goal <condition>` for
that (run `/my-notification-on` first if you want pings during a goal run).

## Process

1. Confirm in one line that notifications are on for this session.
2. Don't send notifications yourself — the `Notification` and `Stop` hooks do.

## Output Format

```
🔔 Mobile notifications are on for this session (ntfy.sh/tasan-trips).
```
