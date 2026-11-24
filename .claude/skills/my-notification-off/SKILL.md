---
name: my-notification-off
description: Turn off ntfy.sh mobile push notifications for this session (handled by the toggle.sh hook)
disable-model-invocation: true
---
# /my-notification-off

Turns mobile push notifications **off** for this session. The actual switch is
done by the `UserPromptSubmit` hook (`.claude/hooks/toggle.sh`), which sees
`/my-notification-off` as the submitted prompt. Notifications are off by
default in every new session; only `/my-notification-on` enables them.

## Process
1. Confirm in one line that notifications are off for this session.
2. Do nothing else; never create or edit files in `.claude/notify-state/`.

## Output Format
```
🔕 Mobile notifications are off for this session.
```
