import dayjs from 'dayjs'
import { Field, Form, Formik, FormikHelpers } from 'formik'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Router from 'next/router'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { prisma } from '../../server/db/client'
import { trpc } from '../../utils/trpc'

type Props = {
  result: boolean
  id: string
  code: string
}

const initialValues = {
  id: '',
  code: '',
  password: '',
  confirmPassword: '',
}

type ResetPasswordFields = typeof initialValues

const ResetPasswordConfirmation = ({
  result,
  id,
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  initialValues.id = id
  initialValues.code = code

  const { mutateAsync } = trpc.useMutation(['user.resetPasswordConfirmation'])

  const handleSubmit = async (
    fields: ResetPasswordFields,
    helpers: FormikHelpers<ResetPasswordFields>,
  ) => {
    await mutateAsync(fields, {
      onError(error) {
        helpers.setErrors(error?.data?.zodError?.fieldErrors ?? {})
      },
      onSuccess() {
        Router.replace(routes.AUTH.LOGIN)
      },
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <Formik initialValues={initialValues} onSubmit={handleSubmit}>
        {({ handleSubmit, values }) => (
          <Form onSubmit={handleSubmit}>
            {result ? (
              <div>
                <h2 className="text-3xl text-zinc-200 mb-10 font-semibold">
                  Create new password
                </h2>
                <Field
                  type="hidden"
                  name="id"
                  id="id"
                  value={initialValues.id}
                />
                <Field
                  type="hidden"
                  name="code"
                  id="code"
                  value={initialValues.code}
                />
                <div className="mb-6">
                  <Field
                    name="password"
                    type="password"
                    label="Password"
                    component={Input}
                    placeholder="*******"
                    required
                    value={values.password}
                  />
                </div>
                <div className="mb-6">
                  <Field
                    name="confirmPassword"
                    type="password"
                    label="Confirm Password"
                    component={Input}
                    placeholder="*******"
                    required
                    value={values.confirmPassword}
                  />
                </div>
                <Button type="submit" className="px-20">
                  Submit
                </Button>
              </div>
            ) : (
              <p className="text-red-500 text-center">
                Code is incorrect or expired.
              </p>
            )}
          </Form>
        )}
      </Formik>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<Props> = async ({
  query,
}) => {
  if (
    !query.id ||
    !query.code ||
    Array.isArray(query.id) ||
    Array.isArray(query.code)
  ) {
    return {
      props: {
        result: false,
        id: '',
        code: '',
      },
    }
  }

  const rp = await prisma.resetPassword.findFirst({
    where: { id: query.id, code: query.code },
  })

  if (!rp || dayjs().isAfter(rp.expiresAt)) {
    return {
      props: {
        result: false,
        id: '',
        code: '',
      },
    }
  }

  return {
    props: {
      result: true,
      id: query.id,
      code: query.code,
    },
  }
}

export default ResetPasswordConfirmation
