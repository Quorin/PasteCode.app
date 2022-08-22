import { NextPage } from 'next'
import { FormProvider } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../components/Button'
import FormTitle from '../../components/FormTitle'
import Input from '../../components/Input'
import { resetPasswordSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { inferMutationInput, trpc, useZodForm } from '../../utils/trpc'

type ResetPasswordFields = inferMutationInput<'user.resetPassword'>

const ResetPassword: NextPage = () => {
  const mutation = trpc.useMutation(['user.resetPassword'])

  const methods = useZodForm({
    schema: resetPasswordSchema,
    mode: 'onBlur',
    defaultValues: {
      email: '',
    },
  })

  const handleResetPassword = async (values: ResetPasswordFields) => {
    mutation.mutate(values, {
      onError: (error) => {
        errorHandler(methods.setError, error)
      },
      onSuccess: () => {
        toast.custom(
          (t) => (
            <div className="text-white bg-blue-700 px-5 py-2.5 rounded-lg">
              <p>Email has been sent if we found your account</p>
            </div>
          ),
          { position: 'bottom-center' },
        )
      },
    })
  }

  return (
    <FormProvider {...methods}>
      <FormTitle title="Reset password" />
      <form
        onSubmit={methods.handleSubmit(async (v) => {
          await handleResetPassword(v)
        })}
        className="flex flex-col gap-6"
      >
        <Input
          id={'email'}
          name={'email'}
          type={'email'}
          label={'Email'}
          required={true}
          placeholder={'hello@world.localhost'}
        />
        <Button type="submit" className="px-20 md:self-start">
          Submit
        </Button>
      </form>
    </FormProvider>
  )
}

export default ResetPassword
