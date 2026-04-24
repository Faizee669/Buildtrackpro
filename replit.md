# Workspace

## Overview

BuildTrack Pro+ – Construction Expense Manager. A full-stack web app for tracking construction project expenses, budgets, receipts, and analytics. Multi-tenant SaaS with user isolation, client-shareable project reports, in-app notifications, and settings management.

## Recent Changes

- **Apr 2026 — SaaS Features**: Added 6 major SaaS features:
  1. **Multi-tenancy/data isolation**: All routes now require `requireAuth` middleware and filter by `req.user.id`. Projects, crew, inventory, expenses, phases, dashboard, analytics, AI insights all scoped to the logged-in user.
  2. **Client-shareable project reports**: `POST /api/projects/:id/share` generates a unique token; `GET /api/public/projects/:token` returns read-only project data. Public `/share/:token` page renders a full report with budget, categories, phases, and recent expenses. Share button + revoke link in project details page.
  3. **Settings page**: `/settings` page with profile editing (firstName, lastName, companyName), notification preferences (email alerts, budget alerts), and subscription plan display (Free/Pro).
  4. **Onboarding wizard**: 3-step modal shown on dashboard when user has no projects. Steps: Create Project → Add Expense → Add Crew. Dismissal stored in localStorage.
  5. **Budget alerts/notifications**: `notifications` table stores in-app alerts. When an expense is added that pushes a project over budget, a notification is created. Notifications bell in header with unread count badge, dropdown list with mark-read/delete, and mark-all-read.
  6. **User profile extension**: `users` table extended with `company_name`, `plan` (free/pro), `stripe_customer_id`, `stripe_subscription_id`, `notifications_email`, `notifications_overbudget`. Settings API: `GET/PATCH /api/settings/profile`.

- **Apr 2026 — Per-Project Stack dashboard**: Replaced the dashboard with a per-project card layout (variant B graduation): each card shows budget bar with this-week overlay, three metric chips (this-week/labor/profit margin), category strip, and right-rail AI Advisor + Top Vendors panels. Backed by new endpoint `GET /api/dashboard/project-cards` returning totalSpent, laborSpent, thisWeekSpent (last 7 days), profitMargin, daysActive, and top categories with %.
- **Project location field**: Added `location` text column to `projectsTable` (raw SQL since drizzle-kit push was blocked); surfaced in OpenAPI Project/CreateProjectBody/UpdateProjectBody and in the Quick Add project form.
- **OpenAPI alignment**: Added phases/crew/inventory endpoints + schemas to `openapi.yaml` so orval regenerates the hooks the frontend uses (`useListPhases`, `useCreatePhase`, etc.). PATCH `/phases/:id` and `/crew/:id` now return computed fields (`totalExpenses`/`expenseCount`, `laborCost`) to match the schemas. `useCreatePhase` mutate now takes `{ projectId, data }`.
- **Project details overhaul**: Replaced the old project details layout with a rich analytics view. KPI strip (Budget Used %, Remaining, Labor Spent, Material Spent, Daily Burn / Profit Margin, Days Active) sits above a budget utilization bar, followed by tabs: **Overview** (weekly spending trend BarChart, spending-by-category horizontal bars, budget allocation donut, phase spending bars), **Phases**, **Expenses** (with live search + category dropdown filter). Also expanded `Project` OpenAPI schema to expose `laborSpent`, `materialSpent`, `profit`, `profitMargin`, `estimatedRevenue`, `laborBudget`, `materialBudget`. Removed hard-coded category enum from `CreateExpenseBody`/`UpdateExpenseBody`/`Expense` — any free-form category string is now accepted.

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

- **Dashboard**: Per-project expense cards with budget bars, weekly spend, labor costs, profit margin; AI Advisor panel; Top Vendors; onboarding wizard for new users
- **Multi-tenancy**: All data scoped to the logged-in user via `userId` columns on projects/crew/inventory
- **AI Cost Advisor**: On-demand AI insights panel using OpenAI (via Replit AI Integrations proxy); generates spending analysis with warnings/tips
- **Projects**: Create/edit/view projects with budget tracking and status (active/completed/on_hold)
- **Share Link**: Generate a public read-only share link for any project (`/share/:token`); clients can view budget, categories, phases, and recent expenses without logging in
- **Expenses**: Log expenses with category, vendor, date, notes, receipt upload; client-side vendor/notes search filter
- **Budget Alerts**: In-app notifications created when project goes over budget; notification bell in header with unread count
- **Settings**: Profile editing (name, company), notification preferences, subscription plan display
- **Onboarding Wizard**: 3-step modal for new users to guide them through creating a project, adding expenses, and building their crew
- **OCR Receipt Scanning**: Upload receipt images and auto-fill amount, vendor, date using Tesseract.js (client-side WebAssembly OCR)
- **Filters**: Filter expenses by project, category, date range
- **CSV Export**: Export filtered expenses to CSV
- **Receipt Upload**: Upload receipt images via multer, stored in uploads/receipts/
- **Authentication**: Replit OIDC via `openid-client`; sessions stored in `sessions` table
- **PWA**: Progressive Web App support — manifest.json with theme/icons, service worker (sw.js) with offline fallback, iOS meta tags

## Database Schema

- `users` — Replit user (id varchar, email, first_name, last_name, profile_image_url, company_name, plan, stripe_customer_id, stripe_subscription_id, notifications_email, notifications_overbudget, timestamps)
- `sessions` — OIDC session storage (sid, sess jsonb, expire)
- `projects` — name, description, budget, labor_budget, material_budget, estimated_revenue, start_date, status, user_id, share_token, location
- `expenses` — project_id, category, amount, vendor, date, notes, receipt_url, crew, equipment, phase_id
- `crew` — name, role, daily_rate, phone, project_id, status, user_id
- `inventory` — name, unit, quantity, cost_per_unit, reorder_level, vendor, project_id, user_id
- `phases` — project_id, name, description, status
- `notifications` — user_id, type, title, message, read, project_id, created_at

## API Routes

All routes under `/api`:

- `GET /auth/user` — Current user from session
- `GET /login`, `GET /callback`, `GET /logout` — OIDC auth
- `GET/POST /projects` — List/create projects (userId scoped)
- `GET/PATCH/DELETE /projects/:id` — Get/update/delete project
- `POST /projects/:id/share` — Generate share token
- `DELETE /projects/:id/share` — Revoke share token
- `GET/POST /expenses` — List/create expenses (userId scoped via project join)
- `GET/PATCH/DELETE /expenses/:id` — Get/update/delete expense
- `POST /expenses/upload-receipt` — Upload receipt image
- `GET /expenses/export` — Export expenses as CSV
- `GET /dashboard/stats` — Budget overview stats (userId scoped)
- `GET /dashboard/project-cards` — Per-project card data
- `GET /dashboard/recent-expenses` — 5 most recent expenses
- `GET /dashboard/top-vendors` — Top vendors by total spend
- `GET /analytics/summary` — Key metrics
- `GET /analytics/category-trend` — Monthly category breakdown
- `GET /analytics/daily-spending` — Daily spend last 30 days
- `GET /analytics/project-health` — Budget health per project
- `GET /ai-insights` — AI-generated spending insights
- `GET/POST /crew` — List/create crew members (userId scoped)
- `GET/POST /inventory` — List/create inventory items (userId scoped)
- `GET/PATCH/DELETE /projects/:id/phases` — Phase management
- `GET /settings/profile` — Get user profile
- `PATCH /settings/profile` — Update user profile
- `GET /notifications` — List notifications
- `PATCH /notifications/:id/read` — Mark notification as read
- `POST /notifications/read-all` — Mark all as read
- `DELETE /notifications/:id` — Delete notification
- `GET /public/projects/:token` — Public read-only project report

## Auth Flow

- `useAuth()` from `@workspace/replit-auth-web` fetches `/api/auth/user` with `credentials: "include"`
- `login()` redirects to `/api/login?returnTo=<base>` (full page nav, not iframe)
- `logout()` redirects to `/api/logout`
- Sessions stored in PostgreSQL `sessions` table, cookie name `sid`
- Auth middleware (`authMiddleware.ts`) attaches `req.user` from session on every request
- `requireAuth` middleware returns 401 if not authenticated

## Expense Categories

Materials, Labor, Fuel, Equipment Rental, Tools, Permits, Misc

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json`. Root `tsconfig.json` lists all lib packages as project references.

- `pnpm run typecheck:libs` — builds composite libs
- `pnpm run typecheck` — full check
- `pnpm --filter @workspace/api-spec run codegen` — re-generate API hooks & Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes

## Important Notes

- Drizzle-kit push is blocked (interactive prompt); always use raw SQL for schema changes
- New API routes (settings, notifications, public) use direct fetch calls in the frontend (not Orval-generated)
- Budget alerts are created on expense insert when total spend exceeds project budget
- Share tokens are 32-char hex strings (crypto.randomBytes(16))
- Settings page uses react-hook-form for form state management
