<!-- eslint-disable no-alert -->
<script setup lang="ts">
import type { placenames } from '~~/server/database/schemas'

// 后端原始类型
type PlacenameSchema = typeof placenames.$inferSelect

// 定义前端使用的类型，将 Date 转换为 string
interface Placename extends Omit<PlacenameSchema, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

definePageMeta({
  layout: 'admin',
})

useHead({
  title: '地名管理 - 后台',
})

const dayjs = useDayjs()

// --- State ---
const page = ref(1)
const limit = ref(10)
const isModalOpen = ref(false)
const placenameToEdit = ref<Placename | null>(null)

// --- API Data Fetching ---
const { data: placenamesData, pending, error, refresh } = await useAsyncData(
  'admin-placenames',
  () => $fetch('/api/admin/placenames', { params: { page: page.value, limit: limit.value } }),
  { watch: [page, limit] },
)

// --- Methods ---
function formatDate(dateString: string) {
  return dayjs(dateString).format('YYYY-MM-DD HH:mm')
}

function changePage(newPage: number) {
  if (newPage > 0 && newPage <= (placenamesData.value?.meta.totalPages ?? 1))
    page.value = newPage
}

function openAddModal() {
  placenameToEdit.value = null
  isModalOpen.value = true
}

function openEditModal(placename: Placename) {
  placenameToEdit.value = placename
  isModalOpen.value = true
}

async function handleSuccess() {
  isModalOpen.value = false
  await refresh()
}

async function deletePlacename(id: number, name: string) {
  if (!confirm(`确定要删除地名 "${name}" 吗？`))
    return

  try {
    await $fetch(`/api/admin/placenames/${id}`, { method: 'DELETE' })
    if (placenamesData.value?.data.length === 1 && page.value > 1)
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
        历史地名管理
      </h2>
      <button class="btn flex items-center" @click="openAddModal">
        <div i-carbon-add class="mr-1" />
        新增地名
      </button>
    </div>

    <div v-if="pending" class="p-8 text-center">
      正在加载...
    </div>
    <div v-else-if="error" class="text-red-500 p-8">
      加载失败: {{ error.message }}
    </div>
    <div v-else-if="placenamesData" class="card p-0 shadow-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="text-left w-full">
          <thead class="bg-surface-muted">
            <tr>
              <th class="p-4">
                中文名
              </th>
              <th class="p-4">
                类型
              </th>
              <th class="p-4">
                坐标
              </th>
              <th class="p-4">
                存在年份
              </th>
              <th class="p-4">
                更新时间
              </th>
              <th class="p-4">
                操作
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="p in placenamesData.data" :key="p.id" class="border-b border-border-base last:border-b-0 hover:bg-surface-muted/50">
              <td class="font-semibold p-4">
                {{ p.name }}
              </td>
              <td class="p-4">
                {{ p.type }}
              </td>
              <td class="text-sm text-prose-muted p-4">
                {{ p.coordinates.join(', ') }}
              </td>
              <td class="p-4">
                {{ p.yearRange[0] === p.yearRange[1] ? p.yearRange[0] : p.yearRange.join(' - ') }}
              </td>
              <td class="text-sm text-prose-muted p-4">
                {{ formatDate(p.updatedAt) }}
              </td>
              <td class="p-4">
                <button class="icon-btn" title="编辑" @click="openEditModal(p)">
                  <div i-carbon-edit />
                </button>
                <button class="icon-btn text-red-500 ml-2" title="删除" @click="deletePlacename(p.id, p.name)">
                  <div i-carbon-trash-can />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div v-if="placenamesData.meta.totalPages > 1" class="p-4 bg-surface-muted flex items-center justify-between">
        <p class="text-sm text-prose-muted">
          共 {{ placenamesData.meta.total }} 条记录, 第 {{ placenamesData.meta.page }} / {{ placenamesData.meta.totalPages }} 页
        </p>
        <div class="flex gap-2">
          <button class="btn" :disabled="page === 1" @click="changePage(page - 1)">
            上一页
          </button>
          <button class="btn" :disabled="page === placenamesData.meta.totalPages" @click="changePage(page + 1)">
            下一页
          </button>
        </div>
      </div>
    </div>

    <PlacenameFormModal
      :is-open="isModalOpen"
      :placename-to-edit="placenameToEdit"
      @close="isModalOpen = false"
      @success="handleSuccess"
    />
  </div>
</template>
