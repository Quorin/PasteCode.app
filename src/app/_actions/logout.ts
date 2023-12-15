'use server'

import { createAction, protectedProcedure } from '../../server/router/context'

export const logoutAction = createAction(
  protectedProcedure.mutation(async ({ ctx }) => {
    ctx.session.destroy()
  }),
)
