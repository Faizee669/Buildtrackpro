import { Router, type IRouter } from "express";
import { db, projectsTable, expensesTable } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import crypto from "crypto";

const router: IRouter = Router();

const LABOR_CATEGORIES = ["Labour", "Watchman Salary"];

function projectFinancials(p: typeof projectsTable.$inferSelect, totalExpenses: number, laborSpent: number) {
  const budget = parseFloat(p.budget);
  const laborBudget = parseFloat(p.laborBudget);
  const materialBudget = parseFloat(p.materialBudget);
  const estimatedRevenue = parseFloat(p.estimatedRevenue);
  const materialSpent = Math.max(0, totalExpenses - laborSpent);
  const profit = estimatedRevenue - totalExpenses;
  const profitMargin = estimatedRevenue > 0 ? (profit / estimatedRevenue) * 100 : 0;
  return {
    ...p,
    budget,
    laborBudget,
    materialBudget,
    estimatedRevenue,
    totalExpenses,
    laborSpent,
    materialSpent,
    remainingBudget: budget - totalExpenses,
    profit,
    profitMargin,
  };
}

async function getProjectExpenseBreakdown(projectId: number) {
  const [agg] = await db
    .select({
      total: sql<string>`COALESCE(SUM(amount), 0)`,
      labor: sql<string>`COALESCE(SUM(CASE WHEN category IN ('Labour','Watchman Salary') THEN amount ELSE 0 END), 0)`,
    })
    .from(expensesTable)
    .where(eq(expensesTable.projectId, projectId));
  return {
    total: parseFloat(agg?.total ?? "0"),
    labor: parseFloat(agg?.labor ?? "0"),
  };
}

async function getProjectWithStats(id: number, userId?: string) {
  const conditions = userId
    ? and(eq(projectsTable.id, id), eq(projectsTable.userId, userId))
    : eq(projectsTable.id, id);
  const [project] = await db.select().from(projectsTable).where(conditions);
  if (!project) return null;
  const { total, labor } = await getProjectExpenseBreakdown(id);
  return projectFinancials(project, total, labor);
}

// GET /projects
router.get("/projects", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const projects = await db.select().from(projectsTable)
    .where(eq(projectsTable.userId, userId))
    .orderBy(projectsTable.createdAt);
  const withStats = await Promise.all(
    projects.map(async (p) => {
      const { total, labor } = await getProjectExpenseBreakdown(p.id);
      return projectFinancials(p, total, labor);
    })
  );
  res.json(withStats);
});

// POST /projects
router.post("/projects", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const userId = req.user!.id;
  const values: Record<string, unknown> = {
    ...parsed.data,
    userId,
    budget: String(parsed.data.budget),
  };
  if (parsed.data.laborBudget !== undefined) values.laborBudget = String(parsed.data.laborBudget);
  if (parsed.data.materialBudget !== undefined) values.materialBudget = String(parsed.data.materialBudget);
  if (parsed.data.estimatedRevenue !== undefined) values.estimatedRevenue = String(parsed.data.estimatedRevenue);
  if (parsed.data.location !== undefined) values.location = parsed.data.location;

  const [project] = await db.insert(projectsTable).values(values as any).returning();
  const result = await getProjectWithStats(project.id);
  res.status(201).json(result);
});

// GET /projects/:id
router.get("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProjectParams.safeParse({ id: raw });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const result = await getProjectWithStats(params.data.id, req.user!.id);
  if (!result) { res.status(404).json({ error: "Project not found" }); return; }
  res.json(result);
});

// PATCH /projects/:id
router.patch("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateProjectParams.safeParse({ id: raw });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.budget !== undefined) updates.budget = String(parsed.data.budget);
  if (parsed.data.laborBudget !== undefined) updates.laborBudget = String(parsed.data.laborBudget);
  if (parsed.data.materialBudget !== undefined) updates.materialBudget = String(parsed.data.materialBudget);
  if (parsed.data.estimatedRevenue !== undefined) updates.estimatedRevenue = String(parsed.data.estimatedRevenue);
  if (parsed.data.location !== undefined) updates.location = parsed.data.location;

  const [updated] = await db.update(projectsTable)
    .set(updates)
    .where(and(eq(projectsTable.id, params.data.id), eq(projectsTable.userId, req.user!.id)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Project not found" }); return; }

  const result = await getProjectWithStats(updated.id);
  res.json(result);
});

// DELETE /projects/:id
router.delete("/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteProjectParams.safeParse({ id: raw });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const [deleted] = await db.delete(projectsTable)
    .where(and(eq(projectsTable.id, params.data.id), eq(projectsTable.userId, req.user!.id)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Project not found" }); return; }
  res.sendStatus(204);
});

// POST /projects/:id/share — generate a share token
router.post("/projects/:id/share", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid project ID" }); return; }

  const [project] = await db.select().from(projectsTable)
    .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, req.user!.id)));
  if (!project) { res.status(404).json({ error: "Project not found" }); return; }

  const shareToken = project.shareToken ?? crypto.randomBytes(16).toString("hex");
  const [updated] = await db.update(projectsTable)
    .set({ shareToken })
    .where(eq(projectsTable.id, id))
    .returning();

  res.json({ shareToken: updated.shareToken });
});

// DELETE /projects/:id/share — revoke share token
router.delete("/projects/:id/share", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid project ID" }); return; }

  await db.update(projectsTable)
    .set({ shareToken: null })
    .where(and(eq(projectsTable.id, id), eq(projectsTable.userId, req.user!.id)));

  res.sendStatus(204);
});

export default router;
