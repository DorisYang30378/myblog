'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '../contexts/UserContext'
import Link from 'next/link'
import Footer from '../components/Footer'

const articles = [
  {
    id: 1,
    title: "奇妙的芝士愛好者倉鼠",
    date: "2023-05-15",
    excerpt: "探索倉鼠與芝士之間令人著迷的關係，揭示這種意想不到的美食偏好。",
  },
  {
    id: 2,
    title: "適合倉鼠的五大芝士品種",
    date: "2023-05-10",
    excerpt: "了解如何安全地為您的毛茸茸朋友選擇最佳芝士，不影響其健康。",
  },
  {
    id: 3,
    title: "倉鼠棲息地：打造芝士主題天堂",
    date: "2023-05-05",
    excerpt: "運用創意，將芝士元素融入倉鼠的生活空間，創造獨特的居住環境。",
  },
]

const PageCorner = () => (
  <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden">
    <div 
      className="absolute bottom-0 right-0 w-16 h-16 bg-[#8B7355] transition-all duration-300 ease-in-out transform origin-bottom-right 
                 rotate-0 scale-0 group-hover:scale-100 group-hover:-rotate-[135deg]"
      style={{
        transitionProperty: 'transform, opacity',
        opacity: 0,
      }}
    >
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-transparent to-white/20" />
    </div>
  </div>
)

export default function MemberHomePage() {
  const { user } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#FAF3E8] dark:bg-gray-900 flex flex-col">
      <div className="container mx-auto px-4 py-8 flex-grow">
        <h1 className="text-3xl font-bold text-primary dark:text-white mb-8 text-center">最新文章</h1>
        <section className="max-w-4xl mx-auto">
          {articles.map((article) => (
            <Link href={`/article/${article.id}`} key={article.id}>
              <article className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-8 relative group 
                                  transition-all duration-300 ease-in-out hover:shadow-lg">
                <div className="p-6 relative z-10">
                  <h2 className="text-2xl font-semibold text-primary dark:text-white mb-3">{article.title}</h2>
                  <p className="text-base text-gray-500 dark:text-gray-200 mb-3">{article.date}</p>
                  <p className="text-lg text-dark-brown dark:text-gray-100">{article.excerpt}</p>
                </div>
                <PageCorner />
              </article>
            </Link>
          ))}
        </section>
      </div>
      <Footer />
    </div>
  )
}

