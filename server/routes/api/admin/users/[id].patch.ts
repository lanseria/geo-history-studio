// server/routes/api/admin/users/[id].patch.ts
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { users } from '~~/server/database/schemas'
import { getUserFromEvent } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const admin = getUserFromEvent(event)
  if (admin.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const userId = z.coerce.number().int().positive().parse(getRouterParam(event, 'id'))

  // 安全检查：管理员不能锁定自己
  if (admin.id === userId)
    throw createError({ statusCode: 400, statusMessage: '不能锁定自己的账户' })

  const db = useDb()
  const userToUpdate = await db.query.users.findFirst({ where: eq(users.id, userId) })

  if (!userToUpdate)
    throw createError({ statusCode: 404, statusMessage: '用户不存在' })

  const updatedUser = await db.update(users)
    .set({ isLocked: !userToUpdate.isLocked })
    .where(eq(users.id, userId))
    .returning({ id: users.id, isLocked: users.isLocked })

  return { message: `用户状态已更新`, user: updatedUser[0] }
})
