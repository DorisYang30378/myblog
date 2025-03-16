"use client"

import { useState, useRef, type ChangeEvent, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Upload, PlusCircle, Eye, Edit, Trash2, Pencil } from "lucide-react"
import PageLayout from "../components/PageLayout"
import ReactMarkdown, { Components } from "react-markdown"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Plus } from "lucide-react"
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { ImgHTMLAttributes } from 'react'
import { Label } from "@/components/ui/label"

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
  const [slug, setSlug] = useState("")
  const [category, setCategory] = useState("")
  const [content, setContent] = useState("")
  const [images, setImages] = useState<UploadedImage[]>([])
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [newCategorySlug, setNewCategorySlug] = useState("")
  const [categories, setCategories] = useState<Category[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEditCategoryDialogOpen, setIsEditCategoryDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<{id: number, name: string, slug: string} | null>(null)
  const [hideImageCaptions, setHideImageCaptions] = useState(false)

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

      // 獲取不含副檔名的原始檔名，但保留中間的點號
      const fileName = image.file.name.replace(/\.[^/.]+$/, "")
      
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      
      // 使用原始檔名作為 alt 文字，但確保路徑處理正確
      let imageUrl = image.preview
      
      // 如果是 blob URL，直接使用
      if (!imageUrl.startsWith('blob:')) {
        // 確保不會重複添加 /uploads/ 前綴
        if (!imageUrl.startsWith('/uploads/')) {
          imageUrl = `/uploads/${imageUrl}`
        }
      }
      
      const imageMarkdown = `<img src="${imageUrl}" alt="${fileName}" />\n`
      console.log('插入的圖片標籤:', imageMarkdown)  // 添加日誌
      
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
          // 使用更精確的正則表達式來保留 alt 文字
          const regex = new RegExp(`src="${escapeRegExp(img.preview)}"`, 'g')
          updatedContent = updatedContent.replace(regex, `src="${uploadedImg.url}"`)
          
          // 添加日誌以便調試
          console.log('替換圖片路徑:', img.preview, '->', uploadedImg.url)
        }
      }

      // 添加隱藏圖片說明的標記
      let finalContent = updatedContent;
      if (hideImageCaptions) {
        // 在文章開頭添加一個隱藏的標記
        finalContent = `<!-- HIDE_IMAGE_CAPTIONS -->\n${updatedContent}`;
      }

      // 創建文章
      const response = await fetch("/api/articles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: finalContent,
          category,
          images: uploadedImages,
          slug: slug.trim() || generateSlug(title.trim())
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
  }, [title, content, category, images, slug, isSubmitting, hideImageCaptions])

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const handleAddCategory = async () => {
    if (newCategory && newCategorySlug && !categories.some(cat => cat.name === newCategory)) {
      try {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            name: newCategory,
            slug: newCategorySlug 
          })
        })

        if (!response.ok) throw new Error('新增分類失敗')
        const data = await response.json()
        setCategories(prev => [...prev, data])
        setCategory(data.name)
        setNewCategory("")
        setNewCategorySlug("")
        setIsNewCategoryDialogOpen(false)
      } catch (error) {
        console.error('新增分類失敗:', error)
        alert('新增分類失敗，請稍後再試')
      }
    }
  }

  const handleDeleteCategory = async (categoryId: number) => {
    if (categories.length <= 1) {
      alert('至少需要保留一個分類')
      return
    }
    
    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorText = await response.text()
        if (response.status === 400) {
          alert('此分類下還有文章存在，請先修改或刪除相關文章後再試')
          return
        }
        throw new Error(errorText)
      }

      // 刪除成功後更新分類列表
      setCategories(prev => prev.filter(cat => cat.id !== categoryId))
      
      // 如果刪除的是當前選中的分類，清空選擇
      if (category === categories.find(cat => cat.id === categoryId)?.name) {
        setCategory('')
      }
    } catch (error) {
      console.error('刪除分類失敗:', error)
      alert('刪除分類失敗，請稍後再試')
    }
  }

  const handleEditCategory = (categoryId: number) => {
    const category = categories.find(cat => cat.id === categoryId)
    if (category) {
      setEditingCategory({
        id: category.id,
        name: category.name,
        slug: category.slug
      })
      setIsEditCategoryDialogOpen(true)
    }
  }

  const handleUpdateCategory = async () => {
    if (!editingCategory) return

    try {
      const response = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: editingCategory.name,
          slug: editingCategory.slug
        })
      })

      if (!response.ok) throw new Error('更新分類失敗')
      
      const updatedCategory = await response.json()
      
      setCategories(prev => prev.map(cat => 
        cat.id === editingCategory.id ? updatedCategory : cat
      ))
      
      if (category === editingCategory.name) {
        setCategory(updatedCategory.name)
      }
      
      setIsEditCategoryDialogOpen(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('更新分類失敗:', error)
      alert('更新分類失敗，請稍後再試')
    }
  }

  // 修改 transformImageUrl 函數
  const transformImageUrl = (src: string) => {
    // 處理重複的 /uploads 路徑
    if (src.includes('/uploads//uploads')) {
      src = src.replace('/uploads//uploads', '/uploads')
    }
    
    if (src.startsWith('blob:')) {
      return src
    }
    
    if (src.startsWith('/data/uploads')) {
      return src.replace('/data/uploads', '/uploads')
    }
    
    // 只有當路徑不是以 / 或 http 開頭時，才添加 /uploads/ 前綴
    if (!src.startsWith('/') && !src.startsWith('http')) {
      src = `/uploads/${src}`
    }
    
    // 確保不會有重複的斜杠
    src = src.replace(/\/+/g, '/')
    
    return src
  }

  // 輔助函數：轉義正則表達式特殊字符
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  // 添加生成 slug 的辅助函数
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-') // 保留中文字符和英文字母数字
      .replace(/^-+|-+$/g, '') // 移除首尾的连字符
      .substring(0, 80); // 限制长度
  };

  return (
    <PageLayout title="上傳文章" className="bg-[#FAF3E8]">
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              文章標題 *
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                // 当标题改变且 slug 为空时，自动生成 slug
                if (!slug) {
                  setSlug(generateSlug(e.target.value));
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              文章網址 *
            </label>
            <div className="flex items-center">
              <span className="text-gray-500 dark:text-gray-400 mr-1">/article/</span>
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^\w\u4e00-\u9fa5-]/g, '-'))}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:border-gray-600"
                placeholder="my-article-title"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
              自定義網址，只能包含小寫字母、數字、中文和連字符
            </p>
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
                        <div className="flex items-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault()
                              e.stopPropagation()
                              handleEditCategory(cat.id)
                            }}
                            className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600 ml-2"
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">編輯分類</span>
                          </Button>
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
                        </div>
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
                  <div className="space-y-4">
                    <div>
                      <Input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="輸入新分類名稱"
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div>
                      <Input
                        value={newCategorySlug}
                        onChange={(e) => setNewCategorySlug(e.target.value)}
                        placeholder="輸入分類 slug"
                        className="bg-white dark:bg-gray-700"
                      />
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsNewCategoryDialogOpen(false)}>
                        取消
                      </Button>
                      <Button onClick={handleAddCategory}>新增</Button>
                    </div>
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

          <div className="mb-4">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="hideImageCaptions"
                checked={hideImageCaptions}
                onChange={(e) => setHideImageCaptions(e.target.checked)}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="hideImageCaptions" className="text-sm font-medium">
                隱藏所有圖片說明
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              啟用此選項將隱藏文章中所有圖片下方的說明文字
            </p>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#A67B5B] hover:bg-[#8B7355] text-white dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            提交文章
          </Button>
        </form>

        {isEditCategoryDialogOpen && (
          <Dialog open={isEditCategoryDialogOpen} onOpenChange={setIsEditCategoryDialogOpen}>
            <DialogContent className="bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle>編輯分類</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editCategoryName">分類名稱</Label>
                  <Input
                    id="editCategoryName"
                    value={editingCategory?.name || ''}
                    onChange={(e) => setEditingCategory(prev => prev ? {...prev, name: e.target.value} : null)}
                    className="bg-white dark:bg-gray-700"
                  />
                </div>
                <div>
                  <Label htmlFor="editCategorySlug">分類網址</Label>
                  <Input
                    id="editCategorySlug"
                    value={editingCategory?.slug || ''}
                    onChange={(e) => setEditingCategory(prev => prev ? {...prev, slug: e.target.value} : null)}
                    className="bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditCategoryDialogOpen(false)}>
                  取消
                </Button>
                <Button onClick={handleUpdateCategory}>
                  更新
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageLayout>
  )
}

