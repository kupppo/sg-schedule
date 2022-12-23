import { fetchCurrentRaces, UpcomingRace } from 'lib/scraper'
import Dash from 'components/dash'
import { getLocalRaceTime, getLiveStatus } from 'helpers/race'
import Layout from 'components/layout'
import useSWR from 'swr'

export type HomeProps = {
  initialRaces: UpcomingRace[]
}

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

export default function Home({ initialRaces = [] }: HomeProps) {
  const { data: races } = useSWR('/api/races', fetcher, {
    fallbackData: initialRaces,
    refreshInterval: 30000,
    revalidateOnMount: true,
  })

  return (
    <Layout>
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
          {races?.map((race: UpcomingRace, i: number) => {
            // @ts-ignore
            const time = getLocalRaceTime(race.datetime)
            // @ts-ignore
            const live = getLiveStatus(race.datetime)
            return (
              <tr key={i}>
                <td className="column_time">
                  <div className="column-inner">
                    <Label>Time</Label>
                    {time || <Dash />}
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
    </Layout>
  )
}

export async function getStaticProps() {
  const races:Promise<UpcomingRace[]> = await fetchCurrentRaces()
  return {
    props: {
      initialRaces: races,
    },
    revalidate: 10,
  }
}
