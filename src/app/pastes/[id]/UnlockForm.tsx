'use client'

import Image from 'next/image'
import Button from '../../_components/Button'
import Input from '../../_components/Input'
import { FormProvider, useForm } from 'react-hook-form'

const UnlockForm = () => {
  const unlockPasteMethods = useForm<{
    password: string
  }>({ defaultValues: { password: '' } })

  const handleUnlockPaste = async (data: { password: string }) => {
    console.log('unlock paste', data)
  }

  return (
    <div className="flex flex-col justify-center items-center">
      <Image
        src="/images/secure.svg"
        alt="Paste is secure"
        width={500}
        height={400}
      />
      <h3 className="text-lg text-red-300">Paste is secured with a password</h3>
      <div className="flex flex-col gap-6 mt-6">
        <FormProvider {...unlockPasteMethods}>
          <form
            onSubmit={unlockPasteMethods.handleSubmit((data) =>
              handleUnlockPaste(data),
            )}
          >
            <div className="mb-6">
              {' '}
              <Input
                id="password"
                name="password"
                type={'password'}
                placeholder="*********"
                required={true}
              />
            </div>

            <Button type="submit" className="px-20">
              Decrypt Paste
            </Button>
          </form>
        </FormProvider>
      </div>
    </div>
  )
}

export default UnlockForm
