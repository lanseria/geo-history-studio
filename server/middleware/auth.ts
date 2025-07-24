// server/middleware/auth.ts
import type { UserPayload } from '~~/server/utils/auth'
import { eq } from 'drizzle-orm'
import { decrypt } from 'paseto-ts/v4'
import { users } from '~~/server/database/schemas'

const PUBLIC_API_ROUTES = [
  '/api/auth/login',
  '/api/auth/refresh',
  '/api/auth/logout',
  '/api/dev',
]

export default defineEventHandler(async (event) => {
  const path = event.path

  // 如果不是 API 路由或属于公开路由，则跳过
  if (!path.startsWith('/api/') || PUBLIC_API_ROUTES.some(route => path.startsWith(route)))
    return

  // 直接从 cookie 中获取 token
  const token = getCookie(event, 'auth-token')

  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Authorization token is missing from cookies',
    })
  }

  try {
    const localKey = await useStorage('redis').getItem<string>('localKey')
    if (!localKey)
      throw new Error('Server not initialized: localKey is missing.')

    // 1. 解密 Token 获取 Payload
    const { payload } = await decrypt<UserPayload>(localKey, token)

    // 2. 从数据库查询用户的实时状态
    const db = useDb()
    const currentUserState = await db.query.users.findFirst({
      where: eq(users.id, payload.id),
    })

    // 3. 验证用户是否存在且未被锁定
    if (!currentUserState)
      throw new Error('User not found in database.')

    if (currentUserState.isLocked)
      throw new Error('User account is locked.')

    // 4. 将从数据库获取的最新用户信息附加到事件上下文中
    // 这确保了后续操作使用的是最新数据，而不是 Token 中的旧快照
    event.context.user = {
      id: currentUserState.id,
      username: currentUserState.username,
      role: currentUserState.role,
      avatar: currentUserState.avatar,
    }
  }
  catch (error: any) {
    // 捕获所有错误（Token无效、用户不存在、用户被锁定等）
    console.error(`Authentication check failed for path ${path}:`, error.message)

    // 为了安全，统一返回 401 错误，不向客户端暴露具体原因
    // 前端会捕获 401 并触发登出逻辑
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid or expired token',
    })
  }
})
