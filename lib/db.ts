import { shouldMock } from 'helpers/mocks'
import MOCK_RACE from 'data/mock-race.json'
import MOCK_ARCHIVE from 'data/mock-archive.json'
  
export const fetchRace = async (id: string) => {
  if (shouldMock()) {
    return MOCK_RACE
  }

  return {}
}

export const fetchRaces = async () => {
  if (shouldMock()) {
    return MOCK_ARCHIVE
  }

  return [{}]
}
