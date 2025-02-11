"use client"

import { Heart, MessageCircle, Share2, Bookmark } from "lucide-react"
import { useState } from "react"
import { useSession } from "next-auth/react"

export default function ArticleActions({ 
  articleId,
  totalComments,
  onCommentClick,
  className = ""
}: { 
  articleId: number
  totalComments?: number
  onCommentClick: () => void
  className?: string
}): JSX.Element {
  const { data: session } = useSession()

  return (
    <div className={`flex items-center gap-4 ${className}`}>
      {/* 分享按鈕 */}
      <button
        className="p-2 text-[#5C4033] dark:text-white rounded hover:bg-accent/10 active:bg-gray-200"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          window.alert('分享按鈕被點擊')
        }}
      >
        <Share2 className="h-5 w-5 md:h-8 md:w-8" />
      </button>

      {/* 收藏按鈕 */}
      <button 
        className="p-2 text-[#5C4033] dark:text-white rounded hover:bg-accent/10 active:bg-gray-200"
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          window.alert('收藏按鈕被點擊')
        }}
      >
        <Bookmark className="h-5 w-5 md:h-8 md:w-8" />
      </button>

      {/* 留言數 */}
      <button
        onClick={onCommentClick}
        className="flex items-center gap-1 text-[#5C4033] dark:text-white"
      >
        <MessageCircle className="h-5 w-5 md:h-8 md:w-8" />
        <span>{totalComments || 0}</span>
      </button>
    </div>
  )
} 