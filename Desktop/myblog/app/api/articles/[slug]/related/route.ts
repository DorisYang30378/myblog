import { NextResponse } from "next/server"
import prisma from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // 先通過 slug 獲取文章 ID
    const article = await prisma.article.findFirst({
      where: { slug: params.slug },
      select: { 
        id: true,
        createdAt: true,
        categoryId: true
      }
    });
    
    if (!article) {
      return NextResponse.json({ error: '文章不存在' }, { status: 404 })
    }
    
    const articleId = article.id;
    const MAX_ARTICLES = 15; // 最多顯示的文章數
    
    // 獲取所有文章的 ID 和創建時間，按創建時間排序
    const allArticles = await prisma.article.findMany({
      where: {       
        categoryId: article.categoryId // 保持相同分類
      },
      select: {
        id: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'asc' // 從舊到新排序
      }
    });
    
    // 找到當前文章在排序後列表中的位置
    const currentIndex = allArticles.findIndex(article => article.id === articleId);
    
    if (currentIndex === -1) {
      return NextResponse.json(
        { error: "無法確定文章位置" },
        { status: 500 }
      );
    }
    
    // 計算要獲取的文章範圍
    const halfCount = Math.floor(MAX_ARTICLES / 2);
    let startIndex = currentIndex - halfCount;
    let endIndex = currentIndex + (MAX_ARTICLES - halfCount);
    
    // 調整範圍，確保不超出邊界
    if (startIndex < 0) {
      // 如果前面的文章不夠，增加後面的文章數量
      endIndex = Math.min(endIndex - startIndex, allArticles.length);
      startIndex = 0;
    }
    
    if (endIndex > allArticles.length) {
      // 如果後面的文章不夠，增加前面的文章數量
      startIndex = Math.max(0, startIndex - (endIndex - allArticles.length));
      endIndex = allArticles.length;
    }
    
    // 獲取範圍內的文章 ID
    const articleIds = allArticles
      .slice(startIndex, endIndex)
      .map(article => article.id)
      .filter(id => id !== articleId); // 排除當前文章
    
    // 獲取這些文章的詳細信息
    const contextArticles = await prisma.article.findMany({
      where: {
        id: {
          in: articleIds
        }
      },
      select: {
        id: true,
        title: true,
        content: true,
        slug: true,
        createdAt: true,
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc' // 從舊到新排序
      }
    });
    
    // 處理數據格式，生成摘要
    const formattedArticles = contextArticles.map(article => ({
      id: article.id,
      title: article.title,
      slug: article.slug,
      excerpt: article.content.slice(0, 100).replace(/[#*`]/g, '') + '...',
      likes: article._count.likes,
      comments: article._count.comments,
      createdAt: article.createdAt
    }));
    
    return NextResponse.json(formattedArticles)
  } catch (error) {
    console.error('Error fetching related articles:', error)
    return NextResponse.json({ error: '獲取相關文章失敗' }, { status: 500 })
  }
}
