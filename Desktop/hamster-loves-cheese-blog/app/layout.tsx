import "./globals.css"
import { Inter } from "next/font/google"
import { LayoutClient } from "./LayoutClient"
import { headers } from 'next/headers'
import AuthProvider from './providers/AuthProvider'
import { SessionProvider } from 'next-auth/react'

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "小倉鼠戀知識",
  description: "探索倉鼠與知識的美妙世界",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <LayoutClient>
          {children}
        </LayoutClient>
      </body>
    </html>
  )
}