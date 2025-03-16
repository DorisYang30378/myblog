import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  const articles = await prisma.article.findMany({
    select: {
      slug: true,
      updatedAt: true,
      category: {
        select: { name: true }
      }
    }
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>https://curioushammy.com</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>
      ${articles.map(article => `
        <url>
          <loc>https://curioushammy.com/article/${article.slug}</loc>
          <lastmod>${article.updatedAt.toISOString()}</lastmod>
          <changefreq>weekly</changefreq>
          <priority>0.8</priority>
        </url>
      `).join('')}
    </urlset>`

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate'
    }
  })
} 