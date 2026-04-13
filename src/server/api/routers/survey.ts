import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { z } from "zod";
import { surveyResponse } from "~/server/db/schema";

export const surveyRouter = createTRPCRouter({
  create: publicProcedure
    .input(z.object({
      exerciseId: z.string(),
      q1: z.number().int().min(1).max(5),
      q2: z.number().int().min(1).max(5),
      q3: z.number().int().min(1).max(5),
      q4: z.number().int().min(1).max(5),
      q5: z.number().int().min(1).max(5),
      c1: z.string().optional(),
      c2: z.string().optional(),
      c3: z.string().optional(),
      c4: z.string().optional(),
      c5: z.string().optional(),
      bug: z.string().optional(),
      feedback: z.string().optional(),
      email: z.string().email().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(surveyResponse).values(input);
    }),
});
