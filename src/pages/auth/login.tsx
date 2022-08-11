import { Field, Form, Formik, FormikHelpers } from 'formik'
import { signIn } from 'next-auth/react'
import Link from 'next/link'
import Router from 'next/router'
import toast, { Toaster } from 'react-hot-toast'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { trpc } from '../../utils/trpc'

const initialValues = {
  email: '',
  password: '',
}

type LoginFields = typeof initialValues

const Login = () => {
  const { mutateAsync } = trpc.useMutation(['user.resendConfirmationCode'])

  const handleSubmit = async (
    { email, password }: LoginFields,
    helpers: FormikHelpers<LoginFields>,
  ) => {
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    if (res?.ok && res?.status === 200) {
      Router.push(routes.HOME)
      return
    }

    helpers.setErrors({
      email: 'Invalid email or your account is not confirmed',
      password: 'Invalid password or your account is not confirmed',
    })
  }

  const resendConfirmation = async (email: string) => {
    if (!email) {
      return
    }

    try {
      await mutateAsync(
        { email },
        {
          onSuccess() {
            toast.custom(
              (t) => (
                <div className="text-white bg-green-500 px-5 py-2.5 rounded-lg">
                  <p>Confirmation code has been sent to your email.</p>
                </div>
              ),
              { position: 'bottom-center' },
            )
          },
          onError(error) {
            toast.custom(
              (t) => (
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
    } catch (e) {}
  }

  return (
    <div className="flex flex-col gap-6">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleSubmit, values, errors }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
              Login
            </h2>
            <div className="mb-6">
              <Field
                name="email"
                type="email"
                component={Input}
                label="Email"
                required
                placeholder="hello@world.localhost"
                value={values.email}
              />
            </div>

            <div className="mb-6">
              <Field
                name="password"
                type="password"
                label="Password"
                component={Input}
                placeholder="********"
                required
                value={values.password}
              />
            </div>

            <div className="mb-6">
              <Link href={routes.AUTH.RESET_PASSWORD}>
                <p className="text-red-400 text-sm hover:underline cursor-pointer">
                  Reset password
                </p>
              </Link>
            </div>

            <div className="flex flex-col md:items-start gap-2 md:flex-row">
              <Button type="submit" className="px-20">
                Submit
              </Button>

              {errors.email && (
                <Button
                  className="bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-800"
                  type="button"
                  onClick={() => resendConfirmation(values.email)}
                >
                  Send Confirmation
                </Button>
              )}
            </div>
            <Toaster />
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default Login
