import { NextResponse } from "next/server"
import { writeFile, mkdir, unlink } from 'fs/promises'
import path from 'path'
import prisma from "@/lib/prisma"

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
        await unlink(path.join(process.cwd(), 'public', user.avatar))
      } catch (error) {
        console.error('刪除舊檔案失敗:', error)
      }
    }

    // 生成唯一的檔案名稱
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
    const filename = `${uniqueSuffix}-${file.name}`
    
    // 確保上傳目錄存在
    const uploadDir = path.join(process.cwd(), 'public', 'uploads')
    await mkdir(uploadDir, { recursive: true })
    
    // 保存文件
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)
    
    // 更新資料庫
    const avatarPath = `/uploads/${filename}`
    const updatedUser = await prisma.user.update({
      where: { id: userIdNumber },
      data: { 
        avatar: avatarPath,
        image: avatarPath  // 確保同時更新 NextAuth 使用的 image 欄位
      }
    })

    return NextResponse.json({ 
      success: true,
      url: avatarPath,
      user: updatedUser  // 返回更新後的用戶資料
    })

  } catch (error) {
    console.error('上傳錯誤:', error)
    return NextResponse.json(
      { error: '頭像更新失敗' },
      { status: 500 }
    )
  }
}

export const config = {
  api: {
    bodyParser: false
  }
}
