import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session)

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = session.user.id
    const articleId = parseInt(params.id)
    console.log('UserId:', userId, 'ArticleId:', articleId)

    // 檢查是否已經收藏
    const existingBookmark = await prisma.bookmark.findFirst({
      where: {
        userId: userId,
        articleId: articleId
      }
    })
    console.log('Existing bookmark:', existingBookmark)

    if (existingBookmark) {
      const deleted = await prisma.bookmark.delete({
        where: {
          id: existingBookmark.id
        }
      })
      console.log('Deleted bookmark:', deleted)
      return NextResponse.json({ bookmarked: false })
    } else {
      const created = await prisma.bookmark.create({
        data: {
          userId,
          articleId,
        }
      })
      console.log('Created bookmark:', created)
      return NextResponse.json({ bookmarked: true })
    }
  } catch (error) {
    console.error("Bookmark error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// 檢查文章是否已被收藏
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ bookmarked: false })
    }

    const userId = session.user.id
    const articleId = parseInt(params.id)

    const bookmark = await prisma.bookmark.findFirst({
      where: {
        userId: userId,
        articleId: articleId
      }
    })

    return NextResponse.json({ bookmarked: !!bookmark })
  } catch (error) {
    console.error("Get bookmark status error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 