# SaradaKosh AI engineering instructions

## 1. Explicit Authority & Inheritance Hierarchy

All engineering work in this repository strictly adheres to the following three-tier inheritance order:
1. **Canonical Global Standard:** Portfolio Human–AI Systems Engineering Standard `0.1-bootstrap` at `https://github.com/krishna101-tech/software-engineering-standards/blob/main/STANDARD.md`.
2. **Project Addendum:** This repository's `PROJECT_ENGINEERING.md` (defining SaradaKosh-specific invariants, database authority, 3GB media rules, and staging deployment protocol).
3. **Live GitHub State:** Active GitHub Issues, PRs, review comments, and CI evidence.

No prompt or local convenience may weaken the global standard or violate project invariants.

## 2. GitHub-Only Project Truth

GitHub is the single source of truth for software project management. AI agents must not create or maintain parallel task stores (Trello, Jira, Linear, or ad-hoc local handoff files).

## 3. Owner Interface: `go`

- The product owner's only operational command is `go`.
- Implementation agents must discover and resume canonical task/review state directly from GitHub without prompting the owner for task IDs, branch names, or handoff files.
- When implementation and verification are complete, agents push evidence and mark the task `REVIEW_READY` for independent ChatGPT review. Implementation agents never self-accept substantial work.

## 4. Architecture & Invariant Enforcement

- System architecture outranks prompt-local convenience.
- Always search existing codebase ownership before introducing new services, helpers, or states.
- Respect all strict project invariants in `PROJECT_ENGINEERING.md` (no 3GB image uploads, mandatory staging protocol, isolated worktrees, and single database source of truth).
- General engineering lessons discovered in SaradaKosh must be proposed upward for the portfolio standard; project-specific lessons belong in `PROJECT_ENGINEERING.md`.