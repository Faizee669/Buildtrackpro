import { Router, type IRouter } from "express";
import { db, expensesTable, projectsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

const router: IRouter = Router();

// GET /analytics/summary — key headline metrics
router.get("/analytics/summary", async (_req, res): Promise<void> => {
  const [agg] = await db.select({
    totalExpenses: sql<string>`COUNT(*)::int`,
    avgExpense:    sql<string>`ROUND(AVG(amount)::numeric, 2)`,
    largestExpense: sql<string>`MAX(amount)`,
    uniqueVendors: sql<string>`COUNT(DISTINCT vendor)::int`,
  }).from(expensesTable);

  const hotMonth = await db.execute(sql`
    SELECT TO_CHAR(date::date, 'Mon YYYY') AS month, SUM(amount)::numeric AS total
    FROM expenses
    GROUP BY TO_CHAR(date::date, 'Mon YYYY'), TO_CHAR(date::date, 'YYYY-MM')
    ORDER BY total DESC LIMIT 1
  `);

  res.json({
    totalExpenses: Number(agg.totalExpenses ?? 0),
    avgExpense:    parseFloat(agg.avgExpense ?? "0"),
    largestExpense: parseFloat(agg.largestExpense ?? "0"),
    uniqueVendors: Number(agg.uniqueVendors ?? 0),
    hotMonth: (hotMonth.rows[0]?.month as string) ?? "N/A",
    hotMonthTotal: parseFloat((hotMonth.rows[0]?.total as string) ?? "0"),
  });
});

// GET /analytics/category-trend — monthly spending by category (last 6 months)
router.get("/analytics/category-trend", async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT
      TO_CHAR(date::date, 'Mon YY') AS month,
      TO_CHAR(date::date, 'YYYY-MM')  AS month_key,
      category,
      ROUND(SUM(amount)::numeric, 2)  AS total
    FROM expenses
    WHERE date::date >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY month_key, month, category
    ORDER BY month_key
  `);

  const map: Record<string, Record<string, unknown>> = {};
  for (const r of rows.rows) {
    const key = r.month_key as string;
    if (!map[key]) map[key] = { month: r.month };
    map[key][r.category as string] = parseFloat(r.total as string);
  }
  res.json(Object.values(map));
});

// GET /analytics/daily-spending — per-day totals for last 30 days
router.get("/analytics/daily-spending", async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT
      DATE(date)                      AS day,
      ROUND(SUM(amount)::numeric, 2)  AS total,
      COUNT(*)::int                   AS count
    FROM expenses
    WHERE date::date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY day
    ORDER BY day
  `);

  res.json(rows.rows.map(r => ({
    day:   r.day,
    total: parseFloat(r.total as string),
    count: Number(r.count),
  })));
});

// GET /analytics/dow-pattern — day-of-week spending pattern
router.get("/analytics/dow-pattern", async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT
      EXTRACT(DOW FROM date::date)::int   AS dow_num,
      TO_CHAR(date::date, 'Dy')           AS day,
      ROUND(SUM(amount)::numeric, 2)      AS total,
      COUNT(*)::int                       AS count
    FROM expenses
    GROUP BY dow_num, day
    ORDER BY dow_num
  `);

  const DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const filled = DAYS.map((d, i) => {
    const row = rows.rows.find(r => Number(r.dow_num) === i);
    return {
      day:   d,
      total: row ? parseFloat(row.total as string) : 0,
      count: row ? Number(row.count) : 0,
    };
  });
  res.json(filled);
});

// GET /analytics/project-health — per-project budget health
router.get("/analytics/project-health", async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT
      p.id,
      p.name,
      p.budget,
      p.status,
      COALESCE(ROUND(SUM(e.amount)::numeric, 2), 0) AS spent,
      COUNT(e.id)::int                               AS expense_count,
      MAX(e.date::date)                              AS last_expense_date
    FROM projects p
    LEFT JOIN expenses e ON e.project_id = p.id
    GROUP BY p.id, p.name, p.budget, p.status
    ORDER BY (COALESCE(SUM(e.amount),0) / NULLIF(p.budget,0)) DESC
  `);

  res.json(rows.rows.map(r => {
    const budget = parseFloat(r.budget as string);
    const spent  = parseFloat(r.spent as string);
    return {
      id:              r.id,
      name:            r.name,
      budget,
      spent,
      remaining:       budget - spent,
      pctUsed:         budget > 0 ? Math.round((spent / budget) * 100) : 0,
      expenseCount:    Number(r.expense_count),
      status:          r.status,
      lastExpenseDate: r.last_expense_date,
    };
  }));
});

// GET /analytics/category-radar — total per category for radar chart
router.get("/analytics/category-radar", async (_req, res): Promise<void> => {
  const rows = await db.execute(sql`
    SELECT category, ROUND(SUM(amount)::numeric, 2) AS total
    FROM expenses GROUP BY category ORDER BY total DESC
  `);

  res.json(rows.rows.map(r => ({
    category: r.category,
    total: parseFloat(r.total as string),
  })));
});

export default router;
