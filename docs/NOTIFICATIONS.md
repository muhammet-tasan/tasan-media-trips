# TASAN MEDIA Trips — Mobile Notifications (ntfy.sh)

Optional push notifications to your phone via [ntfy.sh](https://ntfy.sh), topic `tasan-trips`. They are a **per-task option**, never a session setting.

## Rules (enforced by hooks, not by prompts)

1. **Always off by default** — every task, every session.
2. **`/my-notification-on` is a task marker.** If the token `/my-notification-on` appears as a standalone word anywhere in a prompt, notifications are sent for **that task only**. It combines with other commands and text:
   - `/my-notification-on Mach X`
   - `/goal /my-notification-on Erledigt wenn Y`
   - `Bitte Z erledigen /my-notification-on`
3. **`/goal` alone arms nothing.** Neither do `/my-goal`, `notify:on`, subagents, background tasks or tests.
4. **Auto-reset.** When the task finishes, the marker is cleared. Whenever the *next* prompt is submitted it is cleared again before anything else, so the next task starts off — even in the same session. An interrupted task is cleared at the latest by the next prompt (or session end).
5. **Per session.** State is keyed by `session_id` and bound to the task's `prompt_id`; parallel sessions never influence each other, and a Stop from any other task never pings.
6. There is no `/my-notification-off` — nothing stays on, so nothing needs switching off.

## What triggers a push (only for the marked task)

- **Task finished** — `Stop` hook. For a multi-turn `/goal` run the hook waits for the goal verdict (written to the transcript a few seconds *after* Stop) and pings only when the goal is met — or when no verdict arrives (goal cleared/aborted). Intermediate turns are silent.
- **Claude needs input/approval** — `Notification` hook, but not the plain `idle_prompt` ("waiting after finishing").

Message text is a fixed string ("Auftrag beendet" / "Claude braucht deine Eingabe/Freigabe") with the title "TASAN Trips". Never prompt text, file contents or tool output.

## How it works

- `.claude/hooks/notify.py` — single script, subcommands `prompt|stop|notification|start|end`, wired in `.claude/settings.json` to `UserPromptSubmit`, `Stop`, `Notification`, `SessionStart`, `SessionEnd`.
  - `prompt`: always clears this session's marker, then arms it (storing the hook payload's `prompt_id`, and whether `/goal` is in the prompt) if the standalone token is present.
  - `stop`: pings only if the marker exists **and** its `prompt_id` matches the Stop event's `prompt_id`; clears the marker when the task is finished.
  - `start`/`end`: reset on startup/resume/clear (not compact), clean up on session end, purge markers older than 12 h.
- Marker location: `.claude/notify-state/<session_id>` (gitignored). `settings.json` denies Claude's own file-edit and `touch` access to that folder, so the model cannot arm itself.
- Why Claude Code 2.1.331 allows this: hook payloads carry a `prompt_id` shared by the `UserPromptSubmit` and all `Stop` events of one task (also across `/goal` continuation turns, where `stop_hook_active` is `true`), and `/goal` verdicts appear as `goal_status` attachments in the transcript. Both were verified empirically, not just read from docs.
- Overrides (tests): `TASAN_NTFY_BASE`, `TASAN_NTFY_TOPIC`, `TASAN_NOTIFY_STATE_DIR`, `TASAN_NOTIFY_GOAL_WAIT`.
- **Tests:** `python3 scripts/test-notifications.py` — 47 checks against a local mock server (no real pushes): default off, what does not arm, arming forms, consecutive tasks in one session, notification event, foreign `prompt_id`, parallel sessions, `/goal` runs, session lifecycle, robustness. Re-run after touching the hook.

## Known limitations

1. **Token matching is textual:** a standalone `/my-notification-on` anywhere in a prompt arms the task, including when you merely mention it in a sentence. Wrapped in backticks/quotes or attached to other characters it does not count.
2. **Goal verdict timing:** the Stop hook polls up to 12 s per goal turn, which can delay the next goal turn by that much in the worst case. A verdict that arrives later than that is treated as "finished".
3. **Interrupts** fire no hook: the marker stays until the next prompt/session end (still bound to the old `prompt_id`, so nothing pings for other tasks).
4. ntfy.sh topics are not access-controlled: anyone who knows `tasan-trips` can publish to it. If unwanted pushes ever come from elsewhere, switch to a long random topic via `TASAN_NTFY_TOPIC` and resubscribe on the phone.
5. A user or process with shell access can still create a marker by hand; the protection covers Claude's own tools.
