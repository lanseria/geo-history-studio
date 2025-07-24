/* eslint-disable no-console */
import { env } from 'node:process'

export default defineEventHandler(async () => {
  if (env.NODE_ENV !== 'development') {
    throw createError({
      statusCode: 403,
      statusMessage: 'Forbidden: This endpoint is only available in development mode.',
    })
  }

  console.log('API trigger received for task: migrate:placenames')
  try {
    const taskResult = await runTask('migratePlacenames')
    return {
      message: 'Migration task finished.',
      ...taskResult,
    }
  }
  catch (error: any) {
    console.error('Error running migration task via API:', error)
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to run the migration task.',
      data: { error: error.message },
    })
  }
})
