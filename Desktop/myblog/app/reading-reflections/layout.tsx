import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '閱讀心得',
  description: '分享各種書籍的閱讀心得與感想',
  openGraph: {
    title: '閱讀心得',
    description: '分享各種書籍的閱讀心得與感想',
    type: 'website',
    siteName: '小倉鼠戀知識'
  }
}

export default function ReadingReflectionsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 