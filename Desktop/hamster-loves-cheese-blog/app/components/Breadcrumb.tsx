"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { useCategory } from "../contexts/CategoryContext"

interface BreadcrumbItem {
  label: string
  href: string
}

interface BreadcrumbProps {
  items?: BreadcrumbItem[]
  className?: string
  separatorClassName?: string
}

interface Article {
  title: string
  category: {
    name: string
    slug: string
  }
}

interface Category {
  name: string
  slug: string
}

const pathNameMap: { [key: string]: string } = {
  'article': '文章',
  'home': '首頁'
}

export default function Breadcrumb({ className = "", separatorClassName = "", items }: BreadcrumbProps) {
  const { category } = useCategory()
  const pathname = usePathname()
  
  console.log('Current pathname:', pathname)
  console.log('Category from context:', category)

  useEffect(() => {
    // 在首頁時記錄
    if (pathname === "/") {
      sessionStorage.setItem('fromHome', 'true')
    }
  }, [pathname])

  if (pathname === "/") return null

  if (items) {
    // 如果是從首頁來的，只顯示首頁和當前頁面
    if (sessionStorage.getItem('fromHome') === 'true') {
      items = [
        items[0],  // 首頁
        items[items.length - 1]  // 當前頁面
      ]
      // 清除標記
      sessionStorage.removeItem('fromHome')
    }

    return (
      <div className="text-sm">
        <nav aria-label="Breadcrumb">
          <ol className="list-none p-0 inline-flex items-center">
            {items.map((item, index) => (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2 text-gray-400">/</span>
                )}
                <Link href={item.href} className="breadcrumb-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </div>
    )
  }

  return (
    <div className="text-sm">
      <nav aria-label="Breadcrumb">
        <ol className="list-none p-0 inline-flex items-center">
          <li className="flex items-center">
            <Link href="/" className="breadcrumb-link">
              首頁
            </Link>
          </li>

          {category && (
            <li className="flex items-center">
              <span className="mx-2 text-gray-400">/</span>
              <span className="text-inherit">{category.name}</span>
            </li>
          )}
        </ol>
      </nav>
    </div>
  )
}

