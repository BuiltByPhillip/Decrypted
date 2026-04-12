import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { exercises, ratings } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

export const ratingRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      exerciseId: z.string(),
      rating: z.number().int().min(1).max(5),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(ratings).values({
        exerciseId: input.exerciseId,
        rating: input.rating,
      });
    }),

  getAverages: protectedProcedure
    .query(async ({ ctx }) => {
      const rows = await ctx.db
        .select({
          exerciseId: ratings.exerciseId,
          average: sql<number>`ROUND(AVG(${ratings.rating})::numeric, 1)`,
          count: sql<number>`COUNT(${ratings.rating})`,
        })
        .from(ratings)
        .innerJoin(exercises, eq(ratings.exerciseId, exercises.id))
        .where(eq(exercises.userId, ctx.session.userId))
        .groupBy(ratings.exerciseId);

      return Object.fromEntries(rows.map((r) => [r.exerciseId, r]));
    }),
});
