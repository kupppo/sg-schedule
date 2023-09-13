import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/nextauth'
import Link from 'next/link'
import prisma from 'lib/prisma'
import SuperJSON from 'superjson'
import { Race } from '@prisma/client'

export default function RacesAdminPage({
  races = []
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <div>Races Admin</div>
      {races.length > 0 && races.map((race => {
        return (
          <li key={race.id}>
            <Link href={`/admin/races/${race.id}`}>
              {race.name}
            </Link>
          </li>
        )
      }))}
      <hr />
      <Link href="/admin/races/new">Create Race</Link>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<{
  races: Race[]
}> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const allowedRoles = ['admin', 'editor']
  if (!session) {
    return {
      redirect: {
        destination: '/login?callbackUrl=/admin',
        permanent: false,
      }
    }
  }

  // @ts-ignore
  const role = session?.user?.role
  if (!role) {
    // show denied
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }
  const notAllowed = !allowedRoles.includes(role)
  if (notAllowed) {
    // show denied
    return {
      redirect: {
        destination: '/',
        permanent: false,
      }
    }
  }

  const data = await prisma.race.findMany({})
  const { json } = SuperJSON.serialize(data)
  // @ts-ignore
  const races = json as Race[]
  return {
    props: {
      races,
    }
  }
}
