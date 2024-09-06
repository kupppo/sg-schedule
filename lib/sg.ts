import getNow from 'helpers/now'

export type Race = {
  runners?: string[] | null
  datetime?: string | null
  channel?: TwitchChannel | null
  title: string | null
  commentary?: string[] | null
  tracking?: string[] | null
}

export type TwitchChannel = {
  name: string
  url: string
}

const getChannel = (channels: any[]) => {
  try {
    const channel = channels[0]
    if (!channel) {
      return null
    }

    return {
      name: channel.name,
      url: `https://twitch.tv/${channel.slug}`
    }
  } catch (err: unknown) {
    const error = err as Error
    console.error(error)
    return null
  }
}

export const fetchCurrentRaces = async (tournament: string) => {
  const to = getNow()
  to.setDate(to.getDate() + 30)
  const scheduleUrl = new URL('https://speedgaming.org/api/schedule')
  scheduleUrl.searchParams.set('event', tournament)
  scheduleUrl.searchParams.set('to', to.toISOString())
  const res = await fetch(scheduleUrl.toString())
  if (!res.ok) {
    throw Error(`Get Schedule ${res.status} ${res.statusText}`)
  }
  const schedule = await res.json()
  const races: Race[] = schedule.filter((race: any) => race.approved).map((race: any) => {
    const runners: string[] = race.match1.players.map((player: any) => player.displayName)
    const channel = getChannel(race.channels)
    return {
      channel,
      datetime: race.when,
      runners,
      title: race.match1.title,
      commentary: race.commentators.filter((commentator: any) => commentator.approved).map((commentator: any) => commentator.displayName),
      tracking: race.trackers.filter((tracker: any) => tracker.approved).map((tracker: any) => tracker.displayName)
    }
  })
  return races
}

export const getTitle = async (tournament: string):Promise<string|null> => {
  try {
    const url = new URL('https://speedgaming.org/api/event/')
    url.searchParams.set('slug', tournament)
    const data = await fetch(url.toString())
    if (!data.ok) {
      throw Error(`Get Title ${data.status} ${data.statusText}`)
    }
    const json = await data.json()
    const title = json[0].name
    return title
  } catch (err: unknown) {
    const error = err as Error
    console.error(error)
    return null
  }
}
