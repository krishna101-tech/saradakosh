# Saradakosh Multi-Agent Coordination Protocol

Repository: `krishna101-tech/saradakosh`

## Purpose

This repository is the shared coordination bus for the project owner, ChatGPT, Anti-Gravity, and Codex. The goal is to remove manual Markdown shuttling while preserving a complete, auditable implementation trail and preventing agents from overwriting one another's work.

## Roles

### Project Owner
- Sets product direction and priorities.
- Launches Anti-Gravity or Codex when ChatGPT explicitly asks.
- Does not need to manually copy implementation reports between agents once this protocol is active.

### ChatGPT — Architect / Task Author / Coordinator / Reviewer
- Converts product decisions into bounded implementation tasks.
- Owns `.agents/COORDINATION_STATUS.md` and task specifications.
- Reviews Anti-Gravity reports, diffs, pull requests, and CI evidence.
- Decides whether a task is accepted, needs another Anti-Gravity pass, or has reached a Codex checkpoint.
- At a Codex checkpoint, explicitly tells the owner: **Now ask Codex to reply to your latest question.**
- May create/update coordination files and review/merge PRs after validation.

### Anti-Gravity — Primary Implementation Agent
- Primary implementation agent for routine development work.
- Reads the latest assigned task from `.agents/tasks/`.
- Implements only the stated scope on its own branch and isolated working tree.
- Runs tests and records evidence.
- Writes a final report whose first heading is exactly `# Report by Anti-Gravity`.
- Pushes the branch and opens a PR when possible.
- Never silently expands scope or changes product requirements.

### Codex — Independent Reviewer / Critical Remediation Agent
- Used at critical checkpoints rather than routine implementation.
- Reviews architecture, security, auth, migrations, source-verification logic, integration quality, and final release readiness.
- Writes reports whose first heading is exactly `# Report by Codex`.
- When asked to remediate, uses its own `codex/...` branch and isolated working tree.

## Mandatory Workspace Rules

All agents MUST read `/.agents/AGENTS.md` before doing anything else. Those rules override convenience.

When a task touches `saradakosh-web/`, the agent MUST also read `/saradakosh-web/AGENTS.md`. The two files are intentional and have different scopes:

- `/.agents/AGENTS.md` = repository-wide safety/coordination rules.
- `/saradakosh-web/AGENTS.md` = frontend/Next.js-specific rules.

They are not duplicates. Neither may be edited by an implementation agent unless an assigned task explicitly authorizes that exact edit.

## Source of Truth

- `origin/main` = accepted baseline.
- `.agents/AGENTS.md` = repository-wide workspace safety rules.
- `saradakosh-web/AGENTS.md` = frontend-local additional rules.
- `.agents/COORDINATION_PROTOCOL.md` = this protocol.
- `.agents/COORDINATION_STATUS.md` = current owner/task/state; ChatGPT-owned.
- `.agents/tasks/<TASK_ID>.md` = immutable task specification once implementation starts.
- `.agents/reports/<TASK_ID>_REPORT_BY_ANTIGRAVITY.md` = Anti-Gravity implementation report.
- `.agents/reports/<TASK_ID>_REPORT_BY_CODEX.md` = Codex review/remediation report.
- Pull request = implementation diff and review conversation.

If a task file and a chat message conflict, stop and report the conflict. Do not guess.

## Task IDs

Anti-Gravity tasks: `SQ-AG-001`, `SQ-AG-002`, ...

Codex checkpoints/reviews: `SQ-CX-900`, `SQ-CX-901`, ...

Use the task ID in the branch, commits, report, and PR title.

## Branch Rules

Anti-Gravity:
`ag/<TASK_ID>-short-slug`

Codex:
`codex/<TASK_ID>-short-slug`

Coordination-only changes by ChatGPT:
`coordination/<short-slug>`

No implementation agent commits feature code directly to `main`.

## Working-Tree Isolation — Mandatory

The local checkout used by the user, Anti-Gravity, Codex, or another tool may contain uncommitted work. No agent may assume a dirty tree is disposable.

### Required preflight

Before starting any implementation/review task, the assigned agent must run and record:

```bash
git rev-parse --show-toplevel
git remote -v
git branch --show-current
git rev-parse HEAD
git status --short
git fetch origin
```

The agent must verify that the remote points to `krishna101-tech/saradakosh` and identify the latest `origin/main` SHA.

### If the checkout is dirty

Any pre-existing modified, staged, deleted, or untracked file is **foreign state** unless the current task created it.

The agent MUST NOT:
- commit foreign changes;
- overwrite them;
- discard them;
- run `git reset --hard`;
- run `git clean -fd`;
- use `git restore`, `git checkout --`, or similar to erase them;
- automatically stash/pop them;
- silently rename/move/delete them.

This is especially strict for `AGENTS.md`, `.agents/*`, SQLite/database files, package lockfiles, environment/config files, and any file targeted by the task.

### Preferred solution

Use a **clean, agent-specific Git worktree or separate clone** based on the latest `origin/main`, then create the assigned branch there.

Anti-Gravity and Codex must never actively implement in the same filesystem working directory. They may inspect the same GitHub repository, but each implementation branch gets its own clean working tree.

If safe isolation is impossible, stop and report the exact dirty-state output as a blocker. Do not solve it by destructive cleanup.

## File Ownership and No Duplication

- ChatGPT alone owns `.agents/COORDINATION_STATUS.md` and canonical task specs in `.agents/tasks/`.
- Anti-Gravity edits only task-authorized product files plus its own report.
- Codex edits only task-authorized remediation files plus its own report.
- Agents never edit one another's report files.
- `/.agents/AGENTS.md` and `/saradakosh-web/AGENTS.md` are protected instruction files.
- Do not create additional `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, duplicate status files, ad-hoc handoff files, or parallel task documents merely to coordinate agents. Use the existing `.agents/tasks/`, `.agents/reports/`, status, and PR conversation.
- An existing tracked agent-specific file may remain in the repository, but it must not be treated as a replacement for this canonical coordination system unless the protocol explicitly says so.

Before every commit, inspect:

```bash
git status --short
git diff --name-only
git diff --cached --name-only
```

Only task-owned paths may be committed. At completion, run `git status --short` again and include the output/state in the report.

## No Overlapping Implementation

Anti-Gravity and Codex must not implement the same task simultaneously unless ChatGPT explicitly defines parallel, non-overlapping tasks and file ownership. A PR branch belongs to one implementation agent. Another agent may review it, but must not casually push unrelated changes onto it.

If two active tasks need the same file, ChatGPT must serialize the work or explicitly define how the overlap is resolved before either agent edits it.

## Task Lifecycle

1. ChatGPT writes `.agents/tasks/<TASK_ID>.md` and updates `.agents/COORDINATION_STATUS.md`.
2. Owner opens the named agent and asks it to read/execute the current Saradakosh task from GitHub.
3. Agent fetches latest GitHub state and performs the mandatory working-tree preflight.
4. Agent uses a clean isolated worktree/clone based on latest `origin/main` unless the task specifies another base.
5. Agent reads `.agents/AGENTS.md`, this protocol, coordination status, assigned task, and any applicable scoped `AGENTS.md` such as `saradakosh-web/AGENTS.md`.
6. Agent creates the required task branch and implements only the defined scope.
7. Agent runs stated tests plus necessary regression tests.
8. Agent creates its correctly named report on the task branch.
9. Agent performs final git-status/diff checks to ensure no foreign/unrelated files are included.
10. Agent pushes the branch and opens a PR to `main` when possible. If PR creation is unavailable, it still pushes and reports exact branch + HEAD SHA.
11. Owner tells ChatGPT the agent has finished; no report upload is needed.
12. ChatGPT reads the report/PR directly from GitHub, reviews files, tests, CI, and especially checks the diff for foreign/overlapping paths.
13. ChatGPT either accepts/merges it, creates a bounded follow-up Anti-Gravity task, or declares a Codex checkpoint.
14. At a Codex checkpoint ChatGPT explicitly tells the owner: **Now ask Codex to reply to your latest question.**

## Anti-Gravity Report Format

Every final Anti-Gravity report MUST begin exactly:

`# Report by Anti-Gravity`

Then include:

- `Task ID:`
- `Status:` COMPLETE / PARTIAL / BLOCKED
- `Branch:`
- `Base branch:`
- `Base origin/main SHA:`
- `HEAD commit:`
- `Pull request:` URL/number or `not available`
- `Preflight git status:` exact initial state or `clean`
- `Working directory isolation:` worktree/clone path or method
- `Summary:` what was implemented
- `Files changed:` every meaningful changed path and purpose
- `Acceptance criteria:` each criterion PASS / FAIL / PARTIAL
- `Tests run:` exact commands and outcomes
- `Manual validation:` browsers/devices/routes checked
- `Final git status:` exact final state or `clean`
- `Database/migration impact:` schema/data changes, migrations, rollback implications
- `Security/privacy impact:` auth, secrets, user data, external APIs
- `Deviations:` anything not implemented exactly as specified, with reason
- `Known issues / blockers:` explicit list; write `None` if none
- `Evidence:` screenshots, logs, URLs, CI run IDs where relevant
- `Recommended next step:` concise recommendation only

The report must be factual. A user choosing to stop iterating or accept a limitation is not automatically an algorithm failure.

## Codex Report Format

Every Codex report MUST begin exactly:

`# Report by Codex`

Then include:

- review task ID
- branch/PR/commit reviewed
- base and HEAD SHAs
- preflight/final working-tree state
- severity-ranked findings: CRITICAL / HIGH / MEDIUM / LOW
- correctness findings
- architecture findings
- security/auth/privacy findings
- data integrity/migration findings
- responsive/mobile/accessibility findings where relevant
- foreign-file/overlap check
- test/CI gaps
- fixes performed, if remediation was authorized
- residual risks
- final verdict: APPROVE / APPROVE WITH FOLLOW-UP / REQUEST CHANGES

## Critical Checkpoints for Codex

ChatGPT should normally invoke Codex only when one of these is reached:

1. Core architecture/data-model foundation is complete.
2. Authentication, account linking, or persistent user scorecard is introduced.
3. AI-generated verification/snippet logic or external RKMM-source retrieval is introduced.
4. Database migration or production-data risk becomes non-trivial.
5. Major integration milestone is complete.
6. Pre-release final audit.
7. ChatGPT detects ambiguous/high-risk implementation behavior that benefits from an independent second reviewer.

## Conflict Avoidance

- Only ChatGPT edits `.agents/COORDINATION_STATUS.md`.
- Task specs are immutable after implementation begins. Changed requirements require a new/superseding task.
- Anti-Gravity writes only its own report files.
- Codex writes only its own report files.
- Agents do not edit each other's reports.
- Never have Anti-Gravity and Codex implement the same task simultaneously unless ChatGPT explicitly creates parallel non-overlapping tasks.
- If a local file differs from GitHub `origin/main`, treat it as local/foreign work until ownership is proven; do not assume GitHub or the local copy should automatically overwrite the other.

## Secrets and External Services

- Never commit API keys, OAuth secrets, tokens, credentials, private keys, or user data.
- Use environment variables and documented placeholders.
- Any new external service must be listed in the report with configuration requirements.

## Handshake Requirement

Before receiving the first feature task, Anti-Gravity must complete the one-time handshake described by the bootstrap document supplied by the owner. The handshake proves that it can read this repository, isolate its work, create a branch, commit, push a report, and expose that report for ChatGPT review.
