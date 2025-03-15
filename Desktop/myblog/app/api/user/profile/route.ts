import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/options"


export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log('Session:', session)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    const data = await request.json()
    console.log('接收到的資料:', data)

    // 轉換 id 為數字類型進行比較
    const sessionUserId = Number(session.user.id)
    const requestUserId = Number(data.userId)

    if (sessionUserId !== requestUserId) {
      console.log('用戶ID不匹配:', { sessionId: sessionUserId, requestId: requestUserId })
      return NextResponse.json({ error: "未授權" }, { status: 401 })
    }

    const updatedUser = await prisma.user.update({
      where: { id: requestUserId },  // 使用轉換後的 id
      data: { 
        name: data.name,
        email: data.email,
      }
    })
    console.log('更新後的用戶:', updatedUser)

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('更新錯誤:', error)
    return NextResponse.json({ error: "更新失敗" }, { status: 500 })
  }
}
