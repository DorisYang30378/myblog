import { Metadata } from 'next'
import AboutPageClient from './AboutPageClient'

export const metadata: Metadata = {
  title: '關於我',
  description: '你好，我是小倉鼠，一個喜歡思考的學習者。在這裡，我希望將繁雜的知識變得簡單易懂。不是老師，只是個愛學習、樂意分享的同路人。',
  openGraph: {
    title: '關於我',
    description: '你好，我是小倉鼠，一個喜歡思考的學習者。在這裡，我希望將繁雜的知識變得簡單易懂。不是老師，只是個愛學習、樂意分享的同路人。',
    type: 'profile',
    images: [
      {
        url: 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%9C%80%E7%B5%82%E7%89%88%E9%A0%AD%E5%83%8F-12nsvFkjeFJd0LUPkPatzXzmPBX41M.png',
        width: 400,
        height: 400,
        alt: '小倉鼠頭像'
      }
    ],
    siteName: '小倉鼠戀知識'
  },
  twitter: {
    card: 'summary',
    title: '關於我 - 小倉鼠戀知識',
    description: '你好，我是小倉鼠，一個喜歡思考的學習者。在這裡，我希望將繁雜的知識變得簡單易懂。不是老師，只是個愛學習、樂意分享的同路人。',
    images: ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%9C%80%E7%B5%82%E7%89%88%E9%A0%AD%E5%83%8F-12nsvFkjeFJd0LUPkPatzXzmPBX41M.png']
  }
}

export default function Page() {
  return <AboutPageClient />
}

