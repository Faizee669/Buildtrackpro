import { Router, type IRouter } from "express";
import { db, expensesTable, projectsTable, phasesTable, notificationsTable } from "@workspace/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import path from "path";
import fs from "fs";
import multer from "multer";
import {
  CreateExpenseBody,
  UpdateExpenseBody,
  GetExpenseParams,
  UpdateExpenseParams,
  DeleteExpenseParams,
  ListExpensesQueryParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { logAuditEvent } from "../lib/audit";

const router: IRouter = Router();

const uploadDir = path.join(process.cwd(), "uploads", "receipts");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `receipt-${Date.now()}${ext}`);
  },
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

const EXPENSE_SELECT = {
  id: expensesTable.id,
  projectId: expensesTable.projectId,
  projectName: projectsTable.name,
  phaseId: expensesTable.phaseId,
  phaseName: phasesTable.name,
  category: expensesTable.category,
  amount: expensesTable.amount,
  vendor: expensesTable.vendor,
  crew: expensesTable.crew,
  equipment: expensesTable.equipment,
  date: expensesTable.date,
  notes: expensesTable.notes,
  receiptUrl: expensesTable.receiptUrl,
  createdAt: expensesTable.createdAt,
} as const;

async function getExpenseWithProject(id: number, userId?: string) {
  const conditions: any[] = [eq(expensesTable.id, id)];
  if (userId) conditions.push(eq(projectsTable.userId, userId));

  const result = await db
    .select(EXPENSE_SELECT)
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .leftJoin(phasesTable, eq(expensesTable.phaseId, phasesTable.id))
    .where(and(...conditions))
    .limit(1);

  if (!result[0]) return null;
  return { ...result[0], amount: parseFloat(result[0].amount) };
}

async function getOwnedExpense(id: number, userId: string) {
  const [expense] = await db
    .select({
      id: expensesTable.id,
      projectId: expensesTable.projectId,
    })
    .from(expensesTable)
    .innerJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(and(eq(expensesTable.id, id), eq(projectsTable.userId, userId)))
    .limit(1);

  return expense ?? null;
}

async function phaseBelongsToProject(phaseId: number, projectId: number) {
  const [phase] = await db
    .select({ id: phasesTable.id })
    .from(phasesTable)
    .where(and(eq(phasesTable.id, phaseId), eq(phasesTable.projectId, projectId)))
    .limit(1);

  return Boolean(phase);
}

// GET /expenses
router.get("/expenses", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const parsed = ListExpensesQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { projectId, category, startDate, endDate } = parsed.data;
  const phaseId = req.query.phaseId ? parseInt(req.query.phaseId as string) : null;

  const conditions: any[] = [eq(projectsTable.userId, userId)];
  if (projectId != null) conditions.push(eq(expensesTable.projectId, projectId));
  if (phaseId != null) conditions.push(eq(expensesTable.phaseId, phaseId));
  if (category != null) conditions.push(eq(expensesTable.category, category));
  if (startDate != null) conditions.push(gte(expensesTable.date, startDate));
  if (endDate != null) conditions.push(lte(expensesTable.date, endDate));

  const results = await db
    .select(EXPENSE_SELECT)
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .leftJoin(phasesTable, eq(expensesTable.phaseId, phasesTable.id))
    .where(and(...conditions))
    .orderBy(expensesTable.date);

  res.json(results.map(r => ({ ...r, amount: parseFloat(r.amount) })));
});

// POST /expenses
router.post("/expenses", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const userId = req.user!.id;

  try {

  // Verify project belongs to user
  const [project] = await db.select().from(projectsTable)
    .where(and(eq(projectsTable.id, parsed.data.projectId), eq(projectsTable.userId, userId)));
  if (!project) { res.status(403).json({ error: "Project not found" }); return; }

  // crew, phaseId, equipment are NOT in the generated Zod schema — read directly from body
  const crew = typeof req.body.crew === "string" && req.body.crew.trim() ? req.body.crew.trim() : null;
  const equipment = typeof req.body.equipment === "string" && req.body.equipment.trim() ? req.body.equipment.trim() : null;
  const phaseId = req.body.phaseId ? parseInt(String(req.body.phaseId)) : null;
  if (phaseId != null) {
    if (isNaN(phaseId)) { res.status(400).json({ error: "Invalid phase ID" }); return; }
    if (!(await phaseBelongsToProject(phaseId, project.id))) {
      res.status(400).json({ error: "Phase does not belong to this project" });
      return;
    }
  }

  const [expense] = await db
    .insert(expensesTable)
    .values({
      ...parsed.data,
      amount: String(parsed.data.amount),
      crew,
      equipment,
      ...(phaseId && !isNaN(phaseId) ? { phaseId } : {}),
    })
    .returning();
  await logAuditEvent({
    userId,
    action: "created",
    entityType: "expense",
    entityId: expense.id,
    summary: `Logged expense "${expense.category}" for ${expense.amount}`,
    metadata: { expenseId: expense.id, projectId: expense.projectId, amount: expense.amount },
  });

  // Check if project is now over budget and create a notification
  const budget = parseFloat(project.budget);
  if (budget > 0) {
    const [agg] = await db
      .select({ total: sql<string>`COALESCE(SUM(amount), 0)` })
      .from(expensesTable)
      .where(eq(expensesTable.projectId, project.id));
    const totalNow = parseFloat(agg?.total ?? "0");
    if (totalNow > budget) {
      await db.insert(notificationsTable).values({
        userId,
        type: "over_budget",
        title: `${project.name} is over budget`,
        message: `Spent ${totalNow.toLocaleString("en-IN")} of ${budget.toLocaleString("en-IN")} budget.`,
        projectId: project.id,
      });
    }
  }

  const result = await getExpenseWithProject(expense.id, userId);
  res.status(201).json(result);
  } catch (err: any) {
    console.error("POST /expenses error:", err);
    res.status(500).json({ error: err.message || "Database error" });
  }
});

// POST /expenses/upload-receipt
router.post("/expenses/upload-receipt", requireAuth, upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) { res.status(400).json({ error: "No file uploaded" }); return; }
  const url = `/api/expenses/receipts/${req.file.filename}`;
  res.json({ url });
});

// Serve uploaded receipts
router.get("/expenses/receipts/:filename", requireAuth, async (req, res): Promise<void> => {
  const rawFilename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filename = path.basename(rawFilename);
  if (filename !== rawFilename) { res.status(404).json({ error: "File not found" }); return; }
  const receiptUrl = `/api/expenses/receipts/${filename}`;
  const [receipt] = await db
    .select({ id: expensesTable.id })
    .from(expensesTable)
    .innerJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(and(eq(expensesTable.receiptUrl, receiptUrl), eq(projectsTable.userId, req.user!.id)))
    .limit(1);
  if (!receipt) { res.status(404).json({ error: "File not found" }); return; }

  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) { res.status(404).json({ error: "File not found" }); return; }
  res.sendFile(filePath);
});

// GET /expenses/export
router.get("/expenses/export", requireAuth, async (req, res): Promise<void> => {
  const userId = req.user!.id;
  const parsed = ListExpensesQueryParams.safeParse(req.query);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const { projectId, category, startDate, endDate } = parsed.data;
  const conditions: any[] = [eq(projectsTable.userId, userId)];
  if (projectId != null) conditions.push(eq(expensesTable.projectId, projectId));
  if (category != null) conditions.push(eq(expensesTable.category, category));
  if (startDate != null) conditions.push(gte(expensesTable.date, startDate));
  if (endDate != null) conditions.push(lte(expensesTable.date, endDate));

  const results = await db
    .select(EXPENSE_SELECT)
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .leftJoin(phasesTable, eq(expensesTable.phaseId, phasesTable.id))
    .where(and(...conditions))
    .orderBy(expensesTable.date);

  const headers = ["ID", "Date", "Project", "Phase", "Category", "Amount", "Vendor", "Crew", "Equipment", "Notes", "Receipt URL"];
  const rows = results.map(r => [
    r.id, r.date, r.projectName ?? "", r.phaseName ?? "",
    r.category, r.amount, r.vendor ?? "", r.crew ?? "", r.equipment ?? "",
    r.notes ?? "", r.receiptUrl ?? "",
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
  res.send(csv);
});

// GET /expenses/:id
router.get("/expenses/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetExpenseParams.safeParse({ id: raw });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const result = await getExpenseWithProject(params.data.id, req.user!.id);
  if (!result) { res.status(404).json({ error: "Expense not found" }); return; }
  res.json(result);
});

// PATCH /expenses/:id
router.patch("/expenses/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateExpenseParams.safeParse({ id: raw });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const parsed = UpdateExpenseBody.safeParse(req.body);
  if (!parsed.success) { res.status(400).json({ error: parsed.error.message }); return; }

  const ownedExpense = await getOwnedExpense(params.data.id, req.user!.id);
  if (!ownedExpense) { res.status(404).json({ error: "Expense not found" }); return; }

  const targetProjectId = parsed.data.projectId ?? ownedExpense.projectId;
  if (parsed.data.projectId !== undefined) {
    const [project] = await db.select({ id: projectsTable.id }).from(projectsTable)
      .where(and(eq(projectsTable.id, parsed.data.projectId), eq(projectsTable.userId, req.user!.id)))
      .limit(1);
    if (!project) { res.status(404).json({ error: "Project not found" }); return; }
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.amount !== undefined) updates.amount = String(parsed.data.amount);
  // crew, phaseId, equipment are NOT in the generated Zod schema — read from body directly
  if ("crew" in req.body) updates.crew = typeof req.body.crew === "string" && req.body.crew.trim() ? req.body.crew.trim() : null;
  if ("equipment" in req.body) updates.equipment = typeof req.body.equipment === "string" && req.body.equipment.trim() ? req.body.equipment.trim() : null;
  if ("phaseId" in req.body) {
    const phaseIdValue = req.body.phaseId == null || req.body.phaseId === "" ? null : parseInt(String(req.body.phaseId));
    if (phaseIdValue != null && isNaN(phaseIdValue)) { res.status(400).json({ error: "Invalid phase ID" }); return; }
    if (phaseIdValue != null && !(await phaseBelongsToProject(phaseIdValue, targetProjectId))) {
      res.status(400).json({ error: "Phase does not belong to this project" });
      return;
    }
    updates.phaseId = phaseIdValue;
  }

  const [updated] = await db
    .update(expensesTable)
    .set(updates)
    .where(and(eq(expensesTable.id, params.data.id), eq(expensesTable.projectId, ownedExpense.projectId)))
    .returning();

  if (!updated) { res.status(404).json({ error: "Expense not found" }); return; }

  await logAuditEvent({
    userId: req.user!.id,
    action: "updated",
    entityType: "expense",
    entityId: updated.id,
    summary: `Updated expense "${updated.category}"`,
    metadata: { expenseId: updated.id, changes: Object.keys(updates) },
  });

  const result = await getExpenseWithProject(updated.id, req.user!.id);
  res.json(result);
});

// DELETE /expenses/:id
router.delete("/expenses/:id", requireAuth, async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteExpenseParams.safeParse({ id: raw });
  if (!params.success) { res.status(400).json({ error: params.error.message }); return; }

  const ownedExpense = await getOwnedExpense(params.data.id, req.user!.id);
  if (!ownedExpense) { res.status(404).json({ error: "Expense not found" }); return; }

  const [deleted] = await db.delete(expensesTable)
    .where(and(eq(expensesTable.id, params.data.id), eq(expensesTable.projectId, ownedExpense.projectId)))
    .returning();
  if (!deleted) { res.status(404).json({ error: "Expense not found" }); return; }

  await logAuditEvent({
    userId: req.user!.id,
    action: "deleted",
    entityType: "expense",
    entityId: deleted.id,
    summary: `Deleted expense "${deleted.category}"`,
    metadata: { expenseId: deleted.id, projectId: deleted.projectId, category: deleted.category },
  });

  res.sendStatus(204);
});

export default router;
