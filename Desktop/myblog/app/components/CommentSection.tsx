"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Heart, Share2, Bookmark, X, Image, Send, Smile } from "lucide-react"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useUser } from "../contexts/UserContext"
import AuthModal from "./AuthModal"
import "../styles/comment-section-tablet.css"
import ArticleActions from "@/app/components/ArticleActions"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTheme } from "next-themes"

interface Reply {
  id: number
  author: string
  avatarUrl?: string
  content: string
  date: string
  likes: number
  isLiked?: boolean
  replyingTo?: string
  parentId: number
}

interface Comment {
  id: number
  author: string
  avatarUrl?: string
  content: string
  date: string
  likes: number
  isLiked?: boolean
  replies: Reply[]
  parentId?: number
}

interface CommentSectionProps {
  articleId: number
  customSendButton?: React.ReactNode
  hideCommentInput?: boolean
  onNeedAuth: () => void
  isOpen: boolean
  onClose: () => void
  onCommentCountChange?: (count: number) => void
}

const CommentComponent = ({
  comment,
  handleLike,
  isReply = false,
  replyingTo = "",
  showActions = true,
  setReplyingTo,
  currentReplyingTo,
}: {
  comment: Comment | Reply
  handleLike: (commentId: number, isReply?: boolean, parentId?: number) => void
  isReply?: boolean
  replyingTo?: string
  showActions?: boolean
  setReplyingTo: (data: {id: number, author: string} | null) => void
  currentReplyingTo?: {id: number, author: string} | null
}) => (
  <div className={`flex gap-6 ${isReply ? "ml-16 mt-4" : ""}`}>
    <Avatar className="h-10 w-10 shrink-0 md:h-12 md:w-12 tablet:h-14 tablet:w-14">
      <AvatarImage src={comment.avatarUrl} />
      <AvatarFallback>{comment.author[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-grow min-w-0">
      <div className="flex justify-between items-start">
        <div className="min-w-0 truncate">
          <h3 className="font-semibold text-[#5C4033] dark:text-white truncate text-base md:text-lg">{comment.author}</h3>
          <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">{comment.date}</p>
        </div>
        {showActions && (
          <div className="flex items-center gap-1 ml-auto shrink-0">
            <button
              onClick={() => handleLike(comment.id, isReply, isReply ? comment.parentId : undefined)}
              className="flex items-center gap-1 text-[#8B7355] hover:text-[#5C4033] dark:text-gray-400 dark:hover:text-white px-1.5"
            >
              <Heart
                className={`h-4 w-4 md:h-5 md:w-5 ${comment.isLiked ? "fill-current text-[#5C4033] dark:text-white" : ""}`}
              />
              <span className="text-sm">{comment.likes}</span>
            </button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => currentReplyingTo?.id === comment.id 
                ? setReplyingTo(null) 
                : setReplyingTo({ id: comment.id, author: comment.author })
              }
              className="text-[#8B7355] hover:text-[#5C4033] dark:text-gray-400 dark:hover:text-white border-0 focus:ring-0 px-1.5 h-7 text-sm whitespace-nowrap"
            >
              {currentReplyingTo?.id === comment.id ? "取消" : "回覆"}
            </Button>
          </div>
        )}
      </div>
      <div className="prose dark:prose-invert mt-2 text-[#333333] dark:text-gray-300 text-base md:text-base lg:text-lg tablet:text-xl">
        {isReply && replyingTo && (
          <span className="font-medium text-[#5C4033] dark:text-white">@{replyingTo} </span>
        )}
        {comment.content}
      </div>
    </div>
  </div>
)

export default function CommentSection({
  articleId,
  customSendButton,
  hideCommentInput = false,
  onNeedAuth,
  isOpen,
  onClose,
  onCommentCountChange,
}: CommentSectionProps) {
  const { user: contextUser } = useUser()
  const [user, setUser] = useState(contextUser)
  const [comments, setComments] = useState<Comment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newComment, setNewComment] = useState("")
  const [isLiked, setIsLiked] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [replyingTo, setReplyingTo] = useState<{id: number, author: string} | null>(null)
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const { theme } = useTheme()

  const totalComments = comments.reduce((acc, comment) => acc + 1 + comment.replies.length, 0)

  console.log('Current articleId:', articleId)

  // 獲取評論
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/comments/${articleId}`)
        const data = await response.json()
        setComments(data)
        
        // 計算總評論數（包含主評論和回覆）
        const totalCount = data.reduce((acc: number, comment: Comment) => 
          acc + 1 + (comment.replies?.length || 0), 0)
        onCommentCountChange?.(totalCount)
      } catch (error) {
        console.error('獲取評論失敗:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchComments()
  }, [articleId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    try {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: newComment,
          articleId: articleId,
          userId: user.id,
          parentId: replyingTo?.id
        }),
      })

      if (!response.ok) throw new Error("Failed to post comment")

      const newCommentData = await response.json()
      
      setComments(prevComments => {
        if (replyingTo) {
          return prevComments.map(comment => {
            if (comment.id === replyingTo.id) {
              return {
                ...comment,
                replies: [...comment.replies, {
                  id: newCommentData.id,
                  author: user.name,
                  avatarUrl: user.avatar,
                  content: newCommentData.content,
                  date: new Date().toLocaleDateString("zh-TW"),
                  likes: 0,
                  replyingTo: comment.author,
                  parentId: comment.id
                }]
              }
            }
            return comment
          })
        } else {
          return [...prevComments, {
            id: newCommentData.id,
            author: user.name,
            avatarUrl: user.avatar,
            content: newCommentData.content,
            date: new Date().toLocaleDateString("zh-TW"),
            likes: 0,
            replies: [],
            parentId: undefined
          }]
        }
      })

      setNewComment("")
      setReplyingTo(null)
    } catch (error) {
      console.error("Error posting comment:", error)
    }
  }

  const handleLike = async (commentId: number, isReply?: boolean, parentId?: number) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }

    try {
      const response = await fetch("/api/comments/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          commentId,
          userId: user.id,
        }),
      })

      if (!response.ok) throw new Error("Failed to like comment")

      const data = await response.json()

      // 更新本地狀態
      setComments(prevComments => 
        prevComments.map(comment => {
          if (isReply && parentId === comment.id) {
            // 處理回覆的按讚
            return {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? {
                      ...reply,
                      likes: data.liked ? reply.likes + 1 : reply.likes - 1,
                      isLiked: data.liked,
                    }
                  : reply
              )
            }
          } else if (!isReply && comment.id === commentId) {
            // 處理主評論的按讚
            return {
              ...comment,
              likes: data.liked ? comment.likes + 1 : comment.likes - 1,
              isLiked: data.liked,
            }
          }
          return comment
        })
      )
    } catch (error) {
      console.error("Error liking comment:", error)
    }
  }

  const handleAction = (action: () => void) => {
    if (!user) {
      setIsAuthModalOpen(true)
      return
    }
    if (action === (() => {})) {
      onClose()
      return
    }
    action()
  }

  const handleEmojiSelect = (emoji: any) => {
    const cursorPosition = replyingTo 
      ? (replyingTo.author.length * 14) + 64 + 24  // 如果是回覆，考慮前綴的寬度
      : 0
    
    const newText = newComment + emoji.native  // 直接在現有文字後添加表情符號
    setNewComment(newText)
  }

  useEffect(() => {
    setUser(contextUser)
  }, [contextUser])

  return (
    <div className="mt-12 comment-section-tablet comment-section-desktop comment-section-mobile">
      <style jsx global>{`
        /* Desktop styles */
        @media (min-width: 1280px) {
          .comment-section-desktop {
            /* 1. "留言"標題 */
            & h2 {
              font-size: 2rem;
              font-weight: 700;
              line-height: 40px;
              height: 40px;
              margin: 0;
            }

            /* 2. 用戶頭像和名稱 */
            & h3 {
              font-size: 1.1rem;
            }

            & .text-gray-500 {
              color: #999;
            }

            /* 3. 互動元素 */
            & .lucide {
              width: 1.375rem;
              height: 1.375rem;
            }

            & button {
              padding: 0.5rem;
            }

            /* 4. 留言內容 */
            & .prose {
              line-height: 1.7;
            }

            & > div > div {
              margin-bottom: 2rem;
            }

            /* 5. "查看更多評論"按鈕 */
            & button[variant="outline"] {
              padding-top: 0.75rem;
              padding-bottom: 0.75rem;
              margin-top: 1rem;
              margin-bottom: 1rem;
              border-width: 2px;
            }
          }
        }

        /* Tablet styles */
        @media (min-width: 768px) and (max-width: 1279px) {
          .comment-section-tablet {
            /* 1. "留言"標題 */
            & h2 {
              font-size: 2.25rem;
              font-weight: 700;
              line-height: 40px;
              height: 40px;
              margin: 0;
            }

            /* 2. 用戶頭像和名稱 */
            & h3 {
              font-size: 1.1rem;
            }

            & .text-gray-500 {
              color: #999;
            }

            /* 3. 互動元素 */
            & .lucide {
              width: 1.375rem;
              height: 1.375rem;
            }

            & button {
              padding: 0.5rem;
            }

            /* 4. 留言內容 */
            & .prose {
              line-height: 1.7;
            }

            & > div > div {
              margin-bottom: 2rem;
            }

            /* 5. "查看更多評論"按鈕 */
            & button[variant="outline"] {
              padding-top: 0.75rem;
              padding-bottom: 0.75rem;
              margin-top: 1rem;
              margin-bottom: 1rem;
              border-width: 2px;
            }
          }
        }

        /* Mobile styles */
        @media (max-width: 767px) {
          .comment-section-mobile {
            /* 1. "留言"標題 */
            & h2 {
              font-size: 1.75rem;
              font-weight: 700;
              line-height: 40px;
              height: 40px;
              margin: 0;
            }

            /* 2. 用戶頭像和名稱 */
            & h3 {
              font-size: 1.125rem;  /* 增加用戶名稱大小 */
            }

            /* 3. 互動元素 */
            & .lucide {
              width: 1.25rem;  /* 增加圖標大小 */
              height: 1.25rem;
            }

            & button {
              padding: 0.375rem;  /* 增加按鈕內邊距 */
            }

            /* 4. 留言內容 */
            & .prose {
              font-size: 1.125rem !important;  /* 強制增加留言內容字體大小 */
              line-height: 1.6;
            }

            & > div > div {
              margin-bottom: 1.25rem;
            }

            /* 5. "查看更多評論"按鈕 */
            & button[variant="outline"] {
              padding-top: 0.625rem;
              padding-bottom: 0.625rem;
              margin-top: 0.75rem;
              margin-bottom: 0.75rem;
              border-width: 1px;
              font-size: 1.125rem;  /* 增加按鈕文字大小 */
            }
          }
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', sans-serif;
        }
      `}</style>
      
      <div className="space-y-6">
        {comments.length === 0 ? (
          <div className="text-center py-8 bg-white/50 dark:bg-gray-800/50 rounded-lg">
            <p className="text-lg text-[#5C4033] dark:text-gray-300 mb-2">
              還沒有人留言，來當第一個留言的人吧！
            </p>
            <p className="text-sm text-[#8B7355] dark:text-gray-400">
              分享你的想法，與其他讀者交流討論
            </p>
          </div>
        ) : (
          <>
            {comments.slice(0, 2).map((comment) => (
              <div key={comment.id} className="space-y-4">
                <CommentComponent 
                  comment={comment} 
                  handleLike={handleLike} 
                  showActions={false} 
                  setReplyingTo={setReplyingTo} 
                  currentReplyingTo={replyingTo}
                />
                {comment.replies.map((reply) => (
                  <CommentComponent
                    key={reply.id}
                    comment={reply}
                    handleLike={handleLike}
                    isReply={true}
                    replyingTo={comment.author}
                    showActions={false}
                    setReplyingTo={setReplyingTo}
                    currentReplyingTo={replyingTo}
                  />
                ))}
              </div>
            ))}
            {comments.length > 2 && (
              <Button
                variant="outline"
                className="w-full text-[#5C4033] dark:text-white hover:bg-[#FFF8ED] dark:hover:bg-gray-700 transition-colors duration-200 bg-[#FFF8ED]/50 dark:bg-gray-700/30 md:text-lg md:py-3"
                onClick={() => onClose()}
              >
                查看更多評論 ({totalComments})
              </Button>
            )}
          </>
        )}
      </div>

      {isOpen && (
        <Dialog open={isOpen} onOpenChange={(open) => {
          if (!open) {
            setReplyingTo(null)
            onClose()
          }
        }}>
          <DialogContent 
            className="sm:max-w-[90vw] md:max-w-[600px] lg:max-w-[720px] h-[100svh] sm:h-[90vh] w-full max-w-full rounded-none sm:rounded-lg bg-white dark:bg-[rgb(38,38,38)] border-0 sm:border-gray-200 dark:border-[rgb(38,38,38)] flex flex-col p-0 [&>button]:hidden"
          >
            <div id="comment-dialog-description" className="sr-only">
              文章評論對話框
            </div>
            <div className="flex-none border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-[rgb(38,38,38)]">
              <div className="w-full mx-auto px-4 py-4 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-[#5C4033] dark:text-white">留言 ({totalComments})</h2>
                <button
                  onClick={onClose}
                  className="rounded-sm opacity-70 hover:opacity-100 focus:outline-none text-gray-900 dark:text-white"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Close</span>
                </button>
              </div>
            </div>
            <ScrollArea className="flex-grow bg-white dark:bg-[rgb(38,38,38)]">
              <div className="w-full mx-auto px-4">
                <div className="space-y-6 pt-2">
                  {comments.length === 0 ? (
                    <div className="text-center py-8 bg-white/50 dark:bg-gray-800/50 rounded-lg mt-[20vh]">
                      <p className="text-lg lg:text-xl xl:text-2xl text-[#5C4033] dark:text-gray-300 mb-3">
                        還沒有人留言，來當第一個留言的人吧！
                      </p>
                      <p className="text-base lg:text-lg xl:text-xl text-[#8B7355] dark:text-gray-400">
                        分享你的想法，與其他讀者交流討論
                      </p>
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div key={`comment-${comment.id}`} className="space-y-4">
                        <CommentComponent comment={comment} handleLike={handleLike} setReplyingTo={setReplyingTo} currentReplyingTo={replyingTo} />
                        {comment.replies.map((reply, replyIndex) => (
                          <CommentComponent
                            key={`reply-${reply.id}-${replyIndex}`}
                            comment={reply}
                            handleLike={handleLike}
                            isReply={true}
                            replyingTo={comment.author}
                            setReplyingTo={setReplyingTo}
                            currentReplyingTo={replyingTo}
                          />
                        ))}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </ScrollArea>
            {user && !hideCommentInput && (
              <div className="flex-none border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-[rgb(38,38,38)]">
                <div className="w-full mx-auto px-4 py-3">
                  <div className="mobile-comment-input">
                    <div className="flex items-center gap-3 w-full">
                      <Avatar className="h-8 w-8 shrink-0">
                        <AvatarImage src={user.avatar} />
                        <AvatarFallback>{user.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-700 rounded-full px-3">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder={replyingTo ? `回覆 ${replyingTo.author}...` : "加入討論..."}
                          className="flex-1 h-8 focus:outline-none bg-transparent text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault()
                              handleSubmit(e)
                            }
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                            <PopoverTrigger asChild>
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 hover:bg-transparent"
                              >
                                <Smile className="h-5 w-5 text-gray-500" />
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent 
                              className="p-0 border-none" 
                              side="top" 
                              align="end"
                            >
                              <Picker
                                data={data}
                                onEmojiSelect={handleEmojiSelect}
                                theme={theme === "dark" ? "dark" : "light"}
                                locale="zh"
                              />
                            </PopoverContent>
                          </Popover>
                          <Button
                            type="submit"
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 hover:bg-transparent"
                            onClick={handleSubmit}
                            disabled={!newComment.trim()}
                          >
                            <svg viewBox="0 0 24 24" className="h-5 w-5 text-primary" fill="currentColor">
                              <path d="M4.3,19.5L21,12L4.3,4.5L4,9.7L17.2,12L4,14.3L4.3,19.5z" />
                            </svg>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </div>
  )
}


