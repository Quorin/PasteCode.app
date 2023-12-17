'use client'

import { z } from 'zod'
import { resetPasswordConfirmationSchema } from '@/server/router/schema'
import { useForm } from 'react-hook-form'
import { useAction } from '@/app/api-client'
import { resetPasswordConfirmationAction } from '@/actions/reset-password-confirmation'
import { errorHandler } from '@/utils/errorHandler'
import { useRouter } from 'next/navigation'
import { routes } from '@/constants/routes'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type FormValues = z.infer<typeof resetPasswordConfirmationSchema>

const ConfirmResetPasswordForm = ({
  id,
  code,
}: {
  id: string
  code: string
}) => {
  const router = useRouter()
  const methods = useForm<FormValues>({
    defaultValues: {
      id,
      code,
      password: '',
      confirmPassword: '',
    },
  })

  const mutation = useAction(resetPasswordConfirmationAction, {
    onError: (error) => {
      errorHandler(methods.setError, error)
    },
    onSuccess: () => {
      methods.reset()

      router.replace(routes.AUTH.LOGIN)
    },
  })

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}
        className="flex flex-col gap-6"
      >
        <FormField
          control={methods.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Password</FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="********"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Confirm Password</FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="********"
                  type="password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="px-20 md:self-start"
          disabled={mutation.status === 'loading'}
        >
          {mutation.status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Changing...
            </>
          ) : (
            'Change Password'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default ConfirmResetPasswordForm
