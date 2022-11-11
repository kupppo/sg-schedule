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

const getRaceTime = (time: string, tz: string) => {
  try {
    return formatDateTime(utcToZonedTime(time, tz), 'MMM d, h:mm a')
  } catch (err) {
    return '-'
  }
}

const Dash = () => (
  <span className="dash">&mdash;</span>
)

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
            const time = getRaceTime(race.datetime, tz)
            return (
              <tr key={i}>
                <td>
                  <span className="mobile-label">Time</span>
                  {time}
                </td>
                <td>
                  <span className="mobile-label">Players</span>
                  {race.runners?.join(' vs ')}
                </td>
                <td>
                  <span className="mobile-label">Channel</span>
                  {race.channel ? (
                  <a href={race.channel.url}>{race.channel.name}</a>
                  ) : <Dash />}
                </td>
                <td>
                  <span className="mobile-label">Commentary</span>
                  {race.commentary?.join(', ') || <Dash />}
                </td>
                <td>
                  <span className="mobile-label">Tracking</span>
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
