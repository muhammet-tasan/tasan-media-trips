---
name: my-project-status
description: Show the active video's status first (from the Active Video block and Video Registry in PROJECT_STATUS.md), then the other videos
disable-model-invocation: true
---
# /my-project-status

Summarize the **active video** first, then the rest. Never hard-code a video name — everything comes from `PROJECT_STATUS.md`.

## Process
1. Read `PROJECT_STATUS.md`: the `## ▶ Active Video` block, the `## Video Registry` table, and the active video's `## Video: <title>` section.
2. **Verify against evidence, don't copy blindly:** run `git log -8 --format='%ad %s' --date=short` and look at which `src/<slug>/`, `analysis/<slug>/`, `out/<slug>/` changed most recently. If the newest work belongs to a different video than the one marked active, or the Active block contradicts the registry (zero or several active), say so explicitly and propose the correction instead of silently trusting either.
3. Report the active video: phase, resume point, last decisions, concrete next steps, open items from its section.
4. List the other videos grouped by status (paused / planned / done) with one line each — no detail unless asked.
5. Mention shared tooling only if it changed recently or is blocking.

## Output Format
```
## Active: <Title> (<slug>) — <phase>
**Resume point:** ...
**Last decisions:** ...
✓ Done: ...      ○ Open: ...

## Next steps
1. ...

## Other videos
- paused: <title> — <one line>
- planned: <title>

## Blockers / Decisions needed
- ... or "None"

(⚠ Status vs. evidence mismatch: ... — only if found)
```

End with: "Soll ich loslegen?"
