import { Field, Form, Formik, FormikHelpers } from 'formik'
import type { NextPage } from 'next'
import { useRouter } from 'next/router'
import toast, { Toaster } from 'react-hot-toast'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { trpc } from '../../utils/trpc'
import useUser from '../../utils/useUser'

const values = {
  email: '',
  confirmEmail: '',
}

type FormValues = typeof values

const ChangeEmail: NextPage = () => {
  const { user } = useUser({ redirectIfFound: false })
  const router = useRouter()
  const { mutateAsync } = trpc.useMutation(['settings.changeEmail'])

  if (user && !user.isLoggedIn) {
    router.replace(routes.AUTH.LOGIN)
  }

  const handleSubmit = async (
    values: FormValues,
    helpers: FormikHelpers<FormValues>,
  ) => {
    await mutateAsync(values, {
      onError(error) {
        helpers.setErrors(error?.data?.zodError?.fieldErrors ?? {})
      },
      onSuccess() {
        toast.custom(
          (t) => (
            <div className="text-white bg-blue-700 px-5 py-2.5 rounded-lg">
              <p>Email has been changed</p>
            </div>
          ),
          { position: 'bottom-center' },
        )
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Formik initialValues={values} onSubmit={handleSubmit}>
        {({ handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
              Change Email
            </h2>
            <div className="mb-6">
              <Field
                name="email"
                component={Input}
                label="Email"
                placeholder="hello@pastecode.app"
                required={true}
                type="email"
              />
            </div>
            <div className="mb-6">
              <Field
                name="confirmEmail"
                component={Input}
                label="Confirm Email"
                placeholder="hello@pastecode.app"
                required={true}
                type="email"
              />
            </div>

            <p className="mb-6 text-red-400">
              You need to verify your new email address before logging in again.
            </p>

            <Button type="submit" className="px-20">
              Submit
            </Button>
            <Toaster />
          </Form>
        )}
      </Formik>
    </div>
  )
}

export default ChangeEmail
