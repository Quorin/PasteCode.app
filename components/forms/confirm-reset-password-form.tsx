'use client'

import { z } from 'zod'
import { resetPasswordConfirmationSchema } from '@/server/schema'
import { useForm } from 'react-hook-form'
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
import { resetPasswordConfirmation } from '@/actions/reset-password-confirmation'
import { onError, onSuccess } from '@orpc/client'
import { routes } from '@/constants/routes'
import { setFormErrors } from '@/utils/form-handler'
import { useRouter } from 'next/navigation'
import { zodResolver } from '@hookform/resolvers/zod'
import { useServerAction } from '@orpc/react/hooks'

type FormValues = z.infer<typeof resetPasswordConfirmationSchema>

const ConfirmResetPasswordForm = ({
  id,
  code,
}: {
  id: string
  code: string
}) => {
  const router = useRouter()
  const defaultValues: FormValues = {
    id,
    code,
    password: '',
    confirmPassword: '',
  }

  const { execute } = useServerAction(resetPasswordConfirmation, {
    interceptors: [
      onError(async (error) => {
        setFormErrors(error, form.setError)
      }),
      onSuccess(async () => {
        form.reset(defaultValues)
        router.push(routes.AUTH.LOGIN)
      }),
    ],
  })

  const form = useForm<FormValues>({
    resolver: zodResolver(resetPasswordConfirmationSchema),
    defaultValues,
    values: defaultValues,
    mode: 'onBlur',
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => execute(data))}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
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
          control={form.control}
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
          className="md:w-72 md:self-start"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Change Password'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default ConfirmResetPasswordForm
