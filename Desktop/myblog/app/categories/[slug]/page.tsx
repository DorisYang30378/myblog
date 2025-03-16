import { Metadata } from "next"
import prisma from "@/lib/prisma"
import { CategoryProvider } from '@/app/contexts/CategoryContext'
import CategoryClient from './CategoryClient'

interface CategoryPageProps {
  params: {
    slug: string
  }
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  // 1. 檢查 URL 參數
  console.log('1. URL id:', params.slug)

  // 2. 查詢資料庫
  const category = await prisma.category.findFirst({
    where: {
      slug: params.slug
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

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const category = await prisma.category.findFirst({
    where: { slug: params.slug }
  })

  if (!category) return {}

  return {
    title: category.name,
    description: `瀏覽 ${category.name} 分類的所有文章`,
    openGraph: {
      title: category.name,
      description: `瀏覽 ${category.name} 分類的所有文章`,
      type: 'website',
      siteName: '小倉鼠戀知識'
    }
  }
} 