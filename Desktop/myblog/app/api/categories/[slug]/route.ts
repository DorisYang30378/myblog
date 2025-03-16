import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"

// 刪除分類
export async function DELETE(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // 先通過 slug 查找分類
    const category = await prisma.category.findFirst({
      where: { slug: params.slug }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: "分類不存在" },
        { status: 404 }
      )
    }
    
    const categoryId = category.id
    
    // 檢查是否有文章使用此分類
    const articlesCount = await prisma.article.count({
      where: { categoryId }
    })

    if (articlesCount > 0) {
      return new NextResponse('Category is in use', { status: 400 })
    }

    await prisma.category.delete({
      where: { id: categoryId }
    })

    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('刪除分類失敗:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    console.log('API: 收到的 slug:', params.slug) // 修改變數名稱
    
    const category = await prisma.category.findFirst({
      where: {
        slug: params.slug
      },
      include: {
        articles: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    
    console.log('API: 查詢到的分類:', category)

    if (!category) {
      return NextResponse.json(
        { error: "分類不存在" },
        { status: 404 }
      )
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: "獲取分類失敗" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const { name, slug: newSlug } = await request.json()
    
    // 先通過 slug 查找分類
    const category = await prisma.category.findFirst({
      where: { slug: params.slug }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: "分類不存在" },
        { status: 404 }
      )
    }
    
    const categoryId = category.id

    // 檢查新的分類名稱是否已存在
    const existingCategory = await prisma.category.findFirst({
      where: {
        name,
        id: { not: categoryId }
      }
    })

    if (existingCategory) {
      return NextResponse.json(
        { error: '分類名稱已存在' },
        { status: 400 }
      )
    }

    const updatedCategory = await prisma.category.update({
      where: { id: categoryId },
      data: { name, slug: newSlug }
    })

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('更新分類失敗:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 