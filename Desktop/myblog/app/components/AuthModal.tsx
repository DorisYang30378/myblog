"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import ForgotPasswordModal from "./ForgotPasswordModal"
import { signIn, useSession } from "next-auth/react"
import { useUser } from "@/app/contexts/UserContext"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState("login")
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false)
  const router = useRouter()
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")
  const [registerName, setRegisterName] = useState("")
  const [registerError, setRegisterError] = useState("")
  const [isReady, setIsReady] = useState(false)
  const { data: session, status } = useSession()
  const { setUser } = useUser()
  
  // 保存之前的登入狀態以檢測變化
  const [prevStatus, setPrevStatus] = useState(status)
  
  useEffect(() => {
    setIsReady(true)
  }, [])
  
  // 檢測登入狀態變化
  useEffect(() => {
    // 如果之前不是已認證，現在是已認證，說明剛剛成功登入
    if (prevStatus !== 'authenticated' && status === 'authenticated') {
      // 登入成功，發出自定義事件通知其他組件重新載入數據
      const loginEvent = new CustomEvent('user-login-success', {
        detail: { user: session?.user }
      })
      window.dispatchEvent(loginEvent)
      
      // 關閉模態框
      onClose()
    }
    
    // 更新之前的狀態
    setPrevStatus(status)
  }, [status, session, onClose, prevStatus])

  if (!isReady) return null

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    
    try {
      const result = await signIn('credentials', {
        email: loginEmail,
        password: loginPassword,
        redirect: false,
        callbackUrl: '/'
      })
      
      if (result?.error) {
        throw new Error(result.error)
      }
      
      onClose()
    } catch (error: any) {
      setLoginError(error.message || '登入失敗')
    }
  }

  const handleForgotPasswordClick = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsForgotPasswordOpen(true)
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegisterError("")

    if (registerPassword !== confirmPassword) {
      setRegisterError("密碼不一致")
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: registerEmail,
          password: registerPassword,
          name: registerName
        })
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || '註冊失敗')
      }

      // 註冊成功後直接登入
      const result = await signIn('credentials', {
        email: registerEmail,
        password: registerPassword,
        redirect: false
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      onClose()
      router.refresh()

    } catch (error: any) {
      setRegisterError(error.message || '註冊失敗')
    }
  }

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", { 
        callbackUrl: window.location.origin,
        redirect: true
      })
      onClose()
    } catch (error) {
      console.error("Google 登入失敗:", error)
    }
  }

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent
          className="sm:max-w-[425px] bg-[#FFF8ED] dark:bg-gray-900 border-[#A67B5B] dark:border-gray-700"
          aria-describedby="auth-dialog-description"
        >
          <div id="auth-dialog-description" className="sr-only">
            登入或註冊對話框
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-2xl font-bold text-[#5D4037] dark:text-gray-100">
              {activeTab === "login" ? "歡迎回來" : "加入我們"}
            </DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#F5E6D3] dark:bg-gray-800">
              <TabsTrigger
                value="login"
                className="data-[state=active]:bg-[#A67B5B] data-[state=active]:text-[#F5E6D3] dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-gray-100 text-[#5D4037] dark:text-gray-300"
              >
                登入
              </TabsTrigger>
              <TabsTrigger
                value="register"
                className="data-[state=active]:bg-[#A67B5B] data-[state=active]:text-[#F5E6D3] dark:data-[state=active]:bg-gray-600 dark:data-[state=active]:text-gray-100 text-[#5D4037] dark:text-gray-300"
              >
                註冊
              </TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-4">
              <form className="space-y-4 mb-2" onSubmit={handleLogin}>
                {loginError && (
                  <div className="text-red-500 text-sm">{loginError}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-[#5D4037] dark:text-gray-300">
                    電子郵件
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-white dark:bg-gray-800 border-[#A67B5B] dark:border-gray-600 text-[#5D4037] dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#5D4037] dark:text-gray-300">
                    密碼
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    className="bg-white dark:bg-gray-800 border-[#A67B5B] dark:border-gray-600 text-[#5D4037] dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#A67B5B] hover:bg-[#8B6E5B] dark:bg-gray-700 dark:hover:bg-gray-600 text-[#F5E6D3] dark:text-gray-100"
                >
                  登入
                </Button>
              </form>
              <div className="mt-1 mb-2 text-center">
                <button
                  onClick={handleForgotPasswordClick}
                  className="text-sm text-[#5D4037] hover:text-[#8B7355] dark:text-gray-400 dark:hover:text-gray-300"
                >
                  忘記密碼？
                </button>
              </div>
              <div className="mt-2">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-[#A67B5B] dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-[#FFF8ED] text-[#5D4037] dark:bg-gray-900 dark:text-gray-400">
                      或使用以下方式
                    </span>
                  </div>
                </div>
                <div className="mt-4 flex flex-col space-y-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleLogin}
                    className="w-full justify-center bg-white hover:bg-[#E6D7C3] dark:bg-gray-800 dark:hover:bg-gray-700 text-[#5D4037] dark:text-gray-100 border-[#A67B5B] dark:border-gray-600"
                  >
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google 登入
                  </Button>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="register" className="mt-4">
              <form className="space-y-4">
                {registerError && (
                  <div className="text-red-500 text-sm">{registerError}</div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="register-name" className="text-[#5D4037] dark:text-gray-300">
                    名稱
                  </Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="請輸入您想要的名稱"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                    className="bg-white dark:bg-gray-800 border-[#A67B5B] dark:border-gray-600 text-[#5D4037] dark:text-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-[#5D4037] dark:text-gray-300">
                    電子郵件
                  </Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your@email.com"
                    className="bg-white dark:bg-gray-800 border-[#A67B5B] dark:border-gray-600 text-[#5D4037] dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-[#5D4037] dark:text-gray-300">
                    密碼
                  </Label>
                  <Input
                    id="register-password"
                    type="password"
                    className="bg-white dark:bg-gray-800 border-[#A67B5B] dark:border-gray-600 text-[#5D4037] dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password" className="text-[#5D4037] dark:text-gray-300">
                    確認密碼
                  </Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    className="bg-white dark:bg-gray-800 border-[#A67B5B] dark:border-gray-600 text-[#5D4037] dark:text-gray-100 placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:ring-0 focus-visible:ring-0 focus:ring-offset-0 focus-visible:ring-offset-0 focus-visible:outline-none"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-[#A67B5B] hover:bg-[#8B6E5B] dark:bg-gray-700 dark:hover:bg-gray-600 text-[#F5E6D3] dark:text-gray-100"
                  onClick={handleRegister}
                >
                  註冊
                </Button>
                <div className="mt-2">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-[#A67B5B] dark:border-gray-600" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[#FFF8ED] text-[#5D4037] dark:bg-gray-900 dark:text-gray-400">
                        或使用以下方式
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-col space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleGoogleLogin}
                      className="w-full justify-center bg-white hover:bg-[#E6D7C3] dark:bg-gray-800 dark:hover:bg-gray-700 text-[#5D4037] dark:text-gray-100 border-[#A67B5B] dark:border-gray-600"
                    >
                      <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                          fill="#4285F4"
                        />
                        <path
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                          fill="#34A853"
                        />
                        <path
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                          fill="#FBBC05"
                        />
                        <path
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                          fill="#EA4335"
                        />
                      </svg>
                      Google 登入
                    </Button>
                  </div>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
      <ForgotPasswordModal isOpen={isForgotPasswordOpen} onClose={() => setIsForgotPasswordOpen(false)} />
    </>
  )
}

