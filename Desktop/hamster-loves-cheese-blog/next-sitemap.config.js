/** @type {import('next-sitemap').IConfig} */
module.exports = {
  // 必填：你的網站 URL
  siteUrl: process.env.SITE_URL || 'https://example.com',
  
  // 選填配置
  generateRobotsTxt: true, // 是否生成 robots.txt
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/admin', '/private'] }
    ],
    additionalSitemaps: [
      'https://example.com/server-sitemap.xml' // 如果有額外的 sitemap
    ],
  },
  changefreq: 'daily', // 更新頻率
  priority: 0.7, // 優先級
  exclude: ['/admin/*', '/private/*'], // 排除的路徑
  sitemapSize: 5000, // 單個 sitemap 檔案包含的 URL 數量上限
} 