import { fetchRace } from 'lib/db'
import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const id = req.query.id as string
  if (!id) {
    return res.status(404).end()
  }
  const race = await fetchRace(id)
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate')
  return res.json(race)
}
