import ReadingReflectionsClient from './ReadingReflectionsClient'
import prisma from '@/lib/prisma'
import { unstable_noStore as noStore } from 'next/cache'

export default async function ReadingReflectionsPage() {
  // 禁用緩存
  noStore()

  const articles = await prisma.article.findMany({
    where: {
      category: {
        slug: "reading-reflections"
      }
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  // 將 Date 物件轉換為字串
  const serializedArticles = articles.map((article) => ({
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  }))

  return <ReadingReflectionsClient initialArticles={serializedArticles} />
}

