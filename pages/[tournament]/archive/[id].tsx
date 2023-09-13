import { GetStaticPaths, GetStaticProps, GetStaticPropsContext } from 'next'
import { ParsedUrlQuery } from 'querystring'
import { format as formatDateTime, utcToZonedTime } from 'date-fns-tz'
import { Inter } from 'next/font/google'
import { RaceParticipants, Tournament, VideoLink } from '@prisma/client'
import SuperJSON from 'superjson'
import prisma from 'lib/prisma'
import { useRouter } from 'next/router'
import { Twitch as TwitchEmbed } from 'components/embed'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap'
})

const Dash = () => (
  <span className="dash">&mdash;</span>
)

const Label = (props: React.PropsWithChildren) => {
  return (
    <span className="mobile-label">{props.children}</span>
  )
}

const getLocalRaceTime = (input: any, tz: string) => {
  try {
    const time = input.toString()
    const zonedTime = utcToZonedTime(time, tz)
    return formatDateTime(zonedTime, 'MMM d, yyyy h:mm a')
  } catch (err) {
    return <Dash />
  }
}

type Race = {
  id: number
  name: string
  scheduledAt: Date
  runners: string[]
  commentary: string[]
  tracking: string
  vods?: { provider: string, url: string }[]
}

export default function TournamentArchivePage({
  tournament,
  race
}: {
  tournament: Tournament,
  race: Race
}) {
  const router = useRouter()
  // const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
  if (router.isFallback) {
    return <div>Loading...</div>
  }
  return (
    <main className={`container ${inter.className}`}>
      <h1>{race.name}</h1>
      {/* @ts-ignore */}
      <TwitchEmbed url={race?.vods[0].url} />
    </main>
  )
}

interface RaceParams extends ParsedUrlQuery {
  tournament: string;
  id: string;
}

export const getStaticProps: GetStaticProps = async (context: GetStaticPropsContext) => {
  const { tournament: tournamentSlug, id } = context.params as RaceParams
  const entry = await prisma.tournament.findUnique({
    where: {
      shortKey: tournamentSlug
    }
  })
  if (!entry) {
    return { notFound: true }
  }

  const raceEntry = await prisma.race.findUnique({
    where: {
      id: Number(id)
    },
    include: {
      participants: {
        include: {
          participant: true
        }
      },
      videos: true
    }
  })

  const { json: tournament } = SuperJSON.serialize(entry)
  const { json: raceData } = SuperJSON.serialize(raceEntry)

  // @ts-ignore
  const parseRace = (race) => {
    const { id, name, scheduledAt } = race
    const participants = race.participants
    const runners = participants
      .filter((p: RaceParticipants) => p.role === 'runner')
      // @ts-ignore
      .map((p: RaceParticipants) => p.participant.name)
    const commentary = participants
      .filter((p: RaceParticipants) => p.role === 'commentary')
      // @ts-ignore
      .map((p: RaceParticipants) => p.participant.name)
    const tracking = participants
      .filter((p: RaceParticipants) => p.role === 'tracking')
      // @ts-ignore
      .map((p: RaceParticipants) => p.participant.name)
    const vods = race.videos.map((v: VideoLink) => ({ provider: v.provider, url: v.url }))
    return {
      id,
      name,
      scheduledAt,
      runners,
      commentary,
      tracking,
      vods,
    }
  }

  const race = parseRace(raceData)

  return {
    props: {
      tournament,
      race,
    },
  }
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: true,
  }
}

