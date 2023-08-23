import type { GetStaticProps } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import tournamentData from 'data/tournaments.json'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

type Tournament = {
  key: string
  title: string
  secondary: string
  active: boolean
}

export default function Homepage({ tournaments = [] }: { tournaments: Tournament[] }) {
  return (
    <main className={`container ${inter.className}`}>
      <h1>Speedgaming Schedule</h1>
      {tournaments.length > 0 ? (
        <ul style={{ listStyle: 'none outside none', margin: 0, padding: 0 }}>
          {tournaments.map((tournament) => (
            <li key={tournament.key} style={{ margin: '1em 0'}}>
              <Link href={`/${tournament.key}`}>{tournament.title}</Link>
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
  const tournaments = tournamentData.sort((a, b) => Number(b.active) - Number(a.active))
  return {
    props: {
      tournaments,
    }
  }
}
