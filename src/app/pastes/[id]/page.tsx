import { getPaste } from '../../_actions/get-paste'
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import Code from '../../_components/Code'

const PasteIndex = async ({ params: { id } }: { params: { id: string } }) => {
  const { paste } = await getPaste(id)

  if (!paste) {
    return redirect('/404')
  }

  return (
    <div>
      <h1>{paste.title}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <Code id={paste.id} code={paste.content} style={paste.style} />
      </Suspense>
    </div>
  )
}

export default PasteIndex
