'use client'

import { z } from 'zod'
import { changePasswordSchema } from '@/server/router/schema'
import { useForm } from 'react-hook-form'
import { useAction } from '@/app/api-client'
import { changePasswordAction } from '@/actions/change-password'
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
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

type FormValues = z.infer<typeof changePasswordSchema>

const ChangePasswordForm = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      password: '',
      confirmPassword: '',
      currentPassword: '',
    },
  })

  const mutation = useAction(changePasswordAction, {
    onSuccess: () => {
      methods.reset()

      toast.custom(
        () => (
          <div className="text-white bg-blue-700 px-5 py-2.5 rounded-lg">
            <p>Password has been changed</p>
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
        onSubmit={methods.handleSubmit((data) => mutation.mutate(data))}
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
          className="px-20 md:self-start"
          disabled={mutation.status === 'loading'}
        >
          {mutation.status === 'loading' ? (
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

export default ChangePasswordForm
