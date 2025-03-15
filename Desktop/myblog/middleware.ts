import { withAuth } from "next-auth/middleware"
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
})

export const config = {
  matcher: [
    "/api/user/password",  // 只保護密碼更新 API
    "/api/user/profile",   // 和個人資料更新 API
    '/((?!api|_next/static|_next/image|favicon.ico).*)',  // 處理 www 重定向
  ]
}

export function middleware(request: NextRequest) {
  // 檢查是否是 www 開頭的網域
  if (request.headers.get('host')?.startsWith('www.')) {
    const newUrl = new URL(request.url)
    newUrl.host = newUrl.host.replace('www.', '')
    return NextResponse.redirect(newUrl)
  }
  return NextResponse.next()
} 