"use client"

import { useEffect, useState, useCallback } from "react"

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
  onItemClick?: () => void
  className?: string
  itemClassName?: string
}

const TableOfContents: React.FC<TableOfContentsProps> = ({
  content,
  onItemClick,
  className = "",
  itemClassName = "",
}) => {
  const [toc, setToc] = useState<TocItem[]>([])
  const [activeId, setActiveId] = useState("")

  const generateId = useCallback((text: string) => {
    return text
      .toLowerCase()
      .replace(/[：:]/g, '')
      .replace(/[（）()]/g, '')
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\u4e00-\u9fa5-]/g, '')
  }, [])

  useEffect(() => {
    const headingRegex = /^##\s+(.+)$/gm
    const matches = Array.from(content.matchAll(headingRegex))
    
    const uniqueTitles = new Set()
    
    const tocItems: TocItem[] = matches
      .map((match) => {
        const text = match[1].trim()
        const id = generateId(text)
        
        return {
          id,
          text,
          level: 2
        }
      })
      .filter(item => {
        if (uniqueTitles.has(item.id)) {
          return false
        }
        uniqueTitles.add(item.id)
        return true
      })

    setToc(tocItems)

    // 設置第一個項目為活動狀態
    if (tocItems.length > 0) {
      setActiveId(tocItems[0].id)
    }

    setTimeout(() => {
      const headings = document.querySelectorAll("h2")
      headings.forEach((heading) => {
        const text = heading.textContent || ""
        heading.id = generateId(text)
      })
    }, 0)
  }, [content, generateId])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: "-40px 0px -60% 0px",
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
      }
    )

    const headings = document.querySelectorAll("h2")
    headings.forEach((heading) => observer.observe(heading))

    const visibleHeading = Array.from(headings).find(heading => {
      const rect = heading.getBoundingClientRect()
      return rect.top >= 0 && rect.bottom <= window.innerHeight
    })
    
    if (visibleHeading) {
      setActiveId(visibleHeading.id)
    } else if (headings.length > 0) {
      setActiveId(headings[0].id)
    }

    return () => observer.disconnect()
  }, [])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault()
    console.log('點擊了目錄項目:', id)
    
    const targetElement = document.getElementById(id)
    console.log('找到目標元素:', !!targetElement)
    
    if (targetElement) {
      const isMobileView = className.includes('mobile-toc') || 
                          document.querySelector('.mobile-toc') !== null
      
      console.log('視圖類型:', isMobileView ? '移動視圖' : '電腦視圖')

      // 儲存目標標題的索引位置
      const allHeadings = Array.from(document.querySelectorAll('h2'))
      const targetIndex = allHeadings.findIndex(h => h.id === id)
      console.log('目標標題索引:', targetIndex)

      if (isMobileView && onItemClick) {
        onItemClick()
        
        // 使用 requestAnimationFrame 確保 DOM 更新完成
        requestAnimationFrame(() => {
          setTimeout(() => {
            // 重新獲取標題並計算位置
            const headings = Array.from(document.querySelectorAll('h2'))
            if (targetIndex >= 0 && headings[targetIndex]) {
              const targetHeading = headings[targetIndex]
              console.log('找到目標標題:', targetHeading.textContent)
              
              targetHeading.scrollIntoView({ behavior: 'smooth' })
              
              // 調整 header 偏移
              setTimeout(() => {
                window.scrollBy({
                  top: -80,
                  behavior: 'smooth'
                })
              }, 100)
            }
          }, 300)
        })
      } else {
        // 電腦版：直接滾動
        const headerHeight = 80
        const rect = targetElement.getBoundingClientRect()
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop
        const targetPosition = scrollTop + rect.top - headerHeight

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        })
      }

      setActiveId(id)
    }
  }

  return (
    <nav className={`bg-transparent dark:bg-transparent py-4 rounded-lg md:px-3 ${className} xl:w-full w-fit relative z-50`}>
      <h2 className="text-lg font-semibold text-[#5C4033] dark:text-white mb-3 mobile-toc:text-xl px-2 md:px-0">
        📑 內容目錄
      </h2>
      <ul className="space-y-1.5 px-2 md:px-0">
        {toc.map((item) => (
          <li
            key={item.id}
            className={`${
              activeId === item.id
                ? "border-l-4 border-[#A67B5B] dark:border-white bg-[#A67B5B]/5 dark:bg-white/5"
                : "border-l-4 border-transparent"
            } pl-2 py-0.5 ${itemClassName}`}
            style={{ marginLeft: `${(item.level - 1) * 0.5}rem` }}
          >
            <a
              href={`#${item.id}`}
              className={`block text-sm mobile-toc:text-base transition-colors ${
                activeId === item.id
                  ? "text-[#5D4037] dark:text-white font-medium"
                  : "text-[#6B5D4F] dark:text-gray-300 hover:text-[#5D4037] dark:hover:text-white"
              } ${itemClassName}`}
              onClick={(e) => handleClick(e, item.id)}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default TableOfContents

