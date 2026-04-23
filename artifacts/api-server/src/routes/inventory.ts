import { Router, type IRouter } from "express";
import { db, inventoryTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { CreateInventoryItemBody, UpdateInventoryItemBody } from "@workspace/api-zod";

const router: IRouter = Router();

// GET /inventory?projectId=
router.get("/inventory", async (req, res): Promise<void> => {
  const projectIdRaw = req.query.projectId;
  const projectId = projectIdRaw ? parseInt(projectIdRaw as string) : undefined;

  const rows = await db.select().from(inventoryTable).orderBy(inventoryTable.name);
  const filtered = projectId ? rows.filter(r => r.projectId === projectId) : rows;

  res.json(filtered.map(r => ({
    ...r,
    quantity: parseFloat(r.quantity),
    costPerUnit: parseFloat(r.costPerUnit),
    reorderLevel: parseFloat(r.reorderLevel),
    totalValue: parseFloat(r.quantity) * parseFloat(r.costPerUnit),
    isLow: parseFloat(r.quantity) <= parseFloat(r.reorderLevel),
  })));
});

// POST /inventory
router.post("/inventory", async (req, res): Promise<void> => {
  const parsed = CreateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const [created] = await db.insert(inventoryTable).values({
    ...parsed.data,
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
router.patch("/inventory/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid inventory ID" }); return; }

  const parsed = UpdateInventoryItemBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.quantity !== undefined) updates.quantity = String(parsed.data.quantity);
  if (parsed.data.costPerUnit !== undefined) updates.costPerUnit = String(parsed.data.costPerUnit);
  if (parsed.data.reorderLevel !== undefined) updates.reorderLevel = String(parsed.data.reorderLevel);

  const [updated] = await db.update(inventoryTable).set(updates).where(eq(inventoryTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Inventory item not found" }); return; }

  const q = parseFloat(updated.quantity);
  const c = parseFloat(updated.costPerUnit);
  const r = parseFloat(updated.reorderLevel);
  res.json({ ...updated, quantity: q, costPerUnit: c, reorderLevel: r, totalValue: q * c, isLow: q <= r });
});

// DELETE /inventory/:id
router.delete("/inventory/:id", async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid inventory ID" }); return; }

  const [deleted] = await db.delete(inventoryTable).where(eq(inventoryTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Inventory item not found" }); return; }

  res.sendStatus(204);
});

export default router;
