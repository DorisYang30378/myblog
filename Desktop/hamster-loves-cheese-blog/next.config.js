/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com']
  },
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig 