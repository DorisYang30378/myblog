"use client"

import { useRef, useEffect } from "react"
import { Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"

interface SearchOverlayProps {
  isOpen: boolean
  onClose: () => void
  searchQuery: string
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onClear: () => void
  className?: string
}

export default function SearchOverlay({
  isOpen,
  onClose,
  searchQuery,
  onSearchChange,
  onClear,
  className,
}: SearchOverlayProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    onSearchChange(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className={`fixed inset-x-0 z-40 ${className}`}>
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 overflow-hidden py-2">
            <Search className="text-gray-400 dark:text-gray-500 w-5 h-5 flex-shrink-0 ml-4" />
            <Input
              ref={inputRef}
              type="search"
              value={searchQuery}
              onChange={handleSearch}
              onKeyDown={handleKeyDown}
              placeholder="搜尋文章..."
              className="flex-1 h-full border-0 bg-transparent text-base text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-0 focus:ring-0 ring-0 outline-none px-0 shadow-none [appearance:textfield] [&::-webkit-search-decoration]:hidden [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden"
              style={{
                boxShadow: "none",
                "--tw-ring-offset-width": "0px",
                "--tw-ring-offset-color": "transparent",
                "--tw-ring-color": "transparent",
              } as React.CSSProperties}
            />
            {searchQuery && (
              <button
                onClick={onClear}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2"
              >
                <X className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-sm px-4"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

