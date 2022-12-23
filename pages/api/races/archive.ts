import { fetchRaces } from 'lib/db'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const races = await fetchRaces()
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate')
  return res.json(races)
}
