# /my-list-commands

Lists all available project management commands.

## Custom Commands for TASAN MEDIA Trips

This project includes six specialized commands to streamline workflow:

1. **`/my-project-status`** — Current phase, completed tasks, and planned next steps (reads PROJECT_STATUS.md)

2. **`/my-continue-project`** — Resumes from PROJECT_STATUS.md and asks for next work direction

3. **`/my-next-task`** — Identifies the single highest-impact implementation step to prioritize

4. **`/my-daily-project-closeout`** — Executes standardized end-of-session checkpoint:
   - Updates PROJECT_STATUS.md with session progress
   - Documents architectural decisions and lessons learned
   - Validates project structure (no stale files, proper organization)
   - Stages meaningful git commits (no automatic push)
   - Preserves continuity for next session

5. **`/my-list-commands`** — Displays this list

6. **`/my-goal`** — Define a session goal and work toward it hands-off; automatically turns on mobile push notifications (ntfy.sh) for this session so you get pinged when Claude needs input or finishes. Toggle manually anytime with `notify:on` / `notify:off` in a normal prompt. See `docs/NOTIFICATIONS.md`.

These commands maintain PROJECT_STATUS.md as architectural memory, ensuring continuity across sessions and handoffs.
