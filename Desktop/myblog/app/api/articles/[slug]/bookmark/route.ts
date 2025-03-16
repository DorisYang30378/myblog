import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// 檢查收藏狀態
export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // 先通過 slug 獲取文章
    const article = await prisma.article.findFirst({
      where: { slug: params.slug }
    })

    if (!article) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      )
    }

    const session = await getServerSession(authOptions)

    // 如果用戶未登入，返回未收藏
    if (!session?.user) {
      return NextResponse.json({ bookmarked: false })
    }

    // 檢查用戶是否已收藏
    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: session.user.id,
        articleId: article.id
      }
    })

    return NextResponse.json({ 
      bookmarked: !!bookmark
    })
  } catch (error) {
    console.error("Get bookmark status error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// 切換收藏狀態
export async function POST(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    // 先通過 slug 獲取文章
    const article = await prisma.article.findFirst({
      where: { slug: params.slug }
    })

    if (!article) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      )
    }

    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = session.user.id
    const articleId = article.id

    // 檢查是否已經收藏
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: userId,
        articleId: articleId
      }
    })

    if (existingBookmark) {
      // 如果已經收藏，則取消收藏
      await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id
        }
      })
    } else {
      // 如果還沒收藏，則新增收藏
      await prisma.bookmark.create({
        data: {
          userId,
          articleId,
        }
      })
    }

    return NextResponse.json({ 
      bookmarked: !existingBookmark
    })
  } catch (error) {
    console.error("Bookmark error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 