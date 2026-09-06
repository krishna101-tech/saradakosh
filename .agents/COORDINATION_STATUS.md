# Saradakosh Coordination Status

Last updated: 2026-09-06

## Current State

- Phase: Saradakosh Quiz v1 implementation
- Current owner: Anti-Gravity
- Active feature task: `SQ-AG-001` — Saradakosh Quiz v1 Foundation
- Canonical live task: GitHub Issue #8 — `SQ-AG-001 — Saradakosh Quiz v1 Foundation`
- Detailed tracked specification: `.agents/tasks/SQ-AG-001.md`
- Active review task: None
- Next required action: Anti-Gravity receives only `Work on open task.` It must resolve this repository from Git, inspect live GitHub state, select Issue #8, then execute the unchanged tracked specification from a clean isolated worktree/clone. After Anti-Gravity pushes its PR/evidence and marks it REVIEW_READY, the owner tells ChatGPT only `Check last task.`; ChatGPT reviews directly in GitHub.

## Agent State

- ChatGPT: COORDINATING / awaiting SQ-AG-001 implementation
- Anti-Gravity: ACTIVE — primary implementer for `SQ-AG-001`
- Codex: AVAILABLE — may review/remediate when assigned or may take over only under the portfolio takeover protocol; it must not implement the same scope concurrently.

## Portfolio Coordination Rule

All agents must follow `.agents/PORTFOLIO_MULTI_AGENT_PROTOCOL.md` in addition to the existing Saradakosh safety protocol. For active/unmerged work, live GitHub Issue/PR/review-thread state outranks this status snapshot if they differ.

The owner's permanent interface is:

- implementation agent: `Work on open task.`
- ChatGPT: `Check last task.`

The owner is not responsible for supplying Issue numbers, task IDs, branches, reports, or repository status.

## Mandatory Workspace State for Implementation Tasks

Before starting any real implementation task, Anti-Gravity and Codex must follow the current `.agents/AGENTS.md`, `.agents/PORTFOLIO_MULTI_AGENT_PROTOCOL.md`, and `.agents/COORDINATION_PROTOCOL.md` on `main`, including the clean-worktree rules.

If the existing local checkout contains any pre-existing uncommitted or untracked files, the implementation agent must preserve them and perform the task in a clean isolated Git worktree or separate clone based on the latest `origin/main`. No agent may silently overwrite, stash, clean, restore, commit, or otherwise absorb foreign local changes.

For `SQ-AG-001`, the existing `C:\Saradakosh antigravity` checkout is known to contain unrelated local changes. Anti-Gravity must therefore use a clean isolated worktree/clone for implementation.

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

## Current Task Assets

- GitHub Issue #8 — canonical live task/review surface
- `.agents/tasks/SQ-AG-001.md` — authoritative detailed implementation specification
- `.agents/task_assets/SQ-AG-001_QUESTION_BANK.csv` — accepted 25-question multilingual bank for this task

Implementation agents must not edit this status file unless a task explicitly authorizes it; ChatGPT owns coordination-state updates.