import { redirect } from 'next/navigation'
import { getPaste } from '@/actions/get-paste'

export async function GET(
  request: Request,
  context: { params: { id: string } },
) {
  const password = new URL(request.url).searchParams.get('password')
  const { paste, secure } = await getPaste(context.params.id, password)

  if (!paste) {
    redirect('/not-found')
  }

  if (secure) {
    redirect('/unauthorized')
  }

  return new Response(paste.content)
}
