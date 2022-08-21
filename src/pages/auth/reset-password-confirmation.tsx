import dayjs from 'dayjs'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Router from 'next/router'
import { FormProvider } from 'react-hook-form'
import Button from '../../components/Button'
import FormTitle from '../../components/FormTitle'
import Input from '../../components/Input'
import { routes } from '../../constants/routes'
import { prisma } from '../../server/db/client'
import { resetPasswordConfirmationSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { inferMutationInput, trpc, useZodForm } from '../../utils/trpc'

type Props = {
  result: boolean
  id: string
  code: string
}

type ResetPasswordFields = inferMutationInput<'user.resetPasswordConfirmation'>

const ResetPasswordConfirmation = ({
  result,
  id,
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const mutation = trpc.useMutation(['user.resetPasswordConfirmation'])
  const methods = useZodForm({
    schema: resetPasswordConfirmationSchema,
    mode: 'onBlur',
    defaultValues: {
      id,
      code,
      password: '',
      confirmPassword: '',
    },
  })

  const handleResetPasswordConfirmation = async (
    fields: ResetPasswordFields,
  ) => {
    mutation.mutate(fields, {
      onError(error) {
        errorHandler(methods.setError, error)
      },
      onSuccess() {
        Router.replace(routes.AUTH.LOGIN)
      },
    })
  }

  if (!result) {
    return (
      <p className="text-red-500 text-center">Code is incorrect or expired.</p>
    )
  }

  return (
    <FormProvider {...methods}>
      <FormTitle title="Create new password" />
      <form
        onSubmit={methods.handleSubmit(async (v) => {
          await handleResetPasswordConfirmation(v)
        })}
        className="flex flex-col gap-6"
      >
        <Input
          id={'password'}
          name={'password'}
          type={'password'}
          label={'Password'}
          placeholder={'********'}
          required={true}
        />
        <Input
          id={'confirmPassword'}
          name={'confirmPassword'}
          type={'password'}
          label={'Confirm Password'}
          placeholder={'********'}
          required={true}
        />
        <Button
          type="submit"
          className="px-20 self-start"
          disabled={mutation.isLoading}
        >
          Submit
        </Button>
      </form>
    </FormProvider>
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
