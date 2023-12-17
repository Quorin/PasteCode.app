'use client'

import { z } from 'zod'
import { registerSchema } from '@/server/router/schema'
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
import { Checkbox } from '@/components/ui/checkbox'
import Link from 'next/link'
import { routes } from '@/constants/routes'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useAction } from '@/app/api-client'
import { registerAction } from '@/actions/register'
import { errorHandler } from '@/utils/errorHandler'
import toast from 'react-hot-toast'

type FormValues = z.infer<typeof registerSchema>

const RegisterForm = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  })

  const mutation = useAction(registerAction, {
    onError: (error) => {
      errorHandler(methods.setError, error)
    },
    onSuccess: () => {
      methods.reset()
      toast.custom(
        () => (
          <div className="text-white bg-green-500 px-5 py-2.5 rounded-lg">
            <p>Check your inbox to confirm account</p>
          </div>
        ),
        { position: 'bottom-center' },
      )
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
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Name</FormLabel>
              <FormControl>
                <Input required placeholder="John Doe" {...field} />
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
        <FormField
          control={methods.control}
          name="confirmPassword"
          render={({ field }) => (
            <FormItem>
              <FormLabel required={true}>Confirm Password</FormLabel>
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
        <FormField
          control={methods.control}
          name="agree"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  required={true}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel required={true}>
                  I agree with the{' '}
                  <div className="inline transition-colors text-blue-500 hover:text-blue-400 font-bold underline">
                    <Link href={routes.TERMS_AND_CONDITIONS}>
                      terms and conditions
                    </Link>
                  </div>
                  .
                </FormLabel>
              </div>
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
              Registering...
            </>
          ) : (
            'Register'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default RegisterForm
