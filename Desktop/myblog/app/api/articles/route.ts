import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { optimizeImage } from '@/lib/imageOptimizer'
import { revalidatePath } from "next/cache"

const prisma = new PrismaClient()

interface UploadedImage {
  id: string
  url: string
  preview: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('接收到的完整資料:', body)  // 檢查接收到的資料
    console.log('接收到的圖片資料:', body.images)  // 特別檢查圖片資料

    const { title, content, category, images, thumbnail, slug } = body

    // 合併驗證邏輯，避免重複檢查
    if (!title?.trim()) {
      return NextResponse.json(
        { error: "標題不能為空" },
        { status: 400 }
      )
    }

    if (!content?.trim()) {
      return NextResponse.json(
        { error: "內容不能為空" },
        { status: 400 }
      )
    }

    if (!category?.trim()) {
      return NextResponse.json(
        { error: "請選擇分類" },
        { status: 400 }
      )
    }
    
    // 验证 slug
    if (!slug?.trim()) {
      return NextResponse.json(
        { error: "文章網址不能為空" },
        { status: 400 }
      )
    }
    
    // 验证 slug 格式
    if (!/^[a-z0-9\u4e00-\u9fa5-]+$/.test(slug)) {
      return NextResponse.json(
        { error: "無效的網址格式，只能包含小寫字母、數字、中文和連字符" },
        { status: 400 }
      )
    }
    
    // 检查 slug 是否已存在
    const existingArticle = await prisma.article.findFirst({
      where: { slug: slug.trim() }
    })
    
    if (existingArticle) {
      return NextResponse.json(
        { error: "此網址已被使用，請選擇其他網址" },
        { status: 400 }
      )
    }

    // 處理上傳的圖片資料
    let processedImages = null
    let processedThumbnail = null
    if (images && images.length > 0) {
      try {
        processedImages = images.map((img: UploadedImage) => {
          if (!img?.id || !img?.url) {
            throw new Error(`圖片資料格式不正確: ${JSON.stringify(img)}`)
          }
          
          // 確保圖片路徑使用 webp 格式
          const url = img.url.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')
          
          return {
            id: img.id,
            url: url
          }
        })

        // 處理縮圖
        if (thumbnail) {
          processedThumbnail = thumbnail.replace(/\.(jpg|jpeg|png|gif)$/i, '.webp')
        }
      } catch (imgError: unknown) {
        const errorMessage = imgError instanceof Error ? imgError.message : '未知錯誤'
        return NextResponse.json(
          { error: "處理圖片資料時發生錯誤", details: errorMessage },
          { status: 400 }
        )
      }
    }

    // 使用 try-catch 包裝資料庫操作
    try {
      // 先找到或創建分類
      const categoryRecord = await prisma.category.upsert({
        where: { name: category },
        update: {},
        create: { 
          name: category,
          slug: category.toLowerCase().replace(/\s+/g, '-')
        }
      })
      console.log("Category record:", categoryRecord)

      // 創建文章
      const article = await prisma.article.create({
        data: {
          title: title.trim(),
          content: content.trim(),
          categoryId: categoryRecord.id,
          images: processedImages ? JSON.stringify(processedImages) : null,
          thumbnail: processedThumbnail,
          slug: slug.trim(),
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })
      console.log("Created article:", article)

      // 文章創建成功後，重新驗證首頁
      revalidatePath('/')

      return NextResponse.json({
        success: true,
        data: article
      })
    } catch (dbError) {
      console.error('資料庫操作失敗:', dbError)
      throw dbError // 讓外層的 catch 處理
    }

  } catch (error) {
    console.error('創建文章失敗:', error)
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: `創建文章失敗: ${error.message}` },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: "創建文章時發生未知錯誤" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET(request: Request) {
  try {
    // 獲取查詢參數
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
    const sort = searchParams.get('sort') || 'desc'
    const sortOrder = sort === 'asc' ? 'asc' : 'desc'
    
    // 檢查是否為移動設備（基於 User-Agent）
    const userAgent = request.headers.get('user-agent') || '';
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);

    // 構建查詢條件
    const whereCondition = categorySlug 
      ? {
          category: {
            slug: categorySlug
          }
        } 
      : {}

    const articles = await prisma.article.findMany({
      where: whereCondition,
      take: categorySlug ? undefined : (isMobile ? 5 : 10),  // 分類頁面不限制數量
      orderBy: {
        createdAt: sortOrder
      },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        thumbnail: true,
        images: true,
        createdAt: true,
        category: {
          select: {
            name: true,
            slug: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      }
    })

    // 只優化圖片處理邏輯
    const processedArticles = articles.map(article => {
      let thumbnail = article.thumbnail

      // 只在真的需要時才解析 images
      if (!thumbnail && article.images) {
        try {
          const images = JSON.parse(article.images)
          thumbnail = Array.isArray(images) && images.length > 0 ? images[0].url : null
        } catch {
          thumbnail = null
        }
      }

      return {
        ...article,
        thumbnail: thumbnail || '/placeholder.svg',
        likes: article._count.likes,
        comments: article._count.comments
      }
    })

    return NextResponse.json(processedArticles)
  } catch (error) {
    console.error('獲取文章列表失敗:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
