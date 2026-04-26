import { Router, type IRouter } from "express";
import { db, auditLogsTable } from "@workspace/db";
import { desc, eq } from "drizzle-orm";
import { requireAuth } from "../middlewares/requireAuth";

const router: IRouter = Router();

router.get("/audit-logs", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const limitRaw = Array.isArray(req.query.limit) ? req.query.limit[0] : req.query.limit;
  const parsedLimit = limitRaw ? Number(limitRaw) : 100;
  const limit = Number.isFinite(parsedLimit) ? Math.max(1, Math.min(500, parsedLimit)) : 100;

  const rows = await db
    .select()
    .from(auditLogsTable)
    .where(eq(auditLogsTable.userId, userId))
    .orderBy(desc(auditLogsTable.createdAt))
    .limit(limit);

  res.json(rows);
});

export default router;
