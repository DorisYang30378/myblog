import { NextResponse } from "next/server"
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 先獲取當前文章的分類
    const currentArticle = await prisma.article.findUnique({
      where: { id: Number(params.id) },
      select: { categoryId: true }
    })

    if (!currentArticle) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }

    // 獲取相同分類的其他文章
    const relatedArticles = await prisma.article.findMany({
      where: {
        categoryId: currentArticle.categoryId,
        id: { not: Number(params.id) }
      },
      select: {
        id: true,
        title: true,
        content: true,
        _count: {
          select: { 
            comments: true,
            likes: true  // 改用 _count 來獲取點讚數
          }
        }
      },
      take: 6,
      orderBy: { createdAt: 'desc' }
    })

    // 處理數據格式，生成摘要
    const formattedArticles = relatedArticles.map(article => ({
      id: article.id,
      title: article.title,
      excerpt: article.content.slice(0, 100).replace(/[#*`]/g, '') + '...',
      likes: article._count.likes,  // 使用 _count.likes
      comments: article._count.comments
    }))

    return NextResponse.json(formattedArticles)
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return NextResponse.json({ error: '獲取相關文章失敗' }, { status: 500 })
  }
}
