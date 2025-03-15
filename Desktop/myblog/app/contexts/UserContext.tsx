'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { useSession, signOut, signIn } from 'next-auth/react'

type User = {
  id: number
  name: string
  email: string
  avatar?: string
  image?: string
  isAdmin: boolean
}

interface UserContextType {
  user: User | null
  logout: () => Promise<void>
  login: (user: User) => void
  googleLogin: () => Promise<void>
  updateUser: (user: User) => void
  setUser: (user: User | null) => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session, status } = useSession()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  // 監控 session 變化
  React.useEffect(() => {
    console.log('Session 狀態變更:', {
      status,
      sessionExists: !!session,
      userData: session?.user
    })

    if (session?.user) {
      console.log('更新當前用戶資料:', session.user)
      setCurrentUser({
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.image || '',
        image: session.user.image || '',
        isAdmin: session.user.isAdmin || false
      })
    } else {
      console.log('清除當前用戶資料')
      setCurrentUser(null)
    }
  }, [session])

  const login = (newUser: User) => {
    setCurrentUser(newUser)
  }

  const googleLogin = async () => {
    await signIn('google')
  }

  const logout = async () => {
    console.log('開始登出流程')
    try {
      console.log('正在呼叫 signOut')
      const result = await signOut({
        redirect: false,
        callbackUrl: '/'
      })
      
      console.log('登出結果:', result)
      
      localStorage.removeItem('token')
      setCurrentUser(null)
      console.log('用戶狀態已清除')
      
    } catch (error) {
      console.error('登出過程發生錯誤:', error)
    }
  }

  const updateUser = useCallback((newUser: User) => {
    console.log('更新用戶:', newUser)
    setCurrentUser(prevUser => ({
      ...prevUser,
      ...newUser
    }))
  }, [])

  const setUser = (newUser: User | null) => {
    setCurrentUser(newUser)
  }

  return (
    <UserContext.Provider value={{ 
      user: currentUser, 
      logout, 
      login, 
      googleLogin, 
      updateUser, 
      setUser 
    }}>
      {children}
    </UserContext.Provider>
  )
}

export const useUser = () => {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

