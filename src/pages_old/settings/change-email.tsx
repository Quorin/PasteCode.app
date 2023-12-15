import type { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../app/_components/Button'
import FormTitle from '../../components/ui/form-title'
import Input from '../../app/_components/Input'
import { routes } from '../../constants/routes'
import { changeEmailSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { api } from '../../utils/trpc'
import useAuth from '../../utils/useAuth'
import { z } from 'zod'

type FormValues = z.infer<typeof changeEmailSchema>

const ChangeEmail: NextPage = () => {
  const { isLoading, isLoggedIn, logout } = useAuth()
  const router = useRouter()
  const mutation = api.settings.changeEmail.useMutation()

  const methods = useForm<FormValues>({
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
          () => (
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
