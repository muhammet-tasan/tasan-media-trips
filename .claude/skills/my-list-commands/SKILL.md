---
name: my-list-commands
description: List all custom project commands
disable-model-invocation: true
---
# /my-list-commands

Lists all available project management commands.

## Custom Commands for TASAN MEDIA Trips

This project includes six specialized commands to streamline workflow:

1. **`/my-project-status`** — Active video first (phase, resume point, next steps), then other videos; verified against git history

2. **`/my-continue-project`** — Resumes the active video at its exact work step (reads PROJECT_STATUS.md, checks git history)

3. **`/my-next-task`** — Identifies the single highest-impact implementation step to prioritize

4. **`/my-daily-project-closeout`** — Executes standardized end-of-session checkpoint:
   - Updates PROJECT_STATUS.md with session progress
   - Documents architectural decisions and lessons learned
   - Validates project structure (no stale files, proper organization)
   - Stages meaningful git commits (no automatic push)
   - Preserves continuity for next session

5. **`/my-list-commands`** — Displays this list

6. **`/my-notification-on`** — Turns on mobile push notifications (ntfy.sh) for this session so you get pinged when Claude needs input or finishes. Off by default in every session; only this command switches it on. For goals, use the built-in `/goal`.

7. **`/my-notification-off`** — Turns the notifications off again for this session. See `docs/NOTIFICATIONS.md`.

These commands maintain PROJECT_STATUS.md as architectural memory, ensuring continuity across sessions and handoffs.
