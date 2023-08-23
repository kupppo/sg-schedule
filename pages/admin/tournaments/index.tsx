import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import Link from 'next/link'
import prisma from 'lib/prisma'
import SuperJSON from 'superjson'
import { Tournament } from '@prisma/client'

export default function TournamentsAdminPage({
  tournaments = []
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <div>Tournaments Admin</div>
      {tournaments.length > 0 && tournaments.map((tournament => {
        return (
          <li key={tournament.id}>
            <Link href={`/admin/tournaments/${tournament.id}`}>
              {tournament.name}
            </Link>
          </li>
        )
      }))}
      <hr />
      <Link href="/admin/tournaments/new">Create Tournament</Link>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<{
  tournaments: Tournament[]
}> = async () => {
  const data = await prisma.tournament.findMany({})
  const { json } = SuperJSON.serialize(data)
  // @ts-ignore
  const tournaments = json as Tournament[]
  return {
    props: {
      tournaments,
    }
  }
}
