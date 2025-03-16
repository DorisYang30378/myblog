import { Metadata } from 'next'
import Script from "next/script"
import ArticleClient from "./ArticleClient"
import prisma from "@/lib/prisma"

const getImageAlt = (url: string) => {
  try {
    const decodedUrl = decodeURIComponent(url)
    const fullFileName = decodedUrl.split('/').pop() || ''
    const fileName = fullFileName.replace(/\.[^.]+$/, '')
    
    return /[\u4e00-\u9fa5]/.test(fileName)
      ? fileName
      : fileName.replace(/[-_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
  } catch (error) {
    return '文章圖片'
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const article = await prisma.article.findFirst({
    where: { slug: params.slug },
    include: { category: true }
  })

  if (!article) return {}

  const description = article.content.substring(0, 160).replace(/[#*]/g, '')

  return {
    title: article.title,
    description: description,
    openGraph: {
      title: article.title,
      description: description,
      type: 'article',
      publishedTime: article.createdAt.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      images: article.images ? JSON.parse(article.images).map((img: any) => ({
        url: img.url,
        alt: getImageAlt(img.url)
      })) : [],
      siteName: '小倉鼠戀知識'
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: description
    },
    metadataBase: new URL('https://你的網站域名'),
    alternates: {
      canonical: `/article/${article.slug}`
    }
  }
}

export default async function ArticlePage({ params }: { params: { slug: string } }) {
  const article = await prisma.article.findFirst({
    where: { slug: params.slug },
    include: { category: true }
  })

  if (!article) return null

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title,
    "description": article.content.substring(0, 160).replace(/[#*]/g, ''),
    "datePublished": article.createdAt,
    "dateModified": article.updatedAt,
    "articleSection": article.category.name,
    "image": article.images ? JSON.parse(article.images)[0]?.url : null,
    "author": {
      "@type": "Organization",
      "name": "小倉鼠戀知識"
    },
    "publisher": {
      "@type": "Organization",
      "name": "小倉鼠戀知識",
      "logo": {
        "@type": "ImageObject",
        "url": "https://curioushammy.com/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://curioushammy.com/article/${article.slug}`
    }
  }

  return (
    <>
      <Script
        id="article-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ArticleClient params={params} />
    </>
  )
}

