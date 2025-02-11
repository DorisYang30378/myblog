import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "../../auth/[...nextauth]/route"

// 刪除分類
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const categoryId = parseInt(params.id)
    
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
  { params }: { params: { id: string } }
) {
  try {
    console.log('API: 收到的 slug:', params.id) // 檢查收到的參數
    
    const category = await prisma.category.findFirst({
      where: {
        slug: params.id
      },
      include: {
        articles: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    })
    
    console.log('API: 查詢到的分類:', category) // 檢查資料庫查詢結果

    if (!category) {
      return NextResponse.json(
        { error: "分類不存在" },
        { status: 404 }
      )
    }

    // 返回包含中文名稱的分類資料
    return NextResponse.json(category)  // category.name 會是中文
  } catch (error) {
    console.error('API Error:', error) // 檢查錯誤
    return NextResponse.json(
      { error: "獲取分類失敗" },
      { status: 500 }
    )
  }
} 