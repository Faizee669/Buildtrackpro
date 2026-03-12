import { Router, type IRouter } from "express";
import { db, projectsTable, expensesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import {
  CreateProjectBody,
  UpdateProjectBody,
  GetProjectParams,
  UpdateProjectParams,
  DeleteProjectParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

// Helper: fetch project with computed fields
async function getProjectWithStats(id: number) {
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, id));

  if (!project) return null;

  const [agg] = await db
    .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
    .from(expensesTable)
    .where(eq(expensesTable.projectId, id));

  const totalExpenses = parseFloat(agg?.total ?? "0");
  const budget = parseFloat(project.budget);
  const remainingBudget = budget - totalExpenses;

  return {
    ...project,
    budget,
    totalExpenses,
    remainingBudget,
  };
}

// GET /projects
router.get("/projects", async (_req, res): Promise<void> => {
  const projects = await db.select().from(projectsTable).orderBy(projectsTable.createdAt);

  const withStats = await Promise.all(
    projects.map(async (p) => {
      const [agg] = await db
        .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
        .from(expensesTable)
        .where(eq(expensesTable.projectId, p.id));

      const totalExpenses = parseFloat(agg?.total ?? "0");
      const budget = parseFloat(p.budget);
      return {
        ...p,
        budget,
        totalExpenses,
        remainingBudget: budget - totalExpenses,
      };
    })
  );

  res.json(withStats);
});

// POST /projects
router.post("/projects", async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .insert(projectsTable)
    .values({
      ...parsed.data,
      budget: String(parsed.data.budget),
    })
    .returning();

  const result = await getProjectWithStats(project.id);
  res.status(201).json(result);
});

// GET /projects/:id
router.get("/projects/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetProjectParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const result = await getProjectWithStats(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.json(result);
});

// PATCH /projects/:id
router.patch("/projects/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateProjectParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.budget !== undefined) {
    updates.budget = String(parsed.data.budget);
  }

  const [updated] = await db
    .update(projectsTable)
    .set(updates)
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  const result = await getProjectWithStats(updated.id);
  res.json(result);
});

// DELETE /projects/:id
router.delete("/projects/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteProjectParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(projectsTable)
    .where(eq(projectsTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Project not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
