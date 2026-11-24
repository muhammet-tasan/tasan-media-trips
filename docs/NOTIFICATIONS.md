# TASAN MEDIA Trips — Mobile Notifications (ntfy.sh)

Optional push notifications to your phone via [ntfy.sh](https://ntfy.sh), topic `tasan-trips`, so you can step away from the terminal and still know when Claude needs you.

## Usage

| Action | How |
|---|---|
| Turn ON for this session | Run `/my-goal` (turns on automatically), **or** put `notify:on` anywhere in a normal prompt |
| Turn OFF for this session | Put `notify:off` anywhere in a normal prompt |
| Default | **OFF** — nothing is sent unless you explicitly turn it on |

You'll get a short confirmation in the chat ("Benachrichtigungen AN/AUS") when a toggle takes effect.

## What triggers a push

- **Claude needs your input or approval** — fires on the official `Notification` hook event (permission prompts, Claude waiting on you).
- **A turn ends** — fires on the official `Stop` hook event. **Caveat:** `Stop` also fires on `/clear`, `/resume`, and `/compact`, not only on a genuinely finished task — so you may get an extra ping around those actions. This is standard Claude Code behavior, not a bug in this setup.
- **Nothing else.** No ping on ordinary questions, and no ping per individual tool call — only these two event types.

## What's in the message

Always a short, fixed, non-sensitive string ("Claude braucht deine Eingabe/Freigabe" / "Auftrag beendet") plus a generic "TASAN Trips" title. **Never** your prompt text, file contents, or tool output — nothing sensitive ever leaves this machine via these hooks.

## Scope

This is set up **only for the TASAN Trips project** (`.claude/settings.json` in this repo), not globally for all Claude Code projects on this machine. On/off state is **per session** (`.claude/notify-state/<session_id>/`, gitignored) — running two sessions in this project at once, one can have notifications on while the other stays off.

## How it works (for future reference / debugging)

- `.claude/hooks/toggle.sh` — `UserPromptSubmit` hook. Reads the submitted prompt; if it starts with `/my-goal` or contains `notify:on`, creates `.claude/notify-state/<session_id>`; if it contains `notify:off`, removes it. Never blocks, never modifies the prompt itself.
- `.claude/hooks/ntfy-ping.sh` — `Notification`/`Stop` hook. Checks whether `.claude/notify-state/<session_id>` exists; if not, stays silent. If it exists, POSTs a short message to `https://ntfy.sh/tasan-trips` with a 5-second timeout, swallowing any failure (unreachable network, ntfy.sh down) so Claude is never blocked waiting on it.
- Both scripts parse the hook's JSON via `python3` (no `jq` dependency — not installed on this machine).
- The ntfy topic defaults to `tasan-trips`; override with the `TASAN_NTFY_TOPIC` environment variable if you ever need a different topic.

## Known limitations

1. `Stop` fires on `/clear`/`/resume`/`/compact` too — see above.
2. Anyone who knows the topic name `tasan-trips` can publish to or subscribe to it — ntfy.sh topics aren't access-controlled by default. The topic name is now in this committed repo. Treat it like a semi-public channel name, not a secret; if that ever becomes a problem, rename the topic (update `TASAN_NTFY_TOPIC` or the default in `ntfy-ping.sh`) and resubscribe on your phone.
3. The `/my-goal` → notifications-on link depends on Claude Code passing the raw, unexpanded prompt text (`"/my-goal ..."`) to the `UserPromptSubmit` hook, which is standard documented behavior but wasn't separately re-verified end-to-end in a live interactive session — the plain `notify:on`/`notify:off` path was fully tested and confirmed, including a real ntfy.sh delivery. Try `/my-goal` once and check for the "Benachrichtigungen AN" confirmation to be sure.
4. New hook configuration may need a one-time `/hooks` (reload) or a session restart to take effect, since `.claude/settings.json` didn't exist before this was set up.
