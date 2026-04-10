import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { TRPCError } from "@trpc/server";
import bcrypt from "bcryptjs";
import { users } from "~/server/db/schema";

const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be at most 100 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter"),
});

export const userRouter = createTRPCRouter({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.users.findFirst({
        where: (users, { eq }) => eq(users.email, input.email),
      });
      if (existing) throw new TRPCError({ code: "CONFLICT", message: "Email already in use" });

      const hashedPassword = await bcrypt.hash(input.password, 12);

      await ctx.db.insert(users).values({
        email: input.email,
        passwordHash: hashedPassword,
      });
    }),
});