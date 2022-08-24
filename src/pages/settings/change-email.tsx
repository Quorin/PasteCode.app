import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormProvider } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/Button'
import FormTitle from '../../components/FormTitle'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { changeEmailSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { inferMutationInput, trpc, useZodForm } from '../../utils/trpc'
import useAuth from '../../utils/useAuth'

type FormValues = inferMutationInput<'settings.changeEmail'>

const ChangeEmail: NextPage = () => {
  const { isLoading, isLoggedIn, logout } = useAuth()
  const router = useRouter()
  const mutation = trpc.useMutation(['settings.changeEmail'])

  const methods = useZodForm({
    schema: changeEmailSchema,
    mode: 'onBlur',
    defaultValues: {
      email: '',
      confirmEmail: '',
    },
  })

  if (!isLoading && !isLoggedIn) {
    router.replace(routes.AUTH.LOGIN)
  }

  const handleChangeEmail = async (values: FormValues) => {
    mutation.mutate(values, {
      onError(error) {
        errorHandler(methods.setError, error)
      },
      async onSuccess() {
        toast.custom(
          (t) => (
            <div className="text-white bg-blue-700 px-5 py-2.5 rounded-lg">
              <p>Email has been changed</p>
            </div>
          ),
          { position: 'bottom-center' },
        )
        logout()
        await router.replace(routes.AUTH.LOGIN)
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <FormTitle title="Change Email" />
      <form
        onSubmit={methods.handleSubmit(handleChangeEmail)}
        className="flex flex-col gap-6"
      >
        <Input
          id={'email'}
          name={'email'}
          type={'email'}
          label={'New Email'}
          required={true}
          placeholder={'hello@world.localhost'}
        />
        <Input
          id={'confirmEmail'}
          name={'confirmEmail'}
          type={'email'}
          label={'Confirm Email'}
          required={true}
          placeholder={'hello@world.localhost'}
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

export default ChangeEmail
