"use client"

import PageLayout from "../components/PageLayout"
import Image from "next/image"
import { BookOpen } from "lucide-react"

export default function AboutPage() {
  const breadcrumbs = [
    { name: '首頁', href: '/' },
    { name: '關於我', href: '/about' }
  ]

  return (
    <PageLayout 
      title=""
      className="bg-white md:bg-[#FAF3E8] dark:bg-gray-900"
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 md:dark:bg-gray-800 md:rounded-2xl md:shadow-[0_4px_24px_rgba(0,0,0,0.04)] dark:shadow-none p-4 sm:p-6 md:p-12 relative overflow-hidden">
        {/* Decorative background pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNjB2NjBIMHoiLz48cGF0aCBkPSJNMzYgMzRjMC0xLjEuOS0yIDItMiAxLjEgMCAyIC45IDIgMiAwIDEuMS0uOSAyLTIgMi0xLjEgMC0yLS45LTItMnoiIGZpbGw9InJnYmEoMTY2LCAxMjMsIDkxLCAwLjA1KSIvPjwvZz48L3N2Zz4=')] opacity-50 dark:opacity-10" />

        {/* Mobile Layout */}
        <div className="md:hidden space-y-8">
          {/* Header Section */}
          <div className="text-left space-y-6 -mt-4">
            <div className="flex items-center gap-3">
              <BookOpen className="w-7 h-7 text-[#A67B5B] dark:text-white" />
              <h1 className="text-3xl font-semibold text-[#8B7355] dark:text-white font-serif">
                關於我
              </h1>
            </div>

            {/* Avatar Image */}
            <div className="flex justify-center">
              <div className="relative w-[70vw] max-w-[280px] aspect-square">
                <div className="absolute inset-0 bg-[#A67B5B]/20 dark:bg-white/10 rounded-full blur-xl transform transition-transform duration-300 group-hover:scale-110" />
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%9C%80%E7%B5%82%E7%89%88%E9%A0%AD%E5%83%8F-12nsvFkjeFJd0LUPkPatzXzmPBX41M.png"
                    alt="小倉鼠頭像"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="px-2">
              <div className="text-left bg-[#FDF6EC] dark:bg-gray-700/30 p-5 rounded-xl border border-[#A67B5B]/10 dark:border-white/5">
                <p className="text-[#8B7355] dark:text-white text-lg leading-[1.7]">
                  在這裡，我希望將繁雜的知識變得簡單易懂。不是老師，只是個愛學習、樂意分享的同路人。
                </p>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="space-y-6 text-dark-brown/90 dark:text-gray-300 text-lg leading-[1.7] px-2">
            <p>你好，我是小倉鼠，一個喜歡思考的學習者。</p>

            <p>
              喜歡閱讀各種領域的書籍和文章，常常一頭栽進某個主題裡研究好一陣子。雖然不是什麼專家，但很享受學習新知識的過程。常常會花時間琢磨一個概念，試著找到最簡單的方式來理解它。
            </p>

            <p>
              建立這個網站的原因很簡單：想把我學到的東西，用最好理解的方式分享出來。盡量使用簡單的文字，配上淺顯易懂的圖示，希望能讓每個來到這裡的人都能輕鬆吸收新知識。
            </p>

            <p>作為一個學習者，我相信知識不應該是艱澀難懂的。如果你也喜歡學習新事物，歡迎一起在這裡探索和成長。</p>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:grid grid-cols-8 gap-8 md:gap-12 items-start">
          {/* Left Content - 5 columns */}
          <div className="col-span-5 space-y-8 animate-fade-in">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-[#A67B5B] dark:text-white" />
              <h1 className="text-4xl font-semibold text-[#8B7355] dark:text-white font-serif">
                關於我
              </h1>
            </div>

            <div className="space-y-6 text-dark-brown/90 dark:text-gray-300 text-lg leading-[1.7]">
              <p>你好，我是小倉鼠，一個喜歡思考的學習者。</p>

              <p>
                喜歡閱讀各種領域的書籍和文章，常常一頭栽進某個主題裡研究好一陣子。雖然不是什麼專家，但很享受學習新知識的過程。常常會花時間琢磨一個概念，試著找到最簡單的方式來理解它。
              </p>

              <p>
                建立這個網站的原因很簡單：想把我學到的東西，用最好理解的方式分享出來。盡量使用簡單的文字，配上淺顯易懂的圖示，希望能讓每個來到這裡的人都能輕鬆吸收新知識。
              </p>

              <p>作為一個學習者，我相信知識不應該是艱澀難懂的。如果你也喜歡學習新事物，歡迎一起在這裡探索和成長。</p>
            </div>
          </div>

          {/* Right Content - 3 columns */}
          <div className="col-span-3 space-y-8 flex flex-col items-center">
            {/* Image */}
            <div className="animate-fade-in animation-delay-200 mt-0">
              <div className="relative group">
                <div className="absolute inset-0 bg-[#A67B5B]/20 dark:bg-white/10 rounded-full blur-xl transform transition-transform duration-300 group-hover:scale-110" />
                <div className="relative w-48 h-48 sm:w-56 sm:h-56 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white dark:border-gray-700 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition-all duration-300 ease-out hover:scale-102 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
                  <Image
                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/%E6%9C%80%E7%B5%82%E7%89%88%E9%A0%AD%E5%83%8F-12nsvFkjeFJd0LUPkPatzXzmPBX41M.png"
                    alt="小倉鼠頭像"
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              </div>
            </div>

            {/* Quote */}
            <div className="animate-fade-in animation-delay-600 w-full">
              <div className="text-left bg-[#FDF6EC] dark:bg-gray-700/30 p-6 rounded-xl border border-[#A67B5B]/10 dark:border-white/5">
                <p className="text-[#8B7355] dark:text-white text-lg leading-[1.7]">
                  在這裡，我希望將繁雜的知識變得簡單易懂。不是老師，只是個愛學習、樂意分享的同路人。
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}

