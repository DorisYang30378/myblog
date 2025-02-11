import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET(
  request: Request,
  { params }: { params: { articleId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const userId = session?.user?.id

    const comments = await prisma.comment.findMany({
      where: {
        articleId: parseInt(params.articleId),
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