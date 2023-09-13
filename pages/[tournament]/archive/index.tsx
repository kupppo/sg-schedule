import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { format as formatDateTime, utcToZonedTime } from 'date-fns-tz'
import { Race, Tournament } from '@prisma/client'
import SuperJSON from 'superjson'
import prisma from 'lib/prisma'

const Dash = () => (
  <span className="dash">&mdash;</span>
)

const getLocalRaceTime = (input: any, tz: string) => {
  try {
    const time = input.toString()
    const zonedTime = utcToZonedTime(time, tz)
    return formatDateTime(zonedTime, 'MMM d, yyyy h:mm a')
  } catch (err) {
    return <Dash />
  }
}

export default function TournamentArchivePage({
  tournament,
  races
}: {
  tournament: Tournament,
  races: Race[]
}) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return (
    <div>
      <h1>{tournament.name} Archive</h1>
      <ul>
        {races.map((race) => {
          return (
            <li key={race.id}>
              {race.name}:{' '}
              {getLocalRaceTime(race.scheduledAt, tz)}
            </li>
          )
        })}
      </ul>
    </div>
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
    orderBy: [
      { scheduledAt: 'desc' },
    ]
  })

  const { json: tournament } = SuperJSON.serialize(entry)
  const { json: races } = SuperJSON.serialize(raceEntries)
  return {
    props: {
      tournament,
      races,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tournaments = await prisma.tournament.findMany()
  const paths = tournaments.map(t => ({
    params: {
      tournament: t.shortKey,
      name: t.name,
    }
  }))
  return {
    paths,
    fallback: true,
  }
}

