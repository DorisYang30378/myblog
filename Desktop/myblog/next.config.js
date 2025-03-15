/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.zeabur.app',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'hebbkx1anhila5yf.public.blob.vercel-storage.com',
        pathname: '/**',
      }
    ],
    domains: ['lh3.googleusercontent.com', 'localhost', 'curioushammy.com'],
  },
  compress: true,
  poweredByHeader: false,
  
  // 修改重寫規則
  async rewrites() {
    return [
      {
        source: '/uploads/:path*',
        destination: '/api/images/:path*',
      },
    ]
  },
  // 添加以下配置來禁用頁面快取
  headers: async () => {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate'
          },
          {
            key: 'Pragma',
            value: 'no-cache'
          },
          {
            key: 'Expires',
            value: '0'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 