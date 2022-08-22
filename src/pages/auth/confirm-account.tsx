import dayjs from 'dayjs'
import { GetServerSideProps, InferGetServerSidePropsType } from 'next'
import Image from 'next/image'
import { prisma } from '../../server/db/client'

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

  const confirmation = await prisma.confirmationCode.findFirst({
    where: { id: query.id, code: query.code },
  })

  if (!confirmation || dayjs().isAfter(confirmation.expiresAt)) {
    return {
      props: {
        result: false,
      },
    }
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: confirmation.userId },
      data: {
        confirmed: true,
      },
    }),
    prisma.confirmationCode.delete({ where: { id: confirmation.id } }),
  ])

  return {
    props: {
      result: true,
    },
  }
}

export default ConfirmAccount
