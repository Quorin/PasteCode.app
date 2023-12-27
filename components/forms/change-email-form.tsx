'use client'

import { z } from 'zod'
import { changeEmailSchema } from '@/server/trpc/schema'
import { useForm } from 'react-hook-form'
import { useAction } from '@/app/api-client'
import { changeEmailAction } from '@/actions/change-email'
import { errorHandler } from '@/utils/errorHandler'
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
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

type FormValues = z.infer<typeof changeEmailSchema>

// todo: auth check on upper level

const ChangeEmailForm = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      email: '',
      confirmEmail: '',
    },
  })

  const changeEmailMutation = useAction(changeEmailAction, {
    onSuccess: () => {
      methods.reset()
      toast.custom(
        () => (
          <div className="text-white bg-blue-700 px-5 py-2.5 rounded-lg">
            <p>Email has been changed, please confirm new email address</p>
          </div>
        ),
        { position: 'bottom-center' },
      )
    },
    onError: (error) => {
      errorHandler(methods.setError, error)
    },
  })

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit((data) =>
          changeEmailMutation.mutate(data),
        )}
        className="flex flex-col gap-6"
      >
        <FormField
          control={methods.control}
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
          control={methods.control}
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
          className="px-20 md:self-start"
          disabled={changeEmailMutation.status === 'loading'}
        >
          {changeEmailMutation.status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default ChangeEmailForm
