// src/server/router/index.ts
import { createRouter } from "./context";
import superjson from "superjson";
import { userRouter } from "./user-router";
import { ZodError } from "zod";

export const appRouter = createRouter()
  .merge("user.", userRouter)
  .formatError(({ shape, error }) => {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.code === "BAD_REQUEST" && error.cause instanceof ZodError
            ? error.cause.flatten()
            : null,
      },
    };
  })
  .transformer(superjson);

// export type definition of API
export type AppRouter = typeof appRouter;
