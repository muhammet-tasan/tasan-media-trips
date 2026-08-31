# TASAN MEDIA Trips — Project Guide

This project creates YouTube trip videos combining DJI Pocket 3 footage, German voice-over, and Remotion-powered motion graphics.

## How to Work with This Project

### Session Management
Each session should follow a clear start → work → checkpoint cycle:

1. **Start a session:** `/continue-project` reviews PROJECT_STATUS.md and offers direction
2. **Work:** Make edits, run tests, implement features
3. **End a session:** `/daily-project-closeout` creates a checkpoint to preserve continuity

### Key Files
- **PROJECT_STATUS.md** – Persistent project memory; updated at session end
- **.claude/commands/** – Workflow commands for project management
- **src/** – Remotion compositions (React + TypeScript)
- **public/** – Static assets and video files

### Principles
- **No automatic git push** – Stage changes intentionally
- **Meaningful checkpoints** – Preserve architectural reasoning
- **Resumability** – Future sessions inherit full context
- **Simplicity** – Only add what serves the workflow

## Videos in Progress

### Mulhouse Automobile Museum
First production video; status tracked in PROJECT_STATUS.md.

## Technical Setup
- **Remotion:** React-based video composition
- **TypeScript:** Full type safety for compositions
- **Node.js:** Build and runtime environment

For implementation details, see the specific task when starting work.
