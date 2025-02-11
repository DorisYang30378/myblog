import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query) {
      return NextResponse.json({ articles: [] })
    }

    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { content: { contains: query } }
        ]
      },
      include: {
        category: true,
        comments: true,
        likes: true,
        bookmarks: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const formattedArticles = articles.map(article => ({
      ...article,
      likes: article.likes.length,
      comments: article.comments.length,
      isBookmarked: article.bookmarks.length > 0,
      isLiked: article.likes.length > 0
    }))

    return NextResponse.json({ articles: formattedArticles })
  } catch (error) {
    console.error("搜尋失敗:", error)
    return NextResponse.json({ error: "搜尋失敗" }, { status: 500 })
  }
} 