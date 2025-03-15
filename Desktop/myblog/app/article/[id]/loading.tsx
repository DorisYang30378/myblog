import React from 'react'
import Header from '@/app/components/Header'

export default function Loading() {
  return (
    <div className="bg-[#FAF3E8] dark:bg-gray-900">
      <Header />
      <div className="min-h-screen">
        {/* Desktop Layout - Two columns */}
        <div className="hidden xl:block relative">
          {/* Left Sidebar */}
          <aside className="w-fit xl:w-[280px] fixed top-[80px] left-0 h-[calc(100vh-80px)] bg-[#FAF3E8] dark:bg-gray-900 overflow-y-auto">
            <div className="pt-0 px-4">
              <div className="p-4 bg-[#F8F5F0] dark:bg-gray-800 rounded-lg shadow-sm min-h-[250px]"></div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="ml-[280px] mr-[300px] min-h-[150vh] bg-[#F8F5F0] dark:bg-gray-800">
            <article className="p-0 max-w-3xl mx-auto">
            </article>
          </main>

          {/* Right Sidebar */}
          <aside className="w-[300px] fixed top-20 right-0 h-[calc(100vh-5rem)] bg-[#FAF3E8] dark:bg-gray-900 overflow-y-auto">
            <div className="p-6"></div>
          </aside>
        </div>

        {/* Mobile Layout */}
        <div className="xl:hidden">
          <main className="min-h-[150vh] bg-[#F8F5F0] dark:bg-gray-800">
          </main>
        </div>
      </div>
    </div>
  )
}