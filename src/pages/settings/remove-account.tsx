import { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormProvider } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/Button'
import FormTitle from '../../components/FormTitle'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { removeAccountSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { inferMutationInput, trpc, useZodForm } from '../../utils/trpc'
import useAuth from '../../utils/useAuth'

type FormValues = inferMutationInput<'settings.removeAccount'>

const RemoveAccount: NextPage = () => {
  const { isLoggedIn, isLoading, logout } = useAuth()
  const router = useRouter()

  const mutation = trpc.useMutation(['settings.removeAccount'])
  const methods = useZodForm({
    schema: removeAccountSchema,
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
        onSubmit={methods.handleSubmit(async (v) => handleRemoveAccount(v))}
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
          className="px-20 self-start"
          disabled={mutation.isLoading}
        >
          Submit
        </Button>
      </form>
    </FormProvider>
  )
}

export default RemoveAccount
