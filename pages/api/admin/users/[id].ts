import { NextApiRequest, NextApiResponse } from 'next'
import prisma from 'lib/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
    case 'PUT':
      const id = req.query.id as string
      const body = req.body
      const update = await prisma.user.update({
        where: {
          id,
        },
        data: body
      })
      return res.json(update)
    default:
      return res.status(405).end()
  }
}
