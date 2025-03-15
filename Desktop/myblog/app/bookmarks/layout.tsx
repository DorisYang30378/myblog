import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '我的收藏',
  description: '查看已收藏的文章'
}

export default function BookmarksLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
} 