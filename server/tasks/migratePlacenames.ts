/* eslint-disable no-console */
import { createReadStream } from 'node:fs'
import { resolve } from 'node:path'
import { cwd } from 'node:process'
import { parse } from 'csv-parse'
import { placenames } from '~~/server/database/schemas'
import { useDb } from '~~/server/utils/db'

// ... (接口定义保持不变)
interface OldPlacename {
  id: string
  name: string | null
  tName: string | null
  pName: string | null
  coord: string | null
  time: string | null
  type: string | null
}

interface NewPlacename {
  name: string
  traditionalName: string | null
  englishName: string | null
  coordinates: [string, string]
  yearRange: [number, number]
  type: string
}

// 分块函数
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size)
    chunks.push(array.slice(i, i + size))
  return chunks
}

export default defineTask({
  meta: {
    name: 'migrate:placenames',
    description: '从旧的 CSV 文件迁移历史地名数据到 PostgreSQL',
  },
  async run() {
    console.log('🚀 开始历史地名数据迁移...')
    const db = useDb()

    const existingData = await db.query.placenames.findFirst()
    if (existingData) {
      console.warn('⚠️ placenames 表中已存在数据，跳过迁移。如需重新迁移，请先清空该表。')
      return { result: 'Skipped: Data already exists.' }
    }

    const csvFilePath = resolve(cwd(), 'migration/old_placenames.csv')
    const records: NewPlacename[] = []
    const parser = createReadStream(csvFilePath).pipe(parse({
      columns: true,
      skip_empty_lines: true,
    }))

    console.log(`📄 正在读取和解析 CSV 文件: ${csvFilePath}`)

    for await (const row of parser) {
      const oldData = row as OldPlacename

      // [修正一] 跳过列标题行
      if (oldData.id === 'id')
        continue

      try {
        // ... (数据清洗与转换逻辑保持不变)
        if (!oldData.name || !oldData.coord || !oldData.time || !oldData.type) {
          console.warn(`⏭️ 跳过无效行 (缺少核心数据): id=${oldData.id}`)
          continue
        }

        const coords = JSON.parse(oldData.coord)
        if (!Array.isArray(coords) || coords.length !== 2)
          throw new Error('无效的坐标格式')

        const times = JSON.parse(oldData.time)
        if (!Array.isArray(times) || times.length !== 2)
          throw new Error('无效的时间格式')

        const yearRange: [number, number] = [Number.parseInt(times[0]), Number.parseInt(times[1])]
        if (Number.isNaN(yearRange[0]) || Number.isNaN(yearRange[1]))
          throw new Error('年份不是有效的数字')

        const newPlacename: NewPlacename = {
          name: oldData.name,
          traditionalName: oldData.tName || null,
          englishName: oldData.pName || null,
          coordinates: [coords[0].toString(), coords[1].toString()],
          yearRange,
          type: oldData.type,
        }
        records.push(newPlacename)
      }
      catch (error: any) {
        console.error(`❌ 处理行 id=${oldData.id} 时出错: ${error.message}. 跳过该行。`)
      }
    }

    console.log(`📊 解析完成，共获得 ${records.length} 条有效记录。`)

    if (records.length > 0) {
      // [修正二] 将数据分块后批量插入
      const CHUNK_SIZE = 1000 // 每次插入1000条
      const recordChunks = chunkArray(records, CHUNK_SIZE)
      console.log(`⏳ 准备将数据分 ${recordChunks.length} 批插入到数据库...`)

      for (let i = 0; i < recordChunks.length; i++) {
        const chunk = recordChunks[i]
        console.log(`  -> 正在插入第 ${i + 1} / ${recordChunks.length} 批 (${chunk!.length} 条记录)...`)
        try {
          await db.insert(placenames).values(chunk!)
        }
        catch (dbError) {
          console.error(`❌ 第 ${i + 1} 批数据插入失败:`, dbError)
          console.error('  -> 可能是该批次中存在格式错误的数据，请检查。')
          // 你可以选择在这里停止，或者继续尝试下一批
          // return { result: 'Failed during DB insertion.' };
        }
      }

      console.log('✅ 数据迁移成功！')
    }
    else {
      console.log('ℹ️ 没有需要插入的数据。')
    }

    return { result: `Success: Migrated ${records.length} records.` }
  },
})
