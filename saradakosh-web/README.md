This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Application tests

Use Node.js 24 and the locked dependencies. From `saradakosh-web`:

```sh
npm ci --no-audit --no-fund
npx playwright install chromium
npm run test:database
npm test
```

By default, `npm test` builds the production app, starts a dedicated server at `http://127.0.0.1:3100`, runs the real app tests in Chromium desktop and mobile contexts, then stops the server. It refuses to reuse an existing server on that port. The suite covers quiz language/answer preservation, scoring, set progression, dialogs, responsive layout, search links, and database-backed report routes. It does not navigate to Playwright's example site. Browser results, traces, and screenshots go to the ignored `test-results` and `playwright-report` directories.

To validate an authorized preview or staging deployment with the same suite, explicitly set `PLAYWRIGHT_TEST_BASE_URL` to its HTTP(S) origin before `npm test`. The value must have no credentials, path, query or fragment. When supplied, it becomes Playwright's `baseURL` and the local build/server is skipped. Clear the variable to return to managed local validation. For example, in PowerShell:

```powershell
$env:PLAYWRIGHT_TEST_BASE_URL = 'https://your-reviewed-preview.vercel.app'
npm test
Remove-Item Env:PLAYWRIGHT_TEST_BASE_URL
```

The repository-root [Playwright workflow](../.github/workflows/playwright.yml) uses the same database and browser commands on a standard Ubuntu 24.04 runner with Node.js 24. It installs only Chromium, uses two workers, cancels obsolete PR runs, and retains failure artifacts for one day. Browser tests rebuild the app themselves, so the workflow needs no separate build or manually started server.

### Hosted execution authorization

The default is A0: hosted execution is disabled. Opening or updating a PR alone does not allocate a runner. After local checks pass and the coordinator verifies the zero-cost provider gate, authorize one frozen PR candidate with both repository variables:

- `SARADAKOSH_E2E_ENABLED`: exactly `true`.
- `SARADAKOSH_E2E_CANDIDATE_SHA`: the full 40-character PR head SHA that passed local validation.

The workflow's job runs only when both conditions match. It checks out that exact PR head rather than GitHub's generated merge revision. A new commit invalidates the authorization. A skipped job is not passing CI evidence. To test the authorized candidate, open/update its PR or rerun its matching PR event after setting the variables; independently confirm the run's event, checked-out SHA, and result. Clear or disable the variables after the deliberate run. This workflow has no push trigger, avoiding duplicate push/PR runs.

### Version 01 preview suppression

The app's [vercel.json](vercel.json) disables automatic Git deployments only for `codex/books-library-v1`, following Vercel's [branch deployment configuration](https://vercel.com/docs/project-configuration/git-configuration#git.deploymentenabled). Intermediate Version 01 commits can be pushed without creating a preview per task. The coordinator can create the one deliberate preview for the final reviewed Version through the authorized deployment path. Other branches inherit their existing deployment behavior; this is not a global project setting.
