# GeoHistory Studio

一个基于 Nuxt 3, Vue 3, a nd Unocss 构建的全栈历史地理信息平台。

## 技术栈

- **框架**: [Nuxt 3](https://nuxt.com/)
- **UI 框架**: [Vue 3](https://vuejs.org/)
- **CSS 引擎**: [Unocss](https://unocss.dev/)
- **数据库**: PostgreSQL + [Drizzle ORM](https://orm.drizzle.team/)
- **认证**: PASETO Token + `httpOnly` Cookies
- **状态管理**: [Pinia](https://pinia.vuejs.org/)
- **代码规范**: [@antfu/eslint-config](https://github.com/antfu/eslint-config)

## 功能

- 安全的认证系统（登录、登出、Token 自动续期）
- 基于角色的访问控制（管理员/普通用户）
- 明/暗主题切换
- 容器化部署支持 (Dockerfile)
- 类型安全的全栈开发体验

## 快速开始

docker build -t vhiklanseria/geo-history-studio:latest .
docker push vhiklanseria/geo-history-studio:latest
