<!-- app/components/TypeFilter.vue -->
<script setup lang="ts">
import { AVAILABLE_COLORS, AVAILABLE_SIZES, useHistoryStore } from '~/stores/history'

const historyStore = useHistoryStore()

// --- State for the component's UI ---

// 控制是否进入“编辑样式”模式
const isEditMode = ref(false)
// 控制当前正在编辑哪个类型的样式，null 表示没有打开任何编辑器
const editingTypeId = ref<string | null>(null)

// --- Computed properties ---

// "全选" 复选框的逻辑 (保持不变)
const isAllSelected = computed({
  get() {
    return historyStore.availableTypes.length > 0
      && historyStore.selectedTypes.length === historyStore.availableTypes.length
  },
  set(value: boolean) {
    if (value)
      historyStore.selectedTypes = [...historyStore.availableTypes]
    else
      historyStore.selectedTypes = []
  },
})

// --- Methods ---

// 切换整体的编辑模式
function toggleEditMode() {
  isEditMode.value = !isEditMode.value
  // 退出编辑模式时，关闭所有打开的样式编辑器
  if (!isEditMode.value)
    editingTypeId.value = null
}

// 打开或关闭特定类型的样式编辑器
function toggleTypeEditor(type: string) {
  if (editingTypeId.value === type)
    editingTypeId.value = null // 如果当前已打开，则关闭
  else
    editingTypeId.value = type // 否则，打开指定的这个
}
</script>

<template>
  <div v-if="historyStore.availableTypes.length > 0" class="flex flex-col gap-2">
    <!-- 顶部标题和编辑按钮 -->
    <div class="flex items-center justify-between">
      <p class="text-prose-muted font-bold">
        按类型筛选
      </p>
      <button
        class="text-sm text-brand-primary font-semibold focus:outline-none hover:underline"
        @click="toggleEditMode"
      >
        {{ isEditMode ? '完成编辑' : '编辑图层样式' }}
      </button>
    </div>

    <div class="pr-2 max-h-64 overflow-y-auto space-y-1">
      <!-- 全选/全不选 -->
      <div class="flex gap-2 items-center">
        <input
          id="type-select-all"
          v-model="isAllSelected"
          type="checkbox"
          class="text-brand-primary border-border-base rounded h-4 w-4 focus:ring-brand-primary"
        >
        <label for="type-select-all" class="font-semibold">全选</label>
      </div>

      <hr class="border-border-base/70">

      <!-- 循环渲染每个类型 -->
      <div
        v-for="type in historyStore.availableTypes"
        :key="type"
        class="py-1"
      >
        <div class="flex gap-2 items-center">
          <!-- 复选框 -->
          <input
            :id="`type-${type}`"
            v-model="historyStore.selectedTypes"
            :value="type"
            type="checkbox"
            class="text-brand-primary border-border-base rounded h-4 w-4 focus:ring-brand-primary"
          >
          <!-- 类型名称 -->
          <label :for="`type-${type}`" class="flex-1">{{ type }}</label>
          <!-- 编辑图标按钮 (仅在编辑模式下显示) -->
          <button
            v-if="isEditMode"
            class="text-lg icon-btn"
            :class="{ '!text-brand-primary': editingTypeId === type }"
            title="编辑样式"
            @click="toggleTypeEditor(type)"
          >
            <div i-carbon-edit />
          </button>
        </div>

        <!-- 样式编辑器面板 (可折叠) -->
        <Transition name="slide-down">
          <div
            v-if="editingTypeId === type"
            class="ml-6 mt-2 p-3 border border-border-base rounded-md bg-surface-muted space-y-3"
          >
            <div class="gap-x-4 gap-y-2 grid grid-cols-[auto,1fr] items-center">
              <!-- 颜色选择 -->
              <label class="text-sm font-medium">颜色</label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="color in AVAILABLE_COLORS"
                  :key="color"
                  class="rounded-full h-5 w-5 transition-transform hover:scale-110"
                  :style="{ backgroundColor: color }"
                  :class="{ 'ring-2 ring-brand-primary ring-offset-2 ring-offset-surface-muted': historyStore.typeStyles[type]?.color === color }"
                  @click="historyStore.typeStyles[type]!.color = color"
                />
              </div>

              <!-- 大小选择 -->
              <label class="text-sm font-medium">大小</label>
              <div class="flex gap-2">
                <button
                  v-for="size in AVAILABLE_SIZES"
                  :key="size"
                  class="text-sm px-2.5 py-0.5 rounded-md bg-surface-base transition hover:bg-surface-base/80"
                  :class="{ '!bg-brand-primary !text-white shadow-md': historyStore.typeStyles[type]?.size === size }"
                  @click="historyStore.typeStyles[type]!.size = size"
                >
                  {{ size }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 滚动条样式 (不变) */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}
.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
}
.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: var(--color-border-base);
  border-radius: 10px;
}

/* 折叠动画 */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease-out;
  overflow: hidden;
}
.slide-down-enter-from,
.slide-down-leave-to {
  transform: translateY(-10px);
  opacity: 0;
  max-height: 0;
}
.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  max-height: 100px; /* 足够容纳编辑器的高度 */
}
</style>
