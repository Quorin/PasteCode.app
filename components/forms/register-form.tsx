'use client'

import { z } from 'zod'
import { registerSchema } from '@/server/schema'
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
import { registerAction } from '@/actions/register'
import { toast } from 'sonner'
import { handleActionError } from '@/utils/error-handler'

type FormValues = z.infer<typeof registerSchema>

const RegisterForm = () => {
  const methods = useForm<FormValues>({
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
    mode: 'onBlur',
  })

  const handleRegister = async (values: FormValues) => {
    const action = await registerAction(values)
    if (!action) {
      return
    }

    if (!action.success) {
      handleActionError(methods.setError, action.errors)
      return
    }

    methods.reset()
    toast.success('Check your inbox to confirm account')
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit(handleRegister)}
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
          className="md:w-60 md:self-start"
          disabled={methods.formState.isSubmitting}
        >
          {methods.formState.isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Register'
          )}
        </Button>
      </form>
    </Form>
  )
}

export default RegisterForm
