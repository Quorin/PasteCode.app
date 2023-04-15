import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/Button'
import FormTitle from '../../components/FormTitle'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { changePasswordSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { api } from '../../utils/trpc'
import useAuth from '../../utils/useAuth'
import { z } from 'zod'

type FormValues = z.infer<typeof changePasswordSchema>

const ChangePassword: NextPage = () => {
  const { isLoggedIn, isLoading, refresh } = useAuth()
  const router = useRouter()
  const mutation = api.settings.changePassword.useMutation()
  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      currentPassword: '',
      password: '',
      confirmPassword: '',
    },
  })

  if (!isLoading && !isLoggedIn) {
    router.replace(routes.AUTH.LOGIN)
  }

  const handleChangePassword = async (values: FormValues) => {
    mutation.mutate(values, {
      onError(error) {
        errorHandler(methods.setError, error)
      },
      async onSuccess() {
        toast.custom(
          () => (
            <div className="text-white bg-blue-700 px-5 py-2.5 rounded-lg">
              <p>Password has been changed</p>
            </div>
          ),
          { position: 'bottom-center' },
        )
        await refresh()
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <FormTitle title="Change password" />
      <form
        onSubmit={methods.handleSubmit(handleChangePassword)}
        className="flex flex-col gap-6"
      >
        <Input
          id={'currentPassword'}
          name={'currentPassword'}
          type={'password'}
          label={'Current Password'}
          placeholder={'********'}
          required={true}
        />
        <Input
          id={'password'}
          name={'password'}
          type={'password'}
          label={'New Password'}
          placeholder={'********'}
          required={true}
        />
        <Input
          id={'confirmPassword'}
          name={'confirmPassword'}
          type={'password'}
          label={'Confirm Password'}
          placeholder={'********'}
          required={true}
        />
        <Button
          type="submit"
          className="px-20 md:self-start"
          disabled={mutation.isLoading}
        >
          Submit
        </Button>
      </form>
    </FormProvider>
  )
}

export default ChangePassword
