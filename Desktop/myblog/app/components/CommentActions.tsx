import { useState } from 'react'
import { Bookmark } from 'lucide-react'

export default function CommentActions({ 
  commentId, 
  className = "" 
}: { 
  commentId: number
  className?: string 
}) {
  // 添加狀態來追蹤點擊
  const [clickCount, setClickCount] = useState(0)

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {/* 收藏按鈕 */}
      <button 
        className="p-2 text-[#5C4033] dark:text-white rounded 
          hover:bg-accent/10 active:bg-gray-200"
        onClick={() => {
          setClickCount(prev => prev + 1)
          console.log('留言收藏按鈕被點擊，留言ID:', commentId)
          window.alert(`點擊了留言收藏按鈕，留言ID: ${commentId}`)
        }}
      >
        <Bookmark className="h-5 w-5" />
      </button>

      {/* 點擊計數 */}
      <span className="text-xs">{clickCount}</span>
    </div>
  )
}
