# Saradakosh Coordination Status

Last updated: 2026-09-05

## Current State

- Phase: Multi-agent coordination active
- Current owner: ChatGPT coordination
- Active feature task: None
- Active review task: None
- Next required action: ChatGPT will issue the first bounded Anti-Gravity task as `.agents/tasks/SQ-AG-001.md` when ready.

## Agent State

- ChatGPT: READY
- Anti-Gravity: READY — one-time GitHub handshake accepted and merged
- Codex: STANDBY — use only at a declared checkpoint

## Mandatory Workspace State for Implementation Tasks

Before starting any real implementation task, Anti-Gravity and Codex must follow the current `.agents/AGENTS.md` and `.agents/COORDINATION_PROTOCOL.md` on `main`, including the clean-worktree rules added after the initial handshake was created.

If the existing local checkout contains any pre-existing uncommitted or untracked files, the implementation agent must preserve them and perform the task in a clean isolated Git worktree or separate clone based on the latest `origin/main`. No agent may silently overwrite, stash, clean, restore, commit, or otherwise absorb foreign local changes.

## Product Track

Current product initiative: Saradakosh Quiz v1

Established product constraints include:
- mobile-first responsive single-page quiz UI
- languages initially: English, Hindi, Bengali
- 25 MCQs arranged as five progressively harder sets of five
- one conceptual question bank shared across languages
- six-book canonical source corpus only
- RKMM verification source preferred in selected language when the exact canonical passage is mapped; otherwise English canonical source
- guest quiz use allowed; login required when the user requests the persistent Scorecard

This file is owned by ChatGPT coordination. Implementation agents must not edit it.
