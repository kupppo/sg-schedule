import { useSession, signIn, signOut } from 'next-auth/react'

export default function AdminPage() {
  const { data: session, status } = useSession()
  return (
    <div>
      {status === 'loading' && (
        <>...</>
      )}
      {status === 'authenticated' && (
        <div>
          Signed In as: {session.user?.name}<br />
          <button onClick={() => signOut()}>
            Sign Out
          </button>
        </div>
      )}
      {status === 'unauthenticated' && (
        <div>
          {/* @ts-ignore */}
          <button onClick={() => signIn('discord', null, { prompt: 'none' })}>
            Sign In
          </button>
        </div>
      )}
    </div>
  )
}
