import { withAuth } from "next-auth/middleware"

export default withAuth({
  callbacks: {
    authorized: ({ token }) => !!token
  },
})

export const config = {
  matcher: [
    "/api/user/password",  // 只保護密碼更新 API
    "/api/user/profile",   // 和個人資料更新 API
  ]
} 