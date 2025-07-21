import { redirect } from 'next/navigation'
import { getPaste } from '@/actions/get-paste'
import { safe } from '@orpc/client'

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const password = new URL(request.url).searchParams.get('password')
  const { error, data } = await safe(
    getPaste({ id: (await context.params).id, password }),
  )

  if (error) return
  const { paste, secure } = data

  if (!paste) redirect('/not-found')
  if (secure) redirect('/unauthorized')

  return new Response(paste.content)
}
