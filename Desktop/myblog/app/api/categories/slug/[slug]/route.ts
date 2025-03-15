import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const category = await prisma.category.findFirst({
      where: {
        slug: params.slug
      },
      select: {
        id: true,
        name: true,
        slug: true
      }
    })

    if (!category) {
      return NextResponse.json(
        { error: "分類不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('獲取分類失敗:', error)
    return NextResponse.json(
      { error: "獲取分類失敗" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
} 