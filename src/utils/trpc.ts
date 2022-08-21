// src/utils/trpc.ts
import type { AppRouter } from '../server/router'
import { createReactQueryHooks } from '@trpc/react'
import type { inferProcedureInput, inferProcedureOutput } from '@trpc/server'
import { useForm, UseFormProps } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { UseFormSetError } from 'react-hook-form/dist/types/form'

export const trpc = createReactQueryHooks<AppRouter>()

/**
 * This is a helper method to infer the output of a query resolver
 * @example type HelloOutput = inferQueryOutput<'hello'>
 */
export type inferQueryOutput<
  TRouteKey extends keyof AppRouter['_def']['queries'],
> = inferProcedureOutput<AppRouter['_def']['queries'][TRouteKey]>

export type inferQueryInput<
  TRouteKey extends keyof AppRouter['_def']['queries'],
> = inferProcedureInput<AppRouter['_def']['queries'][TRouteKey]>

export type inferMutationOutput<
  TRouteKey extends keyof AppRouter['_def']['mutations'],
> = inferProcedureOutput<AppRouter['_def']['mutations'][TRouteKey]>

export type inferMutationInput<
  TRouteKey extends keyof AppRouter['_def']['mutations'],
> = inferProcedureInput<AppRouter['_def']['mutations'][TRouteKey]>

export function useZodForm<TSchema extends z.ZodType>(
  props: Omit<UseFormProps<TSchema['_input']>, 'resolver'> & {
    schema: TSchema
  },
) {
  return useForm<TSchema['_input']>({
    ...props,
    resolver: zodResolver(props.schema, undefined, {
      rawValues: true,
    }),
  })
}
