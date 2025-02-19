import type { GetStaticProps } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import Head from 'next/head'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

type Tournament = {
  slug: string
  name: string
}

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
            <li key={tournament.slug} style={{ margin: '1em 0'}}>
              <Link href={`/${tournament.slug}`}>{tournament.name}</Link>
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
  const tournaments: any[] = [
    {
      slug: 'smz3_2025',
      name: 'Super Metroid + A Link To The Past Randomizer Tournament 2025',
    },
  ]
  return {
    props: {
      tournaments,
    },
    revalidate: 60,
  }
}
