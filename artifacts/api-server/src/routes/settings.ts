import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";
import { logAuditEvent } from "../lib/audit";

const router: IRouter = Router();

// GET /settings/profile
router.get("/settings/profile", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }
  res.json(user);
});

// PATCH /settings/profile
router.patch("/settings/profile", requireAuth, async (req, res): Promise<void> => {
  const { firstName, lastName, companyName, notificationsEmail, notificationsOverbudget } = req.body as Record<string, unknown>;
  const updates: Record<string, unknown> = {};
  if (typeof firstName === "string") updates.firstName = firstName;
  if (typeof lastName === "string") updates.lastName = lastName;
  if (typeof companyName === "string") updates.companyName = companyName;
  if (typeof notificationsEmail === "boolean") updates.notificationsEmail = notificationsEmail;
  if (typeof notificationsOverbudget === "boolean") updates.notificationsOverbudget = notificationsOverbudget;

  const [updated] = await db.update(usersTable)
    .set(updates)
    .where(eq(usersTable.id, req.user!.id))
    .returning();

  if (!updated) { res.status(404).json({ error: "User not found" }); return; }
  await logAuditEvent({
    userId: req.user!.id,
    action: "updated",
    entityType: "settings",
    entityId: req.user!.id,
    summary: "Updated profile settings",
    metadata: { changedFields: Object.keys(updates) },
  });
  res.json(updated);
});

export default router;
