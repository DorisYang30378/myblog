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
  const { data: session } = useSession()
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  
  // 當 session 改變時更新用戶
  React.useEffect(() => {
    if (session?.user) {
      setCurrentUser({
        id: session.user.id,
        name: session.user.name || '',
        email: session.user.email || '',
        avatar: session.user.image || '',
        image: session.user.image || '',
        isAdmin: session.user.isAdmin || false
      })
    }
  }, [session])

  const login = (newUser: User) => {
    setCurrentUser(newUser)
  }

  const googleLogin = async () => {
    await signIn('google')
  }

  const logout = async () => {
    await signOut()
    localStorage.removeItem('token')
    setCurrentUser(null)
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

