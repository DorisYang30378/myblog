import { NextResponse } from 'next/server'
import { writeFile, mkdir, access } from 'fs/promises'
import path from 'path'
import { optimizeImage } from '@/lib/imageOptimizer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_FILE_SIZE = 5 * 1024 * 1024  // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { error: "未上傳任何檔案" },
        { status: 400 }
      )
    }

    // 驗證檔案類型和大小
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: "只允許上傳圖片檔案" },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: "檔案大小不能超過 5MB" },
        { status: 400 }
      )
    }

    // 使用 data/upload 作為上傳目錄
    const uploadDir = process.env.UPLOAD_DIR || '/data/uploads'
    let filename = file.name
    let filepath = path.join(uploadDir, filename)

    // 如果檔案已存在，在檔名前加上時間戳和短隨機字串
    try {
      await access(filepath)
      const timestamp = Date.now()
      const shortId = Math.random().toString(36).substring(2, 8)
      const ext = '.webp'  // 統一使用 webp 格式
      const nameWithoutExt = filename.split('.')[0]
      filename = `${nameWithoutExt}-${timestamp}-${shortId}${ext}`
      filepath = path.join(uploadDir, filename)
    } catch {
      // 檔案不存在，可以直接使用原始檔名，但還是要轉換為 webp
      const nameWithoutExt = filename.split('.')[0]
      filename = `${nameWithoutExt}.webp`
      filepath = path.join(uploadDir, filename)
    }

    // 確保上傳目錄存在
    await mkdir(uploadDir, { recursive: true })
    
    // 讀取並優化圖片
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const optimizedBuffer = await optimizeImage(buffer)
    
    // 寫入優化後的檔案
    await writeFile(filepath, optimizedBuffer)
    
    // 返回統一的路徑格式
    return NextResponse.json({ 
      url: `/uploads/${filename}`,
      success: true 
    })
  } catch (error) {
    console.error('上傳錯誤:', error)
    return NextResponse.json(
      { error: '檔案上傳失敗', details: (error as Error).message },
      { status: 500 }
    )
  }
} 
