'use client'

import { useState, useEffect } from "react"
import Header from "./components/Header"
import { ThemeProvider } from "./components/theme-provider"
import { UserProvider } from "./contexts/UserContext"

interface LayoutClientProps {
  children: React.ReactNode
}

export function LayoutClient({ children }: LayoutClientProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <UserProvider>
        <div suppressHydrationWarning>
          {!mounted ? null : (
            <>
              <Header />
              <main className="pt-16">{children}</main>
            </>
          )}
        </div>
      </UserProvider>
    </ThemeProvider>
  )
}
