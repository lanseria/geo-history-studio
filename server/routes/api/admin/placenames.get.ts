import { count, desc } from 'drizzle-orm'
import { z } from 'zod'
import { placenames } from '~~/server/database/schemas'
import { getUserFromEvent } from '~~/server/utils/auth'

const querySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
})

export default defineEventHandler(async (event) => {
  const admin = getUserFromEvent(event)
  if (admin.role !== 'admin')
    throw createError({ statusCode: 403, statusMessage: 'Forbidden' })

  const { page, limit } = await getValidatedQuery(event, query => querySchema.parse(query))
  const offset = (page - 1) * limit

  const db = useDb()

  const [data, totalResult] = await Promise.all([
    db.query.placenames.findMany({
      offset,
      limit,
      orderBy: [desc(placenames.createdAt)],
    }),
    db.select({ value: count() }).from(placenames),
  ])

  const total = totalResult[0]?.value ?? 0

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  }
})
