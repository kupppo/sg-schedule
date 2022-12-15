import { shouldMock } from 'helpers/mocks'
import MOCK from 'data/mock-race.json'
  
export const fetchRace = async (id: string) => {
  if (shouldMock()) {
    return MOCK
  }
  
  return {}
}
