# TASAN MEDIA Trips — Mobile Notifications (ntfy.sh)

Optional push notifications to your phone via [ntfy.sh](https://ntfy.sh), topic `tasan-trips`, so you can step away from the terminal and still know when Claude needs you.

## Rules (enforced by hooks, not by prompts)

1. **Off by default.** Every new, resumed or cleared session starts with notifications OFF (`SessionStart` hook deletes the session's state).
2. **Only `/my-notification-on` switches them on** — and only when it is the first word of a prompt *you* submit. Not `/goal`, not `/my-goal`, not the text "notify:on" inside a prompt, not subagents, background tasks, scripts or tests.
3. **`/my-notification-off` switches them off** for the current session.
4. **Per session.** State lives in `.claude/notify-state/<session_id>` (gitignored); parallel sessions never affect each other.
5. State is deleted when the session ends (`SessionEnd`) and files older than a day are purged at the next session start.

## Usage

| Action | How |
|---|---|
| Turn ON for this session | `/my-notification-on` |
| Turn OFF for this session | `/my-notification-off` |
| Default | **OFF** |

You get a short confirmation in the chat ("Benachrichtigungen AN/AUS") when a toggle takes effect.

## What triggers a push (only while ON)

- **Claude needs your input or approval** — official `Notification` hook event (permission prompts, Claude waiting on you).
- **A turn ends** — official `Stop` hook event. It also fires on `/clear`, `/resume`, `/compact`, and once per turn during a multi-turn built-in `/goal` run — so a goal run can produce several pings.

## What's in the message

Always a short, fixed, non-sensitive string ("Claude braucht deine Eingabe/Freigabe" / "Auftrag beendet") plus the title "TASAN Trips". Never prompt text, file contents or tool output.

## How it works

- `.claude/hooks/toggle.sh` — `UserPromptSubmit`. Compares the first word of the submitted prompt, exactly, with `/my-notification-on` / `/my-notification-off`; creates/removes `.claude/notify-state/<session_id>`. Nothing else changes state.
- `.claude/hooks/session-start.sh` — `SessionStart`. Removes this session's state on `startup`/`resume`/`clear` (keeps it on `compact`); purges state files older than a day.
- `.claude/hooks/session-end.sh` — `SessionEnd`. Removes this session's state.
- `.claude/hooks/ntfy-ping.sh` — `Notification`/`Stop`. Silent unless this session's state file exists; then POSTs to `https://ntfy.sh/tasan-trips` (5 s timeout, failures swallowed, never blocks).
- `.claude/settings.json` wires the hooks and denies Claude file edits / `touch` on `.claude/notify-state/` so the model cannot flip the switch itself.
- Scripts parse hook JSON with `python3` (no `jq`). Topic override: env var `TASAN_NTFY_TOPIC`.
- **Tests:** `bash scripts/test-notifications.sh` — isolated temp dir, stubbed `curl`, sends no real pushes (default-off, exact-command activation, parallel sessions, session reset/purge, silent-when-off).

## Known limitations

1. `Stop` fires on `/clear`/`/resume`/`/compact` and per goal turn (see above).
2. ntfy.sh topics are not access-controlled: anyone who knows `tasan-trips` can publish to or read it. The name is in this public-ish repo. If unwanted pushes ever come from elsewhere, switch to a long random topic via `TASAN_NTFY_TOPIC` and resubscribe on the phone.
3. Technical enforcement covers Claude's own tools through permission rules; a user or process with shell access can of course still create a state file by hand.
4. New hook configuration may need a session restart to take effect.
