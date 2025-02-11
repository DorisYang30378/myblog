import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { commentId } = await req.json()
    const userId = Number(session.user.id)

    // 檢查是否已經按讚
    const existingLike = await prisma.commentLike.findFirst({
      where: {
        AND: [
          { userId: userId },
          { commentId: Number(commentId) }
        ]
      },
    })

    if (existingLike) {
      // 如果已經按讚，則取消按讚
      await prisma.commentLike.delete({
        where: {
          id: existingLike.id
        },
      })
      return NextResponse.json({ liked: false })
    } else {
      // 如果還沒按讚，則新增按讚
      await prisma.commentLike.create({
        data: {
          userId: userId,
          commentId: Number(commentId),
        },
      })
      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error handling comment like:", error)
    return NextResponse.json(
      { error: "Failed to handle like" },
      { status: 500 }
    )
  }
} 