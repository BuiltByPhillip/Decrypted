import { sql } from "drizzle-orm";
import { check, pgTable, text, timestamp, integer } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade"}),
  slug: text("slug")
    .notNull()
    .unique(),
  name: text("name").notNull(),
  dsl: text("dsl").notNull(),
  updatedAt: timestamp("updated_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  deletedAt: timestamp("deleted_at"),
});

export const ratings = pgTable("ratings", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  exerciseId: text("exercise_id")
    .notNull()
    .references(() => exercises.id),
  rating: integer("rating").notNull(),
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => [
  check("rating_range", sql`${table.rating} >= 1 AND ${table.rating} <= 5`),
]);

export const surveyResponse = pgTable("survey_response", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  exerciseId: text("exercise_id").notNull().references(() => exercises.id),
  q1: integer("q1").notNull(),
  q2: integer("q2").notNull(),
  q3: integer("q3").notNull(),
  q4: integer("q4").notNull(),
  q5: integer("q5").notNull(),
  c1: text("c1"),
  c2: text("c2"),
  c3: text("c3"),
  c4: text("c4"),
  c5: text("c5"),
  bug: text("bug"),
  feedback: text("feedback"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
})