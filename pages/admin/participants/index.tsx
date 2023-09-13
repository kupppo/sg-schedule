import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/nextauth'
import Link from 'next/link'
import prisma from 'lib/prisma'
import SuperJSON from 'superjson'
import { Participant } from '@prisma/client'

export default function ParticipantsAdminPage({
  participants = []
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <div>Participants Admin</div>
      {participants.length > 0 && participants.map((participant => {
        return (
          <li key={participant.id}>
            <Link href={`/admin/participants/${participant.id}`}>
              {participant.name}
            </Link>
          </li>
        )
      }))}
      <hr />
      <Link href="/admin/participants/new">Create Participant</Link>
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<{
  participants: Participant[]
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

  const data = await prisma.participant.findMany({})
  const { json } = SuperJSON.serialize(data)
  // @ts-ignore
  const participants = json as Participant[]
  return {
    props: {
      participants,
    }
  }
}
