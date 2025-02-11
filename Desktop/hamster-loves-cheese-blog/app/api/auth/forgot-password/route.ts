import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import jwt from "jsonwebtoken"
import { sendResetPasswordEmail } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()
    console.log('正在處理忘記密碼請求:', email)

    // 檢查用戶是否存在
    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return new NextResponse(
        JSON.stringify({ error: "找不到此信箱的用戶" }), 
        { status: 404 }
      )
    }

    // 生成重設密碼的 token
    const resetToken = jwt.sign(
      { userId: user.id },
      process.env.JWT_SECRET!,
      { expiresIn: '24h' }
    )

    console.log('生成 token，用戶 ID:', user.id)

    // 儲存重設 token 到資料庫
    await prisma.user.update({
      where: { id: user.id },
      data: { resetPasswordToken: resetToken }
    })

    // 發送郵件前記錄
    console.log('準備發送郵件:', {
      to: email,
      token: resetToken,
      SMTP_USER: process.env.SMTP_USER,
      SMTP_HOST: process.env.SMTP_HOST
    })

    await sendResetPasswordEmail(email, resetToken)
    console.log('郵件發送成功')

    return NextResponse.json({
      message: "重設密碼連結已發送到您的信箱"
    })

  } catch (error) {
    console.error('忘記密碼處理錯誤:', error)
    return new NextResponse(
      JSON.stringify({ error: "重設密碼請求失敗" }), 
      { status: 500 }
    )
  }
} 