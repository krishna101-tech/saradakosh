# SQ-AG-001 — Saradakosh Quiz v1 Foundation

## Owner

Anti-Gravity

## Objective

Implement the first working, mobile-first Saradakosh Quiz page using the accepted 25-question bank already stored in GitHub.

This task establishes the frontend architecture, multilingual question model, five-set difficulty progression, answer checking, result summary, and authoritative RKMM source-link behavior.

Do **not** implement authentication, persistent scorecards, AI-generated verification snippets, database migrations, or regional-language source mapping in this task.

## Mandatory preflight — do this before any implementation

1. Fetch the latest `origin/main`.
2. Read, in order:
   - `.agents/AGENTS.md`
   - `.agents/COORDINATION_PROTOCOL.md`
   - `.agents/COORDINATION_STATUS.md`
   - `saradakosh-web/AGENTS.md`
   - this task file
3. Run and record:
   - `git rev-parse --show-toplevel`
   - `git remote -v`
   - `git branch --show-current`
   - `git rev-parse HEAD`
   - `git status --short`
4. The existing checkout `C:\Saradakosh antigravity` is known to contain unrelated pre-existing local changes. **Do not work in that dirty checkout.** Create a clean isolated Git worktree or separate clone from the latest `origin/main` and perform this task there.
5. Never stash, reset, restore, clean, delete, commit, or absorb unrelated local changes from another working tree.
6. Confirm the isolated task workspace is clean before starting.
7. Because the frontend uses Next.js 16.2.7, follow `saradakosh-web/AGENTS.md`: inspect the relevant installed Next.js documentation under `node_modules/next/dist/docs/` before writing framework-specific code. Do not rely on older Next.js conventions from memory.

## Branch

Create from latest `origin/main`:

`ag/SQ-AG-001-quiz-foundation`

Do not implement on `main`.

## Canonical task asset

Use only:

`.agents/task_assets/SQ-AG-001_QUESTION_BANK.csv`

It contains exactly 25 accepted MCQs:

- Set 1: 5 easiest questions
- Set 2: 5 harder questions
- Set 3: 5 intermediate questions
- Set 4: 5 difficult questions
- Set 5: 5 most advanced questions

Do not rewrite, replace, reorder across sets, generate additional questions, or silently correct question content in this task. If you detect a content problem, report it rather than changing the accepted bank.

## Product rules to implement

### 1. Route and exposure

Create a new quiz route at:

`/quiz`

within the existing Next.js App Router under `saradakosh-web/src/app`.

Do **not** add the Quiz link to the existing production navigation/homepage in this task. The feature must remain directly addressable for preview/testing but should not yet be promoted site-wide.

### 2. One responsive page, not separate mobile/desktop products

Build one responsive page/component architecture that adapts by viewport.

Mobile is the priority. Assume most users will use a phone.

Required validation viewport:

- mobile: 390 × 844
- desktop: 1440 × 900 (or comparable desktop width)

Minimum UX requirements:

- large readable type
- no horizontal scrolling
- touch targets at least approximately 44 × 44 px
- radio/choice rows easy to tap with a thumb
- generous vertical spacing between questions
- no desktop-only hover dependency
- Bengali and Hindi text must render legibly
- preserve the established Saradakosh visual character rather than introducing an unrelated app theme

Do not add a new UI dependency unless genuinely necessary. Prefer the existing stack/components/CSS conventions.

### 3. Language selection

Initial supported languages are exactly:

- English
- हिन्दी
- বাংলা

On first entry to `/quiz`, the page should clearly ask the user to select a language before starting.

After selection, keep the language selector visible near the top so the user can change language quickly at any time.

Changing language must:

- change question text and choices immediately
- keep the same conceptual question IDs
- preserve the user's selected option for each question
- preserve current set number
- preserve results state if answers have already been checked

Do not create separate English/Hindi/Bengali quiz logic. There is one canonical question record with three language renderings.

### 4. Question data contract

Transform the CSV into a maintainable frontend data module under an appropriate `saradakosh-web/src/data/` path.

Each question must have a stable ID:

`Q001` through `Q025`

Each record must structurally represent at least:

- `id`
- `set` (1–5)
- localized question text for `en`, `hi`, `bn`
- four stable option IDs `A`, `B`, `C`, `D`
- localized option text for `en`, `hi`, `bn`
- `correctOptionId`
- canonical RKMM verification URL from the task asset

Do not infer correctness from displayed text. Correctness must be keyed by stable option ID.

Validate in code/tests that:

- total questions = 25
- each set contains exactly 5 questions
- each question has exactly 4 options
- each question has all three language texts
- each question has a valid correct option ID
- each question has an RKMM URL

No database is required for this task.

### 5. Difficulty progression

The user must progress through sets in order:

Set 1 → Set 2 → Set 3 → Set 4 → Set 5

Do not randomize questions across difficulty sets.

Display clearly that the user is on, for example:

`Quiz 1 of 5`

and optionally an understated difficulty label such as Beginner / Easy / Intermediate / Difficult / Advanced if it fits the design.

The difficulty progression must remain tied to the existing set numbers in the accepted question bank.

### 6. Quiz answering state

For the active set, display all five MCQs together on the same page.

Each question has four single-select choices.

The user may answer:

- all 5
- some questions
- none

Do not require every question to be answered.

The main action button must be named:

**Check Answers**

It is available after language selection even if zero questions are answered.

### 7. Results state

Clicking **Check Answers** keeps the same five questions on the same responsive page and transitions them into a checked/results state.

Show a summary with all four numbers:

- Attempted: X / 5
- Correct: X
- Incorrect: X
- Skipped: X

For each question after checking:

- correct selected answer: clearly marked correct
- incorrect selected answer: clearly marked incorrect AND reveal the correct answer
- skipped question: clearly marked skipped AND reveal the correct answer

Do not allow visual ambiguity between the user's selected answer and the correct answer.

### 8. Verify Source behavior — task 1 only

After answers are checked, each question must show:

**Verify Source**

For SQ-AG-001 this button should open the stored canonical RKMM verification URL for that question in a new browser tab/window using safe external-link behavior (`noopener`/`noreferrer` as appropriate).

The URLs may contain `#:~:text=` text fragments intended to scroll/highlight the supporting passage in compatible browsers. Preserve the URLs exactly.

Important: **Do not build AI-generated verification snippets in this task.** Do not scrape RKMM. Do not call an LLM. Do not create an API proxy. Regional Bengali/Hindi verification mapping will be a later task.

### 9. New Quiz behavior

After the results state, show:

**New Quiz**

Behavior:

- after Set 1 → load Set 2
- after Set 2 → load Set 3
- after Set 3 → load Set 4
- after Set 4 → load Set 5
- after Set 5 → start again at Set 1

Starting a new set clears answers/results for the new set while preserving the selected language.

Do not mix questions from different sets.

### 10. Scorecard button — visual placeholder only

After results, also show:

**Scorecard**

Authentication and persistent Scorecard are deliberately excluded from SQ-AG-001.

For this task, the Scorecard button may open a small accessible informational dialog/panel stating that sign-in is required and will be enabled in the account phase. It must not pretend to save progress.

Do not add OAuth, email login, sessions, cookies for accounts, user database tables, or third-party auth packages.

### 11. Guest/session behavior

For SQ-AG-001, in-memory client state is sufficient.

A page refresh may reset progress.

Do not introduce persistence merely to preserve progress across refreshes. Persistent guest/user history will be designed separately with authentication.

## Styling guidance

The approved design direction is:

- serene, scholarly, contemporary
- warm off-white/cream surface
- restrained saffron/maroon/deep-brown accents consistent with Saradakosh
- rounded but not cartoonish cards
- clear hierarchy
- language selector prominent at the top
- mobile-first stacked cards
- desktop remains the same information architecture with wider spacing, not a different page

The implementation should integrate with existing Saradakosh header/layout conventions where practical without destabilizing shared global styles.

Avoid large decorative assets for this task. Do not touch the protected multi-gigabyte content-image corpus.

## Accessibility requirements

At minimum:

- semantic form controls or equivalent accessible radio-group behavior
- keyboard navigable on desktop
- visible focus states
- labels connected to controls
- result colors are not the only indicator: include text/icon/state labels for Correct, Incorrect, Skipped
- sufficient contrast
- external source buttons have understandable accessible names
- modal/dialog, if used for Scorecard placeholder, must have accessible close behavior

## Tests and validation

Before reporting COMPLETE, run at minimum from `saradakosh-web`:

- `npm run lint`
- `npm run build`

Also perform browser validation, preferably with the existing Playwright setup, covering:

1. `/quiz` loads without changing existing routes.
2. language is required initially.
3. English → Hindi → Bengali switching works.
4. a selected option survives language switching.
5. partially answered quiz produces correct Attempted/Correct/Incorrect/Skipped totals.
6. zero-answer quiz can still be checked and reports 5 skipped.
7. correct/incorrect/skipped visual states are distinguishable.
8. Verify Source opens the exact stored RKMM URL.
9. New Quiz advances sets sequentially 1→2→3→4→5→1.
10. exactly five questions render per set.
11. mobile viewport 390×844 has no horizontal overflow and all actions are comfortably tappable.
12. desktop layout works at approximately 1440×900.
13. existing homepage and at least one existing secondary route still load after the change.

Capture evidence/screenshots for mobile and desktop results states if your tooling permits.

## Explicit non-goals / forbidden scope expansion

Do NOT implement in SQ-AG-001:

- Google/email/Apple login
- persistent user Scorecard
- database schema changes or migrations
- backend APIs for user data
- AI-generated verification explanations
- live scraping/search of RKMM websites
- Bengali/Hindi RKMM source fallback mapping
- admin quiz editor
- random question generation
- graphical/timeline/matching quiz types
- XP, badges, achievements, leaderboard
- production navigation link to `/quiz`
- rewriting accepted question content
- modifying `.agents/COORDINATION_STATUS.md`
- modifying task specifications
- modifying another agent's report
- creating additional AGENTS/CLAUDE/GEMINI coordination files

## Expected implementation report

Create on your task branch:

`.agents/reports/SQ-AG-001_REPORT_BY_ANTIGRAVITY.md`

The first line must be exactly:

`# Report by Anti-Gravity`

Follow the report format in `.agents/COORDINATION_PROTOCOL.md` and additionally include:

- initial isolated-worktree `git status --short`
- final `git status --short`
- exact isolated task-worktree path
- base `origin/main` SHA used
- confirmation that no pre-existing files from `C:\Saradakosh antigravity` were committed, altered, stashed, cleaned, or absorbed
- final question-count validation: 25 total / 5 per set / 4 options each
- mobile and desktop validation evidence
- exact files changed
- Vercel preview URL if automatically available

## Pull request

Push the branch and open a PR to `main` with title:

`[SQ-AG-001][ANTI-GRAVITY] Quiz v1 responsive foundation`

The PR body must begin:

`# Report by Anti-Gravity`

Do not merge it yourself.

## Stop condition

After pushing the implementation/report and opening the PR, stop.

Do not infer or begin SQ-AG-002.

Tell the user only that `SQ-AG-001` is complete and ready for ChatGPT review. ChatGPT will inspect the PR/report directly in GitHub.