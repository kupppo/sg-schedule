import { isAfter, parseISO } from 'date-fns'
import { format as formatDateTime, utcToZonedTime } from 'date-fns-tz'

export type Settings = {
  area: 'full' | 'light' | 'vanilla'
  boss: 'random' | 'vanilla'
  items: 'random' | 'major/minor' | 'full'
  morph: 'random' | 'late' | 'early'
  start: 'random' | 'deep' | 'shallow' | 'vanilla'
}

export const getLocalRaceTime = (time: string) => {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
    const zonedTime = utcToZonedTime(time, tz)
    return formatDateTime(zonedTime, 'MMM d, h:mm a')
  } catch (err) {
    return null
  }
}

export const getLiveStatus = (time: string) => {
  try {
    const now = new Date()
    return isAfter(now, parseISO(time))
  } catch (err) {
    return false
  }
}

