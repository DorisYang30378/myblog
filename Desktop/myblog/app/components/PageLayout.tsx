"use client"

interface BreadcrumbItem {
  name: string
  href: string
}

interface PageLayoutProps {
  title: React.ReactNode
  className?: string
  breadcrumbs?: BreadcrumbItem[]
  children: React.ReactNode
}

import Breadcrumb from "./Breadcrumb"
import Footer from "./Footer"

export default function PageLayout({ title, className, breadcrumbs, children }: PageLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className || "bg-[#F5E6D3]"} dark:bg-gray-900`}>
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 flex-grow">
        {breadcrumbs && (
          <nav className="mb-6">
            <ol className="flex items-center space-x-2 text-sm text-[#333333] dark:text-gray-400">
              {breadcrumbs.map((item, index) => (
                <li key={item.href} className="flex items-center">
                  {index > 0 && <span className="mx-2">/</span>}
                  <a
                    href={item.href}
                    className="hover:text-[#5C4033] dark:hover:text-white transition-colors"
                  >
                    {item.name}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}
        {title && <h1 className="text-3xl font-bold text-primary dark:text-white mb-8 text-center">{title}</h1>}
        {children}
      </div>
      <Footer />
    </div>
  )
}

