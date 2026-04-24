import { Router, type IRouter } from "express";
import { db, crewTable, expensesTable, insertCrewSchema } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const CreateCrewBody = insertCrewSchema;
const UpdateCrewBody = insertCrewSchema.partial();

const router: IRouter = Router();

// GET /crew?projectId=
router.get("/crew", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const projectIdRaw = req.query.projectId;
  const projectId = projectIdRaw ? parseInt(projectIdRaw as string) : undefined;

  const baseWhere = projectId
    ? and(eq(crewTable.userId, userId), eq(crewTable.projectId, projectId))
    : eq(crewTable.userId, userId);

  const rows = await db
    .select({
      id: crewTable.id,
      userId: crewTable.userId,
      name: crewTable.name,
      role: crewTable.role,
      dailyRate: crewTable.dailyRate,
      phone: crewTable.phone,
      projectId: crewTable.projectId,
      status: crewTable.status,
      createdAt: crewTable.createdAt,
      laborCost: sql<string>`COALESCE(SUM(CASE WHEN LOWER(${expensesTable.crew}) = LOWER(${crewTable.name}) THEN ${expensesTable.amount} ELSE 0 END), 0)`,
    })
    .from(crewTable)
    .leftJoin(expensesTable, sql`LOWER(${expensesTable.crew}) = LOWER(${crewTable.name})`)
    .where(baseWhere)
    .groupBy(crewTable.id)
    .orderBy(crewTable.name);

  res.json(rows.map(r => ({
    ...r,
    dailyRate: parseFloat(r.dailyRate),
    laborCost: parseFloat(r.laborCost),
  })));
});

// POST /crew
router.post("/crew", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCrewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [created] = await db.insert(crewTable).values({
    ...parsed.data,
    userId: req.user!.id,
    dailyRate: String(parsed.data.dailyRate ?? 0),
  }).returning();

  res.status(201).json({
    ...created,
    dailyRate: parseFloat(created.dailyRate),
    laborCost: 0,
  });
});

// PATCH /crew/:id
router.patch("/crew/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid crew ID" }); return; }

  const parsed = UpdateCrewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.dailyRate !== undefined) updates.dailyRate = String(parsed.data.dailyRate);

  const [updated] = await db.update(crewTable)
    .set(updates)
    .where(and(eq(crewTable.id, id), eq(crewTable.userId, req.user!.id)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Crew member not found" }); return; }

  const [labor] = await db
    .select({ laborCost: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)` })
    .from(expensesTable)
    .where(sql`LOWER(${expensesTable.crew}) = LOWER(${updated.name})`);

  res.json({
    ...updated,
    dailyRate: parseFloat(updated.dailyRate),
    laborCost: parseFloat(labor?.laborCost ?? "0"),
  });
});

// DELETE /crew/:id
router.delete("/crew/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid crew ID" }); return; }

  const [deleted] = await db.delete(crewTable)
    .where(and(eq(crewTable.id, id), eq(crewTable.userId, req.user!.id)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Crew member not found" }); return; }

  res.sendStatus(204);
});

export default router;
