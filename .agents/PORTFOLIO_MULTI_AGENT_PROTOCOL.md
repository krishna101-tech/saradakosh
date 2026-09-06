# Portfolio Multi-Agent Protocol

This repository participates in the project portfolio owned by `krishna101-tech`. This file standardizes only cross-agent coordination. Saradakosh-specific safety rules in `.agents/AGENTS.md`, `.agents/COORDINATION_PROTOCOL.md`, scoped frontend instructions, architecture docs, and task specs remain in force.

## Human interface

The project owner should need only two commands:

- to Codex or AntiGravity: `Work on open task.`
- to ChatGPT: `Check last task.`

The owner is not required to remember repository status, issue numbers, task IDs, branch names, report filenames, or which implementation agent worked last.

## Project resolution

1. If the implementation agent is inside a Git repository/worktree, that repository is the project scope. Verify it with `git rev-parse --show-toplevel` and `git remote -v`.
2. Never infer Saradakosh from chat memory if the checked-out remote says otherwise.
3. If there is no usable repository scope, discover repositories under GitHub owner `krishna101-tech` and choose actionable work deterministically using the task-selection rules below. Do not ask the owner to supply issue metadata merely because the agent lost context.
4. Cross-project files, branches, issues, and decisions must never be mixed. Every task remains owned by exactly one repository.

## Source-of-truth hierarchy for active work

For an active or unmerged task:

1. explicit product-owner decision recorded in the active GitHub Issue or canonical decision record;
2. latest ChatGPT review disposition in the Issue/PR;
3. active GitHub Issue requirements and acceptance criteria;
4. linked PR current remote head, unresolved non-outdated review threads, CI/checks, and implementation evidence;
5. repository agent/safety rules and project coordination protocol;
6. accepted-baseline project docs/state on the default branch;
7. historical reports and chat memory.

Chat memory is never sufficient proof of repository/task state.

## `Work on open task.`

The implementation agent must fetch GitHub before selecting work. Within the current repository, select in this order:

1. open task whose latest authoritative ChatGPT disposition is `CHANGES REQUESTED`;
2. already-started open task owned by the agent or awaiting implementation continuation;
3. highest-priority open task explicitly ready for implementation;
4. oldest open implementation-ready task.

`REVIEW_READY`, `ACCEPTED`, closed, blocked, product-decision, user-validation, and spec-draft tasks are not implementation work unless a later authoritative update makes them actionable again.

If no repository scope exists, apply the same ordering across accessible `krishna101-tech` repositories. Record which repository/task was selected and why.

## Start, resume, and takeover

Before editing:

- fetch default branch and active task branch/PR;
- read the complete Issue and linked decisions/evidence;
- read the latest ChatGPT disposition;
- query all unresolved non-outdated PR review threads;
- verify exact remote task-branch HEAD, local HEAD, base SHA, upstream, ahead/behind, and working-tree state;
- follow Saradakosh's mandatory dirty-tree/worktree isolation rules;
- post a GitHub start/resume comment naming the agent (`Codex` or `AntiGravity`), branch, exact starting SHA, PR, and blockers.

There is one writer per task branch. Another implementation agent may take over only after synchronizing to the exact remote head and recording the takeover in GitHub. It must not continue from stale local state or create a divergent implementation for the same scope.

## Long-task durability

A task that spans hours, sessions, usage resets, or agent changes must be recoverable from durable artifacts alone:

- canonical GitHub Issue;
- pushed task branch and exact HEAD;
- linked PR;
- project-local task/status/checkpoint records required by Saradakosh;
- coherent commits and test evidence;
- current CI/deployment evidence;
- unresolved review threads;
- latest ChatGPT review disposition.

No critical decision, blocker, next step, or implementation state may exist only in a chat window or only in unpushed local changes.

## Reports and evidence

Saradakosh may continue to require `Report by Anti-Gravity` / `Report by Codex` files as project-local evidence. Those reports are optional transport artifacts for the agents, never courier work for the owner. ChatGPT reads them directly from GitHub.

The PR/Issue must always contain enough summary to recover:

- exact source/base/head SHAs;
- files changed and why;
- tests and exact results;
- CI/deployment/manual validation where applicable;
- data/migration/security implications;
- limitations/blockers;
- unresolved review findings;
- next required action.

## Review ownership

Codex and AntiGravity are implementation agents under the same operational contract even when a task assigns one primarily to implementation and the other to critical review/remediation.

Implementation agents may mark work `REVIEW_READY`. They may not self-accept the canonical task or close it as completed.

When the owner says `Check last task.`, ChatGPT independently inspects the relevant repository's latest handoff, current PR head/diff, tests/CI, deployment or live evidence, and unresolved review threads, then records one of:

- `ACCEPTED`
- `CHANGES REQUESTED`
- `BLOCKED — PRODUCT DECISION REQUIRED`

If project context is not clear, ChatGPT searches the portfolio and selects the most recent task awaiting independent review rather than asking the owner for task metadata.

## Acceptance and baseline synchronization

After `ACCEPTED`:

- merge the accepted PR or record the exact merge blocker;
- close the canonical Issue as completed;
- update project-local accepted-baseline status/context required by the repository;
- ensure no unresolved blocking review thread remains;
- only then allow normal selection of the next task.

## Context across months and projects

Each repository owns its own durable product context: architecture, decisions, data model, deployment, known limits, accepted workflows, and project-specific safety rules. The portfolio protocol does not centralize or blur those domains.

The universal layer standardizes only how ChatGPT, Codex, and AntiGravity locate the project, select work, hand over exact state, review it, and resume later without depending on memory.
