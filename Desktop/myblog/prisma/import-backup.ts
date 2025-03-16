import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('開始導入數據庫備份...')
  
  try {
    // 讀取 SQL 文件
    const sqlFilePath = path.join(__dirname, 'backup.sql')
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8')
    
    // 分割 SQL 語句
    const statements = sqlContent
      .split(';')
      .filter(stmt => stmt.trim() !== '')
      .map(stmt => stmt.trim() + ';')
    
    console.log(`找到 ${statements.length} 條 SQL 語句`)
    
    // 執行每條 SQL 語句
    for (let i = 0; i < statements.length; i++) {
      try {
        await prisma.$executeRawUnsafe(statements[i])
        if (i % 10 === 0 || i === statements.length - 1) {
          console.log(`已執行 ${i + 1}/${statements.length} 條語句`)
        }
      } catch (error) {
        console.error(`執行第 ${i + 1} 條語句時出錯:`, error)
        console.error(`問題語句: ${statements[i].substring(0, 150)}...`)
        // 繼續執行其他語句
      }
    }
    
    console.log('數據庫備份導入完成')
  } catch (error) {
    console.error('導入過程中發生錯誤:', error)
    throw error
  }
}

main()
  .catch(e => {
    console.error('導入失敗:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 