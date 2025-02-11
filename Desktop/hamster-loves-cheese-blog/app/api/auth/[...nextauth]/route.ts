import NextAuth, { DefaultSession, User, Session, NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { JWT } from "next-auth/jwt"
import { SessionStrategy } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: number
      isAdmin: boolean
      provider: string
    } & DefaultSession["user"]
  }
  interface User {
    isAdmin: boolean
  }
}

const ADMIN_EMAILS = ['abcd901125@gmail.com']

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('請輸入電子郵件和密碼')
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.password) {
          throw new Error('信箱或密碼錯誤')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) {
          throw new Error('信箱或密碼錯誤')
        }

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.avatar,
          isAdmin: ADMIN_EMAILS.includes(user.email),
          provider: 'credentials'
        } as User
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.provider = account?.provider || 'credentials'
      }
      return token
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id as number
        session.user.isAdmin = Boolean(token.isAdmin)
        session.user.provider = token.provider as string
      }
      return session
    },
  },
  pages: {
    signIn: '/',  // 自訂登入頁面
    error: '/'    // 錯誤頁面
  },
  session: {
    strategy: "jwt" as SessionStrategy,
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  secret: process.env.NEXTAUTH_SECRET,
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('請設置 NEXTAUTH_SECRET 環境變數')
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST, handler as PUT } 