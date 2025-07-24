import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { placenames } from '~~/server/database/schemas'
import { getUserFromEvent } from '~~/server/utils/auth'

// 使用与创建时相同的 schema
const updatePlacenameSchema = z.object({
  name: z.string().min(1),
  traditionalName: z.string().optional().nullable(),
  englishName: z.string().optional().nullable(),
  coordinates: z.tuple([z.string(), z.string()]),
  yearRange: z.tuple([z.number(), z.number()]),
  type: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const admin = getUserFromEvent(event)
  if (admin.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const id = z.coerce.number().int().positive().parse(getRouterParam(event, 'id'))
  const body = await readBody(event)
  const data = await updatePlacenameSchema.parseAsync(body)

  const db = useDb()
  const updatedPlacename = await db.update(placenames)
    .set({ ...data, updatedAt: new Date() })
    .where(eq(placenames.id, id))
    .returning()

  if (updatedPlacename.length === 0)
    throw createError({ statusCode: 404, statusMessage: '地名不存在' })

  return updatedPlacename[0]
})
