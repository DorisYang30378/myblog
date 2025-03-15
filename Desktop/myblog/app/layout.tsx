import "./globals.css"
import { LayoutClient } from "./LayoutClient"
import { headers } from 'next/headers'
import AuthProvider from './providers/AuthProvider'
import { Metadata } from 'next'
import GoogleAnalytics from './components/GoogleAnalytics'

export const metadata: Metadata = {
  metadataBase: new URL('https://curioushammy.com'),
  title: {
    default: '小倉鼠戀知識',
    template: '%s - 小倉鼠戀知識'
  },
  description: '分享各領域知識與學習心得的部落格',
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png' }
    ],
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-TW" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700&family=Noto+Serif+TC:wght@600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="font-sans">
        <GoogleAnalytics />
        <AuthProvider>
          <LayoutClient>
            {children}
          </LayoutClient>
        </AuthProvider>
      </body>
    </html>
  )
}