import { Router, type IRouter } from "express";
import { db, crewTable, expensesTable, projectsTable, insertCrewSchema } from "@workspace/db";
import { eq, sql, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logAuditEvent } from "../lib/audit";

import { z } from "zod/v4";

const CreateCrewBody = insertCrewSchema.extend({
  rate: z.coerce.string().optional(),
});
const UpdateCrewBody = insertCrewSchema.partial().extend({
  rate: z.coerce.string().optional(),
});

const router: IRouter = Router();

async function projectBelongsToUser(projectId: number | null | undefined, userId: string) {
  if (projectId == null) return true;
  const [project] = await db
    .select({ id: projectsTable.id })
    .from(projectsTable)
    .where(and(eq(projectsTable.id, projectId), eq(projectsTable.userId, userId)))
    .limit(1);

  return Boolean(project);
}

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
      rate: crewTable.rate,
      rateType: crewTable.rateType,
      phone: crewTable.phone,
      projectId: crewTable.projectId,
      status: crewTable.status,
      createdAt: crewTable.createdAt,
      laborCost: sql<string>`COALESCE(SUM(CASE WHEN ${projectsTable.userId} = ${userId} AND (${crewTable.projectId} IS NULL OR ${expensesTable.projectId} = ${crewTable.projectId}) THEN ${expensesTable.amount} ELSE 0 END), 0)`,
    })
    .from(crewTable)
    .leftJoin(expensesTable, sql`LOWER(${expensesTable.crew}) = LOWER(${crewTable.name})`)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(baseWhere)
    .groupBy(crewTable.id)
    .orderBy(crewTable.name);

  res.json(rows.map(r => ({
    ...r,
    rate: parseFloat(r.rate),
    laborCost: parseFloat(r.laborCost),
  })));
});

// POST /crew
router.post("/crew", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateCrewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  try {
    if (!(await projectBelongsToUser(parsed.data.projectId, req.user!.id))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const [created] = await db.insert(crewTable).values({
      ...parsed.data,
      userId: req.user!.id,
      rate: String(parsed.data.rate ?? 0),
      rateType: parsed.data.rateType ?? "daily",
    }).returning();
    await logAuditEvent({
      userId: req.user!.id,
      action: "created",
      entityType: "crew",
      entityId: created.id,
      summary: `Added crew member "${created.name}"`,
      metadata: { crewId: created.id, role: created.role, projectId: created.projectId },
    });

    res.status(201).json({
      ...created,
      rate: parseFloat(created.rate),
      laborCost: 0,
    });
  } catch (err: any) {
    console.error("POST /crew error:", err.message);
    res.status(500).json({ error: err.message ?? "Database error" });
  }
});

// PATCH /crew/:id
router.patch("/crew/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid crew ID" }); return; }

  const parsed = UpdateCrewBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  try {
    const updates: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.rate !== undefined) updates.rate = String(parsed.data.rate);
    if (parsed.data.rateType !== undefined) updates.rateType = parsed.data.rateType;
    if (!(await projectBelongsToUser(parsed.data.projectId, req.user!.id))) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    const [updated] = await db.update(crewTable)
      .set(updates)
      .where(and(eq(crewTable.id, id), eq(crewTable.userId, req.user!.id)))
      .returning();
    if (!updated) { res.status(404).json({ error: "Crew member not found" }); return; }
    await logAuditEvent({
      userId: req.user!.id,
      action: "updated",
      entityType: "crew",
      entityId: updated.id,
      summary: `Updated crew member "${updated.name}"`,
      metadata: { crewId: updated.id, changes: Object.keys(updates) },
    });

    const [labor] = await db
      .select({ laborCost: sql<string>`COALESCE(SUM(${expensesTable.amount}), 0)` })
      .from(expensesTable)
      .innerJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
      .where(and(
        eq(projectsTable.userId, req.user!.id),
        sql`LOWER(${expensesTable.crew}) = LOWER(${updated.name})`,
        updated.projectId == null ? sql`TRUE` : eq(expensesTable.projectId, updated.projectId),
      ));

    res.json({
      ...updated,
      rate: parseFloat(updated.rate),
      laborCost: parseFloat(labor?.laborCost ?? "0"),
    });
  } catch (err: any) {
    console.error("PATCH /crew error:", err.message);
    res.status(500).json({ error: err.message ?? "Database error" });
  }
});

// DELETE /crew/:id
router.delete("/crew/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid crew ID" }); return; }

  const [deleted] = await db.delete(crewTable)
    .where(and(eq(crewTable.id, id), eq(crewTable.userId, req.user!.id)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Crew member not found" }); return; }
  await logAuditEvent({
    userId: req.user!.id,
    action: "deleted",
    entityType: "crew",
    entityId: deleted.id,
    summary: `Deleted crew member "${deleted.name}"`,
    metadata: { crewId: deleted.id },
  });

  res.sendStatus(204);
});

export default router;
