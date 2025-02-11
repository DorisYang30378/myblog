"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react"
import PageLayout from "../components/PageLayout"
import Link from "next/link"
import Image from "next/image"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSession } from "next-auth/react"
import AuthModal from "@/app/components/AuthModal"

interface BookmarkedArticle {
  id: number
  title: string
  createdAt: string
  category: string
  excerpt: string
  image?: string
  likes?: number
  comments?: number
  isLiked?: boolean
}

export default function BookmarksPage() {
  const { user } = useUser()
  const router = useRouter()
  const [bookmarkedArticles, setBookmarkedArticles] = useState<BookmarkedArticle[]>([])
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false)
  const [articleToRemove, setArticleToRemove] = useState<number | null>(null)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    if (!user) {
      router.push("/")
      return
    }

    const fetchBookmarks = async () => {
      try {
        const response = await fetch('/api/bookmarks')
        if (!response.ok) {
          throw new Error('獲取收藏失敗')
        }
        
        const articlesData = await response.json()

        // 在這裡處理 excerpt
        const cleanedArticles = articlesData.map((article: BookmarkedArticle) => ({
          ...article,
          excerpt: article.excerpt.replace(/<[^>]*>/g, '').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&')
        }))

        // 獲取每篇文章的按讚狀態
        const articlesWithStatus = await Promise.all(
          cleanedArticles.map(async (article: BookmarkedArticle) => {
            try {
              const likeResponse = await fetch(`/api/articles/${article.id}/like`)
              const { liked, totalLikes } = await likeResponse.json()
              
              return {
                ...article,
                isLiked: liked,
                likes: totalLikes || article.likes || 0
              }
            } catch (error) {
              console.error(`獲取文章 ${article.id} 按讚狀態失敗:`, error)
              return article
            }
          })
        )

        setBookmarkedArticles(articlesWithStatus)
      } catch (error) {
        console.error('獲取收藏失敗:', error)
      }
    }

    fetchBookmarks()
  }, [user, router])

  const handleRemoveBookmark = async (e: React.MouseEvent, articleId: number) => {
    e.preventDefault()
    e.stopPropagation()
    setArticleToRemove(articleId)
    setIsConfirmDialogOpen(true)
  }

  const confirmRemoveBookmark = async () => {
    if (articleToRemove) {
      try {
        const response = await fetch(`/api/articles/${articleToRemove}/bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error('移除收藏失敗')
        }

        setBookmarkedArticles((prevArticles) => 
          prevArticles.filter((article) => article.id !== articleToRemove)
        )
      } catch (error) {
        console.error('移除收藏失敗:', error)
      }
      setIsConfirmDialogOpen(false)
      setArticleToRemove(null)
    }
  }

  const handleAction = async (e: React.MouseEvent, action: string, articleId: number) => {
    e.preventDefault()
    e.stopPropagation()

    // 處理分享功能
    if (action === "share") {
      const article = bookmarkedArticles.find(a => a.id === articleId)
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

    // 需要登入的操作
    if (!session) {
      setIsAuthModalOpen(true)
      return
    }

    if (action === "like") {
      try {
        const response = await fetch(`/api/articles/${articleId}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error('按讚失敗')
        }

        const { liked, totalLikes } = await response.json()
        
        setBookmarkedArticles(prevArticles => 
          prevArticles.map(article => 
            article.id === articleId 
              ? {
                  ...article,
                  isLiked: liked,
                  likes: totalLikes,
                  excerpt: article.excerpt
                }
              : article
          )
        )
      } catch (error) {
        console.error('按讚失敗:', error)
      }
    }
  }

  if (!user) {
    return null
  }

  return (
    <PageLayout
      title={<span className="text-2xl sm:text-3xl text-[#5C4033] dark:text-white">我的收藏</span>}
      className="bg-[#F7F3E8] dark:bg-gray-900"
    >
      <div className="max-w-3xl mx-auto px-0 sm:px-4">
        {bookmarkedArticles.length > 0 ? (
          <div className="grid gap-4">
            {bookmarkedArticles.map((article) => (
              <Link href={`/article/${article.id}`} key={article.id}>
                <Card className="bg-[#FDFBF7] dark:bg-gray-800 hover:shadow-[0_2px_8px_rgba(139,110,78,0.1)] transition-all duration-300 ease-in-out hover:-translate-y-0.5 h-auto">
                  <CardContent className="p-2 sm:p-3 md:p-4 flex flex-col h-full">
                    <div className="flex items-start pr-2 pl-3 flex-grow">
                      <div className="flex-1 min-w-0 pr-3 md:pr-4">
                        <div className="flex items-center text-xs md:text-sm mb-3 mt-2">
                          <span className="font-medium text-primary/70 dark:text-gray-400 truncate">
                            {article.category}
                          </span>
                          <span className="mx-2 text-[#CCCCCC]">•</span>
                          <span className="text-[#999999] dark:text-gray-500">
                            {new Date(article.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <h3 className="text-base md:text-xl font-semibold text-[#5C4033] dark:text-white mb-2 line-clamp-1 leading-[1.4]">
                          {article.title}
                        </h3>
                        <div className="text-sm md:text-base text-[#333333] dark:text-gray-300 leading-[1.5] line-clamp-2 md:line-clamp-3 prose dark:prose-invert prose-sm max-w-none [&>*]:!text-sm [&>*]:md:!text-base [&>*]:!my-0 [&>*]:!font-normal [&_h1]:!text-sm [&_h2]:!text-sm [&_h3]:!text-sm [&_h4]:!text-sm [&_h5]:!text-sm [&_h6]:!text-sm [&_h1]:md:!text-base [&_h2]:md:!text-base [&_h3]:md:!text-base [&_h4]:md:!text-base [&_h5]:md:!text-base [&_h6]:md:!text-base [&_h1]:!font-normal [&_h2]:!font-normal [&_h3]:!font-normal [&_h4]:!font-normal [&_h5]:!font-normal [&_h6]:!font-normal">
                          <ReactMarkdown 
                            remarkPlugins={[remarkGfm]}
                            components={{
                              p: ({ children }) => {
                                const text = Array.isArray(children) 
                                  ? children
                                      .map(child => {
                                        if (typeof child === 'string') {
                                          return child.replace(/<[^>]*>/g, '')
                                        }
                                        if (child && typeof child === 'object' && 'props' in child) {
                                          return (child.props.children || '').toString().replace(/<[^>]*>/g, '')
                                        }
                                        return ''
                                      })
                                      .join('')
                                  : String(children || '').replace(/<[^>]*>/g, '')
                                return <p>{text}</p>
                              },
                              h1: 'p',
                              h2: 'p',
                              h3: 'p',
                              h4: 'p',
                              h5: 'p',
                              h6: 'p',
                              img: () => null,
                              a: 'span'
                            }}
                          >
                            {article.excerpt}
                          </ReactMarkdown>
                        </div>
                      </div>
                      <div className="w-20 h-20 md:w-28 md:h-28 relative flex-shrink-0 mt-8">
                        <Image
                          src={article.image || "/placeholder.svg"}
                          alt={`Illustration for ${article.title}`}
                          fill
                          className="object-cover rounded-lg"
                        />
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
                          {article.comments}
                        </span>
                      </button>
                      <button
                        onClick={(e) => handleRemoveBookmark(e, article.id)}
                        className="flex items-center gap-1 hover:text-[#5C4033] dark:hover:text-white transition-colors text-xs md:text-sm group"
                      >
                        <Bookmark className="sm:w-5 sm:h-5 w-4 h-4 fill-current transition-transform group-hover:scale-110" />
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
          </div>
        ) : (
          <div className="text-center py-12">
            <Bookmark className="w-16 h-16 mx-auto text-primary/30 dark:text-white/30 mb-4" />
            <h3 className="text-xl font-semibold text-primary dark:text-white mb-2">尚未收藏任何文章</h3>
            <p className="text-gray-600 dark:text-gray-400">瀏覽文章時，點擊收藏按鈕將文章加入收藏清單</p>
          </div>
        )}
      </div>

      {/* 統一使用這個 Dialog，移除手機版特別的對話框 */}
      <Dialog
        open={isConfirmDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            setArticleToRemove(null)
          }
          setIsConfirmDialogOpen(open)
        }}
      >
        <DialogContent
          className="max-w-[calc(100%-32px)] sm:max-w-[350px] bg-[#F5F2EE] dark:bg-gray-800 p-4 sm:p-6 rounded-xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#E6DED5] dark:border-gray-700 transition-all duration-200 ease-in-out"
        >
          <div className="pt-2 sm:pt-4 text-lg font-semibold text-[#4A3B30] dark:text-white mb-4 sm:mb-6 text-center">
            確定移除收藏？
          </div>
          <div className="flex flex-col sm:flex-row sm:justify-end gap-2 sm:gap-4">
            <Button
              onClick={confirmRemoveBookmark}
              className="w-full sm:w-[140px] h-11 bg-[#8B6E4E] hover:bg-[#7A5D3D] active:scale-[0.98] text-white dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg transition-all duration-200 text-base"
            >
              確認
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setIsConfirmDialogOpen(false)
                setArticleToRemove(null)
              }}
              className="w-full sm:w-[140px] h-11 bg-transparent hover:bg-[#F5F2EE] active:scale-[0.98] dark:bg-transparent dark:hover:bg-gray-700 border-[#8B6E4E] dark:border-gray-600 text-[#4A3B30] dark:text-gray-300 hover:text-[#4A3B30] dark:hover:text-white rounded-lg transition-all duration-200 text-base"
            >
              取消
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </PageLayout>
  )
}

