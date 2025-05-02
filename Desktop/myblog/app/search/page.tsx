"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useSession } from "next-auth/react"
import AuthModal from "../components/AuthModal"
import PageLayout from "../components/PageLayout"

interface Article {
  id: number
  title: string
  content: string
  images: string | null
  category: {
    name: string
  }
  createdAt: string
  likes?: number
  comments?: number
  isBookmarked?: boolean
  isLiked?: boolean
  slug: string
}

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 2) {
        setArticles([])
        return
      }

      setLoading(true)
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const data = await response.json()
        
        const articlesWithStatus = await Promise.all(
          data.articles.map(async (article: Article) => {
            try {
              const [bookmarkRes, likeRes, commentsRes] = await Promise.all([
                fetch(`/api/articles/${article.slug}/bookmark`),
                fetch(`/api/articles/${article.slug}/like`),
                fetch(`/api/comments/${article.id}`)
              ])

              const { bookmarked } = await bookmarkRes.json()
              const { liked, totalLikes } = await likeRes.json()
              
              let commentCount = 0
              if (commentsRes.ok) {
                const comments = await commentsRes.json()
                if (Array.isArray(comments)) {
                  commentCount = comments.reduce((acc: number, comment: any) => 
                    acc + 1 + (Array.isArray(comment.replies) ? comment.replies.length : 0), 0)
                }
              }

              return {
                ...article,
                isBookmarked: bookmarked,
                isLiked: liked,
                likes: totalLikes || 0,
                comments: commentCount
              }
            } catch (error) {
              console.error(`處理文章 ${article.slug} 狀態失敗:`, error)
              return {
                ...article,
                isBookmarked: false,
                isLiked: false,
                likes: 0,
                comments: 0
              }
            }
          })
        )

        console.log('搜尋結果:', articlesWithStatus)
        setArticles(articlesWithStatus)
      } catch (error) {
        console.error("搜尋失敗:", error)
      } finally {
        setLoading(false)
      }
    }

    const handleLoginSuccess = () => {
      console.log('用戶登入成功，重新載入搜索結果');
      fetchResults();
    };
    
    window.addEventListener('user-login-success', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('user-login-success', handleLoginSuccess);
    };
  }, [query])

  const handleAction = async (e: React.MouseEvent, action: string, article: Article) => {
    e.preventDefault()
    e.stopPropagation()

    if (action === "share") {
      if (!article) return

      const url = `${window.location.origin}/article/${article.slug}`
      
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
        const response = await fetch(`/api/articles/${article.slug}/${action}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        })

        if (!response.ok) throw new Error(`${action}失敗`)

        const data = await response.json()
        
        setArticles(articles.map(a => 
          a.id === article.id 
            ? { 
                ...a, 
                ...(action === 'like' ? {
                  likes: data.liked ? (a.likes || 0) + 1 : (a.likes || 0) - 1,
                  isLiked: data.liked
                } : {
                  isBookmarked: data.bookmarked
                })
              }
            : a
        ))
      } catch (error) {
        console.error(`${action}出錯:`, error)
      }
    }
  }

  return (
    <PageLayout
      title={
        <h1 className="text-2xl md:text-3xl font-bold text-[#5C4033] dark:text-white mb-6 md:mb-8 text-center">
          搜尋結果: {query}
        </h1>
      }
      className="bg-[#F7F3E8] dark:bg-gray-900"
    >
      <div className="max-w-3xl mx-auto px-0 sm:px-4">
        {loading ? (
          <div className="text-center py-12">
            <p className="text-[#A08977] dark:text-gray-400">搜尋中...</p>
          </div>
        ) : articles.length > 0 ? (
          <div>
            {articles.map((article) => (
              <Link href={`/article/${article.slug}`} key={article.id}>
                <Card className="bg-[#FDFBF7] dark:bg-gray-800 hover:shadow-[0_2px_8px_rgba(139,110,78,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 h-auto mb-4">
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
                        <h3 className="text-base md:text-xl text-[#5C4033] dark:text-white mb-2 line-clamp-1 leading-[1.4]">
                          {article.title}
                        </h3>
                        <div className="text-sm md:text-base text-[#333333] dark:text-gray-300 leading-[1.5] line-clamp-2 md:line-clamp-3 prose dark:prose-invert prose-sm max-w-none [&>*]:!text-sm [&>*]:md:!text-base [&>*]:!my-0 [&>*]:!font-normal">
                          <ReactMarkdown
                            remarkPlugins={[remarkGfm]}
                            rehypePlugins={[rehypeRaw]}
                            components={{
                              img: () => null,
                              p: ({children}) => <p>{children}</p>
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
                              const images = JSON.parse(article.images)
                              if (images.length > 0) {
                                return (
                                  <Image
                                    src={images[0].url}
                                    alt=""
                                    fill
                                    className="object-cover rounded-lg"
                                  />
                                )
                              }
                              return null
                            })()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 mt-1 mb-1 pl-3 pr-2 text-[#8B7355] dark:text-gray-400">
                      <button
                        onClick={(e) => handleAction(e, "like", article)}
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
                        onClick={(e) => handleAction(e, "comment", article)}
                        className="flex items-center gap-1 hover:text-[#5C4033] dark:hover:text-white transition-colors text-xs md:text-sm group"
                      >
                        <MessageCircle className="sm:w-5 sm:h-5 w-4 h-4 transition-transform group-hover:scale-110" />
                        <span className="text-[10px] md:text-xs ml-0.5">
                          {article.comments || 0}
                        </span>
                      </button>
                      <button
                        onClick={(e) => handleAction(e, "bookmark", article)}
                        className="flex items-center gap-1 hover:text-[#5C4033] dark:hover:text-white transition-colors text-xs md:text-sm group"
                      >
                        <Bookmark 
                          className={`sm:w-5 sm:h-5 w-4 h-4 transition-transform group-hover:scale-110 ${
                            article.isBookmarked ? 'fill-current' : ''
                          }`} 
                        />
                      </button>
                      <button
                        onClick={(e) => handleAction(e, "share", article)}
                        className="flex items-center gap-1 hover:text-[#5C4033] dark:hover:text-white transition-colors text-xs md:text-sm group"
                      >
                        <Share2 className="sm:w-5 sm:h-5 w-4 h-4 transition-transform group-hover:scale-110" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <div className="text-center py-12">
            <p className="text-[#A08977] dark:text-gray-400">沒有找到相關結果</p>
          </div>
        ) : null}
      </div>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </PageLayout>
  )
} 