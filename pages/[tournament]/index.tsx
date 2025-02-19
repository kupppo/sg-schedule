import Link from 'next/link'
import { fetchCurrentRaces, fetchTournament, getTitle, Race } from 'lib/sg'
import { isAfter, parseISO } from 'date-fns'
import { format as formatDateTime, utcToZonedTime } from 'date-fns-tz'
import { Inter } from 'next/font/google'
import getNow from 'helpers/now'
import useSWR from 'swr'
import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { useRouter } from 'next/router'
import Head from 'next/head'
import now from 'helpers/now'

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
  const tzDisplay = now().toLocaleString('en-US', { timeZoneName: 'short' }).split(' ').pop()
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
              <th>Time <span style={{ display: 'inline-block', marginLeft: '4px', fontSize: '12px', letterSpacing: '0.3px', color: 'var(--color-mid)' }}>{`(${tzDisplay})`}</span></th>
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
                      <Label>Time <span style={{ display: 'inline-block', marginLeft: '2px', fontSize: '10px', letterSpacing: '0.3px', color: 'var(--color-mid)' }}>{`(${tzDisplay})`}</span></Label>
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
                    {race.title && (
                      <div className="episode_title">{race.title}</div>
                    )}
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

    const entry = await fetchTournament(tournament as string)

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
  // const tournaments = await prisma.tournament.findMany({
  //   where: {
  //     active: true,
  //   }
  // })
  // const paths = tournaments.map(t => ({
  //   params: {
  //     tournament: t.slug,
  //     name: t.name,
  //   }
  // }))
  const paths:any[] = []

  return {
    paths,
    fallback: true,
  }
}