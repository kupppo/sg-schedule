import { fetchCurrentRaces, Race } from 'lib/scraper'
import { format as formatDateTime, utcToZonedTime } from 'date-fns-tz'
import { Inter } from '@next/font/google'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

export type HomeProps = {
  races: Race[]
}

const getLocalRaceTime = (time: string, tz: string) => {
  try {
    const zonedTime = utcToZonedTime(time, tz)
    return formatDateTime(zonedTime, 'MMM d, h:mm a')
  } catch (err) {
    return <Dash />
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

export default function Home({ races = [] }: HomeProps) {
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  return (
    <main className={`container ${inter.className}`}>
      <h1>Super Metroid Choozo Randomizer<br />2022 Schedule</h1>
      <table>
        <thead>
          <tr>
            <th>Time</th>
            <th>Players</th>
            <th>Channel</th>
            <th>Commentary</th>
            <th>Tracking</th>
          </tr>
        </thead>
        <tbody>
          {races.map((race, i) => {
            // @ts-ignore
            const time = getLocalRaceTime(race.datetime, tz)
            return (
              <tr key={i}>
                <td className="column_time">
                  <Label>Time</Label>
                  {time}
                </td>
                <td className="column_players">
                  <Label>Players</Label>
                  {race.runners?.join(' vs ')}
                </td>
                <td className="column_channel">
                  <Label>Channel</Label>
                  {race.channel ? (
                  <a href={race.channel.url}>{race.channel.name}</a>
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
    </main>
  )
}

export async function getStaticProps() {
  const races:Promise<Race[]> = await fetchCurrentRaces()
  return {
    props: {
      races,
    },
    revalidate: 1,
  }
}
