import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import prisma from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

// 檢查按讚狀態
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const articleId = parseInt(params.id)

    // 獲取總按讚數
    const totalLikes = await prisma.like.count({
      where: {
        articleId: articleId
      }
    })

    // 如果用戶未登入，只返回總按讚數
    if (!session?.user) {
      return NextResponse.json({ liked: false, totalLikes })
    }

    // 檢查用戶是否已按讚
    const like = await prisma.like.findFirst({
      where: {
        userId: session.user.id,
        articleId: articleId
      }
    })

    return NextResponse.json({ 
      liked: !!like,
      totalLikes 
    })
  } catch (error) {
    console.error("Get like status error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}

// 切換按讚狀態
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const userId = session.user.id
    const articleId = parseInt(params.id)

    // 檢查是否已經按讚
    const existingLike = await prisma.like.findFirst({
      where: {
        userId: userId,
        articleId: articleId
      }
    })

    if (existingLike) {
      // 如果已經按讚，則取消按讚
      await prisma.like.delete({
        where: {
          id: existingLike.id
        }
      })
    } else {
      // 如果還沒按讚，則新增按讚
      await prisma.like.create({
        data: {
          userId,
          articleId,
        }
      })
    }

    // 獲取最新的總按讚數
    const totalLikes = await prisma.like.count({
      where: {
        articleId: articleId
      }
    })

    return NextResponse.json({ 
      liked: !existingLike,
      totalLikes 
    })
  } catch (error) {
    console.error("Like error:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
} 