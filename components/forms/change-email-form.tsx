'use client'

import { z } from 'zod'
import { changeEmailSchema } from '@/server/schema'
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
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { userQueryOptions } from '@/utils/logout'
import { handleAction } from '@/utils/form-handler'
import { zodResolver } from '@hookform/resolvers/zod'
import { useServerAction } from '@orpc/react/hooks'
import { changeEmail } from '@/actions/change-email'
import { useQueryClient } from '@tanstack/react-query'

type FormValues = z.infer<typeof changeEmailSchema>

const ChangeEmailForm = () => {
  const { execute } = useServerAction(changeEmail)

  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: '',
      confirmEmail: '',
    },
  })

  const handleSubmit = async (values: FormValues) => {
    const { error } = await handleAction(execute, values, form.setError)
    if (error) {
      return
    }

    form.reset()

    await queryClient.invalidateQueries(userQueryOptions)
    toast.info('Email has been changed, please confirm new email address')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleSubmit)}
        className="flex flex-col gap-6"
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>New Email</FormLabel>
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
        <FormField
          control={form.control}
          name="confirmEmail"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Confirm New Email</FormLabel>
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

export default ChangeEmailForm
