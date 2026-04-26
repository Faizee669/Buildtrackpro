import { db, auditLogsTable } from "@workspace/db";
import { sql } from "drizzle-orm";

type AuditAction = "created" | "updated" | "deleted";

type LogAuditEventInput = {
  userId: string;
  action: AuditAction;
  entityType: "project" | "phase" | "expense" | "crew" | "inventory" | "settings";
  entityId?: string | number | null;
  summary: string;
  metadata?: Record<string, unknown> | null;
};

let ensureAuditTablePromise: Promise<void> | null = null;

async function ensureAuditTable() {
  if (!ensureAuditTablePromise) {
    ensureAuditTablePromise = db.execute(sql`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id SERIAL PRIMARY KEY,
        user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action TEXT NOT NULL,
        entity_type TEXT NOT NULL,
        entity_id TEXT,
        summary TEXT NOT NULL,
        metadata JSONB,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `).then(() => undefined).catch((err) => {
      ensureAuditTablePromise = null;
      throw err;
    });
  }

  await ensureAuditTablePromise;
}

export async function logAuditEvent(input: LogAuditEventInput): Promise<void> {
  try {
    await ensureAuditTable();
    await db.insert(auditLogsTable).values({
      userId: input.userId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId == null ? null : String(input.entityId),
      summary: input.summary,
      metadata: input.metadata ?? null,
    });
  } catch (err) {
    console.error("Failed to persist audit log event:", err);
  }
}
