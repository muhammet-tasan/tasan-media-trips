---
name: my-list-commands
description: List all custom project commands
disable-model-invocation: true
---
# /my-list-commands

Lists all available project management commands.

## Custom Commands for TASAN MEDIA Trips

This project includes seven specialized commands to streamline workflow:

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

6. **`/my-review-roughcut`** — Reviews your CapCut rough cut of the active video with time-based suggestions (dramaturgy, image quality, retention, scene length, information, B-roll placement, privacy) and points out overlooked raw-footage scenes; writes `analysis/<slug>/ROUGHCUT_REVIEW.md`.

7. **`/my-notification-on`** — Per-task option: add it to any prompt (e.g. `/goal /my-notification-on <Bedingung>`) to get ntfy.sh push notifications for that task only. Off by default; resets automatically after the task. See `docs/NOTIFICATIONS.md`.

These commands maintain PROJECT_STATUS.md as architectural memory, ensuring continuity across sessions and handoffs.
