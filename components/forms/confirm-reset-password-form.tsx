'use client'

import { z } from 'zod'
import { resetPasswordConfirmationSchema } from '@/server/schema'
import { useForm } from 'react-hook-form'
import { resetPasswordConfirmationAction } from '@/actions/reset-password-confirmation'
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
import { handleActionError } from '@/utils/error-handler'

type FormValues = z.infer<typeof resetPasswordConfirmationSchema>

const ConfirmResetPasswordForm = ({
  id,
  code,
}: {
  id: string
  code: string
}) => {
  const methods = useForm<FormValues>({
    defaultValues: {
      id,
      code,
      password: '',
      confirmPassword: '',
    },
  })

  const handleReset = async (values: FormValues) => {
    const action = await resetPasswordConfirmationAction(values)
    if (!action) {
      return
    }

    if (!action.success) {
      handleActionError(methods.setError, action.errors)
      return
    }
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleReset)}
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
          className="md:w-72 md:self-start"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? (
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
