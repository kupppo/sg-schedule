import { NextApiRequest, NextApiResponse } from 'next'
import { fetchRaces } from 'lib/sg'
import getNow from 'helpers/now'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { tournament, from, to } = req.query
  const now = getNow()
  const defaultStart = new Date(now)
  defaultStart.setDate(defaultStart.getDate() + 30)
  const fetchOpts = {
    tournament: tournament as string,
  }
  if (!to && !from) {
    // @ts-ignore
    fetchOpts.to = defaultStart
  }
  if (from) {
    // @ts-ignore
    fetchOpts.from = new Date(from as string)
  }
  if (to) {
    // @ts-ignore
    fetchOpts.to = new Date(to as string)
  }
  const races = await fetchRaces(fetchOpts)
  const sortedRaces = races.sort((a, b) => {
    if (a.datetime && !b.datetime) {
      return 1
    }
    if (!a.datetime && b.datetime) {
      return -1
    }
    const timeA = new Date(a.datetime!)
    const timeB = new Date(b.datetime!)
    if (timeA < timeB) {
      return 1
    }
    if (timeA > timeB) {
      return -1
    }
    return 0
  })

  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate')
  res.json({ races: sortedRaces })
}

export const config = {
  api: {
    bodyParser: false,
  },
}
