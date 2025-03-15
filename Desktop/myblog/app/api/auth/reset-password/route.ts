import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json()
    console.log('正在處理重設密碼請求:', { token: token.substring(0, 10) + '...' })

    // 驗證 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }
    console.log('解析的用戶 ID:', decoded.userId)

    // 查找用戶
    const user = await prisma.user.findFirst({
      where: { 
        id: parseInt(decoded.userId)
      }
    })
    
    console.log('找到的用戶:', user?.id)

    if (!user) {
      console.log('找不到用戶')
      return new NextResponse(
        JSON.stringify({ error: "無效的重設密碼連結" }), 
        { status: 400 }
      )
    }

    console.log('找到用戶，準備更新密碼')

    // 更新密碼
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        password: hashedPassword,
        resetPasswordToken: null
      }
    })

    console.log('密碼更新成功')
    return NextResponse.json({ message: "密碼已重設成功" })

  } catch (error) {
    console.error('重設密碼錯誤:', error)
    return new NextResponse(
      JSON.stringify({ error: "重設密碼失敗" }), 
      { status: 500 }
    )
  }
} 