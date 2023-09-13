import { RaceParticipants } from "@prisma/client"

export const getParticipantsByRole = (list: any[], role: string) => {
  try {
    const participants = list.filter((p: RaceParticipants) => p.role === role)
    console.log(`participants:${role}`, participants.length)
    // @ts-ignore
    return participants.map((p: RaceParticipants) => p.participant.name)
  } catch (err: unknown) {
    const error = err as Error
    console.error(error)
    return role === 'tracker' ? null : []
  }
}
