---
name: my-next-task
description: Identify the single highest-impact next implementation step
disable-model-invocation: true
---
# /my-next-task

Identify the single highest-impact implementation step.

## Process
1. Read `PROJECT_STATUS.md`: `## ▶ Active Video` first (its **Next steps** are the candidates), then the active video's section and architectural notes. Never default to a video just because it appears first in the file.
2. Cross-check with `git log -5` that the active video is really the one being worked on; flag a mismatch
3. Identify the one task that unblocks the most downstream work
4. Explain why it's the priority
5. Specify required inputs and expected outputs
6. Ask: "Soll ich loslegen?" to confirm

## Output Format
```
## Highest-Impact Next Task

**What:** [Task title]
**Why:** [Explain how this unblocks downstream work]

**Inputs Needed:**
- [any prerequisites or clarifications needed]

**Expected Output:**
- [what will be delivered]

**Estimated Scope:** [e.g., "30 min", "1-2 hours"]

Soll ich loslegen?
```

Respect the workflow in `docs/PRODUCTION_STANDARDS.md` §7: the user selects scenes and cuts in CapCut; never propose building the rough cut or CapCut projects as the next task — propose reviewing the cut (`/my-review-roughcut`) or support work instead. Stay within the active video unless explicitly asked; avoid proposing work that isn't in `PROJECT_STATUS.md` or follows from it.
