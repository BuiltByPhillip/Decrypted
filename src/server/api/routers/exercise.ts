import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { exercises } from "~/server/db/schema";
import { eq } from "drizzle-orm";

export const exerciseRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ dsl: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const slug = crypto.randomUUID().slice(0, 8);
      await ctx.db.insert(exercises).values({
        userId: ctx.session.userId,
        slug,
        name: input.name,
        dsl: input.dsl,
      });
      return { slug };
    }),
  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      return ctx.db.query.exercises.findMany({
        where: (exercises, { eq, isNull, and }) => and(
          eq(exercises.userId, ctx.session.userId),
          isNull(exercises.deletedAt),
        ),
      });
    }),
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.update(exercises)
        .set({ deletedAt: new Date()})
        .where(eq(exercises.id, input.id))
    })
});
