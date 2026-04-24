import { Router, type IRouter } from "express";
import { db, projectsTable, expensesTable, phasesTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";

const router: IRouter = Router();

// GET /public/projects/:token — read-only public project report
router.get("/public/projects/:token", async (req, res): Promise<void> => {
  const token = req.params.token as string;
  if (!token || token.length < 8) { res.status(400).json({ error: "Invalid token" }); return; }

  const [project] = await db.select().from(projectsTable)
    .where(and(
      eq(projectsTable.shareToken, token),
    ));
  if (!project) { res.status(404).json({ error: "Project not found or link has been revoked" }); return; }

  const [agg] = await db
    .select({
      total: sql<string>`COALESCE(SUM(amount), 0)`,
      labor: sql<string>`COALESCE(SUM(CASE WHEN category IN ('Labour','Watchman Salary') THEN amount ELSE 0 END), 0)`,
    })
    .from(expensesTable)
    .where(eq(expensesTable.projectId, project.id));

  const phases = await db
    .select({
      id: phasesTable.id,
      name: phasesTable.name,
      status: phasesTable.status,
      totalExpenses: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
    })
    .from(phasesTable)
    .leftJoin(expensesTable, eq(expensesTable.phaseId, phasesTable.id))
    .where(eq(phasesTable.projectId, project.id))
    .groupBy(phasesTable.id);

  const catBreakdown = await db
    .select({
      category: expensesTable.category,
      amount: sql<string>`COALESCE(SUM(amount), 0)`,
    })
    .from(expensesTable)
    .where(eq(expensesTable.projectId, project.id))
    .groupBy(expensesTable.category)
    .orderBy(sql`SUM(amount) DESC`);

  const recentExpenses = await db
    .select({
      id: expensesTable.id,
      category: expensesTable.category,
      amount: expensesTable.amount,
      date: expensesTable.date,
      vendor: expensesTable.vendor,
      notes: expensesTable.notes,
    })
    .from(expensesTable)
    .where(eq(expensesTable.projectId, project.id))
    .orderBy(sql`${expensesTable.date} DESC`)
    .limit(10);

  const totalSpent = parseFloat(agg?.total ?? "0");
  const laborSpent = parseFloat(agg?.labor ?? "0");
  const budget = parseFloat(project.budget);

  res.json({
    project: {
      id: project.id,
      name: project.name,
      description: project.description,
      location: project.location,
      status: project.status,
      startDate: project.startDate,
      budget,
      totalSpent,
      laborSpent,
      materialSpent: Math.max(0, totalSpent - laborSpent),
      remainingBudget: budget - totalSpent,
      profitMargin: parseFloat(project.estimatedRevenue) > 0
        ? ((parseFloat(project.estimatedRevenue) - totalSpent) / parseFloat(project.estimatedRevenue)) * 100
        : 0,
    },
    phases: phases.map(p => ({ ...p, totalExpenses: parseFloat(p.totalExpenses) })),
    categoryBreakdown: catBreakdown.map(c => ({ category: c.category, amount: parseFloat(c.amount) })),
    recentExpenses: recentExpenses.map(e => ({ ...e, amount: parseFloat(e.amount) })),
  });
});

export default router;
