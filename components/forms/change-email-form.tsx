'use client'

import { z } from 'zod'
import { changeEmailSchema } from '@/server/schema'
import { useForm } from 'react-hook-form'
import { changeEmailAction } from '@/actions/change-email'
import { handleActionError } from '@/utils/error-handler'
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
import { useRouter } from 'next/navigation'
import { routes } from '@/constants/routes'
import { logoutAction } from '@/actions/logout'
import { useAuth } from '@/utils/useAuth'

type FormValues = z.infer<typeof changeEmailSchema>

const ChangeEmailForm = () => {
  const router = useRouter()
  const methods = useForm<FormValues>({
    defaultValues: {
      email: '',
      confirmEmail: '',
    },
  })

  const { refetchUser } = useAuth()

  const handleSubmit = async (values: FormValues) => {
    const action = await changeEmailAction(values)

    if (!action) {
      return
    }

    if (action.success) {
      methods.reset()

      router.push(routes.HOME)

      toast.info('Email has been changed, please confirm new email address')

      await logoutAction()

      refetchUser()

      return
    }

    handleActionError(methods.setError, action.errors)
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleSubmit)}
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

export default ChangeEmailForm
