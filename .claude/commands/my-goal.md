# /my-goal

Define a concrete goal for this session and work toward it with mobile push
notifications on, so you can step away from the terminal and still get
pinged (ntfy.sh, topic `tasan-trips`) when Claude needs input or finishes.

## Notifications (automatic)

Invoking `/my-goal` turns on push notifications for **this session only** —
handled by the `UserPromptSubmit` hook (`.claude/hooks/toggle.sh`), which
sees `/my-goal` as the submitted prompt and enables notifications before this
command's instructions are even processed. No separate step needed.

Turn them off again any time with `notify:off` in a normal prompt (works
mid-session, not just at the start). See `docs/NOTIFICATIONS.md` for the
full mechanism and its limits.

## Process

1. If a goal wasn't given as an argument, ask for it in one or two sentences.
2. Restate the goal and any constraints back, to confirm scope before starting.
3. Work toward it with minimal check-ins — the point of this command is that
   the user doesn't need to watch the terminal. Only stop for genuinely
   blocking questions (missing input, a decision only the user can make).
4. Don't send notifications yourself — the `Notification` and `Stop` hooks
   already do that automatically whenever this session needs input or a
   turn ends. Adding your own would duplicate them.

## Output Format

```
## Goal

**Working toward:** [one-line restatement of the goal]
**Constraints:** [any stated limits, or "None stated"]

🔔 Mobile notifications are on for this session (ntfy.sh/tasan-trips).

Starting now.
```
