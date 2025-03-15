import HomeClient from './HomeClient'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '首頁 - 小倉鼠戀知識 ',
  description: '探索最新的文章和分享',
  openGraph: {
    title: '最新文章',
    description: '探索最新的文章和分享',
    type: 'website',
  }
}

export default function Home() {
  return <HomeClient />
}

