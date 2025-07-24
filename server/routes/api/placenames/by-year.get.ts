// server/routes/api/placenames/by-year.get.ts
import { sql } from 'drizzle-orm'
import { z } from 'zod'
import { placenames } from '~~/server/database/schemas'

// 定义查询参数的 schema，确保年份是整数
const querySchema = z.object({
  year: z.coerce.number().int(),
})

export default defineEventHandler(async (event) => {
  // 验证查询参数
  const { year } = await getValidatedQuery(event, query => querySchema.parse(query))

  const db = useDb()

  // Drizzle ORM 目前不直接支持在 `where` 子句中对数组元素进行比较。
  // 我们使用 `sql` 模板字符串来编写这部分原生 SQL 条件，以实现高效查询。
  // PostgreSQL 的数组索引从 1 开始。
  // 查询逻辑: 给定年份(year)必须大于等于地名的开始年份(yearRange[0])
  // 并且小于等于地名的结束年份(yearRange[1])
  const results = await db.select()
    .from(placenames)
    .where(sql`${placenames.yearRange}[1] <= ${year} and ${placenames.yearRange}[2] >= ${year}`)
    .orderBy(placenames.name)

  return results
})
