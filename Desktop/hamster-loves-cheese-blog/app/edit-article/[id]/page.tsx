"use client"

import { useState, useEffect, useRef, ChangeEvent } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "@/app/contexts/UserContext"
import PageLayout from "../../components/PageLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ReactMarkdown from "react-markdown"
import { Eye, Edit, Plus, Trash2, Upload, PlusCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'

interface UploadedImage {
  id: string
  file: File
  preview: string
}

// 修改 fetchArticle 函數來從 API 獲取實際文章數據
const fetchArticle = async (id: string, setImages: (images: UploadedImage[]) => void) => {
  try {
    const response = await fetch(`/api/articles/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch article')
    }
    const data = await response.json()
    console.log('API 返回的原始數據:', data)
    console.log('API 返回的 images:', data.images)
    
    // 如果 images 是字符串，需要解析它
    const images = typeof data.images === 'string' ? JSON.parse(data.images) : data.images || []
    
    // 將已存在的圖片轉換為 UploadedImage 格式
    const existingImages = images.map((img: any) => ({
      id: img.id || Math.random().toString(36).substr(2, 9),
      file: null,
      preview: img.url || img
    }))
    
    // 設置全局 images 狀態
    setImages(existingImages)
    
    return {
      id: data.id,
      title: data.title,
      category: data.category?.name || "",
      content: data.content,
      images: existingImages  // 修改這裡，返回處理後的圖片數組
    }
  } catch (error) {
    console.error('Error fetching article:', error)
    return null
  }
}

// 同時我們也需要從 API 獲取所有分類
const fetchCategories = async () => {
  try {
    const response = await fetch('/api/categories')
    if (!response.ok) {
      const errorText = await response.text()
      console.error('Categories API error:', errorText)
      throw new Error('Failed to fetch categories')
    }
    const data = await response.json()
    return data.map((category: any) => category.name)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return []
  }
}

const MarkdownRenderer = ({ content, images }: { content: string, images: UploadedImage[] }) => {
  return (
    <ReactMarkdown 
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeRaw]}
      components={{
        img: ({ src, alt }) => {
          if (!src) return null;
          
          // 處理路徑問題
          let imageSrc = src;
          
          try {
            // 1. 處理重複的 uploads 路徑
            if (src.includes('/uploads/uploads/')) {
              imageSrc = src.replace('/uploads/uploads/', '/uploads/');
            }
            
            // 2. 處理 blob URL
            if (src.startsWith('blob:')) {
              const uploadedImage = images.find(img => img.preview === src);
              if (uploadedImage) {
                imageSrc = uploadedImage.preview;
              }
            }

            // 3. 確保圖片路徑正確
            if (!imageSrc.startsWith('http') && !imageSrc.startsWith('blob:') && !imageSrc.startsWith('/')) {
              imageSrc = `/uploads/${imageSrc}`;
            }

            return (
              <div className="relative">
                <img
                  src={imageSrc}
                  alt={alt || '圖片'}
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => {
                    console.log('圖片加載失敗，但仍然顯示:', imageSrc);
                  }}
                />
              </div>
            );
          } catch (error) {
            console.error('處理圖片時出錯:', error);
            // 即使出錯也返回一個圖片元素
            return (
              <div className="relative">
                <img
                  src={src}
                  alt={alt || '圖片'}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            );
          }
        }
      }}
    >
      {content}
    </ReactMarkdown>
  )
}

export default function EditArticle({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { user } = useUser()
  const [article, setArticle] = useState({ id: 0, title: "", category: "", content: "", images: [] })
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [categories, setCategories] = useState(["seo", "軟體推薦", "知識管理"])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [images, setImages] = useState<UploadedImage[]>([])
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // 修改 useEffect 來獲取文章和分類數據
  useEffect(() => {
    if (!user) {
      router.push("/")
    } else {
      const loadData = async () => {
        // 獲取文章數據
        const articleData = await fetchArticle(params.id, setImages)
        if (articleData) {
          setArticle(articleData)
        }
        
        // 獲取分類數據
        const categoriesData = await fetchCategories()
        if (categoriesData.length > 0) {
          setCategories(categoriesData)
        }
      }
      
      loadData()
    }
  }, [user, router, params.id])

  // 修改 handleSubmit 函數來實際更新文章
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // 上傳新圖片（只處理有 file 的圖片）
      const uploadedImages = []
      for (const img of images) {
        // 如果是已存在的圖片（沒有 file），直接加入
        if (!img.file) {
          uploadedImages.push({
            id: img.id,
            url: img.preview
          })
          continue
        }

        // 處理新上傳的圖片
        try {
          const formData = new FormData()
          formData.append('file', img.file)
          
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })
          
          if (!uploadRes.ok) {
            console.warn(`圖片 ${img.file.name} 上傳失敗，跳過`)
            continue
          }
          
          const data = await uploadRes.json()
          if (data.url) {
            uploadedImages.push({
              id: img.id,
              url: data.url
            })
          }
        } catch (error) {
          console.warn('圖片上傳錯誤:', error)
          continue  // 跳過這張圖片，繼續處理其他圖片
        }
      }

      // 更新內容中的圖片引用
      let updatedContent = article.content
      for (const img of images) {
        const uploadedImg = uploadedImages.find(u => u.id === img.id)
        if (uploadedImg?.url) {
          const regex = new RegExp(`<img[^>]*src="${escapeRegExp(img.preview)}"[^>]*>`, 'g')
          updatedContent = updatedContent.replace(regex, `<img src="${uploadedImg.url}" alt="Image" />`)
        }
      }

      // 更新文章
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: article.title,
          content: updatedContent,
          categoryName: article.category,
          images: uploadedImages
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update article')
      }

      router.push('/manage-articles')
    } catch (error) {
      console.error('Error updating article:', error)
      alert(error instanceof Error ? error.message : '發生未知錯誤')
    }
  }

  const handleAddCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      setCategories([...categories, newCategory])
      setArticle({ ...article, category: newCategory })
      setNewCategory("")
      setIsNewCategoryDialogOpen(false)
    }
  }

  const handleDeleteCategory = (categoryToDelete: string) => {
    if (categories.length > 1) {
      setCategories(categories.filter((cat) => cat !== categoryToDelete))
      if (article.category === categoryToDelete) {
        setArticle({ ...article, category: "" })
      }
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target) {
          setArticle({ ...article, content: event.target.result as string })
        }
      }
      reader.readAsText(file)
    }
  }

  const togglePreviewMode = () => {
    setIsPreviewMode(!isPreviewMode)
  }

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file)
      }))
      setImages((prev) => [...prev, ...newImages])
    }
  }

  const insertImageToContent = (id: string) => {
    const textarea = textareaRef.current
    if (textarea) {
      const image = images.find(img => img.id === id)
      if (!image || !image.preview) {
        console.log('找不到圖片或預覽:', id)
        return
      }

      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      
      // 如果是 blob URL，直接使用
      const imageUrl = image.preview.startsWith('blob:') ? 
        image.preview : 
        `/uploads/${image.preview}`
      
      const imageTag = `<img src="${imageUrl}" alt="Image" />`
      console.log('插入的圖片標籤:', imageTag)  // 添加日誌
      
      const newContent = 
        article.content.substring(0, start) + 
        '\n' + imageTag + '\n' + 
        article.content.substring(end)
      
      setArticle({ ...article, content: newContent })
    }
  }

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id))
  }

  // 輔助函數：轉義正則表達式特殊字符
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  if (!user) return null

  return (
    <PageLayout title="編輯文章" className="bg-[#F7F3E8] dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-16">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              文章標題
            </label>
            <Input
              id="title"
              value={article.title}
              onChange={(e) => setArticle({ ...article, title: e.target.value })}
              className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              分類
            </label>
            <div className="flex items-center space-x-2">
              <Select value={article.category} onValueChange={(value) => setArticle({ ...article, category: value })}>
                <SelectTrigger className="w-full bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  <SelectValue placeholder="選擇分類" />
                </SelectTrigger>
                <SelectContent className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700">
                  {categories.map((cat) => (
                    <div
                      key={cat}
                      className="flex items-center justify-between px-2 py-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                    >
                      <SelectItem
                        value={cat}
                        className="flex-1 border-0 p-0 pl-6 focus:bg-transparent data-[highlighted]:bg-transparent"
                      >
                        {cat}
                      </SelectItem>
                      {categories.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDeleteCategory(cat)
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
                  <Button variant="outline" size="icon" className="bg-white dark:bg-gray-800">
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
                      className="bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
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
                    src={img.preview}
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
                  className="flex items-center gap-2 bg-white dark:bg-gray-800"
                >
                  <Upload size={16} />
                  上傳 MD 檔案
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={togglePreviewMode} 
                  className="flex items-center gap-2 bg-white dark:bg-gray-800"
                >
                  {isPreviewMode ? <Edit size={16} /> : <Eye size={16} />}
                  {isPreviewMode ? "編輯" : "預覽"}
                </Button>
              </div>
            </div>
            {isPreviewMode ? (
              <div className="prose dark:prose-invert max-w-none border border-gray-300 rounded-md p-4 min-h-[400px] overflow-y-auto bg-white dark:bg-gray-800">
                <MarkdownRenderer content={article.content} images={images} />
              </div>
            ) : (
              <Textarea
                ref={textareaRef}
                id="content"
                value={article.content}
                onChange={(e) => setArticle({ ...article, content: e.target.value })}
                className="w-full min-h-[400px] font-mono bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700"
              />
            )}
          </div>

          <Button
            type="submit"
            className="w-full bg-[#A67B5B] hover:bg-[#8B7355] text-white dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            更新文章
          </Button>
        </form>
      </div>
    </PageLayout>
  )
}

