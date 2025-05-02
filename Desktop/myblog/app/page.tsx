import HomeClient from './HomeClient'
import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: '首頁 - 小倉鼠戀知識 ',
  description: '探索最新的文章和分享',
  openGraph: {
    title: '最新文章',
    description: '探索最新的文章和分享',
    type: 'website',
  }
}

// 使用增量靜態再生成(ISR)
export const revalidate = 3600; // 每小時重新生成一次

// 你可以根據需求調整這個時間
// export const revalidate = 1800; // 每30分鐘重新生成一次

export default function Home() {
  return (
    <main>
      <HomeClient />
    </main>
  )
}

