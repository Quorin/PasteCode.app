import { TRPCClientErrorLike } from '@trpc/react-query'
import { FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { AppRouter } from '@/server/router'

export function errorHandler<T extends FieldValues>(
  setter: UseFormSetError<T>,
  errors: TRPCClientErrorLike<AppRouter>,
) {
  Object.entries(errors?.data?.zodError?.fieldErrors ?? {}).forEach(
    ([field, message]) => {
      if (!message) return
      if (Array.isArray(message)) {
        message.forEach((text) => setter(field as Path<T>, { message: text }))
        return
      }

      setter(field as Path<T>, { message })
    },
  )
}
