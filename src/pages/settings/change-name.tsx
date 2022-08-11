import { Field, Form, Formik, FormikHelpers } from 'formik'
import type { NextPage } from 'next'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import toast, { Toaster } from 'react-hot-toast'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { trpc } from '../../utils/trpc'

const values = {
  name: '',
}

type FormValues = typeof values

const ChangeName: NextPage = () => {
  const session = useSession()
  const router = useRouter()
  const { mutateAsync } = trpc.useMutation(['settings.changeName'])

  if (session.status === 'unauthenticated') {
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
              <p>Name has been changed</p>
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
        {({ handleSubmit, values }) => (
          <Form onSubmit={handleSubmit}>
            <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
              Change Name
            </h2>
            <div className="mb-6">
              <Field
                name="name"
                component={Input}
                label="Name"
                placeholder=""
                required={true}
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

export default ChangeName
