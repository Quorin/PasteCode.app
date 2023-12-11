import { NextPage } from 'next'
import { useRouter } from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../app/_components/Button'
import FormTitle from '../../app/_components/FormTitle'
import Input from '../../app/_components/Input'
import { routes } from '../../constants/routes'
import { removeAccountSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { api } from '../../utils/trpc'
import useAuth from '../../utils/useAuth'
import { z } from 'zod'

type FormValues = z.infer<typeof removeAccountSchema>

const RemoveAccount: NextPage = () => {
  const { isLoggedIn, isLoading, logout } = useAuth()
  const router = useRouter()

  const mutation = api.settings.removeAccount.useMutation()
  const methods = useForm<FormValues>({
    mode: 'onBlur',
    defaultValues: {
      password: '',
    },
  })

  if (!isLoading && !isLoggedIn) {
    router.replace(routes.AUTH.LOGIN)
  }

  const handleRemoveAccount = async (values: FormValues) => {
    mutation.mutate(values, {
      onError(error) {
        errorHandler(methods.setError, error)
      },
      async onSuccess() {
        toast.custom(
          () => (
            <div className="text-white bg-red-700 px-5 py-2.5 rounded-lg">
              <p>Account has been removed</p>
            </div>
          ),
          { position: 'bottom-center' },
        )
        logout()
        await router.push(routes.HOME)
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <FormTitle title="Remove Account & Data" />
      <form
        onSubmit={methods.handleSubmit(handleRemoveAccount)}
        className="flex flex-col gap-6"
      >
        <p>
          Are you sure you want to deactivate your account? All of your data
          will be permanently removed. This action cannot be undone.
        </p>
        <Input
          id={'password'}
          name={'password'}
          type={'password'}
          placeholder="********"
          label={'Provide password to confirm your action'}
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

export default RemoveAccount
