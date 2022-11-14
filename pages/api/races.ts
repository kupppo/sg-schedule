import { NextApiRequest, NextApiResponse } from 'next'
import { fetchCurrentRaces } from 'lib/scraper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const races = await fetchCurrentRaces()
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate')
  res.json(races)
}

export const config = {
  api: {
    bodyParser: false,
  },
}

