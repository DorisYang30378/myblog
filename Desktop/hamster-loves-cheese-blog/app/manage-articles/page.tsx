"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import PageLayout from "../components/PageLayout"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Pencil, Trash2, Upload } from "lucide-react"

// 定義文章類型
interface Article {
  id: number
  title: string
  createdAt: string
  updatedAt: string
  category: {
    name: string
  }
}

export default function ManageArticles() {
  const router = useRouter()
  const { user } = useUser()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 獲取文章列表
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        const response = await fetch('/api/articles')
        if (!response.ok) {
          throw new Error('Failed to fetch articles')
        }
        const data = await response.json()
        setArticles(data)
      } catch (error) {
        console.error('Error fetching articles:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticles()
  }, [])

  // 如果用戶未登錄，重定向到首頁
  if (!user) {
    router.push("/")
    return null
  }

  const handleEdit = (id: number) => {
    router.push(`/edit-article/${id}`)
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('確定要刪除這篇文章嗎？')) {
      return
    }

    try {
      const response = await fetch(`/api/articles/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('刪除文章失敗')
      }

      // 更新文章列表
      setArticles(articles.filter(article => article.id !== id))
      alert('文章已成功刪除')
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('刪除文章時發生錯誤')
    }
  }

  return (
    <PageLayout
      title={
        <div className="relative w-full text-center">
          <span>文章管理</span>
        </div>
      }
      className="bg-[#F7F3E8] dark:bg-gray-900"
    >
      <div className="max-w-4xl mx-auto px-16 relative">
        <div className="absolute -top-12 right-16">
          <Button
            onClick={() => router.push("/upload")}
            className="bg-[#A67B5B] hover:bg-[#8B7355] text-white dark:bg-gray-700 dark:hover:bg-gray-600 flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            上傳文章
          </Button>
        </div>
        <div className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">載入中...</div>
          ) : articles.length === 0 ? (
            <div className="text-center py-8">尚無文章</div>
          ) : (
            articles.map((article) => (
              <Card key={article.id} className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-[#5C4033] dark:text-white">{article.title}</h3>
                      <span className="text-xs px-2 py-0.5 bg-[#F5F2EE] dark:bg-gray-700 text-[#8B7355] dark:text-gray-300 rounded-full">
                        {article.category?.name || '未分類'}
                      </span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(article.createdAt).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(article.id)}
                      className="bg-white dark:bg-gray-700"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      編輯
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => handleDelete(article.id)}
                      className="border-red-500 text-red-500 hover:bg-red-500 hover:text-white dark:border-red-400 dark:text-red-400 dark:hover:bg-red-500 dark:hover:text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      刪除
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </PageLayout>
  )
}

