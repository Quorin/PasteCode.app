import Link from 'next/link'
import Router from 'next/router'
import { FormProvider, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { z } from 'zod'
import Button from '../../components/Button'
import FormTitle from '../../components/FormTitle'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { loginSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { api } from '../../utils/trpc'
import useAuth from '../../utils/useAuth'

type LoginFields = z.infer<typeof loginSchema>

const Login = () => {
  const { refresh } = useAuth()
  const resendMutation = api.user.resendConfirmationCode.useMutation()
  const loginMutation = api.auth.login.useMutation()

  const methods = useForm<LoginFields>({
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  })

  const handleLogin = async (values: LoginFields) => {
    loginMutation.mutate(values, {
      onError(error) {
        errorHandler(methods.setError, error)
      },
      async onSuccess() {
        await refresh()
        await Router.push(routes.HOME)
      },
    })
  }

  const resendConfirmation = async () => {
    let email = ''

    try {
      email = z.string().email().parse(methods.getValues('email'))
    } catch {
      methods.setError('email', {
        message: 'You need to provide a valid email',
      })
    }

    if (!email) {
      return
    }

    resendMutation.mutate(
      { email },
      {
        onSuccess() {
          toast.custom(
            () => (
              <div className="text-white bg-green-500 px-5 py-2.5 rounded-lg">
                <p>Confirmation code has been sent to your email.</p>
              </div>
            ),
            { position: 'bottom-center' },
          )
        },
        onError(error) {
          toast.custom(
            () => (
              <div className="text-white bg-red-500 px-5 py-2.5 rounded-lg">
                <p>
                  {error.data?.zodError?.fieldErrors.email ??
                    'Cannot send confirmation to this email'}
                </p>
              </div>
            ),
            { position: 'bottom-center' },
          )
        },
      },
    )
  }

  return (
    <div>
      <FormTitle title="Login" />

      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit(handleLogin)}
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
          <Input
            id={'password'}
            type={'password'}
            name={'password'}
            label={'Password'}
            placeholder={'********'}
            required={true}
          />
          <Link href={routes.AUTH.RESET_PASSWORD}>
            <p className="text-red-400 text-sm hover:underline cursor-pointer">
              Reset password
            </p>
          </Link>

          <div className="flex flex-col md:items-start gap-2 md:flex-row">
            <Button
              type="submit"
              className="px-20"
              disabled={loginMutation.isLoading}
            >
              Submit
            </Button>

            <Button
              className="bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-800"
              type="button"
              disabled={resendMutation.isLoading}
              onClick={() => resendConfirmation()}
            >
              Send Confirmation
            </Button>
          </div>
        </form>
      </FormProvider>
    </div>
  )
}

export default Login
