'use client'

import { z } from 'zod'
import { loginSchema } from '@/server/trpc/schema'
import { useForm } from 'react-hook-form'
import { useAction } from '@/app/api-client'
import { loginAction } from '@/actions/login'
import { errorHandler } from '@/utils/errorHandler'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import { routes } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import { resendConfirmationCodeAction } from '@/actions/resend-confirmation-code'
import toast from 'react-hot-toast'

type FormValues = z.infer<typeof loginSchema>

const LoginForm = () => {
  const router = useRouter()

  const methods = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const loginMutation = useAction(loginAction, {
    onSuccess: () => {
      methods.reset()
      router.push(routes.HOME)
    },
    onError: (error) => {
      errorHandler(methods.setError, error)
    },
  })

  const resendCodeMutation = useAction(resendConfirmationCodeAction, {
    onSuccess: () => {
      methods.reset()

      toast.custom(
        () => (
          <div className="text-white bg-green-500 px-5 py-2.5 rounded-lg">
            <p>Confirmation code has been sent to your email.</p>
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
        onSubmit={methods.handleSubmit((data) => loginMutation.mutate(data))}
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
            className="px-20 md:self-start"
            disabled={loginMutation.status === 'loading'}
          >
            {loginMutation.status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </Button>

          <Button
            type="button"
            onClick={() => {
              methods.clearErrors()
              resendCodeMutation.mutate({ email: methods.getValues('email') })
            }}
            className="px-20 md:self-start"
            disabled={resendCodeMutation.status === 'loading'}
            variant={'secondary'}
          >
            {resendCodeMutation.status === 'loading' ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
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
