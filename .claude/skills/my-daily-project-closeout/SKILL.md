---
name: my-daily-project-closeout
description: End-of-session checkpoint: update PROJECT_STATUS.md, validate structure, prepare git commit
disable-model-invocation: true
---
# /my-daily-project-closeout

Standardize end-of-session checkpoints to preserve project continuity.

## Workflow (Step 0 + six steps)

### 0. Identify the video worked on (always first)
- Determine which video this session actually worked on from evidence: files changed (`git status`, `git diff --stat`), paths touched (`src/<slug>/`, `analysis/<slug>/`, `out/<slug>/`) and the conversation. Never assume it is the video that was marked active.
- Compare with `## ▶ Active Video` in `PROJECT_STATUS.md`. If different: ask the user whether this is a switch of the active video (then flip registry statuses: new one **active**, previous one **paused**/**done**) or a side task.
- New video started this session (new slug)? Add a row to `## Video Registry`, a row to `## Video Assets (portable)` (folder names only, never absolute paths) and a `## Video: <title>` section — not a "Shared Tooling" entry.

### 1. Status Documentation (single source of truth, no duplicates)
Update `PROJECT_STATUS.md` in these places only:
- `## ▶ Active Video`: **Phase**, **Resume point** (exactly where the next session starts), **Last decisions** (decisions made this session, with the why), **Next steps (concrete)** — 1–3 actionable steps that name files/commands, not vague topics
- **Process step** in the Active Video block (stage number from `docs/PRODUCTION_PROCESS.md`, e.g. `S3 — Review v1 offen`), so `/my-next-task` and `/my-continue-project` start at the right stage
- `## Video Registry`: status + one-line state for the video worked on (and any video whose status changed)
- The worked-on video's `## Video: <title>` section: tick/add checklist items, record decisions and gotchas specific to that video
- `**Last Updated:**` date in the header
Do NOT create extra status/notes files, and do not copy the resume point into other documents (CLAUDE.md, README, memory) — link to it instead.

### 2. Session Logging
Add one entry to `## Session Log (all videos, newest first)` at the top, tagged with the video slug:
- Date and `[slug]`
- What was completed (bullet list)
- Architectural choices made (why, not just what)
- Standards or patterns established
- Lessons learned or gotchas discovered

### 3. Standards Extraction
- **Learnings:** add every new insight, tip or trick from this session to `docs/LEARNINGS.md` (format and category headings there; one line each, with source and process stage). Skip nothing that would save time next video.
- **Remotion library:** a component built/changed this session and approved by the user → is it registered in `docs/REMOTION_LIBRARY.md` (status, path, config, limits)? If not, add it now (`PRODUCTION_STANDARDS` §9)
- Document any successful patterns found
- Note anti-patterns to avoid
- Update CLAUDE.md if new guidance emerged (rules only — never a list of videos or their status)
- If the lesson is about the project memory itself, add it to `## Lessons Learned` in `PROJECT_STATUS.md`
- Link related decisions for future reference

### 4. Structure Validation
- [ ] No temporary/debug files in git staging
- [ ] All assets in proper locations (public/, src/, etc.)
- [ ] No duplicate content or outdated code
- [ ] Documentation matches folder organization
- [ ] Exactly one video is `active` in the registry, and it matches the `## ▶ Active Video` block
- [ ] No video name hard-coded in skills or CLAUDE.md
- [ ] .gitignore is up to date

### 5. Git Preparation
- Review staged changes with `git diff --staged`
- Stage intentional work only (avoid auto-staging everything)
- Craft commit message: summary + why
- Do NOT push automatically; wait for explicit user confirmation

### 6. Continuity Preservation
- Read the `## ▶ Active Video` block back as if you were a fresh session: could `/my-continue-project` resume from it without this chat? If not, fix it now
- Ensure PROJECT_STATUS.md is complete and readable for next session
- Document any edge cases or gotchas
- Note if external dependencies (footage, assets) are needed
- Confirm next session can resume immediately from status

## Output
Present a summary table:
```
## Session Checkpoint Complete

| Step | Status | Notes |
|------|--------|-------|
| Video identified | ✓ | [slug, switched/unchanged] |
| Status updated | ✓ | [Active block + registry + video section] |
| Logged session | ✓ | [brief note] |
| Standards extracted | ✓ | [brief note] |
| Structure validated | ✓ | [brief note] |
| Git ready | ✓ | [commit message] |
| Continuity preserved | ✓ | [brief note] |

**Next session:** resumes on <active video slug> at <resume point>
```

## Key Principles
- **Repository as memory:** PROJECT_STATUS.md is architectural continuity independent of chat history
- **No push without consent:** Stage for review, never auto-push
- **Meaningful commits:** Preserve reasoning for future reference
- **Resumable state:** Next session inherits complete context
