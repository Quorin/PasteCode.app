import { ORPCError } from '@orpc/client'
import type { ThrowableError } from '@orpc/server'
import { UseFormReturn, FieldValues, Path } from 'react-hook-form'

type ErrorData = Record<string, string>

export function setFormErrors<T extends FieldValues>(
  error: unknown,
  setter: UseFormReturn<T>['setError'],
): error is ORPCError<'BAD_REQUEST', ErrorData> {
  if (
    error &&
    error instanceof ORPCError &&
    error.defined &&
    error.code === 'BAD_REQUEST'
  ) {
    const errorData = error.data as ErrorData

    for (const [field, error] of Object.entries(errorData)) {
      setter(field as Path<T>, { message: error })
    }
  }

  return true
}

export async function handleAction<
  T extends FieldValues,
  TError = ThrowableError,
  TExecute extends (
    values: T,
  ) => Promise<{ error: TError | null; isDefined: boolean }> = (
    values: T,
  ) => Promise<{ error: TError | null; isDefined: boolean }>,
>(execute: TExecute, values: T, setter: UseFormReturn<T>['setError']) {
  const result = await execute(values)

  if (result.error) {
    setFormErrors(result.error, setter)
  }

  return result
}
