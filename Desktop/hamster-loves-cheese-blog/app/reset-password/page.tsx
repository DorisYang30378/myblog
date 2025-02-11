"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"

export default function ResetPasswordPage() {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (newPassword !== confirmPassword) {
      toast.error("密碼不一致")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          newPassword,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "重設密碼失敗")
      }

      alert("密碼重設成功！請使用新密碼登入")  // 使用簡單的 alert
      await router.push("/")  // 顯示完 alert 後再跳轉

    } catch (error: any) {
      alert(error.message)  // 錯誤也用 alert 顯示
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAF3E8] dark:bg-[#1a1a1a]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#5D4037] dark:text-white mb-4">
            無效的重設密碼連結
          </h1>
          <Button
            onClick={() => router.push("/")}
            className="bg-[#A67B5B] hover:bg-[#8B6E5B] text-white"
          >
            返回首頁
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#FAF3E8] dark:bg-[#1a1a1a]">
      <div className="w-full max-w-md space-y-8 bg-white dark:bg-[#2a2a2a] p-8 rounded-lg shadow-md">
        <div>
          <h1 className="text-2xl font-bold text-center text-[#5D4037] dark:text-white">
            重設密碼
          </h1>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="new-password" className="text-[#5D4037] dark:text-gray-200">
              新密碼
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="bg-white dark:bg-[#3a3a3a] border-gray-200 dark:border-gray-600"
              required
            />
          </div>
          <div>
            <Label htmlFor="confirm-password" className="text-[#5D4037] dark:text-gray-200">
              確認密碼
            </Label>
            <Input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="bg-white dark:bg-[#3a3a3a] border-gray-200 dark:border-gray-600"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#A67B5B] hover:bg-[#8B6E5B] text-white"
          >
            {isLoading ? "處理中..." : "重設密碼"}
          </Button>
        </form>
      </div>
    </div>
  )
} 