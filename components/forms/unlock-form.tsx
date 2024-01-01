'use client'

import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

type FormValues = {
  password: string
}

const UnlockForm = () => {
  const router = useRouter()

  const methods = useForm<FormValues>({ defaultValues: { password: '' } })

  const handleSubmit = (data: FormValues) => {
    const url = new URL(window.location.href)
    url.searchParams.set('password', data.password)

    router.push(url.href)
    methods.reset()
  }

  return (
    <Form {...methods}>
      <form
        onSubmit={methods.handleSubmit((data) => handleSubmit(data))}
        className="flex flex-col justify-center items-center gap-6"
      >
        <Image
          src="/images/secure.svg"
          alt="Paste is secure"
          width={300}
          height={200}
        />
        <p className="text-lg text-destructive-foreground">
          Paste is password protected
        </p>
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
        <Button type="submit" className="px-20">
          Decrypt Paste
        </Button>
      </form>
    </Form>
  )
}

export default UnlockForm
