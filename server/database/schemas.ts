// server/database/schemas.ts
import { relations } from 'drizzle-orm'
import { bigint, bigserial, date, jsonb, numeric, pgEnum, pgSchema, primaryKey, real, text, timestamp, varchar } from 'drizzle-orm/pg-core'

// 使用 'fund_app' 作为 schema 名称
export const geoHistoryStudioSchema = pgSchema('geo_history_studio_app')
// 定义用户角色的枚举类型
export const userRoleEnum = geoHistoryStudioSchema.enum('user_role', ['admin', 'user'])
/**
 * 用户表 (users)
 * 存储应用的用户信息
 */
export const users = geoHistoryStudioSchema.table('users', {
  /** 用户ID (主键, 自增) */
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  /** 用户名 (唯一) */
  username: text('username').notNull().unique(),
  /** 用户密码 (经过哈希处理) */
  password: text('password').notNull(),
  /** 用户角色 ('admin' 或 'user') */
  role: userRoleEnum('role').notNull().default('user'),
  /** [新增] 用户头像URL */
  avatar: text('avatar'),
  /** 用户创建时间 */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})
