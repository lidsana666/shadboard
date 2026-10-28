# Shadboard full-kit audit (T-01)

Scope: `full-kit/` (Next.js 15.2 App Router, React 19, Tailwind 4, shadcn/ui on Radix, next-auth 4, Prisma/SQLite).
Goal: evolve the template into an Engineering Management Platform without a rebuild.

## 1. Structure

- `src/app/[lang]/(dashboard-layout)`: authenticated shell. Groups: `dashboards/{analytics,crm,ecommerce}`, `apps/{email,chat,calendar,kanban}`, `pages/{account,payment,pricing}`, `(design-system)/*`.
- `src/app/[lang]/(plain-layout)`: auth and public pages. `src/app/api/auth`: next-auth and a mock sign-in route.
- `src/components`: `ui/` (shadcn, ~70 files), `layout/` (sidebar, header, command menu), `dashboards/`, per-app components.
- `src/configs` (next-auth, i18n, themes, auth-routes), `src/data` (nav, dictionaries, mocks), `src/lib`, `src/hooks`, `src/providers`, `src/contexts`.
- Route-local `_components`, `_data`, `types.ts` per page. Single flat `src/types.ts`.
- 829 TS/TSX files. Strict TS is on. No test runner, no `docs/`.

## 2. Reusable pieces (keep)

- shadcn sidebar with `collapsible="icon"` support, mobile sheet drawer, `sidebar:state` cookie, `b` shortcut.
- `Card`, `Badge`, `Breadcrumb`, `DropdownMenu`, `Command`, `Skeleton`, `Tabs`, `Sheet`, `Tooltip`, `Table` primitives.
- `chart.tsx` (`ChartContainer`/`ChartConfig` over Recharts 2.15) is theme aware.
- `@tanstack/react-table` header, column toggle and pagination under `ui/data-table`.
- Settings cookie + `ThemeProvider` (theme class and radius class on `body`), 12 colour themes, light/dark/system, RTL direction provider.
- i18n middleware, dictionary loader, `DynamicIcon` (lucide by name).
- `useIsMobile`, `useSettings`, `useIsVertical` hooks.

## 3. Duplication and inconsistency

- Recursive nav rendering is copied three times: `sidebar.tsx`, `command-menu.tsx`, `top-bar-header-menubar.tsx`.
- `dashboard-card.tsx` (289 lines) and `percentage-change-badge.tsx` hardcode colours (`text-green-*`, `text-red-*`) instead of tokens.
- Status colouring is done ad hoc per feature (kanban, email labels, ecommerce orders).
- No generic `Table`. The tables demo builds columns inline. Filters in demos are typed by hand.
- `utils.ts` format helpers are English-only (`formatDistance`, `formatPercent`, `formatDuration`). `formatUnreadCount` caps at "+99".
- Only `--success` exists as a semantic token. No warning/info token. Dark `--destructive` is dim (35% lightness) and fails contrast as text.
- Home path is hardcoded across `.env.example`, `next.config.mjs`, middleware and two auth forms.

## 4. Demo and mock areas

- All three dashboards, every `apps/*` page and `pages/*` use local mock data under `_data`/`data/`.
- `data/user.ts` is the only user, the sign-in route compares against it. Credentials are demo values.
- Notification dropdown reads static data: fixed unread count 100, empty URLs, dismiss-all has no handler, "see all" links to `""`.
- User dropdown hardcodes "John Doe". Nav has a `#` "Help Center" placeholder labelled "Soon".

## 5. Defects found

- Auth: `session` callback assigns `token.status = token.status` (should set `session.user.status`). Session has no role.
- `metadataBase` calls `new URL(process.env.BASE_URL as string)`, so a missing env var crashes the root layout.
- `getDictionaryValue` throws on a missing key, so every new nav title needs en and ar entries.
- No `.env` is shipped, only `.env.example`.
- Settings cookie is parsed with `JSON.parse` without try/catch.

## 6. Accessibility, responsive, performance

- Header icon buttons mostly carry `sr-only` text. Notification and user triggers are fine. Custom clickable divs in demos lack roles.
- Sidebar uses `offcanvas` collapse, so no icon rail. Mobile drawer works at 1024px breakpoint.
- Charts in demos have no title, description or textual alternative. Colour is the only series cue in several.
- Wide tables in demos rely on horizontal scroll. No card fallback on mobile.
- Heavy client bundles: Recharts, FullCalendar, TipTap editor are imported statically in their routes. The dashboard layout is entirely a client component.
- Settings provider returns `null` until the cookie effect runs, so first paint is blank (flash).

## 7. Missing states

- Only a global error boundary exists. No `loading.tsx` or `error.tsx` in dashboard routes.
- No shared empty, error, or no-permission component. Authorisation is limited to signed-in vs guest.

## 8. Decision per module

| Module | Decision | Note |
| --- | --- | --- |
| Sidebar, layout, settings, theme | Improve | Icon collapse, favourites/recents, token clean-up |
| Command menu | Improve | Reuse one nav walker, add entity search from services |
| Header (notifications, user) | Improve | Data-driven, role shown, create menu, env indicator |
| `ui/*` shadcn components | Keep | Do not fork |
| Data table primitives | Improve | Add one generic `Table` driven by `columns` |
| `dashboard-card` / `percentage-change-badge` | Replace | Superseded by `KpiCard` and `StatusBadge` |
| Analytics, CRM, eCommerce dashboards | Keep (move) | Under collapsed "Workspace" group |
| Email, chat, calendar, kanban | Keep (move) | Workspace group |
| Pages (account, payment, pricing) | Keep (move) | Workspace group |
| Design system pages | Keep (move) | Design System group |
| Auth (next-auth + sign-in route) | Improve | Add role claim, fix session callback |
| Prisma schema | Keep | Not used by sign-in, revisit at phase 10 |
| Dictionaries | Improve | Keys for new nav, labels |

## 9. Risks for the redesign

- Dictionary throw-on-missing couples navigation to both locales.
- Mock sign-in means roles come from a static map until a real identity source exists.
- Template tests do not exist, so regressions in kept pages are caught only by build and route smoke checks.
