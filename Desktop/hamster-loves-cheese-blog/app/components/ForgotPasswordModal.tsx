"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ForgotPasswordModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function ForgotPasswordModal({ isOpen, onClose }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsLoading(true)

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      setSuccess(true)
      setTimeout(() => {
        onClose()
        setEmail("")
        setSuccess(false)
      }, 2000)

    } catch (error: any) {
      setError(error.message || "發送重設密碼郵件失敗")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[375px] bg-[#FFF8ED] dark:bg-gray-900 border-[#A67B5B] dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-[#5D4037] dark:text-gray-100">
            忘記密碼
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          {success && (
            <div className="text-green-500 text-sm text-center">重設密碼郵件已發送！</div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email" className="text-[#5D4037] dark:text-gray-300">
              電子郵件
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="bg-white dark:bg-gray-800 border-[#A67B5B] dark:border-gray-600 text-[#5D4037] dark:text-gray-100"
              required
            />
          </div>
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#A67B5B] hover:bg-[#8B6E5B] dark:bg-gray-700 dark:hover:bg-gray-600 text-[#F5E6D3] dark:text-gray-100"
          >
            {isLoading ? "發送中..." : "發送重設密碼郵件"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

