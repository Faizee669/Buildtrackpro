import { Router, type IRouter } from "express";
import { db, expensesTable, projectsTable } from "@workspace/db";
import { sql, eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

// GET /analytics/summary
router.get("/analytics/summary", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;

  const [agg] = await db.select({
    totalExpenses: sql<string>`COUNT(*)::int`,
    avgExpense:    sql<string>`ROUND(AVG(${expensesTable.amount})::numeric, 2)`,
    largestExpense: sql<string>`MAX(${expensesTable.amount})`,
    uniqueVendors: sql<string>`COUNT(DISTINCT ${expensesTable.vendor})::int`,
  })
  .from(expensesTable)
  .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
  .where(eq(projectsTable.userId, userId));

  const hotMonthRows = await db.execute(sql`
    SELECT TO_CHAR(e.date::date, 'Mon YYYY') AS month, SUM(e.amount)::numeric AS total
    FROM expenses e
    JOIN projects p ON e.project_id = p.id
    WHERE p.user_id = ${userId}
    GROUP BY TO_CHAR(e.date::date, 'Mon YYYY'), TO_CHAR(e.date::date, 'YYYY-MM')
    ORDER BY total DESC LIMIT 1
  `);

  res.json({
    totalExpenses: Number(agg?.totalExpenses ?? 0),
    avgExpense:    parseFloat(agg?.avgExpense ?? "0"),
    largestExpense: parseFloat(agg?.largestExpense ?? "0"),
    uniqueVendors: Number(agg?.uniqueVendors ?? 0),
    hotMonth: (hotMonthRows.rows[0]?.month as string) ?? "N/A",
    hotMonthTotal: parseFloat((hotMonthRows.rows[0]?.total as string) ?? "0"),
  });
});

// GET /analytics/category-trend
router.get("/analytics/category-trend", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const rows = await db.execute(sql`
    SELECT
      TO_CHAR(e.date::date, 'Mon YY') AS month,
      TO_CHAR(e.date::date, 'YYYY-MM') AS month_key,
      e.category,
      ROUND(SUM(e.amount)::numeric, 2) AS total
    FROM expenses e
    JOIN projects p ON e.project_id = p.id
    WHERE p.user_id = ${userId}
      AND e.date::date >= CURRENT_DATE - INTERVAL '6 months'
    GROUP BY month_key, month, e.category
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

// GET /analytics/daily-spending
router.get("/analytics/daily-spending", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const rows = await db.execute(sql`
    SELECT
      DATE(e.date) AS day,
      ROUND(SUM(e.amount)::numeric, 2) AS total,
      COUNT(*)::int AS count
    FROM expenses e
    JOIN projects p ON e.project_id = p.id
    WHERE p.user_id = ${userId}
      AND e.date::date >= CURRENT_DATE - INTERVAL '30 days'
    GROUP BY DATE(e.date)
    ORDER BY day ASC
  `);
  res.json(rows.rows.map(r => ({
    day: r.day,
    total: parseFloat(r.total as string),
    count: Number(r.count),
  })));
});

// GET /analytics/dow-pattern
router.get("/analytics/dow-pattern", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const rows = await db.execute(sql`
    SELECT
      TO_CHAR(e.date::date, 'Dy') AS day,
      EXTRACT(DOW FROM e.date::date)::int AS dow_num,
      ROUND(SUM(e.amount)::numeric, 2) AS total,
      COUNT(*)::int AS count
    FROM expenses e
    JOIN projects p ON e.project_id = p.id
    WHERE p.user_id = ${userId}
    GROUP BY day, dow_num
    ORDER BY dow_num
  `);
  res.json(rows.rows.map(r => ({
    day: r.day,
    total: parseFloat(r.total as string),
    count: Number(r.count),
  })));
});

// GET /analytics/project-health
router.get("/analytics/project-health", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const rows = await db.execute(sql`
    SELECT
      p.id,
      p.name,
      p.budget::numeric AS budget,
      COALESCE(SUM(e.amount), 0)::numeric AS spent,
      p.status,
      MAX(e.date) AS last_expense_date,
      COUNT(e.id)::int AS expense_count
    FROM projects p
    LEFT JOIN expenses e ON e.project_id = p.id
    WHERE p.user_id = ${userId}
    GROUP BY p.id, p.name, p.budget, p.status
    ORDER BY spent DESC
  `);

  res.json(rows.rows.map(r => {
    const budget = parseFloat(r.budget as string);
    const spent = parseFloat(r.spent as string);
    return {
      id: String(r.id),
      name: r.name,
      budget,
      spent,
      remaining: budget - spent,
      pctUsed: budget > 0 ? Math.round((spent / budget) * 100) : 0,
      expenseCount: Number(r.expense_count),
      status: r.status,
      lastExpenseDate: r.last_expense_date ? String(r.last_expense_date) : null,
    };
  }));
});

// GET /analytics/category-radar
router.get("/analytics/category-radar", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const rows = await db.execute(sql`
    SELECT e.category, ROUND(SUM(e.amount)::numeric, 2) AS total
    FROM expenses e
    JOIN projects p ON e.project_id = p.id
    WHERE p.user_id = ${userId}
    GROUP BY e.category
    ORDER BY total DESC
    LIMIT 8
  `);
  res.json(rows.rows.map(r => ({
    category: r.category,
    total: parseFloat(r.total as string),
  })));
});

export default router;
