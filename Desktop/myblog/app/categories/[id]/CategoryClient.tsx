"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import Breadcrumb from "@/app/components/Breadcrumb"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react"
import Footer from "@/app/components/Footer"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useSession } from "next-auth/react"
import AuthModal from "@/app/components/AuthModal"
import { useCategory } from '@/app/contexts/CategoryContext'

interface Article {
  id: number
  title: string
  content: string
  images: string | null
  category: {
    name: string
  }
  categoryId: number
  createdAt: string
  updatedAt: string
  likes?: number
  comments?: number
  isBookmarked?: boolean
  isLiked?: boolean
}

interface CategoryClientProps {
  category: {
    id: number
    name: string
    slug: string
  }
}

export default function CategoryClient({ category }: CategoryClientProps) {
  const { category: categoryContext } = useCategory()
  const [articles, setArticles] = useState<Article[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const articlesResponse = await fetch(`/api/articles?category=${category.slug}&sort=asc`)
        const articlesData = await articlesResponse.json()

        const articlesWithStatus = await Promise.all(
          articlesData.map(async (article: Article) => {
            const [bookmarkResponse, likeResponse, commentsResponse] = await Promise.all([
              fetch(`/api/articles/${article.id}/bookmark`),
              fetch(`/api/articles/${article.id}/like`),
              fetch(`/api/comments/${article.id}`)
            ])

            const { bookmarked } = await bookmarkResponse.json()
            const { liked, totalLikes } = await likeResponse.json()
            const comments = await commentsResponse.json()
            const commentCount = comments.reduce((acc: number, comment: any) => 
              acc + 1 + (comment.replies?.length || 0), 0)

            return {
              ...article,
              isBookmarked: bookmarked,
              isLiked: liked,
              likes: totalLikes || 0,
              comments: commentCount
            }
          })
        )

        setArticles(articlesWithStatus)
      } catch (error) {
        console.error('獲取文章失敗:', error)
      }
    }

    fetchArticles()
  }, [category.slug])

  const handleAction = async (e: React.MouseEvent, action: string, articleId: number) => {
    e.preventDefault()
    e.stopPropagation()

    if (action === "share") {
      const article = articles.find(a => a.id === articleId)
      if (!article) return

      const url = `${window.location.origin}/article/${articleId}`
      
      if (navigator.share) {
        try {
          await navigator.share({
            title: article.title,
            text: article.title,
            url: url
          })
        } catch (error) {
          if (error instanceof Error && error.name !== 'AbortError') {
            console.error('分享失敗:', error)
          }
        }
      } else {
        try {
          await navigator.clipboard.writeText(url)
          alert('已複製連結')
        } catch (error) {
          console.error('複製連結失敗:', error)
        }
      }
      return
    }

    if (!session) {
      setIsAuthModalOpen(true)
      return
    }

    if (action === "like" || action === "bookmark") {
      try {
        const response = await fetch(`/api/articles/${articleId}/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) throw new Error(`${action}失敗`)

        const data = await response.json()
        
        setArticles(articles.map(article => 
          article.id === articleId 
            ? { 
                ...article, 
                ...(action === "like" 
                  ? { 
                      likes: data.liked ? (article.likes || 0) + 1 : (article.likes || 0) - 1,
                      isLiked: data.liked
                    }
                  : { isBookmarked: data.bookmarked }
                )
              }
            : article
        ))
      } catch (error) {
        console.error(`${action}出錯:`, error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F7F3E8] dark:bg-gray-900 flex flex-col">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 flex-grow">
        <Breadcrumb 
          items={[
            { label: '首頁', href: '/' },
            { label: category.name, href: `/categories/${category.slug}` }
          ]}
        />
        <h1 className="text-2xl md:text-3xl font-bold text-[#5C4033] dark:text-white mb-6 md:mb-8 text-center">
          {category.name}
        </h1>
        <div className="max-w-3xl mx-auto">
          <section className="flex flex-col gap-4">
            {articles.map((article) => (
              <Link href={`/article/${article.id}`} key={article.id} className="block">
                <Card className="bg-[#FDFBF7] dark:bg-gray-800 hover:shadow-[0_2px_8px_rgba(139,110,78,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 h-auto">
                  <CardContent className="p-2 sm:p-3 md:p-4 flex flex-col h-full">
                    <div className="flex items-start pr-2 pl-3 flex-grow">
                      <div className="flex-1 min-w-0 pr-3 md:pr-4">
                        <div className="flex items-center text-xs md:text-sm mb-3 mt-2">
                          <span className="font-medium text-primary/70 dark:text-gray-400 truncate">
                            {article.category.name}
                          </span>
                          <span className="mx-2 text-[#CCCCCC]">•</span>
                          <span className="text-[#999999] dark:text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base md:text-xl font-semibold text-[#5C4033] dark:text-white mb-2 line-clamp-1 leading-[1.4]">
                          {article.title}
                        </h3>
                        <div className="text-sm md:text-base text-[#333333] dark:text-gray-300 leading-[1.5] line-clamp-2">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              img: () => null,
                              p: ({children}) => <p className="text-sm md:text-base">{children}</p>
                            }}
                          >
                            {article.content}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className="w-20 h-20 md:w-28 md:h-28 relative flex-shrink-0 mt-8">
                        {article.images && (
                          <div className="h-full">
                            {(() => {
                              try {
                                const images = JSON.parse(article.images)
                                if (images && images.length > 0) {
                                  return (
                                    <Image
                                      src={images[0].url}
                                      alt=""
                                      fill
                                      className="object-cover rounded-lg"
                                    />
                                  )
                                }
                              } catch (error) {
                                console.error('解析圖片失敗:', error)
                              }
                              return (
                                <Image
                                  src="/placeholder.svg"
                                  alt=""
                                  fill
                                  className="object-cover rounded-lg"
                                />
                              )
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 mb-1 pl-3 pr-2 text-[#8B7355] dark:text-gray-400">
                      <button
                        onClick={(e) => handleAction(e, "like", article.id)}
                        className="flex items-center gap-1 hover:text-[#5C4033] dark:hover:text-white transition-colors text-xs md:text-sm group"
                      >
                        <Heart 
                          className={`sm:w-5 sm:h-5 w-4 h-4 transition-transform group-hover:scale-110 ${
                            article.isLiked ? 'fill-current' : ''
                          }`} 
                        />
                        <span className="text-[10px] md:text-xs ml-0.5 transition-colors group-hover:text-[#5C4033] dark:group-hover:text-white">
                          {article.likes || 0}
                        </span>
                      </button>
                      <button
                        onClick={(e) => handleAction(e, "comment", article.id)}
                        className="flex items-center gap-1 hover:text-[#5C4033] dark:hover:text-white transition-colors text-xs md:text-sm group"
                      >
                        <MessageCircle className="sm:w-5 sm:h-5 w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] md:text-xs ml-0.5 transition-colors group-hover:text-[#5C4033] dark:group-hover:text-white">
                          {article.comments || 0}
                        </span>
                      </button>
                      <button
                        onClick={(e) => handleAction(e, "bookmark", article.id)}
                        className="flex items-center gap-1 hover:text-[#5C4033] dark:hover:text-white transition-colors text-xs md:text-sm group"
                      >
                        <Bookmark 
                          className={`sm:w-5 sm:h-5 w-4 h-4 transition-transform group-hover:scale-110 ${
                            article.isBookmarked ? 'fill-current' : ''
                          }`} 
                        />
                      </button>
                      <button
                        onClick={(e) => handleAction(e, "share", article.id)}
                        className="flex items-center gap-1 hover:text-[#5C4033] dark:hover:text-white transition-colors text-xs md:text-sm group"
                      >
                        <Share2 className="sm:w-5 sm:h-5 w-4 h-4 transition-transform group-hover:scale-110" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </section>
        </div>
      </div>
      <Footer />
      {isAuthModalOpen && <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />}
    </div>
  )
}

