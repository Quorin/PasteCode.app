import { z, ZodError, ZodIssue } from "zod";
import { createRouter } from "./context";
import * as argon2 from "argon2";
import * as trpc from "@trpc/server";

export const userRouter = createRouter().mutation("register", {
  input: z
    .object({
      email: z.string().email("Email is not valid"),
      name: z.string().max(24, "Name must be shorter or equal 24"),
      password: z
        .string()
        .regex(
          new RegExp(
            "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})"
          ),
          "Password must contain at least one lowercase letter, one uppercase letter, one number and one special character"
        ),

      confirmPassword: z.string(),
      agree: z
        .boolean()
        .refine(
          (agree) => agree === true,
          "You must agree to the terms and conditions"
        ),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }),

  async resolve({ input, ctx }) {
    const user = await ctx.prisma.user.findFirst({
      where: { OR: [{ email: input.email }, { name: input.name }] },
    });

    if (user) {
      let errors: ZodIssue[] = [];

      if (user.email === input.email) {
        errors.push({
          message: "Provided email is already in use",
          path: ["email"],
          code: "custom",
        });
      }

      if (user.name === input.name) {
        errors.push({
          message: "Provided name is already in use",
          path: ["name"],
          code: "custom",
        });
      }

      throw new trpc.TRPCError({
        code: "BAD_REQUEST",
        cause: new ZodError(errors),
      });
    }

    await ctx.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        password: await argon2.hash(input.password),
        acceptTerms: true,
      },
    });

    return true;
  },
});
