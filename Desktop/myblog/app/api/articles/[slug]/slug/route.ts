import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const { slug: newSlug } = await request.json();
    
    // 先通過 slug 獲取文章
    const article = await prisma.article.findFirst({
      where: { slug: params.slug }
    });
    
    if (!article) {
      return NextResponse.json(
        { error: "文章不存在" },
        { status: 404 }
      );
    }
    
    const articleId = article.id;
    
    // 驗證 slug 格式
    if (!newSlug || !/^[a-z0-9\u4e00-\u9fa5-]+$/.test(newSlug)) {
      return NextResponse.json(
        { error: "無效的網址格式，只能包含小寫字母、數字、中文和連字符" },
        { status: 400 }
      );
    }
    
    // 檢查 slug 是否已被其他文章使用
    const existingArticle = await prisma.article.findFirst({
      where: {
        slug: newSlug,
        id: { not: articleId }
      }
    });
    
    if (existingArticle) {
      return NextResponse.json(
        { error: "此網址已被其他文章使用" },
        { status: 400 }
      );
    }
    
    // 更新文章的 slug
    const updatedArticle = await prisma.article.update({
      where: { id: articleId },
      data: { slug: newSlug }
    });
    
    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error('更新 slug 失敗:', error);
    return NextResponse.json(
      { error: '更新網址失敗' },
      { status: 500 }
    );
  }
} 