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
  images?: string
  thumbnail?: string | null
}

interface ArticleClientProps {
  params: {
    slug: string;
  };
}

const RelatedArticles = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAtStart, setIsAtStart] = useState(true)
  const [isAtEnd, setIsAtEnd] = useState(false)
  const [relatedArticles, setRelatedArticles] = useState<Array<{
    id: number;
    title: string;
    excerpt: string;
    likes: number;
    comments: number;
    slug?: string;
  }>>([])

  useEffect(() => {
    const currentArticleSlug = window.location.pathname.split('/article/').pop()
    
    if (!currentArticleSlug) return
    
    console.log('Fetching related articles for slug:', currentArticleSlug)
    
    fetch(`/api/articles/${currentArticleSlug}/related`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        console.log('Related articles:', data)
        // 對文章進行排序，從舊到新（按發布日期升序排列）
        const sortedArticles = [...data]
          .sort((a, b) => {
            // 假設文章對象有 createdAt 字段
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateA.getTime() - dateB.getTime(); // 升序排列，舊的在前
          })
          .slice(0, 15); // 限制最多 15 張卡片
          
        setRelatedArticles(sortedArticles)
      })
      .catch(error => {
        console.error('Failed to fetch related articles:', error)
      })
  }, [])

  // 檢查是否在開始或結束位置
  useEffect(() => {
    if (!relatedArticles.length) return
    
    const itemsPerView = window.innerWidth >= 768 ? 3 : 2
    
    setIsAtStart(currentIndex === 0)
    setIsAtEnd(currentIndex >= relatedArticles.length - itemsPerView)
  }, [currentIndex, relatedArticles.length])

  // 添加滾動監聽
  useEffect(() => {
    const container = containerRef.current
    if (!container || !relatedArticles.length) return

    const handleScroll = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container
      
      // 檢查是否在開始位置
      const atStart = scrollLeft <= 10
      
      // 檢查是否在結束位置 (允許10像素的誤差)
      const atEnd = scrollLeft + clientWidth >= scrollWidth - 10
      
      // 更新狀態
      setIsAtStart(atStart)
      setIsAtEnd(atEnd)
      
      // 計算當前索引
      const itemsPerView = window.innerWidth >= 768 ? 3 : 2
      const cardWidth = container.offsetWidth / itemsPerView
      const newIndex = Math.round(scrollLeft / cardWidth)
      
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex)
      }
    }

    container.addEventListener('scroll', handleScroll)
    
    // 初始化時檢查一次
    handleScroll()
    
    return () => {
      container.removeEventListener('scroll', handleScroll)
    }
  }, [relatedArticles.length, currentIndex])

  const scrollCarousel = (direction: "left" | "right") => {
    const container = containerRef.current
    if (!container) return

    let cardWidth = container.offsetWidth / 2
    if (window.innerWidth >= 768) {
      cardWidth = container.offsetWidth / 3
    }

    const newIndex = direction === "left" 
      ? Math.max(0, currentIndex - 1)
      : Math.min(relatedArticles.length - 1, currentIndex + 1)

    setCurrentIndex(newIndex)
    
    container.scrollTo({
      left: newIndex * cardWidth,
      behavior: "smooth"
    })
  }

  // 如果沒有相關文章，直接返回 null
  if (!relatedArticles || relatedArticles.length === 0) {
    return null
  }

  return (
    <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
      <h2 className="text-2xl md:text-[28px] font-bold text-[#5C4033] dark:text-white mb-6">相關文章</h2>
      <div className="relative px-6 max-w-[calc(100%+48px)] -mx-6">
        {/* 左箭頭 - 永遠顯示，但根據狀態改變樣式 */}
        <ChevronLeft
          className={`absolute -left-1 md:-left-3 top-1/2 -translate-y-1/2 z-10 h-8 w-8 
            ${isAtStart 
              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" 
              : "text-[#A67B5B] dark:text-gray-300 cursor-pointer hover:text-[#8B7355] dark:hover:text-white"
            } transition-colors`}
          onClick={() => !isAtStart && scrollCarousel("left")}
        />
        
        {/* 右箭頭 - 永遠顯示，但根據狀態改變樣式 */}
        <ChevronRight
          className={`absolute -right-1 md:-right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 
            ${isAtEnd 
              ? "text-gray-300 dark:text-gray-600 cursor-not-allowed" 
              : "text-[#A67B5B] dark:text-gray-300 cursor-pointer hover:text-[#8B7355] dark:hover:text-white"
            } transition-colors`}
          onClick={() => !isAtEnd && scrollCarousel("right")}
        />
        
        <div
          ref={containerRef}
          className="flex overflow-x-auto scrollbar-hide gap-4 relative scroll-smooth px-1"
          style={{
            scrollSnapType: "x mandatory",
          }}
        >
          {relatedArticles.map((article, index) => (
            <div
              key={`${article.id}-${index}`}
              className="w-[calc(50%-0.5rem)] md:w-[calc(33.333%-0.67rem)] flex-shrink-0 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
              style={{
                scrollSnapAlign: "start",
              }}
            >
              <Link href={`/article/${article.slug || article.id}`} className="block h-full">
                <Card className="h-full hover:shadow-lg transition-shadow duration-200 dark:bg-gray-700">
                  <CardContent className="p-5">
                    <div className="space-y-2">
                      <div>
                        <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-[#5C4033] dark:text-gray-100 hover:text-[#8B7355] dark:hover:text-gray-300 transition-colors line-clamp-2">
                          {article.title}
                        </h3>
                        <p className="text-sm min-[320px]:text-sm lg:text-base text-[#333333] dark:text-gray-100 mt-1.5 line-clamp-2">
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
  articleSlug,
  totalComments,
  totalLikes: initialTotalLikes,
  onCommentClick,
  className = ""
}: { 
  articleSlug: string
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
      console.log('開始發送按讚請求，articleSlug:', articleSlug)
      const response = await fetch(`/api/articles/${articleSlug}/like`, {
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
      const response = await fetch(`/api/articles/${articleSlug}/bookmark`, {
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
        const response = await fetch(`/api/articles/${articleSlug}/bookmark`)
        if (response.ok) {
          const data = await response.json()
          setIsBookmarked(data.bookmarked)
        }
      } catch (error) {
        console.error('檢查收藏狀態失敗:', error)
      }
    }

    checkBookmarkStatus()
  }, [articleSlug, session])

  // 檢查按讚狀態
  useEffect(() => {
    const checkLikeStatus = async () => {
      if (!session) return
      
      try {
        const response = await fetch(`/api/articles/${articleSlug}/like`)
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
  }, [articleSlug, session])

  // 在 ArticleActions 組件中添加登入事件監聽器
  useEffect(() => {
    const fetchStatus = async () => {
      if (!session?.user) return;
      
      try {
        // 獲取按讚狀態
        const likeResponse = await fetch(`/api/articles/${articleSlug}/like`);
        const likeData = await likeResponse.json();
        setIsLiked(likeData.liked);
        setTotalLikes(likeData.totalLikes);
        
        // 獲取收藏狀態
        const bookmarkResponse = await fetch(`/api/articles/${articleSlug}/bookmark`);
        const bookmarkData = await bookmarkResponse.json();
        setIsBookmarked(bookmarkData.bookmarked);
      } catch (error) {
        console.error('獲取文章狀態失敗:', error);
      }
    };

    // 登入成功時刷新狀態
    const handleLoginSuccess = () => {
      console.log('用戶登入成功，重新載入文章狀態');
      fetchStatus();
    };
    
    // 初始載入時獲取狀態
    fetchStatus();
    
    // 添加事件監聽器
    window.addEventListener('user-login-success', handleLoginSuccess);
    
    return () => {
      window.removeEventListener('user-login-success', handleLoginSuccess);
    };
  }, [session, articleSlug]);

  return (
    <>
      <div className={`flex items-center gap-0 md:gap-1.5 h-[40px] ${className}`}>
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
    // 移除時間戳和亂碼 (例如: 網頁頭像-1739717063706-jf90b9 -> 網頁頭像)
    const fileName = decodedUrl.split('/').pop()?.split('.')[0].replace(/-\d+-[a-z0-9]+$/, '') || ''
    return /[\u4e00-\u9fa5]/.test(fileName)
      ? fileName
      : fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  } catch (error) {
    return '文章圖片'
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('zh-TW', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  })
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
  const [hideImageCaptions, setHideImageCaptions] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        setIsLoading(true)
        const response = await fetch(`/api/articles/${params.slug}`)
        
        if (!response.ok) {
          throw new Error('文章獲取失敗')
        }
        
        const data = await response.json()
        // 檢查是否有隱藏圖片說明的標記
        const hasHideImageCaptionsTag = data.content.includes('<!-- HIDE_IMAGE_CAPTIONS -->');
        
        // 如果有標記，從內容中移除它
        if (hasHideImageCaptionsTag) {
          data.content = data.content.replace('<!-- HIDE_IMAGE_CAPTIONS -->', '').trim();
          setHideImageCaptions(true);
        } else {
          setHideImageCaptions(false); // 確保在沒有標記時設置為 false
        }

        // 獲取按讚狀態和總數
        const likeResponse = await fetch(`/api/articles/${params.slug}/like`)
        const { liked, totalLikes } = await likeResponse.json()
        
        // 獲取收藏狀態
        const bookmarkResponse = await fetch(`/api/articles/${params.slug}/bookmark`)
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
          isBookmarked: bookmarked,
          images: data.images,
          thumbnail: data.thumbnail
        })
      } catch (error) {
        console.error('獲取文章失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchArticle()
  }, [params.slug])

  // 添加檢查收藏狀態的 useEffect
  useEffect(() => {
    const checkBookmarkStatus = async () => {
      if (!session) return
      
      try {
        const response = await fetch(`/api/articles/${params.slug}/bookmark`)
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
  }, [params.slug, session])

  const handleCommentClick = () => {
    if (!session) {
      setIsAuthModalOpen(true)
      return
    }
    setIsCommentDialogOpen(!isCommentDialogOpen)
  }

  if (isLoading) {
    return <Loading />
  }
  
  if (!article) {
    return <div>找不到文章</div>
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
        isMobile ? "bg-[#FAF6F1] dark:bg-gray-800" : "bg-[#F8F5F0] dark:bg-gray-700"
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

  const customComponents: Components = {
    img: (props: ImgHTMLAttributes<HTMLImageElement>) => {
      if (!props.src) return null
      
      const imagePath = (() => {
        let path = props.src
        
        // 處理重複的 /uploads 路徑
        if (path.includes('/uploads//uploads')) {
          path = path.replace('/uploads//uploads', '/uploads')
        }
        
        // 如果是完整的 URL，只保留路徑部分
        if (path.includes('zeabur.app')) {
          path = path.split('.app').pop() || path
        }
        
        // 處理 /data/uploads 路徑
        if (path.startsWith('/data/uploads')) {
          path = path.replace('/data/uploads', '/uploads')
        }
        
        // 不要修改已經正確的路徑
        if (!path.startsWith('/') && !path.startsWith('http')) {
          path = `/uploads/${path}`
        } else if (path.startsWith('/uploads/')) {
          // 確保路徑格式正確，不要再處理
          path = path
        }
        
        // 確保不會有重複的斜杠
        path = path.replace(/\/+/g, '/')
        
        console.log('原始圖片路徑:', props.src, '處理後路徑:', path)
        
        return path
      })()

      // 總是從文件名生成 alt 文本，忽略 props.alt
      const imageAlt = getImageAlt(imagePath)
      
      // 從路徑中提取檔名
      const fileName = imagePath.split('/').pop() || '';
      
      // 檢查是否需要隱藏此圖片的說明
      // 1. 全局設置：如果文章設置了隱藏所有圖片說明
      // 2. 檔名規則：如果檔名以 "no" 開頭
      const shouldHideThisCaption = hideImageCaptions || 
        fileName.toLowerCase().startsWith('no');

      return (
        <div className="my-2">
          <div className="w-[90%] md:w-[75%] mx-auto">
            <div className="relative">
              <Image
                src={imagePath}
                alt={imageAlt}
                width={1200}
                height={800}
                className="mx-auto object-contain cursor-zoom-in"
                priority={true}
                loading="eager"
                sizes="(max-width: 768px) 90vw, 75vw"
                quality={100}
                onClick={() => {
                  const modal = document.createElement('div')
                  modal.className = 'fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50'
                  modal.onclick = () => modal.remove()
                  const img = document.createElement('img')
                  img.src = imagePath
                  img.className = 'max-h-[90vh] max-w-[90vw] object-contain'
                  modal.appendChild(img)
                  document.body.appendChild(modal)
                }}
              />
              {!shouldHideThisCaption && imageAlt && (
                <div className="text-lg text-gray-500 dark:text-gray-400 text-center -mt-6 md:-mt-8">
                  {imageAlt}
                </div>
              )}
            </div>
          </div>
        </div>
      )
    },
    
    // 簡化連結處理
    a: ({ href, children }) => {
      const isExternal = href && (href.startsWith('http') || href.startsWith('https'))
      
      return (
        <a 
          href={href} 
          target={isExternal ? "_blank" : undefined}
          rel={isExternal ? "noopener noreferrer" : undefined}
          className="text-[#A67B5B] hover:text-[#8B7355] dark:text-blue-400 dark:hover:text-blue-300 underline"
        >
          {children}
        </a>
      )
    },
    h1: ({ children }) => (
      <h1 className="text-3xl md:text-4xl lg:text-4xl font-bold mt-8 mb-6 leading-tight md:leading-normal lg:leading-relaxed">
        {children}
      </h1>
    ),
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
          <main className="ml-[280px] mr-[300px] px-5 pt-[16px] pb-12 bg-[#F8F5F0] dark:bg-gray-800">
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
              <h1 className="text-4xl font-bold mb-5 whitespace-normal break-words text-left text-[#5C4033] dark:text-white md:text-6xl xl:text-4xl">
                {article.title}
              </h1>
              <div className="flex flex-wrap items-center gap-2 text-sm md:text-base lg:text-sm text-dark-brown/60 dark:text-gray-400 mb-6 md:mb-8">
                <time dateTime={article.createdAt} className="flex items-center">
                  <span className="mr-1">發布</span>
                  {formatDate(article.createdAt)}
                </time>
                {article.updateDate && article.updateDate !== article.createdAt && (
                  <>
                    <span className="text-dark-brown/40 dark:text-gray-500">•</span>
                    <time dateTime={article.updateDate} className="flex items-center">
                      <span className="mr-1">更新於</span>
                      {formatDate(article.updateDate)}
                    </time>
                  </>
                )}
              </div>
              <div className="prose dark:prose-invert prose-lg md:prose-xl lg:prose-xl max-w-none 
                [&>h1]:mt-8 [&>h1]:mb-6 md:[&>h1]:mt-14 md:[&>h1]:mb-12 lg:[&>h1]:mt-16 lg:[&>h1]:mb-14
                [&>h1]:!leading-[1.4] md:[&>h1]:!leading-[1.6] lg:[&>h1]:!leading-[1.8]
                [&>h2]:border-l-4 [&>h2]:border-[#A67B5B] dark:[&>h2]:border-white 
                [&>h2]:pl-4 [&>h2]:py-2 [&>h2]:bg-[#A67B5B]/5 dark:[&>h2]:bg-white/10 
                [&>h2]:text-[#5C4033] dark:[&>h2]:text-white 
                [&>h2]:text-2xl md:[&>h2]:text-[1.5rem] xl:[&>h2]:text-[1.65rem] 
                [&>h3]:text-xl md:[&>h3]:text-2xl lg:[&>h3]:text-2xl
                [&>p]:mb-5 [&>p]:leading-relaxed md:[&>p]:leading-loose lg:[&>p]:leading-relaxed 
                [&>p]:text-[#333333] dark:[&>p]:text-gray-300 
                [&>p]:text-lg md:[&>p]:text-xl lg:[&>p]:text-xl
                [&_ul_li::marker]:text-[#333333] dark:[&_ul_li::marker]:text-gray-300
                [&_ol_li::marker]:text-[#333333] dark:[&_ol_li::marker]:text-gray-300
                [&_ul_li]:text-[#333333] dark:[&_ul_li]:text-gray-300
                [&_ol_li]:text-[#333333] dark:[&_ol_li]:text-gray-300
                [&_li]:text-[#333333] dark:[&_li]:text-gray-300
                [&_li_p]:text-[#333333] dark:[&_li_p]:text-gray-300">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  components={customComponents}
                >
                  {article.content}
                </ReactMarkdown>
              </div>
              {/* Related Articles Section */}
              <RelatedArticles />
              <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl md:text-[28px] font-bold text-[#5C4033] dark:text-white">留言</h2>
                  <ArticleActions 
                    articleSlug={params.slug}
                    totalComments={article.comments ?? 0}
                    totalLikes={article._count?.likes ?? 0}
                    onCommentClick={handleCommentClick}
                    className="scale-105 md:scale-110 origin-right"
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
        <div className="xl:hidden bg-[#F8F5F0] dark:bg-gray-800">
          <main className="pt-4 pb-12">
            <div className="px-8 sm:px-12 md:px-16">
              <article>
                <h1 className="text-3xl md:text-4xl lg:text-3xl font-bold mb-4 md:mb-6 whitespace-normal break-words text-left text-[#5C4033] dark:text-white">
                  {article.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2 text-sm md:text-base lg:text-sm text-dark-brown/60 dark:text-gray-400 mb-6 md:mb-8">
                  <time dateTime={article.createdAt} className="flex items-center">
                    <span className="mr-1">發布</span>
                    {formatDate(article.createdAt)}
                  </time>
                  {article.updateDate && article.updateDate !== article.createdAt && (
                    <>
                      <span className="text-dark-brown/40 dark:text-gray-500">•</span>
                      <time dateTime={article.updateDate} className="flex items-center">
                        <span className="mr-1">更新於</span>
                        {formatDate(article.updateDate)}
                      </time>
                    </>
                  )}
                </div>
                <div className="prose dark:prose-invert prose-lg md:prose-xl lg:prose-xl max-w-none 
                  [&>h1]:mt-8 [&>h1]:mb-6 md:[&>h1]:mt-14 md:[&>h1]:mb-12 lg:[&>h1]:mt-16 lg:[&>h1]:mb-14
                  [&>h1]:leading-tight md:[&>h1]:leading-normal lg:[&>h1]:leading-relaxed
                  [&>h2]:border-l-4 [&>h2]:border-[#A67B5B] dark:[&>h2]:border-white 
                  [&>h2]:pl-4 [&>h2]:py-2 [&>h2]:bg-[#A67B5B]/5 dark:[&>h2]:bg-white/10 
                  [&>h2]:text-[#5C4033] dark:[&>h2]:text-white 
                  [&>h2]:text-2xl md:[&>h2]:text-[1.5rem] xl:[&>h2]:text-[1.65rem] 
                  [&>h3]:text-xl md:[&>h3]:text-2xl lg:[&>h3]:text-2xl
                  [&>p]:mb-5 [&>p]:leading-relaxed md:[&>p]:leading-loose lg:[&>p]:leading-relaxed 
                  [&>p]:text-[#333333] dark:[&>p]:text-gray-300 
                  [&>p]:text-lg md:[&>p]:text-xl lg:[&>p]:text-xl
                  [&_ul_li::marker]:text-[#333333] dark:[&_ul_li::marker]:text-gray-300
                  [&_ol_li::marker]:text-[#333333] dark:[&_ol_li::marker]:text-gray-300
                  [&_ul_li]:text-[#333333] dark:[&_ul_li]:text-gray-300
                  [&_ol_li]:text-[#333333] dark:[&_ol_li]:text-gray-300
                  [&_li]:text-[#333333] dark:[&_li]:text-gray-300
                  [&_li_p]:text-[#333333] dark:[&_li_p]:text-gray-300">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeRaw]}
                    components={customComponents}
                  >
                    {article.content}
                  </ReactMarkdown>
                </div>

                {/* Related Articles Section - Mobile */}
                <RelatedArticles />
                <div className="mt-12 border-t border-gray-200 dark:border-gray-700 pt-8">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl md:text-[28px] font-bold text-[#5C4033] dark:text-white">留言</h2>
                    <ArticleActions 
                      articleSlug={params.slug}
                      totalComments={article.comments ?? 0}
                      totalLikes={article._count?.likes ?? 0}
                      onCommentClick={handleCommentClick}
                      className="scale-105 md:scale-110 origin-right"
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

