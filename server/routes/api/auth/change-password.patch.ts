// server/routes/api/auth/change-password.patch.ts
import { eq } from 'drizzle-orm'
import { z } from 'zod'
import zxcvbn from 'zxcvbn'
import { users } from '~~/server/database/schemas'
import { getUserFromEvent, hashPassword } from '~~/server/utils/auth'

const changePasswordSchema = z.object({
  oldPassword: z.string(),
  newPassword: z.string().min(6, '新密码至少需要6位'),
  confirmPassword: z.string(),
})
  .refine(data => data.newPassword === data.confirmPassword, {
    message: '两次输入的新密码不一致',
    path: ['confirmPassword'],
  })
  // 链式调用 refine 来检查密码强度
  .refine((data) => {
    const strength = zxcvbn(data.newPassword)
    // 要求密码强度分数至少为 3 (good)
    return strength.score >= 3
  }, {
    message: '新密码太弱，请使用更复杂的组合（如大小写字母、数字和符号）',
    path: ['newPassword'],
  })

export default defineEventHandler(async (event) => {
  const currentUser = getUserFromEvent(event)
  const { oldPassword, newPassword } = await readValidatedBody(event, body =>
    changePasswordSchema.parse(body))
  const db = useDb()
  const userInDb = await db.query.users.findFirst({
    where: eq(users.id, currentUser.id),
  })

  if (!userInDb)
    throw createError({ statusCode: 404, statusMessage: '用户不存在' })

  if (userInDb.password !== hashPassword(oldPassword)) {
    throw createError({
      statusCode: 400,
      statusMessage: '旧密码不正确',
    })
  }

  await db
    .update(users)
    .set({ password: hashPassword(newPassword) })
    .where(eq(users.id, currentUser.id))

  return { message: '密码更新成功！' }
})
