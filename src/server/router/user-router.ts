import { z } from "zod";
import { createRouter } from "./context";
import * as argon2 from "argon2";

export const userRouter = createRouter().mutation("register", {
  input: z
    .object({
      email: z
        .string()
        .email("Email is not valid")
        .refine(
          async (email) => {
            const user = await prisma!.user.findFirst({
              where: { email },
            });

            return !user;
          },
          { message: "Provided email is already in use", path: ["email"] }
        ),
      name: z
        .string()
        .max(24, "Name must be shorter or equal 24")
        .refine(
          async (name) => {
            const user = await prisma!.user.findFirst({
              where: { name },
            });

            return !user;
          },
          { message: "Provided name is already in use", path: ["name"] }
        ),
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
  async resolve({ input }) {
    await prisma!.user.create({
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
