import { os } from '@orpc/server'
import z from 'zod'

export const router = {
  hello: os
    .input(
      z.object({
        name: z.string(),
      }),
    )
    .output(
      z.object({
        message: z.string(),
      }),
    )
    .handler(async ({ input }) => {
      return { message: `Hello, ${input.name}!` }
    })
    .callable(),
}
