import { Router, type IRouter, type Request, type Response } from "express";
import { db, expensesTable, projectsTable } from "@workspace/db";
import { sql, eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

// Helper: wrap every handler so DB errors surface as JSON instead of crashing
function wrap(fn: (req: Request, res: Response) => Promise<void>) {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (err: any) {
      console.error("[Analytics] Error:", err?.message ?? err);
      res.status(500).json({ error: err?.message ?? "Internal server error" });
    }
  };
}

// GET /analytics/summary
router.get("/analytics/summary", requireAuth, wrap(async (req, res) => {
  const userId = req.user!.id;

  const [agg] = await db
    .select({
      totalExpenses: sql<number>`COUNT(*)::int`,
      avgExpense: sql<number>`COALESCE(ROUND(AVG(${expensesTable.amount})::numeric, 2), 0)`,
      largestExpense: sql<number>`COALESCE(MAX(${expensesTable.amount}), 0)`,
      uniqueVendors: sql<number>`COUNT(DISTINCT ${expensesTable.vendor})::int`,
    })
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(eq(projectsTable.userId, userId));

  const hotMonthRows = await db.execute(sql`
    SELECT
      TO_CHAR(e.date::date, 'Mon YYYY') AS month,
      SUM(e.amount)::numeric AS total
    FROM expenses e
    JOIN projects p ON e.project_id = p.id
    WHERE p.user_id = ${userId}
    GROUP BY TO_CHAR(e.date::date, 'Mon YYYY'), TO_CHAR(e.date::date, 'YYYY-MM')
    ORDER BY total DESC
    LIMIT 1
  `);

  res.json({
    totalExpenses: Number(agg?.totalExpenses ?? 0),
    avgExpense: parseFloat(String(agg?.avgExpense ?? "0")),
    largestExpense: parseFloat(String(agg?.largestExpense ?? "0")),
    uniqueVendors: Number(agg?.uniqueVendors ?? 0),
    hotMonth: (hotMonthRows.rows[0]?.month as string) ?? "N/A",
    hotMonthTotal: parseFloat(String(hotMonthRows.rows[0]?.total ?? "0")),
  });
}));

// GET /analytics/category-trend
router.get("/analytics/category-trend", requireAuth, wrap(async (req, res) => {
  const userId = req.user!.id;

  const rows = await db
    .select({
      month: sql<string>`TO_CHAR(${expensesTable.date}::date, 'Mon YY')`,
      month_key: sql<string>`TO_CHAR(${expensesTable.date}::date, 'YYYY-MM')`,
      category: expensesTable.category,
      total: sql<string>`ROUND(SUM(${expensesTable.amount})::numeric, 2)`,
    })
    .from(expensesTable)
    .innerJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(
      and(
        eq(projectsTable.userId, userId),
        sql`${expensesTable.date}::date >= CURRENT_DATE - INTERVAL '6 months'`
      )
    )
    .groupBy(
      sql`TO_CHAR(${expensesTable.date}::date, 'YYYY-MM')`,
      sql`TO_CHAR(${expensesTable.date}::date, 'Mon YY')`,
      expensesTable.category
    )
    .orderBy(sql`TO_CHAR(${expensesTable.date}::date, 'YYYY-MM')`);

  const map: Record<string, Record<string, unknown>> = {};
  for (const r of rows) {
    const key = r.month_key;
    if (!map[key]) map[key] = { month: r.month };
    map[key][r.category as string] = parseFloat(r.total as string);
  }
  res.json(Object.values(map));
}));

// GET /analytics/daily-spending
router.get("/analytics/daily-spending", requireAuth, wrap(async (req, res) => {
  const userId = req.user!.id;

  const rows = await db
    .select({
      day: sql<string>`DATE(${expensesTable.date})`,
      total: sql<string>`ROUND(SUM(${expensesTable.amount})::numeric, 2)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(expensesTable)
    .innerJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(
      and(
        eq(projectsTable.userId, userId),
        sql`${expensesTable.date}::date >= CURRENT_DATE - INTERVAL '30 days'`
      )
    )
    .groupBy(sql`DATE(${expensesTable.date})`)
    .orderBy(sql`DATE(${expensesTable.date}) ASC`);

  res.json(rows.map(r => ({
    day: r.day,
    total: parseFloat(r.total as string),
    count: Number(r.count),
  })));
}));

// GET /analytics/dow-pattern
router.get("/analytics/dow-pattern", requireAuth, wrap(async (req, res) => {
  const userId = req.user!.id;

  const rows = await db
    .select({
      day: sql<string>`TO_CHAR(${expensesTable.date}::date, 'Dy')`,
      dow_num: sql<number>`EXTRACT(DOW FROM ${expensesTable.date}::date)::int`,
      total: sql<string>`ROUND(SUM(${expensesTable.amount})::numeric, 2)`,
      count: sql<number>`COUNT(*)::int`,
    })
    .from(expensesTable)
    .innerJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(eq(projectsTable.userId, userId))
    .groupBy(
      sql`TO_CHAR(${expensesTable.date}::date, 'Dy')`,
      sql`EXTRACT(DOW FROM ${expensesTable.date}::date)::int`
    )
    .orderBy(sql`EXTRACT(DOW FROM ${expensesTable.date}::date)::int`);

  res.json(rows.map(r => ({
    day: r.day,
    total: parseFloat(r.total as string),
    count: Number(r.count),
  })));
}));

// GET /analytics/project-health
router.get("/analytics/project-health", requireAuth, wrap(async (req, res) => {
  const userId = req.user!.id;

  const rows = await db
    .select({
      id: projectsTable.id,
      name: projectsTable.name,
      budget: projectsTable.budget,
      spent: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)::numeric`,
      status: projectsTable.status,
      last_expense_date: sql<string>`MAX(${expensesTable.date})`,
      expense_count: sql<number>`COUNT(${expensesTable.id})::int`,
    })
    .from(projectsTable)
    .leftJoin(expensesTable, eq(expensesTable.projectId, projectsTable.id))
    .where(eq(projectsTable.userId, userId))
    .groupBy(
      projectsTable.id,
      projectsTable.name,
      projectsTable.budget,
      projectsTable.status
    )
    .orderBy(desc(sql`COALESCE(SUM(${expensesTable.amount}), 0)::numeric`));

  res.json(rows.map(r => {
    const budget = parseFloat(r.budget as string);
    const spent  = parseFloat(r.spent as string);
    return {
      id:              String(r.id),
      name:            r.name,
      budget,
      spent,
      remaining:       budget - spent,
      pctUsed:         budget > 0 ? Math.round((spent / budget) * 100) : 0,
      expenseCount:    Number(r.expense_count),
      status:          r.status,
      lastExpenseDate: r.last_expense_date ? String(r.last_expense_date) : null,
    };
  }));
}));

// GET /analytics/category-radar
router.get("/analytics/category-radar", requireAuth, wrap(async (req, res) => {
  const userId = req.user!.id;

  const rows = await db
    .select({
      category: expensesTable.category,
      total: sql<string>`ROUND(SUM(${expensesTable.amount})::numeric, 2)`,
    })
    .from(expensesTable)
    .innerJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(eq(projectsTable.userId, userId))
    .groupBy(expensesTable.category)
    .orderBy(desc(sql`ROUND(SUM(${expensesTable.amount})::numeric, 2)`))
    .limit(8);

  res.json(rows.map(r => ({
    category: r.category,
    total:    parseFloat(r.total as string),
  })));
}));

export default router;
