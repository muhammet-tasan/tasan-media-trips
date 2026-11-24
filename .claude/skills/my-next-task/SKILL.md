---
name: my-next-task
description: Identify the single highest-impact next implementation step
disable-model-invocation: true
---
# /my-next-task

Identify the single highest-impact implementation step.

## Process
1. Read PROJECT_STATUS.md
2. Review pending items and architectural notes
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

Avoid proposing work outside PROJECT_STATUS.md unless explicitly asked.
