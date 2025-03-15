"use client"

interface FooterProps {
  className?: string
}

export default function Footer({ className }: FooterProps) {
  return (
    <footer
      className={`text-dark-brown dark:text-gray-300 py-1 w-full ${className} bg-transparent dark:bg-transparent`}
    >
      <div className="w-32 mx-auto border-t-2 border-[#A67B5B] dark:border-white mt-1 mb-1" />
      <p className="text-center">&copy; 小倉鼠戀知識. 版權所有.</p>
    </footer>
  )
}

