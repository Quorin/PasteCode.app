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
  currentPassword: '',
  password: '',
  confirmPassword: '',
}

type FormValues = typeof values

const ChangePassword: NextPage = () => {
  const { user } = useUser({ redirectIfFound: false })
  const router = useRouter()
  const { mutateAsync } = trpc.useMutation(['settings.changePassword'])

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
              <p>Password has been changed</p>
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
              Change Password
            </h2>
            <div className="mb-6">
              <Field
                name="currentPassword"
                component={Input}
                label="Current Password"
                placeholder="12345678"
                required={true}
                type="password"
              />
            </div>
            <div className="mb-6">
              <Field
                name="password"
                component={Input}
                label="Password"
                placeholder="Str0ngP@ssw0rd"
                required={true}
                type="password"
              />
            </div>
            <div className="mb-6">
              <Field
                name="confirmPassword"
                component={Input}
                label="Confirm Password"
                placeholder="Str0ngP@ssw0rd"
                required={true}
                type="password"
              />
            </div>

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

export default ChangePassword
