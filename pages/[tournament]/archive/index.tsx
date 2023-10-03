import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { format as formatDateTime, utcToZonedTime } from 'date-fns-tz'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import { Tournament } from '@prisma/client'
import SuperJSON from 'superjson'
import prisma from 'lib/prisma'
import { getParticipantsByRole } from 'helpers/participants'
import { useRouter } from 'next/router'
import Head from 'next/head'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

const Dash = () => (
  <span className="dash">&mdash;</span>
)

const Label = (props: React.PropsWithChildren) => {
  return (
    <span className="mobile-label">{props.children}</span>
  )
}

const getLocalRaceTime = (input: any, tz: string) => {
  try {
    const time = input.toString()
    const zonedTime = utcToZonedTime(time, tz)
    return formatDateTime(zonedTime, 'MMM d, yyyy h:mm a')
  } catch (err) {
    return <Dash />
  }
}

type Race = {
  id: number
  name: string
  scheduledAt: Date
  runners: string[]
  commentary: string[]
  tracking: string
}

export default function TournamentArchivePage({
  tournament,
  races
}: {
  tournament: Tournament,
  races: Race[]
}) {
  const router = useRouter()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (router.isFallback) {
    return <div>Loading...</div>
  }
  return (
    <main className={`container ${inter.className}`}>
      <Head>
        <title>{tournament.name} - SG Schedule</title>
      </Head>
      <h1>{tournament.name} Archive</h1>
      {races.length > 0 ? (
        <table>
          <thead>
            <tr>
              <th>Race</th>
              <th>Commentary</th>
              <th>Tracking</th>
              <th>Time</th>
            </tr>
          </thead>
          <tbody>
            {races.map((race) => {
              const scheduledAt = getLocalRaceTime(race.scheduledAt, tz)
              return (
                <tr key={race.id}>
                  <td className="column_players">
                    <Label>Runners</Label>
                    <Link href={`/${tournament.shortKey}/archive/${race.id}`}>{race.name}</Link>
                  </td>
                  <td className="column_commentary">
                    <Label>Commentary</Label>
                    {race.commentary.join(', ') || <Dash />}
                  </td>
                  <td className="column_tracking">
                    <Label>Tracking</Label>
                    {race.tracking || <Dash />}
                  </td>
                  <td className="column_time">
                    <div className="column-inner">
                      <Label>Time</Label>
                      {scheduledAt}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p>No races found in archive</p>
      )}
    </main>
  )
}

interface TournamentParams extends ParsedUrlQuery {
  tournament: string;
}

export const getStaticProps: GetStaticProps = async (context: GetStaticPropsContext) => {
  const { tournament: tournamentSlug } = context.params as TournamentParams
  const entry = await prisma.tournament.findUnique({
    where: {
      shortKey: tournamentSlug
    }
  })
  if (!entry) {
    return { notFound: true }
  }

  const raceEntries = await prisma.race.findMany({
    where: {
      tournamentId: entry.id,
    },
    include: {
      participants: {
        include: {
          participant: true
        }
      },
    },
    orderBy: [
      { scheduledAt: 'desc' },
    ]
  })

  const { json: tournament } = SuperJSON.serialize(entry)
  const { json: raceData } = SuperJSON.serialize(raceEntries)
  // @ts-ignore
  const races = raceData.map((race) => {
    const { id, name, scheduledAt } = race
    const participants = race.participants
    const runners = getParticipantsByRole(participants, 'runner')
    const commentary = getParticipantsByRole(participants, 'commentary')
    const tracking = getParticipantsByRole(participants, 'tracking')
    return {
      id,
      name,
      scheduledAt,
      runners,
      commentary,
      tracking
    }
  })

  return {
    props: {
      tournament,
      races,
    },
    revalidate: 3600,
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tournaments = await prisma.tournament.findMany()
  const paths = tournaments.map(t => ({
    params: {
      tournament: t.shortKey,
    },
  }))
  return {
    paths,
    fallback: true,
  }
}

