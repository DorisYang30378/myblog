/** @type {import('next-sitemap').IConfig} */
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

module.exports = {
  // 必填：你的網站 URL
  siteUrl: 'https://curioushammy.com',
  
  // 選填配置
  generateRobotsTxt: true, // 是否生成 robots.txt
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' }
    ]
  },
  exclude: [
    '/api/*',
    '/bookmarks',
    '/reset-password',
    '/upload',
    '/manage-articles',
    '/profile'
  ],
  changefreq: 'daily', // 更新頻率
  priority: 0.7, // 優先級
  sitemapSize: 5000, // 單個 sitemap 檔案包含的 URL 數量上限
  
  // 添加動態文章 URL
  async additionalPaths(config) {
    const query = await prisma.article.findMany({
      select: {
        slug: true,
        updatedAt: true
      }
    })

    // 為每篇文章生成 sitemap 項目
    return query.map((article) => ({
      loc: `/article/${article.slug}`,
      lastmod: new Date(article.updatedAt).toISOString(),
      changefreq: 'weekly',
      priority: 0.8
    }))
  }
} 