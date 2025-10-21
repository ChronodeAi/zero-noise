import NextAuth from "next-auth"
import Nodemailer from "next-auth/providers/nodemailer"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  trustHost: true,
  providers: [
    Nodemailer({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        secure: true,
        auth: {
          user: process.env.EMAIL_SERVER_USER!,
          pass: process.env.EMAIL_SERVER_PASSWORD!,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Check whitelist for all sign-ins
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email! }
      })
      
      if (!existingUser) {
        // Create user record but reject sign-in (must be whitelisted first)
        await prisma.user.create({
          data: {
            email: user.email!,
            name: user.name,
            provider: "email",
            isWhitelisted: false,
          }
        })
        return false
      }
      
      if (!existingUser.isWhitelisted) {
        return false // Reject sign-in
      }
      
      // Update last login
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { lastLoginAt: new Date() }
      })
      
      return true
    },
    async session({ session, token }) {
      if (token && session.user) {
        // Fetch latest user data for session
        const user = await prisma.user.findUnique({
          where: { email: token.email! },
          select: {
            id: true,
            email: true,
            name: true,
            image: true,
            isAdmin: true,
            xp: true,
            isWhitelisted: true,
          }
        })
        
        if (user) {
          session.user.id = user.id
          session.user.isAdmin = user.isAdmin
          session.user.xp = user.xp
          session.user.isWhitelisted = user.isWhitelisted
        }
      }
      
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    }
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
})
