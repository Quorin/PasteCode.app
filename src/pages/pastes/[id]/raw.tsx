import { verify } from 'argon2'
import Cryptr from 'cryptr'
import { GetServerSideProps } from 'next'
import { db } from '../../../../db/db'
import { pastesTable } from '../../../../db/schema'
import { eq } from 'drizzle-orm'

const Raw = () => {
  return null
}

export const getServerSideProps: GetServerSideProps = async ({
  res,
  params,
  query,
}) => {
  if (res) {
    const [paste] = await db
      .select({
        content: pastesTable.content,
        password: pastesTable.password,
      })
      .from(pastesTable)
      .where(eq(pastesTable.id, params?.id as string))
      .limit(1)
      .execute()

    if (paste?.password) {
      const valid = await verify(
        paste.password,
        (query?.password ?? '') as string,
      )

      if (valid) {
        res.setHeader('Content-Type', 'text/plain; charset="UTF-8"')
        res.write(
          new Cryptr((query?.password ?? '') as string).decrypt(paste.content),
        )
        res.end()
      } else {
        res.statusCode = 401
        res.end()
      }
    } else {
      res.setHeader('Content-Type', 'text/plain; charset="UTF-8"')
      res.write(paste?.content ?? '')
      res.end()
    }
  }
  return {
    props: {},
  }
}

export default Raw
