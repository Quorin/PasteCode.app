import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import { FormProvider } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/Button'
import FormTitle from '../../components/FormTitle'
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
      <FormTitle title="Change Name" />
      <form
        onSubmit={methods.handleSubmit(async (v) => handleChangeName(v))}
        className="flex flex-col gap-6"
      >
        <Input
          id={'name'}
          name={'name'}
          type={'text'}
          label={'New Name'}
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

export default ChangeName
