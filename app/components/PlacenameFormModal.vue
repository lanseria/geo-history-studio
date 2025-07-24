<script setup lang="ts">
import type { placenames } from '~~/server/database/schemas'

type PlacenameSchema = typeof placenames.$inferSelect
interface Placename extends Omit<PlacenameSchema, 'createdAt' | 'updatedAt'> {
  createdAt: string
  updatedAt: string
}

const props = defineProps<{
  isOpen: boolean
  placenameToEdit: Placename | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'success'): void
}>()

const isEditing = computed(() => !!props.placenameToEdit)

const formData = reactive({
  name: '',
  traditionalName: '',
  englishName: '',
  // 将数组拆分为独立字段以便于表单绑定
  lon: '',
  lat: '',
  yearStart: null as number | null,
  yearEnd: null as number | null,
  type: '',
})

const isLoading = ref(false)
const errorMessage = ref('')

// 当 placenameToEdit 变化时，填充表单
watch(() => props.placenameToEdit, (placename) => {
  if (placename) {
    formData.name = placename.name
    formData.traditionalName = placename.traditionalName || ''
    formData.englishName = placename.englishName || ''
    formData.lon = placename.coordinates[0]!
    formData.lat = placename.coordinates[1]!
    formData.yearStart = placename.yearRange[0]!
    formData.yearEnd = placename.yearRange[1]!
    formData.type = placename.type
  }
  else {
    // 重置表单
    Object.assign(formData, {
      name: '',
      traditionalName: '',
      englishName: '',
      lon: '',
      lat: '',
      yearStart: null,
      yearEnd: null,
      type: '',
    })
  }
}, { immediate: true })

async function handleSubmit() {
  isLoading.value = true
  errorMessage.value = ''

  // 组装成 API 需要的格式
  const payload = {
    name: formData.name,
    traditionalName: formData.traditionalName || null,
    englishName: formData.englishName || null,
    coordinates: [formData.lon, formData.lat] as [string, string],
    yearRange: [formData.yearStart, formData.yearEnd] as [number, number],
    type: formData.type,
  }

  try {
    if (isEditing.value) {
      // 编辑
      await $fetch(`/api/admin/placenames/${props.placenameToEdit!.id}`, {
        method: 'PUT',
        body: payload,
      })
    }
    else {
      // 新增
      await $fetch('/api/admin/placenames', {
        method: 'POST',
        body: payload,
      })
    }
    emit('success')
  }
  catch (err: any) {
    errorMessage.value = err.data?.statusMessage || (isEditing.value ? '更新失败' : '创建失败')
  }
  finally {
    isLoading.value = false
  }
}
</script>

<template>
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="p-4 bg-black/50 flex items-center inset-0 justify-center fixed z-40 overflow-y-auto"
      @click.self="emit('close')"
    >
      <div class="card p-6 max-w-lg w-full" @click.stop>
        <h3 class="text-xl font-bold mb-4">
          {{ isEditing ? '编辑地名' : '新增地名' }}
        </h3>
        <form class="space-y-4" @submit.prevent="handleSubmit">
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div class="space-y-1">
              <label>中文名</label>
              <input v-model="formData.name" type="text" class="input-base" required>
            </div>
            <div class="space-y-1">
              <label>类型</label>
              <input v-model="formData.type" type="text" class="input-base" required>
            </div>
          </div>
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div class="space-y-1">
              <label>繁体名</label>
              <input v-model="formData.traditionalName" type="text" class="input-base">
            </div>
            <div class="space-y-1">
              <label>英文名</label>
              <input v-model="formData.englishName" type="text" class="input-base">
            </div>
          </div>
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div class="space-y-1">
              <label>经度</label>
              <input v-model="formData.lon" type="text" class="input-base" placeholder="例如 116.39525" required>
            </div>
            <div class="space-y-1">
              <label>纬度</label>
              <input v-model="formData.lat" type="text" class="input-base" placeholder="例如 39.10154" required>
            </div>
          </div>
          <div class="gap-4 grid grid-cols-1 md:grid-cols-2">
            <div class="space-y-1">
              <label>开始年份</label>
              <input v-model.number="formData.yearStart" type="number" class="input-base" placeholder="例如 1820" required>
            </div>
            <div class="space-y-1">
              <label>结束年份</label>
              <input v-model.number="formData.yearEnd" type="number" class="input-base" placeholder="例如 1820" required>
            </div>
          </div>

          <div v-if="errorMessage" class="text-sm text-red-500">
            {{ errorMessage }}
          </div>

          <div class="pt-4 flex gap-4 justify-end">
            <button type="button" class="btn bg-gray-500 hover:bg-gray-600" @click="emit('close')">
              取消
            </button>
            <button type="submit" class="btn" :disabled="isLoading">
              <span v-if="!isLoading">{{ isEditing ? '保存' : '创建' }}</span>
              <span v-else>处理中...</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  </Transition>
</template>
