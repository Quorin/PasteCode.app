import { GetServerSideProps } from 'next'
import { prisma } from '../../../server/db/client'

const Raw = () => {
  return null
}

export const getServerSideProps: GetServerSideProps = async ({
  res,
  params,
}) => {
  if (res) {
    const paste = await prisma.paste.findFirst({
      where: { id: params?.id as string },
    })

    res.setHeader('Content-Type', 'text/plain')
    res.write(paste?.content ?? '')
    res.end()
  }
  return {
    props: {},
  }
}

export default Raw
