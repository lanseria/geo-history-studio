import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { placenames } from '~~/server/database/schemas'
import { getUserFromEvent } from '~~/server/utils/auth'

export default defineEventHandler(async (event) => {
  const admin = getUserFromEvent(event)
  if (admin.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const id = z.coerce.number().int().positive().parse(getRouterParam(event, 'id'))

  const db = useDb()
  const deleted = await db.delete(placenames).where(eq(placenames.id, id)).returning({ id: placenames.id })

  if (deleted.length === 0)
    throw createError({ statusCode: 404, statusMessage: '地名不存在' })

  setResponseStatus(event, 204)
  return {}
})
