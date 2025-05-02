import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // 使用原來的文件路徑處理邏輯，但不使用 path 模塊
    const filePath = '/data/uploads/' + params.path.join('/')
    
    try {
      // 使用 Node.js 原生 fs 而不是 fs/promises
      const fs = require('fs')
      const fileBuffer = fs.readFileSync(filePath)
      
      // 獲取文件擴展名，不使用 path 模塊
      const filename = filePath.split('/').pop() || ''
      const ext = filename.includes('.') ? '.' + filename.split('.').pop()?.toLowerCase() : ''
      
      const mimeTypes = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      }

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeTypes[ext as keyof typeof mimeTypes] || 'application/octet-stream',
          'Cache-Control': 'public, max-age=31536000, immutable', // 一年緩存
          'X-Content-Type-Options': 'nosniff',
        },
      })
    } catch (e) {
      console.error(`找不到圖片文件: ${filePath}`, e)
      return new NextResponse('圖片不存在', { status: 404 })
    }
  } catch (error) {
    console.error('圖片讀取錯誤:', error)
    return new NextResponse('圖片讀取失敗', { status: 500 })
  }
} 