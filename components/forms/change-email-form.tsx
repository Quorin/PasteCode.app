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
import { setFormErrors } from '@/utils/form-handler'
import { zodResolver } from '@hookform/resolvers/zod'
import { useServerAction } from '@orpc/react/hooks'
import { changeEmail } from '@/actions/change-email'
import { useQueryClient } from '@tanstack/react-query'
import { onError, onSuccess } from '@orpc/client'

type FormValues = z.infer<typeof changeEmailSchema>

const ChangeEmailForm = () => {
  const { execute } = useServerAction(changeEmail, {
    interceptors: [
      onSuccess(async () => {
        form.reset()
        await queryClient.invalidateQueries(userQueryOptions)
        toast.info('Email has been changed, please confirm new email address')
      }),
      onError((error) => {
        setFormErrors(error, form.setError)
        toast.error('Could not change email')
      }),
    ],
  })

  const queryClient = useQueryClient()
  const form = useForm<FormValues>({
    resolver: zodResolver(changeEmailSchema),
    defaultValues: {
      email: '',
      confirmEmail: '',
    },
  })

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit((values) => execute(values))}
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
