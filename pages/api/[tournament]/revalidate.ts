import { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method not allowed' })
    }
    const revalidatedPath = `/${req.query.tournament}/archive`
    console.log(revalidatedPath)
    await res.revalidate(revalidatedPath)
    return res.json({ revalidated: revalidatedPath })
  } catch (err: unknown) {
    const error = err as Error
    return res.status(500).json({ error: error.message })
  }
}
