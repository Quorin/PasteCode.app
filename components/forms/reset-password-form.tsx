'use client'

import { z } from 'zod'
import { resetPasswordSchema } from '@/server/schema'
import { useForm } from 'react-hook-form'
import { resetPasswordAction } from '@/actions/reset-password'
import toast from 'react-hot-toast'
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
import { handleActionError } from '@/utils/errorHandler'

type FormFields = z.infer<typeof resetPasswordSchema>

const ResetPasswordForm = () => {
  const methods = useForm<FormFields>({
    defaultValues: {
      email: '',
    },
  })

  const handleResetPassword = async (values: FormFields) => {
    const action = await resetPasswordAction(values)
    if (!action) {
      return
    }

    if (!action.success) {
      handleActionError(methods.setError, action.errors)
      return
    }

    methods.reset()

    toast.custom(
      () => (
        <div className="text-white bg-blue-700 px-5 py-2.5 rounded-lg">
          <p>Email has been sent if we found your account</p>
        </div>
      ),
      { position: 'bottom-center' },
    )
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleResetPassword)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={methods.control}
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
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? (
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
