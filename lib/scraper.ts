import * as Cheerio from 'cheerio'
import getNow from 'helpers/now'
import { parse as parseDateTime } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'

function cleanText(input: string) {
  return input.replace(/(\n|\t)+/g, '').trim()
}

function isNextYear(now: Date, origin: Date) {
  const prevMonth = now.getMonth() > origin.getMonth()
  if (!prevMonth) {
    return false
  }

  return true
}

function parseCellContents (
  contents: Cheerio.Element,
  type: string
): string | string[] | Date | TwitchChannel | null {
  switch (type) {
    case 'datetime':
      try {
        const value = cleanText(Cheerio.load(contents).text())
          .replace(/\u00A0/g, ' ')
          .trim()
        const now = getNow()
        const origin = parseDateTime(
          value,
          'EEE MMM dd, hh:mm a',
          now
        )
        const time = zonedTimeToUtc(origin, 'America/New_York')
        const nextYear = isNextYear(now, origin)
        if (nextYear) {
          time.setFullYear(time.getFullYear() + 1)
        }
        return time.toISOString()
      } catch (err:unknown) {
        const error = err as Error
        console.error(error)
        return null
      }
    case 'channel':
      // const text = cleanText(Cheerio.load(contents).text())
      // const channelName = 
      // if (text === '?') {
      //   return null
      // }
      const linkEl = Cheerio.load(contents)('a')
      if (linkEl.length === 0) {
        return null
      }
      const url = linkEl.attr('href')
      const name = cleanText(linkEl.text())
      return { name, url } as TwitchChannel
    case 'runners':
      return cleanText(Cheerio.load(contents).text()).split(' vs ')
    case 'commentary':
    case 'tracking':
      return cleanText(Cheerio.load(contents).text())
        .split(', ')
        .map((commentator) => commentator.trim())
        .filter((commentator) => commentator.length)
    default:
      return null
  }
}

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

export const fetchCurrentRaces: any = async (tournament: string) => {
  const races: Race[] = []
  const HEADINGS = ['datetime', 'runners', 'channel', 'commentary', 'tracking']
  const page = await getPage(tournament)
  page('table tbody tr').each((rowIndex, rowEl) => {
    if (rowIndex !== 0) {
      const row = page(rowEl)
      const race = Object.fromEntries(HEADINGS.map((heading) => [heading, null])) as Race
      row.children('td').each((index, cell: Cheerio.Element) => {
        const type = HEADINGS[index] as keyof Race
        const content = parseCellContents(cell, type)
        // @ts-ignore
        race[type] = content
      })
      if (race.runners !== null && race.datetime !== null) {
        races.push(race)
      }
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
