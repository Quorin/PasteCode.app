'use client'

import { z } from 'zod'
import { changePasswordSchema } from '@/server/schema'
import { useForm } from 'react-hook-form'
import { changePasswordAction } from '@/actions/change-password'
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

type FormValues = z.infer<typeof changePasswordSchema>

const ChangePasswordForm = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
      currentPassword: '',
    },
  })

  const handleChange = async (values: FormValues) => {
    const action = await changePasswordAction(values)
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
          <p>Password has been changed</p>
        </div>
      ),
      { position: 'bottom-center' },
    )
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleChange)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={methods.control}
          name="currentPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Current Password</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={methods.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Password</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
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
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className="md:w-44 md:self-start"
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

export default ChangePasswordForm
