// server/routes/api/admin/users/[id].delete.ts
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '~~/server/database/schemas'
import { getUserFromEvent } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const admin = getUserFromEvent(event)
  if (admin.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const userId = z.coerce.number().int().positive().parse(getRouterParam(event, 'id'))

  // 安全检查：管理员不能删除自己
  if (admin.id === userId)
    throw createError({ statusCode: 400, statusMessage: '不能删除自己的账户' })

  const db = useDb()
  const deletedUser = await db.delete(users)
    .where(eq(users.id, userId))
    .returning({ id: users.id })

  if (deletedUser.length === 0)
    throw createError({ statusCode: 404, statusMessage: '用户不存在' })

  setResponseStatus(event, 204) // No Content
  return {}
})
