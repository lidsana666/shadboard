# Redesign plan: Engineering Management Platform

Branch flow: one branch per slice, one commit per T-task. Every phase ends with `tsc`, lint, tests and build clean.
Rules for all phases: strict TS, no `any`; business rules in `src/configs/`; data via `src/services/`; one generic `Table`, `StatusBadge`, `KpiCard`, `PageState`; options via `uniq(rows, key)`; no nav link without a working page.

## Slice 1 (this slice, phases 1-3)

- T-01 Audit and plan (this folder).
- T-02 Design tokens (`globals.css`, `src/configs/tokens.ts`).
- T-03 Domain types, seed data, services, RBAC, tests.
- T-04 Application shell (nav, header, palette, create menu, notifications, favourites).
- T-05 Executive Engineering Dashboard, set as home.

## Phase 4: Organization, teams, roles

- T-06 Organization and Teams list + detail (`/organization/teams`). Exit: table with search, filter by department derived from data, team detail with members and capacity; server-side `view` check; loading/empty/error states.
- T-07 People directory (`/organization/people`). Exit: engineer table with role, team, location filters; no individual performance ranking; deep link from team detail.
- T-08 Roles and permissions viewer (`/organization/roles`). Exit: matrix rendered from `configs/rbac.ts`; tests prove viewer equals config.

## Phase 5: Projects, sprints, releases, deployments

- T-09 Projects portfolio (list, status board, detail). Exit: all nine statuses, filters from data, create action gated by `can`.
- T-10 Sprints (current, backlog health, burndown). Exit: burndown chart with text summary, sprint list table.
- T-11 Releases (calendar/list, readiness checklist, approvals). Exit: approve action gated; status tones from config.
- T-12 Deployments (history, filters by environment, rollback marker). Exit: 200+ rows paginated, environment filter, deploy action gated server-side.

## Phase 6: DX, portal, catalog, repositories, CI

- T-13 Service catalog (owner, tier, dependencies, health). Exit: detail page links repos, incidents, deployments.
- T-14 Repositories and pull requests. Exit: repo table, open PR age, review latency from services.
- T-15 CI/CD pipelines (build success, flaky tests, duration). Exit: trend charts with accessible summaries.
- T-16 Developer portal landing (docs, templates, golden paths) built from catalog data. Exit: search across entities.

## Phase 7: Incidents and SRE

- T-17 Incident list and detail with the six-step workflow. Exit: legal transitions enforced in service layer; SEV-1..4 tones from config.
- T-18 On-call and SLO views. Exit: error-budget indicators with thresholds from config.
- T-19 Postmortems. Exit: required for SEV-1/2 before closing; action items tracked.

## Phase 8: Security, admin, RBAC UI, audit log

- T-20 Security posture (vulnerabilities by severity, SLA ageing). Exit: gated to Security, CTO and above.
- T-21 Admin: users and role assignment UI. Exit: `manage_users`/`manage_roles` enforced in route handlers; cannot remove last Super Admin.
- T-22 Audit log (who, what, when, resource). Exit: append-only service, every mutation writes an entry, filterable table.
- T-23 Real identity source (replace mock sign-in, persist roles in Prisma). Exit: migration, seeded admin, sign-in tests.

## Phase 9: Responsive, accessibility, performance

- T-24 Responsive pass: every table has a card layout under `md`. Exit: manual checks at 360, 768, 1280 widths.
- T-25 Accessibility pass: axe on key routes, focus order, chart text alternatives, reduced motion. Exit: zero serious axe violations.
- T-26 Performance: lazy-load charts and editors, route-level code splitting, bundle budget. Exit: first-load JS budget recorded in config and checked in CI.
- T-27 i18n: move dashboard and shell strings into dictionaries (en, ar, lo). Exit: no hardcoded UI strings outside config.

## Phase 10: Testing

- T-28 Unit coverage for lib and services (DORA, RBAC, uniq, state machines). Exit: coverage report, thresholds in config.
- T-29 Component tests for `Table`, `KpiCard`, `StatusBadge`, `PageState`. Exit: states and a11y roles asserted.
- T-30 E2E smoke (Playwright) against `next start`: sign-in, dashboard, per-role nav. Exit: runs in CI and in the deploy script.
