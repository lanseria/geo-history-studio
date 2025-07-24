import { z } from 'zod'
import { placenames } from '~~/server/database/schemas'
import { getUserFromEvent } from '~~/server/utils/auth'

const createPlacenameSchema = z.object({
  name: z.string().min(1),
  traditionalName: z.string().optional().nullable(),
  englishName: z.string().optional().nullable(),
  coordinates: z.tuple([z.string(), z.string()]), // 字符串元组
  yearRange: z.tuple([z.number(), z.number()]), // 数字元组
  type: z.string().min(1),
})

export default defineEventHandler(async (event) => {
  const admin = getUserFromEvent(event)
  if (admin.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const body = await readBody(event)
  const data = await createPlacenameSchema.parseAsync(body)

  const db = useDb()
  const newPlacename = await db.insert(placenames).values(data).returning()

  setResponseStatus(event, 201)
  return newPlacename[0]
})
