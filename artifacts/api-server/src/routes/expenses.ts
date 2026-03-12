import { Router, type IRouter } from "express";
import { db, expensesTable, projectsTable } from "@workspace/db";
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

const router: IRouter = Router();

// Setup multer for receipt uploads
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

// Helper to join expense with project name
async function getExpenseWithProject(id: number) {
  const result = await db
    .select({
      id: expensesTable.id,
      projectId: expensesTable.projectId,
      projectName: projectsTable.name,
      category: expensesTable.category,
      amount: expensesTable.amount,
      vendor: expensesTable.vendor,
      date: expensesTable.date,
      notes: expensesTable.notes,
      receiptUrl: expensesTable.receiptUrl,
      createdAt: expensesTable.createdAt,
    })
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id))
    .where(eq(expensesTable.id, id))
    .limit(1);

  if (!result[0]) return null;

  return {
    ...result[0],
    amount: parseFloat(result[0].amount),
  };
}

// GET /expenses
router.get("/expenses", async (req, res): Promise<void> => {
  const parsed = ListExpensesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { projectId, category, startDate, endDate } = parsed.data;

  const conditions = [];
  if (projectId != null) conditions.push(eq(expensesTable.projectId, projectId));
  if (category != null) conditions.push(eq(expensesTable.category, category));
  if (startDate != null) conditions.push(gte(expensesTable.date, startDate));
  if (endDate != null) conditions.push(lte(expensesTable.date, endDate));

  const query = db
    .select({
      id: expensesTable.id,
      projectId: expensesTable.projectId,
      projectName: projectsTable.name,
      category: expensesTable.category,
      amount: expensesTable.amount,
      vendor: expensesTable.vendor,
      date: expensesTable.date,
      notes: expensesTable.notes,
      receiptUrl: expensesTable.receiptUrl,
      createdAt: expensesTable.createdAt,
    })
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id));

  const results = conditions.length > 0
    ? await query.where(and(...conditions)).orderBy(expensesTable.date)
    : await query.orderBy(expensesTable.date);

  res.json(results.map(r => ({ ...r, amount: parseFloat(r.amount) })));
});

// POST /expenses
router.post("/expenses", async (req, res): Promise<void> => {
  const parsed = CreateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [expense] = await db
    .insert(expensesTable)
    .values({
      ...parsed.data,
      amount: String(parsed.data.amount),
    })
    .returning();

  const result = await getExpenseWithProject(expense.id);
  res.status(201).json(result);
});

// POST /expenses/upload-receipt
router.post("/expenses/upload-receipt", upload.single("file"), async (req, res): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded" });
    return;
  }

  const url = `/api/expenses/receipts/${req.file.filename}`;
  res.json({ url });
});

// Serve uploaded receipts
router.get("/expenses/receipts/:filename", (req, res): void => {
  const filename = Array.isArray(req.params.filename) ? req.params.filename[0] : req.params.filename;
  const filePath = path.join(uploadDir, filename);
  if (!fs.existsSync(filePath)) {
    res.status(404).json({ error: "File not found" });
    return;
  }
  res.sendFile(filePath);
});

// GET /expenses/export
router.get("/expenses/export", async (req, res): Promise<void> => {
  const parsed = ListExpensesQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { projectId, category, startDate, endDate } = parsed.data;

  const conditions = [];
  if (projectId != null) conditions.push(eq(expensesTable.projectId, projectId));
  if (category != null) conditions.push(eq(expensesTable.category, category));
  if (startDate != null) conditions.push(gte(expensesTable.date, startDate));
  if (endDate != null) conditions.push(lte(expensesTable.date, endDate));

  const query = db
    .select({
      id: expensesTable.id,
      projectId: expensesTable.projectId,
      projectName: projectsTable.name,
      category: expensesTable.category,
      amount: expensesTable.amount,
      vendor: expensesTable.vendor,
      date: expensesTable.date,
      notes: expensesTable.notes,
      receiptUrl: expensesTable.receiptUrl,
      createdAt: expensesTable.createdAt,
    })
    .from(expensesTable)
    .leftJoin(projectsTable, eq(expensesTable.projectId, projectsTable.id));

  const results = conditions.length > 0
    ? await query.where(and(...conditions)).orderBy(expensesTable.date)
    : await query.orderBy(expensesTable.date);

  const headers = ["ID", "Date", "Project", "Category", "Amount", "Vendor", "Notes", "Receipt URL"];
  const rows = results.map(r => [
    r.id,
    r.date,
    r.projectName ?? "",
    r.category,
    r.amount,
    r.vendor ?? "",
    r.notes ?? "",
    r.receiptUrl ?? "",
  ]);

  const csv = [headers, ...rows]
    .map(row => row.map(v => `"${String(v).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=expenses.csv");
  res.send(csv);
});

// GET /expenses/:id
router.get("/expenses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetExpenseParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const result = await getExpenseWithProject(params.data.id);
  if (!result) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.json(result);
});

// PATCH /expenses/:id
router.patch("/expenses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateExpenseParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateExpenseBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updates: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.amount !== undefined) {
    updates.amount = String(parsed.data.amount);
  }

  const [updated] = await db
    .update(expensesTable)
    .set(updates)
    .where(eq(expensesTable.id, params.data.id))
    .returning();

  if (!updated) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  const result = await getExpenseWithProject(updated.id);
  res.json(result);
});

// DELETE /expenses/:id
router.delete("/expenses/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteExpenseParams.safeParse({ id: raw });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [deleted] = await db
    .delete(expensesTable)
    .where(eq(expensesTable.id, params.data.id))
    .returning();

  if (!deleted) {
    res.status(404).json({ error: "Expense not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
