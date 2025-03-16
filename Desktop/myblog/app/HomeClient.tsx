"use client"

import Link from "next/link"
import Image from "next/image"
import Breadcrumb from "./components/Breadcrumb"
import Footer from "./components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle, Bookmark, Share2 } from "lucide-react"
import { useState, useEffect } from "react"
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
  slug: string
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
      slug: data.slug
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



export default function HomeClient() {
  const [articles, setArticles] = useState<Article[]>([])
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        console.log('開始獲取文章列表')
        
        // 直接從 API 獲取文章列表
        const response = await fetch('/api/articles')
        console.log('文章 API 響應狀態:', response.status)
        
        if (!response.ok) {
          console.error('獲取文章列表失敗:', response.statusText)
          setArticles([])
          return
        }
        
        const articlesData = await response.json()
        console.log('獲取到的文章數據:', articlesData)
        
        if (!articlesData || articlesData.length === 0) {
          console.log('沒有找到文章')
          setArticles([])
          return
        }

        // 獲取每篇文章的收藏、按讚和評論狀態
        const articlesWithStatus = await Promise.all(
          articlesData.map(async (article: Article) => {
            try {
              // 獲取收藏狀態
              const bookmarkResponse = await fetch(`/api/articles/${article.slug}/bookmark`)
              const bookmarkData = await bookmarkResponse.json()
              const bookmarked = bookmarkData.bookmarked || false
              
              // 獲取按讚狀態
              const likeResponse = await fetch(`/api/articles/${article.slug}/like`)
              const likeData = await likeResponse.json()
              const liked = likeData.liked || false
              const totalLikes = likeData.totalLikes || 0
              
              // 獲取評論數 - 使用 article.id 而不是 slug
              let commentCount = 0
              try {
                // 修改這裡：使用 article.id 而不是 article.slug
                const commentsResponse = await fetch(`/api/comments/${article.id}`)
                if (commentsResponse.ok) {
                  const comments = await commentsResponse.json()
                  // 添加錯誤處理，確保 comments 是數組
                  if (Array.isArray(comments)) {
                    commentCount = comments.reduce((acc, comment) => 
                      acc + 1 + (comment.replies?.length || 0), 0)
                  } else {
                    console.log(`文章 ${article.id} 的評論不是數組:`, comments)
                    commentCount = 0
                  }
                }
              } catch (commentError) {
                console.error(`獲取文章 ${article.id} 的評論失敗:`, commentError)
              }
              
              return {
                ...article,
                isBookmarked: bookmarked,
                isLiked: liked,
                likes: totalLikes,
                comments: commentCount
              }
            } catch (articleError) {
              console.error(`處理文章 ${article.id} 時出錯:`, articleError)
              return article // 返回原始文章，不帶額外狀態
            }
          })
        )

        console.log('處理後的文章:', articlesWithStatus)
        setArticles(articlesWithStatus)
      } catch (error) {
        console.error('獲取文章列表失敗:', error)
        setArticles([]) // 設置為空數組，避免 undefined
      }
    }

    fetchArticles()
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
        setArticles(articles.map(article => 
          article.id === article.id 
            ? { 
                ...article, 
                likes: liked ? (article.likes || 0) + 1 : (article.likes || 0) - 1,
                isLiked: liked
              }
            : article
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
        setArticles(articles.map(article => 
          article.id === article.id 
            ? { 
                ...article, 
                isBookmarked: bookmarked
              }
            : article
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
                      {article.images && (
                        <div className="h-full">
                          {(() => {
                            const images = JSON.parse(article.images)
                            if (images.length > 0) {
                              const imagePath = images[0].url.startsWith('http') 
                                ? images[0].url 
                                : images[0].url.startsWith('/uploads')
                                  ? images[0].url
                                  : `/uploads/${images[0].url.split('/').pop()}`

                              return (
                                <Image
                                  src={imagePath}
                                  alt={getImageAlt(images[0].url)}
                                  fill
                                  className="object-cover rounded-lg"
                                  priority={true}
                                  loading="eager"
                                  sizes="(max-width: 768px) 80px, 112px"
                                  quality={60}
                                  placeholder="blur"
                                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4dHRsdHSIeHx8iHiMnJyUmJycjIyYmKCgrKCgmLzAwLi45OTk5OTk5OTk5OTk5OTn/2wBDARUXFyAeIB4dHh4iIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiIiL/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
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

