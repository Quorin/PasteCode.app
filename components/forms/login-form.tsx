'use client'

import { z } from 'zod'
import { loginSchema } from '@/server/schema'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { routes } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { userQueryOptions } from '@/utils/logout'
import { handleAction } from '@/utils/form-handler'
import { useServerAction } from '@orpc/react/hooks'
import { resendConfirmationCode } from '@/actions/resend-confirmation-code'
import { login } from '@/actions/login'

type FormValues = z.infer<typeof loginSchema>

const LoginForm = () => {
  const { execute: executeResendCode } = useServerAction(resendConfirmationCode)
  const { execute: executeLogin } = useServerAction(login)

  const router = useRouter()
  const queryClient = useQueryClient()
  const [formType, setFormType] = useState<'login' | 'resend'>('login')

  const form = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleLogin = async (values: FormValues) => {
    setFormType('login')

    const { error } = await handleAction(executeLogin, values, form.setError)
    if (error) return

    await queryClient.invalidateQueries(userQueryOptions)

    router.push(routes.HOME)
    toast.success('Logged in successfully')
    return
  }

  const handleResendCode = async (values: FormValues) => {
    setFormType('resend')

    form.clearErrors()

    const { error } = await handleAction(
      executeResendCode,
      values,
      form.setError,
    )

    if (error) return

    form.reset()
    toast.info('Confirmation code has been sent to your email')
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleLogin)}
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Password</FormLabel>
              <FormControl>
                <Input placeholder="********" type="password" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Link
          href={routes.AUTH.RESET_PASSWORD}
          className="text-accent-foreground hover:underline"
        >
          Forgot password?
        </Link>
        <div className="flex flex-col md:flex-row md:self-start gap-2 md:gap-6">
          <Button
            type="submit"
            className="md:w-44 md:self-start"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && formType === 'login' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Login'
            )}
          </Button>

          <Button
            type="button"
            onClick={form.handleSubmit(handleResendCode)}
            className="md:w-72 md:self-start"
            disabled={form.formState.isSubmitting}
            variant={'secondary'}
          >
            {form.formState.isSubmitting && formType === 'resend' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Send Confirmation'
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}

export default LoginForm
