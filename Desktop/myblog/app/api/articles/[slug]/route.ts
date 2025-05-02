import { getServerSession } from 'next-auth'
import prisma from '@/lib/prisma'
import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// 獲取單篇文章
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  const { headers } = request
  headers.set('Cache-Control', 'no-store')  // 禁用緩存
  
  try {
    console.log('正在獲取文章，slug:', params.slug)  // 添加日誌
    
    const article = await prisma.article.findFirst({
      where: {
        slug: params.slug
      },
      include: {
        category: true
      }
    })

    console.log('資料庫返回結果:', article)  // 添加日誌

    if (!article) {
      console.log('找不到文章')  // 添加日誌
      return new NextResponse("Article not found", { status: 404 })
    }

    // 查詢相同分類的其他文章
    const relatedArticles = await prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        id: {
          not: article.id
        }
      },
      take: 3,
      select: {
        id: true,
        title: true,
        createdAt: true
      }
    })

    console.log('相關文章:', relatedArticles)  // 添加日誌

    const response = {
      ...article,
      relatedArticles
    }
    
    console.log('返回的完整數據:', response)  // 添加日誌
    return NextResponse.json(response)
  } catch (error) {
    console.error("獲取文章時出錯:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

interface UploadedImage {
  id: string;
  url: string;
}

// 更新文章
export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const body = await request.json()
    const { title, content, categoryName, images, hideImageCaptions, slug, thumbnail } = body

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
      } catch (imgError) {
        return NextResponse.json(
          { error: "處理圖片資料時發生錯誤" },
          { status: 400 }
        )
      }
    }

    // 驗證必要欄位
    if (!title?.trim() || !content?.trim() || !categoryName?.trim()) {
      return NextResponse.json(
        { error: "所有欄位都是必填的" },
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
    
    // 先通過 slug 獲取當前文章
    const currentArticle = await prisma.article.findFirst({
      where: { slug: params.slug }
    })
    
    if (!currentArticle) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      )
    }
    
    // 检查 slug 是否已被其他文章使用
    const existingArticle = await prisma.article.findFirst({
      where: {
        slug: slug.trim(),
        id: { not: currentArticle.id }
      }
    });
    
    if (existingArticle) {
      return NextResponse.json(
        { error: "此網址已被其他文章使用" },
        { status: 400 }
      )
    }

    // 獲取或創建分類
    const category = await prisma.category.upsert({
      where: { name: categoryName },
      update: {},
      create: {
        name: categoryName,
        slug: categoryName.toLowerCase().replace(/\s+/g, '-')
      }
    })

    // 更新文章
    const article = await prisma.article.update({
      where: { id: currentArticle.id },
      data: {
        title: title.trim(),
        content: content.trim(),
        categoryId: category.id,
        images: processedImages ? JSON.stringify(processedImages) : null,
        slug: slug.trim(),
        thumbnail: processedThumbnail,
        updatedAt: new Date()
      }
    })

    // 更新成功後重新生成首頁
    revalidatePath('/')
    
    return NextResponse.json(article)
  } catch (error) {
    console.error('更新文章失敗:', error)
    return NextResponse.json(
      { error: '更新文章失敗' },
      { status: 500 }
    )
  }
}

// 確保導出 DELETE 方法
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('正在嘗試刪除文章，slug:', params.slug)
    
    // 先通過 slug 查找文章
    const article = await prisma.article.findFirst({
      where: { slug: params.slug }
    })
    
    if (!article) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      )
    }
    
    const articleId = article.id
    
    // 使用事务确保数据一致性
    const result = await prisma.$transaction(async (tx) => {
      // 删除所有相关数据
      await tx.bookmark.deleteMany({
        where: { articleId }
      })

      await tx.comment.deleteMany({
        where: { articleId }
      })

      await tx.like.deleteMany({
        where: { articleId }
      })

      // 最后删除文章本身
      return await tx.article.delete({
        where: { id: articleId }
      })
    })

    console.log('刪除成功:', result)

    // 刪除成功後重新生成首頁
    revalidatePath('/')
    
    return NextResponse.json({ message: '刪除成功' })
  } catch (error) {
    console.error('Delete article error:', error)
    if (error instanceof Error) {
      console.error('错误详情:', error.message)
    }
    return NextResponse.json(
      { error: '刪除文章失敗' }, 
      { status: 500 }
    )
  }
}

// 修改 Article 接口定義
interface Article {
  id: number  // 改为 number 类型，而不是 string
  title: string
  createdAt: string
  updatedAt: string
}

// 修改 handleDelete 函数
