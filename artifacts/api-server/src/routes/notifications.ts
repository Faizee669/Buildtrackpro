import { Router, type IRouter } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

// GET /notifications
router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const rows = await db.select().from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);
  res.json(rows);
});

// PATCH /notifications/:id/read
router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [updated] = await db.update(notificationsTable)
    .set({ read: true })
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.user!.id)))
    .returning();
  if (!updated) { res.status(404).json({ error: "Notification not found" }); return; }
  res.json(updated);
});

// POST /notifications/read-all
router.post("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  await db.update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, req.user!.id));
  res.sendStatus(204);
});

// DELETE /notifications/:id
router.delete("/notifications/:id", requireAuth, async (req, res): Promise<void> => {
  const id = parseInt(req.params.id as string);
  if (isNaN(id)) { res.status(400).json({ error: "Invalid ID" }); return; }

  const [deleted] = await db.delete(notificationsTable)
    .where(and(eq(notificationsTable.id, id), eq(notificationsTable.userId, req.user!.id)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Notification not found" }); return; }
  res.sendStatus(204);
});

export default router;
