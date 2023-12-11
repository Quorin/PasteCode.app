import { NextPage } from 'next'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Button from '../../app/_components/Button'
import FormTitle from '../../app/_components/FormTitle'
import Input from '../../app/_components/Input'
import { resetPasswordSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { api } from '../../utils/trpc'
import { z } from 'zod'

type ResetPasswordFields = z.infer<typeof resetPasswordSchema>

const ResetPassword: NextPage = () => {
  const mutation = api.user.resetPassword.useMutation()

  const methods = useForm<ResetPasswordFields>({
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
          () => (
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
        onSubmit={methods.handleSubmit(handleResetPassword)}
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
