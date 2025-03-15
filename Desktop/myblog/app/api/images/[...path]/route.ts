import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: Request,
  { params }: { params: { path: string[] } }
) {
  try {
    // 修改這裡，添加前導斜線
    const filePath = path.join('/data/uploads', ...params.path)
    console.log('嘗試讀取文件:', filePath) // 添加日誌
    
    try {
      const fileBuffer = await readFile(filePath)
      
      // 設置正確的 Content-Type
      const ext = path.extname(filePath).toLowerCase()
      const mimeTypes: { [key: string]: string } = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      }

      return new NextResponse(fileBuffer, {
        headers: {
          'Content-Type': mimeTypes[ext] || 'application/octet-stream',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
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