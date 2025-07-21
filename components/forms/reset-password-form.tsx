'use client'

import { z } from 'zod'
import { resetPasswordSchema } from '@/server/schema'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { resetPassword } from '@/actions/orpc/reset-password'
import { onError, onSuccess } from '@orpc/client'
import { setFormErrors } from '@/utils/form-handler'
import { zodResolver } from '@hookform/resolvers/zod'
import { useServerAction } from '@orpc/react/hooks'

type FormFields = z.infer<typeof resetPasswordSchema>

const ResetPasswordForm = () => {
  const { execute } = useServerAction(resetPassword, {
    interceptors: [
      onSuccess(async () => {
        form.reset()
        toast.info('Check your inbox to reset password')
      }),
      onError(async (error) => {
        setFormErrors(error, form.setError)
      }),
    ],
  })

  const form = useForm<FormFields>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((data) => execute(data))}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Email</FormLabel>
              <FormControl>
                <Input
                  required
                  type="email"
                  placeholder="hello@world.localhost"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="md:w-60 md:self-start"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default ResetPasswordForm
