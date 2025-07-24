import { count } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '~~/server/database/schemas'
import { getUserFromEvent } from '~~/server/utils/auth'

// 定义查询参数的 schema
const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export default defineEventHandler(async (event) => {
  const admin = getUserFromEvent(event)
  if (admin.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Forbidden: Admins only' })

  // [修正] 使用 .parse() 代替 .safeParse()
  // .parse() 会在验证失败时自动抛出错误，getValidatedQuery 会捕获并返回 400 响应
  // 成功时，validatedQuery 就是包含 page 和 limit 的对象
  const validatedQuery = await getValidatedQuery(event, query => querySchema.parse(query))

  // [修正] 直接从 validatedQuery 中获取 page 和 limit
  const { page, limit } = validatedQuery
  const offset = (page - 1) * limit

  const db = useDb()

  const [data, totalResult] = await Promise.all([
    // 查询分页数据
    db.query.users.findMany({
      columns: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        avatar: true,
        isLocked: true, // [新增] 返回锁定状态
      },
      offset,
      limit,
      orderBy: (users, { desc }) => [desc(users.createdAt)],
    }),
    // 查询总数
    db.select({ value: count() }).from(users),
  ])

  const total = totalResult[0]?.value ?? 0

  return {
    data,
    meta: {
      total,
      // [修正] 直接使用 page 和 limit 变量
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
})
