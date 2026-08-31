# /daily-project-closeout

Standardize end-of-session checkpoints to preserve project continuity.

## Six-Step Workflow

### 1. Status Documentation
- Update PROJECT_STATUS.md with:
  - What was implemented this session
  - Current milestones (completed / in progress / blocked)
  - New decisions made
  - Updated next steps (prioritized)
  - Any architectural notes discovered

### 2. Session Logging
- Timestamp: today's date
- What was completed (bullet list)
- Architectural choices made (why, not just what)
- Standards or patterns established
- Lessons learned or gotchas discovered

### 3. Standards Extraction
- Document any successful patterns found
- Note anti-patterns to avoid
- Update CLAUDE.md if new guidance emerged
- Link related decisions for future reference

### 4. Structure Validation
- [ ] No temporary/debug files in git staging
- [ ] All assets in proper locations (public/, src/, etc.)
- [ ] No duplicate content or outdated code
- [ ] Documentation matches folder organization
- [ ] .gitignore is up to date

### 5. Git Preparation
- Review staged changes with `git diff --staged`
- Stage intentional work only (avoid auto-staging everything)
- Craft commit message: summary + why
- Do NOT push automatically; wait for explicit user confirmation

### 6. Continuity Preservation
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
| Status updated | ✓ | [brief note] |
| Logged session | ✓ | [brief note] |
| Standards extracted | ✓ | [brief note] |
| Structure validated | ✓ | [brief note] |
| Git ready | ✓ | [commit message] |
| Continuity preserved | ✓ | [brief note] |

**Next session:** Can resume from PROJECT_STATUS.md next steps
```

## Key Principles
- **Repository as memory:** PROJECT_STATUS.md is architectural continuity independent of chat history
- **No push without consent:** Stage for review, never auto-push
- **Meaningful commits:** Preserve reasoning for future reference
- **Resumable state:** Next session inherits complete context
