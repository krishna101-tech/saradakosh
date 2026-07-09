# Vercel Deployment Protocol (CI/CD)

> **CRITICAL AGENT INSTRUCTION:** 
> Do not execute `git push` directly to the `main` branch. All work must be pushed to the `staging` branch first. Check off items as you go.

## Pre-Flight Checks
1. [ ] **Dependency Audit:** If `package.json` was modified, run `npm install` locally to guarantee there are no `ERESOLVE` peer dependency conflicts. 
   - *Learning from 2026-07-09:* Vercel will silently crash and abort the deployment if `npm install` fails due to strict peer dependency rules (e.g., React 19 vs react-lenis). Use `overrides` if necessary.
2. [ ] **Case Sensitivity:** Ensure all imports exactly match the git tree (`git ls-tree`). Windows is case-insensitive, but Vercel's Linux environment will throw a 404/Module Not Found error if cases mismatch.
3. [ ] **Local Build:** Run `npm run build` locally. It MUST complete successfully without Typescript or ESLint fatal errors.

## Post-Deploy Edge Verification
1. [ ] **Wait for CDN:** Wait 3-5 minutes after `git push` for Vercel to compile and edge-cache the deployment.
2. [ ] **Deterministic Verification:** DO NOT use a simulated browser subagent for verification. You must write or execute a Node.js script (using `https` or `fetch`) that explicitly asserts a `200 OK` status and checks for the literal presence of your modified strings in the raw DOM payload.
3. [ ] **Logs:** Provide the raw output logs of the verification script to the user.

## Incident Log & Learnings
- **2026-07-09:** Silent Vercel deployment crash. `npm install` failed due to React 19 vs `react-lenis` peer dependency, preventing 7 major updates from going live while caching old broken versions. **Solution:** Enforce local `npm install` check and use `overrides`.
- **2026-07-09:** `/storytelling` 404 Error. Duplicate `.jsx` and `.js` files caused Webpack boundary collision on Vercel. **Solution:** Ensure legacy files are fully destroyed (`git rm`) when refactoring components.
