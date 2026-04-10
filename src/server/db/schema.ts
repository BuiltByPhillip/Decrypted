import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const exercises = pgTable("exercises", {
  id: text("id").primaryKey(),
  dsl: text("dsl").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});