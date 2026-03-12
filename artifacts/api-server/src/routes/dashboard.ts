import { Router, type IRouter } from "express";
import { db, expensesTable, projectsTable } from "@workspace/db";
import { eq, sql, desc } from "drizzle-orm";

const router: IRouter = Router();

// GET /dashboard/stats
router.get("/dashboard/stats", async (_req, res): Promise<void> => {
  // Total budget from all active projects
  const [budgetAgg] = await db
    .select({ total: sql<string>`COALESCE(SUM(budget), 0)` })
    .from(projectsTable);

  // Total spent overall
  const [spentAgg] = await db
    .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(expensesTable);

  // Spent this month
  const [monthAgg] = await db
    .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(expensesTable)
    .where(
      sql`DATE_TRUNC('month', date::timestamp) = DATE_TRUNC('month', CURRENT_DATE)`
    );

  // Active project count
  const [activeCount] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(projectsTable)
    .where(eq(projectsTable.status, "active"));

  // Total expense count
  const [expenseCount] = await db
    .select({ count: sql<string>`COUNT(*)` })
    .from(expensesTable);

  const totalBudget = parseFloat(budgetAgg?.total ?? "0");
  const totalSpent = parseFloat(spentAgg?.total ?? "0");

  res.json({
    totalBudget,
    totalSpent,
    remainingBudget: totalBudget - totalSpent,
    spentThisMonth: parseFloat(monthAgg?.total ?? "0"),
    activeProjects: parseInt(activeCount?.count ?? "0"),
    totalExpenses: parseInt(expenseCount?.count ?? "0"),
  });
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
