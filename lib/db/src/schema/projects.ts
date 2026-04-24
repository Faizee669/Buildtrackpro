import { pgTable, text, serial, numeric, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const projectsTable = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  location: text("location"),
  budget: numeric("budget", { precision: 12, scale: 2 }).notNull(),
  laborBudget: numeric("labor_budget", { precision: 12, scale: 2 }).notNull().default("0"),
  materialBudget: numeric("material_budget", { precision: 12, scale: 2 }).notNull().default("0"),
  estimatedRevenue: numeric("estimated_revenue", { precision: 12, scale: 2 }).notNull().default("0"),
  startDate: date("start_date").notNull(),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertProjectSchema = createInsertSchema(projectsTable).omit({ id: true, createdAt: true });
export type InsertProject = z.infer<typeof insertProjectSchema>;
export type Project = typeof projectsTable.$inferSelect;
