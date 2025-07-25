// server/database/schemas.ts
import { bigserial, boolean, integer, numeric, pgSchema, text, timestamp } from 'drizzle-orm/pg-core'

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
  /** 用户头像URL */
  avatar: text('avatar'),
  /** 账户是否被锁定 */
  isLocked: boolean('is_locked').notNull().default(false),
  /** 用户创建时间 */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

/**
 * 历史地名表 (placenames)
 * 存储历史地名信息
 */
export const placenames = geoHistoryStudioSchema.table('placenames', {
  /** 地名ID (主键, 自增) */
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  /** 中文名 (简体) */
  name: text('name').notNull(),
  /** 繁体名 */
  traditionalName: text('traditional_name'),
  /** 英文名 */
  englishName: text('english_name'),
  /** 坐标 (格式: [经度, 纬度]) */
  coordinates: numeric('coordinates', { precision: 9, scale: 6 }).array(2).notNull(),
  /** 存在年份范围 (格式: [开始年份, 结束年份]) */
  yearRange: integer('year_range').array(2).notNull(),
  /** 地名类型 (如: 首都, 州, 县等) */
  type: text('type').notNull(),
  /** 记录创建时间 */
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  /** 记录更新时间 */
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
