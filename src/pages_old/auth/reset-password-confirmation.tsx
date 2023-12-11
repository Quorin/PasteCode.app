import dayjs from 'dayjs'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import Router from 'next/navigation'
import { FormProvider, useForm } from 'react-hook-form'
import Button from '../../app/_components/Button'
import FormTitle from '../../app/_components/FormTitle'
import Input from '../../app/_components/Input'
import { routes } from '../../constants/routes'
import { resetPasswordConfirmationSchema } from '../../server/router/schema'
import { errorHandler } from '../../utils/errorHandler'
import { api } from '../../utils/trpc'
import { z } from 'zod'
import { db } from '../../../db/db'
import { resetPasswordsTable } from '../../../db/schema'
import { and, eq } from 'drizzle-orm'

type Props = {
  result: boolean
  id: string
  code: string
}

type ResetPasswordFields = z.infer<typeof resetPasswordConfirmationSchema>

const ResetPasswordConfirmation = ({
  result,
  id,
  code,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const mutation = api.user.resetPasswordConfirmation.useMutation()
  const methods = useForm<ResetPasswordFields>({
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
      <div className="flex flex-col gap-10">
        <Image
          src="/images/alert.svg"
          alt="Code is incorrect or expired"
          width={500}
          height={400}
        />
        <p className="text-xl font-light text-red-500 text-center">
          Code is incorrect or expired.
        </p>
      </div>
    )
  }

  return (
    <FormProvider {...methods}>
      <FormTitle title="Create new password" />
      <form
        onSubmit={methods.handleSubmit(handleResetPasswordConfirmation)}
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
          className="px-20 md:self-start"
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
  const [rp] = await db
    .select({
      id: resetPasswordsTable.id,
      expiresAt: resetPasswordsTable.expiresAt,
    })
    .from(resetPasswordsTable)
    .where(
      and(
        eq(resetPasswordsTable.id, query.id),
        eq(resetPasswordsTable.code, query.code),
      ),
    )
    .limit(1)
    .execute()

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
