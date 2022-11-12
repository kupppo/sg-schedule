import { NextApiRequest, NextApiResponse } from 'next'
import { verifySignature } from '@upstash/qstash/nextjs'

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await res.revalidate('/')
      res.status(200).end()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error'
      res.status(500).json({ statusCode: 500, message })
    }
  } else {
    res.setHeader('Allow', 'POST')
    res.status(405).end('Method Not Allowed')
  }
}

export default verifySignature(handler)

export const config = {
  api: {
    bodyParser: false,
  },
}