import { pgTable, text, serial, numeric, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { projectsTable } from "./projects";

export const crewTable = pgTable("crew", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull().default("laborer"),
  dailyRate: numeric("daily_rate", { precision: 12, scale: 2 }).notNull().default("0"),
  phone: text("phone"),
  projectId: integer("project_id").references(() => projectsTable.id, { onDelete: "set null" }),
  status: text("status").notNull().default("active"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertCrewSchema = createInsertSchema(crewTable).omit({ id: true, createdAt: true });
export type InsertCrew = z.infer<typeof insertCrewSchema>;
export type CrewMember = typeof crewTable.$inferSelect;
