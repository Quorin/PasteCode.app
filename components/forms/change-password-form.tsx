'use client'

import { z } from 'zod'
import { changePasswordSchema } from '@/server/schema'
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
import { userQueryOptions } from '@/utils/logout'
import { zodResolver } from '@hookform/resolvers/zod'
import { changePassword } from '@/actions/orpc/change-password'
import { useServerAction } from '@orpc/react/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { handleAction } from '@/utils/form-handler'

type FormValues = z.infer<typeof changePasswordSchema>

const ChangePasswordForm = () => {
  const { execute } = useServerAction(changePassword)
  const queryClient = useQueryClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
      currentPassword: '',
    },
  })

  const handleChange = async (values: FormValues) => {
    const { error } = await handleAction(execute, values, form.setError)

    if (error) {
      return
    }

    form.reset()
    await queryClient.invalidateQueries(userQueryOptions)

    toast.success('Your password has been changed')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleChange)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
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
          control={form.control}
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
          control={form.control}
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

export default ChangePasswordForm
