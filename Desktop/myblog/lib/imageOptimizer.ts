import sharp from 'sharp'

export async function optimizeImage(buffer: Buffer) {
  try {
    const optimized = await sharp(buffer)
      .webp({ quality: 70 })  // 降低品質
      .resize(600, null, {    // 最大寬度減小
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