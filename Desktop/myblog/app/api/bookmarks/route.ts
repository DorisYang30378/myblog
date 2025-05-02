import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"
import prisma from "@/lib/prisma"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const bookmarks = await prisma.bookmark.findMany({
      where: {
        user: {
          email: session.user.email
        }
      },
      include: {
        article: {
          include: {
            category: true,
            _count: {
              select: {
                likes: true,
                comments: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const formattedBookmarks = bookmarks.map(bookmark => {
      let imageUrl = "/placeholder.svg"
      
      try {
        if (bookmark.article.images) {
          const imagesData = JSON.parse(bookmark.article.images)
          if (Array.isArray(imagesData) && imagesData.length > 0) {
            imageUrl = imagesData[0].url || "/placeholder.svg"
          }
        }
      } catch (error) {
        console.error('解析圖片錯誤:', error)
      }

      return {
        id: bookmark.article.id,
        title: bookmark.article.title,
        slug: bookmark.article.slug || `article-${bookmark.article.id}`,
        createdAt: bookmark.article.createdAt.toISOString(),
        category: bookmark.article.category.name,
        excerpt: bookmark.article.content.substring(0, 100) + "...",
        image: imageUrl,
        thumbnail: bookmark.article.thumbnail,
        likes: bookmark.article._count.likes,
        comments: bookmark.article._count.comments
      }
    })

    console.log('格式化後的書籤:', formattedBookmarks)

    return NextResponse.json(formattedBookmarks)
  } catch (error) {
    console.error("獲取收藏失敗:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 