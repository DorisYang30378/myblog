import prisma from "@/lib/prisma"
import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"

// 獲取所有分類
export async function GET() {
  try {
    const categories = await prisma.category.findMany()
    return NextResponse.json(categories)
  } catch (error) {
    console.error('獲取分類失敗:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// 生成 slug 的輔助函數
function generateSlug(name: string): string {
  // 為中文字元生成拼音或其他唯一標識
  const timestamp = Date.now()
  return `category-${timestamp}`
}

// 新增分類
export async function POST(request: Request) {
  try {
    const { name, slug } = await request.json()
    
    // 檢查分類名稱是否已存在
    const existingCategory = await prisma.category.findFirst({
      where: { name }
    })
    
    if (existingCategory) {
      return NextResponse.json(
        { error: '分類名稱已存在' },
        { status: 400 }
      )
    }
    
    // 使用用戶提供的 slug，如果沒有則根據名稱生成
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-')
    
    const category = await prisma.category.create({
      data: {
        name,
        slug: finalSlug
      }
    })
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('新增分類失敗:', error)
    return NextResponse.json(
      { error: '新增分類失敗' },
      { status: 500 }
    )
  }
}
