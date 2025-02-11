"use client"

import { useState, useRef, type ChangeEvent, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, PlusCircle, Eye, Edit, Trash2 } from "lucide-react"
import PageLayout from "../components/PageLayout"
import ReactMarkdown, { Components } from "react-markdown"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { ImgHTMLAttributes } from 'react'

interface UploadedImage {
  id: string
  file: File
  preview: string
}

interface UploadedImageResult {
  id: string;
  file: {
    name: string;
  };
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function UploadPage() {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // 清理預覽 URL
  useEffect(() => {
    return () => {
      // 組件卸載時清理預覽 URL
      images.forEach(image => {
        if (image.preview) {
          URL.revokeObjectURL(image.preview)
        }
      })
    }
  }, [images])

  // 在組件加載時獲取分類
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('獲取分類失敗')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('獲取分類失敗:', error)
      }
    }

    fetchCategories()
  }, [])

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.name.endsWith(".md")) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        setContent(text)
      }
      reader.readAsText(file)
    }
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => {
        const preview = URL.createObjectURL(file)
        return {
          id: Math.random().toString(36).substr(2, 9),
          file,
          preview
        }
      })
      setImages((prev) => [...prev, ...newImages])
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  const insertImageToContent = (id: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const image = images.find(img => img.id === id)
      if (!image) return

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const imageMarkdown = `<img src="${image.preview}" alt="Image" />\n`
      const newContent = content.substring(0, start) + imageMarkdown + content.substring(end)
      setContent(newContent)

      setTimeout(() => {
        textarea.focus()
        textarea.setSelectionRange(start + imageMarkdown.length, start + imageMarkdown.length)
      }, 0)
    }
  }

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (isSubmitting) return

    try {
      setIsSubmitting(true)

      // 基本驗證
      if (!title.trim() || !category || !content.trim()) {
        throw new Error('請填寫所有必要欄位')
      }

      // 上傳圖片
      const uploadedImages = []
      for (const img of images) {
        try {
          const formData = new FormData()
          formData.append('file', img.file)
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          
          if (!uploadRes.ok) {
            throw new Error(`圖片 ${img.file.name} 上傳失敗`)
          }
          
          const data = await uploadRes.json()
          if (!data.url) {
            throw new Error('上傳回應中缺少 URL')
          }

          uploadedImages.push({
            id: img.id,
            url: data.url
          })
        } catch (error) {
          console.error('圖片上傳錯誤:', error)
          throw new Error('處理圖片時發生錯誤')
        }
      }

      // 更新內容中的圖片引用
      let updatedContent = content
      for (const img of images) {
        const uploadedImg = uploadedImages.find(u => u.id === img.id)
        if (uploadedImg?.url) {
          const regex = new RegExp(escapeRegExp(img.preview), 'g')
          updatedContent = updatedContent.replace(regex, uploadedImg.url)
        }
      }

      // 創建文章
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: updatedContent,
          category,
          images: uploadedImages
        })
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.error || '文章創建失敗')
      }

      router.push('/')
    } catch (error) {
      console.error('提交錯誤:', error)
      alert(error instanceof Error ? error.message : '發生未知錯誤')
    } finally {
      setIsSubmitting(false)
    }
  }, [title, content, category, images, isSubmitting, router])

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const handleAddCategory = async () => {
    if (newCategory && !categories.some(cat => cat.name === newCategory)) {
      try {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: newCategory })
        })

        if (!response.ok) throw new Error('新增分類失敗')
        const data = await response.json()
        setCategories(prev => [...prev, data])
        setCategory(data.name)
        setNewCategory("")
        setIsNewCategoryDialogOpen(false)
      } catch (error) {
        console.error('新增分類失敗:', error)
        alert('新增分類失敗，請稍後再試')
      }
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (categories.length <= 1) return
    
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('刪除分類失敗')

      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      if (category === categories.find(cat => cat.id === categoryId)?.name) {
        setCategory("")
      }
    } catch (error) {
      console.error('刪除分類失敗:', error)
      alert('刪除分類失敗，請稍後再試')
    }
  }

  // 添加這個函數來處理圖片 URL
  const transformImageUrl = (src: string) => {
    if (src.startsWith('blob:')) {
      return src
    }
    // 處理其他類型的 URL
    return src
  }

  // 輔助函數：轉義正則表達式特殊字符
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // 新增分類對話框
  const NewCategoryDialog = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg">
        <h3 className="text-lg font-medium mb-4">新增分類</h3>
        <input
          type="text"
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          className="border p-2 mb-4 w-full"
          placeholder="輸入分類名稱"
        />
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => setIsNewCategoryDialogOpen(false)}
            className="px-4 py-2 text-gray-600"
          >
            取消
          </button>
          <button
            onClick={handleAddCategory}
            className="px-4 py-2 bg-blue-500 text-white rounded"
          >
            新增
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <PageLayout title="上傳文章" className="bg-[#FAF3E8]">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              文章標題
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              分類
            </label>
            <div className="flex items-center space-x-2">
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800">
                  {categories.map((cat) => (
                    <div
                      key={cat.id}
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <SelectItem
                        value={cat.name}
                        className="flex-1 border-0 p-0 focus:bg-transparent data-[highlighted]:bg-transparent"
                      >
                        {cat.name}
                      </SelectItem>
                      {categories.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteCategory(cat.id)
                          }}
                          className="h-8 w-8 p-0 hover:bg-destructive hover:text-destructive-foreground ml-2"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">刪除分類</span>
                        </Button>
                      )}
                    </div>
                  ))}
                </SelectContent>
              </Select>
              <Dialog open={isNewCategoryDialogOpen} onOpenChange={setIsNewCategoryDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white dark:bg-gray-800">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900 dark:text-gray-100">新增分類</DialogTitle>
                  </DialogHeader>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      placeholder="輸入新分類名稱"
                      className="bg-white dark:bg-gray-700"
                    />
                    <Button onClick={handleAddCategory}>新增</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                上傳圖片
              </label>
              <div className="flex items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  ref={imageInputRef}
                  className="hidden"
                  multiple
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <PlusCircle size={16} />
                  新增圖片
                </Button>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {images.map((img) => (
                <div key={img.id} className="relative group">
                  <Image
                    src={img.preview || "/placeholder.svg"}
                    alt="Preview"
                    width={100}
                    height={100}
                    className="object-cover rounded-md w-full h-24"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertImageToContent(img.id)}
                      className="text-white mr-2"
                    >
                      插入
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeImage(img.id)}
                      className="text-white"
                    >
                      刪除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                文章內容 (支援 Markdown 格式)
              </label>
              <div className="flex items-center space-x-2">
                <input type="file" accept=".md" onChange={handleFileUpload} ref={fileInputRef} className="hidden" />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload size={16} />
                  上傳 MD 檔案
                </Button>
                <Button type="button" variant="outline" onClick={togglePreviewMode} className="flex items-center gap-2">
                  {isPreviewMode ? <Edit size={16} /> : <Eye size={16} />}
                  {isPreviewMode ? "編輯" : "預覽"}
                </Button>
              </div>
            </div>
            {isPreviewMode ? (
              <div className="prose dark:prose-invert max-w-none border border-gray-300 rounded-md p-4 min-h-[400px] overflow-y-auto">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw]}
                  urlTransform={(url: string) => url}
                  components={{
                    img: ({ src, alt }) => (
                      <img
                        src={src}
                        alt={alt || ''}
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    )
                  }}
                >
                  {content}
                </ReactMarkdown>
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                rows={20}
                placeholder="在這裡輸入你的 Markdown 內容..."
              />
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#A67B5B] hover:bg-[#8B7355] text-white dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            提交文章
          </Button>
        </form>
      </div>
      {isNewCategoryDialogOpen && <NewCategoryDialog />}
    </PageLayout>
  )
}

