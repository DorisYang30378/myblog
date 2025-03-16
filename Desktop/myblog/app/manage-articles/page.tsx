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
  slug: string | null
}

export default function ManageArticles() {
  const router = useRouter()
  const { user } = useUser()
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingSlug, setEditingSlug] = useState<{id: number, slug: string | null} | null>(null)

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

  const handleEdit = (article: Article) => {
    router.push(`/edit-article/${article.slug}`);
  }

  const handleDelete = async (article: Article) => {
    if (!window.confirm('確定要刪除這篇文章嗎？')) {
      return
    }

    try {
      const response = await fetch(`/api/articles/${article.slug}`, {
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
      setArticles(articles.filter(a => a.id !== article.id))
      alert('文章已成功刪除')
    } catch (error) {
      console.error('Error deleting article:', error)
      alert('刪除文章時發生錯誤')
    }
  }

  const saveSlug = async () => {
    if (!editingSlug) return;
    
    try {
      const response = await fetch(`/api/articles/${editingSlug.slug}/slug`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ slug: editingSlug.slug }),
      });
      
      if (response.ok) {
        // 更新本地文章列表
        setArticles(articles.map(article => 
          article.id === editingSlug.id 
            ? { ...article, slug: editingSlug.slug } 
            : article
        ));
        setEditingSlug(null);
        alert('文章網址已更新成功！');
      } else {
        const error = await response.json();
        alert(error.error || '更新失敗，請重試');
      }
    } catch (error) {
      console.error('Error updating slug:', error);
      alert('更新時發生錯誤');
    }
  };

  // 生成 slug 的辅助函数
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-') // 保留中文字符和英文字母数字
      .replace(/^-+|-+$/g, '') // 移除首尾的连字符
      .substring(0, 80); // 限制长度
  };

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
                    
                    <div className="flex items-center text-xs text-gray-600 dark:text-gray-300 mt-1 mb-1">
                      <span className="mr-2">網址:</span>
                      {editingSlug?.id === article.id ? (
                        <div className="flex items-center">
                          <input 
                            type="text"
                            value={editingSlug.slug || ''} 
                            onChange={(e) => setEditingSlug({...editingSlug, slug: e.target.value})}
                            className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded mr-2 w-48 dark:bg-gray-700"
                            placeholder="自定義網址"
                          />
                          <button 
                            onClick={saveSlug} 
                            className="text-xs px-2 py-0.5 bg-green-500 text-white rounded hover:bg-green-600"
                          >
                            保存
                          </button>
                          <button 
                            onClick={() => setEditingSlug(null)} 
                            className="text-xs px-2 py-0.5 bg-gray-300 text-gray-700 rounded ml-1 hover:bg-gray-400 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500"
                          >
                            取消
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <span className="text-blue-500 dark:text-blue-400">
                            {article.slug ? `/article/${article.slug}` : '未設置'}
                          </span>
                          <button 
                            onClick={() => setEditingSlug({
                              id: article.id, 
                              slug: article.slug || generateSlug(article.title)
                            })} 
                            className="text-xs ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                          >
                            編輯
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                      <span>{new Date(article.createdAt).toLocaleDateString('zh-TW')}</span>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(article)}
                      className="bg-white dark:bg-gray-700"
                    >
                      <Pencil className="w-4 h-4 mr-2" />
                      編輯
                    </Button>
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={() => handleDelete(article)}
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

