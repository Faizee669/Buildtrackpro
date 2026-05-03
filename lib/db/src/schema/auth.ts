import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, serial, timestamp, varchar, text } from "drizzle-orm/pg-core";

// Session storage table used by the app auth system.
export const sessionsTable = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Core user profile table used by auth and app features.
export const usersTable = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  companyName: text("company_name"),
  plan: text("plan").notNull().default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  notificationsEmail: boolean("notifications_email").notNull().default(true),
  notificationsOverbudget: boolean("notifications_overbudget").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export type UpsertUser = typeof usersTable.$inferInsert;
export type User = typeof usersTable.$inferSelect;

export const emailCredentialsTable = pgTable("email_credentials", {
  id: serial("id").primaryKey(),
  email: varchar("email").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  userId: varchar("user_id").notNull().references(() => usersTable.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type EmailCredential = typeof emailCredentialsTable.$inferSelect;
