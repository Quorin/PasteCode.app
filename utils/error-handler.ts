import type { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { ZodError } from 'zod'

export const ActionErrorKind = {
  VALIDATION: 'VALIDATION',
  INTERNAL: 'INTERNAL',
} as const

export type ActionErrorKind =
  (typeof ActionErrorKind)[keyof typeof ActionErrorKind]

export type ActionResult<TData, TInput extends FieldValues> =
  | {
      success: true
      data: TData
    }
  | {
      success: false
      kind: ActionErrorKind
      errors: {
        path?: Path<TInput>
        message: string
      }[]
    }
  | undefined

export function errorResult<TData, TInput extends FieldValues>(
  kind: ActionErrorKind = ActionErrorKind.INTERNAL,
  errors: {
    path?: Path<TInput>
    message: string
  }[] = [],
): ActionResult<TData, TInput> {
  return {
    success: false,
    kind,
    errors,
  }
}

export function successResult<TData>(data: TData): ActionResult<TData, never> {
  return {
    success: true,
    data,
  }
}

export function validationErrorResult<TInput extends FieldValues>(
  zodError: ZodError,
): ActionResult<never, TInput> {
  return errorResult(
    ActionErrorKind.VALIDATION,
    zodError.issues.map((issue) => ({
      path: issue.path.join('.') as Path<TInput>,
      message: issue.message,
    })),
  )
}

export function handleActionError<T extends FieldValues>(
  setter: UseFormSetError<T>,
  errors: {
    path?: string
    message: string
  }[],
) {
  errors.forEach(({ path, message }) => {
    if (!path) return
    setter(path as Path<T>, { message })
  })
}
