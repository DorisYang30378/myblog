import { NextResponse } from "next/server"
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import prisma from "@/lib/prisma"
import { optimizeImage } from '@/lib/imageOptimizer'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
const UPLOAD_DIR = '/data/uploads'  // 使用絕對路徑

export async function PUT(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')
    const userId = formData.get('userId')
    
    if (!file || !userId) {
      return NextResponse.json({ error: "缺少必要資訊" }, { status: 400 })
    }

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: "無效的檔案格式" }, { status: 400 })
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "檔案太大，請選擇 5MB 以內的圖片" }, { status: 400 })
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return NextResponse.json({ error: "只允許上傳圖片檔案" }, { status: 400 })
    }

    const userIdNumber = parseInt(userId as string, 10)
    if (isNaN(userIdNumber)) {
      return NextResponse.json({ error: "無效的用戶ID" }, { status: 400 })
    }

    // 先檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { id: userIdNumber }
    })

    if (!user) {
      return NextResponse.json({ error: "用戶不存在" }, { status: 404 })
    }

    // 刪除舊頭像
    if (user.avatar?.startsWith('/uploads/')) {
      try {
        const oldFilename = user.avatar.replace('/uploads/', '')
        const oldFilePath = path.join(UPLOAD_DIR, oldFilename)
        await unlink(oldFilePath)
      } catch (error) {
        console.error('刪除舊檔案失敗:', error)
        // 不中斷流程，繼續執行
      }
    }

    // 生成新檔名 (改用 .webp 副檔名)
    const timestamp = Date.now()
    const filename = `avatar-${userIdNumber}-${timestamp}.webp`
    const filepath = path.join(UPLOAD_DIR, filename)

    // 確保上傳目錄存在
    await mkdir(UPLOAD_DIR, { recursive: true })
    
    // 讀取並優化圖片
    const bytes = await (file as File).arrayBuffer()
    const buffer = Buffer.from(bytes)
    const optimizedBuffer = await optimizeImage(buffer)
    
    // 保存優化後的文件
    await writeFile(filepath, optimizedBuffer)
    
    // 更新資料庫
    const avatarPath = `/uploads/${filename}`
    const updatedUser = await prisma.user.update({
      where: { id: userIdNumber },
      data: { 
        avatar: avatarPath,
        image: avatarPath
      }
    })

    return NextResponse.json({ 
      success: true,
      url: `${avatarPath}?t=${timestamp}`,
      user: updatedUser
    }, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('上傳錯誤:', error)
    return NextResponse.json(
      { error: '頭像更新失敗', details: (error as Error).message },
      { status: 500 }
    )
  }
}


// 原有的代碼...