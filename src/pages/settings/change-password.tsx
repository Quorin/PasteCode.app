import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormProvider } from 'react-hook-form'
import toast, { Toaster } from 'react-hot-toast'
import Button from '../../components/Button'
import FormTitle from '../../components/FormTitle'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { changePasswordSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { inferMutationInput, trpc, useZodForm } from '../../utils/trpc'
import useAuth from '../../utils/useAuth'

type FormValues = inferMutationInput<'settings.changePassword'>

const ChangePassword: NextPage = () => {
  const { isLoggedIn, isLoading, refresh } = useAuth()
  const router = useRouter()
  const mutation = trpc.useMutation(['settings.changePassword'])
  const methods = useZodForm({
    schema: changePasswordSchema,
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
          (t) => (
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
        onSubmit={methods.handleSubmit(async (v) => handleChangePassword(v))}
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
          className="px-20 self-start"
          disabled={mutation.isLoading}
        >
          Submit
        </Button>
        <Toaster />
      </form>
    </FormProvider>
  )
}

export default ChangePassword
