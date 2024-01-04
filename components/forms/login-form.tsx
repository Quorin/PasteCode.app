'use client'

import { z } from 'zod'
import { loginSchema } from '@/server/schema'
import { useForm } from 'react-hook-form'
import { loginAction } from '@/actions/login'
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
import { resendConfirmationCodeAction } from '@/actions/resend-confirmation-code'
import toast from 'react-hot-toast'
import { handleActionError } from '@/utils/error-handler'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/utils/useAuth'

type FormValues = z.infer<typeof loginSchema>

const LoginForm = () => {
  const { refresh: refreshAuth } = useAuth()
  const [formType, setFormType] = useState<'login' | 'resend'>('login')
  const router = useRouter()

  const methods = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleLogin = async (values: FormValues) => {
    setFormType('login')

    const login = await loginAction(values)

    if (!login) {
      return
    }

    if (!login.success) {
      handleActionError(methods.setError, login.errors)
      return
    }

    toast.custom(
      () => (
        <div className="text-white bg-green-500 px-5 py-2.5 rounded-lg">
          <p>Successfully logged in.</p>
        </div>
      ),
      { position: 'bottom-center' },
    )

    await refreshAuth()

    router.push(routes.HOME)
  }

  const handleResendCode = async (values: FormValues) => {
    setFormType('resend')

    methods.clearErrors()

    const resendCode = await resendConfirmationCodeAction(values)
    if (!resendCode) {
      return
    }

    if (!resendCode.success) {
      handleActionError(methods.setError, resendCode.errors)
      return
    }

    methods.reset()

    toast.custom(
      () => (
        <div className="text-white bg-green-500 px-5 py-2.5 rounded-lg">
          <p>Confirmation code has been sent to your email.</p>
        </div>
      ),
      { position: 'bottom-center' },
    )
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleLogin)}
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
        <FormField
          control={methods.control}
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
            disabled={methods.formState.isSubmitting}
          >
            {methods.formState.isSubmitting && formType === 'login' ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              'Login'
            )}
          </Button>

          <Button
            type="button"
            onClick={methods.handleSubmit(handleResendCode)}
            className="md:w-72 md:self-start"
            disabled={methods.formState.isSubmitting}
            variant={'secondary'}
          >
            {methods.formState.isSubmitting && formType === 'resend' ? (
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
