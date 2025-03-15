import sharp from 'sharp'

export async function optimizeImage(buffer: Buffer) {
  try {
    const optimized = await sharp(buffer)
      .webp({ quality: 80 })  // 轉換為 WebP 格式
      .resize(800, null, {    // 最大寬度 800px，高度自適應
        withoutEnlargement: true,
        fit: 'inside'
      })
      .toBuffer()

    return optimized
  } catch (error) {
    console.error('Image optimization failed:', error)
    return buffer  // 如果優化失敗，返回原始圖片
  }
} 