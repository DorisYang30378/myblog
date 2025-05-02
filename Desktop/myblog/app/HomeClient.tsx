"use client"

import Link from "next/link"
import Image from "next/image"
import Breadcrumb from "./components/Breadcrumb"
import Footer from "./components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react"
import { useState, useEffect, memo } from "react"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { useSession } from "next-auth/react"
import AuthModal from "./components/AuthModal"
import Script from "next/script"

interface Article {
  id: number
  title: string
  content: string
  category: {
    name: string
    slug: string
  }
  categoryId: number
  createdAt: string
  updatedAt?: string
  comments?: number
  likes?: number
  isLiked?: boolean
  isBookmarked?: boolean
  images: string | null
  slug: string
  thumbnail?: string | null
}

interface ArticleImage {
  id: string
  url: string
}

interface UploadedImage {
  id: string
  file: File | null
  preview: string
}

async function getArticles() {
  const response = await fetch('/api/articles')
  if (!response.ok) {
    throw new Error('Failed to fetch articles')
  }
  return response.json()
}

const fetchArticle = async (id: string, setImages: (images: UploadedImage[]) => void) => {
  try {
    const response = await fetch(`/api/articles/${id}`)
    if (!response.ok) throw new Error('Failed to fetch article')
    const data = await response.json()
    
    // 處理圖片數據
    let imageArray: UploadedImage[] = []
    if (data.images) {
      try {
        // 解析 JSON 字符串
        const parsedImages = typeof data.images === 'string' ? 
          JSON.parse(data.images) : data.images

        // 確保 parsedImages 是數組
        if (Array.isArray(parsedImages)) {
          imageArray = parsedImages.map(img => ({
            id: img.id || String(Math.random()),
            file: null,
            preview: img.url || ''
          }))
        }
      } catch (e) {
        console.error('解析圖片數據失敗:', e)
      }
    }
    
    setImages(imageArray)
    
    return {
      id: data.id,
      title: data.title,
      category: data.category?.name || "",
      content: data.content,
      images: imageArray,
      slug: data.slug,
      thumbnail: data.thumbnail
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

const getImageAlt = (url: string) => {
  try {
    const decodedUrl = decodeURIComponent(url)
    const fileName = decodedUrl.split('/').pop()?.split('.')[0] || ''
    return /[\u4e00-\u9fa5]/.test(fileName)
      ? fileName
      : fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  } catch (error) {
    return '文章圖片'
  }
}

const ArticleImage = memo(({ article, index }: { article: Article, index: number }) => {
  const isPriority = index === 0  // 只優先載入第一張
  const imageUrl = article.thumbnail || '/placeholder.svg'
  
  // 針對首張圖片進行特殊處理
  if (index === 0) {
    return (
      <div className="relative w-full h-full bg-gray-100 rounded-lg">
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover rounded-lg"
          priority={true}
          fetchPriority="high"
          loading="eager"
          sizes="(max-width: 768px) 80px, 112px"
          quality={60}
          unoptimized={imageUrl.includes('/placeholder.svg')}  // 佔位圖不需要優化
        />
      </div>
    )
  }
  
  // 其他圖片使用標準設置
  return (
    <div className="relative w-full h-full bg-gray-100 rounded-lg">
      <Image
        src={imageUrl}
        alt=""
        fill
        className="object-cover rounded-lg"
        priority={false}
        loading="lazy"
        sizes="(max-width: 768px) 80px, 112px"
        quality={index < 3 ? 60 : 45}  // 只有前3張保持較高品質
      />
    </div>
  )
})

export default function HomeClient() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { data: session } = useSession()

  const fetchArticles = async () => {
    try {
      const response = await fetch('/api/articles')
      if (!response.ok) {
        throw new Error('獲取文章失敗')
      }
      
      const articlesData = await response.json()
      
      // 添加這個部分，獲取每篇文章的點讚和收藏狀態
      const articlesWithStatus = await Promise.all(
        articlesData.map(async (article: Article) => {
          try {
            const [bookmarkResponse, likeResponse, commentsResponse] = await Promise.all([
              fetch(`/api/articles/${article.slug}/bookmark`),
              fetch(`/api/articles/${article.slug}/like`),
              fetch(`/api/comments/${article.id}`)
            ])

            const { bookmarked } = await bookmarkResponse.json()
            const { liked, totalLikes } = await likeResponse.json()
            
            let commentCount = 0
            if (commentsResponse.ok) {
              const comments = await commentsResponse.json()
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
      
      // 設置帶有狀態的文章數據
      setArticles(articlesWithStatus)
    } catch (error) {
      console.error('獲取文章失敗:', error)
    }
  }

  useEffect(() => {
    fetchArticles()
  }, [session])

  useEffect(() => {
    const handleLoginSuccess = () => {
      console.log('用戶登入成功，重新載入文章狀態')
      fetchArticles()
    }
    
    window.addEventListener('user-login-success', handleLoginSuccess)
    return () => window.removeEventListener('user-login-success', handleLoginSuccess)
  }, [])

  const handleAction = async (e: React.MouseEvent, action: string, article: Article) => {
    e.preventDefault()
    e.stopPropagation()

    // 如果是分享功能，不需要登入驗證
    if (action === "share") {
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

    // 其他需要登入的操作
    if (!session) {
      setIsAuthModalOpen(true)
      return
    }

    if (action === "like") {
      try {
        const response = await fetch(`/api/articles/${article.slug}/like`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error('按讚失敗')
        }

        const { liked } = await response.json()
        
        // 更新文章列表中的按讚狀態和數量
        setArticles(articles.map(a => 
          a.id === article.id  // 修改這裡，使用 a 而不是 article
            ? { 
                ...a,  // 這裡也要改成 a
                likes: liked ? (a.likes || 0) + 1 : (a.likes || 0) - 1,
                isLiked: liked
              }
            : a
        ))
      } catch (error) {
        console.error('按讚出錯:', error)
      }
    }
    if (action === "bookmark") {
      try {
        const response = await fetch(`/api/articles/${article.slug}/bookmark`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        })

        if (!response.ok) {
          throw new Error('收藏失敗')
        }

        const { bookmarked } = await response.json()
        
        // 更新文章列表中的收藏狀態
        setArticles(articles.map(a => 
          a.id === article.id  // 修改這裡，使用 a 而不是 article
            ? { 
                ...a,  // 這裡也要改成 a
                isBookmarked: bookmarked
              }
            : a
        ))
      } catch (error) {
        console.error('收藏出錯:', error)
      }
    }
  }

  const articleListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": articles.map((article, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Article",
        "headline": article.title,
        "datePublished": article.createdAt,
        "dateModified": article.updatedAt,
        "description": article.content.substring(0, 160)
      }
    }))
  }

  return (
    <div className="min-h-screen bg-[#F7F3E8] dark:bg-gray-900 flex flex-col">
      <Script
        id="article-list-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleListSchema) }}
      />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 flex-grow">
        <Breadcrumb items={[
          { label: '首頁', href: '/' }
        ]} />
        <h1 className="text-2xl md:text-3xl font-bold text-[#5C4033] dark:text-white mb-6 md:mb-8 text-center">
          最新文章
        </h1>
        <section className="max-w-3xl mx-auto">
          {articles.map((article, index) => (
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
                      <div className="text-sm md:text-base text-[#333333] dark:text-gray-300 leading-[1.5] line-clamp-2 md:line-clamp-3 prose dark:prose-invert prose-sm max-w-none 
                        [&>*]:!text-sm [&>*]:md:!text-base [&>*]:!my-0 [&>*]:!font-normal
                        [&>ul>li::marker]:!text-[#333333] dark:[&>ul>li::marker]:!text-gray-300
                        [&>ol>li::marker]:!text-[#333333] dark:[&>ol>li::marker]:!text-gray-300
                      ">
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
                      <ArticleImage article={article} index={index} />
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
                      <span className="text-[10px] md:text-xs ml-0.5 transition-colors group-hover:text-[#5C4033] dark:group-hover:text-white">
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
        </section>
      </div>
      <Footer />
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  )
}

