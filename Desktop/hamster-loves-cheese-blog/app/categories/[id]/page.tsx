import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { CategoryProvider } from '@/app/contexts/CategoryContext'
import CategoryClient from './CategoryClient'

interface CategoryPageProps {
  params: {
    id: string
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // 1. 檢查 URL 參數
  console.log('1. URL id:', params.id)

  // 2. 查詢資料庫
  const category = await prisma.category.findFirst({
    where: {
      slug: params.id
    }
  })
  console.log('Category data from database:', category)

  if (!category) {
    return <div>分類不存在</div>
  }

  return (
    <CategoryProvider category={category}>
      <CategoryClient category={category} />
    </CategoryProvider>
  )
} 