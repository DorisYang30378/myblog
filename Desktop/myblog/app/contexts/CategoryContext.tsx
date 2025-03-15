"use client"

import { createContext, useContext, ReactNode } from 'react'

interface Category {
  id: number
  name: string
  slug: string
}

interface CategoryContextType {
  category: Category | null
}

const CategoryContext = createContext<CategoryContextType>({ category: null })

export function CategoryProvider({ 
  children,
  category 
}: { 
  children: ReactNode
  category: Category
}) {
  console.log('CategoryProvider received category:', category)

  return (
    <CategoryContext.Provider value={{ category }}>
      {children}
    </CategoryContext.Provider>
  )
}

export function useCategory() {
  const context = useContext(CategoryContext)
  console.log('useCategory hook called, context:', context)
  if (!context) {
    throw new Error('useCategory must be used within a CategoryProvider')
  }
  return context
} 