import { type NextApiRequest, type NextApiResponse } from 'next'
import { renderTrpcPanel } from 'trpc-panel'

import { getBaseUrl } from '../_app'
import { appRouter } from '../../server/router'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  if (process.env.NODE_ENV !== 'development') {
    return res.redirect('/404')
  }

  res.status(200).send(
    renderTrpcPanel(appRouter, {
      url: `${getBaseUrl()}/api/trpc`,
      transformer: 'superjson',
    }),
  )
}
