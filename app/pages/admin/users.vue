<script setup lang="ts">
import { useTimeAgo } from '@vueuse/core'

definePageMeta({
  layout: 'admin',
})

useHead({
  title: '用户管理 - 后台',
})

// 分页状态
const page = ref(1)
const limit = ref(10)

// API 数据获取
const { data: usersData, pending, error, refresh } = await useAsyncData(
  'admin-users',
  () => $fetch('/api/admin/users', {
    params: {
      page: page.value,
      limit: limit.value,
    },
  }),
  { watch: [page, limit] }, // 监听分页状态变化，自动重新获取数据
)

// 用于格式化时间
function formatTimeAgo(dateString: string) {
  return useTimeAgo(dateString, {
    messages: {
      justNow: '刚刚',
      past: n => (n.match(/\d/) ? `${n}前` : n),
      future: n => (n.match(/\d/) ? `在${n}后` : n),
      month: (n, past) => (n === 1 ? (past ? '上个月' : '下个月') : `${n}个月`),
      year: (n, past) => (n === 1 ? (past ? '去年' : '明年') : `${n}年`),
      day: (n, past) => (n === 1 ? (past ? '昨天' : '明天') : `${n}天`),
      week: (n, past) => (n === 1 ? (past ? '上周' : '下周') : `${n}周`),
      hour: n => `${n}小时`,
      minute: n => `${n}分钟`,
      second: n => `${n}秒`,
      invalid: '',
    },
  }).value
}

// 分页器方法
function changePage(newPage: number) {
  if (newPage > 0 && newPage <= (usersData.value?.meta.totalPages ?? 1))
    page.value = newPage
}
</script>

<template>
  <div>
    <h2 class="text-2xl font-bold mb-4">
      用户列表
    </h2>

    <!-- [可以放添加用户等按钮的地方] -->

    <div v-if="pending" class="p-8 text-center">
      正在加载...
    </div>
    <div v-else-if="error" class="text-red-500 p-8">
      加载失败: {{ error.message }}
    </div>
    <div v-else-if="usersData" class="card p-0 shadow-lg overflow-hidden">
      <!-- Table -->
      <table class="text-left w-full">
        <thead class="bg-surface-muted">
          <tr>
            <th class="p-4">
              头像
            </th>
            <th class="p-4">
              用户名
            </th>
            <th class="p-4">
              角色
            </th>
            <th class="p-4">
              注册时间
            </th>
            <th class="p-4">
              操作
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="user in usersData.data" :key="user.id" class="border-b border-border-base last:border-b-0">
            <td class="p-4">
              <img :src="user.avatar || '/assets/images/default-avatar.svg'" alt="avatar" class="rounded-full h-10 w-10 object-cover">
            </td>
            <td class="p-4">
              {{ user.username }}
            </td>
            <td class="p-4">
              <span
                class="text-xs px-2 py-1 rounded-full"
                :class="user.role === 'admin' ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'"
              >
                {{ user.role }}
              </span>
            </td>
            <td class="text-sm text-prose-muted p-4">
              {{ formatTimeAgo(user.createdAt!) }}
            </td>
            <td class="p-4">
              <button class="icon-btn" title="编辑">
                <div i-carbon-edit />
              </button>
              <button class="icon-btn text-red-500 ml-2" title="删除">
                <div i-carbon-trash-can />
              </button>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div v-if="usersData.meta.totalPages > 1" class="p-4 bg-surface-muted flex items-center justify-between">
        <p class="text-sm text-prose-muted">
          共 {{ usersData.meta.total }} 条记录, 第 {{ usersData.meta.page }} / {{ usersData.meta.totalPages }} 页
        </p>
        <div class="flex gap-2">
          <button class="btn" :disabled="page === 1" @click="changePage(page - 1)">
            上一页
          </button>
          <button class="btn" :disabled="page === usersData.meta.totalPages" @click="changePage(page + 1)">
            下一页
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
