'use client'

import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useRouter } from 'next/navigation'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form'

type FormValues = {
  password: string
}

const UnlockForm = ({ id }: { id: string }) => {
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
          width={500}
          height={400}
        />
        <p className="text-lg text-destructive-foreground">
          Paste is secured with a password
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

  // return (
  //   <div className="flex flex-col justify-center items-center">
  //     <Image
  //       src="/images/secure.svg"
  //       alt="Paste is secure"
  //       width={500}
  //       height={400}
  //     />
  //     <h3 className="text-lg text-red-300">Paste is secured with a password</h3>
  //     <div className="flex flex-col gap-6 mt-6">
  //       <FormProvider {...unlockPasteMethods}>
  //         <form
  //           onSubmit={unlockPasteMethods.handleSubmit((data) =>
  //             handleUnlockPaste(data),
  //           )}
  //         >
  //           <div className="mb-6">
  //             {' '}
  //             <Input
  //               id="password"
  //               name="password"
  //               type={'password'}
  //               placeholder="*********"
  //               required={true}
  //             />
  //           </div>

  //           <Button type="submit" className="px-20">
  //             Decrypt Paste
  //           </Button>
  //         </form>
  //       </FormProvider>
  //     </div>
  //   </div>
  // )
}

export default UnlockForm
