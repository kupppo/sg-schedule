import type { InferGetServerSidePropsType, GetServerSideProps } from 'next'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/nextauth'
import Link from 'next/link'
import prisma from 'lib/prisma'
import SuperJSON from 'superjson'
import { User } from '@prisma/client'

export default function UsersAdminPage({
  users = []
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  return (
    <div>
      <div>Users Admin</div>
      {users.length > 0 && users.map((user => {
        return (
          <li key={user.id}>
            <Link href={`/admin/users/${user.id}`}>
              {user.name}
            </Link>
            {' '}
            <span style={{ color: '#777' }}>({user.role})</span>
          </li>
        )
      }))}
    </div>
  )
}

export const getServerSideProps: GetServerSideProps<{
  users: User[]
}> = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions)
  const allowedRoles = ['admin']
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

  const data = await prisma.user.findMany({})
  const { json } = SuperJSON.serialize(data)
  // @ts-ignore
  const users = json as User[]
  return {
    props: {
      users,
    }
  }
}
