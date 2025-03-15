import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '搜尋',
  description: '搜尋網站內的文章'
}

export default function SearchLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 