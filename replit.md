# Workspace

## Overview

BuildTrack Pro+ – Construction Expense Manager. A full-stack web app for tracking construction project expenses, budgets, receipts, and analytics.

## Recent Changes

- **Apr 2026 — Per-Project Stack dashboard**: Replaced the dashboard with a per-project card layout (variant B graduation): each card shows budget bar with this-week overlay, three metric chips (this-week/labor/profit margin), category strip, and right-rail AI Advisor + Top Vendors panels. Backed by new endpoint `GET /api/dashboard/project-cards` returning totalSpent, laborSpent, thisWeekSpent (last 7 days), profitMargin, daysActive, and top categories with %.
- **Project location field**: Added `location` text column to `projectsTable` (raw SQL since drizzle-kit push was blocked); surfaced in OpenAPI Project/CreateProjectBody/UpdateProjectBody and in the Quick Add project form.
- **OpenAPI alignment**: Added phases/crew/inventory endpoints + schemas to `openapi.yaml` so orval regenerates the hooks the frontend uses (`useListPhases`, `useCreatePhase`, etc.). PATCH `/phases/:id` and `/crew/:id` now return computed fields (`totalExpenses`/`expenseCount`, `laborCost`) to match the schemas. `useCreatePhase` mutate now takes `{ projectId, data }`.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Frontend**: React + Vite + Tailwind CSS + shadcn/ui
- **Charts**: Recharts
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **File uploads**: multer
- **Authentication**: Replit OIDC (openid-client, session-based with PostgreSQL)

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/         # Express API server (routes for auth, projects, expenses, dashboard)
│   └── buildtrack/         # React + Vite frontend (dashboard, projects, expenses)
├── lib/
│   ├── api-spec/           # OpenAPI spec + Orval codegen config
│   ├── api-client-react/   # Generated React Query hooks
│   ├── api-zod/            # Generated Zod schemas from OpenAPI
│   ├── db/                 # Drizzle ORM schema + DB connection
│   └── replit-auth-web/    # useAuth() hook for browser (fetches /api/auth/user)
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

- **Dashboard**: Budget overview, category pie chart, project bar chart, spending trend line chart, recent expenses, top vendors horizontal bar chart
- **AI Cost Advisor**: On-demand AI insights panel using OpenAI (via Replit AI Integrations proxy); generates spending analysis with warnings/tips
- **Projects**: Create/edit/view projects with budget tracking and status (active/completed/on_hold)
- **Expenses**: Log expenses with category, vendor, date, notes, receipt upload; client-side vendor/notes search filter
- **OCR Receipt Scanning**: Upload receipt images and auto-fill amount, vendor, date using Tesseract.js (client-side WebAssembly OCR)
- **Filters**: Filter expenses by project, category, date range
- **CSV Export**: Export filtered expenses to CSV
- **Receipt Upload**: Upload receipt images via multer, stored in uploads/receipts/
- **Authentication**: Replit OIDC via `openid-client`; sessions stored in `sessions` table
- **PWA**: Progressive Web App support — manifest.json with theme/icons, service worker (sw.js) with offline fallback, iOS meta tags

## Database Schema

- `users` — Replit user (id varchar, email, first_name, last_name, profile_image_url, timestamps)
- `sessions` — OIDC session storage (sid, sess jsonb, expire)
- `projects` — name, description, budget, start_date, status
- `expenses` — project_id, category, amount, vendor, date, notes, receipt_url

## API Routes

All routes are under `/api`:

- `GET /auth/user` — Current user from session (returns `{user: AuthUser|null}`)
- `GET /login` — Start OIDC login flow (redirects to Replit OIDC)
- `GET /callback` — OIDC callback (creates session, redirects to app)
- `GET /logout` — Clear session and end OIDC session
- `POST /mobile-auth/token-exchange` — Mobile OIDC token exchange
- `POST /mobile-auth/logout` — Mobile session logout
- `GET/POST /projects` — List/create projects
- `GET/PATCH/DELETE /projects/:id` — Get/update/delete project
- `GET/POST /expenses` — List/create expenses (supports filters: projectId, category, startDate, endDate)
- `GET/PATCH/DELETE /expenses/:id` — Get/update/delete expense
- `POST /expenses/upload-receipt` — Upload receipt image
- `GET /expenses/export` — Export expenses as CSV
- `GET /dashboard/stats` — Budget overview stats
- `GET /dashboard/spending-by-category` — Category breakdown
- `GET /dashboard/spending-by-project` — Project spending vs budget
- `GET /dashboard/spending-trend` — Monthly trend (last 12 months)
- `GET /dashboard/recent-expenses` — 5 most recent expenses
- `GET /dashboard/top-vendors` — Top vendors by total spend
- `GET /ai-insights` — AI-generated spending insights (OpenAI via Replit AI Integrations)

## Auth Flow

- `useAuth()` from `@workspace/replit-auth-web` fetches `/api/auth/user` with `credentials: "include"`
- `login()` redirects to `/api/login?returnTo=<base>` (full page nav, not iframe)
- `logout()` redirects to `/api/logout`
- Sessions stored in PostgreSQL `sessions` table, cookie name `sid`
- Auth middleware (`authMiddleware.ts`) attaches `req.user` from session on every request

## Expense Categories

Materials, Labor, Fuel, Equipment Rental, Tools, Permits, Misc

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json`. Root `tsconfig.json` lists all lib packages as project references.

- `pnpm run typecheck:libs` — builds composite libs
- `pnpm run typecheck` — full check
- `pnpm --filter @workspace/api-spec run codegen` — re-generate API hooks & Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes
