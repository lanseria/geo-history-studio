<!-- eslint-disable no-alert -->
<script setup lang="ts">
definePageMeta({
  layout: 'admin',
})

useHead({
  title: '用户管理 - 后台',
})

const dayjs = useDayjs()

// --- State ---
const page = ref(1)
const limit = ref(10)
const isAddUserModalOpen = ref(false)

// --- API Data Fetching ---
const { data: usersData, pending, error, refresh } = await useAsyncData(
  'admin-users',
  () => $fetch('/api/admin/users', { params: { page: page.value, limit: limit.value } }),
  { watch: [page, limit] },
)

// --- Methods ---

// 使用 Day.js 格式化日期
function formatDate(dateString: string) {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

function changePage(newPage: number) {
  if (newPage > 0 && newPage <= (usersData.value?.meta.totalPages ?? 1))
    page.value = newPage
}

async function handleAddUserSuccess() {
  isAddUserModalOpen.value = false
  // 操作成功后刷新数据
  await refresh()
}

// 锁定/解锁用户
async function toggleLock(userId: number) {
  try {
    await $fetch(`/api/admin/users/${userId}`, { method: 'PATCH' })
    await refresh()
  }
  catch (err: any) {
    alert(`操作失败: ${err.data?.statusMessage || '未知错误'}`)
  }
}

// 删除用户
async function deleteUser(userId: number, username: string) {
  if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复。`))
    return

  try {
    await $fetch(`/api/admin/users/${userId}`, { method: 'DELETE' })
    // 如果删除的是最后一页的唯一一个用户，需要返回上一页
    if (usersData.value?.data.length === 1 && page.value > 1)
      page.value--
    else
      await refresh()
  }
  catch (err: any) {
    alert(`删除失败: ${err.data?.statusMessage || '未知错误'}`)
  }
}
</script>

<template>
  <div>
    <div class="mb-4 flex items-center justify-between">
      <h2 class="text-2xl font-bold">
        用户列表
      </h2>
      <!-- 新增用户按钮 -->
      <button class="btn flex items-center" @click="isAddUserModalOpen = true">
        <div i-carbon-add class="mr-1" />
        新增用户
      </button>
    </div>

    <!-- 加载与错误状态处理 -->
    <div v-if="pending" class="p-8 text-center">
      正在加载...
    </div>
    <div v-else-if="error" class="text-red-500 p-8">
      加载失败: {{ error.message }}
    </div>
    <div v-else-if="usersData" class="card p-0 shadow-lg overflow-hidden">
      <!-- Table -->
      <div class="overflow-x-auto">
        <table class="text-left w-full">
          <thead class="bg-surface-muted">
            <tr>
              <th class="p-4">
                用户
              </th>
              <th class="p-4">
                角色
              </th>
              <th class="p-4">
                状态
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
            <tr v-for="user in usersData.data" :key="user.id" class="border-b border-border-base last:border-b-0 hover:bg-surface-muted/50">
              <td class="p-4 flex gap-3 items-center">
                <img :src="user.avatar || '/assets/images/default-avatar.svg'" alt="avatar" class="rounded-full h-10 w-10 object-cover">
                <span>{{ user.username }}</span>
              </td>
              <td class="p-4">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="user.role === 'admin' ? 'bg-green-500/20 text-green-700 dark:text-green-300' : 'bg-blue-500/20 text-blue-700 dark:text-blue-300'"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="p-4">
                <span
                  class="text-xs px-2 py-1 rounded-full"
                  :class="user.isLocked ? 'bg-yellow-500/20 text-yellow-700 dark:text-yellow-300' : 'bg-teal-500/20 text-teal-700 dark:text-teal-300'"
                >
                  {{ user.isLocked ? '已锁定' : '正常' }}
                </span>
              </td>
              <td class="text-sm text-prose-muted p-4">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="p-4">
                <button
                  class="icon-btn"
                  :title="user.isLocked ? '解锁' : '锁定'"
                  @click="toggleLock(user.id)"
                >
                  <div :class="user.isLocked ? 'i-carbon-unlocked' : 'i-carbon-locked'" />
                </button>
                <button
                  class="icon-btn text-red-500 ml-2"
                  title="删除"
                  @click="deleteUser(user.id, user.username)"
                >
                  <div i-carbon-trash-can />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
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
    <!-- 新增用户模态框 -->
    <UserFormModal :is-open="isAddUserModalOpen" @close="isAddUserModalOpen = false" @success="handleAddUserSuccess" />
  </div>
</template>
