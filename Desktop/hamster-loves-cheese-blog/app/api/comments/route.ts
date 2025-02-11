import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(req: Request) {
  try {
    const { content, articleId, userId, parentId } = await req.json()
    
    // 添加日誌來檢查接收到的數據
    console.log('Received data:', { content, articleId, userId, parentId })

    // 確保轉換成數字類型
    const numericUserId = Number(userId)
    const numericArticleId = Number(articleId)
    const numericParentId = parentId ? Number(parentId) : undefined

    // 確保所有必要數據都存在
    if (!content || !numericArticleId || !numericUserId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        articleId: numericArticleId,
        userId: numericUserId,
        parentId: numericParentId,
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
          },
        },
      },
    })

    return NextResponse.json(comment)
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