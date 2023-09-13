import { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'POST':
      const body = req.body
      const update = await prisma.race.create({
        data: body
      })
      return res.json(update)
    default:
      return res.status(405).end()
  }
}
