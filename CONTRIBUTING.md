# Contributing to Money Journal

Thanks for considering a contribution. This is a small, personal-scale
project with one guiding rule above all others: **it has to stay simple
enough to use every single day.** Please read the philosophy below before
opening a large pull request.

## Project philosophy (please read first)

- **Privacy-first is non-negotiable.** No accounts, no authentication, no
  analytics, no tracking, no cloud storage, no external database, no network
  calls that send financial data anywhere. All data lives in the browser's
  `localStorage`. Pull requests that add any form of telemetry, third-party
  script, or "phone home" behavior will be declined regardless of how useful
  the feature is.
- **Simplicity over completeness.** This is not trying to become a full
  accounting system. Before proposing a feature, ask: *will this make daily
  use faster or clearer, or will it just make the UI more complicated?* If
  it's the latter, it probably belongs in a fork, not here.
- **No business-logic changes without discussion.** Calculations (budget
  math, dashboard totals, reflections) are load-bearing - open an issue to
  discuss significant logic changes before writing the PR.

## Getting started

```bash
git clone https://github.com/<your-fork>/money-journal.git
cd money-journal
npm install
npm run dev
```

The dev server runs at `http://localhost:5173` by default. Changes hot-reload.

## Before opening a pull request

```bash
npm run lint      # ESLint must pass with no errors
npm run format    # Prettier formatting
npm run build     # Production build must succeed with no errors
```

Please also manually click through the change in the browser - there is no
automated test suite yet (see the README roadmap), so manual verification is
the safety net.

## Code style and structure

- Components live under `src/components/`, grouped by feature area
  (`dashboard/`, `budget/`, `expenses/`, `charts/`, `settings/`, `common/`).
- Pure, framework-free logic (date math, formatting, budget calculations,
  storage/migration, the reflections engine) lives under `src/lib/` and
  should stay free of React imports so it's easy to unit test in isolation.
- Shared constants (categories, colors, recurrence types) live in
  `src/constants.js` - avoid hardcoding category lists inside components.
- Keep components small and focused. If a component grows past roughly
  150-200 lines, consider whether part of it belongs in `src/lib/` or a
  smaller sub-component.

## Commit messages

Plain, descriptive messages are fine - no strict convention is enforced, but
please write what changed and why, not just "fix bug."

## Reporting bugs / requesting features

Open a GitHub issue. For bugs, include: what you expected, what happened
instead, and your browser. For feature requests, please address the
"will this make daily use faster or clearer" question directly in the issue.

## Security issues

Do not open a public issue for a security vulnerability - see `SECURITY.md`
for how to report it privately.

## License

By contributing, you agree that your contributions will be licensed under
the project's MIT License (see `LICENSE`).
