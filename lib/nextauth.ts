import DiscordProvider from 'next-auth/providers/discord'
import type { NextAuthOptions } from 'next-auth'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const authOptions: NextAuthOptions = {
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      profile(profile) {
        return { ...profile }
      },
      authorization: {
        params: {
          scope: 'identify'
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user }: { session: any, user: any }) {
      session.user.role = user.role
      return Promise.resolve(session)
    }
  }
}
