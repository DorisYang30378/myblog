"use client"

import { useState, useRef, useLayoutEffect, useCallback, useEffect, ImgHTMLAttributes } from "react"
import { Menu, Heart, MessageCircle, ChevronRight, ChevronLeft, Share2, Bookmark } from "lucide-react"
import Link from "next/link"
import Breadcrumb from "@/app/components/Breadcrumb"
import TableOfContents from "@/app/components/TableOfContents"
import CommentSection from "@/app/components/CommentSection"
import Footer from "@/app/components/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { debounce } from "lodash"
import ReactMarkdown from 'react-markdown'
import Loading from './loading'
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import type { Components } from 'react-markdown'
import { Button } from "@/components/ui/button"
import { useSession, signIn } from "next-auth/react"
import AuthModal from "@/app/components/AuthModal"
import React from 'react'
import Image from "next/image"

interface CarouselState {
  currentCardIndex: number
  itemsPerView: number
}

interface Article {
  id: number
  title: string
  content: string
  category: {
    name: string
    slug: string
  }
  createdAt: string
  updateDate?: string
  comments?: number
  _count?: {
    comments: number
    likes: number
  }
  isLiked: boolean
  isBookmarked: boolean
}

interface ArticleClientProps {
  params: { id: string }
}

const RelatedArticles = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [isAtEnd, setIsAtEnd] = useState(false)
  const [carouselState, setCarouselState] = useState<CarouselState>({
    currentCardIndex: 0,
    itemsPerView: 2,
  })
  const [relatedArticles, setRelatedArticles] = useState<Array<{
    id: number;
    title: string;
    excerpt: string;
    likes: number;
    comments: number;
  }>>([])
  const [showArrows, setShowArrows] = useState(false)

  useEffect(() => {
    const checkScreenSize = () => {
      let itemsPerView
      if (window.innerWidth >= 768) {
        // md and xl breakpoints
        itemsPerView = 3
      } else {
        // mobile
        itemsPerView = 2
      }
      setCarouselState((prev) => ({
        ...prev,
        itemsPerView: itemsPerView,
      }))
    }
    checkScreenSize()
    window.addEventListener("resize", checkScreenSize)
    return () => window.removeEventListener("resize", checkScreenSize)
  }, [])

  useEffect(() => {
    const currentArticleId = window.location.pathname.split('/article/').pop()
    
    if (!currentArticleId) return
    
    console.log('Fetching related articles for ID:', currentArticleId)
    
    fetch(`/api/articles/${currentArticleId}/related`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        console.log('Related articles:', data)
        setRelatedArticles(data)
      })
      .catch(error => {
        console.error('Failed to fetch related articles:', error)
      })
  }, [])

  // 添加一個檢查
  console.log('Current related articles:', relatedArticles)

  const checkForOverflow = useCallback(() => {
    const container = containerRef.current
    if (container) {
      const hasOverflow = container.scrollWidth > container.clientWidth
      setIsAtEnd(container.scrollLeft + container.clientWidth >= container.scrollWidth - 1)
    }
  }, [])

  const handleScroll = useCallback(() => {
    const container = containerRef.current
    if (container) {
      const isScrolledToLeft = container.scrollLeft > 0
      const isAtEndOfScroll = container.scrollLeft + container.clientWidth >= container.scrollWidth - 1

      setShowLeftArrow(isScrolledToLeft)
      setIsAtEnd(isAtEndOfScroll)

      // Calculate the current card index based on scroll position
      const cardWidth = container.offsetWidth / carouselState.itemsPerView
      const currentCardIndex = Math.round(container.scrollLeft / cardWidth)
      setCarouselState((prev) => ({ ...prev, currentCardIndex }))
    }
  }, [carouselState.itemsPerView])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      // Add small delay to ensure content is properly rendered
      const timer = setTimeout(() => {
        checkForOverflow()
        handleScroll() // Call handleScroll to set initial arrow states
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [checkForOverflow, handleScroll])

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      const debouncedHandleScroll = debounce(handleScroll, 100)
      container.addEventListener("scroll", debouncedHandleScroll)

      handleScroll()

      return () => {
        container.removeEventListener("scroll", debouncedHandleScroll)
        debouncedHandleScroll.cancel()
      }
    }
  }, [handleScroll])

  useEffect(() => {
    const handleResize = debounce(() => {
      checkForOverflow()
      handleScroll()
    }, 100)

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [checkForOverflow, handleScroll])

  const scrollCarousel = (direction: "left" | "right") => {
    const container = containerRef.current
    if (container) {
      const cardWidth = (container.offsetWidth - 2) / carouselState.itemsPerView // 減去 padding
      const scrollAmount = direction === "left" ? -cardWidth : cardWidth
      const targetScroll = Math.round((container.scrollLeft + scrollAmount) / cardWidth) * cardWidth

      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      })
    }
  }

  useEffect(() => {
    const container = containerRef.current
    if (container) {
      // 檢查內容是否超出容器
      const hasOverflow = container.scrollWidth > container.clientWidth
      setShowArrows(hasOverflow)
    }
  }, [relatedArticles]) // 當文章改變時重新檢查

  // 如果沒有相關文章，直接返回 null
  if (!relatedArticles || relatedArticles.length === 0) {
    return null
  }

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h2 className="text-2xl font-bold text-[#5C4033] dark:text-white mb-6">相關文章</h2>
      <div
        className="relative px-6 max-w-[calc(100%+48px)] -mx-6 flex justify-center items-center overflow-visible"
        style={{
          width: "calc(100% + 48px)",
          margin: "0 -24px", // 確保容器的外邊距是對稱的
        }}
      >
        {showArrows && showLeftArrow && (
          <ChevronLeft
            className={`absolute -left-1 md:-left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 ${
              carouselState.currentCardIndex === 0
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "text-[#A67B5B] dark:text-gray-300 cursor-pointer hover:text-[#8B7355] dark:hover:text-white"
            } transition-colors`}
            onClick={() => carouselState.currentCardIndex > 0 && scrollCarousel("left")}
          />
        )}
        {showArrows && !isAtEnd && (
          <ChevronRight
            className={`absolute -right-1 md:-right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 ${
              isAtEnd
                ? "text-gray-300 dark:text-gray-600 cursor-not-allowed"
                : "text-[#A67B5B] dark:text-gray-300 cursor-pointer hover:text-[#8B7355] dark:hover:text-white"
            } transition-colors`}
            onClick={() => !isAtEnd && scrollCarousel("right")}
          />
        )}
        <div
          ref={containerRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 relative scroll-smooth px-1 mx-auto"
          style={{
            scrollSnapType: "x mandatory",
            width: "100%",
            maxWidth: "min(100vw - 48px, 976px)", // 調整最大寬度以確保置中
            display: "flex",
            gap: "1rem",
            margin: "0 auto", // 確保內容置中
          }}
        >
          {relatedArticles.map((article, index) => (
            <div
              key={`${article.id}-${index}`}
              className="w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)] flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              style={{
                scrollSnapAlign: "start",
                margin: "0 auto", // 確保每個卡片也是置中的
              }}
            >
              <Link href={`/article/${article.id}`} className="block h-full">
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 dark:bg-gray-700">
                  <CardContent className="p-5">
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-[#5C4033] dark:text-gray-100 hover:text-[#8B7355] dark:hover:text-gray-300 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-xs sm:text-sm lg:text-base text-[#333333] dark:text-gray-100 mt-1.5 line-clamp-2">
                          {article.excerpt}
                        </p>
                      </div>
                      <div className="flex items-center gap-4 text-gray-500 dark:text-gray-100">
                        <div className="flex items-center gap-1">
                          <Heart className="w-4 h-4" />
                          <span className="text-xs">{article.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          <span className="text-xs">{article.comments}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

const ArticleActions = ({ 
  articleId,
  totalComments,
  totalLikes: initialTotalLikes,
  onCommentClick,
  className = ""
}: { 
  articleId: number
  totalComments: number
  totalLikes: number
  onCommentClick: () => void
  className?: string
}) => {
  const [isLiked, setIsLiked] = useState(false)
  const [totalLikes, setTotalLikes] = useState(initialTotalLikes)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const { data: session } = useSession()

  const handleAction = async (action: () => Promise<void>) => {
    console.log('handleAction 被觸發')
    console.log('用戶登入狀態:', !!session)
    
    if (!session) {
      setIsAuthModalOpen(true)
      return
    }
    await action()
  }

  const handleLike = async () => {
    console.log('按讚按鈕被點擊')
    try {
      console.log('開始發送按讚請求，articleId:', articleId)
      const response = await fetch(`/api/articles/${articleId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      console.log('按讚請求回應狀態:', response.status)
      
      if (!response.ok) {
        throw new Error('按讚失敗')
      }

      const data = await response.json()
      console.log('按讚請求回應數據:', data)
      
      setIsLiked(data.liked)
      setTotalLikes(data.totalLikes)
    } catch (error) {
      console.error('按讚出錯:', error)
    }
  }

  const handleBookmark = async () => {
    try {
      const response = await fetch(`/api/articles/${articleId}/bookmark`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      if (!response.ok) {
        throw new Error('收藏失敗')
      }

      const data = await response.json()
      setIsBookmarked(data.bookmarked)
    } catch (error) {
      console.error('Bookmark error:', error)
    }
  }

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: document.title,
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      window.alert('已複製連結')
    }
  }

  const handleComment = () => {
    if (!session) {
      setIsAuthModalOpen(true)
      return
    }
    onCommentClick()
  }

  // 檢查收藏狀態
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!session) return
      
      try {
        const response = await fetch(`/api/articles/${articleId}/bookmark`)
        if (response.ok) {
          const data = await response.json()
          setIsBookmarked(data.bookmarked)
        }
      } catch (error) {
        console.error('檢查收藏狀態失敗:', error)
      }
    }

    checkBookmarkStatus()
  }, [articleId, session])

  // 檢查按讚狀態
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!session) return
      
      try {
        const response = await fetch(`/api/articles/${articleId}/like`)
        if (response.ok) {
          const { liked, totalLikes: newTotalLikes } = await response.json()
          setIsLiked(liked)
          setTotalLikes(newTotalLikes)
        }
      } catch (error) {
        console.error('檢查按讚狀態失敗:', error)
      }
    }

    checkLikeStatus()
  }, [articleId, session])

  return (
    <>
      <div className={`flex items-center gap-1.5 h-[40px] ${className}`}>
        <Button
          variant="ghost"
          className="text-[#5C4033] dark:text-white hover:bg-accent/10 flex items-center gap-1 group md:p-2"
          onClick={() => handleAction(handleLike)}
        >
          {isLiked ? (
            <Heart className="h-5 w-5 md:h-8 md:w-8 fill-current transition-transform group-hover:scale-110" />
          ) : (
            <Heart className="h-5 w-5 md:h-8 md:w-8 transition-transform group-hover:scale-110" />
          )}
          <span className="text-sm font-medium md:text-base lg:text-base transition-colors group-hover:text-[#5C4033] dark:group-hover:text-white tablet:text-lg">
            {totalLikes}
          </span>
        </Button>
        <Button
          variant="ghost"
          className="text-[#5C4033] dark:text-white hover:bg-accent/10 flex items-center gap-1 group md:p-2"
          onClick={handleComment}
        >
          <MessageCircle className="h-6 w-6 md:h-8 md:w-8 transition-transform group-hover:scale-110" />
          <span className="text-sm font-medium md:text-base lg:text-base transition-colors group-hover:text-[#5C4033] dark:group-hover:text-white tablet:text-lg">
            {totalComments}
          </span>
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#5C4033] dark:text-white hover:bg-accent/10 group md:p-2"
          onClick={() => handleAction(handleBookmark)}
        >
          {isBookmarked ? (
            <Bookmark className="h-5 w-5 md:h-8 md:w-8 fill-current transition-transform group-hover:scale-110" />
          ) : (
            <Bookmark className="h-5 w-5 md:h-8 md:w-8 transition-transform group-hover:scale-110" />
          )}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-[#5C4033] dark:text-white hover:bg-accent/10 group md:p-2"
          onClick={handleShare}
        >
          <Share2 className="h-5 w-5 md:h-8 md:w-8 transition-transform group-hover:scale-110" />
        </Button>
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  )
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

export default function ArticleClient({ params }: ArticleClientProps) {
  const [article, setArticle] = useState<Article | null>(null)
  const [isTocModalOpen, setIsTocModalOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const { data: session } = useSession()
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false)
  const [commentCount, setCommentCount] = useState(0)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // 獲取文章基本信息
        const response = await fetch(`/api/articles/${params.id}`)
        const data = await response.json()

        // 獲取按讚狀態和總數
        const likeResponse = await fetch(`/api/articles/${params.id}/like`)
        const { liked, totalLikes } = await likeResponse.json()
        
        // 獲取收藏狀態
        const bookmarkResponse = await fetch(`/api/articles/${params.id}/bookmark`)
        const { bookmarked } = await bookmarkResponse.json()
        
        // 整合所有數據
        setArticle({
          id: data.id,
          title: data.title,
          content: data.content,
          category: {
            name: data.category.name,
            slug: data.category.slug
          },
          createdAt: data.createdAt,
          updateDate: data.updatedAt,
          comments: data._count?.comments || 0,
          _count: {
            comments: data._count?.comments || 0,
            likes: totalLikes || 0
          },
          isLiked: liked,
          isBookmarked: bookmarked
        })
      } catch (error) {
        console.error('獲取文章失敗:', error)
      }
    }

    fetchArticle()
  }, [params.id])

  // 添加檢查收藏狀態的 useEffect
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!session) return
      
      try {
        const response = await fetch(`/api/articles/${article?.id}/bookmark`)
        if (response.ok) {
          const data = await response.json()
          setIsBookmarked(data.bookmarked)
        }
      } catch (error) {
        console.error('檢查收藏狀態失敗:', error)
      }
    }

    if (article) {
      checkBookmarkStatus()
    }
  }, [article?.id, session])

  const handleCommentClick = () => {
    if (!session) {
      setIsAuthModalOpen(true)
      return
    }
    setIsCommentDialogOpen(!isCommentDialogOpen)
  }

  if (!article) {
    return <Loading />
  }

  const ArticleTOC = ({
    className = "",
    onItemClick,
    isMobile = false,
  }: {
    className?: string
    onItemClick?: () => void
    isMobile?: boolean
  }) => (
    <nav
      className={`${
        isMobile ? "bg-[#FAF6F1] dark:bg-gray-800" : "bg-white dark:bg-gray-700"
      } rounded-lg shadow-sm p-2 ${className}`}
      aria-label="Table of Contents"
    >
      <TableOfContents
        content={article.content}
        onItemClick={onItemClick}
        className={isMobile ? "text-[#5D4037] dark:text-gray-200 mobile-toc" : ""}
      />
    </nav>
  )

  const customComponents = {
    img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
      if (!props.src) return null
      return (
        <div className="my-4 flex justify-center">
          <div className="relative w-full max-w-xl">
            <Image
              src={props.src}
              alt={getImageAlt(props.src)}
              width={600}
              height={300}
              className="rounded-lg object-contain mx-auto"
              priority
              loading="eager"
            />
          </div>
        </div>
      )
    }
  }

  return (
    <div suppressHydrationWarning className="bg-[#FAF3E8] dark:bg-gray-900">
      <div className="min-h-screen">
        {/* Desktop Layout - Two columns */}
        <div className="hidden xl:block relative">
          {/* Left Sidebar */}
          <aside className="w-fit xl:w-[280px] fixed top-[80px] left-0 h-[calc(100vh-80px)] bg-[#FAF3E8] dark:bg-gray-900 overflow-y-auto">
            <div className="pt-0 px-4">
              <ArticleTOC className="w-full" />
            </div>
          </aside>

          {/* Main Content */}
          <main className="ml-[280px] mr-[300px] px-5 pt-[16px] pb-12 bg-white dark:bg-gray-800">
            <article className="p-0 max-w-3xl mx-auto">
              <div className="prose dark:prose-invert mb-1 text-dark-brown dark:text-gray-300">
                <Breadcrumb
                  items={[
                    { label: '首頁', href: '/' },
                    { label: article.category.name, href: `/categories/${article.category.slug}` },
                    { label: article.title, href: '#' }
                  ]}
                  className="py-2 text-[#666666] dark:text-gray-400 text-lg md:text-xl lg:text-lg"
                  separatorClassName="mx-2 md:mx-3"
                />
              </div>
              <h1 className="text-4xl font-bold mb-5 break-keep text-left max-w-[600px] text-[#5C4033] dark:text-white">
                {article.title}
              </h1>
              <div className="flex items-center gap-3 text-sm text-[#999999] dark:text-gray-400 mb-8">
                <time dateTime={article.createdAt} className="flex items-center">
                  <span className="mr-1">發布</span>
                  {new Date(article.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
                <span className="text-[#888888] dark:text-gray-500">•</span>
                <time dateTime={article.updateDate} className="flex items-center">
                  更新於 3天前
                </time>
              </div>
              <div className="prose dark:prose-invert prose-lg md:prose-xl lg:prose-xl max-w-none 
                [&>h2]:border-l-4 [&>h2]:border-[#A67B5B] dark:[&>h2]:border-white 
                [&>h2]:pl-4 [&>h2]:py-2 [&>h2]:bg-[#A67B5B]/5 dark:[&>h2]:bg-white/10 
                [&>h2]:text-[#5C4033] dark:[&>h2]:text-white 
                [&>h2]:text-2xl md:[&>h2]:text-3xl lg:[&>h2]:text-2xl 
                [&>p]:mb-5 [&>p]:leading-relaxed md:[&>p]:leading-loose lg:[&>p]:leading-relaxed 
                [&>p]:text-[#333333] dark:[&>p]:text-gray-300 
                [&>p]:text-base md:[&>p]:text-lg lg:[&>p]:text-xl">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={{
                    ...customComponents,
                    h2: ({ node, ...props }) => (
                      <h2 className="border-l-4 border-[#A67B5B] dark:border-white pl-4 py-2 bg-[#A67B5B]/5 dark:bg-white/10 text-[#5C4033] dark:text-white text-2xl md:text-3xl lg:text-2xl">
                        {typeof props.children === 'object' 
                          ? JSON.stringify(props.children) 
                          : props.children}
                      </h2>
                    ),
                    p: ({ node, ...props }) => (
                      <p className="mb-5 leading-relaxed md:leading-loose lg:leading-relaxed text-[#333333] dark:text-gray-300 text-base md:text-lg lg:text-xl">
                        {Array.isArray(props.children) 
                          ? props.children.map((child, i) => {
                              if (child === null || child === undefined) return null
                              if (typeof child === 'object') {
                                // 如果是 React 元素，直接返回
                                if (React.isValidElement(child)) return child
                                // 如果是普通對象，轉換為字符串
                                return JSON.stringify(child)
                              }
                              return child
                            })
                          : typeof props.children === 'object'
                            ? JSON.stringify(props.children)
                            : props.children
                        }
                      </p>
                    ),
                  }}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
              {/* Related Articles Section */}
              <RelatedArticles />
              <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-3xl font-bold text-[#5C4033] dark:text-white">留言</h2>
                  <ArticleActions 
                    articleId={article.id}
                    totalComments={article.comments ?? 0}
                    totalLikes={article._count?.likes ?? 0}
                    onCommentClick={handleCommentClick}
                    className="scale-125 origin-right"
                  />
                </div>
                <CommentSection 
                  articleId={article.id} 
                  onNeedAuth={() => setIsAuthModalOpen(true)}
                  isOpen={isCommentDialogOpen}
                  onClose={() => setIsCommentDialogOpen(!isCommentDialogOpen)}
                  onCommentCountChange={(count) => {
                    if (count > 0) {
                      setCommentCount(count)
                      setArticle(prev => prev ? {
                        ...prev,
                        comments: count,
                        _count: {
                          ...prev._count,
                          comments: count,
                          likes: prev._count?.likes || 0
                        }
                      } : null)
                    }
                  }}
                />
              </div>
            </article>
          </main>

          {/* Right Sidebar */}
          <aside className="w-[300px] fixed top-20 right-0 h-[calc(100vh-5rem)] bg-[#FAF3E8] dark:bg-gray-900 overflow-y-auto">
            <div className="p-6">{/* Add content for the right sidebar here */}</div>
          </aside>
        </div>

        {/* Mobile Layout */}
        <div className="xl:hidden bg-white dark:bg-gray-800">
          <main className="pt-4 pb-12">
            <div className="px-8 sm:px-12 md:px-16">
              <article>
                <h1 className="text-3xl md:text-4xl lg:text-3xl font-bold mb-4 md:mb-6 break-keep text-left text-[#5C4033] dark:text-white">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm md:text-base lg:text-sm text-dark-brown/60 dark:text-gray-400 mb-6 md:mb-8">
                  <time dateTime={article.createdAt} className="flex items-center">
                    <span className="mr-1">發布</span>
                    {new Date(article.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </time>
                  <span className="text-dark-brown/40 dark:text-gray-500">•</span>
                  <time dateTime={article.updateDate} className="flex items-center">
                    <span className="mr-1">更新</span>
                    3天前
                  </time>
                </div>
                <div className="prose dark:prose-invert prose-lg md:prose-xl lg:prose-xl max-w-none 
                  [&>h2]:border-l-4 [&>h2]:border-[#A67B5B] dark:[&>h2]:border-white 
                  [&>h2]:pl-4 [&>h2]:py-2 [&>h2]:bg-[#A67B5B]/5 dark:[&>h2]:bg-white/10 
                  [&>h2]:text-[#5C4033] dark:[&>h2]:text-white 
                  [&>h2]:text-2xl md:[&>h2]:text-3xl lg:[&>h2]:text-2xl 
                  [&>p]:mb-5 [&>p]:leading-relaxed md:[&>p]:leading-loose lg:[&>p]:leading-relaxed 
                  [&>p]:text-[#333333] dark:[&>p]:text-gray-300 
                  [&>p]:text-base md:[&>p]:text-lg lg:[&>p]:text-xl">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={{
                      h2: ({ node, ...props }) => (
                        <h2 className="border-l-4 border-[#A67B5B] dark:border-white pl-4 py-2 bg-[#A67B5B]/5 dark:bg-white/10 text-[#5C4033] dark:text-white text-2xl md:text-3xl lg:text-2xl">
                          {typeof props.children === 'object' 
                            ? JSON.stringify(props.children) 
                            : props.children}
                        </h2>
                      ),
                      p: ({ node, ...props }) => (
                        <p className="mb-5 leading-relaxed md:leading-loose lg:leading-relaxed text-[#333333] dark:text-gray-300 text-base md:text-lg lg:text-xl">
                          {Array.isArray(props.children) 
                            ? props.children.map((child, i) => {
                                if (child === null || child === undefined) return null
                                if (typeof child === 'object') {
                                  // 如果是 React 元素，直接返回
                                  if (React.isValidElement(child)) return child
                                  // 如果是普通對象，轉換為字符串
                                  return JSON.stringify(child)
                                }
                                return child
                              })
                            : typeof props.children === 'object'
                              ? JSON.stringify(props.children)
                              : props.children
                          }
                        </p>
                      ),
                      img: ({ node, ...props }) => (
                        <img 
                          {...props} 
                          className="max-w-full h-auto mx-auto my-4 rounded-lg shadow-md"
                          style={{ maxHeight: '400px', objectFit: 'contain' }}
                        />
                      )
                    }}
                  >
                    {article.content}
                  </ReactMarkdown>
                </div>

                {/* Related Articles Section - Mobile */}
                <RelatedArticles />
                <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-[#5C4033] dark:text-white">留言</h2>
                    <ArticleActions 
                      articleId={article.id}
                      totalComments={article.comments ?? 0}
                      totalLikes={article._count?.likes ?? 0}
                      onCommentClick={handleCommentClick}
                      className="scale-110 md:scale-125 origin-right"
                    />
                  </div>
                  <CommentSection 
                    articleId={article.id} 
                    onNeedAuth={() => setIsAuthModalOpen(true)}
                    isOpen={isCommentDialogOpen}
                    onClose={() => setIsCommentDialogOpen(!isCommentDialogOpen)}
                    onCommentCountChange={(count) => {
                      if (count > 0) {
                        setCommentCount(count)
                        setArticle(prev => prev ? {
                          ...prev,
                          comments: count,
                          _count: {
                            ...prev._count,
                            comments: count,
                            likes: prev._count?.likes || 0
                          }
                        } : null)
                      }
                    }}
                  />
                </div>
              </article>
            </div>
          </main>

          <div className="xl:hidden fixed bottom-4 right-4 z-[10]">
            {/* Floating TOC button for mobile */}
            <button
              ref={buttonRef}
              onClick={() => setIsTocModalOpen(!isTocModalOpen)}
              className="bg-[#A67B5B] dark:bg-gray-700 text-[#F5E6D3] dark:text-gray-200 p-3 rounded-full shadow-lg relative"
              aria-label="Toggle Table of Contents"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* TOC overlay for mobile */}
            {isTocModalOpen && (
              <div className="fixed inset-0 z-50" onClick={() => setIsTocModalOpen(false)}>
                <div
                  className="absolute right-4 bottom-20 bg-[#FAF6F1] dark:bg-gray-800 rounded-lg max-w-[90vw] overflow-y-auto shadow-xl transform transition-all duration-300 ease-in-out"
                  onClick={(e) => e.stopPropagation()}
                  style={{
                    transform: `translateX(${isTocModalOpen ? "0" : "100%"})`,
                  }}
                >
                  <div className="relative">
                    <ArticleTOC onItemClick={() => setIsTocModalOpen(false)} isMobile={true} className="p-2 w-fit" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="relative z-[5] bg-[#FAF3E8] dark:bg-gray-900">
        <Footer />
      </div>
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  )
}

