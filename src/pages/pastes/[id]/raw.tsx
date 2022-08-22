import * as argon2 from 'argon2'
import Cryptr from 'cryptr'
import { GetServerSideProps } from 'next'
import { prisma } from '../../../server/db/client'

const Raw = () => {
  return null
}

export const getServerSideProps: GetServerSideProps = async ({
  res,
  params,
  query,
}) => {
  if (res) {
    const paste = await prisma.paste.findFirst({
      where: { id: params?.id as string },
      select: { content: true, password: true },
    })

    if (paste?.password) {
      const valid = await argon2.verify(
        paste.password,
        (query?.password as string) ?? '',
      )

      if (valid) {
        res.setHeader('Content-Type', 'text/plain; charset="UTF-8"')
        res.write(new Cryptr(query?.password as string).decrypt(paste.content))
        res.end()
      } else {
        res.statusCode = 401
        res.end()
      }
    } else {
      res.setHeader('Content-Type', 'text/plain; charset="UTF-8"')
      res.write(paste?.content ?? 'nope')
      res.end()
    }
  }
  return {
    props: {},
  }
}

export default Raw
