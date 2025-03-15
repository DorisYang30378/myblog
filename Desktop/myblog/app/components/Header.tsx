"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import {
  Search,
  Moon,
  Sun,
  ChevronDown,
  X,
  Home,
  FolderOpen,
  Pencil,
  User,
  Menu,
  LogOut,
  Bookmark,
  FileText,
  BookOpen,
} from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import AuthModal from "./AuthModal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import SearchOverlay from "./SearchOverlay"
import { useSession, signOut } from "next-auth/react"

interface Category {
  id: number
  name: string
  slug: string
}

const Header = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [isSearchOverlayOpen, setIsSearchOverlayOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { data: session } = useSession()
  const [categories, setCategories] = useState<Category[]>([])

  console.log('Session 狀態:', session ? 'Authenticated' : 'Not Authenticated')
  console.log('Session 資料:', session)

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setIsOpen(false)
      }
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    setIsDropdownOpen(false)
  }

  // 添加這個函數來清除 NextAuth 相關的 cookie
  function clearAuthCookies() {
    // 清除 NextAuth 相關的 cookie
    const cookiesToClear = [
      'next-auth.session-token',
      'next-auth.callback-url',
      'next-auth.csrf-token'
    ];
    
    cookiesToClear.forEach(cookieName => {
      document.cookie = `${cookieName}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
    });
  }

  // 修改登出函數
  const handleLogout = async () => {
    try {
      console.log('開始登出流程');
      
      // 先清除本地存儲
      localStorage.removeItem('token');
      
      // 清除 NextAuth cookie
      clearAuthCookies();
      
      // 調用 NextAuth 登出
      await signOut({ 
        redirect: false
      });
      
      console.log('登出完成，準備刷新頁面');
      
      // 強制刷新頁面以確保狀態完全重置
      window.location.href = '/';
    } catch (error) {
      console.error('登出錯誤:', error);
      // 強制刷新頁面
      window.location.href = '/';
    }
  }

  const handleNavigation = (path: string) => {
    router.push(path)
  }

  const handleSidebarClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  const handleSearchClick = () => {
    if (searchQuery.length >= 2) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`)
    }
  }

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (isOpen && !(event.target as Element).closest(".sidebar")) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleOutsideClick)

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick)
    }
  }, [isOpen])

  // 獲取分類列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (!response.ok) throw new Error('獲取分類失敗')
        const data = await response.json()
        setCategories(data)
      } catch (error) {
        console.error('獲取分類失敗:', error)
      }
    }

    fetchCategories()
  }, [])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#B68C6C] dark:bg-[#3D3D3D] shadow-md">
        <div className="max-w-7xl mx-auto px-4 xl:px-0">
          <div className="flex items-center justify-between h-14 md:h-16">
            <div className="flex items-center space-x-2 xl:-translate-x-8">
              <Link href="/" className="flex items-center">
                <div className="relative h-9 w-[135px] md:h-10 md:w-[150px]">
                  <Image
                    src={
                      theme === "dark"
                        ? "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logofordarkmode-IE4H7pyjp2CQFCDIBUdGa6JuOE4WYc.svg"
                        : "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/logo-pgynSUjuRg4QWZeznZ7RiMv2STi13J.svg"
                    }
                    alt="小倉鼠戀知識"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
              </Link>
              <nav className="hidden xl:flex space-x-6 text-xl">
                <Link href="/" className="text-[#5C4033] dark:text-gray-100 select-none">
                  首頁
                </Link>
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsDropdownOpen(!isDropdownOpen)
                    }}
                    className="text-[#5C4033] dark:text-gray-100 flex items-center select-none"
                  >
                    分類
                    <ChevronDown className="ml-1 h-4 w-4" />
                  </button>
                  {isDropdownOpen && (
                    <div className="absolute left-0 mt-2 w-32 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                      <div className="py-1 text-center">
                        {categories
                          .filter(category => category.name !== "閱讀心得")
                          .map((category) => (
                            <Link
                              key={category.id}
                              href={`/categories/${category.slug}`}
                              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-100 select-none"
                            >
                              {category.name}
                            </Link>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
                <Link href="/reading-reflections" className="text-[#5C4033] dark:text-gray-100 select-none">
                  閱讀心得
                </Link>
                <Link href="/about" className="text-[#5C4033] dark:text-gray-100 select-none">
                  關於
                </Link>
                {session?.user?.isAdmin && (
                  <Link href="/manage-articles" className="text-[#5C4033] dark:text-gray-100 select-none">
                    文章管理
                  </Link>
                )}
              </nav>
            </div>
            <div className="hidden xl:flex items-center space-x-4">
              <div className="relative w-64">
                <Input
                  type="search"
                  placeholder="搜尋..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyDown}
                  className="w-full pl-4 pr-10 py-2 bg-white dark:bg-gray-800 border-0 rounded-md"
                />
                <Search 
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6 cursor-pointer" 
                  onClick={handleSearchClick}
                />
              </div>
              <div className="flex items-center space-x-4">
                {session?.user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Avatar className="h-7 w-7 cursor-pointer">
                        <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                        <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                      </Avatar>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent 
                      className="w-32 bg-[#FFF8ED] dark:bg-gray-800" 
                      align="end"
                    >
                      {session?.user?.provider === 'credentials' && (
                        <DropdownMenuItem 
                          onClick={() => router.push("/profile")}
                          className="hover:bg-[#F5E6D3] dark:hover:bg-gray-700 cursor-pointer"
                        >
                          <User className="mr-2 h-4 w-4" />
                          <span>個人資料</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem 
                        onClick={() => router.push("/bookmarks")}
                        className="hover:bg-[#F5E6D3] dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <Bookmark className="mr-2 h-4 w-4" />
                        <span>我的收藏</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={handleLogout}
                        className="hover:bg-[#F5E6D3] dark:hover:bg-gray-700 cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>登出</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Button 
                    onClick={() => setIsAuthModalOpen(true)}
                    className="bg-[#F5E6D3] hover:bg-[#E6D7C3] dark:bg-gray-700 dark:hover:bg-gray-600"
                  >
                    登入 / 註冊
                  </Button>
                )}
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="text-[#5C4033] dark:text-gray-100"
                >
                  {theme === "dark" ? <Sun size={28} /> : <Moon size={28} />}
                </button>
              </div>
            </div>
            <div className="flex xl:hidden items-center space-x-3">
              <button
                onClick={() => setIsSearchOverlayOpen(true)}
                className="text-[#5C4033] dark:text-gray-300 w-10 h-10 flex items-center justify-center"
              >
                <Search className="w-7 h-7" />
              </button>
              {session?.user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Avatar className="w-10 h-10 cursor-pointer">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback>{session.user.name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-32 bg-[#FFF8ED] dark:bg-gray-800" align="end">
                    <DropdownMenuSeparator />
                    {session?.user?.provider === 'credentials' && (
                      <DropdownMenuItem onClick={() => router.push("/profile")}>
                        <User className="mr-2 h-4 w-4" />
                        <span>個人資料</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => router.push("/bookmarks")}>
                      <Bookmark className="mr-2 h-4 w-4" />
                      <span>我的收藏</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>登出</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Avatar
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-10 h-10 cursor-pointer text-[#5C4033] dark:text-gray-100 flex items-center justify-center bg-inherit"
                >
                  <User className="w-7 h-7" />
                </Avatar>
              )}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="text-[#5C4033] dark:text-gray-100"
              >
                {theme === "dark" ? <Sun size={28} /> : <Moon size={28} />}
              </button>
              <button onClick={toggleMenu} className="text-[#5C4033] dark:text-white p-2" aria-label="Toggle Menu">
                <Menu size={28} />
              </button>
            </div>
          </div>
        </div>

        <div
          className={`sidebar fixed inset-y-0 right-0 max-w-[180px] w-full bg-[#FFF8ED] dark:bg-gray-800 overflow-y-auto transition-transform transform ${
            isOpen ? "translate-x-0" : "translate-x-full"
          } z-50`}
          onClick={handleSidebarClick}
        >
          <div className="p-5">
            <button
              onClick={toggleMenu}
              className="absolute top-4 right-4 text-[#A67B5B] dark:text-gray-200"
              aria-label="Close Menu"
            >
              <X size={24} />
            </button>
            <nav className="mt-8 space-y-6">
              <button
                onClick={() => handleNavigation("/")}
                className="flex items-center space-x-2 text-lg text-[#A67B5B] dark:text-white w-full text-left select-none"
              >
                <Home size={24} />
                <span>首頁</span>
              </button>
              <div>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center justify-between w-full text-lg text-[#A67B5B] dark:text-white select-none"
                >
                  <div className="flex items-center space-x-2">
                    <FolderOpen size={24} />
                    <span>分類</span>
                  </div>
                  <ChevronDown className={`h-5 w-5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`} />
                </button>
                {isDropdownOpen && (
                  <div className="mt-4 ml-8 space-y-4">
                    {categories
                      .filter(category => category.name !== "閱讀心得")
                      .map((category) => (
                        <button
                          key={category.id}
                          onClick={() => handleNavigation(`/categories/${category.slug}`)}
                          className="block text-lg text-[#A67B5B] dark:text-white w-full text-left select-none"
                        >
                          {category.name}
                        </button>
                      ))}
                  </div>
                )}
              </div>
              <button
                onClick={() => handleNavigation("/reading-reflections")}
                className="flex items-center space-x-2 text-lg text-[#A67B5B] dark:text-white w-full text-left select-none"
              >
                <BookOpen size={24} />
                <span>閱讀心得</span>
              </button>
              <button
                onClick={() => handleNavigation("/about")}
                className="flex items-center space-x-2 text-lg text-[#A67B5B] dark:text-white w-full text-left select-none"
              >
                <Pencil size={24} />
                <span>關於</span>
              </button>
              {session?.user?.isAdmin && (
                <button
                  onClick={() => handleNavigation("/manage-articles")}
                  className="flex items-center space-x-2 text-lg text-[#A67B5B] dark:text-white w-full text-left select-none"
                >
                  <FileText size={24} />
                  <span>文章管理</span>
                </button>
              )}
            </nav>
          </div>
        </div>
      </header>
      <SearchOverlay
        isOpen={isSearchOverlayOpen}
        onClose={() => setIsSearchOverlayOpen(false)}
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onClear={() => setSearchQuery("")}
        className="top-14 md:top-16"
      />
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
    </>
  )
}

export default Header

