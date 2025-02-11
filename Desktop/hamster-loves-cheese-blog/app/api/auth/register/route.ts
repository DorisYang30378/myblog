import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    // 檢查信箱是否已被使用
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return new NextResponse(
        JSON.stringify({ error: "此信箱已被註冊" }), 
        { status: 400 }
      )
    }

    // 加密密碼
    const hashedPassword = await bcrypt.hash(password, 12)

    // 創建新用戶
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split('@')[0],
        avatar: `https://api.dicebear.com/7.x/lorelei/svg?seed=${email}`       
      }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.avatar
      }
    })

  } catch (error) {
    console.error('註冊錯誤:', error)
    return new NextResponse(
      JSON.stringify({ error: "註冊失敗" }), 
      { status: 500 }
    )
  }
}
