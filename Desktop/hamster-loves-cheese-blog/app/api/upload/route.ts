import { NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

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

    // 生成唯一的檔案名稱
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const filename = `${uniqueSuffix}-${file.name}`
    
    // 確保上傳目錄存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    
    // 讀取檔案內容
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // 寫入檔案
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)
    
    // 返回檔案URL
    return NextResponse.json({ 
      url: `/uploads/${filename}`,
      success: true 
    })
    
  } catch (error) {
    console.error('上傳錯誤:', error)
    return NextResponse.json(
      { error: '檔案上傳失敗' },
      { status: 500 }
    )
  }
}

// 設定檔案上傳大小限制
export const config = {
  api: {
    bodyParser: false,
  },
}