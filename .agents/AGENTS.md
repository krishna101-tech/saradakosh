## Workspace Rules

These rules apply to ChatGPT, Anti-Gravity, Codex, and any other implementation/review agent working in this repository.

### 1. Content-image safety

**NEVER reupload the 3GB of content image files.** The local SQLite database has already been successfully updated with Cloudinary URLs. This restriction applies strictly to content images; it does NOT apply to UI design images such as icons, page assets, and layout mockups, which may be uploaded or committed normally. Disabling or bypassing this rule is prohibited unless the user explicitly requests it.

### 2. Canonical instruction files and scope

There are currently two intentional tracked `AGENTS.md` files. They are not duplicates:

- `/.agents/AGENTS.md` — repository-wide safety and coordination rules. Applies everywhere.
- `/saradakosh-web/AGENTS.md` — Next.js/frontend-specific rules. It additionally applies whenever work touches `saradakosh-web/`.

When working on the frontend, read and obey both files. Repository-wide safety rules take precedence if there is any conflict.

These instruction files are **protected files**. Anti-Gravity and Codex MUST NOT modify either `AGENTS.md` unless a task specification explicitly authorizes that exact edit. Do not create extra `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, agent-state, or task-instruction files merely to communicate with another agent. Use `.agents/tasks/`, `.agents/reports/`, and the coordination protocol instead.

The repository also contains `.agents/PORTFOLIO_MULTI_AGENT_PROTOCOL.md`. It is the canonical cross-project coordination contract for the product owner's two-command workflow. It does not replace Saradakosh-specific safety rules. For task selection, review ownership, portfolio discovery, agent takeover, and the owner's two commands, it takes precedence over older wording in `.agents/COORDINATION_PROTOCOL.md` when the two differ.

### 3. Dirty working tree / uncommitted-file safety

Before starting any task, run and record at minimum:

```bash
git rev-parse --show-toplevel
git remote -v
git branch --show-current
git rev-parse HEAD
git status --short
git fetch origin
```

A pre-existing modified, staged, deleted, or untracked file is **foreign state** unless the current task explicitly created it.

If the existing checkout is dirty:

- DO NOT overwrite the changed files.
- DO NOT add them to the task commit.
- DO NOT run `git reset --hard`.
- DO NOT run `git clean -fd` or equivalent cleanup.
- DO NOT run `git checkout -- <file>` / `git restore <file>` to discard them.
- DO NOT automatically stash or pop them.
- DO NOT rename/delete them to make the tree look clean.

In particular, an uncommitted `AGENTS.md`, any `.agents/*` file, database file, lockfile, configuration file, or task-target file must be treated as potentially important user/other-agent work.

The preferred response to a dirty shared checkout is to create/use a **separate clean Git worktree or separate clone based on the latest `origin/main`**, then create the assigned agent branch there. Never have Anti-Gravity and Codex actively implement in the same filesystem working directory.

If a clean isolated worktree/clone cannot be created safely, stop implementation and report the exact `git status --short` output as a blocker. Do not improvise destructive cleanup.

### 4. Task isolation

Every implementation/review branch must start from the latest accepted `origin/main` unless the task explicitly specifies another base.

Only files required by the current task may enter its commits/PR. Pre-existing local changes must never be swept into a task commit.

Before committing, inspect:

```bash
git status --short
git diff --name-only
git diff --cached --name-only
```

Before reporting completion, inspect again and state the final working-tree status. The task report must list every file changed by the task.

### 5. Shared-file ownership

- ChatGPT owns `.agents/COORDINATION_STATUS.md` and canonical task specifications in `.agents/tasks/`.
- Anti-Gravity owns only its assigned implementation files and its own `...REPORT_BY_ANTIGRAVITY.md` report.
- Codex owns only explicitly authorized review/remediation files and its own `...REPORT_BY_CODEX.md` report.
- Agents do not modify each other's reports.
- Implementation agents do not edit coordination-owned files unless the task explicitly authorizes it.

If ownership is unclear, do not edit the file; report the conflict.

### 6. No overlapping implementation

Anti-Gravity and Codex must not implement the same scope simultaneously unless ChatGPT explicitly creates separate parallel tasks with non-overlapping file ownership. A branch/PR is not a shared scratchpad between agents.

### 7. Portfolio two-command contract

The project owner should need only:

- to either implementation agent: `Work on open task.`
- to ChatGPT: `Check last task.`

Implementation agents must derive repository, task, branch, current review findings, and next action from GitHub plus the repository. They must not ask the owner to remember issue numbers, task IDs, branch names, or handoff files merely because the agent lost context.

Before resuming or taking over a task, read `.agents/PORTFOLIO_MULTI_AGENT_PROTOCOL.md`, the active GitHub Issue/PR, the latest ChatGPT review disposition, and all unresolved non-outdated review threads. A different agent may take over only after synchronizing to the exact remote task-branch head and recording the takeover in GitHub.

Implementation agents may mark `REVIEW_READY`; they may not self-accept or close the canonical task. ChatGPT owns `ACCEPTED`, `CHANGES REQUESTED`, and product-decision review outcomes.
