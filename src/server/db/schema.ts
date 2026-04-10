import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const exercises = pgTable("exercises", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  dsl: text("dsl").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});