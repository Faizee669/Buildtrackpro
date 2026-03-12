# Workspace

## Overview

BuildTrack – Construction Expense Manager. A full-stack web app for tracking construction project expenses, budgets, receipts, and analytics.

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
│   └── db/                 # Drizzle ORM schema + DB connection
├── scripts/
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── package.json
```

## Features

- **Dashboard**: Budget overview, category pie chart, project bar chart, spending trend line chart, recent expenses
- **Projects**: Create/edit/view projects with budget tracking and status (active/completed/on_hold)
- **Expenses**: Log expenses with category, vendor, date, notes, receipt upload
- **Filters**: Filter expenses by project, category, date range
- **CSV Export**: Export filtered expenses to CSV
- **Receipt Upload**: Upload receipt images via multer, stored in uploads/receipts/
- **Authentication**: Replit Auth (X-Replit-User-* headers)

## Database Schema

- `users` - Replit user ID, name, profile image, role
- `projects` - name, description, budget, start_date, status
- `expenses` - project_id, category, amount, vendor, date, notes, receipt_url

## API Routes

All routes are under `/api`:

- `GET /auth/me` — Current user (from Replit Auth headers)
- `GET /auth/login` — Redirect to Replit Auth
- `GET /auth/logout` — Logout redirect
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

## Expense Categories

Materials, Labor, Fuel, Equipment Rental, Tools, Permits, Misc

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json`. Root `tsconfig.json` lists all lib packages as project references.

- `pnpm run typecheck:libs` — builds composite libs
- `pnpm run typecheck` — full check
- `pnpm --filter @workspace/api-spec run codegen` — re-generate API hooks & Zod schemas
- `pnpm --filter @workspace/db run push` — push DB schema changes
