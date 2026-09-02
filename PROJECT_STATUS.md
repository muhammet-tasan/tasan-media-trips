# TASAN MEDIA Trips — Project Status

**Last Updated:** 2026-09-02  
**Current Phase:** CapCut editing (Mulhouse video)

## Project Overview
YouTube trip videos combining DJI Pocket 3 footage, German voice-over, and CapCut editing, with Remotion used only to produce specific B-roll clips, maps, titles, or motion graphics that CapCut can't do natively.

## Workflow (Corrected)
1. DJI Pocket 3 footage
2. → Manual rough/final editing in **CapCut**
3. → Plan and record German voice-over
4. → Identify places in the CapCut edit where additional B-roll / visual explanation is needed
5. → Create *only those specific* B-roll clips, maps, titles, or motion graphics in **Remotion**
6. → Render them
7. → Import back into CapCut
8. → Final edit and YouTube export in CapCut

**Remotion is not used to assemble the complete trip video, organize DJI footage, or sync the full voice-over.** It produces isolated graphic elements on demand, driven by gaps identified during the CapCut edit.

## Current Video: Mulhouse Automobile Museum

### Status
- [ ] Footage organization (DJI Pocket 3 clips) — in CapCut, not Remotion
- [ ] Manual CapCut edit (primary cut)
- [ ] Voice-over recording (German narration)
- [ ] Identify B-roll/graphics gaps in the CapCut edit
- [ ] Create targeted Remotion clips (only as gaps are identified)
- [ ] Final CapCut assembly
- [ ] Upload and publishing

### Completed Milestones
- Project structure initialized
- Claude commands set up
- Remotion workspace prepared (minimal)

### Blocked/In Progress
None yet; awaiting continued CapCut editing to surface first B-roll need.

### Decisions Made
- Keep Remotion minimal initially (no complex state management)
- Use React + TypeScript for type safety
- Stage video assets in `public/` during development
- **CapCut is the main editor; Remotion only builds specific, isolated B-roll/graphics elements identified during the CapCut edit — not the full composition**

### Next Steps (Priority Order)
1. Continue editing the Mulhouse Automobile Museum video in CapCut
2. Identify the first place where Remotion B-roll (or a map/title/motion graphic) is needed
3. (Once identified) scope and build that specific Remotion element

### Architectural Notes
- Remotion handles isolated, on-demand elements only (specific B-roll, graphics, titles) — not full-video compositing
- German voice-over is recorded and synced within CapCut, not Remotion
- Final assembly and export happen entirely in CapCut
- Keep composition code simple; avoid over-abstraction until patterns emerge
- Do not create new Remotion components until a concrete B-roll need is identified from the CapCut edit

### Session Log

**2026-09-02**
- Corrected the project workflow: CapCut is the primary editor for the full trip video; Remotion is scoped down to producing only specific B-roll/graphics elements identified during editing, not the whole composition or voice-over sync.
- Architectural choice: Remotion elements are demand-driven — built only after a concrete gap surfaces in the CapCut edit — rather than planned upfront, avoiding speculative component work.
- Standard established: no new Remotion components until a specific B-roll/graphic need is identified from actual CapCut editing.
- Updated CLAUDE.md to reflect Remotion's narrow, on-demand role alongside CapCut as primary editor.
- No code or Remotion components changed this session; documentation/workflow correction only.

### Last Session Summary
Corrected the project workflow: CapCut is the primary editor for the full trip video; Remotion is scoped down to producing only specific B-roll/graphics elements identified during editing, not the whole composition or voice-over sync.
