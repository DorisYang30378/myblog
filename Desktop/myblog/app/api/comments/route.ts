import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"

export async function POST(req: Request) {
  try {
    // 驗證用戶是否已登入
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content, articleId, parentId } = await req.json()
    const userId = Number(session.user.id)  // 從 session 獲取用戶 ID
    
    // 添加日誌來檢查接收到的數據
    console.log('Received data:', { content, articleId, parentId, userId })

    // 確保所有必要數據都存在
    if (!content || !articleId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        articleId: Number(articleId),
        userId,
        parentId: parentId ? Number(parentId) : null,
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            image: true,
          },
        },
      },
    })

    // 格式化回應以匹配前端期望的格式
    const formattedComment = {
      id: comment.id,
      author: comment.user.name || "匿名用戶",
      avatarUrl: comment.user.image || comment.user.avatar,
      content: comment.content,
      date: comment.createdAt.toLocaleDateString("zh-TW"),
      likes: 0,
      isLiked: false,
      parentId: comment.parentId,
    }

    return NextResponse.json(formattedComment)
  } catch (error) {
    // 添加更詳細的錯誤日誌
    console.error('Error creating comment:', error)
    return NextResponse.json(
      { 
        error: "Error creating comment", 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
} 