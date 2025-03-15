import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '個人資料',
  description: '管理您的個人資料設置',
  openGraph: {
    title: '個人資料',
    description: '管理您的個人資料設置',
    type: 'profile',
    siteName: '小倉鼠戀知識'
  }
}

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 