import { Router, type IRouter } from "express";
import { db, expensesTable, projectsTable } from "@workspace/db";
import { eq, sql, desc, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

// GET /dashboard/stats
router.get("/dashboard/stats", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;

  const [budgetAgg] = await db
    .select({
      budget: sql<string>`COALESCE(SUM(budget), 0)`,
      revenue: sql<string>`COALESCE(SUM(estimated_revenue), 0)`,
    })
    .from(projectsTable)
    .where(eq(projectsTable.userId, userId));

  const [spentAgg] = await db
    .select({
      total: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
      labor: sql<string>`COALESCE(SUM(CASE WHEN ${expensesTable.category} IN ('Labour','Watchman Salary') THEN ${expensesTable.amount} ELSE 0 END), 0)`,
    })
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(eq(projectsTable.userId, userId));

  const [monthAgg] = await db
    .select({ total: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)` })
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(and(
      eq(projectsTable.userId, userId),
      sql`DATE_TRUNC('month', ${expensesTable.date}::timestamp) = DATE_TRUNC('month', CURRENT_DATE)`
    ));

  const [activeCount] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(projectsTable)
    .where(and(eq(projectsTable.userId, userId), eq(projectsTable.status, "active")));

  const [expenseCount] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(eq(projectsTable.userId, userId));

  const totalBudget = parseFloat(budgetAgg?.budget ?? "0");
  const totalRevenue = parseFloat(budgetAgg?.revenue ?? "0");
  const totalSpent = parseFloat(spentAgg?.total ?? "0");
  const laborSpent = parseFloat(spentAgg?.labor ?? "0");
  const materialSpent = Math.max(0, totalSpent - laborSpent);
  const totalProfit = totalRevenue - totalSpent;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

  res.json({
    totalBudget,
    totalSpent,
    totalRevenue,
    totalProfit,
    profitMargin,
    laborSpent,
    materialSpent,
    remainingBudget: totalBudget - totalSpent,
    spentThisMonth: parseFloat(monthAgg?.total ?? "0"),
    activeProjects: parseInt(activeCount?.count ?? "0"),
    totalExpenses: parseInt(expenseCount?.count ?? "0"),
  });
});

// GET /dashboard/top-vendors
router.get("/dashboard/top-vendors", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const results = await db
    .select({
      vendor: sql<string>`COALESCE(${expensesTable.vendor}, 'Unknown')`,
      amount: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
      count: sql<string>`COUNT(*)`,
    })
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(eq(projectsTable.userId, userId))
    .groupBy(sql`COALESCE(${expensesTable.vendor}, 'Unknown')`)
    .orderBy(sql`SUM(${expensesTable.amount}) DESC`)
    .limit(8);

  res.json(results.map(r => ({
    vendor: r.vendor,
    amount: parseFloat(r.amount),
    count: parseInt(r.count),
  })));
});

// GET /dashboard/project-cards
router.get("/dashboard/project-cards", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const projects = await db.select().from(projectsTable)
    .where(eq(projectsTable.userId, userId))
    .orderBy(projectsTable.createdAt);

  const cards = await Promise.all(projects.map(async (p) => {
    const [agg] = await db
      .select({
        total: sql<string>`COALESCE(SUM(amount), 0)`,
        labor: sql<string>`COALESCE(SUM(CASE WHEN category IN ('Labour','Watchman Salary') THEN amount ELSE 0 END), 0)`,
        thisWeek: sql<string>`COALESCE(SUM(CASE WHEN date::timestamp >= NOW() - INTERVAL '7 days' THEN amount ELSE 0 END), 0)`,
      })
      .from(expensesTable)
      .where(eq(expensesTable.projectId, p.id));

    const cats = await db
      .select({
        category: expensesTable.category,
        amount: sql<string>`COALESCE(SUM(amount), 0)`,
      })
      .from(expensesTable)
      .where(eq(expensesTable.projectId, p.id))
      .groupBy(expensesTable.category)
      .orderBy(sql`SUM(amount) DESC`);

    const totalSpent = parseFloat(agg?.total ?? "0");
    const laborSpent = parseFloat(agg?.labor ?? "0");
    const thisWeekSpent = parseFloat(agg?.thisWeek ?? "0");
    const budget = parseFloat(p.budget);
    const laborBudget = parseFloat(p.laborBudget);
    const revenue = parseFloat(p.estimatedRevenue);
    const profitMargin = revenue > 0 ? ((revenue - totalSpent) / revenue) * 100 : 0;

    const startDateMs = new Date(p.startDate).getTime();
    const daysActive = Math.max(0, Math.floor((Date.now() - startDateMs) / (1000 * 60 * 60 * 24)));

    const totalAll = cats.reduce((s, c) => s + parseFloat(c.amount), 0);
    const categories = cats.map((c) => ({
      category: c.category,
      amount: parseFloat(c.amount),
      percent: totalAll > 0 ? (parseFloat(c.amount) / totalAll) * 100 : 0,
    }));

    return {
      id: p.id,
      name: p.name,
      location: p.location ?? null,
      status: p.status,
      budget,
      totalSpent,
      laborSpent,
      laborBudget,
      thisWeekSpent,
      profitMargin,
      daysActive,
      categories,
    };
  }));

  res.json(cards);
});

// GET /dashboard/recent-expenses
router.get("/dashboard/recent-expenses", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const results = await db
    .select({
      id: expensesTable.id,
      projectId: expensesTable.projectId,
      projectName: projectsTable.name,
      category: expensesTable.category,
      amount: expensesTable.amount,
      vendor: expensesTable.vendor,
      date: expensesTable.date,
      notes: expensesTable.notes,
      receiptUrl: expensesTable.receiptUrl,
      createdAt: expensesTable.createdAt,
    })
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(eq(projectsTable.userId, userId))
    .orderBy(desc(expensesTable.createdAt))
    .limit(5);

  res.json(results.map(r => ({ ...r, amount: parseFloat(r.amount) })));
});

export default router;
