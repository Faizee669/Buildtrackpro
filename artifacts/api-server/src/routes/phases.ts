import { Router, type IRouter } from "express";
import { db, phasesTable, expensesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { CreatePhaseBody, UpdatePhaseBody } from "@workspace/api-zod";

const router: IRouter = Router();

// GET /projects/:projectId/phases
router.get("/projects/:projectId/phases", async (req, res): Promise<void> => {
  const projectId = parseInt(req.params.projectId as string);
  if (isNaN(projectId)) { res.status(400).json({ error: "Invalid project ID" }); return; }

  const phases = await db
    .select({
      id: phasesTable.id,
      projectId: phasesTable.projectId,
      name: phasesTable.name,
      description: phasesTable.description,
      status: phasesTable.status,
      createdAt: phasesTable.createdAt,
      totalExpenses: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)`,
      expenseCount: sql<string>`COUNT(${expensesTable.id})`,
    })
    .from(phasesTable)
    .leftJoin(expensesTable, eq(expensesTable.phaseId, phasesTable.id))
    .where(eq(phasesTable.projectId, projectId))
    .groupBy(phasesTable.id)
    .orderBy(phasesTable.createdAt);

  res.json(phases.map(p => ({
    ...p,
    totalExpenses: parseFloat(p.totalExpenses),
    expenseCount: parseInt(p.expenseCount),
  })));
});

// POST /projects/:projectId/phases
router.post("/projects/:projectId/phases", async (req, res): Promise<void> => {
  const projectId = parseInt(req.params.projectId as string);
  if (isNaN(projectId)) { res.status(400).json({ error: "Invalid project ID" }); return; }

  const parsed = CreatePhaseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [phase] = await db.insert(phasesTable).values({ projectId, ...parsed.data }).returning();
  res.status(201).json({ ...phase, totalExpenses: 0, expenseCount: 0 });
});

// PATCH /phases/:id
router.patch("/phases/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid phase ID" }); return; }

  const parsed = UpdatePhaseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [updated] = await db.update(phasesTable).set(parsed.data).where(eq(phasesTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Phase not found" }); return; }

  res.json(updated);
});

// DELETE /phases/:id
router.delete("/phases/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid phase ID" }); return; }

  const [deleted] = await db.delete(phasesTable).where(eq(phasesTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Phase not found" }); return; }

  res.sendStatus(204);
});

export default router;
