/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'curioushammy.com',
      },
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
  // 修改緩存策略，為圖片添加緩存，減少重複請求
  headers: async () => {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'  // 圖片緩存一天
          }
        ]
      },
      {
        source: '/_next/image/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400'  // Next.js 圖片緩存一天
          }
        ]
      },
      {
        source: '/((?!uploads|_next/image).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0, must-revalidate'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig 