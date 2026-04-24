import { Router, type IRouter } from "express";
import { db, inventoryTable, insertInventorySchema } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const CreateInventoryItemBody = insertInventorySchema;
const UpdateInventoryItemBody = insertInventorySchema.partial();

const router: IRouter = Router();

// GET /inventory?projectId=
router.get("/inventory", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const projectIdRaw = req.query.projectId;
  const projectId = projectIdRaw ? parseInt(projectIdRaw as string) : undefined;

  const where = projectId
    ? and(eq(inventoryTable.userId, userId), eq(inventoryTable.projectId, projectId))
    : eq(inventoryTable.userId, userId);

  const rows = await db.select().from(inventoryTable).where(where).orderBy(inventoryTable.name);

  res.json(rows.map(r => ({
    ...r,
    quantity: parseFloat(r.quantity),
    costPerUnit: parseFloat(r.costPerUnit),
    reorderLevel: parseFloat(r.reorderLevel),
    totalValue: parseFloat(r.quantity) * parseFloat(r.costPerUnit),
    isLow: parseFloat(r.quantity) <= parseFloat(r.reorderLevel),
  })));
});

// POST /inventory
router.post("/inventory", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [created] = await db.insert(inventoryTable).values({
    ...parsed.data,
    userId: req.user!.id,
    quantity: String(parsed.data.quantity ?? 0),
    costPerUnit: String(parsed.data.costPerUnit ?? 0),
    reorderLevel: String(parsed.data.reorderLevel ?? 0),
  }).returning();

  const q = parseFloat(created.quantity);
  const c = parseFloat(created.costPerUnit);
  const r = parseFloat(created.reorderLevel);
  res.status(201).json({
    ...created,
    quantity: q, costPerUnit: c, reorderLevel: r,
    totalValue: q * c, isLow: q <= r,
  });
});

// PATCH /inventory/:id
router.patch("/inventory/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid inventory ID" }); return; }

  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.quantity !== undefined) updates.quantity = String(parsed.data.quantity);
  if (parsed.data.costPerUnit !== undefined) updates.costPerUnit = String(parsed.data.costPerUnit);
  if (parsed.data.reorderLevel !== undefined) updates.reorderLevel = String(parsed.data.reorderLevel);

  const [updated] = await db.update(inventoryTable)
    .set(updates)
    .where(and(eq(inventoryTable.id, id), eq(inventoryTable.userId, req.user!.id)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Inventory item not found" }); return; }

  const q = parseFloat(updated.quantity);
  const c = parseFloat(updated.costPerUnit);
  const r = parseFloat(updated.reorderLevel);
  res.json({ ...updated, quantity: q, costPerUnit: c, reorderLevel: r, totalValue: q * c, isLow: q <= r });
});

// DELETE /inventory/:id
router.delete("/inventory/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid inventory ID" }); return; }

  const [deleted] = await db.delete(inventoryTable)
    .where(and(eq(inventoryTable.id, id), eq(inventoryTable.userId, req.user!.id)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Inventory item not found" }); return; }

  res.sendStatus(204);
});

export default router;
