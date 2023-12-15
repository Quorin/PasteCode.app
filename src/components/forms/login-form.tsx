'use client'

import { z } from 'zod'
import { loginSchema } from '../../server/router/schema'
import { useForm } from 'react-hook-form'
import { useAction } from '../../app/api-client'
import { loginAction } from '../../app/_actions/login'
import { errorHandler } from '../../utils/errorHandler'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'
import { Input } from '../ui/input'
import { useRouter } from 'next/navigation'
import { routes } from '../../constants/routes'
import { Button } from '../ui/button'
import { Loader2 } from 'lucide-react'

type FormValues = z.infer<typeof loginSchema>

const LoginForm = () => {
  const router = useRouter()

  const methods = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const mutation = useAction(loginAction, {
    onSuccess: () => {
      methods.reset()
      router.push(routes.HOME)
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
              <FormLabel required={true}>Password</FormLabel>
              <FormControl>
                <Input
                  required
                  placeholder="********"
                  type="password"
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
          disabled={mutation.status === 'loading'}
        >
          {mutation.status === 'loading' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Logging in...
            </>
          ) : (
            'Login'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default LoginForm
