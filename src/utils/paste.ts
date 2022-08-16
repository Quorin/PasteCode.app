import { Maybe } from '@trpc/server'
import dayjs from 'dayjs'
import { PrismaClient } from '@prisma/client'

type Expiration =
  | 'same'
  | 'never'
  | 'year'
  | 'month'
  | 'week'
  | 'day'
  | 'hour'
  | '10m'

export const getExpirationDate = (
  input?: Maybe<Expiration>,
  current?: Maybe<Date>,
): Maybe<Date> => {
  switch (input) {
    case 'year':
      return dayjs().add(1, 'year').toDate()
    case 'month':
      return dayjs().add(1, 'month').toDate()
    case 'week':
      return dayjs().add(1, 'week').toDate()
    case 'day':
      return dayjs().add(1, 'day').toDate()
    case 'hour':
      return dayjs().add(1, 'hour').toDate()
    case '10m':
      return dayjs().add(10, 'minute').toDate()
    case 'same':
      return current ?? null
    default:
      return null
  }
}

export const upsertTags = async (
  prisma: PrismaClient,
  inputTags: string[] | undefined,
  pasteId: string,
) => {
  if (inputTags && inputTags.length > 0) {
    await prisma.tag.createMany({
      data:
        inputTags?.map((tag) => ({
          name: tag.toLowerCase(),
        })) || [],
      skipDuplicates: true,
    })

    const tags = await prisma.tag.findMany({
      where: {
        name: { in: inputTags.map((t) => t.toLowerCase()) || [] },
      },
    })

    await prisma.tagsOnPastes.createMany({
      skipDuplicates: true,
      data: tags.map((tag) => ({ pasteId: pasteId, tagId: tag.id })),
    })
  }
}
