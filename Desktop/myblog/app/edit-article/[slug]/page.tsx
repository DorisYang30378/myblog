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
import { Eye, Edit, Plus, Trash2, Upload, PlusCircle, Check } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import Image from "next/image"
import remarkGfm from 'remark-gfm'
import rehypeRaw from 'rehype-raw'
import { optimizeImage } from '@/lib/imageOptimizer'

interface UploadedImage {
  id: string
  file: File
  preview: string
}

interface Article {
  id: number;
  title: string;
  category: string;
  content: string;
  images: UploadedImage[];
  hideImageCaptions: boolean;
  slug: string;
  thumbnail?: string | null;  // 修改這裡
}

// 修改 fetchArticle 函數來從 API 獲取實際文章數據
const fetchArticle = async (slug: string, setImages: (images: UploadedImage[]) => void) => {
  try {
    console.log('開始獲取文章, slug:', slug)
    const response = await fetch(`/api/articles/${slug}`)
    
    if (!response.ok) {
      throw new Error(`獲取文章失敗: ${response.status} ${response.statusText}`)
    }
    
    const data = await response.json()
    console.log('API 返回的原始數據:', data)
    
    if (!data) {
      throw new Error('API 返回空數據')
    }

    // 處理圖片數據
    let processedImages: UploadedImage[] = []
    if (data.images) {
      try {
        const images = typeof data.images === 'string' ? JSON.parse(data.images) : data.images
        processedImages = images.map((img: any) => ({
          id: img.id || Math.random().toString(36).substr(2, 9),
          file: null,
          preview: img.url || img
        }))
      } catch (error) {
        console.error('處理圖片數據時出錯:', error)
      }
    }

    // 設置圖片狀態
    setImages(processedImages)

    const content = data.content || '';
    const hasHideImageCaptionsTag = content.includes('<!-- HIDE_IMAGE_CAPTIONS -->');
    const cleanContent = hasHideImageCaptionsTag 
      ? content.replace('<!-- HIDE_IMAGE_CAPTIONS -->', '').trim()
      : content;

    // 返回處理後的文章數據
    return {
      id: data.id,
      title: data.title || '',
      category: data.category?.name || '',
      content: cleanContent,
      images: processedImages,
      hideImageCaptions: hasHideImageCaptionsTag,
      slug: data.slug || '',
      thumbnail: data.thumbnail || null  // 添加縮圖
    }
  } catch (error) {
    console.error('獲取文章失敗:', error)
    throw error  // 向上傳遞錯誤
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

const MarkdownRenderer = ({ content, images, hideImageCaptions }: { 
  content: string, 
  images: UploadedImage[],
  hideImageCaptions: boolean 
}) => {
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
            if (src.includes('/data/uploads')) {
              imageSrc = src.replace('/data/uploads', '/uploads');
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
                {!hideImageCaptions && alt && alt !== 'Image' && (
                  <div className="text-sm text-gray-500 text-center mt-1">
                    {alt}
                  </div>
                )}
              </div>
            );
          } catch (error) {
            console.error('處理圖片時出錯:', error);
            return (
              <div className="relative">
                <img
                  src={src}
                  alt={alt || '圖片'}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                {!hideImageCaptions && alt && alt !== 'Image' && (
                  <div className="text-sm text-gray-500 text-center mt-1">
                    {alt}
                  </div>
                )}
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

export default function EditArticle({ params }: { params: { slug: string } }) {
  const router = useRouter()
  const { user } = useUser()
  const [article, setArticle] = useState<Article>({ id: 0, title: "", category: "", content: "", images: [], hideImageCaptions: false, slug: "" })
  const [isLoading, setIsLoading] = useState(true)  // 添加載入狀態
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isNewCategoryDialogOpen, setIsNewCategoryDialogOpen] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [categories, setCategories] = useState(["seo", "軟體推薦", "知識管理"])
  const [images, setImages] = useState<UploadedImage[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [hideImageCaptions, setHideImageCaptions] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")  // 添加 slug 状态
  const [selectedThumbnail, setSelectedThumbnail] = useState<string | null>(null)

  // 修改資料獲取邏輯
  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      if (!user) {
        router.push("/")
        return
      }

      try {
        setIsLoading(true)
        const [articleData, categoriesData] = await Promise.all([
          fetchArticle(params.slug, setImages),
          fetchCategories()
        ])

        if (!isMounted) return

        if (articleData) {
          setArticle(articleData)
          setHideImageCaptions(articleData.hideImageCaptions)
          setTitle(articleData.title)
          setSlug(articleData.slug)
          setSelectedThumbnail(articleData.thumbnail || null)  // 設置縮圖
        }

        if (categoriesData.length > 0) {
          setCategories(categoriesData)
        }

      } catch (error) {
        console.error('載入數據失敗:', error)
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [params.slug, user])

  // 添加載入中狀態的顯示
  if (isLoading) {
    return (
      <PageLayout title="編輯文章" className="bg-[#F7F3E8] dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-16 text-center py-12">
          <p className="text-[#A08977] dark:text-gray-400">載入中...</p>
        </div>
      </PageLayout>
    )
  }

  // 修改 handleSubmit 函數來實際更新文章
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const uploadedImages = []
      for (const img of images) {
        if (!img.file) {
          uploadedImages.push({
            id: img.id,
            url: img.preview
          })
          continue
        }

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
              url: data.url  // 這裡會是 .webp 格式的路徑
            })
          }
        } catch (error) {
          console.warn('圖片上傳錯誤:', error)
          continue
        }
      }

      // 更新內容中的圖片引用，確保使用 webp 路徑
      let updatedContent = article.content
      for (const img of images) {
        const uploadedImg = uploadedImages.find(u => u.id === img.id)
        if (uploadedImg?.url) {
          const regex = new RegExp(`<img[^>]*src="${escapeRegExp(img.preview)}"[^>]*>`, 'g')
          updatedContent = updatedContent.replace(regex, `<img src="${uploadedImg.url}" alt="Image" />`)
        }
      }

      // 如果啟用了隱藏圖片說明，添加標記
      let finalContent = updatedContent;
      if (hideImageCaptions) {
        // 檢查是否已經有標記
        if (!finalContent.includes('<!-- HIDE_IMAGE_CAPTIONS -->')) {
          finalContent = `<!-- HIDE_IMAGE_CAPTIONS -->\n${finalContent}`;
        }
      } else {
        // 如果禁用了隱藏圖片說明，移除標記
        finalContent = finalContent.replace('<!-- HIDE_IMAGE_CAPTIONS -->', '').trim();
      }

      // 處理縮圖 URL
      let thumbnailUrl = selectedThumbnail
      if (selectedThumbnail?.startsWith('blob:')) {
        const thumbnailImage = images.find(img => img.preview === selectedThumbnail)
        if (thumbnailImage) {
          const uploadedThumbnail = uploadedImages.find(u => u.id === thumbnailImage.id)
          if (uploadedThumbnail) {
            thumbnailUrl = uploadedThumbnail.url
          }
        }
      }

      // 更新文章
      const response = await fetch(`/api/articles/${params.slug}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: finalContent,
          categoryName: article.category,
          images: uploadedImages,
          hideImageCaptions: hideImageCaptions,
          slug: slug.trim(),
          thumbnail: thumbnailUrl
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
      const newImages: UploadedImage[] = Array.from(files)
        .filter(file => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type))
        .map((file) => ({
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

  // 添加生成 slug 的辅助函数
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5]+/g, '-') // 保留中文字符和英文字母数字
      .replace(/^-+|-+$/g, '') // 移除首尾的连字符
      .substring(0, 80); // 限制长度
  };

  if (!user) return null

  return (
    <PageLayout title="編輯文章" className="bg-[#F7F3E8] dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-16">
        <form onSubmit={handleSubmit} className="space-y-4">
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
                // 如果 slug 为空，自动生成
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

          {images.length > 0 && (
            <div className="mt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                選擇縮圖
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div 
                    key={image.id}
                    className={`relative cursor-pointer border-2 rounded-lg overflow-hidden
                      ${selectedThumbnail === image.preview ? 'border-primary' : 'border-transparent'}`}
                    onClick={() => setSelectedThumbnail(image.preview)}
                  >
                    <Image
                      src={image.preview}
                      alt={`圖片 ${index + 1}`}
                      width={200}
                      height={150}
                      className="object-cover w-full h-24"
                    />
                    {selectedThumbnail === image.preview && (
                      <div className="absolute top-2 right-2 bg-primary text-white p-1 rounded-full">
                        <Check className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

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
                <MarkdownRenderer content={article.content} images={images} hideImageCaptions={hideImageCaptions} />
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

