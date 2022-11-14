import * as Cheerio from 'cheerio'
import { parse as parseDateTime } from 'date-fns'
import { zonedTimeToUtc } from 'date-fns-tz'
import MOCKS from 'data/mock-schedule.json'

function cleanText(input: string) {
  return input.replace(/(\n|\t)+/g, '').trim()
}

function parseCellContents (
  contents: Cheerio.Element,
  type: string
): string | string[] | Date | TwitchChannel | null {
  switch (type) {
    case 'datetime':
      const value = cleanText(Cheerio.load(contents).text())
        .replace(/\u00A0/g, ' ')
        .trim()
      const origin = parseDateTime(
        value,
        'EEE MMM dd, hh:mm a',
        new Date()
      )
      const time = zonedTimeToUtc(origin, 'America/New_York')
      return time.toISOString()
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

export const fetchCurrentRaces: any = async () => {
  const useMocks = process.env.USE_MOCKS
  if (useMocks) {
    return MOCKS
  }

  const races: Race[] = []
  const HEADINGS = ['datetime', 'runners', 'channel', 'commentary', 'tracking']
  const url = new URL('https://schedule.speedgaming.org/choozo/')
  const res = await fetch(url.href)
  const page = Cheerio.load(await res.text())
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
      races.push(race)
    }
  })
  return races
}
