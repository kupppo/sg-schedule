import prisma from 'lib/prisma'
import type { GetStaticProps } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import SuperJSON from 'superjson'
import { Tournament } from '@prisma/client'
import Head from 'next/head'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export default function Homepage({ tournaments = [] }: { tournaments: Tournament[] }) {
  return (
    <main className={`container ${inter.className}`}>
      <Head>
        <title>SG Schedule</title>
      </Head>
      <h1>Speedgaming Schedule</h1>
      {tournaments.length > 0 ? (
        <ul style={{ listStyle: 'none outside none', margin: 0, padding: 0 }}>
          {tournaments.map((tournament) => (
            <li key={tournament.shortKey} style={{ margin: '1em 0'}}>
              <Link href={`/${tournament.shortKey}`}>{tournament.name}</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>No tournaments found.</p>
      )}
    </main>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const data = await prisma.tournament.findMany({
    orderBy: [
      {
        active: 'desc',
      },
      {
        name: 'asc',
      }
    ],
  })
  const { json } = SuperJSON.serialize(data)
  // @ts-ignore
  const tournaments = json as Tournament[]
  return {
    props: {
      tournaments,
    },
    revalidate: 60,
  }
}
