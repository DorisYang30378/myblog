import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

// 管理者信箱列表
const ADMIN_EMAILS = ['abcd901125@gmail.com']

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "信箱或密碼錯誤" }), 
        { status: 401 }
      )
    }

    const isValid = await bcrypt.compare(password, user.password)
    if (!isValid) {
      return new NextResponse(
        JSON.stringify({ error: "信箱或密碼錯誤" }), 
        { status: 401 }
      )
    }

    // 檢查是否為管理者
    const isAdmin = ADMIN_EMAILS.includes(email)

    const token = jwt.sign(
      { 
        userId: user.id,
        isAdmin  // 將管理者狀態加入 token
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '7d' }
    )

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        isAdmin  // 確保這個欄位存在
      },
      token
    })

  } catch (error) {
    console.error('登入錯誤:', error)
    return new NextResponse(
      JSON.stringify({ error: "登入失敗" }), 
      { status: 500 }
    )
  }
} 