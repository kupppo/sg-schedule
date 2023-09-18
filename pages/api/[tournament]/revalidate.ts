import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
    const tournament = req.query.tournament as string
    const { races } = req.body

    const revalidatedBase = `/${tournament}/archive`
    const updateRaces = races.map(async (raceId: number) => {
      const path = `${revalidatedBase}/${raceId}`
      await res.revalidate(path)
      return path
    })
    const revalidatedPaths = await Promise.all(updateRaces)
    await res.revalidate(revalidatedBase)
    revalidatedPaths.push(revalidatedBase)
    return res.json({ revalidated: revalidatedPaths })
  } catch (err: unknown) {
    const error = err as Error
    return res.status(500).json({ error: error.message })
  }
}
