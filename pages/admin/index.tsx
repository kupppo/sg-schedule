import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'
import { getServerSession } from 'next-auth/next'
import { authOptions } from 'lib/nextauth'
import SuperJSON from 'superjson'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  return (
    <div>
      admin page
      <div>
        {status === 'loading' && (
          <>...</>
        )}
        {status === 'authenticated' && (
          <div>
            Signed In as: {session.user?.name}<br />
            <button onClick={() => signOut({ callbackUrl: '/' })}>
              Sign Out
            </button>
          </div>
        )}
        {status === 'unauthenticated' && (
          <div>
            {/* @ts-ignore */}
            <button onClick={() => {
              const callbackUrl = router.query.callbackUrl as string ?? '/admin'
              signIn('discord', { callbackUrl }, { prompt: 'none' })
            }}>
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export const getServerSideProps = async (context: any) => {
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

  const { json } = SuperJSON.serialize(session)
  return {
    props: {
      session: json
    }
  }
}