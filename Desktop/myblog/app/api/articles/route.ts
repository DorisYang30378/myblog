import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import { optimizeImage } from '@/lib/imageOptimizer'

const prisma = new PrismaClient()

interface UploadedImage {
  id: string
  url: string
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    console.log('接收到的完整資料:', body)  // 檢查接收到的資料
    console.log('接收到的圖片資料:', body.images)  // 特別檢查圖片資料

    const { title, content, category, images } = body

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

    // 處理上傳的圖片資料
    let processedImages = null
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
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      })
      console.log("Created article:", article)

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
    const { searchParams } = new URL(request.url)
    const categorySlug = searchParams.get('category')
    const sort = searchParams.get('sort')
    
    console.log('Fetching articles with category slug:', categorySlug)
    console.log('Sort direction:', sort)

    const articles = await prisma.article.findMany({
      where: categorySlug ? {
        category: {
          slug: categorySlug
        }
      } : undefined,
      orderBy: {
        createdAt: sort === 'asc' ? 'asc' : 'desc'  // 如果 sort=asc 則從舊到新，否則從新到舊
      },
      include: {
        category: true,
        likes: {
          select: {
            userId: true
          }
        },
        bookmarks: {
          select: {
            userId: true
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

    console.log('Found articles:', articles.length)
    return NextResponse.json(articles)
  } catch (error) {
    console.error("獲取文章失敗:", error)
    return NextResponse.json(
      { error: "獲取文章失敗" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
