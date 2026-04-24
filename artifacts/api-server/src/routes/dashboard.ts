import { Router, type IRouter } from "express";
import { db, expensesTable, projectsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

// GET /dashboard/stats
router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  const [budgetAgg] = await db
    .select({
      budget: sql<string>`COALESCE(SUM(budget), 0)`,
      revenue: sql<string>`COALESCE(SUM(estimated_revenue), 0)`,
    })
    .from(projectsTable);

  const [spentAgg] = await db
    .select({
      total: sql<string>`COALESCE(SUM(amount), 0)`,
      labor: sql<string>`COALESCE(SUM(CASE WHEN category IN ('Labour','Watchman Salary') THEN amount ELSE 0 END), 0)`,
    })
    .from(expensesTable);

  const [monthAgg] = await db
    .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(expensesTable)
    .where(sql`DATE_TRUNC('month', date::timestamp) = DATE_TRUNC('month', CURRENT_DATE)`);

  const [activeCount] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(projectsTable)
    .where(eq(projectsTable.status, "active"));

  const [expenseCount] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(expensesTable);

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

// GET /dashboard/profit-by-project
router.get("/dashboard/profit-by-project", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      projectId: projectsTable.id,
      projectName: projectsTable.name,
      revenue: projectsTable.estimatedRevenue,
      spent: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
    })
    .from(projectsTable)
    .leftJoin(expensesTable, eq(expensesTable.projectId, projectsTable.id))
    .groupBy(projectsTable.id, projectsTable.name, projectsTable.estimatedRevenue)
    .orderBy(sql`COALESCE(SUM(${expensesTable.amount}), 0) DESC`);

  res.json(results.map(r => {
    const revenue = parseFloat(r.revenue);
    const spent = parseFloat(r.spent);
    const profit = revenue - spent;
    return {
      projectId: r.projectId,
      projectName: r.projectName,
      revenue,
      spent,
      profit,
      profitMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
    };
  }));
});

// GET /dashboard/labor-vs-material
router.get("/dashboard/labor-vs-material", async (_req, res): Promise<void> => {
  const [agg] = await db
    .select({
      labor: sql<string>`COALESCE(SUM(CASE WHEN category IN ('Labour','Watchman Salary') THEN amount ELSE 0 END), 0)`,
      material: sql<string>`COALESCE(SUM(CASE WHEN category NOT IN ('Labour','Watchman Salary') THEN amount ELSE 0 END), 0)`,
    })
    .from(expensesTable);
  res.json({
    labor: parseFloat(agg?.labor ?? "0"),
    material: parseFloat(agg?.material ?? "0"),
  });
});

// GET /dashboard/top-workers
router.get("/dashboard/top-workers", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      crew: sql<string>`COALESCE(${expensesTable.crew}, 'Unassigned')`,
      amount: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
      count: sql<string>`COUNT(*)`,
    })
    .from(expensesTable)
    .where(sql`${expensesTable.crew} IS NOT NULL AND ${expensesTable.crew} <> ''`)
    .groupBy(sql`COALESCE(${expensesTable.crew}, 'Unassigned')`)
    .orderBy(sql`SUM(${expensesTable.amount}) DESC`)
    .limit(8);
  res.json(results.map(r => ({
    crew: r.crew,
    amount: parseFloat(r.amount),
    count: parseInt(r.count),
  })));
});

// GET /dashboard/spending-by-category
router.get("/dashboard/spending-by-category", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      category: expensesTable.category,
      amount: sql<string>`COALESCE(SUM(amount), 0)`,
    })
    .from(expensesTable)
    .groupBy(expensesTable.category)
    .orderBy(sql`SUM(amount) DESC`);

  res.json(results.map(r => ({ category: r.category, amount: parseFloat(r.amount) })));
});

// GET /dashboard/spending-by-project
router.get("/dashboard/spending-by-project", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      projectId: projectsTable.id,
      projectName: projectsTable.name,
      budget: projectsTable.budget,
      amount: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
    })
    .from(projectsTable)
    .leftJoin(expensesTable, eq(expensesTable.projectId, projectsTable.id))
    .groupBy(projectsTable.id, projectsTable.name, projectsTable.budget)
    .orderBy(sql`COALESCE(SUM(${expensesTable.amount}), 0) DESC`);

  res.json(
    results.map(r => ({
      projectId: r.projectId,
      projectName: r.projectName,
      budget: parseFloat(r.budget),
      amount: parseFloat(r.amount),
    }))
  );
});

// GET /dashboard/spending-trend
router.get("/dashboard/spending-trend", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      month: sql<string>`TO_CHAR(DATE_TRUNC('month', date::timestamp), 'YYYY-MM')`,
      amount: sql<string>`COALESCE(SUM(amount), 0)`,
    })
    .from(expensesTable)
    .where(sql`date::timestamp >= NOW() - INTERVAL '12 months'`)
    .groupBy(sql`DATE_TRUNC('month', date::timestamp)`)
    .orderBy(sql`DATE_TRUNC('month', date::timestamp) ASC`);

  res.json(results.map(r => ({ month: r.month, amount: parseFloat(r.amount) })));
});

// GET /dashboard/top-vendors
router.get("/dashboard/top-vendors", async (_req, res): Promise<void> => {
  const results = await db
    .select({
      vendor: sql<string>`COALESCE(${expensesTable.vendor}, 'Unknown')`,
      amount: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
      count: sql<string>`COUNT(*)`,
    })
    .from(expensesTable)
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
router.get("/dashboard/project-cards", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);

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
    const daysActive = Math.max(
      0,
      Math.floor((Date.now() - startDateMs) / (1000 * 60 * 60 * 24)),
    );

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
router.get("/dashboard/recent-expenses", async (_req, res): Promise<void> => {
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
    .orderBy(desc(expensesTable.createdAt))
    .limit(5);

  res.json(results.map(r => ({ ...r, amount: parseFloat(r.amount) })));
});

export default router;
