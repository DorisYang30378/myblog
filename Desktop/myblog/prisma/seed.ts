const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  // 創建分類
  const seoCategory = await prisma.category.create({
    data: {
      name: 'SEO'
    }
  })

  // 創建文章
  await prisma.article.create({
    data: {
      title: '測試文章',
      content: '這是一篇測試文章的內容',
      categoryId: seoCategory.id,
      images: JSON.stringify([])
    }
  })

  console.log('測試數據添加成功！')
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
