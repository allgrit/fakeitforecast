# Branch protection for `main`

To make green CI mandatory before merge, configure GitHub branch protection (or Rulesets) for `main` with:

- **Require a pull request before merging**
- **Require status checks to pass before merging**
- Required checks:
  - `Lint & Typecheck`
  - `Unit & Integration`
  - `E2E Smoke`
  - `Visual Regression (График/Карта/Модалки)`
- Optional hardening:
  - Require branches to be up to date before merging
  - Restrict who can push to matching branches

This repository ships the workflow and check names; enabling these settings in GitHub UI makes green CI a hard merge gate.
