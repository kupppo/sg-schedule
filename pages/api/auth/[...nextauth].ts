import NextAuth from 'next-auth'
import DiscordProvider from 'next-auth/providers/discord'

export const authOptions = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID as string,
      clientSecret: process.env.DISCORD_CLIENT_SECRET as string,
      authorization: {
        params: {
          scope: 'identify'
        }
      }
    })
  ],
  callbacks: {
    async session({ session, user }: { session: any, user: any }) {
      console.log('session', session)
      console.log('user', user)
      // session.userId = user.id   
      return Promise.resolve(session)
    }
  }
}
export default NextAuth(authOptions)
