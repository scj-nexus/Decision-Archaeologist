# Decision Archaeologist

Decision Archaeologist is a local-first Next.js app that turns git history into evidence-backed ADR candidates. Instead of drawing a generic repo map, it looks for the hidden pivots your team usually forgets to document: framework migrations, ownership reshuffles, toolchain swaps, hardening passes, and stubborn co-change seams.

## Why it exists

Most repositories carry architecture decisions in commit history, not in ADR folders. By the time someone new joins the project, the rationale is gone and only the code remains. Decision Archaeologist reconstructs that rationale from history and gives you a ranked starting point with proof.

## What it does

- Analyzes a local git repo and ranks the top hidden decisions.
- Scores each candidate from commit messages, file movement, dependency churn, config churn, and subsystem coupling.
- Generates a markdown ADR draft for every surfaced decision.
- Ships with a deterministic demo repo so the first run shows real evidence immediately.

## Stack

- Next.js 16.2.2 App Router
- TypeScript + Tailwind CSS 4
- Vitest for unit and integration tests
- Playwright for the end-to-end demo flow

## Local setup

This machine has a broken global `NPM_CONFIG_CACHE` value. Do not change it globally. Run npm commands with a per-command override instead.

```powershell
$env:NPM_CONFIG_CACHE='C:\Users\Elite\AppData\Local\npm-cache'; npm install
$env:NPM_CONFIG_CACHE='C:\Users\Elite\AppData\Local\npm-cache'; npm run demo:seed
$env:NPM_CONFIG_CACHE='C:\Users\Elite\AppData\Local\npm-cache'; npm run dev
```

Open `http://127.0.0.1:3000`, click `Try the bundled demo dig site`, and the app will generate `fixtures/demo-repo` on demand if it does not exist yet.

## Scripts

```powershell
npm run dev
npm run build
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run demo:seed
```

Prefix each command with the cache override shown above on this machine.

## Demo fixture

The fixture generator creates a real nested git repository with these evidence-rich shifts:

- a webpack and jest starting point
- a feature-strata reorganization with git renames
- a webpack-to-vite and jest-to-vitest toolchain swap
- a migration into the Next.js App Router
- a strict routing and cache hardening pass

## Repository structure

- `src/lib/analyzer`: git ingest, scoring, clustering, ADR rendering, cache I/O
- `src/app/api`: analysis creation and retrieval endpoints
- `src/components`: landing page form and analysis workspace
- `scripts/generate-demo-repo.mjs`: deterministic fixture generator
- `tests`: unit, integration, and end-to-end coverage

## Verification

- `npm run test` covers ADR rendering, snapshot/rename handling, analyzer output, API routes, and Windows paths with spaces.
- `npm run test:e2e` runs the bundled demo flow and writes `docs/decision-archaeologist-report.png`.

## License

MIT
