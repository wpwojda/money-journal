# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- GitHub Actions workflow (`deploy.yml`) that builds and publishes the app to GitHub Pages on every push to `main`.
- `vite.config.js` now sets `base: "/money-journal/"` for production builds so assets resolve correctly when served from a GitHub Pages project subpath.

## [1.0.0] - First public release

### Added

- Migrated from a single self-contained HTML file to a Vite + React + Tailwind project structure under `src/`, with ESLint and Prettier configured.
- README, LICENSE (MIT), CONTRIBUTING, CODE_OF_CONDUCT, and SECURITY documentation.
- **Error boundary** with a recovery screen. A rendering crash no longer produces a blank page, and the fallback offers a "Download my data" export that reads directly from `localStorage` so a broken UI can never lock a user out of their records.
- **Automatic local backup.** Each save copies the previous known-good record to a separate key. If the primary record is corrupt on load, the backup is restored automatically and the user is told.
- **Restore automatic backup** action in Settings → Data.
- **Validated JSON import.** Backups are checked for shape, schema version, and well-formed dates before they can replace live data, with a styled in-app confirmation step.
- **Explicit schema versioning and a migration chain** (`SCHEMA_VERSION`, `migrate()`), so old saves and old exported backups upgrade deterministically instead of being reinterpreted by guesswork.
- **Save-failure reporting.** `saveData` now returns a status code and the UI surfaces a banner when the browser refuses to persist (quota exceeded, private mode, storage disabled) instead of failing silently.
- **Self-hosted Inter font** via `@fontsource/inter`, bundled at build time.
- **Favicon, web app manifest, theme-color, and Open Graph metadata.**
- **About dialog** explaining the project's privacy-first philosophy, reachable from the footer.
- **GitHub Actions CI** running install, lint, and build across Node 18, 20, and 22.

### Changed

- Destructive and irreversible actions (import, restore, clear all data) now use styled in-app confirmation dialogs instead of `window.confirm` / `window.alert`.
- Removed the Google Fonts CDN request. The app now makes **zero third-party network requests**, making the "your financial data never leaves your device" claim literally verifiable in the Network tab.

### Notes

- No business logic changed in this release. All dashboard, budget, recurrence, reflection, formatting, and migration behavior was verified against known-good expected values after the changes (30 checks, all passing).

## [0.3.0] - Budget connected to the dashboard

### Added

- Budget items replace the old fixed-category recurring templates: unlimited custom items with name, amount, category (existing or new), recurrence (monthly/weekly/yearly/one-time), optional due date, notes, and an active toggle. Items can be added, edited, deleted, disabled, and reordered.
- Dashboard now shows Current Balance, Monthly Income, Actual Expenses, Planned Expenses, Remaining Budget, Expected End-of-Month Balance, and Available to Spend per day, all computed automatically from income, logged expenses, and planned budget items.
- Monthly Financial Summary card: total income, fixed vs. variable expenses, remaining budget, savings, budget utilization %, largest expense, and largest budget category.
- Paid/Upcoming/Overdue/Completed status per budget item, computed automatically from linked expenses.
- A "planned expenses still due" banner with one-tap logging, individually or all at once.

### Changed

- Recurring items now persist independently of any single month and are evaluated fresh each time the viewed month changes, rather than needing to be recreated.

## [0.2.0] - Daily-use improvements

### Added

- One-click category chips in quick-add, with a live best-guess highlighted as you type.
- Inline edit for any transaction (click to open a prefilled form) instead of delete-and-recreate.
- Undo-able delete (5-second window) instead of instant, unconfirmed removal.
- Day-grouped transaction history with search and category filters.
- Recurring expense templates (the precursor to budget items in 0.3.0).
- Rule-based "Money Reflection" insights: average daily spend, weekday vs. weekend pattern, days above average, and a spending-rate runway estimate, alongside the original saved-amount and biggest-category messages.
- Dark mode (light / dark / system), currency selection, and JSON export/import in Settings.
- A guarded "clear all data" action.

### Fixed

- Corrupted or unreadable local storage now shows a dismissible notice instead of silently resetting without explanation.

## [0.1.0] - Initial dashboard

### Added

- Income and expense tracking with categories, payment methods, and notes.
- Quick-add for daily expenses ("Coffee - 3").
- Dashboard overview cards: balance, income, expenses, saved, spending percentage.
- Spending-by-category donut chart, daily spending timeline, and a six-month trend chart.
- Monthly view with month-to-month navigation.
- "Money Reflection" section with simple rule-based, non-judgmental insights.
- All data stored locally in the browser via `localStorage` - no accounts, no backend.
