import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { headers } from "next/headers"

// 移除原本的 GET 方法
// export async function GET(request: Request) { ... }

// 新增 PUT 方法用於更新密碼
export async function PUT(request: Request) {
  try {
    // 使用 JWT token 來驗證
    const token = await getToken({ 
      req: {
        headers: Object.fromEntries(headers()),
        cookies: Object.fromEntries(headers().get('cookie')?.split(';').map(c => c.trim().split('=')) || [])
      } as any,
      secret: process.env.NEXTAUTH_SECRET
    })

    console.log('Token:', token) // 除錯用

    if (!token) {
      return NextResponse.json(
        { error: "未授權訪問" }, 
        { status: 401 }
      )
    }

    const { currentPassword, newPassword } = await request.json()

    const user = await prisma.user.findUnique({
      where: { email: token.email as string }
    })

    if (!user || !user.password) {
      return NextResponse.json(
        { error: "用戶不存在或密碼未設置" }, 
        { status: 404 }
      )
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)
    if (!isValid) {
      return NextResponse.json(
        { error: "當前密碼錯誤" }, 
        { status: 401 }
      )
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({
      success: true,
      message: "密碼更新成功"
    })

  } catch (error) {
    console.error('密碼更新錯誤:', error)
    return NextResponse.json(
      { error: "密碼更新失敗" }, 
      { status: 500 }
    )
  }
} 