import ReadingReflectionsClient from './ReadingReflectionsClient'
import prisma from '@/lib/prisma'

export default async function ReadingReflectionsPage() {
  const articles = await prisma.article.findMany({
    where: {
      category: {
        name: "閱讀心得"
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
  const serializedArticles = articles.map(article => ({
    ...article,
    createdAt: article.createdAt.toISOString(),
    updatedAt: article.updatedAt.toISOString(),
  }))

  return <ReadingReflectionsClient initialArticles={serializedArticles} />
}

