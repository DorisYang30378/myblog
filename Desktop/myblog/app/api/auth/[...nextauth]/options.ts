import { DefaultSession, NextAuthOptions, User } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
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
  debug: true,
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
        console.log('authorize 被調用，信箱:', credentials?.email)
        
        if (!credentials?.email || !credentials?.password) {
          throw new Error('請輸入電子郵件和密碼')
        }
        
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        console.log('找到用戶:', user ? '是' : '否')

        if (!user || !user.password) {
          throw new Error('信箱或密碼錯誤')
        }

        const isValid = await bcrypt.compare(credentials.password, user.password)
        console.log('密碼驗證結果:', isValid ? '成功' : '失敗')

        if (!isValid) {
          throw new Error('信箱或密碼錯誤')
        }

        const isAdmin = ADMIN_EMAILS.includes(user.email)
        console.log('是否為管理員:', isAdmin)

        return {
          id: String(user.id),
          name: user.name,
          email: user.email,
          image: user.avatar,
          isAdmin,
          provider: 'credentials'
        } as User
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      console.log('JWT Callback:', { 
        tokenExists: !!token,
        userExists: !!user,
        accountExists: !!account 
      })

      if (user) {
        token.id = user.id
        token.isAdmin = user.isAdmin
        token.provider = account?.provider || 'credentials'
      }
      console.log('JWT token 內容:', token)
      return token
    },
    async session({ session, token }) {
      console.log('Session Callback:', {
        sessionExists: !!session,
        tokenExists: !!token
      })

      if (session?.user) {
        session.user.id = Number(token.id)
        session.user.isAdmin = Boolean(token.isAdmin)
        session.user.provider = token.provider as string
      }
      console.log('最終 session 內容:', session)
      return session
    }
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 天
  },
  pages: {
    signIn: '/',
    error: '/'
  },
  secret: process.env.NEXTAUTH_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax", // 嘗試 "none" 如果這不起作用
        path: "/",
        secure: process.env.NODE_ENV === "production"
      }
    }
  }
}

if (!process.env.NEXTAUTH_SECRET) {
  throw new Error('請設置 NEXTAUTH_SECRET 環境變數')
} 