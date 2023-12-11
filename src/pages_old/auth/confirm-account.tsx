import dayjs from 'dayjs'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import { db } from '../../../db/db'
import { confirmationCodesTable, usersTable } from '../../../db/schema'
import { and, eq } from 'drizzle-orm'

type Props = {
  result: boolean
}

const ConfirmAccount = ({
  result,
}: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <div className="flex flex-col gap-10">
      {result ? (
        <>
          <Image
            src="/images/confirmed.svg"
            alt="Confirmed"
            width={500}
            height={400}
          />
          <p className="text-xl font-light text-blue-500 text-center">
            Account has been confirmed.
          </p>
        </>
      ) : (
        <>
          <Image
            src="/images/alert.svg"
            alt="Code is incorrect or expired"
            width={500}
            height={400}
          />
          <p className="text-xl font-light text-red-500 text-center">
            Code is incorrect or your request expired. Please try to send
            confirmation again.
          </p>
        </>
      )}
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

  const [confirmation] = await db
    .select({
      id: confirmationCodesTable.id,
      expiresAt: confirmationCodesTable.expiresAt,
      userId: confirmationCodesTable.userId,
    })
    .from(confirmationCodesTable)
    .where(
      and(
        eq(confirmationCodesTable.id, query.id),
        eq(confirmationCodesTable.code, query.code),
      ),
    )
    .limit(1)
    .execute()

  if (!confirmation || dayjs().isAfter(confirmation.expiresAt)) {
    return {
      props: {
        result: false,
      },
    }
  }

  await db
    .update(usersTable)
    .set({
      confirmed: true,
    })
    .where(eq(usersTable.id, confirmation.userId))
    .execute()

  await db
    .delete(confirmationCodesTable)
    .where(eq(confirmationCodesTable.id, confirmation.id))
    .execute()

  return {
    props: {
      result: true,
    },
  }
}

export default ConfirmAccount
