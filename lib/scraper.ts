import * as Cheerio from 'cheerio'
import getNow from 'helpers/now'

async function getPage(tournament: string) {
  const url = new URL(`https://schedule.speedgaming.org/${tournament}/`)
  const res = await fetch(url.href)
  if (!res.ok) {
    throw Error(`Get Page /${tournament} ${res.status} ${res.statusText}`)
  }
  const page = Cheerio.load(await res.text())
  return page
}

export type Race = {
  runners?: string[] | null
  datetime?: string | null
  channel?: TwitchChannel | null
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
  to.setDate(to.getDate() + 7)
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
      commentary: race.commentators.map((commentator: any) => commentator.displayName),
      tracking: race.trackers.map((tracker: any) => tracker.displayName)
    }
  })
  return races
}

export const getTitle = async (tournament: string):Promise<string|null> => {
  try {
    const page = await getPage(tournament)
    const title = page('h1').text().trim()
    return title
  } catch (err: unknown) {
    const error = err as Error
    console.error(error)
    return null
  }
}
