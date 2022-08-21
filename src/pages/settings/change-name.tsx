import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormProvider } from 'react-hook-form'
import toast, { Toaster } from 'react-hot-toast'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { changeNameSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { inferMutationInput, trpc, useZodForm } from '../../utils/trpc'
import useAuth from '../../utils/useAuth'

type FormValues = inferMutationInput<'settings.changeName'>

const ChangeName: NextPage = () => {
  const { isLoggedIn, isLoading, refresh } = useAuth()
  const router = useRouter()
  const mutation = trpc.useMutation(['settings.changeName'])
  const methods = useZodForm({
    schema: changeNameSchema,
    mode: 'onBlur',
    defaultValues: {
      name: '',
    },
  })

  if (!isLoading && !isLoggedIn) {
    router.replace(routes.AUTH.LOGIN)
  }

  const handleChangeName = async (values: FormValues) => {
    mutation.mutate(values, {
      onError(error) {
        errorHandler(methods.setError, error)
      },
      async onSuccess() {
        toast.custom(
          () => (
            <div className="text-white bg-blue-700 px-5 py-2.5 rounded-lg">
              <p>Name has been changed</p>
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
      <form onSubmit={methods.handleSubmit(async (v) => handleChangeName(v))}>
        <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
          Change Name
        </h2>
        <div className="mb-6">
          <Input
            id={'name'}
            name={'name'}
            type={'text'}
            label={'New Name'}
            required={true}
          />
        </div>
        <Button type="submit" className="px-20" disabled={mutation.isLoading}>
          Submit
        </Button>
        <Toaster />
      </form>
    </FormProvider>
  )
}

export default ChangeName
