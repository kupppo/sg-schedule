import Layout from 'components/layout'
import { getLocalRaceTime } from 'helpers/race'
import useSWR from 'swr'

const fetcher = (url: string) =>
  fetch(url)
  .then(r => r.json())

export default function ArchivePage() {
  const { data: races } = useSWR('/api/races/archive', fetcher, {
    refreshInterval: 0,
  })
  return (
    <Layout activeHref='/archive'>
      {races && races.map((race, index) => {
        return (
          <div key={`race_${index}`}>
            {race.vod
              ? <a href={race.vod} target="_blank" rel="noopenner noreferrer">
                  {race.name}
                </a>
              : race.name}
            <br />
            {getLocalRaceTime(race.raceTime)}
            <br />
            {`Week ${race.week}`}
            
            <h3>Contributors</h3>
            <ul>
              {/* TODO: Group on roles and order by Comms then Tracking */}
              {race.contributors.map((contributor: any, index: number) => {
                return (
                  <li key={`contributor_${index}`}>
                    <strong>{contributor.role}</strong>: {contributor.name}
                  </li>
                )
              })}
            </ul>

            <h3>Settings</h3>
            <ul>
            {Object.keys(race.settings).map((setting) => (
              <li key={setting}>
                <strong>{setting}</strong>: {race.settings[setting]}
              </li>
            ))}
            </ul>
          </div>
        )
      })}
    </Layout>
  )
}
