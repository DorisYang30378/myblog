import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"

export async function GET(
  request: Request,
  { params }: { params: { articleId: string } }
) {
  try {
    // 記錄接收到的參數，用於調試
    console.log("評論 API 接收到的文章 ID:", params.articleId);
    
    if (!params.articleId) {
      console.error("文章 ID 為空");
      return NextResponse.json({ error: "文章 ID 不能為空" }, { status: 400 });
    }
    
    // 確保 articleId 是有效的數字
    const articleId = parseInt(params.articleId, 10);
    if (isNaN(articleId)) {
      console.error("無效的文章 ID 格式:", params.articleId);
      return NextResponse.json({ error: "無效的文章 ID 格式" }, { status: 400 });
    }
    
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    // 使用 articleId 查詢評論
    const comments = await prisma.comment.findMany({
      where: {
        articleId: articleId,  // 確保這裡使用解析後的數字 ID
        parentId: null,
      },
      include: {
        user: {
          select: {
            name: true,
            avatar: true,
            image: true,
          },
        },
        likes: true,
        replies: {
          include: {
            user: {
              select: {
                name: true,
                avatar: true,
                image: true,
              },
            },
            likes: true,
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    // 記錄找到的評論數量
    console.log(`找到 ${comments.length} 條評論，文章 ID: ${articleId}`);

    const formattedComments = comments.map(comment => ({
      id: comment.id,
      author: comment.user.name || "匿名用戶",
      avatarUrl: comment.user.image || comment.user.avatar,
      content: comment.content,
      date: comment.createdAt.toLocaleDateString("zh-TW"),
      likes: comment.likes.length,
      isLiked: userId ? comment.likes.some(like => like.userId === Number(userId)) : false,
      replies: comment.replies.map(reply => ({
        id: reply.id,
        author: reply.user.name || "匿名用戶",
        avatarUrl: reply.user.image || reply.user.avatar,
        content: reply.content,
        date: reply.createdAt.toLocaleDateString("zh-TW"),
        likes: reply.likes.length,
        isLiked: userId ? reply.likes.some(like => like.userId === Number(userId)) : false,
        parentId: comment.id,
      })),
    }))

    return NextResponse.json(formattedComments)
  } catch (error) {
    console.error("Error fetching comments:", error)
    return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
  }
}