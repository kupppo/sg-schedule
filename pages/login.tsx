import { useSession, signIn, signOut } from 'next-auth/react'
import { useRouter } from 'next/router'

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  return (
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
  )
}
