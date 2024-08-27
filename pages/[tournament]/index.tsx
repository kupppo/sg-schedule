import Link from 'next/link'
import { fetchCurrentRaces, getTitle, Race } from 'lib/sg'
import { isAfter, parseISO } from 'date-fns'
import { format as formatDateTime, utcToZonedTime } from 'date-fns-tz'
import { Inter } from 'next/font/google'
import getNow from 'helpers/now'
import useSWR from 'swr'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { useRouter } from 'next/router'
import prisma from 'lib/prisma'
import Head from 'next/head'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export type TournamentPageProps = {
  initialRaces: Race[]
  tournament: string
  name: string
}

const getLocalRaceTime = (time: string, tz: string) => {
  try {
    const zonedTime = utcToZonedTime(time, tz)
    return formatDateTime(zonedTime, 'MMM d, h:mm a')
  } catch (err) {
    return <Dash />
  }
}

const getLiveStatus = (time: string) => {
  try {
    const now = getNow()
    return isAfter(now, parseISO(time))
  } catch (err) {
    return false
  }
}

const Dash = () => (
  <span className="dash">&mdash;</span>
)

const Label = (props: React.PropsWithChildren) => {
  return (
    <span className="mobile-label">{props.children}</span>
  )
}

const Live = () => {
  return (
    <span className="live">Live</span>
  )
}

const fetcher = (url: string) =>
  fetch(url)
  .then(r => r.json())

export default function TournamentPage({
  initialRaces = [],
  tournament,
  name,
}: TournamentPageProps) {
  const router = useRouter()
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  const { data: races } = useSWR(tournament ? `/api/${tournament}/races` : null, fetcher, {
    fallbackData: initialRaces,
    refreshInterval: 30000,
    revalidateOnMount: true,
  })

  if (router.isFallback) {
    return <p>Loading...</p>
  }

  return (
    <main className={`container ${inter.className}`}>
      <Head>
        <title>{`${name} - SG Schedule`}</title>
      </Head>
      <h1>{name}</h1>
      {races.length ? (
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th className="heading_live"><span>Live</span></th>
              <th>Players</th>
              <th>Channel</th>
              <th>Commentary</th>
              <th>Tracking</th>
            </tr>
          </thead>
          <tbody>
            {races?.map((race: Race, i: number) => {
              // @ts-ignore
              const time = getLocalRaceTime(race.datetime, tz)
              // @ts-ignore
              const live = getLiveStatus(race.datetime)
              return (
                <tr key={i}>
                  <td className="column_time">
                    <div className="column-inner">
                      <Label>Time</Label>
                      {time}
                    </div>
                  </td>
                  <td className="column_live">
                    <div className="column-inner">
                      {live && <Live />}
                    </div>
                  </td>
                  <td className="column_players">
                    <Label>Players</Label>
                    {race.runners?.join(' vs ')}
                  </td>
                  <td className="column_channel">
                    <Label>Channel</Label>
                    {race.channel ? (
                    <a href={race.channel.url} target="_blank" rel="noopenner noreferrer">
                      {race.channel.name}
                    </a>
                    ) : <Dash />}
                  </td>
                  <td className="column_commentary">
                    <Label>Commentary</Label>
                    {race.commentary?.join(', ') || <Dash />}
                  </td>
                  <td className="column_tracking">
                    <Label>Tracking</Label>
                    {race.tracking?.join(', ') || <Dash />}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      ) : (
        <p>No races scheduled at this time.</p>
      )}
      <footer style={{ borderTop: '1px solid #333', marginTop: '2em', paddingTop: '2em' }}>
        {/* If the races table exists, add extra margin for consistent spacing */}
        <p style={{ marginTop: races.length ? '1em' : '0' }}>
          <Link href="/">View other tournaments</Link>
        </p>
      </footer>
    </main>
  )
}

interface TournamentParams extends ParsedUrlQuery {
  tournament: string;
}

export const getStaticProps: GetStaticProps = async (context: GetStaticPropsContext) => {
  try {
    const { tournament } = context.params as TournamentParams
    const races: Race[] = await fetchCurrentRaces(tournament as string)

    const entry = await prisma.tournament.findUnique({
      where: {
        shortKey: tournament
      }
    })

    if (entry && !entry?.active) {
      return {
        redirect: {
          destination: `/${tournament}/archive`,
          permanent: true,
        }
      }
    }

    let name = entry?.name
    if (!name) {
      // @ts-ignore
      name = await getTitle(tournament as string)
    }
    const props = {
      initialRaces: races,
      tournament,
      name,
    }

    return {
      props,
      revalidate: 10,
    }
  } catch (err) {
    return {
      notFound: true
    }
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  const tournaments = await prisma.tournament.findMany({
    where: {
      active: true,
    }
  })
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