# Saradakosh Coordination Status

Last updated: 2026-09-06

## Current State

- Phase: portfolio multi-project infrastructure bootstrap
- Current owner: Anti-Gravity
- Temporary canonical task: GitHub Issue #9 — `PORTFOLIO-INFRA-001 — Establish durable multi-project ChatGPT/Codex/AntiGravity control plane`
- Priority: CRITICAL GOVERNANCE — complete and receive ChatGPT acceptance before normal feature work resumes
- Preserved next Saradakosh feature task: GitHub Issue #8 — `SQ-AG-001 — Saradakosh Quiz v1 Foundation`
- Detailed preserved feature specification: `.agents/tasks/SQ-AG-001.md`
- Active review task: None
- Next required action: Anti-Gravity receives only `Work on open task.` It must resolve this Saradakosh repository from Git, inspect live GitHub state, select Issue #9 because it is the explicit higher-priority portfolio bootstrap, and execute it across the authorized project folders/repositories. After Issue #9 is marked REVIEW_READY, the owner tells ChatGPT only `Check last task.`. ChatGPT reviews directly from GitHub. Once accepted, `SQ-AG-001` / Issue #8 becomes the next Saradakosh implementation task.

## Agent State

- ChatGPT: COORDINATING / awaiting portfolio bootstrap implementation
- Anti-Gravity: ACTIVE — primary implementer for `PORTFOLIO-INFRA-001`
- Codex: AVAILABLE — must not implement the same portfolio bootstrap scope concurrently; may later review/remediate under the portfolio takeover protocol.

## Portfolio Coordination Rule

All agents must follow `.agents/PORTFOLIO_MULTI_AGENT_PROTOCOL.md` in addition to the existing Saradakosh safety protocol. For active/unmerged work, live GitHub Issue/PR/review-thread state outranks this status snapshot if they differ.

The owner's permanent interface is:

- implementation agent: `Work on open task.`
- ChatGPT: `Check last task.`

The owner is not responsible for supplying Issue numbers, task IDs, branches, reports, repository status, or previous-agent summaries.

Project resolution is repository/workspace scoped. An implementation agent must work from the current project folder/repository and must not jump to another project's open task merely because it is newer. Issue #9 is a deliberate one-time cross-project exception because it explicitly authorizes portfolio bootstrap across the user's project folders.

## Mandatory Workspace State for Implementation Tasks

Before starting any real implementation task, Anti-Gravity and Codex must follow the current `.agents/AGENTS.md`, `.agents/PORTFOLIO_MULTI_AGENT_PROTOCOL.md`, and `.agents/COORDINATION_PROTOCOL.md` on `main`, including the clean-worktree rules.

If an existing local checkout contains pre-existing uncommitted or untracked files, the implementation agent must preserve them and perform implementation in a clean isolated Git worktree or separate clone where appropriate. No agent may silently overwrite, stash, clean, restore, commit, or otherwise absorb foreign local changes.

For Saradakosh feature work, the existing `C:\Saradakosh antigravity` checkout is known to contain unrelated local changes. Preserve it. Issue #9 must also verify each other project folder independently before modifying or deleting anything.

## Preserved Product Track

Current Saradakosh product initiative after portfolio bootstrap: Saradakosh Quiz v1

Established product constraints remain unchanged:
- mobile-first responsive single-page quiz UI
- languages initially: English, Hindi, Bengali
- 25 MCQs arranged as five progressively harder sets of five
- one conceptual question bank shared across languages
- six-book canonical source corpus only
- RKMM verification source preferred in selected language when the exact canonical passage is mapped; otherwise English canonical source
- guest quiz use allowed; login required when the user requests the persistent Scorecard

## Current Task Assets

- GitHub Issue #9 — temporary canonical portfolio infrastructure task
- GitHub Issue #8 — preserved next Saradakosh feature task
- `.agents/tasks/SQ-AG-001.md` — authoritative detailed feature specification, unchanged
- `.agents/task_assets/SQ-AG-001_QUESTION_BANK.csv` — accepted 25-question multilingual bank, unchanged

Implementation agents must not edit this status file unless a task explicitly authorizes it; ChatGPT owns coordination-state updates.