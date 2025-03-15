"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useUser } from "../contexts/UserContext"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import PageLayout from "../components/PageLayout"
import { toast, Toaster } from "sonner"
import { Eye, EyeOff } from "lucide-react"
import { useSession, signIn, signOut } from "next-auth/react"
import Breadcrumb from '../components/Breadcrumb'

export default function ProfilePage() {
  const { user, updateUser } = useUser()
  const router = useRouter()
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { data: session, status, update } = useSession()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")  // 或者你的登入頁面
      return
    }
  }, [status, router])

  useEffect(() => {
    if (!user) {
      router.push("/")
    }
  }, [user, router])

  if (!user) {
    return null
  }

  const handleResetPassword = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsResetPasswordOpen(true)
  }

  const handleChangePassword = async () => {
    if (status !== "authenticated") {
      toast.error('請先登入')
      return
    }

    try {
      console.log('開始密碼更新請求')  // 除錯用
      
      const currentPassword = (document.getElementById('current-password') as HTMLInputElement).value
      const newPassword = (document.getElementById('new-password') as HTMLInputElement).value
      const confirmPassword = (document.getElementById('confirm-password') as HTMLInputElement).value

    if (newPassword !== confirmPassword) {
      toast.error('新密碼與確認密碼不符')
      return
    }

      const response = await fetch('/api/user/password', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
        },
        credentials: 'include',  // 改回 include
        body: JSON.stringify({ 
          currentPassword, 
          newPassword 
        })
      })

      console.log('Response status:', response.status)  // 除錯用
      
      if (!response.ok) {
        const errorData = await response.json()
        console.error('Error data:', errorData)  // 除錯用
        throw new Error(errorData.error || '密碼更新失敗')
      }

      const data = await response.json()
      console.log('Success data:', data)  // 除錯用
      
      toast.success('密碼已更新')
      setIsResetPasswordOpen(false)
    } catch (error: any) {
      console.error('Error details:', error)  // 除錯用
      toast.error(error.message || '密碼更新失敗')
    }
  }

  const handleSave = async () => {
    try {
      const name = (document.getElementById('name') as HTMLInputElement).value
      const email = (document.getElementById('email') as HTMLInputElement).value
      
      console.log('發送更新請求:', {
        name,
        email,
        userId: user.id
      })

      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          email,
          userId: user.id
        })
      })

      console.log('Response status:', response.status)
      const responseData = await response.json()
      console.log('Response data:', responseData)

      if (!response.ok) {
        throw new Error(responseData.error || '資料更新失敗')
      }
      
      updateUser({
        ...user,
        name: responseData.name,
        email: responseData.email
      })
      
      toast.success('資料更新成功！')
    } catch (error: any) {
      console.error('更新錯誤:', error)
      toast.error(error.message || '資料更新失敗')
    }
  }

  const handleAvatarChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // 檢查文件類型
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('只允許上傳圖片檔案')
      return
    }

    // 檢查文件大小
    if (file.size > 5 * 1024 * 1024) {
      toast.error('檔案太大，請選擇 5MB 以內的圖片')
      return
    }

    // 創建預覽
    const objectUrl = URL.createObjectURL(file)
    setPreviewUrl(objectUrl)

    try {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append('file', file, file.name)
      formData.append('userId', String(user.id))
      
      const response = await fetch('/api/user/avatar', {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || '頭像更新失敗')
      }

      const data = await response.json()
      
      // 直接使用後端返回的 url，因為後端已經處理好路徑格式
      const newImageUrl = data.url
      
      updateUser({
        ...user,
        avatar: newImageUrl,
        image: newImageUrl
      })

      if (session) {
        await update({
          ...session,
          user: {
            ...session.user,
            image: newImageUrl
          }
        })
      }

      toast.success('頭像更新成功！下一次登入即可看到新頭像')
    } catch (error: any) {
      console.error('錯誤:', error)
      toast.error(error.message || '頭像更新失敗')
      // 上傳失敗時清除預覽
      setPreviewUrl(null)
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      // 清理預覽 URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  // 組件卸載時清理預覽 URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  return (
    <div className="min-h-screen bg-[#FAF3E8] dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb
          items={[
            { label: '首頁', href: '/' },
            { label: '個人資料', href: '/profile' }
          ]}
          className="mb-6"
        />
        <PageLayout 
          title=""
          className="bg-[#FAF3E8] dark:bg-[#1a1a1a]"
        >
          <div className="max-w-4xl mx-auto">
            <Card className="bg-white dark:bg-[#2a2a2a] border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-2xl md:text-3xl font-bold text-[#5C4033] dark:text-white mb-6 md:mb-8 text-center">
                  個人資料
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Left side - Avatar */}
                  <div className="flex flex-col items-center md:items-start">
                    <Avatar className="w-32 h-32 mb-6">
                      <AvatarImage 
                        src={previewUrl || user.avatar || user.image}
                        alt={user.name}
                        className={isUploading ? "opacity-50" : ""}
                      />
                      <AvatarFallback>
                        {isUploading ? "上傳中..." : (user.name?.[0]?.toUpperCase() || '👤')}
                      </AvatarFallback>
                    </Avatar>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      accept="image/*"
                      className="hidden"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleAvatarClick}
                      className="avatar-change-btn bg-transparent text-[#A67B5B] border-[#A67B5B] hover:bg-[#F7F1E9] hover:text-[#A67B5B] dark:text-white dark:border-white dark:hover:bg-[#3D3D3D] dark:hover:text-[#E0E0E0] w-full md:w-32 transition-all duration-300 ease-in-out"
                    >
                      更換頭像
                    </Button>
                  </div>

                  {/* Right side - Form fields */}
                  <div className="flex-1">
                    <form className="space-y-6">
                      <div className="grid gap-2">
                        <Label htmlFor="name" className="text-primary dark:text-gray-200">
                          名稱
                        </Label>
                        <Input
                          id="name"
                          defaultValue={user.name}
                          className="bg-white dark:bg-[#3a3a3a] border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="email" className="text-primary dark:text-gray-200">
                          電子郵件
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          defaultValue={user.email}
                          className="bg-white dark:bg-[#3a3a3a] border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="password" className="text-primary dark:text-gray-200">
                          密碼
                        </Label>
                        <div className="flex gap-2">
                          <Input
                            id="password"
                            type="password"
                            value="********"
                            readOnly
                            className="bg-white dark:bg-[#3a3a3a] border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                          />
                          <Button
                            variant="outline"
                            onClick={handleResetPassword}
                            className="reset-password-btn whitespace-nowrap bg-transparent text-[#A67B5B] border-[#A67B5B] hover:bg-[#F7F1E9] hover:text-[#A67B5B] dark:text-white dark:border-white dark:hover:bg-[#3D3D3D] dark:hover:text-[#E0E0E0] transition-all duration-300 ease-in-out"
                          >
                            重設密碼
                          </Button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>
                <div className="flex justify-center mt-6">
                  <Button 
                    onClick={handleSave}
                    className="save-btn w-full md:w-auto bg-[#A67B5B] hover:bg-[#B68C6C] text-white dark:bg-white dark:text-[#2a2a2a] dark:hover:bg-gray-100 transition-colors duration-200"
                  >
                    儲存變更
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Reset Password Dialog */}
          <Dialog open={isResetPasswordOpen} onOpenChange={setIsResetPasswordOpen}>
            <DialogContent className="sm:max-w-[425px] bg-white dark:bg-gray-800">
              <DialogHeader>
                <DialogTitle className="text-center text-2xl font-bold text-[#5D4037] dark:text-gray-100">
                  重設密碼
                </DialogTitle>
              </DialogHeader>
              <div className="py-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password" className="text-gray-700 dark:text-gray-300">
                    當前密碼
                  </Label>
                  <div className="relative">
                    <Input 
                      id="current-password" 
                      type={showCurrentPassword ? "text" : "password"}
                      className="w-full pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password" className="text-gray-700 dark:text-gray-300">
                    新密碼
                  </Label>
                  <div className="relative">
                    <Input 
                      id="new-password" 
                      type={showNewPassword ? "text" : "password"}
                      className="w-full pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-gray-700 dark:text-gray-300">
                    確認新密碼
                  </Label>
                  <div className="relative">
                    <Input 
                      id="confirm-password" 
                      type={showConfirmPassword ? "text" : "password"}
                      className="w-full pr-10" 
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleChangePassword}
                  className="w-full bg-[#A67B5B] hover:bg-[#8B6E5B] text-white dark:bg-gray-700 dark:hover:bg-gray-600"
                >
                  更改密碼
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <style jsx global>{`
            .avatar-change-btn:hover,
            .reset-password-btn:hover {
              background-color: #F7F1E9 !important;
              color: #A67B5B !important;
            }
            .dark .avatar-change-btn:hover,
            .dark .reset-password-btn:hover {
              background-color: #3D3D3D !important;
              color: #E0E0E0 !important;
            }
            .save-btn:hover {
              background-color: #B68C6C !important;
            }
            .dark .save-btn:hover {
              background-color: #f5f5f5 !important;
            }
          `}</style>
          <Toaster />
        </PageLayout>
      </div>
    </div>
  )
}
