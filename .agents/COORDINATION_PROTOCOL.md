# Saradakosh Multi-Agent Coordination Protocol

Repository: `krishna101-tech/saradakosh`

## Purpose

This repository is the shared coordination bus for the project owner, ChatGPT, Anti-Gravity, and Codex. The goal is to remove manual Markdown shuttling after the initial bootstrap while preserving a complete, auditable implementation trail.

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
- May create or update coordination files and review/merge PRs after validation.

### Anti-Gravity — Primary Implementation Agent
- Primary implementation agent for normal development work.
- Reads the latest assigned task from `.agents/tasks/`.
- Implements only the stated scope on its own branch.
- Runs tests and records evidence.
- Writes a final report whose first heading is exactly `# Report by Anti-Gravity`.
- Pushes the branch and opens a PR when possible.
- Never silently expands scope or changes product requirements.

### Codex — Independent Reviewer / Critical Remediation Agent
- Used at critical checkpoints rather than for routine implementation.
- Reviews architecture, security, auth, migrations, source-verification logic, integration quality, and final release readiness.
- Writes reports whose first heading is exactly `# Report by Codex`.
- When asked to remediate, uses its own `codex/...` branch and PR.

## Existing Workspace Rules

All agents MUST read `.agents/AGENTS.md` before doing anything else. Those rules remain in force and override convenience. In particular, do not re-upload the existing multi-gigabyte content-image corpus.

## Source of Truth

- `main` = accepted baseline.
- `.agents/AGENTS.md` = workspace safety rules.
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

## Task Lifecycle

1. ChatGPT writes a task spec into `.agents/tasks/<TASK_ID>.md` and updates `.agents/COORDINATION_STATUS.md`.
2. Owner opens Anti-Gravity and says only that it should read and execute the current Saradakosh task from GitHub.
3. Anti-Gravity pulls latest `main`, reads `.agents/AGENTS.md`, this protocol, status, and the assigned task.
4. Anti-Gravity creates the required task branch and implements only the defined scope.
5. Anti-Gravity runs the stated tests plus any necessary regression tests.
6. Anti-Gravity creates `.agents/reports/<TASK_ID>_REPORT_BY_ANTIGRAVITY.md` on the task branch.
7. Anti-Gravity pushes the branch and opens a PR to `main` when GitHub tooling permits. If PR creation is unavailable, it must still push the branch and report the exact branch name and HEAD SHA.
8. Owner tells ChatGPT that Anti-Gravity has finished. No report file needs to be manually uploaded.
9. ChatGPT reads the report and PR/branch directly from GitHub, reviews the implementation, checks CI/tests, and either:
   - accepts/merges it,
   - issues a bounded follow-up Anti-Gravity task, or
   - declares a Codex checkpoint.
10. At a Codex checkpoint ChatGPT explicitly tells the owner: **Now ask Codex to reply to your latest question.** Codex then reads GitHub and performs the defined review/remediation task.

## Anti-Gravity Report Format

Every final Anti-Gravity report MUST begin exactly:

`# Report by Anti-Gravity`

Then include:

- `Task ID:`
- `Status:` COMPLETE / PARTIAL / BLOCKED
- `Branch:`
- `Base branch:`
- `HEAD commit:`
- `Pull request:` URL/number or `not available`
- `Summary:` what was implemented
- `Files changed:` important paths and purpose
- `Acceptance criteria:` each criterion marked PASS / FAIL / PARTIAL
- `Tests run:` exact commands and outcomes
- `Manual validation:` browsers/devices/routes checked
- `Database/migration impact:` schema/data changes, migrations, rollback implications
- `Security/privacy impact:` auth, secrets, user data, external APIs
- `Deviations:` anything not implemented exactly as specified, with reason
- `Known issues / blockers:` explicit list; write `None` if none
- `Evidence:` screenshots, logs, URLs, CI run IDs when relevant
- `Recommended next step:` concise recommendation only

The report must be factual. A user choosing to stop iterating or accept a limitation is not automatically an algorithm failure.

## Codex Report Format

Every Codex report MUST begin exactly:

`# Report by Codex`

Then include:

- review task ID
- branch/PR/commit reviewed
- severity-ranked findings: CRITICAL / HIGH / MEDIUM / LOW
- correctness findings
- architecture findings
- security/auth/privacy findings
- data integrity/migration findings
- responsive/mobile/accessibility findings where relevant
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
- Task specs are immutable after implementation begins. If requirements change, ChatGPT creates a new task or an explicit superseding task.
- Anti-Gravity writes only its own report files.
- Codex writes only its own report files.
- Agents do not edit each other's reports.
- Never have Anti-Gravity and Codex implement the same task simultaneously unless ChatGPT explicitly creates parallel tasks.

## Secrets and External Services

- Never commit API keys, OAuth secrets, tokens, credentials, private keys, or user data.
- Use environment variables and documented placeholders.
- Any new external service must be listed in the report with configuration requirements.

## Handshake Requirement

Before receiving the first feature task, Anti-Gravity must complete the one-time handshake described by the bootstrap document supplied by the owner. The handshake proves that it can read this repository, create a branch, commit, and push a report that ChatGPT can independently retrieve.
